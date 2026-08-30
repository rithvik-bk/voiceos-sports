/**
 * THE CARD LAYER — NFL/NBA ⇄ VoiceOS notch glance cards.
 *
 * Native cards matching the app's built-in cards and the shipped Slack/Zoom/Reddit integrations:
 * a dark surface with a green "live" glow, a header strip carrying the scoreboard mark, real team
 * logos (baked data URIs — ESPN's CDN is not in VoiceOS's img CSP allowlist), and an in-card
 * mini-app: tap any game on the scoreboard to open its detail (score-by-period, leaders, odds,
 * win probability) without leaving the notch, then tap Back.
 *
 * `widgetKit.ts` is vendored verbatim; every rich card is `renderCustom`. The wire shape is
 * `{ blocks:[{ type:'widget', html, height }] }`, serialised to a string; `toWire` in server.ts
 * parses it back into `_voiceos_glance`. The kit's own ResizeObserver auto-resizes the card when a
 * mini-app view switches, so view changes need no host round-trip.
 */

import { clip, esc, renderCustom, renderWidget, setIntegrationMark, vHeader } from './widgetKit.ts';
import type { Block, RenderedWidget } from './widgetKit.ts';
import { SPORTS_MARK } from './mark.ts';

export const ACCENT = '#12B76A';
const TITLE = 'Scores';
const GLANCE_CAP = 92000; // stay under the host's 96KB widget drop cap

let markLoaded = false;
function ensureMark(): void {
  if (markLoaded) return;
  markLoaded = true;
  try {
    setIntegrationMark(SPORTS_MARK);
  } catch {
    /* kit falls back to the accent dot */
  }
}

/* ─────────────────────────────────── plumbing ─────────────────────────────────── */

function pack(widget: RenderedWidget): string {
  return JSON.stringify({ blocks: [{ type: 'widget', html: widget.html, height: widget.height }] });
}
function packBlocks(blocks: Block[]): string {
  return pack(renderWidget({ blocks, accent: ACCENT, label: TITLE }));
}
function packCustom(body: string, height: number): string {
  return pack(renderCustom({ body: `<div class="s-wrap">${body}</div>`, css: S_CSS, label: TITLE, height }));
}
function glanceLen(s: string): number {
  try {
    const g = JSON.parse(s);
    return JSON.stringify(g).length;
  } catch {
    return s.length;
  }
}
function guarded(compose: () => string, fallbackTrailing: string): string {
  try {
    ensureMark();
    return compose();
  } catch {
    try {
      return packBlocks([vHeader({ title: TITLE, trailing: fallbackTrailing })]);
    } catch {
      return '';
    }
  }
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v !== '' ? v : undefined;
}
function num(v: unknown): number | undefined {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}
/** Only https URLs are tappable — the bridge opens exactly these; everything else stays inert. */
function httpsUrl(v: unknown): string | undefined {
  const s = typeof v === 'string' ? v.trim() : '';
  return /^https:\/\//i.test(s) ? s : undefined;
}

/* ─────────────────────────────────── image registry ─────────────────────────────────── */
/* Each unique data URI is emitted ONCE into window.__IMGS and referenced by index, so a scoreboard
 * of many logos never inlines a URI twice — the difference between fitting under 96KB and a dropped
 * card (the Reddit Round-6 lesson). */
class ImgReg {
  private map = new Map<string, number>();
  arr: string[] = [];
  idx(dataUri: string | undefined): number {
    if (!dataUri) return -1;
    const hit = this.map.get(dataUri);
    if (hit !== undefined) return hit;
    const i = this.arr.length;
    this.map.set(dataUri, i);
    this.arr.push(dataUri);
    return i;
  }
  script(): string {
    return this.arr.length ? `<script>window.__IMGS=${JSON.stringify(this.arr)}</script>` : '';
  }
}
const IMG_HYDRATE =
  '<script>(function(){var a=window.__IMGS||[];var e=document.querySelectorAll("img[data-img]");for(var i=0;i<e.length;i++){var k=+e[i].getAttribute("data-img");if(a[k])e[i].src=a[k];}})();</script>';

/** The in-card client-side router: taps on [data-open="i"] reveal view "g-i"; [data-back] returns
 * home. Plain show/hide — the kit's ResizeObserver auto-resizes the card; the kit's own bridge
 * click handler ignores plain divs (only data-k-link / anchors), so [data-open] slips past it. */
const NAV_SCRIPT =
  '<script>' +
  'function show(id){var vs=document.querySelectorAll("[data-view]");for(var i=0;i<vs.length;i++){vs[i].style.display=(vs[i].getAttribute("data-view")===id)?"flex":"none";}var sc=document.querySelector("[data-view=\\""+id+"\\"] .s-scroll");if(sc){sc.scrollTop=0;}try{window.scrollTo(0,0);}catch(e){}}' +
  'document.addEventListener("click",function(e){var el=e.target;while(el&&el!==document.body){if(el.getAttribute){var o=el.getAttribute("data-open");if(o!==null){show("g-"+o);return;}if(el.hasAttribute("data-back")){show("home");return;}}el=el.parentNode;}});' +
  '</script>';

/** Team-hub router: tab switching ([data-tab]) + game detail ([data-open]) + back ([data-back]). */
const HUB_SCRIPT =
  '<script>' +
  'function vshow(id){var vs=document.querySelectorAll("[data-view]");for(var i=0;i<vs.length;i++){vs[i].style.display=(vs[i].getAttribute("data-view")===id)?"flex":"none";}var sc=document.querySelector("[data-view=\\""+id+"\\"] .s-scroll");if(sc){sc.scrollTop=0;}try{window.scrollTo(0,0);}catch(e){}}' +
  'function tshow(t){var vs=document.querySelectorAll("[data-tabview]");for(var i=0;i<vs.length;i++){vs[i].style.display=(vs[i].getAttribute("data-tabview")===t)?"flex":"none";}var ts=document.querySelectorAll("[data-tab]");for(var j=0;j<ts.length;j++){if(ts[j].getAttribute("data-tab")===t)ts[j].className="s-tab active";else ts[j].className="s-tab";}try{window.scrollTo(0,0);}catch(e){}}' +
  'document.addEventListener("click",function(e){var el=e.target;while(el&&el!==document.body){if(el.getAttribute){var t=el.getAttribute("data-tab");if(t!==null){vshow("home");tshow(t);return;}var o=el.getAttribute("data-open");if(o!==null){vshow("g-"+o);return;}if(el.hasAttribute("data-back")){vshow("home");return;}}el=el.parentNode;}});' +
  '</script>';

/* ─────────────────────────────────── line icons ─────────────────────────────────── */

const IC_CHEV =
  '<svg class="s-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
const IC_BACK =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
const IC_PIN =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/></svg>';
const IC_TV =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 21h8"/></svg>';
const IC_CAL =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>';
const IC_EXT =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 5h5v5"/><path d="M19 5l-8 8"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>';
const IC_TROPHY =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 15h6M10 19h4M12 15v4"/></svg>';

/* ─────────────────────────────────── stylesheet ─────────────────────────────────── */

