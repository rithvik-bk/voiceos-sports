/** SPORTS_MARK — the integration's identity glyph: a crisp, league-neutral scoreboard, drawn as an
 * SVG data URI so it stays sharp at any size (the header renders it at ~22px). League-neutral on
 * purpose — the app now spans NFL/NBA/MLB/NHL/college/soccer, so a single league's shield would be
 * wrong on the others' cards. VoiceOS swaps the installed icon into the `data-k-mk` slot at runtime;
 * this is the pre-swap identity and is kept in sync with icon.png (same scoreboard). */
export const SPORTS_MARK =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <rect width="128" height="128" rx="28" fill="#0A2A4E"/>
      <rect x="24" y="30" width="80" height="56" rx="11" fill="none" stroke="#ffffff" stroke-width="6.5"/>
      <rect x="24" y="30" width="80" height="17" rx="8.5" fill="#ffffff"/>
      <line x1="64" y1="47" x2="64" y2="86" stroke="#ffffff" stroke-width="5"/>
      <circle cx="45" cy="67" r="6.5" fill="#ffffff"/>
      <circle cx="83" cy="67" r="6.5" fill="#ffffff"/>
      <rect x="40" y="100" width="48" height="7" rx="3.5" fill="#ffffff" opacity="0.55"/>
    </svg>`,
  ).toString('base64');

/** The VoiceOS "VO" mark, inline SVG (never used as an img src — inline it). */
export const VO_MARK =
  '<svg viewBox="0 0 116 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15 16H45L30 50Z" fill="#f4f4f5" stroke="#f4f4f5" stroke-width="9" stroke-linejoin="round"/><circle cx="90" cy="33" r="21" fill="#f4f4f5"/></svg>';
