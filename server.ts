/**
 * NFL / NBA × VoiceOS — a live sports companion as a self-contained MCP integration, native cards.
 *
 * Data source: ESPN's public JSON endpoints (site.api.espn.com) — keyless, no account, no login,
 * read-only public data. That makes this a true one-click integration: it works the moment it is
 * installed, nothing to connect. (API-Sports is a drop-in production adapter: swap the `espn*`
 * fetchers for API-Sports calls behind the same normalisers for higher rate limits / deeper history.)
 *
 * Native UI: every tool result carries a rendered notch card (cards.ts + widgetKit.ts, the kit
 * vendored verbatim from the shipped Slack/Zoom/Reddit integrations). The scoreboard is an in-card
 * mini-app: tap a game to open its detail (score-by-period, leaders, odds, win probability) without
 * leaving VoiceOS. The card rides INSIDE the JSON payload under `_voiceos_glance`; the model always
 * gets the facts even if the card drops. stdout is the MCP wire (JSON-RPC only); diagnostics → stderr.
 */

import {
  scoreboardCard,
  scheduleCard,
  teamHubCard,
  standingsCard,
  gameCard,
  playerCard,
  newsCard,
  errorCard,
  type GameLike,
  type SideLike,
  type LeaderLike,
  type StandingRowLike,
} from './cards.ts';
import { teamLogo } from './logos.ts';

/* ─────────────────────────── identity ─────────────────────────── */

const NAME = 'Sports';
const VERSION = '1.0.0';
const INTEGRATION_ID = 'com.rithvik.sports';

function log(line: string): void {
  process.stderr.write(`[sports] ${line}\n`);
}

/* ─────────────────────────── leagues ─────────────────────────── */

type Sport = 'football' | 'basketball' | 'baseball' | 'hockey' | 'soccer';
interface League {
  key: string;
  path: string; // ESPN sport/league path
  label: string;
  sport: Sport;
  regPeriods: number; // regulation periods: 4 quarters, 9 innings, 3 hockey periods, 2 halves
  periodWord: string; // live-status prefix: Q / P / H (baseball & soccer handled specially)
  inSeasonMonths: number[]; // ET months (1-12) the league is normally active — for off-season labeling + ambiguity
  startsLabel: string; // human phrase for when the season starts (used in the off-season note)
  aliases: string[]; // extra terms normLeague matches
}
// The order here is also the tie-break order when a team name resolves in more than one league.
const LEAGUES: Record<string, League> = {
  nfl: { key: 'nfl', path: 'football/nfl', label: 'NFL', sport: 'football', regPeriods: 4, periodWord: 'Q', inSeasonMonths: [9, 10, 11, 12, 1, 2], startsLabel: 'in September', aliases: ['nfl', 'football', 'pro football'] },
  nba: { key: 'nba', path: 'basketball/nba', label: 'NBA', sport: 'basketball', regPeriods: 4, periodWord: 'Q', inSeasonMonths: [10, 11, 12, 1, 2, 3, 4, 5, 6], startsLabel: 'in late October', aliases: ['nba', 'pro basketball'] },
  mlb: { key: 'mlb', path: 'baseball/mlb', label: 'MLB', sport: 'baseball', regPeriods: 9, periodWord: '', inSeasonMonths: [3, 4, 5, 6, 7, 8, 9, 10], startsLabel: 'in late March', aliases: ['mlb', 'baseball', 'major league baseball'] },
  nhl: { key: 'nhl', path: 'hockey/nhl', label: 'NHL', sport: 'hockey', regPeriods: 3, periodWord: 'P', inSeasonMonths: [10, 11, 12, 1, 2, 3, 4, 5, 6], startsLabel: 'in October', aliases: ['nhl', 'hockey'] },
  wnba: { key: 'wnba', path: 'basketball/wnba', label: 'WNBA', sport: 'basketball', regPeriods: 4, periodWord: 'Q', inSeasonMonths: [5, 6, 7, 8, 9, 10], startsLabel: 'in May', aliases: ['wnba', 'womens basketball', "women's basketball"] },
  cfb: { key: 'cfb', path: 'football/college-football', label: 'CFB', sport: 'football', regPeriods: 4, periodWord: 'Q', inSeasonMonths: [8, 9, 10, 11, 12, 1], startsLabel: 'in late August', aliases: ['cfb', 'college football', 'ncaaf', 'college fb', 'ncaa football'] },
  mcbb: { key: 'mcbb', path: 'basketball/mens-college-basketball', label: 'NCAAM', sport: 'basketball', regPeriods: 2, periodWord: 'H', inSeasonMonths: [11, 12, 1, 2, 3, 4], startsLabel: 'in November', aliases: ['ncaam', 'college basketball', 'cbb', 'march madness', 'ncaa basketball'] },
  epl: { key: 'epl', path: 'soccer/eng.1', label: 'EPL', sport: 'soccer', regPeriods: 2, periodWord: 'H', inSeasonMonths: [8, 9, 10, 11, 12, 1, 2, 3, 4, 5], startsLabel: 'in August', aliases: ['epl', 'premier league', 'soccer', 'english premier league', 'football club'] },
  ucl: { key: 'ucl', path: 'soccer/uefa.champions', label: 'UCL', sport: 'soccer', regPeriods: 2, periodWord: 'H', inSeasonMonths: [9, 10, 11, 12, 1, 2, 3, 4, 5], startsLabel: 'in September', aliases: ['ucl', 'champions league', 'uefa'] },
  mls: { key: 'mls', path: 'soccer/usa.1', label: 'MLS', sport: 'soccer', regPeriods: 2, periodWord: 'H', inSeasonMonths: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], startsLabel: 'in late February', aliases: ['mls', 'major league soccer'] },
};
const DEFAULT_LEAGUE = 'nfl';
const LEAGUE_KEYS = Object.keys(LEAGUES);

/** Current month in ET (1-12). */
function etMonth(): number {
  return Number(new Date().toLocaleString('en-US', { timeZone: 'America/New_York', month: 'numeric' }));
}
/** Is the league normally active right now? Used for off-season labeling + team-name disambiguation. */
function inSeasonNow(league: string): boolean {
  return LEAGUES[league]?.inSeasonMonths.includes(etMonth()) ?? true;
}
/** When a league is between seasons, a plain-English note (ESPN keeps serving last season's final
 * standings/records, so the intelligence is telling the user that's what they're looking at). */
function seasonNote(league: string): string | undefined {
  if (inSeasonNow(league)) return undefined;
  const lg = LEAGUES[league];
  return `Last season's final — the ${lg.label} season starts ${lg.startsLabel}.`;
}

/* ─────────────────────────── ESPN fetch ─────────────────────────── */

const SITE = 'https://site.api.espn.com/apis/site/v2/sports';
const CORE = 'https://site.api.espn.com/apis/v2/sports';
const WEB = 'https://site.web.api.espn.com/apis';

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';

import { execFile } from 'node:child_process';

/** ESPN's edge (site.api.espn.com) 403s some runtimes' fetch by TLS fingerprint (bun in particular);
 * node's fetch is fine. curl is allowed under every runtime — so we try fetch first (fast) and fall
 * back to curl, making the integration runtime-agnostic no matter what VoiceOS launches it with. */