const S_CSS = `
body{background:#1c1c1e;background-image:radial-gradient(135% 92% at 50% -8%,rgba(18,183,106,.26),rgba(18,183,106,0) 55%);background-repeat:no-repeat;background-attachment:fixed}
.s-wrap{display:flex;flex-direction:column}
.s-view{display:flex;flex-direction:column}
.s-hd{display:flex;align-items:center;gap:9px;padding:12px 15px 11px;background:rgba(255,255,255,.035);border-bottom:1px solid rgba(255,255,255,.07)}
.s-hd .k-mk{display:flex;align-items:center;flex:none}
.s-ic{width:22px;height:22px;border-radius:6px;object-fit:cover;display:block}
.s-hd-t{font-size:14px;font-weight:700;color:#fff;letter-spacing:-.01em;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.s-hd-tr{font-size:11.5px;font-weight:600;color:rgba(255,255,255,.5);flex:none;white-space:nowrap}
.s-lg{font-size:10px;font-weight:800;letter-spacing:.04em;color:rgba(255,255,255,.6);background:rgba(255,255,255,.09);border-radius:5px;padding:2px 6px;flex:none}

/* scoreboard feed */
.s-list{display:flex;flex-direction:column;padding:4px 8px 8px}
.s-g{display:flex;align-items:center;gap:10px;padding:11px 8px;margin:0 -0px;border-top:1px solid rgba(255,255,255,.06);cursor:pointer;-webkit-user-select:none;user-select:none;border-radius:12px;transition:background .12s ease}
.s-g:first-child{border-top:0}
.s-g:hover{background:rgba(255,255,255,.05)}
.s-g:active{background:rgba(255,255,255,.085)}
.s-g-teams{flex:1;min-width:0;display:flex;flex-direction:column;gap:7px}
.s-tr{display:flex;align-items:center;gap:9px;min-width:0}
.s-logo{width:22px;height:22px;flex:none;object-fit:contain;display:block}
.s-ab{font-size:14px;font-weight:700;color:#fff;letter-spacing:-.01em;flex:none;min-width:34px}
.s-nm{font-size:12px;color:rgba(255,255,255,.5);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}
.s-rec{font-size:11px;color:rgba(255,255,255,.38);flex:none}
.s-sc{font-size:16px;font-weight:800;color:#fff;flex:none;min-width:26px;text-align:right;font-variant-numeric:tabular-nums}
.s-sc.lose{color:rgba(255,255,255,.42);font-weight:700}
.s-poss{color:${ACCENT}}
.s-g-status{flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:2px;min-width:62px}
.s-pill{font-size:10.5px;font-weight:800;letter-spacing:.02em;border-radius:999px;padding:2px 8px;white-space:nowrap}
.s-live{color:#fff;background:#E23744}
.s-live .s-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:#fff;margin-right:5px;vertical-align:middle}
.s-final{color:rgba(255,255,255,.62);background:rgba(255,255,255,.09)}
.s-when{font-size:11.5px;font-weight:700;color:#fff;text-align:right;line-height:1.25}
.s-when-d{font-size:10.5px;color:rgba(255,255,255,.45);text-align:right}
.s-g .s-chev{width:15px;height:15px;flex:none;color:rgba(255,255,255,.28);align-self:center}

/* detail view */
.s-detail{min-height:200px}
.s-dbar{display:flex;align-items:center;gap:8px;padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.02)}
.s-back{display:inline-flex;align-items:center;gap:4px;font-size:13px;font-weight:700;color:#fff;cursor:pointer;-webkit-user-select:none;user-select:none}
.s-back svg{width:17px;height:17px}
.s-dbar-tr{margin-left:auto;font-size:11px;font-weight:700;color:rgba(255,255,255,.5)}
.s-scroll{overflow-y:auto;-webkit-overflow-scrolling:touch;flex:1;min-height:0}
.s-match{display:flex;align-items:center;justify-content:center;gap:0;padding:16px 14px 6px}
.s-mteam{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0}
.s-mlogo{width:46px;height:46px;object-fit:contain}
.s-mab{font-size:14px;font-weight:800;color:#fff;letter-spacing:-.01em}
.s-mrec{font-size:11px;color:rgba(255,255,255,.42)}
.s-mid{flex:none;display:flex;flex-direction:column;align-items:center;gap:3px;padding:0 8px;min-width:96px}
.s-mscore{font-size:30px;font-weight:800;color:#fff;letter-spacing:-.02em;font-variant-numeric:tabular-nums;line-height:1}
.s-mscore .sep{color:rgba(255,255,255,.3);margin:0 8px;font-weight:600}
.s-mstat{font-size:11.5px;font-weight:800;letter-spacing:.02em;text-transform:uppercase}
.s-mstat.live{color:#E23744}
.s-mstat.final{color:rgba(255,255,255,.55)}
.s-mstat.pre{color:${ACCENT}}
.s-mkick{font-size:15px;font-weight:800;color:#fff}
.s-sec{padding:12px 15px 4px}
.s-sec-h{font-size:11px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.4);margin-bottom:9px}
.s-rule{height:1px;background:rgba(255,255,255,.08);margin:8px 15px}
/* linescore */
.s-ls{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
.s-ls th{font-size:10.5px;font-weight:700;color:rgba(255,255,255,.4);padding:3px 0;text-align:center}
.s-ls th.tm,.s-ls td.tm{text-align:left;width:38%}
.s-ls td{font-size:13px;color:rgba(255,255,255,.82);padding:5px 0;text-align:center}
.s-ls td.tot{font-weight:800;color:#fff}
.s-ls .tm{display:flex;align-items:center;gap:7px}
.s-ls .tm img{width:18px;height:18px;object-fit:contain}
.s-ls .tm b{font-size:13px;font-weight:700;color:#fff}
.s-ls tr+tr td{border-top:1px solid rgba(255,255,255,.06)}
/* leaders */
.s-ld{display:flex;flex-direction:column;gap:9px}
.s-ld-row{display:flex;align-items:center;gap:10px;min-width:0}
.s-ld-cat{font-size:10.5px;font-weight:800;letter-spacing:.03em;color:rgba(255,255,255,.4);flex:none;width:52px;text-transform:uppercase}
.s-ld-nm{font-size:13.5px;font-weight:650;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:1}
.s-ld-tm{font-size:11px;color:rgba(255,255,255,.42);flex:none}
.s-ld-v{font-size:12.5px;font-weight:700;color:${ACCENT};flex:none;white-space:nowrap}
/* key-value rows */
.s-kv{display:flex;flex-direction:column;gap:8px}
.s-kv-row{display:flex;align-items:center;gap:9px;min-width:0}
.s-kv-row svg{width:15px;height:15px;flex:none;color:rgba(255,255,255,.42)}
.s-kv-k{font-size:12.5px;color:rgba(255,255,255,.5);flex:none}
.s-kv-v{font-size:13px;color:rgba(255,255,255,.86);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
/* win probability bar */
.s-wp{margin-top:4px}
.s-wp-bar{height:9px;border-radius:999px;overflow:hidden;display:flex;background:rgba(255,255,255,.1)}
.s-wp-a{background:rgba(255,255,255,.32)}
.s-wp-h{background:${ACCENT}}
.s-wp-lb{display:flex;justify-content:space-between;margin-top:6px;font-size:11.5px;font-weight:700}
.s-wp-lb .a{color:rgba(255,255,255,.6)}
.s-wp-lb .h{color:${ACCENT}}

/* team card */
.s-team-hero{display:flex;align-items:center;gap:14px;padding:16px 15px 10px}
.s-team-logo{width:56px;height:56px;object-fit:contain;flex:none}
.s-team-m{min-width:0;flex:1}
.s-team-nm{font-size:20px;font-weight:800;color:#fff;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.s-team-sub{font-size:13px;color:rgba(255,255,255,.55);margin-top:3px}
.s-team-rec{font-size:15px;font-weight:800;color:${ACCENT};margin-top:2px}

/* standings table */
.s-st{display:flex;flex-direction:column;padding:2px 12px 8px}
.s-st-hd{display:flex;align-items:center;gap:8px;padding:6px 6px;font-size:10.5px;font-weight:700;color:rgba(255,255,255,.4)}
.s-st-row{display:flex;align-items:center;gap:8px;padding:8px 6px;border-top:1px solid rgba(255,255,255,.06);border-radius:8px}
.s-st-row:hover{background:rgba(255,255,255,.04)}
.s-st-rk{font-size:11px;font-weight:800;color:rgba(255,255,255,.5);width:16px;flex:none;text-align:center}
.s-st-logo{width:20px;height:20px;object-fit:contain;flex:none}
.s-st-nm{font-size:13.5px;font-weight:650;color:#fff;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.s-st-col{font-size:12.5px;font-weight:700;color:rgba(255,255,255,.82);flex:none;width:44px;text-align:right;font-variant-numeric:tabular-nums}
.s-st-col.wl{width:56px;color:#fff}
.s-st-col.sub{color:rgba(255,255,255,.5);font-weight:600}

/* player card */
.s-pl-hero{display:flex;align-items:center;gap:14px;padding:16px 15px 12px}
.s-pl-hs{width:60px;height:60px;border-radius:50%;object-fit:cover;flex:none;background:rgba(255,255,255,.07)}
.s-pl-m{min-width:0;flex:1}
.s-pl-nm{font-size:19px;font-weight:800;color:#fff;letter-spacing:-.02em}
.s-pl-sub{font-size:12.5px;color:rgba(255,255,255,.55);margin-top:4px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.s-pl-badge{font-size:11px;font-weight:800;color:#fff;background:${ACCENT};border-radius:6px;padding:2px 7px}
.s-stats{display:flex;flex-wrap:wrap;gap:0;padding:6px 8px 12px}
.s-stat{flex:1 1 33%;min-width:80px;padding:10px 8px;text-align:center}
.s-stat-v{font-size:20px;font-weight:800;color:#fff;letter-spacing:-.01em;font-variant-numeric:tabular-nums}
.s-stat-k{font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:rgba(255,255,255,.42);margin-top:3px}

/* news list */
.s-news{display:flex;flex-direction:column;padding:4px 15px 8px}
.s-nw{display:flex;align-items:flex-start;gap:10px;padding:11px 8px;margin:0 -8px;border-top:1px solid rgba(255,255,255,.06);border-radius:10px;text-decoration:none;color:inherit;cursor:pointer;transition:background .12s ease}
.s-nw:first-child{border-top:0}
.s-nw:hover{background:rgba(255,255,255,.05)}
.s-nw-m{min-width:0;flex:1}
.s-nw-t{font-size:14px;font-weight:650;color:#fff;letter-spacing:-.01em;line-height:1.28;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.s-nw-s{font-size:11.5px;color:rgba(255,255,255,.45);margin-top:4px}

/* schedule list */
.s-sch{display:flex;flex-direction:column;padding:4px 15px 8px}
.s-se{display:flex;align-items:center;gap:10px;padding:10px 8px;margin:0 -8px;border-top:1px solid rgba(255,255,255,.06)}
.s-se:first-child{border-top:0}
.s-se-mt{flex:1;min-width:0;display:flex;align-items:center;gap:7px}
.s-se-mt img{width:20px;height:20px;object-fit:contain;flex:none}
.s-se-ab{font-size:13px;font-weight:700;color:#fff}
.s-se-at{font-size:12px;color:rgba(255,255,255,.4)}
.s-se-when{flex:none;text-align:right}
.s-se-t{font-size:12.5px;font-weight:700;color:#fff}
.s-se-d{font-size:11px;color:rgba(255,255,255,.45)}

/* team hub (tabbed, Google-style) */
.s-hub-hd{display:flex;align-items:center;gap:13px;padding:16px 15px 14px;position:relative}
.s-hub-hd .s-hub-logo{width:46px;height:46px;object-fit:contain;flex:none;filter:drop-shadow(0 1px 3px rgba(0,0,0,.4))}
.s-hub-m{min-width:0;flex:1}
.s-hub-nm{font-size:19px;font-weight:800;color:#fff;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 3px rgba(0,0,0,.35)}
.s-hub-sub{font-size:12.5px;color:rgba(255,255,255,.82);margin-top:3px;text-shadow:0 1px 2px rgba(0,0,0,.3)}
.s-tabs{display:flex;align-items:stretch;border-bottom:1px solid rgba(255,255,255,.1);padding:0 6px}
.s-tab{flex:1;text-align:center;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:rgba(255,255,255,.5);padding:11px 4px 9px;cursor:pointer;-webkit-user-select:none;user-select:none;border-bottom:2.5px solid transparent;transition:color .12s ease}
.s-tab:hover{color:rgba(255,255,255,.8)}
.s-tab.active{color:#fff;border-bottom-color:${ACCENT}}
.s-tabview{display:flex;flex-direction:column;overflow-y:auto;-webkit-overflow-scrolling:touch}
.s-glabel{font-size:10.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:rgba(255,255,255,.38);padding:12px 15px 4px}
.s-hg{display:flex;align-items:center;gap:10px;padding:9px 15px;border-top:1px solid rgba(255,255,255,.06);cursor:pointer;-webkit-user-select:none;user-select:none;transition:background .12s ease}
.s-hg:hover{background:rgba(255,255,255,.05)}
.s-hg-teams{flex:1;min-width:0;display:flex;flex-direction:column;gap:5px}
.s-hg-r{display:flex;align-items:center;gap:8px;min-width:0}
.s-hg-r img{width:19px;height:19px;object-fit:contain;flex:none}
.s-hg-ab{font-size:13.5px;font-weight:700;color:#fff;min-width:34px}
.s-hg-nm{font-size:12px;color:rgba(255,255,255,.5);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}
.s-hg-sc{font-size:15px;font-weight:800;color:#fff;flex:none;min-width:24px;text-align:right;font-variant-numeric:tabular-nums}
.s-hg-sc.lose{color:rgba(255,255,255,.42);font-weight:700}
.s-hg-when{flex:none;text-align:right;display:flex;flex-direction:column;gap:1px;min-width:56px}
.s-hg-w1{font-size:12px;font-weight:700;color:#fff}
.s-hg-w2{font-size:10.5px;color:rgba(255,255,255,.45)}
.s-hg .s-chev{width:14px;height:14px;flex:none;color:rgba(255,255,255,.26);align-self:center}
.s-pl-list{display:flex;flex-direction:column;padding:2px 0 6px}
.s-plr{display:flex;align-items:center;gap:11px;padding:10px 15px;border-top:1px solid rgba(255,255,255,.06);text-decoration:none;color:inherit;cursor:pointer;transition:background .12s ease}
.s-plr:hover{background:rgba(255,255,255,.05)}
.s-plr-jr{font-size:12px;font-weight:800;color:rgba(255,255,255,.5);background:rgba(255,255,255,.08);border-radius:7px;min-width:30px;height:26px;display:flex;align-items:center;justify-content:center;flex:none}
.s-plr-m{min-width:0;flex:1}
.s-plr-nm{font-size:14px;font-weight:650;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.s-plr-pos{font-size:11.5px;color:rgba(255,255,255,.45);margin-top:2px}
.s-plr .s-chev{width:14px;height:14px;flex:none;color:rgba(255,255,255,.26)}
.s-empty{padding:16px 15px 20px}
.s-empty b{display:block;color:#fff;font-size:16px;font-weight:650;letter-spacing:-.01em;margin-bottom:4px}
.s-empty span{font-size:13px;color:rgba(255,255,255,.55);line-height:1.4}
.s-note{padding:8px 15px 16px;font-size:12.5px;color:rgba(255,255,255,.5);line-height:1.45}
.s-ft{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 15px 15px}
.s-ft-l{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:rgba(255,255,255,.5)}
.s-ft-l svg{width:14px;height:14px;color:${ACCENT}}
.s-btn{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;color:#fff;background:${ACCENT};border-radius:999px;padding:8px 16px;text-decoration:none;cursor:pointer}
.s-btn svg{width:14px;height:14px}
`;

