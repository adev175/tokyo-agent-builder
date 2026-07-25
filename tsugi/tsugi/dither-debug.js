// Paper Shaders dithering background + live debugger.
// Loads @paper-design/shaders (vanilla) from esm.sh, mounts a full-viewport
// dither canvas behind the page, and exposes every shader lever in a panel.
// Loaded as a classic script (works from file:// too); the library itself is
// pulled in via dynamic import below.
(async () => {

let shaders;
try {
  shaders = await import('https://esm.sh/@paper-design/shaders@0.0.77');
} catch (e) {
  console.error('[dither-debug] failed to load @paper-design/shaders from esm.sh:', e);
  return;
}
const { ShaderMount, ditheringFragmentShader, DitheringShapes, DitheringTypes, ShaderFitOptions } = shaders;

const STORAGE_KEY = 'tsugi-dither-settings-v1';

const DEFAULTS = {
  // Pattern
  shape: 'simplex',        // simplex | warp | dots | wave | ripple | swirl | sphere
  type: '4x4',             // random | 2x2 | 4x4 | 8x8
  pxSize: 2,
  // Colors
  colorBack: '#d6d4cc', alphaBack: 1,
  colorFront: '#9e3327', alphaFront: 0.4,
  // Motion
  speed: 0.3, playing: true,
  // Sizing
  fit: 'none', scale: 1, rotation: 0,
  offsetX: 0, offsetY: 0, originX: 0.5, originY: 0.5,
  worldWidth: 0, worldHeight: 0,
  // Quality
  minPixelRatio: 2, maxMegapixels: 8.3,
  // Compositing (CSS, outside the shader)
  opacity: 1, blend: 'normal', cardAlpha: 0.85,
};

const PRESETS = {
  'Paper clay (default)': { ...DEFAULTS },
  'Ink wash': { ...DEFAULTS, shape: 'warp', type: '8x8', pxSize: 2, colorBack: '#e9e7e0', colorFront: '#23211e', alphaFront: 0.65, speed: 0.15 },
  'Ripple pool': { ...DEFAULTS, shape: 'ripple', type: 'random', pxSize: 3, colorFront: '#3b5b4a', alphaFront: 0.55, speed: 0.5 },
  'Vermilion sphere': { ...DEFAULTS, shape: 'sphere', type: '2x2', pxSize: 4, colorFront: '#9e3327', alphaFront: 1, scale: 1.3, speed: 0.6 },
  'Static grain': { ...DEFAULTS, shape: 'simplex', type: 'random', pxSize: 1.5, colorFront: '#8b877f', alphaFront: 0.5, speed: 0 },
  'Big dots': { ...DEFAULTS, shape: 'dots', type: '8x8', pxSize: 7, colorFront: '#7a5c1e', alphaFront: 0.7, speed: 0.25 },
};

let S = { ...DEFAULTS };
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (saved && typeof saved === 'object') S = { ...DEFAULTS, ...saved };
} catch { /* corrupt storage — fall back to defaults */ }

// ---------- helpers ----------

function hexToVec4(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, alpha];
}

function toHex8(hex, alpha) {
  if (alpha >= 1) return hex;
  return hex + Math.round(alpha * 255).toString(16).padStart(2, '0');
}

function uniformsFrom(s) {
  return {
    u_colorBack: hexToVec4(s.colorBack, s.alphaBack),
    u_colorFront: hexToVec4(s.colorFront, s.alphaFront),
    u_shape: DitheringShapes[s.shape],
    u_type: DitheringTypes[s.type],
    u_pxSize: s.pxSize,
    u_fit: ShaderFitOptions[s.fit],
    u_scale: s.scale,
    u_rotation: s.rotation,
    u_offsetX: s.offsetX,
    u_offsetY: s.offsetY,
    u_originX: s.originX,
    u_originY: s.originY,
    u_worldWidth: s.worldWidth,
    u_worldHeight: s.worldHeight,
  };
}