function curlBuf(url: string, timeoutMs = 9000, cap = 24 * 1024 * 1024): Promise<Buffer | null> {
  // NOTE: curl with a *browser* UA gets 403 from ESPN's edge (looks like spoofing); curl's DEFAULT
  // UA is allowed. So the fallback deliberately does NOT set user-agent.
  return new Promise((resolve) => {
    execFile(
      'curl',
      ['-sS', '--compressed', '--max-time', String(Math.ceil(timeoutMs / 1000)), '-H', 'accept: application/json,image/*', url],
      { encoding: 'buffer', maxBuffer: cap, timeout: timeoutMs + 1000 },
      (err, stdout) => resolve(err ? null : (stdout as Buffer)),
    );
  });
}

async function getJson(url: string): Promise<any | null> {
  try {
    const res = await fetch(url, { headers: { accept: 'application/json', 'user-agent': UA, 'accept-language': 'en-US,en;q=0.9' } });
    if (res.ok) return await res.json();
    log(`fetch ${res.status} ${url.slice(0, 90)} — trying curl`);
  } catch (e) {
    log(`fetch error ${(e as Error).message} — trying curl`);
  }
  const buf = await curlBuf(url);
  if (!buf) return null;
  try {
    return JSON.parse(buf.toString('utf8'));
  } catch {
    log(`curl non-json ${url.slice(0, 90)}`);
    return null;
  }
}
async function fetchBytesDataUri(url: string, cap = 40000): Promise<string | undefined> {
  let buf: Buffer | undefined;
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA } });
    if (res.ok) buf = Buffer.from(await res.arrayBuffer());
  } catch {
    /* fall through to curl */
  }
  if (!buf) {
    const c = await curlBuf(url, 6000, cap * 4);
    if (c) buf = c;
  }
  if (!buf || buf.length > cap) return undefined;
  return `data:image/png;base64,${buf.toString('base64')}`;
}

/* ─────────────────────────── on-demand logos ─────────────────────────── */
/* The baked atlas (logos.ts) covers NFL/NBA instantly. For every other league — MLB, NHL, WNBA,
 * college (hundreds of teams), soccer — we inline the team's logo from its ESPN URL on demand,
 * shrunk through the combiner so it stays tiny and CSP-safe, cached per URL for the process life. */
const logoCache = new Map<string, string | undefined>();
async function inlineLogo(url?: string): Promise<string | undefined> {
  if (!url) return undefined;
  if (logoCache.has(url)) return logoCache.get(url);
  let u = url.replace(/^http:/, 'https:');
  if (/\.espncdn\.com/.test(u) && !/combiner/.test(u)) {
    try {
      u = `https://a.espncdn.com/combiner/i?img=${encodeURIComponent(new URL(u).pathname.replace('/scoreboard/', '/'))}&h=40&w=40&scale=crop&format=png`;
    } catch {
      /* keep original */
    }
  }
  const d = await fetchBytesDataUri(u, 24000);
  logoCache.set(url, d);
  return d;
}
/** Fill `.logo` (data URI) from `.logoUrl` for any object that has a URL but no atlas hit. */
async function hydrateLogos(objs: ({ logo?: string; logoUrl?: string } | undefined)[]): Promise<void> {
  const need = objs.filter((o): o is { logo?: string; logoUrl?: string } => !!o && !o.logo && !!o.logoUrl);
  await Promise.all(
    need.map(async (o) => {
      const d = await inlineLogo(o.logoUrl);
      if (d) o.logo = d;
    }),
  );
}
function gameSides(games: GameLike[]): (SideLike | undefined)[] {
  return games.flatMap((g) => [g.away, g.home]);
}

/* ─────────────────────────── arg coercion ─────────────────────────── */

function str(v: unknown): string | undefined {
  if (v === undefined || v === null) return undefined;
  const t = String(v).trim();
  return t || undefined;
}
function normLeague(v: unknown): string | undefined {
  const s = (str(v) ?? '').toLowerCase().trim();
  if (!s) return undefined;
  if (LEAGUES[s]) return s;
  // longest alias first so "college football" beats "football", "college basketball" beats "basketball"
  const matches: { key: string; len: number }[] = [];
  for (const key of LEAGUE_KEYS) {
    for (const a of LEAGUES[key].aliases) {
      if (s === a || s.includes(a)) matches.push({ key, len: a.length });
    }
  }
  matches.sort((a, b) => b.len - a.len);
  return matches[0]?.key;
}

/* ─────────────────────────── team resolver ─────────────────────────── */

interface TeamRef {
  id: string;
  abbr: string;
  display: string;
  short: string;
  nick: string;
  location: string;
}
const teamCacheByLeague = new Map<string, TeamRef[]>();

async function teamsOf(league: string): Promise<TeamRef[]> {
  const hit = teamCacheByLeague.get(league);
  if (hit) return hit;
  const lg = LEAGUES[league];
  const d = await getJson(`${SITE}/${lg.path}/teams`);
  const raw = d?.sports?.[0]?.leagues?.[0]?.teams ?? [];
  const list: TeamRef[] = raw.map((t: any) => {
    const team = t.team ?? {};
    return {
      id: String(team.id ?? ''),
      abbr: String(team.abbreviation ?? ''),
      display: String(team.displayName ?? ''),
      short: String(team.shortDisplayName ?? ''),
      nick: String(team.nickname ?? team.name ?? ''),
      location: String(team.location ?? ''),
    };
  });
  teamCacheByLeague.set(league, list);
  return list;
}

const NICK_ALIASES: Record<string, string> = {
  niners: '49ers',
  // no cross-league nick rewrites — exact nickname matching (league-scoped) disambiguates on its own
};

async function resolveTeam(league: string, query: string): Promise<TeamRef | null> {
  const teams = await teamsOf(league);
  let q = query.trim().toLowerCase();
  q = NICK_ALIASES[q] ?? q;
  if (!q) return null;
  // exact abbr
  const byAbbr = teams.find((t) => t.abbr.toLowerCase() === q);
  if (byAbbr) return byAbbr;
  // exact display/nick/location
  const exact = teams.find(
    (t) => t.display.toLowerCase() === q || t.nick.toLowerCase() === q || t.short.toLowerCase() === q || t.location.toLowerCase() === q,
  );
  if (exact) return exact;
  // contains (nickname first — most people say the nickname)
  const contains =
    teams.find((t) => t.nick.toLowerCase().includes(q) || q.includes(t.nick.toLowerCase())) ??
    teams.find((t) => t.display.toLowerCase().includes(q) || t.location.toLowerCase().includes(q));
  return contains ?? null;
}

/** Infer league from a team name when the caller didn't pass one. Ambiguous names (Cardinals =
 * NFL+MLB, Giants = NFL+MLB, Rangers = MLB+NHL, Panthers = NFL+NHL, Kings = NHL+NBA) resolve to the
 * league that's in season now; ties fall back to LEAGUE_KEYS order (NFL, NBA, MLB, ...). */
async function guessLeague(teamQuery: string | undefined, explicit: string | undefined): Promise<string> {
  if (explicit) return explicit;
  if (!teamQuery) return DEFAULT_LEAGUE;
  // resolve across all leagues in parallel (team lists cache after the first hit)
  const resolved = await Promise.all(LEAGUE_KEYS.map((key) => resolveTeam(key, teamQuery).then((t) => (t ? key : null))));
  const hits = resolved.filter((k): k is string => !!k);
  if (!hits.length) return DEFAULT_LEAGUE;
  if (hits.length === 1) return hits[0];
  // prefer an in-season league among the matches; else first by LEAGUE_KEYS order
  const inSeason = hits.filter(inSeasonNow);
  return (inSeason[0] ?? hits[0]);
}