/* ─────────────────────────────────── shared pieces ─────────────────────────────────── */

function headerHtml(title: string, trailing?: string, leagueBadge?: string): string {
  const tr = trailing === undefined ? '' : `<span class="s-hd-tr">${esc(clip(trailing, 26))}</span>`;
  const lb = leagueBadge ? `<span class="s-lg">${esc(leagueBadge)}</span>` : '';
  return (
    `<div class="s-hd"><span class="k-mk" data-k-mk><img class="s-ic" src="${SPORTS_MARK}" alt=""></span>` +
    `<span class="s-hd-t">${esc(clip(title, 40))}</span>${lb}${tr}</div>`
  );
}

/* ─────────────────────────────────── types ─────────────────────────────────── */

export interface SideLike {
  abbr?: string;
  name?: string;
  score?: number;
  record?: string;
  logo?: string; // data URI
  winner?: boolean;
  possession?: boolean;
  linescores?: number[];
}
export interface LeaderLike {
  cat?: string; // e.g. PASS, RUSH, REC / PTS, REB, AST
  name?: string;
  team?: string;
  value?: string;
}
export interface GameLike {
  id?: string;
  league?: string; // 'nfl' | 'nba'
  state?: string; // 'pre' | 'in' | 'post'
  statusDetail?: string; // "Final", "3rd Quarter", "8:20 PM"
  statusShort?: string; // "Final", "Q3 4:22"
  clock?: string;
  period?: number;
  home?: SideLike;
  away?: SideLike;
  when?: string; // "8:20 PM"
  dateShort?: string; // "Wed, Sep 9"
  venue?: string;
  broadcast?: string;
  odds?: string;
  overUnder?: string;
  homeWinPct?: number; // 0-100
  periodLabels?: string[]; // ["1","2","3","4"] or ["1","2","3","4","OT"]
  url?: string;
  note?: string;
  dateISO?: string; // raw event date, for sorting
  seasonType?: string; // "Preseason" | "Regular Season" | "Postseason"
}
export interface TeamCardLike {
  league?: string;
  name?: string;
  logo?: string;
  record?: string;
  standing?: string;
  division?: string;
  nextGame?: string;
  lastGame?: string;
  url?: string;
}
export interface StandingRowLike {
  rank?: number;
  abbr?: string;
  name?: string;
  logo?: string;
  wins?: number;
  losses?: number;
  pct?: string;
  extra?: string; // GB / streak / conf record
}
export interface PlayerLike {
  name?: string;
  team?: string;
  position?: string;
  jersey?: string;
  headshot?: string;
  logo?: string;
  stats?: { k: string; v: string }[];
  url?: string;
}
export interface NewsLike {
  headline?: string;
  source?: string;
  when?: string;
  url?: string;
}

