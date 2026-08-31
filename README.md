# Sports for VoiceOS — live multi-sport companion

A voice-first sports companion that runs inside [VoiceOS](https://voiceos.com)'s notch as a local MCP integration. Ask what games are on, check live scores and box scores, follow your team, read standings, look up any player, and get headlines — across **NFL, NBA, MLB, NHL, WNBA, college football & basketball, and soccer (EPL/UCL/MLS)** — in native cards you can tap through. It knows when a league is off-season and labels last season's standings accordingly. No API key, no account, no login: it works the moment it's installed.

## What it does

Seven voice tools, each returning a rendered native card:

| Tool | Say | Card |
|---|---|---|
| `sports_scores` | "what games are on", "did the Lakers win" | Tappable scoreboard → tap a game for its box score |
| `sports_game` | "how did the Chiefs game go" | Score by quarter, leaders, betting line, live win probability |
| `sports_schedule` | "when do the Warriors play next" | Upcoming + recent slate |
| `sports_team` | "how are the 49ers doing" | **Team hub** — GAMES / STANDINGS / PLAYERS tabs |
| `sports_standings` | "NBA West standings" | Ranked table with logos, records, win pct |
| `sports_player` | "Patrick Mahomes stats" | Headshot + season stat line |
| `sports_news` | "what's happening in the NBA" | Tappable headlines |

The scoreboard and team hub are in-card mini-apps: tap a game to open its detail without leaving VoiceOS, then tap back.

## How it works

- **Data:** ESPN's public JSON endpoints (`site.api.espn.com`) — keyless, read-only public data, the same undocumented endpoints every third-party "ESPN MCP" wraps, called directly here so there's no extra hosted layer. One URL shape covers every sport, so the same normalisers serve all ten leagues. A paid provider (e.g. API-Sports) is a drop-in adapter behind them for higher rate limits and deeper history.
- **Native cards:** `cards.ts` composes the notch UI on the shared `widgetKit.ts` (vendored). Every tool result carries the rendered card under `_voiceos_glance`; the model always gets the underlying facts even if the card is dropped.
- **Logos:** NFL/NBA logos are baked into `logos.ts` as small `data:` URIs; every other league's logos are fetched from ESPN and inlined on demand (ESPN's CDN isn't in the host CSP allowlist), deduped per card into one registry, with a step-down that trims the item count to stay under the host's HTML/glance caps.
- **Season awareness:** an off-season league (detected by month) is labeled — standings say "last season's final" and scores note when the season starts.
- **Runtime:** a single self-contained `server.ts` (Node/Bun native TypeScript, built-ins + `fetch` only). Runtime-agnostic networking with a `curl` fallback.

## Install

```bash
# copy into the VoiceOS custom integrations directory
cp -R . "$HOME/Library/Application Support/VoiceOS/custom-mcps/sports"
```

Then register it in VoiceOS (or add a `customMcpServers` + `installedIntegrations` entry pointing `cwd` at the folder and running `run.sh`) and relaunch.

## Layout

```
server.ts    MCP server + ESPN data layer + tool definitions
cards.ts     native notch cards (scoreboard, hub, box score, standings, player, news)
widgetKit.ts shared VoiceOS card kit (vendored)
logos.ts     baked NFL + NBA team-logo atlas (data URIs)
mark.ts      integration mark
run.sh       launcher (prefers node)
```

Built for the VoiceOS integration ecosystem.