/* ─────────────────────────── date / status formatting ─────────────────────────── */

function fmtWhen(iso: string | undefined): { when?: string; dateShort?: string } {
  if (!iso) return {};
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return {};
  try {
    const when = dt.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' }) + ' ET';
    const dateShort = dt.toLocaleDateString('en-US', { timeZone: 'America/New_York', weekday: 'short', month: 'short', day: 'numeric' });
    return { when, dateShort };
  } catch {
    return { when: iso.slice(11, 16), dateShort: iso.slice(0, 10) };
  }
}
function todayYyyymmdd(): string {
  const dt = new Date();
  const y = dt.toLocaleString('en-US', { timeZone: 'America/New_York', year: 'numeric' });
  const m = dt.toLocaleString('en-US', { timeZone: 'America/New_York', month: '2-digit' });
  const d = dt.toLocaleString('en-US', { timeZone: 'America/New_York', day: '2-digit' });
  return `${y}${m}${d}`;
}
function liveShort(status: any, league: string): string {
  const t = status?.type ?? {};
  const sd = String(t.shortDetail ?? t.detail ?? '');
  const lg = LEAGUES[league];
  const sport = lg?.sport;
  if (/halftime/i.test(sd)) return 'Half';
  if (/delay/i.test(sd)) return 'Delay';
  // baseball ("Top 7th") and soccer ("63'") — ESPN's own short detail reads best
  if (sport === 'baseball' || sport === 'soccer') return sd.slice(0, 14) || 'Live';
  if (/end/i.test(sd)) return sd.slice(0, 12);
  const clock = status?.displayClock;
  const period = status?.period;
  if (period) {
    const reg = lg?.regPeriods ?? 4;
    const pw = lg?.periodWord || 'Q';
    const label = period <= reg ? `${pw}${period}` : `OT${period - reg > 1 ? period - reg : ''}`;
    return clock ? `${label} ${clock}` : label;
  }
  return sd.slice(0, 12) || 'Live';
}

/* ─────────────────────────── normalisers ─────────────────────────── */

function sideFrom(comp: any, league: string, state: string): SideLike {
  const team = comp?.team ?? {};
  const abbr = String(team.abbreviation ?? '');
  // scoreboard returns score as a string ("25"); the schedule endpoint returns {value, displayValue}
  const rawScore = comp?.score;
  const scoreN = rawScore && typeof rawScore === 'object' ? Number(rawScore.value ?? rawScore.displayValue) : Number(rawScore);
  const ls = Array.isArray(comp?.linescores) ? comp.linescores.map((l: any) => Number(l?.value)).filter((n: number) => Number.isFinite(n)) : [];
  const logoUrl = str2(team?.logo) ?? str2(team?.logos?.[0]?.href);
  return {
    abbr,
    name: String(team.shortDisplayName ?? team.name ?? team.displayName ?? abbr),
    score: state !== 'pre' && Number.isFinite(scoreN) ? scoreN : undefined,
    record: comp?.records?.[0]?.summary ? String(comp.records[0].summary) : undefined,
    logo: teamLogo(league, abbr), // atlas fast-path (NFL/NBA); undefined elsewhere → hydrated from logoUrl
    logoUrl,
    winner: typeof comp?.winner === 'boolean' ? comp.winner : undefined,
    linescores: ls,
  };
}
function str2(v: unknown): string | undefined {
  const s = typeof v === 'string' ? v.trim() : '';
  return s || undefined;
}

function periodLabels(g: GameLike): string[] {
  const a = g.away?.linescores?.length ?? 0;
  const h = g.home?.linescores?.length ?? 0;
  const n = Math.max(a, h);
  if (!n) return [];
  const lg = LEAGUES[g.league ?? ''];
  const reg = lg?.regPeriods ?? 4;
  const sport = lg?.sport;
  if (sport === 'baseball') return Array.from({ length: n }, (_, i) => String(i + 1)); // innings (extras just keep counting)
  return Array.from({ length: n }, (_, i) =>
    i < reg ? String(i + 1) : sport === 'soccer' ? 'ET' : n - reg === 1 ? 'OT' : `OT${i - reg + 1}`,
  );
}

function gameFrom(event: any, league: string): GameLike {
  const comp = event?.competitions?.[0] ?? {};
  const status = event?.status ?? comp?.status ?? {};
  const state = String(status?.type?.state ?? 'pre');
  const competitors = Array.isArray(comp?.competitors) ? comp.competitors : [];
  const homeC = competitors.find((c: any) => c?.homeAway === 'home') ?? competitors[0];
  const awayC = competitors.find((c: any) => c?.homeAway === 'away') ?? competitors[1];
  const home = homeC ? sideFrom(homeC, league, state) : undefined;
  const away = awayC ? sideFrom(awayC, league, state) : undefined;

  // possession (live)
  const possId = comp?.situation?.possession;
  if (possId && state === 'in') {
    if (homeC?.id && String(homeC.id) === String(possId) && home) home.possession = true;
    if (awayC?.id && String(awayC.id) === String(possId) && away) away.possession = true;
  }

  const t = status?.type ?? {};
  const { when, dateShort } = fmtWhen(event?.date);
  const odds = comp?.odds?.[0];
  const g: GameLike = {
    id: String(event?.id ?? comp?.id ?? ''),
    league,
    state,
    statusDetail: String(t.detail ?? t.shortDetail ?? ''),
    statusShort: state === 'in' ? liveShort(status, league) : String(t.shortDetail ?? t.detail ?? (state === 'post' ? 'Final' : '')),
    home,
    away,
    when,
    dateShort,
    venue: comp?.venue?.fullName ? String(comp.venue.fullName) : undefined,
    broadcast: Array.isArray(comp?.broadcasts) && comp.broadcasts[0]?.names?.length ? comp.broadcasts[0].names.join('/') : undefined,
    odds: odds?.details ? String(odds.details) : undefined,
    overUnder: odds?.overUnder !== undefined ? String(odds.overUnder) : undefined,
    url: event?.links?.find?.((l: any) => l?.href)?.href ? String(event.links.find((l: any) => l.href).href) : undefined,
    dateISO: event?.date ? String(event.date) : undefined,
    seasonType: event?.seasonType?.name ? String(event.seasonType.name) : comp?.type?.text ? String(comp.type.text) : undefined,
  };
  g.periodLabels = periodLabels(g);
  return g;
}

/** Merge a team's schedule across season types (default view = current, +regular +post), so the
 * real upcoming games appear — ESPN's default `schedule` returns only the current phase (preseason
 * right now), which is why "next game" showed old finals. Deduped by id, sorted by date. */