/* ─────────────────────────────────── HERO: scoreboard + game detail ─────────────────────────────────── */

const LIVE = new Set(['in']);

function sideRow(reg: ImgReg, s: SideLike | undefined, live: boolean): string {
  const side = s ?? {};
  const li = reg.idx(side.logo);
  const logo = li >= 0 ? `<img class="s-logo" data-img="${li}" alt="">` : `<span class="s-logo"></span>`;
  const scoreShown = side.score !== undefined;
  const loseCls = scoreShown && side.winner === false ? ' lose' : '';
  const poss = live && side.possession ? '<span class="s-poss">&#9679;</span> ' : '';
  const score = scoreShown ? `<span class="s-sc${loseCls}">${poss}${side.score}</span>` : '';
  const rec = side.record ? `<span class="s-rec">${esc(clip(side.record, 8))}</span>` : '';
  return (
    `<div class="s-tr">${logo}<span class="s-ab">${esc(clip(side.abbr ?? '', 4))}</span>` +
    `<span class="s-nm">${esc(clip(side.name ?? '', 22))}</span>${rec}${score}</div>`
  );
}

function statusCell(g: GameLike): string {
  const live = LIVE.has(g.state ?? '');
  if (live) {
    return `<span class="s-pill s-live"><span class="s-dot"></span>${esc(clip(g.statusShort ?? 'LIVE', 12))}</span>`;
  }
  if (g.state === 'post') {
    return `<span class="s-pill s-final">${esc(clip(g.statusShort ?? 'Final', 10))}</span>`;
  }
  const when = g.when ? `<span class="s-when">${esc(clip(g.when, 12))}</span>` : '';
  const dt = g.dateShort ? `<span class="s-when-d">${esc(clip(g.dateShort, 14))}</span>` : '';
  return when + dt;
}

function gameRow(reg: ImgReg, g: GameLike, i: number): string {
  const live = LIVE.has(g.state ?? '');
  return (
    `<div class="s-g" data-open="${i}">` +
    `<div class="s-g-teams">${sideRow(reg, g.away, live)}${sideRow(reg, g.home, live)}</div>` +
    `<div class="s-g-status">${statusCell(g)}</div>${IC_CHEV}</div>`
  );
}

function linescoreTable(reg: ImgReg, g: GameLike): string {
  const labels = g.periodLabels ?? [];
  const a = g.away?.linescores ?? [];
  const h = g.home?.linescores ?? [];
  if (!labels.length || (!a.length && !h.length)) return '';
  const head =
    `<tr><th class="tm"></th>` +
    labels.map((l) => `<th>${esc(clip(l, 3))}</th>`).join('') +
    `<th class="tot">T</th></tr>`;
  const row = (side: SideLike | undefined, cells: number[]) => {
    const s = side ?? {};
    const li = reg.idx(s.logo);
    const logo = li >= 0 ? `<img data-img="${li}" alt="">` : '';
    const tds = labels.map((_, k) => `<td>${cells[k] ?? '-'}</td>`).join('');
    return `<tr><td class="tm">${logo}<b>${esc(clip(s.abbr ?? '', 4))}</b></td>${tds}<td class="tot">${s.score ?? '-'}</td></tr>`;
  };
  return `<div class="s-sec"><div class="s-sec-h">Scoring</div><table class="s-ls">${head}${row(g.away, a)}${row(g.home, h)}</table></div>`;
}

