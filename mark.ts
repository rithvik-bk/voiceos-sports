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
      <rect x="24" y="34" width="52" height="34" rx="8" fill="none" stroke="#ffffff" stroke-width="5"/>
      <line x1="50" y1="34" x2="50" y2="68" stroke="#ffffff" stroke-width="4"/>
      <circle cx="50" cy="51" r="7" fill="none" stroke="#ffffff" stroke-width="4"/>
    </svg>`,
  ).toString('base64');

/** The VoiceOS "VO" mark, inline SVG (never used as an img src — inline it). */
export const VO_MARK =
  '<svg viewBox="0 0 116 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15 16H45L30 50Z" fill="#f4f4f5" stroke="#f4f4f5" stroke-width="9" stroke-linejoin="round"/><circle cx="90" cy="33" r="21" fill="#f4f4f5"/></svg>';