async function fetchTeamSchedule(league: string, teamId: string): Promise<GameLike[]> {
  const lg = LEAGUES[league];
  const y = Number(new Date().toLocaleString('en-US', { timeZone: 'America/New_York', year: 'numeric' }));
  const urls = [
    `${SITE}/${lg.path}/teams/${teamId}/schedule`,
    `${SITE}/${lg.path}/teams/${teamId}/schedule?season=${y}&seasontype=2`,
    `${SITE}/${lg.path}/teams/${teamId}/schedule?season=${y}&seasontype=3`,
    `${SITE}/${lg.path}/teams/${teamId}/schedule?season=${y + 1}&seasontype=2`, // NBA season straddles years
  ];
  const seen = new Map<string, GameLike>();
  for (const u of urls) {
    const d = await getJson(u);
    for (const e of d?.events ?? []) {
      const g = gameFrom(e, league);
      if (g.id && !seen.has(g.id)) seen.set(g.id, g);
    }
  }
  return [...seen.values()].sort((a, b) => (Date.parse(a.dateISO ?? '') || 0) - (Date.parse(b.dateISO ?? '') || 0));
}

const LEADER_CATS: Record<Sport, Record<string, string>> = {
  football: { passingYards: 'PASS', rushingYards: 'RUSH', receivingYards: 'REC' },
  basketball: { points: 'PTS', rebounds: 'REB', assists: 'AST', pointsPerGame: 'PPG', reboundsPerGame: 'RPG', assistsPerGame: 'APG' },
  baseball: { hits: 'HITS', homeRuns: 'HR', RBIs: 'RBI', battingAverage: 'AVG', strikeouts: 'K', wins: 'W', ERA: 'ERA' },
  hockey: { points: 'PTS', goals: 'G', assists: 'A', saves: 'SV', goalsAgainst: 'GA' },
  soccer: { goals: 'G', assists: 'A', shots: 'SH', saves: 'SV' },
};
const LEADER_ORDER: Record<Sport, string[]> = {
  football: ['PASS', 'RUSH', 'REC'],
  basketball: ['PTS', 'REB', 'AST', 'PPG', 'RPG', 'APG'],
  baseball: ['HITS', 'HR', 'RBI', 'K', 'W', 'ERA', 'AVG'],
  hockey: ['PTS', 'G', 'A', 'SV'],
  soccer: ['G', 'A', 'SH', 'SV'],
};

function leadersFrom(comp: any, league: string): LeaderLike[] {
  const sport = LEAGUES[league]?.sport ?? 'football';
  const catMap = LEADER_CATS[sport] ?? {};
  const out: LeaderLike[] = [];
  const competitors = Array.isArray(comp?.competitors) ? comp.competitors : [];
  for (const c of competitors) {
    const teamAbbr = String(c?.team?.abbreviation ?? '');
    for (const grp of c?.leaders ?? []) {
      // known category, else fall back to the group's own label so any sport surfaces something
      const cat = catMap[grp?.name] ?? String(grp?.abbreviation ?? grp?.shortDisplayName ?? grp?.displayName ?? grp?.name ?? '').toUpperCase().slice(0, 6);
      if (!cat) continue;
      const top = grp?.leaders?.[0];
      const ath = top?.athlete ?? {};
      if (!ath?.shortName && !ath?.displayName) continue;
      out.push({ cat, name: String(ath.shortName ?? ath.displayName), team: teamAbbr, value: String(top?.displayValue ?? '') });
    }
  }
  const order = LEADER_ORDER[sport] ?? [];
  const seen = new Set<string>();
  const ranked: LeaderLike[] = [];
  for (const cat of order) {
    const found = out.find((l) => l.cat === cat && !seen.has(cat));
    if (found) {
      seen.add(cat);
      ranked.push(found);
    }
  }
  // fill any remaining unique categories (covers sports not in the order maps)
  for (const l of out) {
    if (ranked.length >= 6) break;
    if (l.cat && !seen.has(l.cat)) {
      seen.add(l.cat);
      ranked.push(l);
    }
  }
  return ranked;
}

function statValStd(stats: any[], names: string[]): string | undefined {
  for (const n of names) {
    const s = stats?.find((x: any) => x?.name === n || x?.type === n || x?.abbreviation === n);
    if (s) return String(s.displayValue ?? s.value ?? '');
  }
  return undefined;
}
function mapEntries(entries: any[], league: string): StandingRowLike[] {
  const rows = entries.map((e: any) => {
    const team = e?.team ?? {};
    const abbr = String(team.abbreviation ?? '');
    const stats = e?.stats ?? [];
    const wins = Number(statValStd(stats, ['wins']) ?? NaN);
    const losses = Number(statValStd(stats, ['losses']) ?? NaN);
    const pct = statValStd(stats, ['winPercent', 'winpercent']);
    const pctNum = Number(pct);
    return {
      abbr,
      name: String(team.shortDisplayName ?? team.displayName ?? abbr),
      logo: teamLogo(league, abbr),
      logoUrl: str2(team?.logos?.[0]?.href) ?? str2(team?.logo),
      wins: Number.isFinite(wins) ? wins : undefined,
      losses: Number.isFinite(losses) ? losses : undefined,
      pct,
      extra: String(statValStd(stats, ['streak']) ?? statValStd(stats, ['gamesBehind']) ?? '').slice(0, 6),
      _sort: Number.isFinite(pctNum) ? pctNum : Number.isFinite(wins) ? wins / Math.max(1, wins + losses) : 0,
    } as StandingRowLike & { _sort: number };
  });
  return (rows as (StandingRowLike & { _sort: number })[]).sort((a, b) => b._sort - a._sort).map((r, i) => ({ ...r, rank: i + 1 }));
}
/** The smallest standings bucket (division, else conference) that contains the given team. */
async function teamDivisionStandings(league: string, teamAbbr: string): Promise<{ title: string; rows: StandingRowLike[] }> {
  const lg = LEAGUES[league];
  const d = await getJson(`${CORE}/${lg.path}/standings?level=3`); // level=3 exposes divisions
  const buckets: { name: string; entries: any[] }[] = [];
  const walk = (n: any) => {
    if (!n) return;
    const e = n?.standings?.entries ?? [];
    if (e.length) buckets.push({ name: String(n?.name ?? n?.displayName ?? ''), entries: e });
    for (const c of n?.children ?? []) walk(c);
  };
  for (const c of d?.children ?? []) walk(c);
  if (d?.standings?.entries) buckets.push({ name: String(d?.name ?? lg.label), entries: d.standings.entries });
  // prefer the SMALLEST bucket containing the team (division over conference)
  const containing = buckets
    .filter((b) => b.entries.some((e: any) => e?.team?.abbreviation === teamAbbr))
    .sort((a, b) => a.entries.length - b.entries.length);
  const pick = containing[0] ?? buckets[0];
  if (!pick) return { title: `${lg.label} standings`, rows: [] };
  return { title: pick.name || `${lg.label} standings`, rows: mapEntries(pick.entries, league) };
}
/** Notable roster players (skill positions first), for the hub PLAYERS tab. */
async function topRoster(league: string, teamId: string): Promise<{ name?: string; pos?: string; jersey?: string; url?: string }[]> {
  const lg = LEAGUES[league];
  const d = await getJson(`${SITE}/${lg.path}/teams/${teamId}/roster`);
  const groups = d?.athletes ?? [];
  const items: any[] = [];
  for (const g of groups) {
    if (Array.isArray(g?.items)) items.push(...g.items);
    else if (g?.id) items.push(g);
  }
  const pref = league === 'nba' ? ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F'] : ['QB', 'RB', 'WR', 'TE'];
  const active = items.filter((p) => p?.displayName && String(p?.status?.type ?? 'active') !== 'inactive');
  // take up to 2 per preferred position (in order) for variety, then fill with the rest
  const perPos: Record<string, number> = {};
  const picked: any[] = [];
  for (const pos of pref) {
    for (const p of active) {
      if (String(p?.position?.abbreviation ?? '') !== pos) continue;
      perPos[pos] = (perPos[pos] ?? 0) + 1;
      if (perPos[pos] <= 2) picked.push(p);
    }
  }
  for (const p of active) {
    if (picked.length >= 10) break;
    if (!picked.includes(p)) picked.push(p);
  }
  return picked
    .slice(0, 10)
    .map((p) => ({
      name: String(p.displayName),
      pos: p?.position?.abbreviation ? String(p.position.abbreviation) : undefined,
      jersey: p?.jersey ? String(p.jersey) : undefined,
      url: p?.links?.find?.((l: any) => /^https:/.test(l?.href ?? ''))?.href ? String(p.links.find((l: any) => /^https:/.test(l.href)).href) : undefined,
    }));
}