function leadersBlock(g: GameLike, leaders: LeaderLike[] | undefined): string {
  const list = (leaders ?? []).filter((l) => l.name);
  if (!list.length) return '';
  const rows = list
    .slice(0, 6)
    .map(
      (l) =>
        `<div class="s-ld-row"><span class="s-ld-cat">${esc(clip(l.cat ?? '', 8))}</span>` +
        `<span class="s-ld-nm">${esc(clip(l.name ?? '', 26))}</span>` +
        (l.team ? `<span class="s-ld-tm">${esc(clip(l.team, 4))}</span>` : '') +
        `<span class="s-ld-v">${esc(clip(l.value ?? '', 22))}</span></div>`,
    )
    .join('');
  return `<div class="s-sec"><div class="s-sec-h">Game leaders</div><div class="s-ld">${rows}</div></div>`;
}

function infoBlock(g: GameLike): string {
  const rows: string[] = [];
  if (g.odds) rows.push(`<div class="s-kv-row">${IC_TROPHY}<span class="s-kv-k">Line</span><span class="s-kv-v">${esc(clip(g.odds, 40))}${g.overUnder ? ' · O/U ' + esc(clip(g.overUnder, 8)) : ''}</span></div>`);
  if (g.broadcast) rows.push(`<div class="s-kv-row">${IC_TV}<span class="s-kv-k">TV</span><span class="s-kv-v">${esc(clip(g.broadcast, 36))}</span></div>`);
  if (g.venue) rows.push(`<div class="s-kv-row">${IC_PIN}<span class="s-kv-k">Venue</span><span class="s-kv-v">${esc(clip(g.venue, 40))}</span></div>`);
  if (g.dateShort || g.when) rows.push(`<div class="s-kv-row">${IC_CAL}<span class="s-kv-k">When</span><span class="s-kv-v">${esc(clip([g.dateShort, g.when].filter(Boolean).join(' · '), 40))}</span></div>`);
  if (!rows.length) return '';
  return `<div class="s-sec"><div class="s-sec-h">Details</div><div class="s-kv">${rows.join('')}</div></div>`;
}

function winProbBlock(g: GameLike): string {
  const h = g.homeWinPct;
  if (h === undefined || !(g.state === 'in')) return '';
  const hp = Math.max(2, Math.min(98, Math.round(h)));
  const ap = 100 - hp;
  return (
    `<div class="s-sec"><div class="s-sec-h">Win probability</div><div class="s-wp">` +
    `<div class="s-wp-bar"><span class="s-wp-a" style="width:${ap}%"></span><span class="s-wp-h" style="width:${hp}%"></span></div>` +
    `<div class="s-wp-lb"><span class="a">${esc(g.away?.abbr ?? 'Away')} ${ap}%</span><span class="h">${esc(g.home?.abbr ?? 'Home')} ${hp}%</span></div>` +
    `</div></div>`
  );
}

function matchupHeader(reg: ImgReg, g: GameLike): string {
  const live = LIVE.has(g.state ?? '');
  const post = g.state === 'post';
  const showScore = live || post;
  const al = reg.idx(g.away?.logo);
  const hl = reg.idx(g.home?.logo);
  const alogo = al >= 0 ? `<img class="s-mlogo" data-img="${al}" alt="">` : '<span class="s-mlogo"></span>';
  const hlogo = hl >= 0 ? `<img class="s-mlogo" data-img="${hl}" alt="">` : '<span class="s-mlogo"></span>';
  let mid: string;
  if (showScore) {
    const statCls = live ? 'live' : 'final';
    mid =
      `<div class="s-mscore">${g.away?.score ?? 0}<span class="sep">-</span>${g.home?.score ?? 0}</div>` +
      `<div class="s-mstat ${statCls}">${esc(clip(g.statusDetail ?? (live ? 'Live' : 'Final'), 22))}</div>`;
  } else {
    mid =
      `<div class="s-mkick">${esc(clip(g.when ?? 'TBD', 12))}</div>` +
      `<div class="s-mstat pre">${esc(clip(g.dateShort ?? 'Scheduled', 18))}</div>`;
  }
  return (
    `<div class="s-match">` +
    `<div class="s-mteam">${alogo}<span class="s-mab">${esc(clip(g.away?.abbr ?? '', 4))}</span>${g.away?.record ? `<span class="s-mrec">${esc(clip(g.away.record, 10))}</span>` : ''}</div>` +
    `<div class="s-mid">${mid}</div>` +
    `<div class="s-mteam">${hlogo}<span class="s-mab">${esc(clip(g.home?.abbr ?? '', 4))}</span>${g.home?.record ? `<span class="s-mrec">${esc(clip(g.home.record, 10))}</span>` : ''}</div>` +
    `</div>`
  );
}

/** Detail view body (inside the mini-app OR as a standalone game card). */
function detailBody(reg: ImgReg, g: GameLike, leaders?: LeaderLike[]): string {
  return (
    matchupHeader(reg, g) +
    `<div class="s-rule"></div>` +
    winProbBlock(g) +
    linescoreTable(reg, g) +
    leadersBlock(g, leaders) +
    infoBlock(g) +
    (g.note ? `<div class="s-note">${esc(clip(g.note, 240))}</div>` : '')
  );
}

/**
 * THE HERO — a native scoreboard feed. Each game is tappable; the tap opens an in-card detail view
 * (matchup, score-by-period, leaders, odds, win probability) with a Back button. No window opens.
 */
export function scoreboardCard(data: {
  league?: string;
  title: string;
  trailing?: string;
  games: GameLike[];
  leadersByGame?: Record<string, LeaderLike[]>;
  emptyHint?: string;
}): string {
  return guarded(() => {
    const badge = data.league ? data.league.toUpperCase() : undefined;
    const all = Array.isArray(data.games) ? data.games : [];
    if (all.length === 0) {
      const body =
        headerHtml(data.title, data.trailing, badge) +
        `<div class="s-empty"><b>No games</b><span>${esc(clip(data.emptyHint ?? 'No games on the schedule for that day.', 96))}</span></div>`;
      return packCustom(body, 122);
    }

    // Build rich, then step display count down until the glance fits under the host cap.
    const steps = [Math.min(all.length, 12), 9, 7, 5, 4, 3];
    let chosen = '';
    for (const n of steps) {
      const reg = new ImgReg();
      const games = all.slice(0, n);
      const rows = games.map((g, i) => gameRow(reg, g, i)).join('');
      const overflow = all.length - games.length;
      const more = overflow > 0 ? `<div class="s-note">+${overflow} more game${overflow === 1 ? '' : 's'} not shown</div>` : '';
      const home = `<div class="s-view" data-view="home">${headerHtml(data.title, data.trailing ?? `${all.length} game${all.length === 1 ? '' : 's'}`, badge)}<div class="s-list">${rows}</div>${more}</div>`;
      const details = games
        .map((g, i) => {
          const leaders = data.leadersByGame?.[g.id ?? ''] ?? [];
          return (
            `<div class="s-view s-detail" data-view="g-${i}" style="display:none">` +
            `<div class="s-dbar"><span class="s-back" data-back>${IC_BACK}Scores</span><span class="s-dbar-tr">${esc((g.away?.abbr ?? '') + ' @ ' + (g.home?.abbr ?? ''))}</span></div>` +
            `<div class="s-scroll">${detailBody(reg, g, leaders)}</div></div>`
          );
        })
        .join('');
      const card = packCustom(reg.script() + home + details + IMG_HYDRATE + NAV_SCRIPT, 420);
      chosen = card;
      if (glanceLen(card) <= GLANCE_CAP) break;
    }
    return chosen;
  }, 'Scores');
}

