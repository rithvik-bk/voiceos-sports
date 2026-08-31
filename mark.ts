/** SPORTS_MARK — the integration's identity glyph: a league-neutral playing field (pitch/court
 * outline with a halfway line + center circle), drawn as an SVG data URI so it stays sharp at any
 * size. Green on purpose — it reads as "the field" and covers every sport the app spans
 * (NFL/NBA/MLB/NHL/college/soccer), with no league trademark. VoiceOS swaps the installed icon
 * into the `data-k-mk` slot at runtime; this is the pre-swap identity, kept in sync with icon.png
 * (same green field). Note: as of the "remove the top thing" pass the in-card mark is hidden, so
 * this shows only on the integration tile. */
export const SPORTS_MARK =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="24" fill="#0B5D3B"/>
      <g fill="none" stroke="#ffffff">
        <rect x="13" y="24" width="74" height="52" stroke-width="4.4"/>
        <line x1="50" y1="24" x2="50" y2="76" stroke-width="3.4"/>
        <circle cx="50" cy="50" r="12" stroke-width="3.4"/>
        <rect x="13" y="35" width="15" height="30" stroke-width="3.4"/>
        <rect x="72" y="35" width="15" height="30" stroke-width="3.4"/>
        <rect x="13" y="43" width="7" height="14" stroke-width="3.4"/>
        <rect x="80" y="43" width="7" height="14" stroke-width="3.4"/>
      </g>
      <circle cx="50" cy="50" r="2" fill="#ffffff"/>
    </svg>`,
  ).toString('base64');

/** The VoiceOS "VO" mark, inline SVG (never used as an img src — inline it). */
export const VO_MARK =
  '<svg viewBox="0 0 116 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15 16H45L30 50Z" fill="#f4f4f5" stroke="#f4f4f5" stroke-width="9" stroke-linejoin="round"/><circle cx="90" cy="33" r="21" fill="#f4f4f5"/></svg>';
