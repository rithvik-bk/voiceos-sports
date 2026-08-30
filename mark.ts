/** SPORTS_MARK — the integration's identity glyph (a scoreboard) as an SVG data URI, shown in
 * card headers. VoiceOS swaps the installed icon into the `data-k-mk` slot at runtime; this is
 * the pre-swap identity. League-specific marks (NFL / NBA) are used inside cards. */
export const SPORTS_MARK =
  'data:image/svg+xml;base64,' +
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
      <rect width="128" height="128" rx="28" fill="#0B0B0C"/>
      <rect x="24" y="34" width="80" height="60" rx="10" fill="none" stroke="#12B76A" stroke-width="7"/>
      <rect x="24" y="34" width="80" height="18" rx="9" fill="#12B76A"/>
      <line x1="64" y1="52" x2="64" y2="94" stroke="#12B76A" stroke-width="6"/>
      <circle cx="45" cy="72" r="7" fill="#fff"/>
      <circle cx="83" cy="72" r="7" fill="#fff"/>
    </svg>`,
  ).toString('base64');

/** The VoiceOS "VO" mark, inline SVG (never used as an img src — inline it). */
export const VO_MARK =
  '<svg viewBox="0 0 116 62" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M15 16H45L30 50Z" fill="#f4f4f5" stroke="#f4f4f5" stroke-width="9" stroke-linejoin="round"/><circle cx="90" cy="33" r="21" fill="#f4f4f5"/></svg>';