function scoreLine(g: GameLike): string {
  const a = g.away, h = g.home;
  const av = a?.abbr ?? 'Away', hv = h?.abbr ?? 'Home';
  if (g.state === 'pre') return `${av} at ${hv}, ${[g.dateShort, g.when].filter(Boolean).join(' ')}`;
  return `${av} ${a?.score ?? 0}, ${hv} ${h?.score ?? 0} — ${g.statusShort}`;
}

/* ─────────────────────────── tool-result shape ─────────────────────────── */

interface ToolResult {
  speak: string;
  facts?: Record<string, unknown>;
  card?: string;
}
interface ToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  run: (args: Record<string, unknown>) => Promise<ToolResult>;
}

/* ─────────────────────────── tools ─────────────────────────── */

const leagueProp = {
  type: 'string',
  enum: LEAGUE_KEYS,
  description:
    'Which league: nfl, nba, mlb, nhl, wnba, cfb (college football), mcbb (men\'s college basketball), epl / ucl / mls (soccer). If the user named a team, omit this and it is inferred (ambiguous names like Cardinals/Giants/Rangers resolve to whichever league is in season).',
};

/** The rich Google-style team hub (GAMES / STANDINGS / PLAYERS). Shared by sports_team and a
 * team-scoped sports_schedule so "next game" / "schedule" / "how are they doing" all get it. */
async function buildTeamHub(league: string, t: TeamRef): Promise<ToolResult> {
  const lg = LEAGUES[league];
  const [d, sched, div, players] = await Promise.all([
    getJson(`${SITE}/${lg.path}/teams/${t.id}`),
    fetchTeamSchedule(league, t.id),
    teamDivisionStandings(league, t.abbr),
    topRoster(league, t.id),
  ]);
  const team_ = d?.team ?? {};
  const record = team_?.record?.items?.[0]?.summary ? String(team_.record.items[0].summary) : undefined;
  const standingSummary = team_?.standingSummary ? String(team_.standingSummary) : undefined;
  const color = team_?.color ? String(team_.color) : undefined;
  const upcoming = sched.filter((g) => g.state !== 'post');
  const recent = sched.filter((g) => g.state === 'post').reverse();
  const next = upcoming[0];
  const lastDone = recent[0];
  // inline every logo used in the hub (atlas covers NFL/NBA; others fetched on demand)
  const hubLogo = teamLogo(league, t.abbr) ?? (await inlineLogo(str2(team_?.logos?.[0]?.href) ?? str2(team_?.logo)));
  await hydrateLogos([...gameSides(upcoming.slice(0, 5)), ...gameSides(recent.slice(0, 4)), ...div.rows]);
  return {
    speak: `${t.display}${record ? ` are ${record}` : ''}${standingSummary ? `, ${standingSummary}` : ''}.${next ? ` Next: ${scoreLine(next)}.` : ''}`,
    facts: {
      league,
      team: t.display,
      record,
      standing: standingSummary,
      next: next ? scoreLine(next) : undefined,
      last: lastDone ? scoreLine(lastDone) : undefined,
      upcoming: upcoming.slice(0, 5).map((g) => `${g.away?.abbr} @ ${g.home?.abbr} · ${[g.dateShort, g.when].filter(Boolean).join(' ')}`),
    },
    card: teamHubCard({
      hub: {
        league,
        name: team_?.displayName ? String(team_.displayName) : t.display,
        logo: hubLogo,
        color,
        record,
        standing: standingSummary,
        teamAbbr: t.abbr,
        upcoming: upcoming.slice(0, 5),
        recent: recent.slice(0, 4),
        standings: div.rows,
        standingsTitle: div.title,
        players,
        url: team_?.links?.find?.((l: any) => l?.href)?.href ? String(team_.links.find((l: any) => l.href).href) : undefined,
      },
    }),
  };
}

