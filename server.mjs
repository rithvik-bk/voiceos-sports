// widgetKit.ts
var WIDGET_KIT_LIMITS = {
  maxHtmlBytes: 131072,
  minHeight: 60,
  maxHeight: 420,
  defaultHeight: 180,
  confirmReserveHeight: 44,
  surfaceRadius: 26
};
var ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
function esc(value) {
  if (value === null || value === undefined)
    return "";
  return String(value).replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").replace(/[&<>"']/g, (char) => ESCAPES[char]);
}
function clip(value, max) {
  const text = value === null || value === undefined ? "" : String(value).trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}
var byteLength = (value) => new TextEncoder().encode(value).length;
var block = (html, h) => ({ html, h });
var MAX_IMAGE_BYTES = 32768;
function safeImage(src) {
  if (typeof src !== "string")
    return null;
  const trimmed = src.trim();
  if (!/^data:image\//i.test(trimmed))
    return null;
  return trimmed.length <= MAX_IMAGE_BYTES ? trimmed : null;
}
var INTEGRATION_MARK = "data:image/png;base64,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";
function setIntegrationMark(dataUri) {
  INTEGRATION_MARK = safeImage(dataUri) ?? "";
}
function markSlot(o) {
  const src = safeImage(o.icon) || INTEGRATION_MARK;
  const inner = src ? `<img class="k-mk-i" src="${esc(src)}" alt="">` : o.mark === false ? "" : `<i class="k-dot"></i>`;
  return `<span class="k-mk" data-k-mk>${inner}</span>`;
}
function vHeader(o) {
  const mark = markSlot(o);
  const trailing = o.trailing ? `<span class="k-hd-tr">${esc(clip(o.trailing, 28))}</span>` : "";
  const subtitle = o.subtitle ? `<div class="k-hd-sub">${esc(clip(o.subtitle, 64))}</div>` : "";
  return block(`<div class="k-hd"><div class="k-hd-l">${mark}<span class="k-hd-t">${esc(clip(o.title, 40))}</span></div>${trailing}</div>${subtitle}`, o.subtitle ? 36 : 20);
}
var CSS = `*{box-sizing:border-box;margin:0;padding:0;scrollbar-width:none}
/* No scrollbar chrome, EVER — on the document or on anything an author makes
   scrollable inside it. A card is glanced at on black glass; a scrollbar is
   desktop-browser furniture that instantly breaks that. This is the same
   rule the notch window applies to itself, mirrored here because the host's
   CSS cannot reach into the sandbox. Content stays scrollable (wheel,
   trackpad, drag) — only the bar is gone. */
::-webkit-scrollbar{display:none}
:root{--ink-1:rgba(255,255,255,.95);--ink-2:rgba(255,255,255,.72);--ink-3:rgba(255,255,255,.5);--ink-4:rgba(255,255,255,.42);--line:rgba(255,255,255,.08);--fill-1:rgba(255,255,255,.06);--fill-2:rgba(255,255,255,.1);--track:rgba(255,255,255,.12);--good:#30d158;--bad:#ff453a;--accent:#3987e5;--k-radius:26px;color-scheme:dark}
html[data-k-theme=light]{--ink-1:rgba(0,0,0,.92);--ink-2:rgba(0,0,0,.66);--ink-3:rgba(0,0,0,.46);--ink-4:rgba(0,0,0,.38);--line:rgba(0,0,0,.09);--fill-1:rgba(0,0,0,.04);--fill-2:rgba(0,0,0,.07);--track:rgba(0,0,0,.1);color-scheme:light;--accent:var(--accent-light,#2563c9)}
/* A body background PROPAGATES to the frame canvas — a transparent root does
   not stop that; per spec the canvas takes body's background when the root
   has none. So an author's \`body{background:#111}\` fills the whole frame,
   square and full-height, which is the right outcome: every host clips the
   frame at the card arc, so the fill meets the corner exactly. The one trap
   is repeat — the canvas tiles a gradient sized to a short body, so any
   gradient put on body must say no-repeat (the kit's accent wash does). */
body{font:13.5px/1.45 -apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",system-ui,sans-serif;color:var(--ink-1);background:transparent;border-radius:var(--k-radius);-webkit-font-smoothing:antialiased}
.k-wrap{padding:13px 15px 14px;display:flex;flex-direction:column;gap:10px;border-radius:var(--k-radius)}
.k-wrap.k-confirm{padding-bottom:52px}
.k-num{font-variant-numeric:tabular-nums;font-feature-settings:"tnum"}
.k-hd{display:flex;align-items:center;justify-content:space-between;gap:10px}
.k-hd-l{display:flex;align-items:center;gap:7px;min-width:0}
.k-dot{width:6px;height:6px;border-radius:50%;background:var(--accent);flex:none}
.k-mk{display:flex;align-items:center;flex:none}
.k-mk:empty{display:none}
.k-mk-i{width:15px;height:15px;border-radius:4px;object-fit:contain;display:block}
.k-hd-t{font-size:11px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--ink-3);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.k-hd-tr{font-size:11px;color:var(--ink-4);white-space:nowrap;flex:none}
.k-hd-sub{font-size:14.5px;font-weight:590;letter-spacing:-.01em;margin-top:-4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.k-list{display:flex;flex-direction:column}
.k-rw{display:flex;align-items:center;gap:10px;padding:7px 0;border-top:1px solid var(--line);text-decoration:none;color:inherit;min-width:0}
.k-rw:first-child{border-top:0;padding-top:1px}
a.k-rw{cursor:pointer}
a.k-rw:hover .k-rw-t{color:var(--accent)}
.k-rw-img{width:32px;height:32px;border-radius:6px;object-fit:cover;flex:none;background:var(--fill-1)}
.k-rw-m{min-width:0;flex:1}
.k-rw-t{font-size:14px;font-weight:590;letter-spacing:-.01em;line-height:1.25;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.k-rw-sub{font-size:11.5px;color:var(--ink-3);line-height:1.35;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.k-rw-tr{text-align:right;flex:none;display:flex;flex-direction:column;align-items:flex-end}
.k-rw-tr .k-num{font-size:12px;color:var(--ink-2)}
.k-rw-trs{font-size:10px;color:var(--ink-4);line-height:1.2}
.k-more{font-size:11px;color:var(--ink-4);padding-top:7px;border-top:1px solid var(--line)}
.k-chip{font-size:10.5px;font-weight:600;letter-spacing:.02em;padding:2px 7px;border-radius:999px;background:var(--fill-1);white-space:nowrap;flex:none}
.k-bdg{display:flex;gap:6px;flex-wrap:wrap}
.k-sts{display:flex;gap:18px}
.k-sts.k-ruled{padding-top:9px;border-top:1px solid var(--line)}
.k-st{min-width:0}
.k-st-v{font-size:24px;font-weight:600;letter-spacing:-.02em;line-height:1.1;font-variant-numeric:tabular-nums;white-space:nowrap}
.k-st-d{font-size:11px;font-weight:500;color:var(--ink-3);margin-left:5px;letter-spacing:0}
.k-st-l{font-size:11px;color:var(--ink-3);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.k-kvs{display:flex;flex-direction:column;gap:0}
.k-kv{display:flex;align-items:baseline;justify-content:space-between;gap:14px;padding:3px 0}
.k-kv-l{font-size:12.5px;color:var(--ink-3);white-space:nowrap}
.k-kv-v{font-size:12.5px;color:var(--ink-1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right}
.k-bars{display:flex;align-items:flex-end;gap:6px;height:72px}
.k-bar{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;min-width:0}
.k-bar-c{width:100%;height:56px;display:flex;align-items:flex-end;justify-content:center;position:relative}
.k-bar-f{width:100%;background:var(--fill-2);border-radius:4px 4px 2px 2px}
.k-bar-f.k-on{background:var(--accent)}
.k-bar-v{position:absolute;top:-2px;font-size:10px;font-weight:600;color:var(--ink-2);font-variant-numeric:tabular-nums}
.k-bar-l{font-size:10px;color:var(--ink-4);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
.k-spk{width:100%;height:32px;display:block;overflow:visible}
.k-spk-x{display:flex;justify-content:space-between;font-size:10px;color:var(--ink-4);margin-top:4px;font-variant-numeric:tabular-nums}
.k-cap{font-size:10px;color:var(--ink-4);margin-top:4px}
.k-mt-h{display:flex;justify-content:space-between;gap:12px;font-size:11.5px;color:var(--ink-3);margin-bottom:6px}
.k-mt{height:5px;border-radius:5px;background:var(--track);overflow:hidden}
.k-mt-f{height:100%;border-radius:5px}
.k-hero{display:flex;align-items:center;gap:12px;min-width:0}
.k-hero-img{width:52px;height:52px;border-radius:8px;object-fit:cover;flex:none;background:var(--fill-1)}
.k-hero-m{min-width:0}
.k-hero-e{font-size:10px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:var(--ink-4)}
.k-hero-t{font-size:17px;font-weight:640;letter-spacing:-.02em;line-height:1.2;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.k-hero-s{font-size:12.5px;color:var(--ink-3);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.k-note{font-size:12.5px;line-height:1.4;color:var(--ink-2);overflow-wrap:anywhere;word-break:break-word}
.k-div{height:1px;background:var(--line);margin:4px 0}
.k-empty{text-align:center;padding:8px 0}
.k-empty-t{font-size:13px;color:var(--ink-3)}
.k-empty-h{font-size:11.5px;color:var(--ink-4);margin-top:3px}
.k-fld{display:block}
.k-fld-l{display:block;font-size:11px;color:var(--ink-3);margin-bottom:5px}
.k-in{width:100%;font:13px/1.4 inherit;color:var(--ink-1);background:var(--fill-1);border:1px solid var(--line);border-radius:7px;padding:7px 9px;outline:none;resize:none}
.k-in:focus{border-color:var(--accent)}
/* Custom-card shell (renderCustom): no padding, no gap, no layout opinion —
   the author owns the surface edge to edge. Only the confirm reserve, the
   floated mark, and the corner are the kit's.

   The corner is the kit's because it is not the author's to choose: the host
   cuts the card at --k-radius whatever this document says, so a surface drawn
   at any other radius shows a second edge inside the real one. Carrying it
   here means a card that paints a background or border on this element lands
   on the host's arc for free; a card that paints its own root still has
   var(--k-radius) to name. */
.k-cwrap{position:relative;border-radius:var(--k-radius)}
.k-cwrap.k-confirm{padding-bottom:52px}
.k-mkbar{position:absolute;top:11px;left:13px;z-index:9;display:flex}
/* ---- Surface finish (default-on) ----------------------------------------
   The liquid-glass rim: a 1px hairline with a brighter top edge, drawn as an
   INSET shadow on a fixed overlay so it (a) hugs the visible frame whatever
   height the content settles at, and (b) shares border-radius:var(--k-radius)
   with the host's clip — same arc, drawn inward, so it can neither gap nor
   get shaved by the cutout. This is the same rim recipe the notch's own
   chrome uses. */
.k-rim{position:fixed;inset:0;pointer-events:none;z-index:40;border-radius:var(--k-radius);box-shadow:inset 0 1px 0 rgba(255,255,255,.13),inset 0 0 0 1px rgba(255,255,255,.07)}
html[data-k-theme=light] .k-rim{box-shadow:inset 0 1px 0 rgba(255,255,255,.7),inset 0 0 0 1px rgba(0,0,0,.1)}
/* Brand presence (only when the integration declared an accent):
   a soft wash of the brand colour bleeding out of the top-left corner —
   colour the SURFACE, never the mark. The mark stays the bare glyph: a tile
   painted under the logo is chrome the icon didn't ask for, and it reads as
   the harness inventing a colour (see WIDGET_MARK_FLATTEN_HTML in ../ui.ts,
   which strips exactly that tile out of documents generated while the kit
   still drew one). color-mix degrades to no wash on engines without it. */
html[data-k-accent] body{background:radial-gradient(150% 120% at 0% 0%,color-mix(in srgb,var(--accent) 15%,transparent),transparent 44%) no-repeat}
html[data-k-theme=light][data-k-accent] body{background:radial-gradient(150% 120% at 0% 0%,color-mix(in srgb,var(--accent) 9%,transparent),transparent 44%) no-repeat}
/* The entrance is OPT-IN, never opt-out. Declaring \`animation: … both\` from
   opacity:0 and cancelling it under prefers-reduced-motion:reduce means any
   environment that doesn't actually run animations — a headless renderer, a
   paused compositor, a screenshotter — paints an invisible card and never
   recovers. Gating on no-preference makes the un-animated state the readable
   one, so the worst case is a card that simply appears. */
@media(prefers-reduced-motion:no-preference){
.k-wrap>*{animation:k-in .34s cubic-bezier(.22,.61,.36,1) both}
.k-wrap>*:nth-child(2){animation-delay:.04s}
.k-wrap>*:nth-child(3){animation-delay:.08s}
.k-wrap>*:nth-child(n+4){animation-delay:.12s}
}
@keyframes k-in{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:none}}`;
var JS = `(function(){
var send=function(m){try{parent.postMessage(m,'*')}catch(e){}};
var last=0;
var report=function(){
  /* Never report a collapsed measurement. A frame that is display:none, zero
     width, or in a hidden tab measures ~0, and since the host CLAMPS to 60 and
     we'd then consider that our last known height, one bad sample pins a
     277px card at 60px forever. Staying silent leaves the declared estimate
     in place, which is close to right by construction. */
  if(document.hidden)return;
  var el=document.documentElement;
  if(!el.offsetWidth)return;
  var h=Math.ceil(el.getBoundingClientRect().height);
  if(h<8)return;
  if(Math.abs(h-last)>1){last=h;send({type:'voiceos:resize',height:h})}
};
/* data-voiceos-key is the alias custom markup uses; data-k-key is what the
   kit's own vField emits. Same contract either way. */
var argKey=function(el){
  if(!el||!el.getAttribute)return null;
  return el.getAttribute('data-k-key')||el.getAttribute('data-voiceos-key');
};
addEventListener('message',function(e){
  var m=e.data;if(!m||m.type!=='voiceos:init')return;
  if(m.theme&&m.theme.mode)document.documentElement.setAttribute('data-k-theme',m.theme.mode);
  /* The corner the HOST will actually cut this card at. Same shape as the
     theme leg: the document ships with a correct default and the surface
     corrects it, so a card is never briefly drawn at the wrong radius and
     never depends on the host to send anything. Clamped because the value
     lands in CSS. */
  if(typeof m.radius==='number'&&isFinite(m.radius))document.documentElement.style.setProperty('--k-radius',Math.max(0,Math.min(48,m.radius))+'px');
  var args=m.args||{};
  var fields=document.querySelectorAll('[data-k-key],[data-voiceos-key]');
  for(var i=0;i<fields.length;i++){
    var key=argKey(fields[i]);
    if(Object.prototype.hasOwnProperty.call(args,key)&&args[key]!=null)fields[i].value=String(args[key]);
  }
  report();
});
document.addEventListener('input',function(e){
  var key=argKey(e.target);
  if(key)send({type:'voiceos:updateInput',key:key,value:e.target.value});
});
document.addEventListener('click',function(e){
  /* Routes BOTH the kit's data-k-link rows and plain <a href="https://…">
     anchors in custom markup out through the host. The sandbox blocks
     navigation anyway, so an unrouted anchor is a click that does nothing. */
  var el=e.target;
  while(el&&el!==document.body){
    if(el.getAttribute&&(el.hasAttribute('data-k-link')||(el.tagName==='A'&&el.hasAttribute('href')))){
      e.preventDefault();
      var href=el.getAttribute('href')||'';
      if(/^https:\\/\\//i.test(href))send({type:'voiceos:openUrl',url:href});
      return;
    }
    el=el.parentNode;
  }
});
if(window.ResizeObserver){new ResizeObserver(report).observe(document.documentElement)}
addEventListener('load',report);setTimeout(report,0);setTimeout(report,120);
})()`;
function safeColor(value) {
  if (typeof value !== "string")
    return null;
  const trimmed = value.trim();
  return /^#[0-9a-f]{3,8}$/i.test(trimmed) || /^(rgb|hsl)a?\([0-9a-z%.,\s/]+\)$/i.test(trimmed) ? trimmed : null;
}
var DARK_SURFACE = [10, 10, 12];
var LIGHT_SURFACE = [242, 242, 244];
var dropImages = (markup) => markup.replace(/<img\b(?![^>]*\bk-mk-i\b)[^>]*>/g, "");
function hexToRgb(hex) {
  const value = hex.replace("#", "");
  const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value.slice(0, 6);
  if (full.length !== 6 || /[^0-9a-f]/i.test(full))
    return null;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16)
  ];
}
var channel = (c) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
var luminance = ([r, g, b]) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
var contrast = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
var toHex = (rgb) => `#${rgb.map((c) => Math.round(Math.max(0, Math.min(255, c))).toString(16).padStart(2, "0")).join("")}`;
function repairAccent(hex, against) {
  const rgb = hexToRgb(hex);
  if (!rgb)
    return hex;
  const target = luminance(against);
  const lighten = target < 0.5;
  let current = [...rgb];
  for (let step = 0;step < 24; step++) {
    if (contrast(luminance(current), target) >= 3)
      break;
    current = current.map((c) => lighten ? c + (255 - c) * 0.12 : c * 0.88);
  }
  return toHex(current);
}
function rootAttributes(accent, theme) {
  const accentStyle = accent ? `--accent:${esc(repairAccent(accent, DARK_SURFACE))};--accent-light:${esc(repairAccent(accent, LIGHT_SURFACE))}` : "";
  return [
    theme ? ` data-k-theme="${theme}"` : "",
    accentStyle ? ` data-k-accent=""` : "",
    accentStyle ? ` style="${accentStyle}"` : ""
  ].join("");
}
function renderWidget(o) {
  const blocks = (o.blocks ?? []).filter((candidate) => Boolean(candidate) && typeof candidate.html === "string");
  const accent = safeColor(o.accent);
  const confirm = o.mode === "confirm";
  const marked = INTEGRATION_MARK && !blocks.some((b) => b.html.includes("data-k-mk")) ? [
    block(`<div class="k-hd-l">${markSlot({ title: "" })}</div>`, 17),
    ...blocks
  ] : blocks;
  const body = marked.map((b) => `<div>${b.html}</div>`).join("");
  const content = marked.reduce((sum, b) => sum + b.h, 0);
  const gaps = Math.max(0, marked.length - 1) * 10;
  const chrome = 27 + (confirm ? WIDGET_KIT_LIMITS.confirmReserveHeight - 14 : 0);
  const height = Math.max(WIDGET_KIT_LIMITS.minHeight, Math.min(WIDGET_KIT_LIMITS.maxHeight, Math.round(content + gaps + chrome)));
  const rootAttrs = rootAttributes(accent, o.theme);
  const compose = (inner) => `<!doctype html><html${rootAttrs}><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="k-wrap${confirm ? " k-confirm" : ""}">${inner}</div><div class="k-rim" aria-hidden="true"></div><script>${JS}</script></body></html>`;
  let kept = marked;
  let html = compose(body);
  if (byteLength(html) > WIDGET_KIT_LIMITS.maxHtmlBytes) {
    html = compose(dropImages(body));
  }
  while (byteLength(html) > WIDGET_KIT_LIMITS.maxHtmlBytes && kept.length > 1) {
    kept = kept.slice(0, -1);
    html = compose(dropImages(kept.map((b) => `<div>${b.html}</div>`).join("")));
  }
  return { html, height, label: o.label };
}
function renderCustom(o) {
  const body = typeof o.body === "string" ? o.body : "";
  const confirm = o.mode === "confirm";
  const rootAttrs = rootAttributes(safeColor(o.accent), o.theme);
  const authorCss = typeof o.css === "string" ? o.css.replace(/<\/style/gi, "<\\/style") : "";
  const markBar = body.includes("data-k-mk") ? "" : `<div class="k-mkbar">${markSlot({ title: "", mark: false })}</div>`;
  const compose = (inner) => `<!doctype html><html${rootAttrs}><head><meta charset="utf-8"><style>${CSS}
${authorCss}</style></head><body><div class="k-cwrap${confirm ? " k-confirm" : ""}">${markBar}${inner}</div><div class="k-rim" aria-hidden="true"></div><script>${JS}</script></body></html>`;
  let html = compose(body);
  if (byteLength(html) > WIDGET_KIT_LIMITS.maxHtmlBytes) {
    html = compose(dropImages(body));
  }
  const bytes = byteLength(html);
  if (bytes > WIDGET_KIT_LIMITS.maxHtmlBytes) {
    throw new Error(`Widget HTML is ${bytes} bytes, over the ${WIDGET_KIT_LIMITS.maxHtmlBytes} limit — trim the markup, show less, or inline smaller images.`);
  }
  const height = Math.max(WIDGET_KIT_LIMITS.minHeight, Math.min(WIDGET_KIT_LIMITS.maxHeight, Math.round(Number(o.height) || WIDGET_KIT_LIMITS.defaultHeight)));
  return { html, height, label: o.label };
}

// mark.ts
var SPORTS_MARK = "data:image/png;base64,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";

// cards.ts
var ACCENT = "#013369";
var ACCENT_LT = "#5C9DFF";
var TITLE = "Scores";
var GLANCE_CAP = 92000;
var markLoaded = false;
function ensureMark() {
  if (markLoaded)
    return;
  markLoaded = true;
  try {
    setIntegrationMark(SPORTS_MARK);
  } catch {}
}
function pack(widget) {
  return JSON.stringify({ blocks: [{ type: "widget", html: widget.html, height: widget.height }] });
}
function packBlocks(blocks) {
  return pack(renderWidget({ blocks, accent: ACCENT, label: TITLE }));
}
function packCustom(body, height) {
  const markAnchor = '<span class="k-mk" data-k-mk style="display:none"></span>';
  return pack(renderCustom({ body: `${markAnchor}<div class="s-wrap">${body}</div>`, css: S_CSS, label: TITLE, height }));
}
function glanceLen(s) {
  try {
    const g = JSON.parse(s);
    return JSON.stringify(g).length;
  } catch {
    return s.length;
  }
}
function guarded(compose, fallbackTrailing) {
  try {
    ensureMark();
    return compose();
  } catch (e) {
    try {
      process.stderr.write(`[sports] card compose threw (${fallbackTrailing}): ${e?.message ?? e}
`);
    } catch {}
    try {
      return packBlocks([vHeader({ title: TITLE, trailing: fallbackTrailing })]);
    } catch {
      return "";
    }
  }
}
function str(v) {
  return typeof v === "string" && v !== "" ? v : undefined;
}
function httpsUrl(v) {
  const s = typeof v === "string" ? v.trim() : "";
  return /^https:\/\//i.test(s) ? s : undefined;
}