function el(tag, style, props) {
  const node = document.createElement(tag);
  if (style) node.style.cssText = style;
  if (props) Object.assign(node, props);
  return node;
}

// ---------- shader mount ----------

const host = el('div', 'position:fixed;inset:0;z-index:0;pointer-events:none;');
host.id = 'dither-bg';
document.body.appendChild(host);

// Keep the dc-rendered app above the canvas.
const layerCss = el('style');
layerCss.textContent = '#dc-root{position:relative;z-index:1;}';
document.head.appendChild(layerCss);

const mount = new ShaderMount(
  host,
  ditheringFragmentShader,
  uniformsFrom(S),
  undefined,
  S.playing ? S.speed : 0,
  0,
  S.minPixelRatio,
  S.maxMegapixels * 1e6,
);

function applyAll() {
  mount.setUniforms(uniformsFrom(S));
  mount.setSpeed(S.playing ? S.speed : 0);
  mount.setMinPixelRatio(S.minPixelRatio);
  mount.setMaxPixelCount(S.maxMegapixels * 1e6);
  host.style.opacity = S.opacity;
  host.style.mixBlendMode = S.blend;
  document.documentElement.style.setProperty('--tsugi-card-alpha', S.cardAlpha);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(S));
}
applyAll();

// ---------- debug panel ----------

const MONO = "font-family:'IBM Plex Mono',monospace;";
const panel = el('div',
  MONO + `position:fixed;top:12px;right:12px;z-index:2147483000;width:292px;max-height:calc(100vh - 24px);
  overflow-y:auto;background:rgba(35,33,30,0.94);color:#e9e7e0;border:1px solid #4a463f;border-radius:4px;
  padding:12px 14px 14px;font-size:11px;line-height:1.5;backdrop-filter:blur(3px);display:none;`);

const chip = el('button', MONO + `position:fixed;bottom:14px;right:14px;z-index:2147483001;background:#23211e;
  color:#e9e7e0;border:1px solid #4a463f;border-radius:3px;padding:7px 12px;font-size:11px;letter-spacing:0.1em;
  cursor:pointer;`, { textContent: '◧ DITHER' });
chip.onclick = () => { panel.style.display = panel.style.display === 'none' ? 'block' : 'none'; };
document.body.appendChild(chip);
document.body.appendChild(panel);

const refreshers = [];
function refreshUI() { refreshers.forEach(fn => fn()); }
function set(key, value) { S[key] = value; applyAll(); }

function sectionTitle(text) {
  panel.appendChild(el('div',
    'margin:12px 0 6px;letter-spacing:0.16em;font-size:9.5px;color:#97938a;text-transform:uppercase;border-bottom:1px solid #4a463f;padding-bottom:3px;',
    { textContent: text }));
}

function row(labelText, control, extra) {
  const r = el('div', 'display:flex;align-items:center;gap:8px;margin:4px 0;');
  r.appendChild(el('span', 'flex:none;width:78px;color:#b9b5aa;', { textContent: labelText }));
  control.style.flex = '1';
  r.appendChild(control);
  if (extra) r.appendChild(extra);
  panel.appendChild(r);
  return r;
}

function slider(labelText, key, min, max, step) {
  const range = el('input', 'accent-color:#9e3327;min-width:0;', { type: 'range', min, max, step, value: S[key] });
  const num = el('input',
    MONO + 'flex:none;width:52px;background:#1d1b18;color:#e9e7e0;border:1px solid #4a463f;border-radius:2px;padding:2px 4px;font-size:10.5px;',
    { type: 'number', min, max, step, value: S[key] });
  range.oninput = () => { num.value = range.value; set(key, parseFloat(range.value)); };
  num.onchange = () => { range.value = num.value; set(key, parseFloat(num.value) || 0); };
  refreshers.push(() => { range.value = S[key]; num.value = S[key]; });
  row(labelText, range, num);
}