const TOOLS: ToolDef[] = [
  {
    name: 'sports_scores',
    description:
      'Live and recent scores as a native scoreboard for ANY league — NFL, NBA, MLB, NHL, WNBA, college football (cfb), college basketball (mcbb), soccer (epl/ucl/mls). Use for "what games are on", "scores", "who\'s winning", "did the Lakers win", "MLB scores today". Shows every game with live score, period/clock/inning, or start time; tap any game for the box score, leaders, odds and win probability without leaving VoiceOS. Knows when a league is off-season. Read-only. Pass a team to jump to that team\'s game.',
    inputSchema: {
      type: 'object',
      properties: {
        league: leagueProp,
        team: { type: 'string', description: 'Optional team to focus on, e.g. "49ers", "Lakers".' },
        date: { type: 'string', description: 'Optional day as YYYY-MM-DD or YYYYMMDD (e.g. yesterday). Default: today / current week.' },
      },
      additionalProperties: false,
    },
    async run(args) {
      const team = str(args['team']);
      const league = await guessLeague(team, normLeague(args['league']));
      const lg = LEAGUES[league];
      let dateParam = '';
      const date = str(args['date']);
      if (date) dateParam = `?dates=${date.replace(/-/g, '')}`;
      const d = await getJson(`${SITE}/${lg.path}/scoreboard${dateParam}`);
      let events: any[] = Array.isArray(d?.events) ? d.events : [];
      const note = seasonNote(league);
      if (!events.length) {
        const off = !inSeasonNow(league);
        const hint = off ? `The ${lg.label} season is between games — it starts ${lg.startsLabel}.` : 'No games on the schedule for that day.';
        return { speak: off ? hint : `No ${lg.label} games ${date ? 'for that day' : 'right now'}.`, facts: { league, count: 0, offSeason: off }, card: scoreboardCard({ league, title: `${lg.label} scores`, games: [], emptyHint: hint }) };
      }
      let games = events.map((e) => gameFrom(e, league));
      await hydrateLogos(gameSides(games));
      // focus a team if asked → put it first
      if (team) {
        const t = await resolveTeam(league, team);
        if (t) {
          const idx = games.findIndex((g) => g.home?.abbr === t.abbr || g.away?.abbr === t.abbr);
          if (idx > 0) games = [games[idx], ...games.slice(0, idx), ...games.slice(idx + 1)];
        }
      }
      const live = games.filter((g) => g.state === 'in').length;
      const finals = games.filter((g) => g.state === 'post').length;
      const trailing = live ? `${live} live` : finals ? `${finals} final` : `${games.length} scheduled`;
      const top = games.slice(0, 3).map(scoreLine).join('; ');
      // leaders per game (from scoreboard payload if present)
      const leadersByGame: Record<string, LeaderLike[]> = {};
      for (let i = 0; i < Math.min(events.length, 12); i++) {
        const comp = events[i]?.competitions?.[0];
        const ld = leadersFrom(comp, league);
        if (ld.length) leadersByGame[String(events[i]?.id ?? '')] = ld;
      }
      return {
        speak: `${lg.label}: ${top}${games.length > 3 ? `, and ${games.length - 3} more` : ''}.`,
        facts: { league, count: games.length, live, finals, games: games.map((g) => ({ id: g.id, matchup: `${g.away?.abbr} @ ${g.home?.abbr}`, state: g.state, status: g.statusShort, away: { abbr: g.away?.abbr, score: g.away?.score }, home: { abbr: g.home?.abbr, score: g.home?.score }, when: g.when, dateShort: g.dateShort })) },
        card: scoreboardCard({ league, title: `${lg.label} scores`, trailing, games, leadersByGame, note }),
      };
    },
  },
  {
    name: 'sports_game',
    description:
      'Full detail for ONE game — final or in-progress box score: score by quarter, game leaders (passing/rushing/receiving for NFL; points/rebounds/assists for NBA), betting line, and live win probability. Use for "how did the X game go", "box score", "who led the game", "what\'s the score of the Lakers game". Give a team (the tool finds their most relevant game) or a game id from sports_scores. Read-only.',
    inputSchema: {
      type: 'object',
      properties: {
        league: leagueProp,
        team: { type: 'string', description: 'A team in the game, e.g. "Chiefs".' },
        game_id: { type: 'string', description: 'ESPN event id from a sports_scores result (optional; use instead of team).' },
      },
      additionalProperties: false,
    },
    async run(args) {
      const team = str(args['team']);
      const gameId = str(args['game_id']);
      const league = await guessLeague(team, normLeague(args['league']));
      const lg = LEAGUES[league];
      let eventId = gameId;
      if (!eventId && team) {
        // pick the most relevant game: a live/finished game on today's board wins; otherwise
        // prefer the most recent COMPLETED game (past-tense "how did the game go" — ESPN's board
        // shows the upcoming game mid-week, which has no box score yet), then fall back to upcoming.
        const t = await resolveTeam(league, team);
        const sb = await getJson(`${SITE}/${lg.path}/scoreboard`);
        const ev = (sb?.events ?? []).find((e: any) => e?.competitions?.[0]?.competitors?.some((c: any) => c?.team?.abbreviation === t?.abbr));
        const evState = ev?.competitions?.[0]?.status?.type?.state;
        if (ev && (evState === 'in' || evState === 'post')) {
          eventId = String(ev.id);
        } else if (t) {
          const games = await fetchTeamSchedule(league, t.id);
          const done = [...games].reverse().find((g) => g.state === 'post');
          eventId = String(done?.id ?? ev?.id ?? games[games.length - 1]?.id ?? '');
        } else if (ev) {
          eventId = String(ev.id);
        }
      }
      if (!eventId) return { speak: 'Which game? Name a team or give me a game id.', card: errorCard({ spoken: 'Name a team or give me a game id.' }) };

      const sum = await getJson(`${SITE}/${lg.path}/summary?event=${eventId}`);
      if (!sum) return { speak: "I couldn't load that game.", card: errorCard({ spoken: "I couldn't load that game." }) };
      const header = sum?.header ?? {};
      const comp = header?.competitions?.[0] ?? {};
      const g = gameFrom({ ...header, competitions: header?.competitions, date: comp?.date, status: comp?.status, links: header?.links }, league);
      // richer leaders from summary
      let leaders = leadersFrom({ competitors: (sum?.leaders ?? []).map((L: any) => ({ team: L?.team, leaders: L?.leaders })) }, league);
      if (!leaders.length) leaders = leadersFrom(comp, league);
      // win probability (live)
      const wp = sum?.winprobability;
      if (Array.isArray(wp) && wp.length && g.state === 'in') {
        const last = wp[wp.length - 1];
        const hp = Number(last?.homeWinPercentage);
        if (Number.isFinite(hp)) g.homeWinPct = hp <= 1 ? hp * 100 : hp;
      }
      if (!g.venue && sum?.gameInfo?.venue?.fullName) g.venue = String(sum.gameInfo.venue.fullName);
      await hydrateLogos([g.away, g.home]);
      return {
        speak: `${scoreLine(g)}.${leaders.length ? ' Leaders: ' + leaders.map((l) => `${l.name} ${l.value}`).join(', ') + '.' : ''}`,
        facts: { league, game_id: eventId, matchup: `${g.away?.abbr} @ ${g.home?.abbr}`, state: g.state, status: g.statusShort, away: { abbr: g.away?.abbr, score: g.away?.score, byPeriod: g.away?.linescores }, home: { abbr: g.home?.abbr, score: g.home?.score, byPeriod: g.home?.linescores }, leaders, odds: g.odds, winProbHome: g.homeWinPct },
        card: gameCard({ league, game: g, leaders }),
      };
    },
  },
  {
    name: 'sports_schedule',
    description:
      'Upcoming games. Use for "what games are on tonight", "who plays this week", "when do the Warriors play next", "NBA schedule". With a team, returns that team\'s next games and recent results; without one, the league\'s day/week slate. Read-only.',
    inputSchema: {
      type: 'object',
      properties: {
        league: leagueProp,
        team: { type: 'string', description: 'Optional team, e.g. "Warriors". Returns that team\'s schedule.' },
        date: { type: 'string', description: 'Optional day as YYYY-MM-DD (league slate for that day).' },
      },
      additionalProperties: false,
    },
    async run(args) {
      const team = str(args['team']);
      const league = await guessLeague(team, normLeague(args['league']));
      const lg = LEAGUES[league];
      if (team) {
        const t = await resolveTeam(league, team);
        if (!t) return { speak: `I couldn't find that ${lg.label} team.`, card: errorCard({ spoken: `Unknown ${lg.label} team.` }) };
        // a team schedule / next-game gets the full Google-style hub (GAMES tab = the schedule)
        return buildTeamHub(league, t);
      }
      const date = str(args['date']);
      const dateParam = date ? `?dates=${date.replace(/-/g, '')}` : '';
      const d = await getJson(`${SITE}/${lg.path}/scoreboard${dateParam}`);
      const games = (d?.events ?? []).map((e: any) => gameFrom(e, league));
      const upcoming = games.filter((g: GameLike) => g.state !== 'post');
      const show = (upcoming.length ? upcoming : games).slice(0, 10);
      await hydrateLogos(gameSides(show));
      return {
        speak: show.length ? `${lg.label}: ${show.slice(0, 3).map(scoreLine).join('; ')}${show.length > 3 ? `, and ${show.length - 3} more` : ''}.` : `No ${lg.label} games scheduled.`,
        facts: { league, count: show.length, games: show.map((g: GameLike) => ({ matchup: `${g.away?.abbr} @ ${g.home?.abbr}`, when: g.when, dateShort: g.dateShort, state: g.state })) },
        card: scheduleCard({ league, title: `${lg.label} schedule`, trailing: date ?? 'upcoming', games: show, emptyHint: 'Nothing scheduled.' }),
      };
    },
  },
  {
    name: 'sports_team',
    description:
      'A quick team update: record, division standing, next game and last result, with the team logo. Use for "how are the 49ers doing", "Lakers record", "give me a Cowboys update". Read-only.',
    inputSchema: {
      type: 'object',
      properties: { league: leagueProp, team: { type: 'string', description: 'The team, e.g. "49ers", "Celtics".' } },
      required: ['team'],
      additionalProperties: false,
    },
    async run(args) {
      const team = str(args['team']);
      if (!team) return { speak: 'Which team?' };
      const league = await guessLeague(team, normLeague(args['league']));
      const lg = LEAGUES[league];
      const t = await resolveTeam(league, team);
      if (!t) return { speak: `I couldn't find that ${lg.label} team.`, card: errorCard({ spoken: `Unknown ${lg.label} team.` }) };
      return buildTeamHub(league, t);
    },
  },
  {
    name: 'sports_standings',
    description:
      'League standings as a ranked table with logos, records, win pct and streak. Use for "NFL standings", "NBA West standings", "who\'s first in the AFC". Optional group filter (a conference or division name) narrows it. Read-only.',
    inputSchema: {
      type: 'object',
      properties: {
        league: leagueProp,
        group: { type: 'string', description: 'Optional conference/division filter, e.g. "AFC", "NFC East", "West", "Atlantic".' },
      },
      additionalProperties: false,
    },
    async run(args) {
      const league = normLeague(args['league']) ?? DEFAULT_LEAGUE;
      const lg = LEAGUES[league];
      const group = str(args['group']);
      const d = await getJson(`${CORE}/${lg.path}/standings`);
      // collect entries from either children[].standings.entries or standings.entries
      const buckets: { name: string; entries: any[] }[] = [];
      if (Array.isArray(d?.children)) {
        for (const c of d.children) {
          const entries = c?.standings?.entries ?? [];
          if (entries.length) buckets.push({ name: String(c?.name ?? ''), entries });
          // some payloads nest divisions under children[].children
          if (Array.isArray(c?.children)) for (const cc of c.children) {
            const e2 = cc?.standings?.entries ?? [];
            if (e2.length) buckets.push({ name: `${c?.name ?? ''} ${cc?.name ?? ''}`.trim(), entries: e2 });
          }
        }
      }
      if (!buckets.length && d?.standings?.entries) buckets.push({ name: String(d?.name ?? lg.label), entries: d.standings.entries });
      if (!buckets.length) return { speak: `${lg.label} standings are unavailable right now.`, card: standingsCard({ league, title: `${lg.label} standings`, rows: [] }) };

      let chosen = buckets;
      if (group) {
        const gq = group.toLowerCase();
        const m = buckets.filter((b) => b.name.toLowerCase().includes(gq));
        if (m.length) chosen = m;
      } else if (buckets.length > 1) {
        chosen = [buckets[0]]; // default to first conference to keep the table readable
      }
      const bucket = chosen[0];
      const statVal = (stats: any[], names: string[]): string | undefined => {
        for (const n of names) {
          const s = stats?.find((x: any) => x?.name === n || x?.type === n || x?.abbreviation === n);
          if (s) return String(s.displayValue ?? s.value ?? '');
        }
        return undefined;
      };
      let rows: StandingRowLike[] = bucket.entries.map((e: any) => {
        const team = e?.team ?? {};
        const abbr = String(team.abbreviation ?? '');
        const stats = e?.stats ?? [];
        const wins = Number(statVal(stats, ['wins']) ?? NaN);
        const losses = Number(statVal(stats, ['losses']) ?? NaN);
        const pctRaw = statVal(stats, ['winPercent', 'winpercent']);
        const pctNum = Number(pctRaw);
        const streak = statVal(stats, ['streak']) ?? statVal(stats, ['gamesBehind']) ?? '';
        return {
          abbr,
          name: String(team.shortDisplayName ?? team.displayName ?? abbr),
          logo: teamLogo(league, abbr),
          logoUrl: str2(team?.logos?.[0]?.href) ?? str2(team?.logo),
          wins: Number.isFinite(wins) ? wins : undefined,
          losses: Number.isFinite(losses) ? losses : undefined,
          pct: pctRaw,
          extra: String(streak).slice(0, 6),
          _sort: Number.isFinite(pctNum) ? pctNum : Number.isFinite(wins) ? wins / Math.max(1, wins + losses) : 0,
        } as StandingRowLike & { _sort: number };
      });
      // ESPN entries aren't always pre-ranked → order by win pct, then reassign rank.
      rows = (rows as (StandingRowLike & { _sort: number })[]).sort((a, b) => b._sort - a._sort).map((r, i) => ({ ...r, rank: i + 1 }));
      await hydrateLogos(rows);
      const note = seasonNote(league); // off-season → "last season's final"
      const title = `${lg.label} standings`;
      const top = rows.slice(0, 3).map((r) => `${r.name} ${r.wins ?? 0}-${r.losses ?? 0}`).join(', ');
      const prefix = note ? `Last season's final ${bucket.name || lg.label}` : bucket.name || lg.label;
      return {
        speak: `${prefix}: ${top}.`,
        facts: { league, group: bucket.name, offSeason: !!note, teams: rows.map((r) => ({ rank: r.rank, name: r.name, record: `${r.wins ?? 0}-${r.losses ?? 0}`, pct: r.pct })) },
        card: standingsCard({ league, title: bucket.name ? `${bucket.name}` : title, rows, extraLabel: 'STRK', note }),
      };
    },
  },
  {
    name: 'sports_player',
    description:
      'A player card: position, team, jersey and current-season stat line, with headshot. Use for "Patrick Mahomes stats", "how is LeBron doing", "tell me about Jayson Tatum". Read-only.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Player name, e.g. "Patrick Mahomes".' },
        league: leagueProp,
      },
      required: ['name'],
      additionalProperties: false,
    },
    async run(args) {
      const name = str(args['name']);
      if (!name) return { speak: 'Which player?' };
      const search = await getJson(`${WEB}/search/v2?limit=8&query=${encodeURIComponent(name)}`);
      const items: any[] = Array.isArray(search?.results) ? search.results.flatMap((r: any) => (Array.isArray(r?.contents) ? r.contents : [r])) : [];
      const hint = normLeague(args['league']);
      const player = items.find((it: any) => {
        const isPlayer = it?.type === 'player' || it?.type === 'athlete' || /\/players?\//.test(String(it?.link?.web ?? it?.uid ?? ''));
        if (!isPlayer) return false;
        if (!hint) return true;
        const blob = String(it?.link?.web ?? it?.uid ?? it?.subtitle ?? '').toLowerCase();
        return blob.includes(hint);
      }) ?? items.find((it: any) => it?.type === 'player');
      if (!player) return { speak: `I couldn't find a player called ${name}.`, card: errorCard({ spoken: `No player found for "${name}".` }) };

      const web = String(player?.link?.web ?? '');
      const uid = String(player?.uid ?? '');
      const blob = (web + ' ' + uid + ' ' + String(player?.subtitle ?? '')).toLowerCase();
      let league = hint;
      if (!league) {
        // match a league by its ESPN path segment in the player's URL/uid (nfl, nba, mlb, nhl, wnba,
        // college-football, mens-college-basketball, eng.1, ...); soccer players often lack a slug.
        for (const key of LEAGUE_KEYS) {
          const seg = LEAGUES[key].path.split('/')[1];
          if (blob.includes('/' + seg + '/') || blob.includes(seg)) {
            league = key;
            break;
          }
        }
      }
      league = league ?? DEFAULT_LEAGUE;
      const lg = LEAGUES[league];
      const idMatch = (web.match(/id\/(\d+)/) ?? uid.match(/a:(\d+)/) ?? [])[1] ?? String(player?.id ?? '');
      if (!idMatch) return { speak: `I found ${player?.displayName ?? name} but couldn't load stats.`, card: errorCard({ spoken: 'Player id unavailable.' }) };

      const ov = await getJson(`${WEB}/common/v3/sports/${lg.path}/athletes/${idMatch}/overview`);
      const bio = await getJson(`${WEB}/common/v3/sports/${lg.path}/athletes/${idMatch}`);
      const ath = bio?.athlete ?? {};
      const st = ov?.statistics ?? {};
      const labels: string[] = st?.labels ?? st?.displayNames ?? [];
      const values: string[] = st?.splits?.[0]?.stats ?? [];
      const stats = labels.slice(0, 6).map((k, i) => ({ k, v: String(values[i] ?? '-') })).filter((s) => s.v !== '-');
      let headshotUrl = ath?.headshot?.href ? String(ath.headshot.href) : String(player?.image?.default ?? player?.imageUrl ?? '');
      headshotUrl = headshotUrl.replace(/^http:/, 'https:');
      // shrink via ESPN's combiner so the inlined data URI stays small (the CSP-safe path)
      if (/a\.espncdn\.com/.test(headshotUrl) && !/combiner/.test(headshotUrl)) {
        try {
          headshotUrl = `https://a.espncdn.com/combiner/i?img=${encodeURIComponent(new URL(headshotUrl).pathname)}&h=160&w=160&scale=crop&format=png`;
        } catch {
          /* keep original */
        }
      }
      const headshot = headshotUrl ? await fetchBytesDataUri(headshotUrl, 60000) : undefined;
      const pos = ath?.position?.abbreviation ?? ath?.position?.displayName;
      const teamAbbr = ath?.team?.abbreviation;
      const nm = ath?.displayName ?? player?.displayName ?? name;
      const stLine = stats.slice(0, 4).map((s) => `${s.v} ${s.k}`).join(', ');
      return {
        speak: `${nm}${pos ? `, ${pos}` : ''}${teamAbbr ? ` (${teamAbbr})` : ''}${stLine ? `: ${stLine}` : ''}.`,
        facts: { league, name: nm, position: pos, team: ath?.team?.displayName, jersey: ath?.jersey, stats },
        card: playerCard({
          league,
          player: {
            name: String(nm),
            team: ath?.team?.displayName ? String(ath.team.displayName) : teamAbbr ? String(teamAbbr) : undefined,
            position: pos ? String(pos) : undefined,
            jersey: ath?.jersey ? String(ath.jersey) : undefined,
            headshot,
            stats,
            url: web && /^https:/.test(web) ? web : undefined,
          },
        }),
      };
    },
  },
  {
    name: 'sports_news',
    description: 'Latest headlines for any league — NFL, NBA, MLB, NHL, WNBA, college football/basketball, or soccer. Use for "sports news", "what\'s happening in the NBA", "MLB headlines". Tappable to open the full story. Read-only.',
    inputSchema: {
      type: 'object',
      properties: { league: leagueProp },
      additionalProperties: false,
    },
    async run(args) {
      const league = normLeague(args['league']) ?? DEFAULT_LEAGUE;
      const lg = LEAGUES[league];
      const d = await getJson(`${SITE}/${lg.path}/news`);
      const arts = (d?.articles ?? []) as any[];
      const items = arts.map((a) => ({
        headline: String(a?.headline ?? ''),
        source: a?.source ? String(a.source) : lg.label,
        when: a?.published ? new Date(a.published).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : undefined,
        url: (a?.links?.web?.href && /^https:/.test(a.links.web.href) ? String(a.links.web.href) : undefined),
      })).filter((n) => n.headline);
      return {
        speak: items.length ? `${lg.label} headlines: ${items.slice(0, 3).map((n) => n.headline).join('; ')}.` : `No ${lg.label} news right now.`,
        facts: { league, count: items.length, headlines: items.slice(0, 6).map((n) => n.headline) },
        card: newsCard({ league, title: `${lg.label} news`, items, emptyHint: 'No headlines right now.' }),
      };
    },
  },
];