/** Standalone game detail — for "how did the X game go / what's the score of Y". */
export function gameCard(data: { league?: string; game: GameLike; leaders?: LeaderLike[] }): string {
  return guarded(() => {
    const reg = new ImgReg();
    const g = data.game ?? {};
    const badge = (data.league ?? g.league)?.toUpperCase();
    const body =
      headerHtml(`${g.away?.abbr ?? ''} @ ${g.home?.abbr ?? ''}`, g.statusShort, badge) +
      `<div class="s-scroll">${detailBody(reg, g, data.leaders)}</div>`;
    return packCustom(reg.script() + body + IMG_HYDRATE, 420);
  }, 'Scores');
}

/* ─────────────────────────────────── team ─────────────────────────────────── */

export function teamCard(data: { team: TeamCardLike }): string {
  return guarded(() => {
    const reg = new ImgReg();
    const t = data.team ?? {};
    const badge = t.league?.toUpperCase();
    const li = reg.idx(t.logo);
    const logo = li >= 0 ? `<img class="s-team-logo" data-img="${li}" alt="">` : '<span class="s-team-logo"></span>';
    const rows: string[] = [];
    if (t.standing) rows.push(`<div class="s-kv-row">${IC_TROPHY}<span class="s-kv-k">Standing</span><span class="s-kv-v">${esc(clip(t.standing, 44))}</span></div>`);
    if (t.nextGame) rows.push(`<div class="s-kv-row">${IC_CAL}<span class="s-kv-k">Next</span><span class="s-kv-v">${esc(clip(t.nextGame, 44))}</span></div>`);
    if (t.lastGame) rows.push(`<div class="s-kv-row">${IC_CHEV}<span class="s-kv-k">Last</span><span class="s-kv-v">${esc(clip(t.lastGame, 44))}</span></div>`);
    const detail = rows.length ? `<div class="s-sec"><div class="s-kv">${rows.join('')}</div></div>` : '';
    const url = httpsUrl(t.url);
    const btn = url ? `<div class="s-ft"><span class="s-ft-l">${IC_PIN}ESPN</span><a class="s-btn" href="${esc(url)}" data-k-link>${IC_EXT}Team page</a></div>` : '';
    const body =
      headerHtml('Team', undefined, badge) +
      `<div class="s-team-hero">${logo}<div class="s-team-m">` +
      `<div class="s-team-nm">${esc(clip(t.name ?? 'Team', 30))}</div>` +
      (t.division ? `<div class="s-team-sub">${esc(clip(t.division, 40))}</div>` : '') +
      (t.record ? `<div class="s-team-rec">${esc(clip(t.record, 24))}</div>` : '') +
      `</div></div><div class="s-rule"></div>${detail}${btn}`;
    return packCustom(reg.script() + body + IMG_HYDRATE, 150 + rows.length * 26 + (url ? 40 : 0));
  }, 'Team');
}

/* ─────────────────────────────────── standings ─────────────────────────────────── */

export function standingsCard(data: { league?: string; title: string; rows: StandingRowLike[]; extraLabel?: string; emptyHint?: string }): string {
  return guarded(() => {
    const badge = data.league?.toUpperCase();
    const all = Array.isArray(data.rows) ? data.rows : [];
    if (!all.length) {
      const body = headerHtml(data.title, undefined, badge) + `<div class="s-empty"><b>No standings</b><span>${esc(clip(data.emptyHint ?? 'Standings unavailable.', 90))}</span></div>`;
      return packCustom(body, 122);
    }
    const reg = new ImgReg();
    const steps = [Math.min(all.length, 16), 12, 10, 8, 6];
    let chosen = '';
    for (const n of steps) {
      reg.arr = [];
      (reg as any).map = new Map();
      const rows = all.slice(0, n);
      const extraLabel = data.extraLabel ?? 'STRK';
      const hd = `<div class="s-st-hd"><span class="s-st-rk"></span><span style="flex:1"></span><span class="s-st-col wl">W-L</span><span class="s-st-col">PCT</span><span class="s-st-col sub">${esc(clip(extraLabel, 6))}</span></div>`;
      const body_rows = rows
        .map((r) => {
          const li = reg.idx(r.logo);
          const logo = li >= 0 ? `<img class="s-st-logo" data-img="${li}" alt="">` : '<span class="s-st-logo"></span>';
          const wl = `${r.wins ?? 0}-${r.losses ?? 0}`;
          return (
            `<div class="s-st-row"><span class="s-st-rk">${r.rank ?? ''}</span>${logo}` +
            `<span class="s-st-nm">${esc(clip(r.name ?? r.abbr ?? '', 24))}</span>` +
            `<span class="s-st-col wl">${esc(wl)}</span>` +
            `<span class="s-st-col">${esc(clip(r.pct ?? '', 6))}</span>` +
            `<span class="s-st-col sub">${esc(clip(r.extra ?? '', 6))}</span></div>`
          );
        })
        .join('');
      const overflow = all.length - rows.length;
      const more = overflow > 0 ? `<div class="s-note">+${overflow} more</div>` : '';
      const body = headerHtml(data.title, `${all.length} teams`, badge) + `<div class="s-st">${hd}${body_rows}</div>${more}`;
      const card = packCustom(reg.script() + body + IMG_HYDRATE, Math.min(64 + rows.length * 38, 420));
      chosen = card;
      if (glanceLen(card) <= GLANCE_CAP) break;
    }
    return chosen;
  }, 'Standings');
}

/* ─────────────────────────────────── schedule ─────────────────────────────────── */