function select(labelText, key, options) {
  const sel = el('select',
    MONO + 'background:#1d1b18;color:#e9e7e0;border:1px solid #4a463f;border-radius:2px;padding:3px 4px;font-size:10.5px;');
  options.forEach(o => sel.appendChild(el('option', '', { value: o, textContent: o })));
  sel.value = S[key];
  sel.onchange = () => set(key, sel.value);
  refreshers.push(() => { sel.value = S[key]; });
  row(labelText, sel);
}

function colorControl(labelText, colorKey, alphaKey) {
  const color = el('input', 'flex:none;width:34px;height:22px;padding:0;border:1px solid #4a463f;background:none;cursor:pointer;',
    { type: 'color', value: S[colorKey] });
  const alpha = el('input', 'accent-color:#9e3327;min-width:0;flex:1;', { type: 'range', min: 0, max: 1, step: 0.01, value: S[alphaKey] });
  const readout = el('span', 'flex:none;width:52px;color:#97938a;font-size:10px;', { textContent: 'a ' + S[alphaKey] });
  color.oninput = () => set(colorKey, color.value);
  alpha.oninput = () => { readout.textContent = 'a ' + alpha.value; set(alphaKey, parseFloat(alpha.value)); };
  refreshers.push(() => { color.value = S[colorKey]; alpha.value = S[alphaKey]; readout.textContent = 'a ' + S[alphaKey]; });
  const wrap = el('div', 'display:flex;align-items:center;gap:8px;flex:1;min-width:0;');
  wrap.append(color, alpha, readout);
  row(labelText, wrap);
}

function button(text, onclick, wide) {
  const b = el('button',
    MONO + `background:#1d1b18;color:#e9e7e0;border:1px solid #4a463f;border-radius:2px;padding:5px 8px;
    font-size:10.5px;cursor:pointer;letter-spacing:0.04em;` + (wide ? 'flex:1;' : ''),
    { textContent: text });
  b.onclick = onclick;
  return b;
}

// Header
const head = el('div', 'display:flex;align-items:center;justify-content:space-between;gap:8px;');
head.appendChild(el('span', 'letter-spacing:0.14em;font-size:11px;', { textContent: '◧ DITHER DEBUG' }));
head.appendChild(button('hide', () => { panel.style.display = 'none'; }));
panel.appendChild(head);

// Presets
sectionTitle('Presets');
const presetSel = el('select',
  MONO + 'width:100%;background:#1d1b18;color:#e9e7e0;border:1px solid #4a463f;border-radius:2px;padding:3px 4px;font-size:10.5px;');
presetSel.appendChild(el('option', '', { value: '', textContent: '— pick a preset —' }));
Object.keys(PRESETS).forEach(name => presetSel.appendChild(el('option', '', { value: name, textContent: name })));
presetSel.onchange = () => {
  if (!presetSel.value) return;
  S = { ...PRESETS[presetSel.value] };
  applyAll(); refreshUI();
};
panel.appendChild(presetSel);

// Pattern
sectionTitle('Pattern');
select('shape', 'shape', Object.keys(DitheringShapes));
select('dither type', 'type', Object.keys(DitheringTypes));
slider('px size', 'pxSize', 0.5, 20, 0.1);

// Colors
sectionTitle('Colors');
colorControl('back', 'colorBack', 'alphaBack');
colorControl('front', 'colorFront', 'alphaFront');

// Motion
sectionTitle('Motion');
slider('speed', 'speed', -3, 3, 0.05);
const playBtn = button(S.playing ? 'pause' : 'play', () => {
  S.playing = !S.playing;
  playBtn.textContent = S.playing ? 'pause' : 'play';
  applyAll();
}, true);
refreshers.push(() => { playBtn.textContent = S.playing ? 'pause' : 'play'; });
const frameIn = el('input',
  MONO + 'flex:1;background:#1d1b18;color:#e9e7e0;border:1px solid #4a463f;border-radius:2px;padding:3px 4px;font-size:10.5px;',
  { type: 'number', step: 100, value: 0, placeholder: 'frame' });