const TOOL_BY_NAME = new Map(TOOLS.map((t) => [t.name, t]));

/* ─────────────────────────── JSON-RPC / MCP dispatch ─────────────────────────── */

function write(message: Record<string, unknown>): void {
  process.stdout.write(JSON.stringify(message) + '\n');
}
function toWire(out: ToolResult): string {
  const payload: Record<string, unknown> = { spoken: out.speak, ...(out.facts ?? {}) };
  if (out.card) {
    try {
      const glance = JSON.parse(out.card);
      if (glance && typeof glance === 'object') payload['_voiceos_glance'] = glance;
    } catch {
      /* an unparseable card is no card */
    }
  }
  return JSON.stringify(payload);
}

async function handle(msg: any): Promise<Record<string, unknown> | null> {
  const { id, method, params } = msg ?? {};
  const isNotification = id === undefined || id === null;

  if (method === 'initialize') {
    return { jsonrpc: '2.0', id, result: { protocolVersion: params?.protocolVersion ?? '2024-11-05', capabilities: { tools: {} }, serverInfo: { name: NAME, version: VERSION } } };
  }
  if (method === 'notifications/initialized' || method === 'notifications/cancelled') return null;
  if (method === 'ping') return { jsonrpc: '2.0', id, result: {} };
  if (method === 'tools/list') {
    return { jsonrpc: '2.0', id, result: { tools: TOOLS.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })) } };
  }
  if (method === 'tools/call') {
    const name = params?.name;
    const args = (params?.arguments ?? {}) as Record<string, unknown>;
    const tool = TOOL_BY_NAME.get(name);
    if (!tool) return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true } };
    try {
      const out = await tool.run(args);
      return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text: toWire(out) }] } };
    } catch (e) {
      log(`${name} crashed: ${(e as Error)?.message ?? e}`);
      const text = toWire({ speak: 'Sports hit an unexpected error. Please try again.', card: errorCard({ spoken: 'Sports hit an unexpected error.' }) });
      return { jsonrpc: '2.0', id, result: { content: [{ type: 'text', text }], isError: true } };
    }
  }
  if (isNotification) return null;
  return { jsonrpc: '2.0', id, error: { code: -32601, message: `Method not found: ${method}` } };
}

/* ─────────────────────────── stdio transport ─────────────────────────── */

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk: string) => {
  buffer += chunk;
  let nl = buffer.indexOf('\n');
  while (nl !== -1) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (line) {
      let msg: unknown = null;
      try {
        msg = JSON.parse(line);
      } catch {
        log('dropped a malformed frame');
      }
      if (msg && typeof msg === 'object') {
        handle(msg)
          .then((reply) => {
            if (reply) write(reply);
          })
          .catch((e) => log(`handler crashed: ${(e as Error)?.message ?? e}`));
      }
    }
    nl = buffer.indexOf('\n');
  }
});
process.stdin.on('end', () => process.exit(0));

log(`ready — ${TOOLS.length} tools, integration ${INTEGRATION_ID}, ESPN keyless (NO setup), native cards on`);