class ImgReg {
  map = new Map;
  arr = [];
  idx(dataUri) {
    if (!dataUri)
      return -1;
    const hit = this.map.get(dataUri);
    if (hit !== undefined)
      return hit;
    const i = this.arr.length;
    this.map.set(dataUri, i);
    this.arr.push(dataUri);
    return i;
  }
  script() {
    return this.arr.length ? `<script>window.__IMGS=${JSON.stringify(this.arr)}</script>` : "";
  }
}
var IMG_HYDRATE = '<script>(function(){var a=window.__IMGS||[];var e=document.querySelectorAll("img[data-img]");for(var i=0;i<e.length;i++){var k=+e[i].getAttribute("data-img");if(a[k])e[i].src=a[k];}})();</script>';
var NAV_SCRIPT = "<script>" + 'function show(id){var vs=document.querySelectorAll("[data-view]");for(var i=0;i<vs.length;i++){vs[i].style.display=(vs[i].getAttribute("data-view")===id)?"flex":"none";}var sc=document.querySelector("[data-view=\\""+id+"\\"] .s-scroll");if(sc){sc.scrollTop=0;}try{window.scrollTo(0,0);}catch(e){}}' + 'document.addEventListener("click",function(e){var el=e.target;while(el&&el!==document.body){if(el.getAttribute){var o=el.getAttribute("data-open");if(o!==null){show("g-"+o);return;}if(el.hasAttribute("data-back")){show("home");return;}}el=el.parentNode;}});' + "</script>";
var HUB_SCRIPT = "<script>" + 'function vshow(id){var vs=document.querySelectorAll("[data-view]");for(var i=0;i<vs.length;i++){vs[i].style.display=(vs[i].getAttribute("data-view")===id)?"flex":"none";}var sc=document.querySelector("[data-view=\\""+id+"\\"] .s-scroll");if(sc){sc.scrollTop=0;}try{window.scrollTo(0,0);}catch(e){}}' + 'function tshow(t){var vs=document.querySelectorAll("[data-tabview]");for(var i=0;i<vs.length;i++){vs[i].style.display=(vs[i].getAttribute("data-tabview")===t)?"flex":"none";}var ts=document.querySelectorAll("[data-tab]");for(var j=0;j<ts.length;j++){if(ts[j].getAttribute("data-tab")===t)ts[j].className="s-tab active";else ts[j].className="s-tab";}try{window.scrollTo(0,0);}catch(e){}}' + 'document.addEventListener("click",function(e){var el=e.target;while(el&&el!==document.body){if(el.getAttribute){var t=el.getAttribute("data-tab");if(t!==null){vshow("home");tshow(t);return;}var o=el.getAttribute("data-open");if(o!==null){vshow("g-"+o);return;}if(el.hasAttribute("data-back")){vshow("home");return;}}el=el.parentNode;}});' + "</script>";
var IC_CHEV = '<svg class="s-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>';
var IC_BACK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
var IC_PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.4"/></svg>';
var IC_TV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 21h8"/></svg>';
var IC_CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>';
var IC_EXT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 5h5v5"/><path d="M19 5l-8 8"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>';
var IC_TROPHY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 15h6M10 19h4M12 15v4"/></svg>';
var S_CSS = `
body{background:#1c1c1e;background-image:radial-gradient(135% 92% at 50% -8%,rgba(92,157,255,.20),rgba(92,157,255,0) 55%);background-repeat:no-repeat;background-attachment:fixed}
.s-wrap{display:flex;flex-direction:column;padding-bottom:8px}
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
.s-poss{color:${ACCENT_LT}}
.s-chev{width:15px;height:15px;flex:none;color:rgba(255,255,255,.28)}
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
.s-back{display:inline-flex;align-items:center;gap:5px;font-size:12.5px;font-weight:800;color:#fff;cursor:pointer;-webkit-user-select:none;user-select:none;background:rgba(255,255,255,.12);border-radius:999px;padding:6px 13px 6px 9px}
.s-back:hover{background:rgba(255,255,255,.18)}
.s-back svg{width:16px;height:16px;color:${ACCENT_LT}}
.s-dbar-tr{margin-left:auto;font-size:11px;font-weight:700;color:rgba(255,255,255,.5)}
.s-scroll{overflow-y:auto;-webkit-overflow-scrolling:touch;flex:1;min-height:0;padding-bottom:12px}
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
.s-mstat.pre{color:rgba(255,255,255,.6)}
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
.s-ld-v{font-size:12.5px;font-weight:700;color:${ACCENT_LT};flex:none;white-space:nowrap}
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
.s-wp-h{background:${ACCENT_LT}}
.s-wp-lb{display:flex;justify-content:space-between;margin-top:6px;font-size:11.5px;font-weight:700}
.s-wp-lb .a{color:rgba(255,255,255,.6)}
.s-wp-lb .h{color:${ACCENT_LT}}

/* team card */
.s-team-hero{display:flex;align-items:center;gap:14px;padding:16px 15px 10px}
.s-team-logo{width:56px;height:56px;object-fit:contain;flex:none}
.s-team-m{min-width:0;flex:1}
.s-team-nm{font-size:20px;font-weight:800;color:#fff;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.s-team-sub{font-size:13px;color:rgba(255,255,255,.55);margin-top:3px}
.s-team-rec{font-size:15px;font-weight:800;color:${ACCENT_LT};margin-top:2px}

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
.s-se-when{flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:2px;min-width:64px}
.s-se-t{font-size:12.5px;font-weight:700;color:#fff;line-height:1.2}
.s-se-d{font-size:11px;color:rgba(255,255,255,.45);line-height:1.2}

/* team hub (tabbed, Google-style) */
.s-hub-hd{display:flex;align-items:center;gap:13px;padding:16px 15px 14px;position:relative}
.s-hub-hd .s-hub-logo{width:46px;height:46px;object-fit:contain;flex:none;filter:drop-shadow(0 1px 3px rgba(0,0,0,.4))}
.s-hub-m{min-width:0;flex:1}
.s-hub-nm{font-size:19px;font-weight:800;color:#fff;letter-spacing:-.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-shadow:0 1px 3px rgba(0,0,0,.35)}
.s-hub-sub{font-size:12.5px;color:rgba(255,255,255,.82);margin-top:3px;text-shadow:0 1px 2px rgba(0,0,0,.3)}
.s-tabs{display:flex;align-items:stretch;border-bottom:1px solid rgba(255,255,255,.1);padding:0 6px}
.s-tab{flex:1;text-align:center;font-size:12px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:rgba(255,255,255,.5);padding:11px 4px 9px;cursor:pointer;-webkit-user-select:none;user-select:none;border-bottom:2.5px solid transparent;transition:color .12s ease}
.s-tab:hover{color:rgba(255,255,255,.8)}
.s-tab.active{color:#fff;border-bottom-color:${ACCENT_LT}}
.s-tabview{display:flex;flex-direction:column;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-bottom:10px}
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
.s-ft-l svg{width:14px;height:14px;color:${ACCENT_LT}}
.s-btn{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:800;color:#0A2A4E;background:${ACCENT_LT};border-radius:999px;padding:8px 16px;text-decoration:none;cursor:pointer}
.s-btn svg{width:14px;height:14px}
`;
function headerHtml(title, trailing, leagueBadge) {
  const tr = trailing === undefined ? "" : `<span class="s-hd-tr">${esc(clip(trailing, 26))}</span>`;
  const lb = leagueBadge ? `<span class="s-lg">${esc(leagueBadge)}</span>` : "";
  return `<div class="s-hd">` + `<span class="s-hd-t">${esc(clip(title, 40))}</span>${lb}${tr}</div>`;
}
var LIVE = new Set(["in"]);
function sideRow(reg, s, live) {
  const side = s ?? {};
  const li = reg.idx(side.logo);
  const logo = li >= 0 ? `<img class="s-logo" data-img="${li}" alt="">` : `<span class="s-logo"></span>`;
  const scoreShown = side.score !== undefined;
  const loseCls = scoreShown && side.winner === false ? " lose" : "";
  const poss = live && side.possession ? '<span class="s-poss">&#9679;</span> ' : "";
  const score = scoreShown ? `<span class="s-sc${loseCls}">${poss}${side.score}</span>` : "";
  const rec = side.record ? `<span class="s-rec">${esc(clip(side.record, 8))}</span>` : "";
  return `<div class="s-tr">${logo}<span class="s-ab">${esc(clip(side.abbr ?? "", 4))}</span>` + `<span class="s-nm">${esc(clip(side.name ?? "", 22))}</span>${rec}${score}</div>`;
}
function statusCell(g) {
  const live = LIVE.has(g.state ?? "");
  if (live) {
    return `<span class="s-pill s-live"><span class="s-dot"></span>${esc(clip(g.statusShort ?? "LIVE", 12))}</span>`;
  }
  if (g.state === "post") {
    return `<span class="s-pill s-final">${esc(clip(g.statusShort ?? "Final", 10))}</span>`;
  }
  const when = g.when ? `<span class="s-when">${esc(clip(g.when, 12))}</span>` : "";
  const dt = g.dateShort ? `<span class="s-when-d">${esc(clip(g.dateShort, 14))}</span>` : "";
  return when + dt;
}
function gameRow(reg, g, i) {
  const live = LIVE.has(g.state ?? "");
  return `<div class="s-g" data-open="${i}">` + `<div class="s-g-teams">${sideRow(reg, g.away, live)}${sideRow(reg, g.home, live)}</div>` + `<div class="s-g-status">${statusCell(g)}</div>${IC_CHEV}</div>`;
}
function linescoreTable(reg, g) {
  const labels = g.periodLabels ?? [];
  const a = g.away?.linescores ?? [];
  const h = g.home?.linescores ?? [];
  if (!labels.length || !a.length && !h.length)
    return "";
  const head = `<tr><th class="tm"></th>` + labels.map((l) => `<th>${esc(clip(l, 3))}</th>`).join("") + `<th class="tot">T</th></tr>`;
  const row = (side, cells) => {
    const s = side ?? {};
    const li = reg.idx(s.logo);
    const logo = li >= 0 ? `<img data-img="${li}" alt="">` : "";
    const tds = labels.map((_, k) => `<td>${cells[k] ?? "-"}</td>`).join("");
    return `<tr><td class="tm">${logo}<b>${esc(clip(s.abbr ?? "", 4))}</b></td>${tds}<td class="tot">${s.score ?? "-"}</td></tr>`;
  };
  return `<div class="s-sec"><div class="s-sec-h">Scoring</div><table class="s-ls">${head}${row(g.away, a)}${row(g.home, h)}</table></div>`;
}
function leadersBlock(g, leaders) {
  const list = (leaders ?? []).filter((l) => l.name);
  if (!list.length)
    return "";
  const rows = list.slice(0, 6).map((l) => `<div class="s-ld-row"><span class="s-ld-cat">${esc(clip(l.cat ?? "", 8))}</span>` + `<span class="s-ld-nm">${esc(clip(l.name ?? "", 26))}</span>` + (l.team ? `<span class="s-ld-tm">${esc(clip(l.team, 4))}</span>` : "") + `<span class="s-ld-v">${esc(clip(l.value ?? "", 22))}</span></div>`).join("");
  return `<div class="s-sec"><div class="s-sec-h">Game leaders</div><div class="s-ld">${rows}</div></div>`;
}
function infoBlock(g) {
  const rows = [];
  if (g.odds)
    rows.push(`<div class="s-kv-row">${IC_TROPHY}<span class="s-kv-k">Line</span><span class="s-kv-v">${esc(clip(g.odds, 40))}${g.overUnder ? " · O/U " + esc(clip(g.overUnder, 8)) : ""}</span></div>`);
  if (g.broadcast)
    rows.push(`<div class="s-kv-row">${IC_TV}<span class="s-kv-k">TV</span><span class="s-kv-v">${esc(clip(g.broadcast, 36))}</span></div>`);
  if (g.venue)
    rows.push(`<div class="s-kv-row">${IC_PIN}<span class="s-kv-k">Venue</span><span class="s-kv-v">${esc(clip(g.venue, 40))}</span></div>`);
  if (g.dateShort || g.when)
    rows.push(`<div class="s-kv-row">${IC_CAL}<span class="s-kv-k">When</span><span class="s-kv-v">${esc(clip([g.dateShort, g.when].filter(Boolean).join(" · "), 40))}</span></div>`);
  if (!rows.length)
    return "";
  return `<div class="s-sec"><div class="s-sec-h">Details</div><div class="s-kv">${rows.join("")}</div></div>`;
}
function winProbBlock(g) {
  const h = g.homeWinPct;
  if (h === undefined || !(g.state === "in"))
    return "";
  const hp = Math.max(2, Math.min(98, Math.round(h)));
  const ap = 100 - hp;
  return `<div class="s-sec"><div class="s-sec-h">Win probability</div><div class="s-wp">` + `<div class="s-wp-bar"><span class="s-wp-a" style="width:${ap}%"></span><span class="s-wp-h" style="width:${hp}%"></span></div>` + `<div class="s-wp-lb"><span class="a">${esc(g.away?.abbr ?? "Away")} ${ap}%</span><span class="h">${esc(g.home?.abbr ?? "Home")} ${hp}%</span></div>` + `</div></div>`;
}
function matchupHeader(reg, g) {
  const live = LIVE.has(g.state ?? "");
  const post = g.state === "post";
  const showScore = live || post;
  const al = reg.idx(g.away?.logo);
  const hl = reg.idx(g.home?.logo);
  const alogo = al >= 0 ? `<img class="s-mlogo" data-img="${al}" alt="">` : '<span class="s-mlogo"></span>';
  const hlogo = hl >= 0 ? `<img class="s-mlogo" data-img="${hl}" alt="">` : '<span class="s-mlogo"></span>';
  let mid;
  if (showScore) {
    const statCls = live ? "live" : "final";
    mid = `<div class="s-mscore">${g.away?.score ?? 0}<span class="sep">-</span>${g.home?.score ?? 0}</div>` + `<div class="s-mstat ${statCls}">${esc(clip(g.statusDetail ?? (live ? "Live" : "Final"), 22))}</div>`;
  } else {
    mid = `<div class="s-mkick">${esc(clip(g.when ?? "TBD", 12))}</div>` + `<div class="s-mstat pre">${esc(clip(g.dateShort ?? "Scheduled", 18))}</div>`;
  }
  return `<div class="s-match">` + `<div class="s-mteam">${alogo}<span class="s-mab">${esc(clip(g.away?.abbr ?? "", 4))}</span>${g.away?.record ? `<span class="s-mrec">${esc(clip(g.away.record, 10))}</span>` : ""}</div>` + `<div class="s-mid">${mid}</div>` + `<div class="s-mteam">${hlogo}<span class="s-mab">${esc(clip(g.home?.abbr ?? "", 4))}</span>${g.home?.record ? `<span class="s-mrec">${esc(clip(g.home.record, 10))}</span>` : ""}</div>` + `</div>`;
}
function detailBody(reg, g, leaders) {
  return matchupHeader(reg, g) + `<div class="s-rule"></div>` + winProbBlock(g) + linescoreTable(reg, g) + leadersBlock(g, leaders) + infoBlock(g) + (g.note ? `<div class="s-note">${esc(clip(g.note, 240))}</div>` : "");
}
function scoreboardCard(data) {
  return guarded(() => {
    const badge = data.league ? data.league.toUpperCase() : undefined;
    const all = Array.isArray(data.games) ? data.games : [];
    const noteHtml = data.note ? `<div class="s-note" style="padding-top:10px;padding-bottom:2px">${esc(clip(data.note, 120))}</div>` : "";
    if (all.length === 0) {
      const body = headerHtml(data.title, data.trailing, badge) + `<div class="s-empty"><b>No games</b><span>${esc(clip(data.emptyHint ?? "No games on the schedule for that day.", 96))}</span></div>`;
      return packCustom(body, 132);
    }
    const steps = [Math.min(all.length, 12), 9, 7, 5, 4, 3, 2];
    let chosen = "";
    for (const n of steps) {
      try {
        const reg = new ImgReg;
        const games = all.slice(0, n);
        const rows = games.map((g, i) => gameRow(reg, g, i)).join("");
        const overflow = all.length - games.length;
        const more = overflow > 0 ? `<div class="s-note">+${overflow} more game${overflow === 1 ? "" : "s"} not shown</div>` : "";
        const home = `<div class="s-view" data-view="home">${headerHtml(data.title, data.trailing ?? `${all.length} game${all.length === 1 ? "" : "s"}`, badge)}${noteHtml}<div class="s-list">${rows}</div>${more}</div>`;
        const details = games.map((g, i) => {
          const leaders = data.leadersByGame?.[g.id ?? ""] ?? [];
          return `<div class="s-view s-detail" data-view="g-${i}" style="display:none">` + `<div class="s-dbar"><span class="s-back" data-back>${IC_BACK}Scores</span><span class="s-dbar-tr">${esc((g.away?.abbr ?? "") + " @ " + (g.home?.abbr ?? ""))}</span></div>` + `<div class="s-scroll">${detailBody(reg, g, leaders)}</div></div>`;
        }).join("");
        const card = packCustom(reg.script() + home + details + IMG_HYDRATE + NAV_SCRIPT, 420);
        chosen = card;
        if (glanceLen(card) <= GLANCE_CAP)
          break;
      } catch {
        continue;
      }
    }
    return chosen;
  }, "Scores");
}
function gameCard(data) {
  return guarded(() => {
    const reg = new ImgReg;
    const g = data.game ?? {};
    const badge = (data.league ?? g.league)?.toUpperCase();
    const body = headerHtml(`${g.away?.abbr ?? ""} @ ${g.home?.abbr ?? ""}`, g.statusShort, badge) + `<div class="s-scroll">${detailBody(reg, g, data.leaders)}</div>`;
    return packCustom(reg.script() + body + IMG_HYDRATE, 420);
  }, "Scores");
}
function standingsCard(data) {
  return guarded(() => {
    const badge = data.league?.toUpperCase();
    const all = Array.isArray(data.rows) ? data.rows : [];
    const noteHtml = data.note ? `<div class="s-note" style="padding-top:10px;padding-bottom:2px">${esc(clip(data.note, 120))}</div>` : "";
    if (!all.length) {
      const body = headerHtml(data.title, undefined, badge) + `<div class="s-empty"><b>No standings</b><span>${esc(clip(data.emptyHint ?? "Standings unavailable.", 90))}</span></div>`;
      return packCustom(body, 122);
    }
    const steps = [Math.min(all.length, 16), 12, 10, 8, 6, 4];
    let chosen = "";
    for (const n of steps) {
      try {
        const reg = new ImgReg;
        const rows = all.slice(0, n);
        const extraLabel = data.extraLabel ?? "STRK";
        const hd = `<div class="s-st-hd"><span class="s-st-rk"></span><span style="flex:1"></span><span class="s-st-col wl">W-L</span><span class="s-st-col">PCT</span><span class="s-st-col sub">${esc(clip(extraLabel, 6))}</span></div>`;
        const body_rows = rows.map((r) => {
          const li = reg.idx(r.logo);
          const logo = li >= 0 ? `<img class="s-st-logo" data-img="${li}" alt="">` : '<span class="s-st-logo"></span>';
          const wl = `${r.wins ?? 0}-${r.losses ?? 0}`;
          return `<div class="s-st-row"><span class="s-st-rk">${r.rank ?? ""}</span>${logo}` + `<span class="s-st-nm">${esc(clip(r.name ?? r.abbr ?? "", 24))}</span>` + `<span class="s-st-col wl">${esc(wl)}</span>` + `<span class="s-st-col">${esc(clip(r.pct ?? "", 6))}</span>` + `<span class="s-st-col sub">${esc(clip(r.extra ?? "", 6))}</span></div>`;
        }).join("");
        const overflow = all.length - rows.length;
        const more = overflow > 0 ? `<div class="s-note">+${overflow} more</div>` : "";
        const body = headerHtml(data.title, `${all.length} teams`, badge) + noteHtml + `<div class="s-st">${hd}${body_rows}</div>${more}`;
        const card = packCustom(reg.script() + body + IMG_HYDRATE, Math.min(64 + rows.length * 38 + (data.note ? 30 : 0), 440));
        chosen = card;
        if (glanceLen(card) <= GLANCE_CAP)
          break;
      } catch {
        continue;
      }
    }
    return chosen;
  }, "Standings");
}
function scheduleCard(data) {
  return guarded(() => {
    const badge = data.league?.toUpperCase();
    const all = Array.isArray(data.games) ? data.games : [];
    if (!all.length) {
      const body = headerHtml(data.title, data.trailing, badge) + `<div class="s-empty"><b>No games</b><span>${esc(clip(data.emptyHint ?? "Nothing scheduled.", 90))}</span></div>`;
      return packCustom(body, 122);
    }
    const steps = [Math.min(all.length, 10), 8, 6, 5, 4, 3];
    let chosen = "";
    for (const n of steps) {
      try {
        const reg = new ImgReg;
        const games = all.slice(0, n);
        const rows = games.map((g) => {
          const al = reg.idx(g.away?.logo);
          const hl = reg.idx(g.home?.logo);
          const alogo = al >= 0 ? `<img data-img="${al}" alt="">` : "";
          const hlogo = hl >= 0 ? `<img data-img="${hl}" alt="">` : "";
          const played = g.state === "post";
          const when = played ? `<span class="s-se-t">${esc(clip(g.statusShort ?? "Final", 12))}</span><span class="s-se-d">${g.away?.score ?? ""}-${g.home?.score ?? ""}</span>` : `<span class="s-se-t">${esc(clip(g.when ?? "TBD", 10))}</span><span class="s-se-d">${esc(clip(g.dateShort ?? "", 14))}</span>`;
          return `<div class="s-se"><div class="s-se-mt">${alogo}<span class="s-se-ab">${esc(clip(g.away?.abbr ?? "", 4))}</span>` + `<span class="s-se-at">@</span>${hlogo}<span class="s-se-ab">${esc(clip(g.home?.abbr ?? "", 4))}</span></div>` + `<div class="s-se-when">${when}</div></div>`;
        }).join("");
        const overflow = all.length - games.length;
        const more = overflow > 0 ? `<div class="s-note">+${overflow} more</div>` : "";
        const body = headerHtml(data.title, data.trailing ?? `${all.length} game${all.length === 1 ? "" : "s"}`, badge) + `<div class="s-sch">${rows}</div>${more}`;
        const card = packCustom(reg.script() + body + IMG_HYDRATE, Math.min(56 + games.length * 46, 420));
        chosen = card;
        if (glanceLen(card) <= GLANCE_CAP)
          break;
      } catch {
        continue;
      }
    }
    return chosen;
  }, "Schedule");
}
function playerCard(data) {
  return guarded(() => {
    const reg = new ImgReg;
    const p = data.player ?? {};
    const badge = data.league?.toUpperCase();
    const hi = reg.idx(p.headshot);
    const hs = hi >= 0 ? `<img class="s-pl-hs" data-img="${hi}" alt="">` : '<span class="s-pl-hs"></span>';
    const subBits = [p.position, p.jersey ? "#" + p.jersey : undefined, p.team].filter(Boolean).map((x) => esc(clip(String(x), 22)));
    const stats = (p.stats ?? []).slice(0, 6);
    const statHtml = stats.length ? `<div class="s-stats">${stats.map((s) => `<div class="s-stat"><div class="s-stat-v">${esc(clip(s.v, 10))}</div><div class="s-stat-k">${esc(clip(s.k, 12))}</div></div>`).join("")}</div>` : "";
    const url = httpsUrl(p.url);
    const btn = url ? `<div class="s-ft"><span class="s-ft-l">${IC_PIN}ESPN</span><a class="s-btn" href="${esc(url)}" data-k-link>${IC_EXT}Full stats</a></div>` : "";
    const body = headerHtml("Player", undefined, badge) + `<div class="s-pl-hero">${hs}<div class="s-pl-m"><div class="s-pl-nm">${esc(clip(p.name ?? "Player", 28))}</div>` + `<div class="s-pl-sub">${subBits.length ? '<span class="s-pl-badge">' + subBits[0] + "</span>" : ""}${subBits.slice(1).map((b) => `<span>${b}</span>`).join("")}</div>` + `</div></div><div class="s-rule"></div>${statHtml}${btn}`;
    return packCustom(reg.script() + body + IMG_HYDRATE, 150 + (stats.length ? Math.ceil(stats.length / 3) * 58 : 0) + (url ? 40 : 0));
  }, "Player");
}
function newsCard(data) {
  return guarded(() => {
    const badge = data.league?.toUpperCase();
    const list = (Array.isArray(data.items) ? data.items : []).filter((n) => n.headline);
    if (!list.length) {
      const body2 = headerHtml(data.title, undefined, badge) + `<div class="s-empty"><b>No news</b><span>${esc(clip(data.emptyHint ?? "No headlines right now.", 90))}</span></div>`;
      return packCustom(body2, 122);
    }
    const visible = list.slice(0, 6);
    const rows = visible.map((n) => {
      const href = httpsUrl(n.url);
      const tag = href ? "a" : "div";
      const attr = href ? ` href="${esc(href)}" data-k-link` : "";
      const sub = [n.source, n.when].filter(Boolean).join(" · ");
      return `<${tag} class="s-nw"${attr}><div class="s-nw-m"><div class="s-nw-t">${esc(clip(n.headline ?? "", 130))}</div>` + (sub ? `<div class="s-nw-s">${esc(clip(sub, 40))}</div>` : "") + `</div>${href ? IC_CHEV : ""}</${tag}>`;
    }).join("");
    const body = headerHtml(data.title, `${list.length} stories`, badge) + `<div class="s-news">${rows}</div>`;
    return packCustom(body, Math.min(52 + visible.length * 58, 420));
  }, "News");
}
function hubGameRow(reg, g, i) {
  const al = reg.idx(g.away?.logo);
  const hl = reg.idx(g.home?.logo);
  const alogo = al >= 0 ? `<img data-img="${al}" alt="">` : "";
  const hlogo = hl >= 0 ? `<img data-img="${hl}" alt="">` : "";
  const played = g.state === "post";
  const live = LIVE.has(g.state ?? "");
  const aLose = played && g.away?.winner === false ? " lose" : "";
  const hLose = played && g.home?.winner === false ? " lose" : "";
  const awayScore = played || live ? `<span class="s-hg-sc${aLose}">${g.away?.score ?? 0}</span>` : "";
  const homeScore = played || live ? `<span class="s-hg-sc${hLose}">${g.home?.score ?? 0}</span>` : "";
  const when = played || live ? `<div class="s-hg-when"><span class="s-hg-w1">${esc(clip(g.statusShort ?? (live ? "LIVE" : "Final"), 10))}</span><span class="s-hg-w2">${esc(clip(g.dateShort ?? "", 12))}</span></div>` : `<div class="s-hg-when"><span class="s-hg-w1">${esc(clip(g.when ?? "TBD", 10))}</span><span class="s-hg-w2">${esc(clip(g.dateShort ?? "", 12))}</span></div>`;
  return `<div class="s-hg" data-open="${i}"><div class="s-hg-teams">` + `<div class="s-hg-r">${alogo}<span class="s-hg-ab">${esc(clip(g.away?.abbr ?? "", 4))}</span><span class="s-hg-nm">${esc(clip(g.away?.name ?? "", 16))}</span>${awayScore}</div>` + `<div class="s-hg-r">${hlogo}<span class="s-hg-ab">${esc(clip(g.home?.abbr ?? "", 4))}</span><span class="s-hg-nm">${esc(clip(g.home?.name ?? "", 16))}</span>${homeScore}</div>` + `</div>${when}${IC_CHEV}</div>`;
}
function teamHubCard(data) {
  return guarded(() => {
    const h = data.hub ?? {};
    const badge = h.league?.toUpperCase();
    const color = h.color && /^[0-9a-fA-F]{6}$/.test(h.color) ? `#${h.color}` : "#242426";
    const steps = [[5, 4, 8], [4, 3, 6], [3, 2, 6], [3, 2, 4], [2, 1, 3]];
    let chosen = "";
    for (const [nUp, nRec, nSt] of steps) {
      try {
        const card = buildHub(h, badge, color, nUp, nRec, nSt);
        chosen = card;
        if (glanceLen(card) <= GLANCE_CAP)
          break;
      } catch {
        continue;
      }
    }
    return chosen;
  }, "Team");
}
function buildHub(h, badge, color, nUp, nRec, nSt) {
  {
    const reg = new ImgReg;
    const li = reg.idx(h.logo);
    const logo = li >= 0 ? `<img class="s-hub-logo" data-img="${li}" alt="">` : '<span class="s-hub-logo"></span>';
    const upcoming = (h.upcoming ?? []).slice(0, nUp);
    const recent = (h.recent ?? []).slice(0, nRec);
    const allGames = [...upcoming, ...recent];
    const gamesRows = (upcoming.length ? `<div class="s-glabel">Upcoming</div>` + upcoming.map((g, i) => hubGameRow(reg, g, i)).join("") : "") + (recent.length ? `<div class="s-glabel">Recent results</div>` + recent.map((g, i) => hubGameRow(reg, g, upcoming.length + i)).join("") : "") || `<div class="s-empty"><b>No games</b><span>Schedule unavailable right now.</span></div>`;
    const stRows = (h.standings ?? []).slice(0, nSt);
    const standingsHtml = stRows.length ? `<div class="s-st">${stRows.map((r) => {
      const sli = reg.idx(r.logo);
      const slogo = sli >= 0 ? `<img class="s-st-logo" data-img="${sli}" alt="">` : '<span class="s-st-logo"></span>';
      const me = h.teamAbbr && r.abbr === h.teamAbbr ? ' style="background:rgba(92,157,255,.16)"' : "";
      return `<div class="s-st-row"${me}><span class="s-st-rk">${r.rank ?? ""}</span>${slogo}` + `<span class="s-st-nm">${esc(clip(r.name ?? r.abbr ?? "", 22))}</span>` + `<span class="s-st-col wl">${r.wins ?? 0}-${r.losses ?? 0}</span>` + `<span class="s-st-col">${esc(clip(r.pct ?? "", 6))}</span></div>`;
    }).join("")}</div>` : `<div class="s-empty"><b>No standings</b><span>Standings unavailable.</span></div>`;
    const players = (h.players ?? []).slice(0, 10);
    const playersHtml = players.length ? `<div class="s-pl-list">${players.map((p) => {
      const href = httpsUrl(p.url);
      const tag = href ? "a" : "div";
      const attr = href ? ` href="${esc(href)}" data-k-link` : "";
      const sub = [p.pos, p.jersey ? "#" + p.jersey : ""].filter(Boolean).join(" · ");
      return `<${tag} class="s-plr"${attr}><span class="s-plr-jr">${esc(clip(p.jersey ?? "-", 3))}</span>` + `<div class="s-plr-m"><div class="s-plr-nm">${esc(clip(p.name ?? "", 26))}</div>` + (sub ? `<div class="s-plr-pos">${esc(clip(sub, 24))}</div>` : "") + `</div>${href ? IC_CHEV : ""}</${tag}>`;
    }).join("")}</div>` : `<div class="s-empty"><b>No roster</b><span>Roster unavailable.</span></div>`;
    const header = `<div class="s-hub-hd" style="background:linear-gradient(180deg,${color}dd,${color}44)">${logo}` + `<div class="s-hub-m"><div class="s-hub-nm">${esc(clip(h.name ?? "Team", 28))}</div>` + `<div class="s-hub-sub">${esc(clip([h.record, h.standing].filter(Boolean).join(" · ") || (badge ?? ""), 46))}</div></div></div>`;
    const tabs = `<div class="s-tabs"><span class="s-tab active" data-tab="games">Games</span>` + `<span class="s-tab" data-tab="standings">Standings</span><span class="s-tab" data-tab="players">Players</span></div>`;
    const home = `<div class="s-view" data-view="home">${header}${tabs}` + `<div class="s-tabview" data-tabview="games">${gamesRows}</div>` + `<div class="s-tabview" data-tabview="standings" style="display:none">${standingsHtml}</div>` + `<div class="s-tabview" data-tabview="players" style="display:none">${playersHtml}</div></div>`;
    const details = allGames.map((g, i) => {
      return `<div class="s-view s-detail" data-view="g-${i}" style="display:none">` + `<div class="s-dbar"><span class="s-back" data-back>${IC_BACK}Back</span><span class="s-dbar-tr">${esc((g.away?.abbr ?? "") + " @ " + (g.home?.abbr ?? ""))}</span></div>` + `<div class="s-scroll">${detailBody(reg, g)}</div></div>`;
    }).join("");
    return packCustom(reg.script() + home + details + IMG_HYDRATE + HUB_SCRIPT, 420);
  }
}
function errorCard(data) {
  return guarded(() => {
    const body = headerHtml(TITLE, "Error") + `<div class="s-empty"><b>Something went wrong</b><span>${esc(clip(str(data.spoken) ?? "Could not complete that request.", 200))}</span></div>`;
    return packCustom(body, 132);
  }, "Error");
}