export function scheduleCard(data: { league?: string; title: string; trailing?: string; games: GameLike[]; emptyHint?: string }): string {
  return guarded(() => {
    const badge = data.league?.toUpperCase();
    const all = Array.isArray(data.games) ? data.games : [];
    if (!all.length) {
      const body = headerHtml(data.title, data.trailing, badge) + `<div class="s-empty"><b>No games</b><span>${esc(clip(data.emptyHint ?? 'Nothing scheduled.', 90))}</span></div>`;
      return packCustom(body, 122);
    }
    const reg = new ImgReg();
    const steps = [Math.min(all.length, 10), 8, 6, 5, 4];
    let chosen = '';
    for (const n of steps) {
      reg.arr = [];
      (reg as any).map = new Map();
      const games = all.slice(0, n);
      const rows = games
        .map((g) => {
          const al = reg.idx(g.away?.logo);
          const hl = reg.idx(g.home?.logo);
          const alogo = al >= 0 ? `<img data-img="${al}" alt="">` : '';
          const hlogo = hl >= 0 ? `<img data-img="${hl}" alt="">` : '';
          const played = g.state === 'post';
          const when = played
            ? `<span class="s-se-t">${esc(clip(g.statusShort ?? 'Final', 12))}</span><span class="s-se-d">${g.away?.score ?? ''}-${g.home?.score ?? ''}</span>`
            : `<span class="s-se-t">${esc(clip(g.when ?? 'TBD', 10))}</span><span class="s-se-d">${esc(clip(g.dateShort ?? '', 14))}</span>`;
          return (
            `<div class="s-se"><div class="s-se-mt">${alogo}<span class="s-se-ab">${esc(clip(g.away?.abbr ?? '', 4))}</span>` +
            `<span class="s-se-at">@</span>${hlogo}<span class="s-se-ab">${esc(clip(g.home?.abbr ?? '', 4))}</span></div>` +
            `<div class="s-se-when">${when}</div></div>`
          );
        })
        .join('');
      const overflow = all.length - games.length;
      const more = overflow > 0 ? `<div class="s-note">+${overflow} more</div>` : '';
      const body = headerHtml(data.title, data.trailing ?? `${all.length} game${all.length === 1 ? '' : 's'}`, badge) + `<div class="s-sch">${rows}</div>${more}`;
      const card = packCustom(reg.script() + body + IMG_HYDRATE, Math.min(56 + games.length * 46, 420));
      chosen = card;
      if (glanceLen(card) <= GLANCE_CAP) break;
    }
    return chosen;
  }, 'Schedule');
}

/* ─────────────────────────────────── player ─────────────────────────────────── */

export function playerCard(data: { league?: string; player: PlayerLike }): string {
  return guarded(() => {
    const reg = new ImgReg();
    const p = data.player ?? {};
    const badge = data.league?.toUpperCase();
    const hi = reg.idx(p.headshot);
    const hs = hi >= 0 ? `<img class="s-pl-hs" data-img="${hi}" alt="">` : '<span class="s-pl-hs"></span>';
    const subBits = [p.position, p.jersey ? '#' + p.jersey : undefined, p.team].filter(Boolean).map((x) => esc(clip(String(x), 22)));
    const stats = (p.stats ?? []).slice(0, 6);
    const statHtml = stats.length
      ? `<div class="s-stats">${stats.map((s) => `<div class="s-stat"><div class="s-stat-v">${esc(clip(s.v, 10))}</div><div class="s-stat-k">${esc(clip(s.k, 12))}</div></div>`).join('')}</div>`
      : '';
    const url = httpsUrl(p.url);
    const btn = url ? `<div class="s-ft"><span class="s-ft-l">${IC_PIN}ESPN</span><a class="s-btn" href="${esc(url)}" data-k-link>${IC_EXT}Full stats</a></div>` : '';
    const body =
      headerHtml('Player', undefined, badge) +
      `<div class="s-pl-hero">${hs}<div class="s-pl-m"><div class="s-pl-nm">${esc(clip(p.name ?? 'Player', 28))}</div>` +
      `<div class="s-pl-sub">${subBits.length ? '<span class="s-pl-badge">' + subBits[0] + '</span>' : ''}${subBits.slice(1).map((b) => `<span>${b}</span>`).join('')}</div>` +
      `</div></div><div class="s-rule"></div>${statHtml}${btn}`;
    return packCustom(reg.script() + body + IMG_HYDRATE, 150 + (stats.length ? Math.ceil(stats.length / 3) * 58 : 0) + (url ? 40 : 0));
  }, 'Player');
}

/* ─────────────────────────────────── news ─────────────────────────────────── */

export function newsCard(data: { league?: string; title: string; items: NewsLike[]; emptyHint?: string }): string {
  return guarded(() => {
    const badge = data.league?.toUpperCase();
    const list = (Array.isArray(data.items) ? data.items : []).filter((n) => n.headline);
    if (!list.length) {
      const body = headerHtml(data.title, undefined, badge) + `<div class="s-empty"><b>No news</b><span>${esc(clip(data.emptyHint ?? 'No headlines right now.', 90))}</span></div>`;
      return packCustom(body, 122);
    }
    const visible = list.slice(0, 6);
    const rows = visible
      .map((n) => {
        const href = httpsUrl(n.url);
        const tag = href ? 'a' : 'div';
        const attr = href ? ` href="${esc(href)}" data-k-link` : '';
        const sub = [n.source, n.when].filter(Boolean).join(' · ');
        return (
          `<${tag} class="s-nw"${attr}><div class="s-nw-m"><div class="s-nw-t">${esc(clip(n.headline ?? '', 130))}</div>` +
          (sub ? `<div class="s-nw-s">${esc(clip(sub, 40))}</div>` : '') +
          `</div>${href ? IC_CHEV : ''}</${tag}>`
        );
      })
      .join('');
    const body = headerHtml(data.title, `${list.length} stories`, badge) + `<div class="s-news">${rows}</div>`;
    return packCustom(body, Math.min(52 + visible.length * 58, 420));
  }, 'News');
}

/* ─────────────────────────────────── team hub (tabbed, Google-style) ─────────────────────────────────── */

export interface HubPlayerLike {
  name?: string;
  pos?: string;
  jersey?: string;
  url?: string;
}
export interface TeamHubLike {
  league?: string;
  name?: string;
  logo?: string;
  color?: string; // brand hex (no #)
  record?: string;
  standing?: string;
  recent?: GameLike[];
  upcoming?: GameLike[];
  standings?: StandingRowLike[];
  standingsTitle?: string;
  teamAbbr?: string;
  players?: HubPlayerLike[];
  url?: string;
}

function hubGameRow(reg: ImgReg, g: GameLike, i: number): string {
  const al = reg.idx(g.away?.logo);
  const hl = reg.idx(g.home?.logo);
  const alogo = al >= 0 ? `<img data-img="${al}" alt="">` : '';
  const hlogo = hl >= 0 ? `<img data-img="${hl}" alt="">` : '';
  const played = g.state === 'post';
  const live = LIVE.has(g.state ?? '');
  const aLose = played && g.away?.winner === false ? ' lose' : '';
  const hLose = played && g.home?.winner === false ? ' lose' : '';
  const awayScore = played || live ? `<span class="s-hg-sc${aLose}">${g.away?.score ?? 0}</span>` : '';
  const homeScore = played || live ? `<span class="s-hg-sc${hLose}">${g.home?.score ?? 0}</span>` : '';
  const when = played || live
    ? `<div class="s-hg-when"><span class="s-hg-w1">${esc(clip(g.statusShort ?? (live ? 'LIVE' : 'Final'), 10))}</span><span class="s-hg-w2">${esc(clip(g.dateShort ?? '', 12))}</span></div>`
    : `<div class="s-hg-when"><span class="s-hg-w1">${esc(clip(g.when ?? 'TBD', 10))}</span><span class="s-hg-w2">${esc(clip(g.dateShort ?? '', 12))}</span></div>`;
  return (
    `<div class="s-hg" data-open="${i}"><div class="s-hg-teams">` +
    `<div class="s-hg-r">${alogo}<span class="s-hg-ab">${esc(clip(g.away?.abbr ?? '', 4))}</span><span class="s-hg-nm">${esc(clip(g.away?.name ?? '', 16))}</span>${awayScore}</div>` +
    `<div class="s-hg-r">${hlogo}<span class="s-hg-ab">${esc(clip(g.home?.abbr ?? '', 4))}</span><span class="s-hg-nm">${esc(clip(g.home?.name ?? '', 16))}</span>${homeScore}</div>` +
    `</div>${when}${IC_CHEV}</div>`
  );
}