const motionRow = el('div', 'display:flex;gap:8px;margin:4px 0;');
motionRow.append(playBtn, frameIn, button('set frame', () => mount.setFrame(parseFloat(frameIn.value) || 0)));
panel.appendChild(motionRow);

// Sizing
sectionTitle('Sizing');
select('fit', 'fit', Object.keys(ShaderFitOptions));
slider('scale', 'scale', 0.01, 4, 0.01);
slider('rotation', 'rotation', 0, 360, 1);
slider('offset x', 'offsetX', -1, 1, 0.01);
slider('offset y', 'offsetY', -1, 1, 0.01);
slider('origin x', 'originX', 0, 1, 0.01);
slider('origin y', 'originY', 0, 1, 0.01);
slider('world w', 'worldWidth', 0, 3000, 10);
slider('world h', 'worldHeight', 0, 3000, 10);

// Quality
sectionTitle('Quality');
slider('min px ratio', 'minPixelRatio', 0.5, 3, 0.25);
slider('max Mpx', 'maxMegapixels', 0.5, 16, 0.5);

// Compositing
sectionTitle('Compositing (CSS)');
slider('opacity', 'opacity', 0, 1, 0.01);
select('blend mode', 'blend', ['normal', 'multiply', 'darken', 'overlay', 'soft-light', 'hard-light', 'difference', 'exclusion', 'screen', 'lighten', 'color-burn', 'luminosity']);
slider('card alpha', 'cardAlpha', 0, 1, 0.01);

// Actions
sectionTitle('Actions');
const actions = el('div', 'display:flex;flex-wrap:wrap;gap:6px;');
actions.appendChild(button('randomize', () => {
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const hex = () => '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  Object.assign(S, {
    shape: pick(Object.keys(DitheringShapes)),
    type: pick(Object.keys(DitheringTypes)),
    pxSize: +(0.5 + Math.random() * 10).toFixed(1),
    colorBack: hex(), colorFront: hex(),
    alphaBack: 1, alphaFront: +(0.3 + Math.random() * 0.7).toFixed(2),
    speed: +(Math.random() * 1.5).toFixed(2),
    scale: +(0.3 + Math.random() * 2).toFixed(2),
    rotation: Math.floor(Math.random() * 360),
  });
  applyAll(); refreshUI();
}, true));
actions.appendChild(button('reset', () => { S = { ...DEFAULTS }; applyAll(); refreshUI(); }, true));
actions.appendChild(button('copy JSON', () => navigator.clipboard.writeText(JSON.stringify(S, null, 2)), true));
actions.appendChild(button('copy <Dithering/>', () => {
  const jsx = `<Dithering
  colorBack="${toHex8(S.colorBack, S.alphaBack)}"
  colorFront="${toHex8(S.colorFront, S.alphaFront)}"
  shape="${S.shape}"
  type="${S.type}"
  size={${S.pxSize}}
  speed={${S.playing ? S.speed : 0}}
  fit="${S.fit}"
  scale={${S.scale}}
  rotation={${S.rotation}}
  offsetX={${S.offsetX}}
  offsetY={${S.offsetY}}
  originX={${S.originX}}
  originY={${S.originY}}
  worldWidth={${S.worldWidth}}
  worldHeight={${S.worldHeight}}
  minPixelRatio={${S.minPixelRatio}}
  maxPixelCount={${S.maxMegapixels * 1e6}}
  style={{ position: 'fixed', inset: 0, opacity: ${S.opacity}, mixBlendMode: '${S.blend}' }}
/>`;
  navigator.clipboard.writeText(jsx);
}, true));
panel.appendChild(actions);

panel.appendChild(el('div', 'margin-top:10px;color:#6a6660;font-size:9.5px;',
  { textContent: '@paper-design/shaders 0.0.77 · settings persist in localStorage' }));

})();
