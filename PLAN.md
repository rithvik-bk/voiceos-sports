# Sports → all-sports ESPN + intelligence + UI fixes

## Definition of done
- All 6 screenshot UI bugs fixed and visually verified in-browser.
- MLB, NHL, WNBA, CFB, MCBB added (+ soccer scores/news); multi-sport verified live.
- Season intelligence: off-season / last-season labeled from ESPN payload (his NBA-standings complaint).
- Edge-case battery run by me, failures fixed, re-run green.
- Installed + reconciled + pushed. Run report.

## Decisions (verified this session)
- NO official ESPN MCP/API exists — all are 3rd-party wrappers of the same hidden endpoints (some paid). Keep our own keyless local MCP, expand it. [verified: WebSearch + live curls]
- MLB/WNBA/CFB are IN SEASON now → fixes the "nothing live" demo gap. [verified: live scoreboards]
- Neutral multi-sport mark (crisp SVG) replaces NFL shield in-card + app icon — fixes NFL-on-NBA + "damaging". Flag icon change to him (1-line revert).

## Tasks
### A. UI (cards.ts + mark.ts)  [do first, verify visually]
- [ ] Neutral crisp scoreboard SVG mark (navy/white), used in header + app icon
- [ ] Contrast: split ACCENT (navy=fill) vs ACCENT_LT (bright=text/thin-accent); fix date/leaders/record/tab-underline/possession/winprob
- [ ] News: add `.s-chev` base size rule (fix giant chevron)
- [ ] Back control: pill + "Back" label + visible arrow (both scoreboard + hub detail)
- [ ] Spacing: bottom padding on tabviews/scroll/lists; header top breathing room
- [ ] Regenerate app icon (neutral) → repo + install + config iconDataUrl

### B. Multi-sport data (server.ts)
- [ ] Expand LEAGUES map (mlb, nhl, wnba, cfb, mcbb, epl/soccer) w/ period model + season path
- [ ] normLeague + guessLeague: many leagues, in-season priority, ambiguity (Cardinals/Giants/Rangers)
- [ ] On-demand logo fetch+inline for non-atlas teams (college), atlas fast-path for pro
- [ ] Per-sport leader categories (MLB/NHL/soccer)

### C. Intelligence
- [ ] Season state from payload (season.year/type, in/off-season) → label standings + scores
- [ ] Edge cases: unknown team/player, misspelling, off-season, no games, ambiguous league

### D. Verify + ship
- [ ] Edge-case test battery → fix → re-run
- [ ] Deploy, relaunch, reconcile, push, memory, run report