/** THE TEAM HUB — a native, Google-style team card: brand-colored header + GAMES / STANDINGS /
 * PLAYERS tabs. GAMES lists upcoming + recent (with scores), each tappable into a box-score detail.
 * A tab bar and an in-card router keep it all in one card. */
export function teamHubCard(data: { hub: TeamHubLike }): string {
  return guarded(() => {
    const h = data.hub ?? {};
    const badge = h.league?.toUpperCase();
    const color = h.color && /^[0-9a-fA-F]{6}$/.test(h.color) ? `#${h.color}` : '#242426';
    // build rich, step down item counts until the glance fits under the host cap
    const steps: [number, number, number][] = [[5, 4, 8], [4, 3, 6], [3, 2, 6], [3, 2, 4]];
    let chosen = '';
    for (const [nUp, nRec, nSt] of steps) {
      const card = buildHub(h, badge, color, nUp, nRec, nSt);
      chosen = card;
      if (glanceLen(card) <= GLANCE_CAP) break;
    }
    return chosen;
  }, 'Team');
}

function buildHub(h: TeamHubLike, badge: string | undefined, color: string, nUp: number, nRec: number, nSt: number): string {
  {
    const reg = new ImgReg();
    const li = reg.idx(h.logo);
    const logo = li >= 0 ? `<img class="s-hub-logo" data-img="${li}" alt="">` : '<span class="s-hub-logo"></span>';

    // build the game list (upcoming first, then recent), shared index for detail views
    const upcoming = (h.upcoming ?? []).slice(0, nUp);
    const recent = (h.recent ?? []).slice(0, nRec);
    const allGames = [...upcoming, ...recent];
    const gamesRows =
      (upcoming.length ? `<div class="s-glabel">Upcoming</div>` + upcoming.map((g, i) => hubGameRow(reg, g, i)).join('') : '') +
      (recent.length ? `<div class="s-glabel">Recent results</div>` + recent.map((g, i) => hubGameRow(reg, g, upcoming.length + i)).join('') : '') ||
      `<div class="s-empty"><b>No games</b><span>Schedule unavailable right now.</span></div>`;

    // standings tab
    const stRows = (h.standings ?? []).slice(0, nSt);
    const standingsHtml = stRows.length
      ? `<div class="s-st">${stRows
          .map((r) => {
            const sli = reg.idx(r.logo);
            const slogo = sli >= 0 ? `<img class="s-st-logo" data-img="${sli}" alt="">` : '<span class="s-st-logo"></span>';
            const me = h.teamAbbr && r.abbr === h.teamAbbr ? ' style="background:rgba(18,183,106,.12)"' : '';
            return (
              `<div class="s-st-row"${me}><span class="s-st-rk">${r.rank ?? ''}</span>${slogo}` +
              `<span class="s-st-nm">${esc(clip(r.name ?? r.abbr ?? '', 22))}</span>` +
              `<span class="s-st-col wl">${r.wins ?? 0}-${r.losses ?? 0}</span>` +
              `<span class="s-st-col">${esc(clip(r.pct ?? '', 6))}</span></div>`
            );
          })
          .join('')}</div>`
      : `<div class="s-empty"><b>No standings</b><span>Standings unavailable.</span></div>`;

    // players tab
    const players = (h.players ?? []).slice(0, 10);
    const playersHtml = players.length
      ? `<div class="s-pl-list">${players
          .map((p) => {
            const href = httpsUrl(p.url);
            const tag = href ? 'a' : 'div';
            const attr = href ? ` href="${esc(href)}" data-k-link` : '';
            const sub = [p.pos, p.jersey ? '#' + p.jersey : ''].filter(Boolean).join(' · ');
            return (
              `<${tag} class="s-plr"${attr}><span class="s-plr-jr">${esc(clip(p.jersey ?? '-', 3))}</span>` +
              `<div class="s-plr-m"><div class="s-plr-nm">${esc(clip(p.name ?? '', 26))}</div>` +
              (sub ? `<div class="s-plr-pos">${esc(clip(sub, 24))}</div>` : '') +
              `</div>${href ? IC_CHEV : ''}</${tag}>`
            );
          })
          .join('')}</div>`
      : `<div class="s-empty"><b>No roster</b><span>Roster unavailable.</span></div>`;

    const header =
      `<div class="s-hub-hd" style="background:linear-gradient(180deg,${color}dd,${color}44)">${logo}` +
      `<div class="s-hub-m"><div class="s-hub-nm">${esc(clip(h.name ?? 'Team', 28))}</div>` +
      `<div class="s-hub-sub">${esc(clip([h.record, h.standing].filter(Boolean).join(' · ') || (badge ?? ''), 46))}</div></div></div>`;
    const tabs =
      `<div class="s-tabs"><span class="s-tab active" data-tab="games">Games</span>` +
      `<span class="s-tab" data-tab="standings">Standings</span><span class="s-tab" data-tab="players">Players</span></div>`;
    const home =
      `<div class="s-view" data-view="home">${header}${tabs}` +
      `<div class="s-tabview" data-tabview="games">${gamesRows}</div>` +
      `<div class="s-tabview" data-tabview="standings" style="display:none">${standingsHtml}</div>` +
      `<div class="s-tabview" data-tabview="players" style="display:none">${playersHtml}</div></div>`;
    const details = allGames
      .map((g, i) => {
        return (
          `<div class="s-view s-detail" data-view="g-${i}" style="display:none">` +
          `<div class="s-dbar"><span class="s-back" data-back>${IC_BACK}${esc(clip(h.name ?? 'Back', 16))}</span><span class="s-dbar-tr">${esc((g.away?.abbr ?? '') + ' @ ' + (g.home?.abbr ?? ''))}</span></div>` +
          `<div class="s-scroll">${detailBody(reg, g)}</div></div>`
        );
      })
      .join('');
    return packCustom(reg.script() + home + details + IMG_HYDRATE + HUB_SCRIPT, 420);
  }
}

/* ─────────────────────────────────── error ─────────────────────────────────── */

export function errorCard(data: { spoken?: string }): string {
  return guarded(() => {
    const body =
      headerHtml(TITLE, 'Error') +
      `<div class="s-empty"><b>Something went wrong</b><span>${esc(clip(str(data.spoken) ?? 'Could not complete that request.', 200))}</span></div>`;
    return packCustom(body, 132);
  }, 'Error');
}