// logos.ts
var LOGOS = { "nfl:ARI": "data:image/png;base64,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", "nfl:ATL": "data:image/png;base64,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", "nfl:BAL": "data:image/png;base64,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", "nfl:BUF": "data:image/png;base64,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", "nfl:CAR": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAEm0lEQVR4Xs2WbUyVZRjH/7wc4ByCeHkgXgQFPbwYJyTH29EUBAVTrIYoGCWloAbMAdKYKKGEgItIW0gfXLFexlaujQ/V2nDjQ7lFZVn4oa3V+uCXdKu5tVp23V3383COcO4DHMLac2+/nef87/u5rv9zv0MIATOjCGZDEcyGIpgNRTAbimA2FMFsKILZUASzoQhmQxHMhvvh/NRNaEPXl0sQk6sNTR/R2i8NadXd49rjrVPa3q4ftObRn7UD537SanuntY7xy9zuInOUyWP8vcTSPbkNDlz5BTjz7dLo/caK5z9pw5lrL6D/+ls4NXUDDaMCKev506GSnC2QtpH059hUgT19guNIptE33Y/TX9YwSa74uqflGbwWCbvzV/j5CwQGqYYkMSm0u22AevsGqaS0jPyCbXPqU8rryF7VQtjeRgiyCjS/X4IXv5Yffw8MSto/PomwGAFLyFxj0nDIfW7jgYGBIi4uXgQHc7voJIHEBwWs94u1hSWUWNlO/kUHCLWvjHPMAFfse2EwEd2f96P4EMEaLuAfIBCmEeLTCavWExzbCBtqCZs5edZWY2jhJ5BVKnB8UqBmkJCxifgjiaeHHOp3mIeZMBl/OQZtzDHsH76lzyVXr8mhDo8lJLDB1DxC9nZC0UFCcT3p5mf38Op8QoDFeC5tJGxtIo45zGxmShnt3xosQ+fkj1i3c25Cl0HZgwkZpBtI2yiQmisQl+ZuI4c6ISGRWSEslpl5K3s6Z5c0eHDGXAGTvlSDIcx5NI79hagVqjlJsG1mGL3jcGTT2+9eEsc7u0VrWwddeP1NymJN793qs5955ItkT1ZfDTqYq9jRLtzD4g1H2YIGc/MKRFNzq9EmcS01HG4mmy1U4AE7oeerCs+8vvZgMW8nN7Hl8PzJreFGXWWPsVV41ktCI8jpfIQiIiKN/zkVlJ6RabxX89KHnMffM7cvBpt4P/qTg6kJJXK7cPIqdW0x+XuIN1+Cn5/aNjmb/GbruZXGIrE7b3GeZC+5FzXYyPytbxGeySQr1wk8M2JsLy5NzqWKDsIT3YSQMI/2OXocl0lLdAIhr+o2jn20k08hzvedZ/4FDXYzhPIW7+YyiwROfiqgrVTrJLGrjd7keeaes5nFeqwtJdvu/m546jL3PnTqLvhs8FndXPN73heENNV1ReCxE97Nz4fdSZa0AjrR1UNHnjtKu2t5f9w3OMGnDXTqRnwy+CRzB6e+EHwaqEnksdU4JtBz1Zh/nvULIffI+jcIdcOCjzSBjgnu5b1DcJX9ry1qMJbFEaYTteeq+ZUixsGkMqsYO58OuVy/g0028X8eE/CpjjvwNDMfobyCi+p5tZ/mVbzrd9ay4Co+GLxbWX3W/d6csqbQqG8Yna3GMIeYSWbxYY/SV/4fyH40H+mbgMJ9QET8f2pwdnHC6Nnf4GnMRWCwvFLJi0GeO19U0v9m0FVsTBXzAXMbnibjMwRfTFuWZHDOlb/+VWiappJbbtS3jql18xPNVDMvMxPM98wN7emBAXe+NQ9Ba7y48JXfrCiC2VAEs6EIZkMRzIYimA1FMBuKYDYUwWz8Ax0GiiRI2QJsAAAAAElFTkSuQmCC", "nfl:CHI": "data:image/png;base64,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", "nfl:CIN": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAFJElEQVR4Xs2XeUxcVRSHh2GZOhQaloRVLbWWoi0WtQuU3aUyZTFFSDS2TV2IFqKR0UgTU0viElwwJal/1AWZxqU2IBpAwRZiXGqgsWihDam2RqVqbYohaUBAfp7z3rzhvXvfDNRo8m7y/XPvufd8c9/dxgbAZmWkCqshVVgNqcJqSBVWQ6qwGlKF1ZAqrIZUIXCQ+PV/4CxxjHiXeJK4HnLueQU3Eeju7kZ+fr6PoZoCoE6mumQuRqR1hy52VyGwpwRoqgK69mPq3FlOw6WfyBE9RCmNMOLY5OQkMjIyKMqmEBxkw2932IFSI+Ob7YgIUWPMOH2r3IeZKLYjJ96BqqoqjI6OsuQkUb0QwSc4+oWGBkOipU5qKpMT9W0MkqQ0bo6ySfEa9Svn+sXFxWFo6ASnnSU2BxKMIv4YGxtDbGysIdn6aPNkr97gX3APSYjxzHn6EpGhxlj+WhMTEyw5SIT4E3yFI9xut5TMFWee7NFr/AsO5MnxTO1y8z4ej4fTc8k2E0wnJoaHh+F0OqXOFUnmglsSzZOlhNswYxL/yyY7lgizp1FdzUtQKfebCR7hlpGREXR2dqKjowNlZWW+zncnmwtujFHbw8LC4GlpQRf1ZQZ6PgLeexYoDzfE71ph/oOCiBdrtmuCD4iCocTtOrZxVAsl1Aao9DOD6UvUdl6zs7O8xoWyv9YXO1NiR9IVspydToi96TR+c53WKx8mM6iHojGrF3TFmwteu3gewdaXfbGfZMqzF2q3oflGHjsY+LaPe5yEetRdnmCmn10cUPDSOFC7wRf7cIos2MQzx+0N98A7wBavw+UJ8qI3OwdXR6rtISEhylHBVOZkADVrgIpIX9wUfd5k4fPWLKM0dzqAfbQ5pianKadb7yFKBRTkT3GhSBbMijYmZYpNlsPXuXZDDG+uS6Uk1/8xvKWHWKz3EKUCCjKfZ8uCZQnyZ6vmmRHiGlfNxYXT1fjDbVobncm7XfSMOMOS3xMr/7Ug3xpiYpbhtuDgYKSmpirsK6IcVStoNTl9cduumhPcbXbD7FgK/HSKJU8TSQsSbHvbKHjvlfLATavVxKabZPwi8Ng6JW5tlDpGWgR92mJBTuORm3ijcM9WLERw6lMP1njPOeZqfjAIg/ZkBRDk4j1m4hzqGOqRYiKncfIo95ohEvRCMVDfYxoVyuCHPRgutCMmbE7yRKFxwIsuO5zBAQRffxzTFMeHMe9i3s2SlJ4P92o9y/WC0cQFpZoX62AvcJxuvucrlU6t64KUq4gFn7tOnoFs2pEOhwOHDr2Pvt5enB/oA745DLQ10k+NwJ8udQfzNSf2lfhAea9w2S5+1p1KNS/UuyKkji+tUiV5DU0Ls8DPKv1aPbjWKPI7Pa/4wXvqFhMhEf5haikSBfl6GVCa3qyTOxL1aapI1wajwJc5xjOuOcPYPkYzmBUjr1+JrYl8YLMBH9qxoiCTCX7V8hW1NUEegGikXVskvA3/JhIXzQnybOvbeQ0+kzbf56W7+MgBZX6ovMM+opxGmxLS3mQyiEr7+iCc8R20Kjt196x7uSwzWCCPY+DA0143nCOWsYsoppFCjGGGZtmdJQ/kh356PWsbqTxRFvTLQ/Sv8wt1Tqj8DPXhrLiIYnqeUsK/+4z+ueYtjLo83FeUi9zcXDzoypXbfXEFQH0p8Bq9C75qpzX3F6hMEW8QydB5iFJ6FhHHIf/p/q/4kThKvAX1eR8P2SGgoCWQKqyGVGE1pAqrIVVYDanCavwDAZWT8I3TdFQAAAAASUVORK5CYII=", "nfl:CLE": "data:image/png;base64,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", "nfl:DAL": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAFGklEQVR4Xs2Ye1BUZRTAr6hZiVYaviV0xmAqhSRHmwZJ3gIRgoJgFKIgKYgZ4EzYi4eFlbhYYWkOxWBrwIxDijwGNfFF5gAaAYbAgsh7F6ymAut0zl12Z/fej3bvsszwx2/m7rnnO99v73e/xy4HANx4RhQYb4gC4w3txY26Ji49S24OpgwjjEuGnLSCX8nPcNxCV3Pgjngy4pLhncZA8AhylBGXzFgIPox0IJ3IVMZ9SYyF4PpZ9utgtkMA4HUQ474kxkIwJ3zXhxCxO50Ecxn3JWFuwQeRgdNll+FM+VUSvIc8xMgzGnMLrp23fD309Kp45jtuIElvRp7RmFvwWGySDL4rPAvyk+UQ93YmCWYz8ozGnIKWSHfZD9fglZg0CN2RAuUVP5FgDzKNkW8U5hQMtlrmD909KnjEzhem2/pAV48SZtnzszmEkW8U5hQ8TrM3t6CUhHhy8ko0s1nOyDcKcwnSTP2NZq9/xF6toF94EhSVX6Hr3zn1Ai5sZxCh4BQMzjCBIJq9fcoBsHzSWys4dcla6FX2a2ZzMKOdQXgnHUFaxw4i9znqZP4ao4lNOggFp85r5TTkFZ6DnXtlovz/Rd2WHGS8E2OIX0K61wTshJ9/aYQ77V3Q1NIOjU1tI9Lb1w9hsWkiwU0xqfxTFObrQrWpj9q62+ASGEftuhE/chEOse74z0XybVZu5HeF6psNsMIzUvxtdVngIhLkY8I8Hahm9Y0GKD5bCTarQqhNwXDfzHdQ+JJaIImTbNz/SDmQDUrVAEQlfAQW1m5iEYlYWLtCZPx+vmZqxtcwGfvA+B5O3eeIk0QoqOEppGq5ZxTU/9oCZed/BJoUwk6NZS62LT1XibUU4OgVRbFqTt2HsF+jBQnaDTJnPPPyv8e+PQ2Ktk7wCdsj6twQ3psSsW0HZMuLYCbWwtghZDon7k+yoAYfRBG07T3o6OyFzKP5MA13DY4howvlyI7kQWdXL2yMfp9irYgvo/6oBYl5SOkifKkbGlshMeWwSEhIfPLncOt2Kyx+PpQ+lw3XENYVYaogsWQCrlU01EtdI0RCQp522QytdzppcvyDn20Z9ZiMRvANR69tcK2qDiYwhFhUXq+FFd7RdP0mox6T0Qhe+uBQLiSmiofX1ikMHNy3iuIJyVmQ/tlxur7CqMfEVMHZuBber61vBjvn1/QkwuP2QU+fClT99yDmrQy9p2vr9CrU3WqBiU+40TDPYdQVYapg9OqAOLiJW5Nm96BfcSfwFN2suAteoQngjNtkQ6MCCosrYMFzQVrJmtpGcA7cRdfbGXVFmCpY9HGWHNJkOXynL/jtgCZFO78lznEIpBhtV/kzl/rDyaIL0Ib77IvqPRZSMr6BTw6foOtiRl0Rpgja4LD93YRPapXv63AAO6Ph3IyHVYwrOfWxSpO7AekL3Z7MH8VozVzpEw3NrXcpdxDvLWbU18MUwVh79y14tFdCxeUquF5TD896RNITucSxtys75CItRTSLL16tga7uPk2bOEa+HqYIXqBhGhwagv2f5sIDizz+wti7yCRGroaJyDuTbTz+3CfDtoNDmtejgpGrh1TBx3Fohkpwo/cMiacOFMhqRt5IOCEtbsG7+cMCLtp0KLVi5GmRKhhJR3qrZetI7kvkMUaOIR5FvqBfgJbqPTyKkaNFquD3iArZyrgnlS2celKdYtzTIkVwIVKCWDPumYrBmnqCBv4Ctko309+6Aqgm1RbGefT+Ah6v/AenQjpqJATdhgAAAABJRU5ErkJggg==", "nfl:DEN": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAFiElEQVR4Xs2XeVBTRxzHI0irOBaoWAQrRzwIkkMThSoEwmVRQKW2oNXScZSOCvWYqQX/8Ko9PKBeZRSqIoyUYGsRr0qL7Sh4oEWxoih4ZGgVyuUtBhq+/b1A0+S9gMZj5u3MZ97ud/ftft/vt7szTwBAwGc4At/gCHyDI/ANjsA3OALf4Ah8gyPwDY7ANzgC3zBUduUXCRxl0cZYESGddQdWH4MdMZtIdx4x+Ud67iTmEQPNjH0mGE8Gg9vVhwQC12BjpvdwDV7F1K1dg47S07dTd7J2DV4f4S27eyDAEc3hNkCEAPfG98ThwH6IlYi19F4KjevLms9i9J66Mugy2P8HJ6Eym6n7ikZfTBgp0roPGXt8oljWcDLITm+qK3b7O8HRQ3mS3u3HXtQSujXoL1JUUJQaBR0R+7IgoL/BQFtED/xM0fp4pCfCvUcgRiLBQYqmscnLoX0wQOhfJngOk90alA7zPVccZA87j8Biasf1dlNdmyoRYz6Z+kQ+DMtHCZExZiA2+LpC6aUAfQTylf9/BMMR1evo5aZSsxd+WtgGexh3WtE+ukhRqHv7VeT4DUC2nzNKKbXaCVb6xXUUxXMhfbF9rAsWkGFbt0A4uCsRLPHFOKkvIofL8JFMBIWnD96QTmoSh8wst3ILTqW5RWwjXcE2qCJR0tnJmI1SeI7+52qYrSEi7QSz/5jUyiUqTJiRhJWpmcg/dBTlF6pQV9+EBw9b8OBRC+obmnG+ohp7fzqGlSk7cKCwGBlZ+QiMTnxAc8eyzZiDbVDYX6hs6eOuOuA+2K9sWWcKAyl9UyRSJCmGQEGmpieuwuFfT+HxYy0sLY1Nd1BaVoGFyza12XiE7TAKiFnYBpmTW8KklTkE/0XtOO3DYeIwLFq+GTV/1bHX5JTfz13Ctpz9uFnbwO4ylFu19Sgrv4y5yaltdsMj88mMUtCRte4Nkijv5xFwb5bMC/EjvCAV+WFOUgrqG5vZa5iU5tt3ceL0H8grOIKMXftBi4L2G4JjFiFTfRBabavJeKa9ZmMWzuxMw35KvYN3VA2tLX0agwzRhHaQTwx+Kykzmdi43KprwNq0HAS9txC9Bo+DtVsI/CcnYiFFOmWLGuszdmPJl+nwiZyDaXNXsF9He3s7fikqwcZ0NXL3FCLig0/v07oJRM8nGWRQ2ntHVaRuyUXt340mE1/X3MT7CZ+B9hBoHOy8IrDq652UNvMpLSk9D/cxU9Ha2sbuMpTKK9dxpuwCMnMPwmlkdCnNO/RJBhl6E7Nth4YfivwwuWVt2ndI3aqGgzhKb4whNHYRqq7VsNczKTqdDorweIpononORJDd1tJHaGpuUSYS6mn+ZP3Vh64Nss36EYuJHKLGWf4OztCBMC5NzXfARH31xmxUVF416Jo/a/UfEzf/c2TvPoxvduxBHGVhU3oe6lgZulytwbETZyEcO638SRHsDhsigPZdZmRc8qPKKg1On70Ej7di9feiTtcRHebUL1i6SefmE1O1gu7Cb7MLKAt5+GpDFpau2aa/rq5U30BrWxsdrn1YvXmXPiN37t6HPDxeQ57sn9WgMa69h4YX9RVNQNIXWw2R2FdYgte8IgqpXyzouEKUgkHB6wRvqpj7bznhTyRRZJsrq27QQQvbS20nG2FY4pq0nIfMdiJP8hdhkIHZAt+r9xbpzRWfKkcfz/H7SHvFzFg2o+MXr9MyN8a0eStv9HQP3U7aDEfppAvPk2Jz2DorplTXN96GbNwsDbXtzYwxi7V76GoX+ZTcgaPeLaC2vFN3edEGGWYnLEmFYFDQOjN9FvMyDNrSHqql50wzfRbzMgwyZBETzegWY2LQzE/TsxJJ+JjRLcbkp4mvcAS+wRH4BkfgGxyBb3AEvsER+AZH4Bv/AkVv3hqoY04oAAAAAElFTkSuQmCC", "nfl:DET": "data:image/png;base64,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", "nfl:GB": "data:image/png;base64,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", "nfl:HOU": "data:image/png;base64,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", "nfl:IND": "data:image/png;base64,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", "nfl:JAX": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAIxUlEQVR4Xs2YCVRU1xnH3+zDLAwgqyIiqQsuSECUBKooLhEEFFFARBNlQFIFLShi3aMgCAJVokJMcIkVVIILVduDVkNzErR4NKKWg1YbomjSNBpPLC7z73fvhBEZgiaxPfM/53/mzffeu/f3vu8ub0YAIFiyzQKWZrOApdksYGk2C1iazQKWZrOApdl0UFlZKYSHh/9U9yfPIL9D3kwuJKeTc8g7o6Mi9kyLimDxBeSRZEUnbfyoGZMJMCcnR3gBOZDDyAU6lah+lJfU4OYoRg97MVLD5aheqcL+TBV6UWxYXwny9UqM85Xi0AoVtv7GCpGvy5rVSlEx3T+oQ7udijO1AxRRzJv8a3IkeTZ5MXmjXCp85O0haRzsLjH495fgkw1qXHtPw2HqizT4x3YtzhaokTlNgdPr1Wh4V4MvyrT4S7YaR1ap8NZYOeKDZfjodyo0btNg9BCpwVYjOk5t+7bjMVNHwDcoBmtra8TFxaGiogI1NTUoyZrOG2VAf6TOmko1aKbOPd3EoGzgwFIVbu/S8nNLCfDzYg0ukgMGSBA7UoYvPtDy7OXPUaKargkbLsVn+WpsTlZiuKek1Uoh2kr9OneEY+oIOMXHxweNjY3YtGkThg0bBva9JMUIMGOUDFMCZPy4hVy3kQHr6NMOBQlW1KkjTmQ5o2yBLcUcUJtrh49zNPiqygep0e44RZmt26jG3wo12LPICu+lWmEfVaB8iQoThkrvE08WWd4VoJZi/9q/fz+Y7t+/j9TUVLg7y7EmTofyDNapE2rWuaBsoT114krZ64WYETZwsZNRuXthvI8WSrmIOu2FT3YlIixkLKoPHUBogCsairVYN1PJM36VqnB0tYpXYt2bSj4UZtMwUMiEg8Rg9WOALBZLJX5y4cIFNDc3Y9++fYiJicGQIUMoo0MRO2kk4se6wrOnAq97qjhg1kxnFOi78+PCxO4oWdgfm3MWISkpCcHBwYiIiMDWvMU4nuuHy1vseAWYf5+kQstOLW7u0FKVrLAxQYexr6ppXRECuwJkyuzXrx9qa2t5Jpm+++ZL1O5dgkNrBmHHb3siZCjLhjOHYi4isHGvarF3sRvqCpzRfDQaVVVV6BkwCurJ8ejr5w+f8Aikxw1BxRJ7HF5uDa/eUhqr9ibg4mQraJTir6h/m+cBMs0gf+3h5og5EYOxcoY779xBJ0VySDcOtSzaEb2d5CiZ50pjqReWxziiZL4rKpd2R1OJLf5dMwXfNOzAtqI0eIwIQuBwe5osLtiV1hMrYh1pWbLByexuJkDmZTEKlsGPydbPA2SqDRqs5jBLpzkiPdIB2+b14KAsVpzcA3KpCFMDdahc0R97l3nxc+yaokQXbE+xw94MFU5m0cx/3xkLJytwfI0N3k125A/D2osZocNfc61NgOUZxllOfX9IFj0P8NMRg9TIT3ChBVYHd0c5TQw3WsM0SJrQDcfzR+JS7W40nTlguHn5JB7+5zvcvn0H58+ewrGKQuzImYWtC9xRSWvfprlKZNNkKEpS4sb7WlSt6Y/kiN40MWwpqyqcoTW0fSbZQi+TyTY8D3CvTCLC8L4q6Mfbwd5aig8WuCKBjkUiAZnzpuH7b2/hwYMHhpaWFsO1a9cMFy9eNJw+fdqwe/duw/nz53H37l38+U/HUJr3NnKT3bFyugIptOPk07J043iiIT8/H7/y8YPYox88J/gRtIbGpgSjR4/G1KlTHxNT364A3yLDSi7Ghtm0tKT3xbmDy/D5p0cwa9YslJeXt80hkwgODg4OrETcbNEfN24cGEhDQwOqq6uR/nYUlsVa4c6H3dD6ZQ0ePnyIjIwMgxARD1svX6xatQr0oJg7dy6IKbErQLYufs06YstIVbEey5cvR0lJCS5duoSDBw+yp8SAAQP44s7k6+trEJx6QHjFE4JCCUEk4qDOzs6sM0NaWhrLMP5+5TIMrd+aHuzx48cIiZqGpqYm/v3UqVM8CXSPf1eATLPIhhX61zA/cbopM1u2bGGlRV5eHtLT01FXV4c7d+4Yz4vEEMZOhvDmAiNo4HgIYgmCgoJw69Yt3Lt3j0Ow+8vKyhAWFsYfwM3NDSkpKaivr0dmZibkcnnp88YgE3uB2KRUKnkG1q5di0mTJoEt5Hv27MGJEyd46ZiuXLliEH54AMGOypyUCSE0BsLocAie3jxuY2ODkJAQnvnAwEDExsbyB2SlZ/BHjx5l17WQ08iyFwFkYpC55MdsV7l+/TqKiorg5OTEO5VIJHzcsMyIxeIfskilnZkKIXEJhGFBEEZMMGVfrVbzB2L7PQHeo3tKFQpFPdtivby8Gumanm0dvyhgm0LIjba2tsjOzgbNXD4W58+fzzPJRFvi0yzGJBmz+FowhOBwE2B8fDwKCgpaCWojfX+FNUwTa7+3t3cdHfY29Sb8dEAmKXkyuVaj0RjYmLl69SqHY1q/fv1TwKg5RsCgUAhhT8evvb39WcH4wqomSwTjrjGeLDZ28VQ/B7BNrOxjyGd0Oh0fj0w3b94E+y4wmJBoI+BEgtMvhtDdDZQ1du4Ya0AqlRbQR492bZrplwC2iWX0HRGNucLCQgODpIlkzGK/wUZANg4TM+AeGQf9wjQISpWBxmFFQkICg+30RbVNLwOwTTtVKhWfQOw90sPDwzhR3ojikHIqcdXhIyjYXIyQ6OkoLS1FdHT090InZW2vlwnIxtO5iRMnGtiiy9YyvqMwSFq4y+nnA3v9Cg0NhV6vR25uLttrWQYXdWyovV4mIBP7sfWElZiV+ty5cxgzZgz69OmDyMhIvgOxtY7p0aNH8Pf3Z0MhvGMj7fWyAZnWsfG4evVqvsd2pidPnvC3bbr2M+H/WOI2ycjbyQgICGBLEM9ma2srh2NZZTsRnb9B9nz2VnP9LwDbpCf/k2WT9lT4+fkZBg4cyMBYWQ+TXZ69vHM9A/gz//roylpyPLmY/AdyXrjx7w9RJ9d26mf++rBUmwUszWYBS7NZwNJsFrA0/xeUpAmobG6ynAAAAABJRU5ErkJggg==", "nfl:KC": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAGo0lEQVR4Xs2Xe0xURxTGRbTGByIqFkERH7yFRaAKCragSbE0otEWK8/GV4Naahq0goSaakEaRasthiqPoqVqRFEDK/K0qIhGKVBsUUkBg09ARBEJ7tdzRlh39y5Kbf/Yk/wC892ZuR9zZ84c+gHop8tIBF1DIugaEkHXkAi6hkTQNSSCriERdA2JoGtIBC1YNzc3V165cuXBo0ePzlE7taur60RTU1OJQqE4SO0PicnEREJfy/j/hETQQpK7uztGjhyJsWPHwtbWVvzs378/7O3tsXv3bmRkZODAgQOoq6v7g/oHEv21zPNGSAQtpJmbm+PcOV48gFYT9fX1aGxsFMZmzpwJmUwGHx8fmJiYIDw8HGfPnm0uKyurpxXPoyHeWubsMxJBC6sDAwORlJSE18W9e/cQHR2NUaNG0cz9MGHCBKSlpSlaW1tLnz9/nkldthP2kL6jVyQCMYaYQIwmgon5R44cgZ+fH/oaZAZkClVVVVi1ahUGDhwIPT09TJs2DXK5vIO6fEe4EXqQvv+VBq1qa2vv5+fnP7169WrzunXrQJ+qneicNWsW2traUFRUpAZ/atWorq5GSUmJkosXL4o+vEVWrFiBAQMGiO2wc+dOPH78+AxeLIamj14NfsmT8CdatGgR1qxZA39/f8yePRuZmZliNbKGWeGZkavg6vCpyEn+WRjjuH37NtYbmItnnUSloQO2T3RRPufIzs6Gr68vnJ2dxSGjMX+R7EUMRh8MfhwVFYVt27Z1T6cehYWFmG9sDhi9I0hy9wEdBPGsuqISx3yXonGEE1pHuOBX57nYm7ALBQUFGrO8jEOHDsHBwQGxsbG4detWFUnj8BqDc3bt2gU22VssMbdWGswLCOOJcXxZOP4c6SS0LmKDjx9OJe6DfO1GZAeGQR62HgV7fkLtzVq0tLQg7/RpND14IOZLT0+HmZkZrKysOENcIckOvRmkzZ3i7e2NxMTEHj+SUDV41MYDxRbu4vcHI5yVetlwexQa2CrbPVSNdkaJpSfqDZ1QnJ+vnPPp06dITU2Fq6srzp8//5CkpdBicBgdjnZODe3t7crBmqFqkGmgl6XPD8A8R2ccH2ap1Mtpf8b5hyD7YAayfkzC3oWBOGXwYmwL/TFFKgZ7IicnBxYWFmKL0WL9QJKe2ufdtGkTIiIi1EdphKrB36Z4QP7LIez5Yj3qyGj0YDOcMbBRPi+wcEP5pUvKsQk7EhA9dLzoW6jFIEdDQ4NYST7lFO+rGlwWHBz8ys8bFxeH7w0mvTQwxgk7or9GpoGVaJ+xfQ/LHWeIE9zT55iJDHfu3FHOsX//fsTExODJkycqM7+Mzs5OrF27FocPH+6ipp2qwZDQ0FAkJCSoj1CJOXPmIOCt0VgxyLibMfjEd774zGwmO/RzzLOyxyrSe1j59hRxMHqi9uZN5OXIRUpSDd6HkZGRsLa2xpYtW1iKg8YedNu6dSt4FXsLTtR8F/fALz558iSqhjsIg5dMp6NInqvWR3Wlfi8vxxFHb5QZOaKiokJt3oULF4IzCBnndBOC7ltG1eBgylkdU6dOVQ7sS/DkEePtRHoRJs1m4FjUN8g+eUrcIsXFxTi6PwUZn65BobEMbZQjU8PXi7FUtiErK0sUHBs3bmQpDBqVkKrBfnfv3q2ws+M09O+CUgM+myJTriTTTvuwzlCGuyOmQUFtpmCUA9K/ihHGuCJyc3ODh4cHpxgFndrdUPHSg1rj+vXrf/M1x3ewl5cXQkJCMH36dCxevBgdHXzH9x5UwCI+Ng4RXh8g0mgSdgwxx94hFtgzfBISZe/Sqm1A6YULSElJAVdHfNWVlpa20tA9xCxoMceoNahcqlmyZAni4+N5VZ6cOHFCQTdFu6WlJW7cuNFt5fVBlbbYe/z5ubJ59uwZTtPtYWNjgwULFiA5OZmfn6aulBKkplTRFCiJIZL4iBhKjKOX5fB9yS/pa7BBPiBcwSxfvhzGxsYwNTVFbm4un5hv0cdSi5EIGoyljd7B5VFfggsHzqN8t/JW8fT05LSloM9fTo/TCRmk73glEkEDf640AgICwMErw/mL9qqo8WpqakTG5/ubL3sjIyMEBQXh8uXLTZRw5TSEr4O5WubtMxJBg5V8e+jr62Py5MlwcXGBk5OT+KeJC0/eU5s3b2ZDLdeuXbt3//79szRmNXqp7d4EiaCBIVc4lZWVzfRyzqxcne4jLefhw4eltKKHqR1EDML/+J+cKhJB15AIuoZE0DUkgq4hEXQNiaBrSARd4x/9mb7hxWNG4gAAAABJRU5ErkJggg==", "nfl:LV": "data:image/png;base64,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", "nfl:LAC": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAERklEQVR4Xs2We1BUVRzHAaVoMpuhx5CioKbS9LL8R0KysBGUKWtIzam0URqbRhuYoimbmrEgeSoiqRhPRd4rGos8Eh+7UARGPIr34gLFgqu8BNZ93W+/uwzM7p5VoaI5O/OZO/s59/x+v3t+555dOwB2PMMI3mAEbzCCNxjBG4zgDUbwBiN4gxG8wQjeYARvMII3GPEfMY+Ya8NPG0ZMEwdiPrGK8CNeJXyJqLTf1Djwk6q3pG2wbFBjCCP3CuFoI8YdYcQUcDYKCKxXjWYcq+5TBhV1Gt/IasXLqU3wSm6ED10357RhLV0d9v0Cr9hkuIRXYP3JZiT9ek3RP6YXi3W1EdcmjLgDi9uva06ElHSNucdUY82h4/gy7UNk5vmhQroCvxc/juYSd9QWeaD0rCcSsgOwK/ELnMn3gVbmCFnBSnxA310jLmFPoVJ7tf9WCsa3gnUeCxhxG5wbekcVc8KuYFvCN+j4kRZAbveP6L3wEEJSguEaWYH4yl6V3ii8YyPfJIy4DS6dA7fOLT9ch9WxKdDLZjGJp0v3eRf4x8fhhcRG/DmkPU457rORd0oFrk68cq1rYXQlQk8GYujSnMkkYjuzJetwNGsT4jK34lhWALIkvpAXPA9V2SMWBYltbi9daOEM9KDfpu+Ex+Fa/NE3JqVc91rnty7GghGtIXjbaYXWOzYJLbS/rFch9/Q6zP66Em9mt2Hv+W59cHGn8F6+AmvTmrDoYB3m7S/Ba98dRHzmFtO2WHngFJ6IkiDq1Hb0Uasn4mRK/OAWU4lWtUZCee+ZUoEavXGX74lmIeBINEYvO5kCCXJ7VBU+jb1pu/Hioe/hHFaOZXH12CNVgvZSDs1zITwIX0HA7ha1JjW1Rt32Vm47Ho2owmPhxbRa9XhXosD88AvYn75jsiPpef5YcbQB9JaH3rVArUHYvjGj1RiUHAKD3AG9ZQ+bWrE4UgrvpEZEl/eoq7pv5usMwud0/+vEsxg/D8VzkYlHLKWYn+Q03GjwT28BvcGyv4a0RwLPdOhcw0uRkbfe9PCfpgaJR5SR7vecmGsdSGTRV2XdQxtoAw9cnGt6ygWRF/H+2Q59nWo0j8YDiPttzJsKs4kNYzqjuN8WEKtkV4crlsXV4e2EMNMb/lxMJuTKYTmNzRLnWAewr+kZOfdktARpuRvhFlEsFqZTDeviaMzdRsJ/w8SvisOI1vjZR4VKzVPROYjP2oo1KU0QgC3iuPUkX2qt8ExMDm3yGpQphqphttwzjE9Uec/1JVGFeDD0Mn7uulkkeoubSBbY76vC5uw2w40xfTjGW2IdaCZZLm0eaHIKrcbHJZ06+v6A+aCT+DNGG1d7t9N9hnFLr1UrX6I208fbfMDzh8b+QWH834j1pP+bpbSSnXTdaS43gY/iJvAidpgLixOcExytBXcwgjcYwRuM4A1G8AYjeIMRvMEI3mAEbzCCN/4GZeKLyQXnQSwAAAAASUVORK5CYII=", "nfl:LAR": "data:image/png;base64,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", "nfl:MIA": "data:image/png;base64,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", "nfl:MIN": "data:image/png;base64,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", "nfl:NE": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAEY0lEQVR4Xs2Wf0zUZRzH+eHEHxWrpX8owlRIKcE50K3YgpHhCBQQ6AcV6go1l0oISKBTRyFgUorkSQ5CpWmCjEZdCUsgMgE3O5osBcsKPDQOuDu4O+7Xu89z/Oj6PrdiTuK53Wvfu/fzPJ/P+/v8+Hy/TgCcRIYTRIMTRIMTRIMTRIMTRIMTRIMTRIMTRIMTRIMTRIMTRIMT7pOZRCCxkThAlJlM5q9V/Zrm7jv3FAxVn7rFaDJ/Q22lRAYRTjzkINY/4IQJsoBIIGTm7rvX9FUXTdr9heh/MRnV+47i0SfXwcUjFE7ziQXPjUC/nUmb4xeNkLhkpGfL0HD5moFu5CuKE4+Rm5TmmbDBWUQIkWPpVzfpq+tM6tRc9K6Mg3LGciin+Y3TmLDrb1P/BRn2Dd6AvGOfofPXrj8ovoxIJdKI40Sw1AjDhVhERBEHLQOaekPNtwbNu4fRuyoeSjc7Q9P98OdTkehP3I3BvGLQTELX3onLrT+h7Jwcm5IPYn5APG/MEWR28TOvIjQ+BcGxyairb6H08LU3FmgdHGoxXlXc0ZVdsGrS8tEb/Bp63APHzdzzDkNf5BZosj6E/rwc5t+6ASt9DcMYbmwBW+aBLXsREJZkW06W1MnDgZlRpi8MQ/D6HfBa9RKSduWP63P9Y6DRDrUxX/YG5xEyS5/6B1N7R5exVTFobP5RZ1S0q8xdypswmnrYLcFssRkz1DZB+97H6IvYjJ6HA0ZndRl65j6Nze/kIih6O1ZGvIU5lExqzJ5tGQWwWKxou96JoKjtcPFcjZ17j7JMbKn/dQ/OIGYTrqP/46xqbedw4xXrUNFpaN+XQZtdhMFDJ6ErqYBB3gDTjV9ss8k+g0N6KK53oLahFakHijBvRSxnzm3RGlz4sgF0ytHVfRcxb+zBTO9wfN/cpqcQXiyv1NREYKZ9iBUYKS3+RJDZbDFWyxtp3+Vi6bMb4OrJz5YUd9+1eGRJBGb7vIDS8hqb5k370Gq1fj6WT5r8fmGz/DKVjHNNzYqBrbRsjy2L4gyNQ3vTWaI9TuWHXTNziikUYsdiSxM9CNjWSNDpDJeOnKyAJx0AeyNBUdtwprIGx0rOwj90I2b5hNPpTbC1scPxc8dtFY13G4snDf4gcSZi+vo1iq27D8PV6/kRE8tj8FFxOXbuKUBkYjrSsgvpUBTYCveAWnuVjbGPIw06GUwjMr+7otD70YzlFZZiLRnbd+gEquR1NnKOlKC8spa6wUM6XhpsMgm5cev33sjX0/FJeSX258ts5gpkpxGXlIXcwjPUBUHScdIgk82SXtXAzTWvpODEqQqcOv8FdmR+gDdT8qgs6dij4wnpGGmA/wOfW7e7lavpxeJstdy21BcvNdPzCIsd9J0Sg4wAKuKqmE0ZyC8qQ219KzO40EG/KTPIiD7+aZU18e1sDBuN7JWLnXppnyk1yMgiWGV2d9BmgxNEgxNEgxNEgxNEgxNEgxNEgxNEgxNEgxNEgxNE4y+OphllZQhXkQAAAABJRU5ErkJggg==", "nfl:NO": "data:image/png;base64,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", "nfl:NYG": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAB9klEQVR4Xu3YSyjEURTH8eOZorGQUh7lkaWsbBWlKdnKCrOSR6RsLLw2LNhQWMjGSnZWHntlo7CT1WSUjZUkefz9jv/c6br3mEfjb26y+JTOOZNvmZnGkOd55DJr4Bpr4Bpr4Bpr4Bpr4JrED9HYfdH+0XkohWIgqIR2CEML5MfnCt+ZjzXpjykV9iFuSgRu755EqHbIS2ELDuDNmN/CFOQBwYTwWFND/JadCnsPTf2ZBqYyR/4vHBd2ppwEvkIbORzIZiigwH4Mn+DZPMzQCgzDA7wIeyXjwEIMyyBE/gvBegBcQSd0Q0zYMw4sgBLoEPZKOoEDeqA6ZhvmcdykdrMk7BkHqps6Ya/Ua3c/Fjiq3SwIe/Yf+JOBtcJe+Q/8E4HZPgcHcxnYrN1dCPvAAte1m2SBe9AKY/Au7AMLfIRjWIQaYZ+2oAKVQyiCG2GXlmwD54W9jgP5blnYpSXbwLCw16lA/vBxKexTyjYwD1bp+49nKpBVwQ7Z/yownvHHPHOeNLASmgTl2o1SCtWCCuGWXzR9MEv+i2gEGuGM5MDId4G/7ZoyDOwl/88XtDXy35KsOJYscNM8zoVkz0FXAntcDnxCU4XLgdOfTQ4G3pH/9pP/JTAau9e//OEvhHp+WRc0Q8F+vIObEoGusgausQausQau+QDogn5ctL3m8gAAAABJRU5ErkJggg==", "nfl:NYJ": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAACoklEQVR4Xs2VzWsTQRiH3zRJTU3MB822jZrGhk2rkJq0TTYf1UaM6QdRStI2fqGgB5GCoIgI/gOiF73ZQBGxisdcBIvkKlr0InrwonjUk4qggto4sybLTl4jSa3wTnhgeWbfmd/OTHahUqkAZZCgBhLUQIIaSFADCWogQQ0kqIEENZCgBhLUQIIaSFADCWogQQ3tolQqgaIo/85UOqqkUzLya4Bn0gIWi0VYl9ZmMEMm/AyG/NfBavHVd7fS1EzrHpC3LkcKCrtWYW70B6SCDyGw+Qw4rSE1fAvt/wXkLTZwm4WsCMyOfoOpkVewZ7DM+pcg1HcF+rechV7pIEiO3bCpQwazyV4borWAPa5xNslPjcmRFxBnIRqzxLizJiLyDfD3nCzeXLQ2F9BgMMHE8HNtJfjWOa2D0O3cC173HIKvhqW9G3k9XY4x2GB2I6/rb34FZc9pYasichEc1iAL+l3Yvlzig0qvVGD3LKjX/Czqa3OJj9V7DkFi+73ftcmvWm0Nn3S4uYD8TEzH3gsT8NUZCz4QJvZKM2AybmSrbdRqO+1xIeC+0GMwsF9930zyCyj9t8BtT2q10OwZ3LntshBkh/cieFwTgqsxHXvHHshRrTRAOvRI178qBEgFl1E9JxNeUWuhmYA2i19d/lpxNvKarZINJodfao5v89bOXPVfGNBqfdIRYeL4wF3dyAAuWxiigUXIJz43ug8HDPVdZU9W1shG3gjF/PDKnnnB5RKfhJoh/zUwtnXA/uhb7R6+hfylXT8+JxN+Cvqt1r3chYCl8rKsXDr1hLHyR+aPLiiJeLty/sR91KfnwHhamc0WBHc8f0H9/P1tfM6x/LmGnzqqIEENJKiBBDWQoAYS1ECCGkhQAwlqIEENJKiBBDWQoMYvMnvFJY/kNEIAAAAASUVORK5CYII=", "nfl:PHI": "data:image/png;base64,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", "nfl:PIT": "data:image/png;base64,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", "nfl:SF": "data:image/png;base64,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", "nfl:SEA": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAEeUlEQVR4Xs2WC0zVVRzHrwaZubm1mT1JCjDXjCjUNKoZDCRxCoYh09ChMjMQnDDAgFReUTzEWgiaPAIEUyDiIReBRAcXoSH3woXJI+XKw1KeAXGB++2cf8Iu/3MT2xqcs312/ud7zv2d73lfCQAJzzACbzACbzACbzACbzACbzACbzACbzACbzACbzACbzACbzCCiMd1aLMKI2ijVo8lTExMBJLvheK62YIRtDCMS8oedT5wHOdzS/uLyqrapQSaE1SXSmWUO4UlAh2FJZUdBZcrOyn5xZSKrjyKtKK7qLRKVfWrUtHbN5BF4noTntXRn04YYZKh4ZHk595yhMTA6n9jPsHMei/Ss4r/1Gg0h8R96oIRHmAee/qCWtzBw1jyuj08Po9FUmYhUn4swpm0PPiFxsPUypVpO49A2mpqbjTK+/oHL5L+jhDeI+iJvYiNCdz9vado6RsOTGBd6Bva4FhUIhqa2rD38FdYsnILHnvREouMbGH0zg4cDDiJ+KQc7PYMxxNGG6aZXLbGieSWWPG+C9x8IiEtu949Pj4eRTwsfZjBtb6h8RqxEV0Yvr0dZB/SPYqnTR2weMUmHItMxG1VF/YQsxKrVZA4rYTeMmtscPZGQPhpOLkdhck6Z3yfngeyX2H3iR+ef5NsJTIoGtPc1g3VtcpbxMcqXQbnE0pTL0iRkJr3ryRmFArGRkZGEZecLcwGDR4cnQSaRtVjxLA9JDbmkAQZQGJvBsm6tdjlGYb1H3nBJzhOaKed5A0t2LbvCyHOouUbUVGtUBF5odigQ1u7CrX1yhlR3mzG0PAw6snSGlvsFALTmXI/cgLNre24obiJmITzCPr6LI4T48kZBUg8lw8Tix3o6PpjmrnJNDGhIYMIF2I5Hwim0kZtc/P6Bgbk6Tk/IzXrp0ciMzcfdEA9vQNw3Bc0tfSLX7XDh84+cHEPhYtHqJDv/CwEnoEnUdfQPM2UOMlqGoQYFvYetLhf26B5jVzBmJiJtOxcYrAP/mEJQuD1jl5ov9ONSyUy+JKldPeLEXL/kFMIO5GCtIvFwuyOjqqnGZtMFdcVQpxdXuG0aKltcI+0/BpjYCYKy8pxpaIWeobWWGO3H/d7+mCz3Ruuh75Edv4viDqViYCIMwiN/QGR32UgJCpJMOtJtoKHfzQivknDb7c7pwweJTcC3dOXy6u7SVFf26Bx6632v879hyWm1CmbEBOfKYyaXhX0OnnBfBsCiSl9Ylp88gXIiX3qtc2wJgPZ4uIPq60H4XY4Qjh4Bqs/hr1rADQa+FNf4kPyLrmHUvoHBq/29vfLHoXBoSEZeRVk5GDI6uqbpyCnUkChbK2k1De2/UNTWyVZ4pprVfKmnILy+9+ezdJ86hsN0w92Y8HLNnjGbCu67t4rw4M/KmKDsw19OV4ibJYrWzqfNLals3iPlF+ZbCP+wVyxoL6xpa3kak0H+V6tXSduOFd4qsfGr5DcRFwnbjhXTL29YhiBNxiBNxiBNxiBNxiBNxiBNxiBNxiBNxiBNxiBN/4GpmUf+JXi6VEAAAAASUVORK5CYII=", "nfl:TB": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAH9klEQVR4Xs2YCVDU1x3HkWhVhGVZjrgcgpwroBBEERAdIRxBLsMN4RZZBAG5BEQ5VdBFdjXeivFAEZTDcASPaGM7tkljOrV2rK0zUo1N0yZarW0Hu99/f/9VGPa/i2vS4rAzn9nl/d/x2fd+7/ceq8UwjNZkRqVgsqFSMNlQKZhsjH74+9N/aN37+s+ThRnETNZpVPDOvT9pdV386WRBSFSyTpNV0PbY2Z67/6ugbvelzwJOdPYW7j5yfKf04NEPD5w4s72j/1I+PfMjBGravC6BSauzQE62P0bQQ7L30LFVMfHf+dk5IVDHEPEzjJikmcZMNL2vNDBFiNsSRMUlPquTyPo6Bi6vozaz1fQzLu39l8pt7OxJ8H7oDxF03L57/6e+7kuQqyNkuvnzmGuC+ePyiYETU687h4kxnINV74U937R1+8Vzg1cSqR++mr7HIqxqkPzCSI+HPw49EL+OoPbZgcu5iemZj/1pts7yRRiRuEgSXDGWLr6IyTYTYcO7IShwXozyWebYpGuBhLlOSIiOf1TfJOto779YSn1HEO8SIRQuuRQq7ckp6Y/FxjbImW2PPwzdz9Yk+BYh3tq8ezgsKgYxcYnQmzqNuSJwVoikz3wbP+PIsdKJweH463ffMyOvW7duITcqDif07Zmr1HYvz4bJ1zNHlp0rUhd4IMHBFYlGlqicZcH0Gjgq+il0cGdjMFKTIMtPaGlk9F7TuGsfHGfyFDPIDrTAzkHew1nqRj0r5mRHF+Ry+agg+xoeHmaSFy8bnX1N5Hn5s4LumgT5bb2Dx9LEOXcCPJbKY3VMRr8hK1ZUukFeqm+pNOh6HVMcPHRY/vjJEzx99k8lybzCEpwbEyLj8RkhjkseJied8QQFnReurm1p66yrrG+46eWyEOHTBTg/ZrbYZS4uKUNxePTogD8nsoNCkZSahtTUVOaLr36Dh9/+DY+ePMXde0OIDVmFS+PE7ViO6duhuLL6K015cNvqtXlw1BOg/+WscREv9Ufn+V406VsrJNl4zFgegOuff4HDLUdxsu2MPL+oBL6+vqiqqZWX6VlonD2WfAMrHO/8uEGToCuxr3aH9N8RMwzVdlyjbwXZgcMoTUwBu/Ss4NrgVfJFS7wwdP8BqmtqcfvOHbSeOg3Zrl1KKzBCB99Bpe/UZQGgsX00CSqg7d+00EiosltZ2FhJd/XCibYOZPn44bKBM5Pj5YvMrCx5RUUFrl+/juT01WzSxgahauxVG9ogmjdbqfw4LW9Zdf2vaOwpryNocLC1/UqkjrFaQRYKeiYjIQWSZhkyHBciV9cMn395Q97a2orMzEyUVWxEhssSJYlOaiO2dUFObh5k+jZKzzJN7fHy9FE4jSeo3dZ7ITclKe3RB6Z2qKIke4hni09f5r8R2vgOzGGeLVMwyxSR8YkoKimFk8AI3kuXoXn/YUh2SpFt5qBod4E2xw5KQYXOHtjZuAMfnWpDkVB5edupP3FWzvc0vt4rBVvOdEnDFywCK8CdsRE2681BQlKKvKCoWF5QXIoVzvaQiqbgdoILvom0Rss8LWaRPg8lywNREZ+M7PQMNEqa0DNwAeuy81BuYq+y5GIrZ5zqGWgc8VArSAf1mlCRCwY1pAN2RtIMLWFuMQcrIyLxgREPct8pDNJcgN3FYNr3yPvdtBEdEYaUTDGS0zKRExiBYhM79KnJCqfplKmoqntADoavEhSmi3O+pTzEsPmqlg579obiLzBFoKU9Vs6xR6D+bMRR2WZd9liax2ziWWIjfy4a9CzxiY0h/rOCJH21GATzmIc+Wkg2nwY/0QK06tuPG8cs2bTZaPycMWGmKtja3b81wNgCdMYyztZ2WFdcduvI6XMS2slJ1CCYCKXP6ftPtO3KKym/6ebqhqDpBgxdIBSD0BdCtcHbuGpHaUnER7M5D6HePijfXIO82EQ5exZzxVi28K2xY8/BX1P/U18puL688vc62lOZ+JT0v7T3XcyiStPGNuCgTays2ia5tsDWAWtmzlYs+3ma1S26lsxWgs178aJ3IDQ1Q2RsvDxs/kI5dxbZ/JkRGf+868WtRmkMrqB5UGgEymq2sN/EjFv5VdCxGFFRu/WX7o7zETFdwMj05lKIvNjx7O2GFT5Iu50ygSKZs6mJrl/Me3S5FRqbsBujidsnC1fQd+f+I7fpgTm34mvyFolGbZN+2B3yftS/3hE5wWOWAIHT+UzEdEOE0FnuzxfC08Ianh4eiI6JQWxSCvJKK+5TW301/akIRlKhC7fSj0SH8KZ4zWz7eLD8ZFdfFWWHUvq7JTgsHAMDAxDnFyJgZRi7tGxsc9sr4AoqkuMEwF56jQkdmq3bUqkU6ylv+gUFgzbgPjX1R+EKqlT4f9Ag2zu4wj8IG+sahlJSUyGVyRCXnMZmiLv0XJdbfyxvRLCibtuXIkcnWFhaQSKRgPIsO3vPKV7HXdoR3oggxV7JEi9v1O1oxnzKm+4enqB/yrdz66njTQga0GZ4KNuzV3Hc0S0Znj7Lse/YqQNq6qow4YK0jNlu7otwursPiz294U4X2TW5BaBT6Aa3rjomWnBq5ZbGGxmZaxAUGg7LudbwoGPPZ4Uf9hw92aKmvgoTLagVlZD0jJZYbusggvfyFYrlpdvyb7te/HqlUp/LhAtuqK7/nYubO8prttzsuXxtLSXqcCqfxa03HkqCE/QDpsnQ199E0btAzTONKP2AOVlRKZhs/BciwaO0RzLrlgAAAABJRU5ErkJggg==", "nfl:TEN": "data:image/png;base64,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", "nfl:WSH": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAEg0lEQVR4Xs2XaWxUVRTH37yZN53NgpVKJKIBYzBFQ0RFiSZKon4wRg0SF0xAcYtdqNjSIE2qxWBtaAFXaCRFoChUKWuhiJhQRBIjxgWXoFRiqhFZXCgMoXCv5/8WXuedO3XGT/fDL2nP/d93/u+ed+69Y0gpDZ1hAd1gAd1gAd1gAd1gAd1gAd1gAd1gAd1gAd3w/0n3Fsnjn0zIkcsIwyWpGA9yAxEmChVj2Un3FvsGexoL5TbjV0LmwC7CcHlcMa5iElFM9CnG1PQ0lhgDDCLZkxhovTcm541NKFk1uQCT+4lR0jHYgTlfN0SYFtQTR9pMzGly9Zu+XRBmuoF8VheB/iA8BQ2axNaeN8OifGhKPpPilF+YkukNITygihhOnDzUYoq+dSFZWsj1YEeFJUjX4xp87NT6kJw1PMl0HudfSGEQXE2cWfNQgQhO9PhiXgQJdxKPnu00ZNPEuBC0igsmxJVzFt0chx5JS4ix+HvhxDjTgfqShKedlM0gaD7VEZKzL1W/ZevdMTwEZd6NciGGVd9RbikNlg1JyT9WmphTS5T+835IzhzGdWDjjCh0PxLhwQwWEYfXZlnF6hFJeXqjXWa59uECO7aJHvz7clNkK/POZ+0yf0p07q2NsHGPg2+EoVtk+xjEIFj6w8Kw0iDYVx8RKO/zo5xVpo9byC4q943qMlNJkfgc0b/0jhgbBy9dk7A/FdLcmovBe2Bg7uikMmH3bEt83+yU1+PoalN2lUaV+jJqupPUHP1bDFlZrP501k+3y3uMsHIxGCNOtE/lZa4oSsm/20PyvQed8np8NNMSh1eYTO9xYHFYfPVy9vL+/JZd3nfOe/gPg2DDd028zK/fFrfLWXtF5kosvsWJ141JsDloijObDbl6SuZLedSMTEq3vA/kY3Daua2GfO6STCO7ayzxS4vJkqBbj6wyZcc0vuotd8YEDMJIcAyQcazeUSKVj8GLib5ld8X8hBek5J9rQqLzqShLAj6eZckDr/JV3zPHEvsbedyDSg+DbRn5czAI1n3+ov/dNF7vbLrzxyVYErCc9khBq/7CVX6ZK4tTEidN22S+smDO5UmB5qHn3v9/DM4YeDTRyonet017JYOJQHe1vd/JDx7xzSy5PWZvH2SE6QGd75hzmsCFJW+Dw4h+Oj1sU7+1mmLzE+ryVlzkdDfpT/z0ml/OvXMtgZMmqPf45hW7vJ0sd44GwR7cMBrGO5txw7Xq8trd7XRiHZqrik4cnCw42nCEBfWg0u1umlPK8uZhsAo3mA8rouLYuyGWxAPdTdoviaHEXyvvKxDNNzkXCVwCgnqA7iZtmhjB8uZhcAxxFufvrmqLJbFxu5t089057fvo1rO9LCoOLcm+eaO7SbtdkTMvg6CbsD/ouisTMggagcbBda5+Kl7oOK04LgpBPcCqortJ+7QiX94GayS+r65B2Gbsl86lF3rciHAl47rMOXipkYp8AYPpXu9HUDaGsB81nNGBOeMUmiDjA3N8yJNvUFNYQDdYQDdYQDdYQDdYQDdYQDdYQDf+BRLfdxu2goxtAAAAAElFTkSuQmCC", "nba:ATL": "data:image/png;base64,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", "nba:BOS": "data:image/png;base64,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", "nba:BKN": "data:image/png;base64,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", "nba:CHA": "data:image/png;base64,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", "nba:CHI": "data:image/png;base64,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", "nba:CLE": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAFcUlEQVR4Xs2Ya1BVVRTHUTGdMsWyKaOQJm1sNC1NnvFUuIDyhgtFNE5OZqU96Wk1heHgJOUrvwnJRUDw4ggImgpc3nBmapwaP2ROD5ppxhonsqxBbfVf5z447L0vXJBm7offXNhnn7X+Z++111rn+BCRjzcjDXgb0oC3IQ14G9KAt+H6Y3Dga5/zTR//X9wFEkEB2A0qQZ3jl//fBJaL91260D8s8NdzrT7aZ7mTxVQQBIpAd2+JeajtlVQ6YU6k+jVxdDR0NVlXxeq/DfHxdGr9Our+KOtfzO0Ej4MpbOeXL+snXeBSUKztyx2wvZ6mO68KiKDSKUFU6jM2NYujqPWlVIKNFhA4mQJXgyM9xdlXmzMTqdL/Mcm5x0wNouMpJsJDXoDAgBsRyNuYDfpsBWlUFxRLZdMUDsHhhZHUnJ1IHVszqO/THN5OfYvFecyh+eHE4QC7BIGbJyowApxufyudrCti3G5h7dJo55ZJ2N5IHzG3bHowHU824QHMrjkTEfgAqO14N4OOPBIjCXJSFRhBbS+rhYHfwUDrllTXfOujMdRVmCXO+xMCTZ4KnA629H1iHmxca9KfVhSlg/g5FhtH/btzRGdXQQPIALNBeX18HFXMC6NTG9aJc5kasNjTQ7IcfHVmUzJZ/EJlUQ4O3hxCrS9Kq8bCysACg71AxOFQM1KO4kHaNXv46HM9Ebi5r8T8B+crd3HGWG4PI45Hwdl3IFphc68wj/kZPAemGeeOJvBWUMOn6ZB/uJ6fGkzxZA2S467iznDq3i7Fzz4wy+jMAefJfwzzBkEhuEUxd1SBO/t25VArBGIFdWMtz6dQme/I2LPcFkadH2QahQ2BAtGRAYtjHleNOrBQMWdMgVyirjkM6Zx5Nlk6GBxzne9nGMX9DRJFJwYedNjtAcGK6xIqgTNBv2YQ1/5OBn0+M2Tk1uK0nt6YLK4c11DJiYFisEGzZwTxmhKVQDbCznrB2a5tWWSZGybFXVNmglEcb9dTonEBrjrKOBsNUSCfoGTgDxahFl6sXhQpieMxXDMK3C8anixEgc4LLLSHC7Yo7uCsEOJV1YbFNWrj2LIx4IUJMI65E/hkx3uIuxlyteCCrw2LuwjuVjgaL3PAVvCbJpxqlUDOfz/ULImSxFXcEUb9e12Z/zpIUzgbD6tAKarK5d6deiq7pDkaVScqgRs5daiqhnAwOJ+JDj2Bk3cesKHlus51/WR+ktOmTZyvEtjDLbkojnMgmlGnob/AfNHYKHBMmzRerV05l7k54MrESb7ttTTjQ5eI94oC52j7c69V3iN3w9y2GwwdEA25YQnYBs61v52ut//ljmajdlk0dRdJ5VFKVaLAGI4FTsKiwOr7I42GEkRDDnxBlGbPpd/yQWtMMukdstNO+exQ+iJ/rSiM2QNmiDZFgXnd2EZRHMMnuqvQVXOfAXPBPLASPA1Kwffc0jelJ1D1fcKLEv7mzlvRVFwBr2rC4XAiCsznBOzcBhGOmZN5SSh96ciFmcRddcsLKcQvSdaVMW7vO4zEbntTasWYs5q9u5GEuRMYxzcei10jORE5oBgTqVoQoTcZQtVhuInlMOCUJokaTSDfcIXj0Bg344GbirrgWP2FSBDlpAksE4W4QxTIg3q/xrHCr5GqfChSdlMw1T4UTSdyk6hnhysViXwDntDcxJo7VALvBT9qDsOcCvjU1eNFqA7vsRzoR0Ni9e5aj0e0+f17pPcKI/wpw6zZuxlJwFioBDIPg5802Zmn8Mms1OzJeVwrJuJOIOMHPtTsBVwUoGJAs4cHrxYXf8nZRBgh0M3nNz+QCbYDy3n7JzMrKAVFYD1YAXwV994wIz6/eSvSgLchDXgb/wFNKFQH6ngXbwAAAABJRU5ErkJggg==", "nba:DAL": "data:image/png;base64,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", "nba:DEN": "data:image/png;base64,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", "nba:DET": "data:image/png;base64,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", "nba:GS": "data:image/png;base64,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", "nba:HOU": "data:image/png;base64,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", "nba:IND": "data:image/png;base64,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", "nba:LAC": "data:image/png;base64,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", "nba:LAL": "data:image/png;base64,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", "nba:MEM": "data:image/png;base64,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", "nba:MIA": "data:image/png;base64,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", "nba:MIL": "data:image/png;base64,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", "nba:MIN": "data:image/png;base64,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", "nba:NO": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAFDElEQVR4Xs2Wa0xTZxjHccM4FpVtus198IKaZU7AKISLtxbshV5OS1tKUS5SWi4DaQs6lVrLHRFRt0xWBipusMWYaCSwzKG7ZBns2xaTzS1zn5YsajZxflBCdvnveY/I2h5EdPvwfvglJ//3ef7Pv+c97+mJABDBMxKBNyQCb0gE3pAIvCEReEMi8IZE4A2JwBsSgTckAm9IBN6QCLwxefHn+J2Iu7d+eVyeJaKn0OdPrIXrM4Jlmgx44/tPI0Y6bQ9j3ledNtmFo9adnV7TSW+ZMOzI0f7syLOMleRn/k7rKcQyIoZILiWNrbEab6kwHKAe1ss8mNcU/iGwTA8L+ASRdK41q4nCjFjNxj8KS3fC19qFrt7zONHXj1OnP8TN0dsoKvOgo8Z002gQ/jIQx/aabtpL3Ri9dZtqBsVa1uM72AXmwbwo9Ah5N7MZE7NmHHDRx/RLdzmFyzqDBeV72vDOu+fwds9ZVHgPI1HjRNQKBebEyLAgTofT5y+ittwAp2s/rl3/Fddu/IZitx+1FQZ8cG4IC+P1Ym3Uii1I0DhQXtMuejHP8r1tYDN2OoTLdHd30eyXpgu4usdv7hEE/XjBjlrRoOmNUxTIgadXyJG8WQnnNh3e3J2JgUNWdO83I8VQiqKqFhz0GOGtfwvfXfkJ3165in0Nx3Cwygi7pwnrja+hy2fCQLtV7C3O1SFZphQ9EzIcaDraI87aXlkHQRDGT/rNpyhLbHjAuO3Z2rGFsVr4aRssTi9mx6TjxdXpaKg04MIRK4Y7beitN8Nj18Ooz0C6Qo1XZLko9DSjmrQUlR0FW6uQv9WDVLUdVaQVuBrxalo+1apg1GWIve/VmTEcsImejZVGLIpNp1lpMDu88Ld1gWUosGrHKFN8yB3sb8tqsJk1d59aLkfEEtkkazcoIduiQoZaDTcN6GuwiAOO+8yYu1IOb0sAsckKxCzZBN9ziSLL6TqONLbGarp990K9T70sJPNinuvIO3gWm51t0tylLI3hd1Dcd3r2aqjp71mL/21iCPTre+st4hblW7XIztSAnlG8TrC7qLS5MGfxZnRHr8NxIoquFdmVWCXPwy7HvTrWw3qZRx95GWgXgmewmWvXK0EZ9j3oGbxPZk2JMB7cLBoQhTYtBulZ6thrQp5Fi1J6nthWzl4qx5n+S3C/kALP88k4QwcnkjRPoR5lVMNq6WSLvXbyYF7h/nuKhXGabZrukExC26FqcRu/ZlsXbBK5lE4jbcNGuUoMye7OmhQVCl0NuHIpgOJ4OZxxMvzwSQB2ev7WpKrEGla7iXpYb+Sy0GCrkxRodhm/+TJgUwdnmDbgBPPPtmYdyrNqRzekqfDkUumvTtioRJIiC58P9oknuVqjRLVagTY6wZ8N9CJZmS3WhPcxL+bJvM8eyGqnWdHh82cS8D7zaGsOFW3VXU9TqrFwVVrIsLkvq1DrzkFFvh5H8jU4nKuhax38rhxxLbh2AfXK6fQzL/JkwR74j/IoAYPRdvtM3fR6+KiuwnCxa5/pxO5i4cfykiKsp/fkHnk6aohUumYaHY6rrKZuh2GI9bBe8tARs6bwDuFxA0r4oiNbnWvRjpmEDNQX6VFv18FsyMA20mhNE14/U/63gBMktHqMQ/QaucM44DYO0Ys9cYq6GRMS8D9+bgXDPruemUJ/ZEI+t3hFIvCGROANicAbEoE3JAJvSATekAi8IRF4QyLwhkTgjX8A65V20pGdqykAAAAASUVORK5CYII=", "nba:NY": "data:image/png;base64,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", "nba:OKC": "data:image/png;base64,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", "nba:ORL": "data:image/png;base64,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", "nba:PHI": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAFAUlEQVR4Xs3YfUxVZRwH8OeKCCkYyCJQGm8XMl6EcYOhRZiaLxmrXCAUNmqxnGkvzCI1w1yKKdibS2ezKKetNttsszbTzVrZ23pRE802tRLGJXJZOizL2/frOSeePfe5h3MusPnHZ5d7nuc8vy/POec551wRCATE5Sxow+UmaAN1nT4ntrx/qD+xmm0Dxtr9BvzkUIcQk1tVMZBs/l0OuyDb/H6tpn9YWDucgCOgBV6DkTAeXoYrIBUOwJ3KPmEJJ+AY87MYStUBYTjcBlnggQhNH8fcBkyD92CmOpAGg86FR4Qxs2q7I24DsmgD5KsDhfAktGq2O+Y2oHV4nYoyqdsdcxOQV+jHMEUdxAYPbQ3MEWZQT3AfW24CsliT6FtKnOBF8pKQDnNR8RK1jy03ASmcwxVtuvR9ou8Jtd2Wm4BcmJuhWhgzEzRYCCXy96EMSKvgfnUQG3nQDdP5PaO0STzunaf2seUoYNeX7WJa4WPcgYsujVUH0uDdJlYYS1LiPbnzxbakWWJVWpXaz5ajgH/v/ybuVHR+2n3X1XOncfCVMA510ICmJHgFZkSUt4jVaZXCH5WbDGJFerXa16I9bZwG9GHwE1BQVrR4GHasgwnCmM3JwljAOWAOxJvFNkLFioxqhpsLLxwbVSQycZiFcdFw6dkijH+2E3rgoDDu6enmeK4CBuD88ZGF63YnlMctzbxbxJat8WGQM3CDMB4aPoTN3tKmiNqcBz3NaZVjMPOt2O8iVN6V9xCLcuY7IGDjrNnPdUBLJ6zbkHL7jIXZdVmVeQviG721YkphQ/7sCQ/nfTu6pADty+AU9PLznaunX4lFeg2KXpSC/AHL4Q1NSLaNDTeg7AIchwPwA5yV2jhzbx2J8T2bMmnlYk0IniqcVV7tahs1DkZAO1vh60XZdbNR7JxS/E/Rt4AnQK8m4KtDFZAztxn2H4wtXh9901o+oqnFd5vhLDs1fZ4eioBnoAF2QWdD1r0FKHRBU5xXqxyQFxxn1Wo/AcmDGfA0PAeT4Htua4/x1cSVNT+gCUdLlICUAvPgDhjFbU4DZqLgXjgMv0AHHIN9sBGqIR5uhp8ZDj5qyqjhesj3FjUczYdIqIC1sAmWQRGDWZwG5GJrx+M3DiuvaIbr6YrK9aZOfIZFvtCEs2bwiGY7vS6Mh5NBCchw681glvqdV01lOM5gqEWZ65y6TbZVDELAYfCiEu5T8Jj3bd5d1OVF1gZcH3/VtNHUgQZcroSjOd1oyyl5igFHw1+awvST6LuHL9S007aBBKzyG+udHO4oDD8cc72IMArzCVxeOmScPeti4Iu/2k5+BIwMJ2Au/KaEoxa270kol5eOk5rCxKdzqw+fgHRrZQABvW4DRsJ3mnB0K/u8mzhNDrhXLWrikmL14S1PO9MI6HMbcJEmmCWJfXYk3iIHfF4tapIX6pCnAgKOdxNwnF9/aOl3s48akD+TBBWGpVKfOKE/xDwHR7gJuFoTzNIeIiBnp0tTfKXUh+/aaju97eYq5rnXrQlm4fqnC0iPaoq/KbXXatqpzE3AGzWhZPtsAvINj49XcnEuztcI46Hgc6Xt0uxxXzcBGzWhZJ/ZBCS+gqoh/4HzyjbaLoy7kKuAG2AP1APfOVIgFUr9xoNCWz8BrZlcAD9qQtFRs/3/Hz0dBfzX3yN623akAz/7dXL7B0E/hmukwiyoggrI1vQJ+hH9PzRBOF6TEfCrAAAAAElFTkSuQmCC", "nba:PHX": "data:image/png;base64,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", "nba:POR": "data:image/png;base64,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", "nba:SAC": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAHmUlEQVR4Xs2YiVPU5xnH06YzadJOr0km/QNak3aSmjudJpneaZtJaps2zZ3JoalXhoTbqBwLKodC0ADKoVyCqFE5V66AwALL4bUCDoeICiqLXLuAnN88z7O75Mfvt8IuyWTyznzm9/7e532f97vPe+7vNgC3fZvRFHzb0BQQtxN3OSn/pvgp8T3Hu9rIsLhi4kdObA4HLzkpd/AMcZ+TcuY7xJvEHU5szM+JBuIHjjJ1BYYFctJD6+gnRBkxRaxS2RgW1090EMuc2HXELLEfWt8/JoywpcUFzs6yH+QTP7SXi4P+niEcT6ohO2bo/T1Fu6eJkfqCc2hr6Oa2PcQv7TaOnG5qcho5OytgHRpjO/t2iLyHqJ28yb9b0uICC/dUY8xyk7O5xN1E0Y3eIQS9sAfv/yoUR6I+Z9sk8Q7xFGGuL2jG2uVh+Oi3O9DeeIntbbCJ1M3MzM4m+RyTtpFvpDlEptt9GwauDiM7jGeWpMUFxq0/iK3/24uRfiu/Dt/oHcbHf/1UOnBw9JNyHjCOpLVR34LVD2yds33waAQ6mkTkMEfOIc5B6ItJGB0eF/u1rhvY+GwsYtcd5HdOrglkRyyyp70PwStskVOy9eW9uDk6gaaiVqx7KExj9/xdFNpJZLJKHLP+4XB0mXoweG0EG/8WK2VLEsj8/9dbNB1seSkZYyM30VTcitUPfhk5Nc7aejyxHeeNF9HXPYBNf4+bK1+yQDWh/0nCkNmCkyXnse5hbeQWguu31nVhqM+Czf/4UhzztQgM+XciLINjOFV6HmsWiJwzPJ6IRLPhAvouDSLguXiN/WsRuP6RcHz45Ha3xTFrfrNN2t4q6ksTeL/dAT1XKfJzjhX5eXYX6s8ru38JAkvTjNgfrIffH3fKfKvPP4eIN1JRll6PmFVZKNlXh6K9tYh4PRW8B/Jq1tEUqD58CmfK28BbD++b/Ez2PYZjtC0VU5skn6PIj6tCSUod+ckUH/oEg/sC4z84BCOJinwzDc3VnThX1YGotzOw1z8HHo9H4kT2STQeJxH/3COCWmu7ZFtK3ZSP0lSjiNjy32RZFFmhx2Xzj35vPzKCCsXPp2uzqZ9DiPc4LD/abYGfkLP0gAL4/j4G4a+lIPzVFHg9HS1l3BGXbfjzLnhTWRjZ+N3rqShZAPzOWxHPubTN+Uj0OiLi/f4Qg8Dnd4tPbsvv6YEFMgpuCew624PTn7d9o3CfLgvkoc2JqZBh42Q4ekbe2xq7ZR5x/qKpF9WfnZa8En1iDaYmpuVSobbxPOQ9kJ98cVBizDNJX3BFoGMVs1M+6nhb4fOVbzMb/mI7kysPnsT2t9Ikz8Ma834W1i23bSGdp6/A+5loyfNw81xjYmneXT5/HSuXhdAqD5GpErwiQeq5NcRKgRmBhZLPDDkurZ0JLEquFRvPLRF46vKcQFMlXw/p6jMxJZG9fvGGCFy5TAfz5UGJKJ/ZvR1mqQd3BPINRc5T2qeuXuC76NIE8rn97i+Chaud/XNnNG/ea+3wSrcn1wUmeB7Btlf2Sb4is1FaL0kg3S1X3meL2rh1Ah1kP1vRLnAfXI+H354WFHgn11AOselEh+T9/7RLrlfuCkzdlCd7Is85FjhAVyxuW3XolLBr9QG1QA7SLQV+lxjP1OmxmSZ+WVq9XP9ZML83FbUg6p0MWRQNfEL45Ug5nx6ceFPn90st15DkfVTySvh6xXONn+xDCZ9a3Dds/yxvKZBpZ1EzMzMa7P9V5Km2fVXsvtuVWtTCHOSWV1TAf+PHGrZHR4nAY7k5GttXpbKqil3nuCLQr7u7Gx96eTplZGQEJpMJYRHhiIzagfDICAQEB2nqucuVK1dYoI8rApdTuGeDdMHzHLCYE5WVGB+XPzvzEg/PwOAgzprO4tDhwwhUtV2M4NAQ9sF/wB6ACwKZ4tKyMmns4++H6hqDCJmYmEDnhQuSb2xqQkbmfmRlH0BuXh6M9fW4dv262FjwueZm7E5M0IhxRnlFOTcrVGlYUOCKsbEx+WWnz5zhxjDU1ICj6uXrg76+PrS1t2k6YqJ3xlCkT8xFurmlGTto7qrrOdBRH/a6z6l1qEUp4a8BVQMDA9wQhXr9PKdZ2bY9a19qqqZDBzzxc/JyMTo6KhFtaGzA1rCweXU+8vZES2sLu+IvAWoNCwpkHiWsPb298PTxnufY288X5n4zzGYzfDf4a8Qp4flYbTDIVjI5OUkjYUDc7niZ0zwqlIaJB530v6hA5vXp6enZ1PQ0Tcex8XEgG0WmkSLhpbGr4ejV1NWKSEXihfGik35dFsiET01NISVNO5wFep7XND7l5RrbrQgICpQFBtuXrgAn/bktkFlPTBvrjTK3lB0aamWYJJIbNm3UCFLCbWspiqRsArYPT+p+5qEpWIR/EZfN/f04cDBbVjN3yvOzpLQUnHh1JyYnaYac6/J2xHOWUifxrBP/GjQFLsBfXrcRgxarhaJRRys5BbotodidkIBeWlCc+ulHFJeUyD7JdSwWCxfzJrkZitvKYmgK3OBewo/gHVy+PFqtVgwODXFWmXgoeQvxIH4GrZ8F0RQsEb5gPgbbt+s1xGrYVuZDxPed1HeZLwDl61dMQESOXgAAAABJRU5ErkJggg==", "nba:SA": "data:image/png;base64,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", "nba:TOR": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAE2UlEQVR4Xs2YeaxdUxTGX6tqaqIalCBoiiAiKEVUXySUJq2g2qKaiDGEIIYEoWJIh8QUUyjpHyViFjQiImLWxBBzCErNMXxmD+3zfXedc9+66+wzvCnpH7/ce/bZe+3vnL32Wmufrt7e3q51mULDukb7z5qPV3f1LFsxEEaRSWQmmU9mk8lkTHZ/PBmZGFeLNLUFqgEbdTdlFJlOHiN/kt4E/5BHyYlkNrmKTMvGRntJpKm/AkeQOeQ9FAVV8RDZnzxOXifHkJEo2h+UwH1hxj8hN2fcR54k36AoKvI77E1elF2/RiahOM+ABGqZboMt0fqJ+xPIg+QZ8gZZi6JA0UNOIddm13+QU1G01y+Bo8kGifYqtJwPkLfIt+gUuYbMJTe5tuuQWPKmAgeDJh1DbkHnW/2FHEDedW1T4vihFLgZbOkWwN7GHeR2cjo5JOtzKMzvckESJ5GKAvLnWeTMrG+LgQrUTpax48gJMGGrUPS3HL25G8nRZE9yPEzQcrIH2Y3MIz+TX8k+6KfA9WCitshQqIgimiKx75N7YCKXwkT+7fq8g8wf6wRqty4iX5GPyL/kS2doqLgMJti3HYsagbuTVxLGhoNPYX7q214lrfSYEngk+SlhaDg5EEU/7k4JPB/lQbYKObd+41g9qDaI4uIZsA2iIP0CeQmWiRQPdV9vUQlBO/lWcmFK4JsoTl7Fd7DwsSHZm0wk55GzyWlkSxQ3XP5/V1ja0wNcQg4jL5IV5AYyLQrUplAqiiI8P8KWQr9fwEKEF1CGooBSmlKbqhz9eruryX6hbS01jfMCdwkdPIr8Wo7NYRPqYZQCo5DIxuR62MMoxUW7bTGwcNPRTk2TvUAtle/wGbkbfaKaov4nw/z5cxTFlCE/7Hiz1DTLC1R2yG9eAfOrOHkdm5CnUJy8CaqU5NPtNmo6yQvUDtONK1GcuAnaAKqg48RVqLZcTI4i42BV+p3kL92npnleoIrJJTCHjpNXoTetYlY7LwqIyNdUJMgFFFaUm3UU0O49iDwMiwIHkw+paYYXuCmaiVOe3I5sTc5C8/SnVHk1zIaqHxXAfuNIoHa4/quOnEpNE2McrGMr9FXDMSinUBEgIVPJtjAb3egL7DkSGnfxczEORjEePfFdwUAdipXayd6OcvwHib6rYLWhb1vZVODOsBIoGi1Ddd0CdGYRuY5SWHxzOdpcKm5928ImAnWG9WV5HfKhQulO9kK1S5xL7nXX6qvDf63AIxLGyvgPFjKiDXFNor9Hx8+v3fXTZESVwB1gRaOqjmisjPvd+MjKRP+ct8nM0CZ/bGkqE6jJoqEqfiOHu/Ge8egs6SOKe4+4a52tW2OrBG6PkHYqAKzgjMKElq7s243QUUKHpDwe6gy9Yz6+SqDQqS0ajCj4KofGsTmXJsZ45pNl2X9tjBl+fJ1AcQ6sVIqG9cTfw9JUHOPR1684NudZ2EckCZM97eSO8U0ECtV9MqQqWScwiVaMK3yqCKiYLSuAVaAqf+vApOuLE+MbCxwIKiD8VwSPArmq5ydgq6AyL45vMZwCL0dRmJAgFcYKys+TnRJj2wyXQLlBqrx/GVZGSbxCUm3lNNQC9YnuAvID+kQpuyhIq/6TL2+DBsJyOgQO4iN6zgQyp8c+pM8lU8jYRL/GSNP/P/r0YW/Gw2oAAAAASUVORK5CYII=", "nba:UTAH": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAADkUlEQVR4Xs3WW0gUYRQH8GOFEARRIBU+BRKSlhVlGZX0INhF+tBKxDIpSkKISF80uhB4Tc2HjApRxNAuoihoRGZlWImK5iUtczFvWanhDTXF7Zyd2WHWMy+7M8E8/PCbs+N3/nwz882A1WoFM2MFs2EFs2EFs2EFs2EFs2EFs2EFs2EFvXq//oKCzBoSjlL06G4b8mIN9Eq5VALCN9kTjSOrDn3VpS3urIEePZ+HIdQvhQLe0mjorEQMaOwlzogvo3Cr0KhGQ2f8QGsMDTgyPAFh21IpYIxGQ2fRFQBL57BxAfPSqyncStSt0dAZ08jj5oVi27yskSv+jExBZEAWBYzWaOisXAQNb7ptc7NmrijMfk3h3FCHRkNnzCLvq9GPYHFRmps1c9bczDxE7c+mgEGqRmfQbhdsifDPgC+tg8r8rKHagGUEXpa0QG1VB5QX1ENznQXmZucdzqksarSvXrWQwtUjiAm+B5fDcp0SH54Pnc39DvOzUGSwdxTS40ohdKttT3NwPugu1JS32i7B/N8FiA15QPUDaFEOGHl63x0YH5tm87qCFVrre4GWGRttQImoEh1Exeg+OoTc0q+UwvPHTfbgdA6Fa0YrinNq2byucjigcJEBmdTwonDcbAXqUh2XIc8TO9Lo3E1oQa6fpdrY70nWyFXKgF5T4btu2xvmq8JoBexFe4W0yg/l2iByz7lRxZrooQzotYINjqIJIV3SV6pA6oC0WvR7FXqPpuT6tTC/VNvXzNImeigDOWCb3MwipBWy3/jqgAWCfwz8RGuzEypYA72UAQakS6tuGo0+aQQ8IqSXufrcJATf2odYA72UAQYMwSZDKhkoS0j3VjCqRf1op1yz+47WXT9XxCY3gjLAgOuFdG/Z+QjpgaGxh5B2+kC0esl5AQhePGtmkxtBGWDAw8LxstHqPZHH9ktM9+SeJefRgwJleR/Y5EZQBhiQVmle1ZgCDywJSOMo1KI6L0v4JENHUx+b3AjKQH6Kn8pNaSOOUIVQB2xEx4S03cygzYlRhcrXh9GUgRzQG9UhfyFtxloBSSxKQEm093W1DLCJjaIMpidnbV8T2HQZalCF0QpIqxd8fHsavK1sZ5MayeGA3qFxJ/MopK+QPgC0NmralGPxS2f564o2NqHRWGFqYgbK8j9CKT6VaCM6hbzkv4HInX5retfD/vd/YAWzYQWzYQWzYQWzYQWzYQWz+Qci5nHBllgNegAAAABJRU5ErkJggg==", "nba:WSH": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAIpElEQVR4Xs1Ya1BV1xUGbKfT2k7QyfSVZpKZtIkYq6ZRrAWstZlGkSRGaTIqoIFo0II2GpVERbTVGDNa8RmjaKKVVHGUOL6jEXlGRAF5XSKIvOR1uZfnhStwv661zz2Hw9mAYP7kzHwz5+691trf2Xu99nUB4PJ9hjTwfYP2Ymu3u1TVWx8V7gTPKrP19ftmSxCD3mfS2ATnnFF+QGBOGkEeuJaZN1C4EbzS8+/suFNelVdjaehqtrU5HnR0osvhEOB3GgPPkUw+ye4kHW+nrtFer2BOgyXoSpiWV1KeUt/YTDScT0srkJEDxH8FHI5XwO8Zt4HmViHCspamZgfpppKN6U5bRvvfieCInOLSpBbaFfGUVwFbY4C4c4C1EQhdCwwbD/zSC3jCR3kPXkWsGoBTFxXZ8vvK97S1g2wlk02PXtYZPMGk7Pw5ZTXmemG91gws30QkvBUSjPlEpKEJmPh3YNNeYNtB4MUZyljomm65X5POso1AjVn5xhqzhWzPNa43GIKuqTmFa5pabcpp7v8f8PRfuhdkuI8DnvkrcOQUcNsEK+1YPe/a7QLg+Fngty8pMnqdpyYD+74QJtk2rRHJaxnXfyhBjZz9AbBqS/cCj08A/BYAe48CmXnooCPjgCC/RNadEmR+e5fem8j92sQcsgsUQq+FKrqqnRWbAbtdT3LgBPlYNXJvhCsGn5wErN6KztJKZGQX4XxCJurqG1FwrwKJWfkgvR5IzMpDfkk5zJYmks3C9cw76CgjP1wXrewi2/QPc5Jsc9CaAQMlOKJc9bkI587NXAwUl+LMlZsY6/c+XJ4NhMtzgXjqz0sRG58Ma1MLUuiIVXLJtGs8Fnc2Dc9MeVfIss6oaatw6kI6HPRReHNJ905C8clrusDpi6ArR6vQOHCMovJPwH/jUVVjgW/wR8pCBgwdE4KaugZBLDXHRCgU7/XWJgx7caEkz3gpcBMFNQXL8XNK8OyLFUvmFpdxdAt/7Iugb4uN/KaWNnCMH3ApCWm3vu3ehV7wt/mbUUephn2vtb0dVAGEL1KSJrfbJsmr4N1PvJ4PJHwDjH0VqK4TKSgxM8+vL4JunITFp0T+RyTfs1/fwo9/HywZ1yP2dIoIko7OTmzdfwYf7olHB1US8itKgTckeT1+NGo+yaQrgcRr0kN+m8ZceiPoxdkeldVUCS4hIS0PP3vhbcmoHh4vrxBlrZV2ffbSndr4zEXb0NxiQ2dXF8a+8r6kpwe7yMXEbFAkARVVVHFaHMTFRyLI9VIkPDqayup6ygiLJGN6/GR0MFJvFqL4XjXl5dXS/OjpETAVVeJmzt2Hfqg7+eq98lpKjM1iF28UFO2SCHLhF7P0zFuxVzKihyvhwLGvBYGnJy/VxnkXp4Zs1n7/xjscOaYyHKVIdxsRJNnR443waHV5FFVUFRgJunPnwZO8K/0ZG+IRhF2fX0DyDRN+/sfuXX7h1Q+EHybcyoXH1BXa+PDx7+BqWi5i6IN+MHKeZE8Ff/SVlFxBsNbS4CBOw/UEPdnR+QmO+FRS1oMDIbewHI97hvYY9w3ZIvQ5xXjPWd9jbti4hcjMLcHuwxcle3rM/ucuYYO5EKeJ3QSp2WRnZ7A/GBVVRHwUC1NxJfUK4dJcwLI9GkHfhVuk+V9MXEzHXYr10SekORVDR4fA1mYXJ0GcZmkEqQsO5EYzI7tYUlLB/tXc0iaO0jjHCF//mUbwzXd3SPOM56etRGOzDW+t/ESaU5GYXgAHcakyW+bpCQYxwSOnkiQFxhgqbzabHUs2fC7NqVi3/YQgSIkWC9bul+ZVLPhgP9qpxo+fuVaaY8QcT5AJ8h2Cj/fE+euSwk/HhohUkZJhwg/7cfLth85rBJdtPiLNq+Agu5ycQ35chsd6cafjZ9KcR2zx1wfJBHbM9KwiSSGaFub+3rOPL1Zx+KRSwvmIo3bHSfN6jPaLQFeXA59+cUWa49LKnXvPIHGmGfaxIboUwzXYbu8Q4W80ZMTpyxnaDn588LQ0bwR3RrxTI6eu1MbcRgSisakVtdZGKc1wos7nBTxnRWoKMceuikWnv/2xtIARSekmjeC+uK+keSOmBG4U8rFfpmhj42asEWOUqE3GRO1yg0odT27YcVIIcxJuonpaRKWsP99TwT6lEow913uw6cEnxTptlFae9FkixtRAo1K3WyJIvuPNzUJpZZ0o4PMpFfAT/dl5ybiEZwOoZ7RqBM8k3RRjkpwBH+79UugsijwoansJ1WOr0ixM6o2gG7U6qarCtphzQjnwvf7rssDvAkTqEASp1edy5zoAgv5hSv395OhlLFx9QLwTh2/6arcY07lprK61Ip77NHomz/23ZNiIofT16sME6X4h0pNRzgj2d34uXM3EferaW5WG9ZW+GlZny1+WzEr2Bx1CedKcf0mGjXjCK0zlJwhyqvmV1z8kOSPGv75W6HCDy0/u3TL+56Hflp/hwRcYdcHA5Xskw0aM8o1QxbUb3nMvvyfJGeEftl3Tq6itt5Le8yqP/gjytXMuXwVZ8VBcgmTYCJ/ZG7SFVILjZq2R5IzYc+SS0OE/n5KyC4L0HPolyODLNN+N+ajD1h2SjOsxgy5HRoJT5m2U5PRYTIHIgcXk0nIKo4zrP5TgNeWvj0jeSd7KnZRu3P+wQFqI8daqfRLB1xZvleQYj5ENtXzqyA3+rw8VfONXfZJzXSilA85Z+kWXbzoqEQxYubuHDOu8Q7pqvqyoNVuNx/pIBJ0YydHNKYgfvuBEUdbn0jSEFt+w86REMDQqRlQLjtQoalLFpYgeTiXOaNUCojcMliCDj8GP763ieup8uLjXmRvVn4JghqkYJRU1NGfTxvk6yUnYmeekIzXiUQiq4L9xffhqSA1GAXVBDvYl7ky40aR0IXIot298+eHCz7WVdCY5dY32ekUPgt/xT/ThhIl8h+AuWIHVX4wpc0b5AYE5/R/4LyCz0Pw0swAAAABJRU5ErkJggg==" };
function teamLogo(league, abbr) {
  if (!abbr)
    return;
  return LOGOS[`${league}:${abbr.toUpperCase()}`];
}

// server.ts
import { execFile } from "node:child_process";
var NAME = "Sports";
var VERSION = "1.0.0";
var INTEGRATION_ID = "com.rithvik.sports";
function log(line) {
  process.stderr.write(`[sports] ${line}
`);
}
var LEAGUES = {
  nfl: { key: "nfl", path: "football/nfl", label: "NFL", sport: "football", regPeriods: 4, periodWord: "Q", inSeasonMonths: [9, 10, 11, 12, 1, 2], startsLabel: "in September", aliases: ["nfl", "football", "pro football"] },
  nba: { key: "nba", path: "basketball/nba", label: "NBA", sport: "basketball", regPeriods: 4, periodWord: "Q", inSeasonMonths: [10, 11, 12, 1, 2, 3, 4, 5, 6], startsLabel: "in late October", aliases: ["nba", "pro basketball"] },
  mlb: { key: "mlb", path: "baseball/mlb", label: "MLB", sport: "baseball", regPeriods: 9, periodWord: "", inSeasonMonths: [3, 4, 5, 6, 7, 8, 9, 10], startsLabel: "in late March", aliases: ["mlb", "baseball", "major league baseball"] },
  nhl: { key: "nhl", path: "hockey/nhl", label: "NHL", sport: "hockey", regPeriods: 3, periodWord: "P", inSeasonMonths: [10, 11, 12, 1, 2, 3, 4, 5, 6], startsLabel: "in October", aliases: ["nhl", "hockey"] },
  wnba: { key: "wnba", path: "basketball/wnba", label: "WNBA", sport: "basketball", regPeriods: 4, periodWord: "Q", inSeasonMonths: [5, 6, 7, 8, 9, 10], startsLabel: "in May", aliases: ["wnba", "womens basketball", "women's basketball"] },
  cfb: { key: "cfb", path: "football/college-football", label: "CFB", sport: "football", regPeriods: 4, periodWord: "Q", inSeasonMonths: [8, 9, 10, 11, 12, 1], startsLabel: "in late August", aliases: ["cfb", "college football", "ncaaf", "college fb", "ncaa football"] },
  mcbb: { key: "mcbb", path: "basketball/mens-college-basketball", label: "NCAAM", sport: "basketball", regPeriods: 2, periodWord: "H", inSeasonMonths: [11, 12, 1, 2, 3, 4], startsLabel: "in November", aliases: ["ncaam", "college basketball", "cbb", "march madness", "ncaa basketball"] },
  epl: { key: "epl", path: "soccer/eng.1", label: "EPL", sport: "soccer", regPeriods: 2, periodWord: "H", inSeasonMonths: [8, 9, 10, 11, 12, 1, 2, 3, 4, 5], startsLabel: "in August", aliases: ["epl", "premier league", "soccer", "english premier league", "football club"] },
  ucl: { key: "ucl", path: "soccer/uefa.champions", label: "UCL", sport: "soccer", regPeriods: 2, periodWord: "H", inSeasonMonths: [9, 10, 11, 12, 1, 2, 3, 4, 5], startsLabel: "in September", aliases: ["ucl", "champions league", "uefa"] },
  mls: { key: "mls", path: "soccer/usa.1", label: "MLS", sport: "soccer", regPeriods: 2, periodWord: "H", inSeasonMonths: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], startsLabel: "in late February", aliases: ["mls", "major league soccer"] }
};
var DEFAULT_LEAGUE = "nfl";
var LEAGUE_KEYS = Object.keys(LEAGUES);
function etMonth() {
  return Number(new Date().toLocaleString("en-US", { timeZone: "America/New_York", month: "numeric" }));
}
function inSeasonNow(league) {
  return LEAGUES[league]?.inSeasonMonths.includes(etMonth()) ?? true;
}
function seasonNote(league) {
  if (inSeasonNow(league))
    return;
  const lg = LEAGUES[league];
  return `Last season's final — the ${lg.label} season starts ${lg.startsLabel}.`;
}
var SITE = "https://site.api.espn.com/apis/site/v2/sports";
var CORE = "https://site.api.espn.com/apis/v2/sports";
var WEB = "https://site.web.api.espn.com/apis";
var UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
function curlBuf(url, timeoutMs = 9000, cap = 24 * 1024 * 1024) {
  return new Promise((resolve) => {
    execFile("curl", ["-sS", "--compressed", "--max-time", String(Math.ceil(timeoutMs / 1000)), "-H", "accept: application/json,image/*", url], { encoding: "buffer", maxBuffer: cap, timeout: timeoutMs + 1000 }, (err, stdout) => resolve(err ? null : stdout));
  });
}
async function getJson(url) {
  try {
    const res = await fetch(url, { headers: { accept: "application/json", "user-agent": UA, "accept-language": "en-US,en;q=0.9" } });
    if (res.ok)
      return await res.json();
    log(`fetch ${res.status} ${url.slice(0, 90)} — trying curl`);
  } catch (e) {
    log(`fetch error ${e.message} — trying curl`);
  }
  const buf = await curlBuf(url);
  if (!buf)
    return null;
  try {
    return JSON.parse(buf.toString("utf8"));
  } catch {
    log(`curl non-json ${url.slice(0, 90)}`);
    return null;
  }
}
async function fetchBytesDataUri(url, cap = 40000) {
  let buf;
  try {
    const res = await fetch(url, { headers: { "user-agent": UA } });
    if (res.ok)
      buf = Buffer.from(await res.arrayBuffer());
  } catch {}
  if (!buf) {
    const c = await curlBuf(url, 6000, cap * 4);
    if (c)
      buf = c;
  }
  if (!buf || buf.length > cap)
    return;
  return `data:image/png;base64,${buf.toString("base64")}`;
}
var logoCache = new Map;
async function inlineLogo(url) {
  if (!url)
    return;
  if (logoCache.has(url))
    return logoCache.get(url);
  let u = url.replace(/^http:/, "https:");
  if (/\.espncdn\.com/.test(u) && !/combiner/.test(u)) {
    try {
      u = `https://a.espncdn.com/combiner/i?img=${encodeURIComponent(new URL(u).pathname.replace("/scoreboard/", "/"))}&h=40&w=40&scale=crop&format=png`;
    } catch {}
  }
  const d = await fetchBytesDataUri(u, 24000);
  logoCache.set(url, d);
  return d;
}
async function hydrateLogos(objs) {
  const need = objs.filter((o) => !!o && !o.logo && !!o.logoUrl);
  await Promise.all(need.map(async (o) => {
    const d = await inlineLogo(o.logoUrl);
    if (d)
      o.logo = d;
  }));
}
function gameSides(games) {
  return games.flatMap((g) => [g.away, g.home]);
}
function str2(v) {
  if (v === undefined || v === null)
    return;
  const t = String(v).trim();
  return t || undefined;
}
function normLeague(v) {
  const s = (str2(v) ?? "").toLowerCase().trim();
  if (!s)
    return;
  if (LEAGUES[s])
    return s;
  const matches = [];
  for (const key of LEAGUE_KEYS) {
    for (const a of LEAGUES[key].aliases) {
      if (s === a || s.includes(a))
        matches.push({ key, len: a.length });
    }
  }
  matches.sort((a, b) => b.len - a.len);
  return matches[0]?.key;
}
var teamCacheByLeague = new Map;
async function teamsOf(league) {
  const hit = teamCacheByLeague.get(league);
  if (hit)
    return hit;
  const lg = LEAGUES[league];
  const d = await getJson(`${SITE}/${lg.path}/teams`);
  const raw = d?.sports?.[0]?.leagues?.[0]?.teams ?? [];
  const list = raw.map((t) => {
    const team = t.team ?? {};
    return {
      id: String(team.id ?? ""),
      abbr: String(team.abbreviation ?? ""),
      display: String(team.displayName ?? ""),
      short: String(team.shortDisplayName ?? ""),
      nick: String(team.nickname ?? team.name ?? ""),
      location: String(team.location ?? "")
    };
  });
  teamCacheByLeague.set(league, list);
  return list;
}
var NICK_ALIASES = {
  niners: "49ers"
};
async function resolveTeam(league, query) {
  const teams = await teamsOf(league);
  let q = query.trim().toLowerCase();
  q = NICK_ALIASES[q] ?? q;
  if (!q)
    return null;
  const byAbbr = teams.find((t) => t.abbr.toLowerCase() === q);
  if (byAbbr)
    return byAbbr;
  const exact = teams.find((t) => t.display.toLowerCase() === q || t.nick.toLowerCase() === q || t.short.toLowerCase() === q || t.location.toLowerCase() === q);
  if (exact)
    return exact;
  const contains = teams.find((t) => t.nick.toLowerCase().includes(q) || q.includes(t.nick.toLowerCase())) ?? teams.find((t) => t.display.toLowerCase().includes(q) || t.location.toLowerCase().includes(q));
  return contains ?? null;
}
async function guessLeague(teamQuery, explicit) {
  if (explicit)
    return explicit;
  if (!teamQuery)
    return DEFAULT_LEAGUE;
  const resolved = await Promise.all(LEAGUE_KEYS.map((key) => resolveTeam(key, teamQuery).then((t) => t ? key : null)));
  const hits = resolved.filter((k) => !!k);
  if (!hits.length)
    return DEFAULT_LEAGUE;
  if (hits.length === 1)
    return hits[0];
  const inSeason = hits.filter(inSeasonNow);
  return inSeason[0] ?? hits[0];
}
function fmtWhen(iso) {
  if (!iso)
    return {};
  const dt = new Date(iso);
  if (isNaN(dt.getTime()))
    return {};
  try {
    const when = dt.toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" }) + " ET";
    const dateShort = dt.toLocaleDateString("en-US", { timeZone: "America/New_York", weekday: "short", month: "short", day: "numeric" });
    return { when, dateShort };
  } catch {
    return { when: iso.slice(11, 16), dateShort: iso.slice(0, 10) };
  }
}
function liveShort(status, league) {
  const t = status?.type ?? {};
  const sd = String(t.shortDetail ?? t.detail ?? "");
  const lg = LEAGUES[league];
  const sport = lg?.sport;
  if (/halftime/i.test(sd))
    return "Half";
  if (/delay/i.test(sd))
    return "Delay";
  if (sport === "baseball" || sport === "soccer")
    return sd.slice(0, 14) || "Live";
  if (/end/i.test(sd))
    return sd.slice(0, 12);
  const clock = status?.displayClock;
  const period = status?.period;
  if (period) {
    const reg = lg?.regPeriods ?? 4;
    const pw = lg?.periodWord || "Q";
    const label = period <= reg ? `${pw}${period}` : `OT${period - reg > 1 ? period - reg : ""}`;
    return clock ? `${label} ${clock}` : label;
  }
  return sd.slice(0, 12) || "Live";
}
function sideFrom(comp, league, state) {
  const team = comp?.team ?? {};
  const abbr = String(team.abbreviation ?? "");
  const rawScore = comp?.score;
  const scoreN = rawScore && typeof rawScore === "object" ? Number(rawScore.value ?? rawScore.displayValue) : Number(rawScore);
  const ls = Array.isArray(comp?.linescores) ? comp.linescores.map((l) => Number(l?.value)).filter((n) => Number.isFinite(n)) : [];
  const logoUrl = str22(team?.logo) ?? str22(team?.logos?.[0]?.href);
  return {
    abbr,
    name: String(team.shortDisplayName ?? team.name ?? team.displayName ?? abbr),
    score: state !== "pre" && Number.isFinite(scoreN) ? scoreN : undefined,
    record: comp?.records?.[0]?.summary ? String(comp.records[0].summary) : undefined,
    logo: teamLogo(league, abbr),
    logoUrl,
    winner: typeof comp?.winner === "boolean" ? comp.winner : undefined,
    linescores: ls
  };
}
function str22(v) {
  const s = typeof v === "string" ? v.trim() : "";
  return s || undefined;
}
function periodLabels(g) {
  const a = g.away?.linescores?.length ?? 0;
  const h = g.home?.linescores?.length ?? 0;
  const n = Math.max(a, h);
  if (!n)
    return [];
  const lg = LEAGUES[g.league ?? ""];
  const reg = lg?.regPeriods ?? 4;
  const sport = lg?.sport;
  if (sport === "baseball")
    return Array.from({ length: n }, (_, i) => String(i + 1));
  return Array.from({ length: n }, (_, i) => i < reg ? String(i + 1) : sport === "soccer" ? "ET" : n - reg === 1 ? "OT" : `OT${i - reg + 1}`);
}
function gameFrom(event, league) {
  const comp = event?.competitions?.[0] ?? {};
  const status = event?.status ?? comp?.status ?? {};
  const state = String(status?.type?.state ?? "pre");
  const competitors = Array.isArray(comp?.competitors) ? comp.competitors : [];
  const homeC = competitors.find((c) => c?.homeAway === "home") ?? competitors[0];
  const awayC = competitors.find((c) => c?.homeAway === "away") ?? competitors[1];
  const home = homeC ? sideFrom(homeC, league, state) : undefined;
  const away = awayC ? sideFrom(awayC, league, state) : undefined;
  const possId = comp?.situation?.possession;
  if (possId && state === "in") {
    if (homeC?.id && String(homeC.id) === String(possId) && home)
      home.possession = true;
    if (awayC?.id && String(awayC.id) === String(possId) && away)
      away.possession = true;
  }
  const t = status?.type ?? {};
  const { when, dateShort } = fmtWhen(event?.date);
  const odds = comp?.odds?.[0];
  const g = {
    id: String(event?.id ?? comp?.id ?? ""),
    league,
    state,
    statusDetail: String(t.detail ?? t.shortDetail ?? ""),
    statusShort: state === "in" ? liveShort(status, league) : String(t.shortDetail ?? t.detail ?? (state === "post" ? "Final" : "")),
    home,
    away,
    when,
    dateShort,
    venue: comp?.venue?.fullName ? String(comp.venue.fullName) : undefined,
    broadcast: Array.isArray(comp?.broadcasts) && comp.broadcasts[0]?.names?.length ? comp.broadcasts[0].names.join("/") : undefined,
    odds: odds?.details ? String(odds.details) : undefined,
    overUnder: odds?.overUnder !== undefined ? String(odds.overUnder) : undefined,
    url: event?.links?.find?.((l) => l?.href)?.href ? String(event.links.find((l) => l.href).href) : undefined,
    dateISO: event?.date ? String(event.date) : undefined,
    seasonType: event?.seasonType?.name ? String(event.seasonType.name) : comp?.type?.text ? String(comp.type.text) : undefined
  };
  g.periodLabels = periodLabels(g);
  return g;
}
async function fetchTeamSchedule(league, teamId) {
  const lg = LEAGUES[league];
  const y = Number(new Date().toLocaleString("en-US", { timeZone: "America/New_York", year: "numeric" }));
  const urls = [
    `${SITE}/${lg.path}/teams/${teamId}/schedule`,
    `${SITE}/${lg.path}/teams/${teamId}/schedule?season=${y}&seasontype=2`,
    `${SITE}/${lg.path}/teams/${teamId}/schedule?season=${y}&seasontype=3`,
    `${SITE}/${lg.path}/teams/${teamId}/schedule?season=${y + 1}&seasontype=2`
  ];
  const seen = new Map;
  for (const u of urls) {
    const d = await getJson(u);
    for (const e of d?.events ?? []) {
      const g = gameFrom(e, league);
      if (g.id && !seen.has(g.id))
        seen.set(g.id, g);
    }
  }
  return [...seen.values()].sort((a, b) => (Date.parse(a.dateISO ?? "") || 0) - (Date.parse(b.dateISO ?? "") || 0));
}
var LEADER_CATS = {
  football: { passingYards: "PASS", rushingYards: "RUSH", receivingYards: "REC" },
  basketball: { points: "PTS", rebounds: "REB", assists: "AST", pointsPerGame: "PPG", reboundsPerGame: "RPG", assistsPerGame: "APG" },
  baseball: { hits: "HITS", homeRuns: "HR", RBIs: "RBI", battingAverage: "AVG", strikeouts: "K", wins: "W", ERA: "ERA" },
  hockey: { points: "PTS", goals: "G", assists: "A", saves: "SV", goalsAgainst: "GA" },
  soccer: { goals: "G", assists: "A", shots: "SH", saves: "SV" }
};
var LEADER_ORDER = {
  football: ["PASS", "RUSH", "REC"],
  basketball: ["PTS", "REB", "AST", "PPG", "RPG", "APG"],
  baseball: ["HITS", "HR", "RBI", "K", "W", "ERA", "AVG"],
  hockey: ["PTS", "G", "A", "SV"],
  soccer: ["G", "A", "SH", "SV"]
};
function leadersFrom(comp, league) {
  const sport = LEAGUES[league]?.sport ?? "football";
  const catMap = LEADER_CATS[sport] ?? {};
  const out = [];
  const competitors = Array.isArray(comp?.competitors) ? comp.competitors : [];
  for (const c of competitors) {
    const teamAbbr = String(c?.team?.abbreviation ?? "");
    for (const grp of c?.leaders ?? []) {
      const cat = catMap[grp?.name] ?? String(grp?.abbreviation ?? grp?.shortDisplayName ?? grp?.displayName ?? grp?.name ?? "").toUpperCase().slice(0, 6);
      if (!cat)
        continue;
      const top = grp?.leaders?.[0];
      const ath = top?.athlete ?? {};
      if (!ath?.shortName && !ath?.displayName)
        continue;
      out.push({ cat, name: String(ath.shortName ?? ath.displayName), team: teamAbbr, value: String(top?.displayValue ?? "") });
    }
  }
  const order = LEADER_ORDER[sport] ?? [];
  const seen = new Set;
  const ranked = [];
  for (const cat of order) {
    const found = out.find((l) => l.cat === cat && !seen.has(cat));
    if (found) {
      seen.add(cat);
      ranked.push(found);
    }
  }
  for (const l of out) {
    if (ranked.length >= 6)
      break;
    if (l.cat && !seen.has(l.cat)) {
      seen.add(l.cat);
      ranked.push(l);
    }
  }
  return ranked;
}
function statValStd(stats, names) {
  for (const n of names) {
    const s = stats?.find((x) => x?.name === n || x?.type === n || x?.abbreviation === n);
    if (s)
      return String(s.displayValue ?? s.value ?? "");
  }
  return;
}
function mapEntries(entries, league) {
  const rows = entries.map((e) => {
    const team = e?.team ?? {};
    const abbr = String(team.abbreviation ?? "");
    const stats = e?.stats ?? [];
    const wins = Number(statValStd(stats, ["wins"]) ?? NaN);
    const losses = Number(statValStd(stats, ["losses"]) ?? NaN);
    const pct = statValStd(stats, ["winPercent", "winpercent"]);
    const pctNum = Number(pct);
    return {
      abbr,
      name: String(team.shortDisplayName ?? team.displayName ?? abbr),
      logo: teamLogo(league, abbr),
      logoUrl: str22(team?.logos?.[0]?.href) ?? str22(team?.logo),
      wins: Number.isFinite(wins) ? wins : undefined,
      losses: Number.isFinite(losses) ? losses : undefined,
      pct,
      extra: String(statValStd(stats, ["streak"]) ?? statValStd(stats, ["gamesBehind"]) ?? "").slice(0, 6),
      _sort: Number.isFinite(pctNum) ? pctNum : Number.isFinite(wins) ? wins / Math.max(1, wins + losses) : 0
    };
  });
  return rows.sort((a, b) => b._sort - a._sort).map((r, i) => ({ ...r, rank: i + 1 }));
}
async function teamDivisionStandings(league, teamAbbr) {
  const lg = LEAGUES[league];
  const d = await getJson(`${CORE}/${lg.path}/standings?level=3`);
  const buckets = [];
  const walk = (n) => {
    if (!n)
      return;
    const e = n?.standings?.entries ?? [];
    if (e.length)
      buckets.push({ name: String(n?.name ?? n?.displayName ?? ""), entries: e });
    for (const c of n?.children ?? [])
      walk(c);
  };
  for (const c of d?.children ?? [])
    walk(c);
  if (d?.standings?.entries)
    buckets.push({ name: String(d?.name ?? lg.label), entries: d.standings.entries });
  const containing = buckets.filter((b) => b.entries.some((e) => e?.team?.abbreviation === teamAbbr)).sort((a, b) => a.entries.length - b.entries.length);
  const pick = containing[0] ?? buckets[0];
  if (!pick)
    return { title: `${lg.label} standings`, rows: [] };
  return { title: pick.name || `${lg.label} standings`, rows: mapEntries(pick.entries, league) };
}
async function topRoster(league, teamId) {
  const lg = LEAGUES[league];
  const d = await getJson(`${SITE}/${lg.path}/teams/${teamId}/roster`);
  const groups = d?.athletes ?? [];
  const items = [];
  for (const g of groups) {
    if (Array.isArray(g?.items))
      items.push(...g.items);
    else if (g?.id)
      items.push(g);
  }
  const pref = league === "nba" ? ["PG", "SG", "SF", "PF", "C", "G", "F"] : ["QB", "RB", "WR", "TE"];
  const active = items.filter((p) => p?.displayName && String(p?.status?.type ?? "active") !== "inactive");
  const perPos = {};
  const picked = [];
  for (const pos of pref) {
    for (const p of active) {
      if (String(p?.position?.abbreviation ?? "") !== pos)
        continue;
      perPos[pos] = (perPos[pos] ?? 0) + 1;
      if (perPos[pos] <= 2)
        picked.push(p);
    }
  }
  for (const p of active) {
    if (picked.length >= 10)
      break;
    if (!picked.includes(p))
      picked.push(p);
  }
  return picked.slice(0, 10).map((p) => ({
    name: String(p.displayName),
    pos: p?.position?.abbreviation ? String(p.position.abbreviation) : undefined,
    jersey: p?.jersey ? String(p.jersey) : undefined,
    url: p?.links?.find?.((l) => /^https:/.test(l?.href ?? ""))?.href ? String(p.links.find((l) => /^https:/.test(l.href)).href) : undefined
  }));
}
function scoreLine(g) {
  const { away: a, home: h } = g;
  const av = a?.abbr ?? "Away", hv = h?.abbr ?? "Home";
  if (g.state === "pre")
    return `${av} at ${hv}, ${[g.dateShort, g.when].filter(Boolean).join(" ")}`;
  return `${av} ${a?.score ?? 0}, ${hv} ${h?.score ?? 0} — ${g.statusShort}`;
}
var leagueProp = {
  type: "string",
  enum: LEAGUE_KEYS,
  description: "Which league: nfl, nba, mlb, nhl, wnba, cfb (college football), mcbb (men's college basketball), epl / ucl / mls (soccer). If the user named a team, omit this and it is inferred (ambiguous names like Cardinals/Giants/Rangers resolve to whichever league is in season)."
};
async function buildTeamHub(league, t) {
  const lg = LEAGUES[league];
  const [d, sched, div, players] = await Promise.all([
    getJson(`${SITE}/${lg.path}/teams/${t.id}`),
    fetchTeamSchedule(league, t.id),
    teamDivisionStandings(league, t.abbr),
    topRoster(league, t.id)
  ]);
  const team_ = d?.team ?? {};
  const record = team_?.record?.items?.[0]?.summary ? String(team_.record.items[0].summary) : undefined;
  const standingSummary = team_?.standingSummary ? String(team_.standingSummary) : undefined;
  const color = team_?.color ? String(team_.color) : undefined;
  const upcoming = sched.filter((g) => g.state !== "post");
  const recent = sched.filter((g) => g.state === "post").reverse();
  const next = upcoming[0];
  const lastDone = recent[0];
  const hubLogo = teamLogo(league, t.abbr) ?? await inlineLogo(str22(team_?.logos?.[0]?.href) ?? str22(team_?.logo));
  await hydrateLogos([...gameSides(upcoming.slice(0, 5)), ...gameSides(recent.slice(0, 4)), ...div.rows]);
  return {
    speak: `${t.display}${record ? ` are ${record}` : ""}${standingSummary ? `, ${standingSummary}` : ""}.${next ? ` Next: ${scoreLine(next)}.` : ""}`,
    facts: {
      league,
      team: t.display,
      record,
      standing: standingSummary,
      next: next ? scoreLine(next) : undefined,
      last: lastDone ? scoreLine(lastDone) : undefined,
      upcoming: upcoming.slice(0, 5).map((g) => `${g.away?.abbr} @ ${g.home?.abbr} · ${[g.dateShort, g.when].filter(Boolean).join(" ")}`)
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
        url: team_?.links?.find?.((l) => l?.href)?.href ? String(team_.links.find((l) => l.href).href) : undefined
      }
    })
  };
}
var TOOLS = [
  {
    name: "sports_scores",
    description: `Live and recent scores as a native scoreboard for ANY league — NFL, NBA, MLB, NHL, WNBA, college football (cfb), college basketball (mcbb), soccer (epl/ucl/mls). Use for "what games are on", "scores", "who's winning", "did the Lakers win", "MLB scores today". Shows every game with live score, period/clock/inning, or start time; tap any game for the box score, leaders, odds and win probability without leaving VoiceOS. Knows when a league is off-season. Read-only. Pass a team to jump to that team's game.`,
    inputSchema: {
      type: "object",
      properties: {
        league: leagueProp,
        team: { type: "string", description: 'Optional team to focus on, e.g. "49ers", "Lakers".' },
        date: { type: "string", description: "Optional day as YYYY-MM-DD or YYYYMMDD (e.g. yesterday). Default: today / current week." }
      },
      additionalProperties: false
    },
    async run(args) {
      const team = str2(args["team"]);
      const league = await guessLeague(team, normLeague(args["league"]));
      const lg = LEAGUES[league];
      let dateParam = "";
      const date = str2(args["date"]);
      if (date)
        dateParam = `?dates=${date.replace(/-/g, "")}`;
      const d = await getJson(`${SITE}/${lg.path}/scoreboard${dateParam}`);
      let events = Array.isArray(d?.events) ? d.events : [];
      const note = seasonNote(league);
      if (!events.length) {
        const off = !inSeasonNow(league);
        const hint = off ? `The ${lg.label} season is between games — it starts ${lg.startsLabel}.` : "No games on the schedule for that day.";
        return { speak: off ? hint : `No ${lg.label} games ${date ? "for that day" : "right now"}.`, facts: { league, count: 0, offSeason: off }, card: scoreboardCard({ league, title: `${lg.label} scores`, games: [], emptyHint: hint }) };
      }
      let games = events.map((e) => gameFrom(e, league));
      await hydrateLogos(gameSides(games));
      if (team) {
        const t = await resolveTeam(league, team);
        if (t) {
          const idx = games.findIndex((g) => g.home?.abbr === t.abbr || g.away?.abbr === t.abbr);
          if (idx > 0)
            games = [games[idx], ...games.slice(0, idx), ...games.slice(idx + 1)];
        }
      }
      const live = games.filter((g) => g.state === "in").length;
      const finals = games.filter((g) => g.state === "post").length;
      const trailing = live ? `${live} live` : finals ? `${finals} final` : `${games.length} scheduled`;
      const top = games.slice(0, 3).map(scoreLine).join("; ");
      const leadersByGame = {};
      for (let i = 0;i < Math.min(events.length, 12); i++) {
        const comp = events[i]?.competitions?.[0];
        const ld = leadersFrom(comp, league);
        if (ld.length)
          leadersByGame[String(events[i]?.id ?? "")] = ld;
      }
      return {
        speak: `${lg.label}: ${top}${games.length > 3 ? `, and ${games.length - 3} more` : ""}.`,
        facts: { league, count: games.length, live, finals, games: games.map((g) => ({ id: g.id, matchup: `${g.away?.abbr} @ ${g.home?.abbr}`, state: g.state, status: g.statusShort, away: { abbr: g.away?.abbr, score: g.away?.score }, home: { abbr: g.home?.abbr, score: g.home?.score }, when: g.when, dateShort: g.dateShort })) },
        card: scoreboardCard({ league, title: `${lg.label} scores`, trailing, games, leadersByGame, note })
      };
    }
  },
  {
    name: "sports_game",
    description: `Full detail for ONE game — final or in-progress box score: score by quarter, game leaders (passing/rushing/receiving for NFL; points/rebounds/assists for NBA), betting line, and live win probability. Use for "how did the X game go", "box score", "who led the game", "what's the score of the Lakers game". Give a team (the tool finds their most relevant game) or a game id from sports_scores. Read-only.`,
    inputSchema: {
      type: "object",
      properties: {
        league: leagueProp,
        team: { type: "string", description: 'A team in the game, e.g. "Chiefs".' },
        game_id: { type: "string", description: "ESPN event id from a sports_scores result (optional; use instead of team)." }
      },
      additionalProperties: false
    },
    async run(args) {
      const team = str2(args["team"]);
      const gameId = str2(args["game_id"]);
      const league = await guessLeague(team, normLeague(args["league"]));
      const lg = LEAGUES[league];
      let eventId = gameId;
      if (!eventId && team) {
        const t = await resolveTeam(league, team);
        const sb = await getJson(`${SITE}/${lg.path}/scoreboard`);
        const ev = (sb?.events ?? []).find((e) => e?.competitions?.[0]?.competitors?.some((c) => c?.team?.abbreviation === t?.abbr));
        const evState = ev?.competitions?.[0]?.status?.type?.state;
        if (ev && (evState === "in" || evState === "post")) {
          eventId = String(ev.id);
        } else if (t) {
          const games = await fetchTeamSchedule(league, t.id);
          const done = [...games].reverse().find((g2) => g2.state === "post");
          eventId = String(done?.id ?? ev?.id ?? games[games.length - 1]?.id ?? "");
        } else if (ev) {
          eventId = String(ev.id);
        }
      }
      if (!eventId)
        return { speak: "Which game? Name a team or give me a game id.", card: errorCard({ spoken: "Name a team or give me a game id." }) };
      const sum = await getJson(`${SITE}/${lg.path}/summary?event=${eventId}`);
      if (!sum)
        return { speak: "I couldn't load that game.", card: errorCard({ spoken: "I couldn't load that game." }) };
      const header = sum?.header ?? {};
      const comp = header?.competitions?.[0] ?? {};
      const g = gameFrom({ ...header, competitions: header?.competitions, date: comp?.date, status: comp?.status, links: header?.links }, league);
      let leaders = leadersFrom({ competitors: (sum?.leaders ?? []).map((L) => ({ team: L?.team, leaders: L?.leaders })) }, league);
      if (!leaders.length)
        leaders = leadersFrom(comp, league);
      const wp = sum?.winprobability;
      if (Array.isArray(wp) && wp.length && g.state === "in") {
        const last = wp[wp.length - 1];
        const hp = Number(last?.homeWinPercentage);
        if (Number.isFinite(hp))
          g.homeWinPct = hp <= 1 ? hp * 100 : hp;
      }
      if (!g.venue && sum?.gameInfo?.venue?.fullName)
        g.venue = String(sum.gameInfo.venue.fullName);
      await hydrateLogos([g.away, g.home]);
      return {
        speak: `${scoreLine(g)}.${leaders.length ? " Leaders: " + leaders.map((l) => `${l.name} ${l.value}`).join(", ") + "." : ""}`,
        facts: { league, game_id: eventId, matchup: `${g.away?.abbr} @ ${g.home?.abbr}`, state: g.state, status: g.statusShort, away: { abbr: g.away?.abbr, score: g.away?.score, byPeriod: g.away?.linescores }, home: { abbr: g.home?.abbr, score: g.home?.score, byPeriod: g.home?.linescores }, leaders, odds: g.odds, winProbHome: g.homeWinPct },
        card: gameCard({ league, game: g, leaders })
      };
    }
  },
  {
    name: "sports_schedule",
    description: `Upcoming games. Use for "what games are on tonight", "who plays this week", "when do the Warriors play next", "NBA schedule". With a team, returns that team's next games and recent results; without one, the league's day/week slate. Read-only.`,
    inputSchema: {
      type: "object",
      properties: {
        league: leagueProp,
        team: { type: "string", description: `Optional team, e.g. "Warriors". Returns that team's schedule.` },
        date: { type: "string", description: "Optional day as YYYY-MM-DD (league slate for that day)." }
      },
      additionalProperties: false
    },
    async run(args) {
      const team = str2(args["team"]);
      const league = await guessLeague(team, normLeague(args["league"]));
      const lg = LEAGUES[league];
      if (team) {
        const t = await resolveTeam(league, team);
        if (!t)
          return { speak: `I couldn't find that ${lg.label} team.`, card: errorCard({ spoken: `Unknown ${lg.label} team.` }) };
        return buildTeamHub(league, t);
      }
      const date = str2(args["date"]);
      const dateParam = date ? `?dates=${date.replace(/-/g, "")}` : "";
      const d = await getJson(`${SITE}/${lg.path}/scoreboard${dateParam}`);
      const games = (d?.events ?? []).map((e) => gameFrom(e, league));
      const upcoming = games.filter((g) => g.state !== "post");
      const show = (upcoming.length ? upcoming : games).slice(0, 10);
      await hydrateLogos(gameSides(show));
      return {
        speak: show.length ? `${lg.label}: ${show.slice(0, 3).map(scoreLine).join("; ")}${show.length > 3 ? `, and ${show.length - 3} more` : ""}.` : `No ${lg.label} games scheduled.`,
        facts: { league, count: show.length, games: show.map((g) => ({ matchup: `${g.away?.abbr} @ ${g.home?.abbr}`, when: g.when, dateShort: g.dateShort, state: g.state })) },
        card: scheduleCard({ league, title: `${lg.label} schedule`, trailing: date ?? "upcoming", games: show, emptyHint: "Nothing scheduled." })
      };
    }
  },
  {
    name: "sports_team",
    description: 'A quick team update: record, division standing, next game and last result, with the team logo. Use for "how are the 49ers doing", "Lakers record", "give me a Cowboys update". Read-only.',
    inputSchema: {
      type: "object",
      properties: { league: leagueProp, team: { type: "string", description: 'The team, e.g. "49ers", "Celtics".' } },
      required: ["team"],
      additionalProperties: false
    },
    async run(args) {
      const team = str2(args["team"]);
      if (!team)
        return { speak: "Which team?" };
      const league = await guessLeague(team, normLeague(args["league"]));
      const lg = LEAGUES[league];
      const t = await resolveTeam(league, team);
      if (!t)
        return { speak: `I couldn't find that ${lg.label} team.`, card: errorCard({ spoken: `Unknown ${lg.label} team.` }) };
      return buildTeamHub(league, t);
    }
  },
  {
    name: "sports_standings",
    description: `League standings as a ranked table with logos, records, win pct and streak. Use for "NFL standings", "NBA West standings", "who's first in the AFC". Optional group filter (a conference or division name) narrows it. Read-only.`,
    inputSchema: {
      type: "object",
      properties: {
        league: leagueProp,
        group: { type: "string", description: 'Optional conference/division filter, e.g. "AFC", "NFC East", "West", "Atlantic".' }
      },
      additionalProperties: false
    },
    async run(args) {
      const league = normLeague(args["league"]) ?? DEFAULT_LEAGUE;
      const lg = LEAGUES[league];
      const group = str2(args["group"]);
      const d = await getJson(`${CORE}/${lg.path}/standings`);
      const buckets = [];
      if (Array.isArray(d?.children)) {
        for (const c of d.children) {
          const entries = c?.standings?.entries ?? [];
          if (entries.length)
            buckets.push({ name: String(c?.name ?? ""), entries });
          if (Array.isArray(c?.children))
            for (const cc of c.children) {
              const e2 = cc?.standings?.entries ?? [];
              if (e2.length)
                buckets.push({ name: `${c?.name ?? ""} ${cc?.name ?? ""}`.trim(), entries: e2 });
            }
        }
      }
      if (!buckets.length && d?.standings?.entries)
        buckets.push({ name: String(d?.name ?? lg.label), entries: d.standings.entries });
      if (!buckets.length)
        return { speak: `${lg.label} standings are unavailable right now.`, card: standingsCard({ league, title: `${lg.label} standings`, rows: [] }) };
      let chosen = buckets;
      if (group) {
        const gq = group.toLowerCase();
        const m = buckets.filter((b) => b.name.toLowerCase().includes(gq));
        if (m.length)
          chosen = m;
      } else if (buckets.length > 1) {
        chosen = [buckets[0]];
      }
      const bucket = chosen[0];
      const statVal = (stats, names) => {
        for (const n of names) {
          const s = stats?.find((x) => x?.name === n || x?.type === n || x?.abbreviation === n);
          if (s)
            return String(s.displayValue ?? s.value ?? "");
        }
        return;
      };
      let rows = bucket.entries.map((e) => {
        const team = e?.team ?? {};
        const abbr = String(team.abbreviation ?? "");
        const stats = e?.stats ?? [];
        const wins = Number(statVal(stats, ["wins"]) ?? NaN);
        const losses = Number(statVal(stats, ["losses"]) ?? NaN);
        const pctRaw = statVal(stats, ["winPercent", "winpercent"]);
        const pctNum = Number(pctRaw);
        const streak = statVal(stats, ["streak"]) ?? statVal(stats, ["gamesBehind"]) ?? "";
        return {
          abbr,
          name: String(team.shortDisplayName ?? team.displayName ?? abbr),
          logo: teamLogo(league, abbr),
          logoUrl: str22(team?.logos?.[0]?.href) ?? str22(team?.logo),
          wins: Number.isFinite(wins) ? wins : undefined,
          losses: Number.isFinite(losses) ? losses : undefined,
          pct: pctRaw,
          extra: String(streak).slice(0, 6),
          _sort: Number.isFinite(pctNum) ? pctNum : Number.isFinite(wins) ? wins / Math.max(1, wins + losses) : 0
        };
      });
      rows = rows.sort((a, b) => b._sort - a._sort).map((r, i) => ({ ...r, rank: i + 1 }));
      await hydrateLogos(rows);
      const note = seasonNote(league);
      const title = `${lg.label} standings`;
      const top = rows.slice(0, 3).map((r) => `${r.name} ${r.wins ?? 0}-${r.losses ?? 0}`).join(", ");
      const prefix = note ? `Last season's final ${bucket.name || lg.label}` : bucket.name || lg.label;
      return {
        speak: `${prefix}: ${top}.`,
        facts: { league, group: bucket.name, offSeason: !!note, teams: rows.map((r) => ({ rank: r.rank, name: r.name, record: `${r.wins ?? 0}-${r.losses ?? 0}`, pct: r.pct })) },
        card: standingsCard({ league, title: bucket.name ? `${bucket.name}` : title, rows, extraLabel: "STRK", note })
      };
    }
  },
  {
    name: "sports_player",
    description: 'A player card: position, team, jersey and current-season stat line, with headshot. Use for "Patrick Mahomes stats", "how is LeBron doing", "tell me about Jayson Tatum". Read-only.',
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: 'Player name, e.g. "Patrick Mahomes".' },
        league: leagueProp
      },
      required: ["name"],
      additionalProperties: false
    },
    async run(args) {
      const name = str2(args["name"]);
      if (!name)
        return { speak: "Which player?" };
      const search = await getJson(`${WEB}/search/v2?limit=8&query=${encodeURIComponent(name)}`);
      const items = Array.isArray(search?.results) ? search.results.flatMap((r) => Array.isArray(r?.contents) ? r.contents : [r]) : [];
      const hint = normLeague(args["league"]);
      const player = items.find((it) => {
        const isPlayer = it?.type === "player" || it?.type === "athlete" || /\/players?\//.test(String(it?.link?.web ?? it?.uid ?? ""));
        if (!isPlayer)
          return false;
        if (!hint)
          return true;
        const blob2 = String(it?.link?.web ?? it?.uid ?? it?.subtitle ?? "").toLowerCase();
        return blob2.includes(hint);
      }) ?? items.find((it) => it?.type === "player");
      if (!player)
        return { speak: `I couldn't find a player called ${name}.`, card: errorCard({ spoken: `No player found for "${name}".` }) };
      const web = String(player?.link?.web ?? "");
      const uid = String(player?.uid ?? "");
      const blob = (web + " " + uid + " " + String(player?.subtitle ?? "")).toLowerCase();
      let league = hint;
      if (!league) {
        for (const key of LEAGUE_KEYS) {
          const seg = LEAGUES[key].path.split("/")[1];
          if (blob.includes("/" + seg + "/") || blob.includes(seg)) {
            league = key;
            break;
          }
        }
      }
      league = league ?? DEFAULT_LEAGUE;
      const lg = LEAGUES[league];
      const idMatch = (web.match(/id\/(\d+)/) ?? uid.match(/a:(\d+)/) ?? [])[1] ?? String(player?.id ?? "");
      if (!idMatch)
        return { speak: `I found ${player?.displayName ?? name} but couldn't load stats.`, card: errorCard({ spoken: "Player id unavailable." }) };
      const ov = await getJson(`${WEB}/common/v3/sports/${lg.path}/athletes/${idMatch}/overview`);
      const bio = await getJson(`${WEB}/common/v3/sports/${lg.path}/athletes/${idMatch}`);
      const ath = bio?.athlete ?? {};
      const st = ov?.statistics ?? {};
      const labels = st?.labels ?? st?.displayNames ?? [];
      const values = st?.splits?.[0]?.stats ?? [];
      const stats = labels.slice(0, 6).map((k, i) => ({ k, v: String(values[i] ?? "-") })).filter((s) => s.v !== "-");
      let headshotUrl = ath?.headshot?.href ? String(ath.headshot.href) : String(player?.image?.default ?? player?.imageUrl ?? "");
      headshotUrl = headshotUrl.replace(/^http:/, "https:");
      if (/a\.espncdn\.com/.test(headshotUrl) && !/combiner/.test(headshotUrl)) {
        try {
          headshotUrl = `https://a.espncdn.com/combiner/i?img=${encodeURIComponent(new URL(headshotUrl).pathname)}&h=160&w=160&scale=crop&format=png`;
        } catch {}
      }
      const headshot = headshotUrl ? await fetchBytesDataUri(headshotUrl, 60000) : undefined;
      const pos = ath?.position?.abbreviation ?? ath?.position?.displayName;
      const teamAbbr = ath?.team?.abbreviation;
      const nm = ath?.displayName ?? player?.displayName ?? name;
      const stLine = stats.slice(0, 4).map((s) => `${s.v} ${s.k}`).join(", ");
      return {
        speak: `${nm}${pos ? `, ${pos}` : ""}${teamAbbr ? ` (${teamAbbr})` : ""}${stLine ? `: ${stLine}` : ""}.`,
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
            url: web && /^https:/.test(web) ? web : undefined
          }
        })
      };
    }
  },
  {
    name: "sports_news",
    description: `Latest headlines for any league — NFL, NBA, MLB, NHL, WNBA, college football/basketball, or soccer. Use for "sports news", "what's happening in the NBA", "MLB headlines". Tappable to open the full story. Read-only.`,
    inputSchema: {
      type: "object",
      properties: { league: leagueProp },
      additionalProperties: false
    },
    async run(args) {
      const league = normLeague(args["league"]) ?? DEFAULT_LEAGUE;
      const lg = LEAGUES[league];
      const d = await getJson(`${SITE}/${lg.path}/news`);
      const arts = d?.articles ?? [];
      const items = arts.map((a) => ({
        headline: String(a?.headline ?? ""),
        source: a?.source ? String(a.source) : lg.label,
        when: a?.published ? new Date(a.published).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : undefined,
        url: a?.links?.web?.href && /^https:/.test(a.links.web.href) ? String(a.links.web.href) : undefined
      })).filter((n) => n.headline);
      return {
        speak: items.length ? `${lg.label} headlines: ${items.slice(0, 3).map((n) => n.headline).join("; ")}.` : `No ${lg.label} news right now.`,
        facts: { league, count: items.length, headlines: items.slice(0, 6).map((n) => n.headline) },
        card: newsCard({ league, title: `${lg.label} news`, items, emptyHint: "No headlines right now." })
      };
    }
  }
];
var TOOL_BY_NAME = new Map(TOOLS.map((t) => [t.name, t]));
function write(message) {
  process.stdout.write(JSON.stringify(message) + `
`);
}
function toWire(out) {
  const payload = { spoken: out.speak, ...out.facts ?? {} };
  if (out.card) {
    try {
      const glance = JSON.parse(out.card);
      if (glance && typeof glance === "object")
        payload["_voiceos_glance"] = glance;
    } catch {}
  }
  return JSON.stringify(payload);
}
async function handle(msg) {
  const { id, method, params } = msg ?? {};
  const isNotification = id === undefined || id === null;
  if (method === "initialize") {
    return { jsonrpc: "2.0", id, result: { protocolVersion: params?.protocolVersion ?? "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: NAME, version: VERSION } } };
  }
  if (method === "notifications/initialized" || method === "notifications/cancelled")
    return null;
  if (method === "ping")
    return { jsonrpc: "2.0", id, result: {} };
  if (method === "tools/list") {
    return { jsonrpc: "2.0", id, result: { tools: TOOLS.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })) } };
  }
  if (method === "tools/call") {
    const name = params?.name;
    const args = params?.arguments ?? {};
    const tool = TOOL_BY_NAME.get(name);
    if (!tool)
      return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true } };
    try {
      const out = await tool.run(args);
      return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text: toWire(out) }] } };
    } catch (e) {
      log(`${name} crashed: ${e?.message ?? e}`);
      const text = toWire({ speak: "Sports hit an unexpected error. Please try again.", card: errorCard({ spoken: "Sports hit an unexpected error." }) });
      return { jsonrpc: "2.0", id, result: { content: [{ type: "text", text }], isError: true } };
    }
  }
  if (isNotification)
    return null;
  return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
}
var buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  let nl = buffer.indexOf(`
`);
  while (nl !== -1) {
    const line = buffer.slice(0, nl).trim();
    buffer = buffer.slice(nl + 1);
    if (line) {
      let msg = null;
      try {
        msg = JSON.parse(line);
      } catch {
        log("dropped a malformed frame");
      }
      if (msg && typeof msg === "object") {
        handle(msg).then((reply) => {
          if (reply)
            write(reply);
        }).catch((e) => log(`handler crashed: ${e?.message ?? e}`));
      }
    }
    nl = buffer.indexOf(`
`);
  }
});
process.stdin.on("end", () => process.exit(0));
log(`ready — ${TOOLS.length} tools, integration ${INTEGRATION_ID}, ESPN keyless (NO setup), native cards on`);
