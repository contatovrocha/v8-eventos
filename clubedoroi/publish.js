/* Clube do RØI — criação de conteúdo: publicação no Feed (estilo Instagram) e Stories.
   Usa a mesma infraestrutura do app: tabelas social_posts e stories, bucket "media" e as notificações existentes. */
(() => {
'use strict';
const legacyComposer = window.composer;          // edição de legenda e "compartilhar post" continuam no fluxo atual
const MAX_ITEMS = 10, MAX_VIDEO = 50 * 1024 * 1024;
const ASPECTS = [['1:1', 'Quadrado', 1], ['4:5', 'Retrato', 4 / 5], ['1.91:1', 'Paisagem', 1.91]];
const FILTERS = [
  { k: 'normal', n: 'Original', b: 1, c: 1, s: 1, p: 0 }, { k: 'luz', n: 'Luz', b: 1.07, c: 1.06, s: 1.15, p: 0 },
  { k: 'ouro', n: 'Ouro', b: 1.04, c: 1.05, s: 1.12, p: 0.22 }, { k: 'suave', n: 'Suave', b: 1.06, c: 0.9, s: 0.85, p: 0.05 },
  { k: 'vintage', n: 'Vintage', b: 1.03, c: 0.95, s: 0.85, p: 0.35 }, { k: 'drama', n: 'Drama', b: 0.98, c: 1.28, s: 1.08, p: 0 },
  { k: 'noir', n: 'Noir', b: 1.02, c: 1.2, s: 0, p: 0 },
];
const KINDS = [['post', 'Publicação'], ['conquista', 'Conquista'], ['novidade', 'Novidade'], ['projeto', 'Projeto'], ['case', 'Case'], ['oportunidade', 'Oportunidade'], ['evento', 'Evento']];
const BGS = ['noir', 'ouro', 'oceano', 'vinho', 'mata', 'aurora'];
const BG_STOPS = { noir: ['#3a3a42', '#0b0b0d'], ouro: ['#8a6a2f', '#f6e3a8'], oceano: ['#0b3d91', '#4dd0e1'], vinho: ['#3b0a1e', '#d8435c'], mata: ['#0b3b2c', '#7cc58f'], aurora: ['#4b2a8a', '#f59e58'] };
const COLORS = ['#ffffff', '#111111', '#e3c47c', '#ff5a5f', '#ff9f43', '#ffd93d', '#3ddc84', '#4a8cf7', '#b388ff', '#ff6fb5'];
const EMOJIS = ['🔥', '🚀', '💼', '🤝', '📈', '💡', '🎯', '🏆', '🎉', '🥂', '✨', '⭐', '❤️', '👏', '🙌', '😍', '😂', '😎', '☕', '📍', '💰', '🌎', '✈️', '📣'];
const cssF = (f) => `brightness(${f.b}) contrast(${f.c}) saturate(${f.s}) sepia(${f.p})`;
const FIL = (k) => FILTERS.find((f) => f.k === k) || FILTERS[0];
const canvasFilterOK = (() => { try { const c = document.createElement('canvas').getContext('2d'); return typeof c.filter === 'string'; } catch (_) { return false; } })();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const uid8 = () => Math.random().toString(36).slice(2, 10);
const esc = (s) => h(s);

/* ---------- utilitários de mídia ---------- */
function loadMeta(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    if (file.type.startsWith('video/')) {
      const v = document.createElement('video'); v.preload = 'metadata'; v.muted = true; v.playsInline = true; v.src = url;
      v.onloadedmetadata = () => res({ url, type: 'video', w: v.videoWidth || 1080, h: v.videoHeight || 1920, dur: isFinite(v.duration) ? v.duration : 0 });
      v.onerror = () => rej(new Error('Não foi possível ler este vídeo neste aparelho.'));
    } else {
      const i = new Image(); i.onload = () => res({ url, type: 'image', w: i.naturalWidth, h: i.naturalHeight }); i.onerror = () => rej(new Error('Formato de imagem não suportado.')); i.src = url;
    }
  });
}
function applyPixelFilter(ctx, w, hh, f) {             // usado quando o navegador não aplica filtro no canvas (Safari antigo)
  if (f.k === 'normal') return;
  const d = ctx.getImageData(0, 0, w, hh), a = d.data;
  for (let i = 0; i < a.length; i += 4) {
    let r = a[i] * f.b, g = a[i + 1] * f.b, b = a[i + 2] * f.b;
    r = (r - 128) * f.c + 128; g = (g - 128) * f.c + 128; b = (b - 128) * f.c + 128;
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b; r = l + (r - l) * f.s; g = l + (g - l) * f.s; b = l + (b - l) * f.s;
    if (f.p) { const sr = 0.393 * r + 0.769 * g + 0.189 * b, sg = 0.349 * r + 0.686 * g + 0.168 * b, sb2 = 0.272 * r + 0.534 * g + 0.131 * b; r += (sr - r) * f.p; g += (sg - g) * f.p; b += (sb2 - b) * f.p; }
    a[i] = clamp(r, 0, 255); a[i + 1] = clamp(g, 0, 255); a[i + 2] = clamp(b, 0, 255);
  }
  ctx.putImageData(d, 0, 0);
}
/* desenha a mídia (cover + zoom s + deslocamento x,y em fração do quadro), igual à prévia */
function drawCover(ctx, src, sw, sh, W, H, it) {
  const base = Math.max(W / sw, H / sh), dw = sw * base * it.s, dh = sh * base * it.s;
  ctx.drawImage(src, W / 2 - dw / 2 + it.x * W, H / 2 - dh / 2 + it.y * H, dw, dh);
}
async function imgEl(url) { const i = new Image(); i.src = url; await i.decode(); return i; }
const toBlob = (c, q = 0.88) => new Promise((r) => c.toBlob((b) => r(b), 'image/jpeg', q));
async function exportPhoto(it, aspect) {
  const W = 1440, H = Math.round(W / aspect);
  const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d');
  const img = await imgEl(it.url); const f = FIL(it.filter);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (canvasFilterOK) ctx.filter = cssF(f);
  drawCover(ctx, img, img.naturalWidth, img.naturalHeight, W, H, it);
  ctx.filter = 'none'; if (!canvasFilterOK) applyPixelFilter(ctx, W, H, f);
  return toBlob(c);
}
async function videoFrame(url, t, maxW = 1080) {
  const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = url;
  await new Promise((r, j) => { v.onloadeddata = r; v.onerror = j; setTimeout(r, 4000); });
  try { await v.play(); v.pause(); } catch (_) {}
  await new Promise((r) => { v.onseeked = r; v.currentTime = Math.max(0.05, t || 0); setTimeout(r, 3000); });
  const k = Math.min(1, maxW / (v.videoWidth || maxW)); const c = document.createElement('canvas'); c.width = Math.round((v.videoWidth || 720) * k); c.height = Math.round((v.videoHeight || 1280) * k);
  c.getContext('2d').drawImage(v, 0, 0, c.width, c.height); return toBlob(c, 0.82);
}
async function put(blob, folder, ext, type) {
  const path = `${S.user.id}/${folder}/${Date.now()}-${uid8()}.${ext}`;
  const { error } = await sb.storage.from('media').upload(path, blob, { contentType: type, upsert: false });
  if (error) throw error;
  return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
}
const vext = (f) => ((f.name || '').split('.').pop() || (f.type.includes('quicktime') ? 'mov' : f.type.includes('webm') ? 'webm' : 'mp4')).toLowerCase().slice(0, 5);

/* gestos de arrastar / pinçar / roda do mouse para enquadrar */
function frameGestures(box, get, apply, opts = {}) {
  const pts = new Map(); let st = null;
  const dist = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  box.addEventListener('pointerdown', (e) => { if (opts.skip && opts.skip(e)) return; box.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); const it = get(); st = { x: it.x, y: it.y, s: it.s, px: e.clientX, py: e.clientY, d: pts.size === 2 ? dist() : 0 }; });
  box.addEventListener('pointermove', (e) => { if (!pts.has(e.pointerId) || !st) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); const it = get(); const r = box.getBoundingClientRect();
    if (pts.size >= 2) { if (!st.d) { st.d = dist(); st.s = it.s; } it.s = clamp(st.s * dist() / st.d, opts.min || 1, 5); }
    else { it.x = st.x + (e.clientX - st.px) / r.width; it.y = st.y + (e.clientY - st.py) / r.height; }
    apply(); });
  const end = (e) => { pts.delete(e.pointerId); const it = get(); st = pts.size ? { x: it.x, y: it.y, s: it.s, px: [...pts.values()][0].x, py: [...pts.values()][0].y, d: 0 } : null; };
  box.addEventListener('pointerup', end); box.addEventListener('pointercancel', end);
  box.addEventListener('wheel', (e) => { e.preventDefault(); const it = get(); it.s = clamp(it.s * (1 - e.deltaY * 0.0015), opts.min || 1, 5); apply(); }, { passive: false });
}
/* limita o deslocamento para a mídia sempre cobrir o quadro (ou ficar dentro dele, se reduzida) */
function clampFrame(it, VW, VH) {
  const base = Math.max(VW / it.w, VH / it.h), dw = it.w * base * it.s, dh = it.h * base * it.s;
  const mx = Math.abs(dw - VW) / 2 / VW, my = Math.abs(dh - VH) / 2 / VH;
  it.x = clamp(it.x, -mx, mx); it.y = clamp(it.y, -my, my);
}
const tf = (it) => `translate(${it.x * 100}%,${it.y * 100}%) scale(${it.s})`;

function overlayRoot(cls) {
  const el = document.createElement('div'); el.className = cls; document.body.appendChild(el); document.body.style.overflow = 'hidden';
  history.pushState({ cdrOverlay: cls }, '');                                        // botão "voltar" do celular fecha o editor
  return el;
}

/* =====================================================================
   1. PUBLICAÇÃO NO FEED
   ===================================================================== */
function openPublisher() {
  const P = { items: [], cur: 0, aspect: '1:1', step: 'pick', caption: '', kind: 'post', location: '', music_title: '', music_url: '', mentions: [], textOnly: false, bg: 'noir', busy: false, tab: 'filtros' };
  const root = overlayRoot('pub');
  const gal = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*,video/*', multiple: true, hidden: true });
  const cam = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*,video/*', hidden: true }); cam.setAttribute('capture', 'environment');
  root.append(gal, cam);
  let closed = false;
  const close = (force) => {
    if (closed) return; if (!force && (P.items.length || P.caption.trim()) && !confirm('Descartar esta publicação?')) { history.pushState({ cdrOverlay: 'pub' }, ''); return; }
    closed = true; window.removeEventListener('popstate', onPop); P.items.forEach((i) => URL.revokeObjectURL(i.url)); root.classList.add('out'); setTimeout(() => root.remove(), 220);
    if (!$('.sheet, .sc, .pub:not(.out)')) document.body.style.overflow = ''; if (history.state && history.state.cdrOverlay === 'pub') history.back();
  };
  const onPop = () => { if (!closed) close(); }; window.addEventListener('popstate', onPop);
  const addFiles = async (files) => {
    const list = [...files].slice(0, MAX_ITEMS - P.items.length);
    if (files.length > list.length) toast(`Máximo de ${MAX_ITEMS} fotos ou vídeos por publicação`, true);
    for (const f of list) {
      if (!/^(image|video)\//.test(f.type)) { toast('Formato não suportado: ' + (f.name || 'arquivo'), true); continue; }
      if (f.type.startsWith('video/') && f.size > MAX_VIDEO) { toast('Vídeo acima de 50 MB', true); continue; }
      try { const m = await loadMeta(f); P.items.push({ id: uid8(), file: f, ...m, s: 1, x: 0, y: 0, filter: 'normal', start: 0, end: m.dur ? Math.min(m.dur, 90) : 0, cover: 0 }); }
      catch (e) { toast(e.message, true); }
    }
    if (P.items.length && P.step === 'pick' && P.items.length === list.length) { const f0 = P.items[0]; P.aspect = f0.h > f0.w * 1.05 ? '4:5' : f0.w > f0.h * 1.4 ? '1.91:1' : '1:1'; }
    P.cur = Math.max(0, P.items.length - list.length); P.textOnly = false; render();
  };
  gal.onchange = () => { addFiles(gal.files); gal.value = ''; }; cam.onchange = () => { addFiles(cam.files); cam.value = ''; };
  const AR = () => ASPECTS.find((a) => a[0] === P.aspect)[2];
  const head = (left, title, right) => `<header class="pub-h">${left}<b>${title}</b>${right}</header>`;
  const thumbs = (editable) => `<div class="pub-strip">${P.items.map((it, i) => `<button class="pth ${i === P.cur ? 'on' : ''}" data-i="${i}" aria-label="Mídia ${i + 1}">
      ${it.type === 'video' ? `<video src="${it.url}" muted playsinline preload="metadata"></video><i class="vb">${I('play', 12)}</i>` : `<img src="${it.url}" alt="" style="filter:${cssF(FIL(it.filter))}">`}
      ${P.items.length > 1 ? `<span class="pn">${i + 1}</span>` : ''}${editable ? `<span class="px" data-rm="${i}" role="button" aria-label="Remover">${I('x', 12)}</span>` : ''}</button>`).join('')}
    ${editable && P.items.length < MAX_ITEMS ? `<button class="pth add" data-add aria-label="Adicionar mais">${I('plus', 22)}</button>` : ''}</div>`;

  function render() {
    if (P.step === 'pick') renderPick(); else if (P.step === 'edit') renderEdit(); else renderDetails();
    root.append(gal, cam);                                  // os campos de arquivo ficam sempre na página (exigência do Safari)
  }
  function renderPick() {
    const it = P.items[P.cur];
    if (!it) {
      root.innerHTML = head(`<button class="pub-ic" data-close aria-label="Fechar">${I('x', 20)}</button>`, 'Nova publicação', '<span style="width:44px"></span>') + `
        <div class="pub-empty"><div class="pe-ic">${I('image', 40)}</div><h3>Compartilhe com o clube</h3><p class="muted">Fotos e vídeos. Selecione várias para criar um carrossel.</p>
          <button class="btn btn-gold btn-block" data-gal>${I('image')} Escolher da galeria</button>
          <button class="btn btn-ghost btn-block" data-cam>${I('camera')} Usar a câmera</button>
          <button class="btn btn-block" data-text style="color:var(--mut)">${I('type')} Escrever um texto</button></div>`;
      root.append(gal, cam); bind(); return;
    }
    root.innerHTML = head(`<button class="pub-ic" data-close aria-label="Fechar">${I('x', 20)}</button>`, 'Nova publicação', `<button class="pub-next" data-next>Avançar</button>`) + `
      <div class="pub-body pick"><div class="pub-prev">${it.type === 'video' ? `<video src="${it.url}" playsinline muted autoplay loop></video>` : `<img src="${it.url}" alt="">`}</div>
      <div class="pub-tools">${P.items.length > 1 ? `<button class="chip" data-mv="-1" ${P.cur ? '' : 'disabled'}>${I('back', 14)} Mover</button><span class="small muted">${P.cur + 1} de ${P.items.length}</span><button class="chip" data-mv="1" ${P.cur < P.items.length - 1 ? '' : 'disabled'}>Mover ${I('next', 14)}</button>` : `<span class="small muted">Toque em + para criar um carrossel</span>`}</div>
      ${thumbs(true)}</div>`;
    root.append(gal, cam); bind();
  }
  function renderEdit() {
    const it = P.items[P.cur]; const isV = it.type === 'video';
    root.innerHTML = head(`<button class="pub-ic" data-back aria-label="Voltar">${I('back', 20)}</button>`, 'Editar', `<button class="pub-next" data-next>Avançar</button>`) + `
      <div class="pub-body edit">
        <div class="pub-ar">${ASPECTS.map(([k, n]) => `<button class="${k === P.aspect ? 'on' : ''}" data-ar="${k}"><i class="arb" style="aspect-ratio:${k.replace(':', '/')}"></i>${n}</button>`).join('')}</div>
        <div class="pub-stagewrap"><div class="pub-stage" style="aspect-ratio:${AR()}">
          ${isV ? `<video src="${it.url}" playsinline muted loop autoplay style="transform:${tf(it)}"></video>` : `<img src="${it.url}" alt="" draggable="false" style="transform:${tf(it)};filter:${cssF(FIL(it.filter))}">`}
          <div class="grid3"></div></div></div>
        <div class="seg pub-seg">${isV ? `<button data-tab="corte" class="${P.tab !== 'capa' ? 'on' : ''}">Trecho</button><button data-tab="capa" class="${P.tab === 'capa' ? 'on' : ''}">Capa</button>` : `<button data-tab="filtros" class="${P.tab !== 'ajustar' ? 'on' : ''}">Filtros</button><button data-tab="ajustar" class="${P.tab === 'ajustar' ? 'on' : ''}">Ajustar</button>`}</div>
        <div class="pub-panel">${isV ? videoPanel(it) : P.tab === 'ajustar' ? zoomPanel(it) : filterPanel(it)}</div>
        ${P.items.length > 1 ? thumbs(false) : ''}
        <p class="pub-hint">${I('spark', 14)} Arraste para posicionar · pince ou use o controle para ampliar</p></div>`;
    bind(); bindStage();
  }
  const zoomPanel = (it) => `<div class="pub-zoom"><span>${I('search', 16)}</span><input type="range" min="1" max="4" step="0.01" value="${it.s}" data-zoom aria-label="Zoom"><button class="chip" data-reset>Centralizar</button></div>`;
  const filterPanel = (it) => `<div class="pub-filters">${FILTERS.map((f) => `<button class="pf ${it.filter === f.k ? 'on' : ''}" data-f="${f.k}"><img src="${it.url}" alt="" style="filter:${cssF(f)}"><span>${f.n}</span></button>`).join('')}</div>`;
  const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
  const videoPanel = (it) => P.tab === 'capa'
    ? `<div class="pub-cover"><div class="cvbox"><video src="${it.url}#t=${it.cover}" muted playsinline preload="auto" data-cv></video></div><div class="grow"><label class="small muted">Escolha o quadro da capa</label><input type="range" min="0" max="${Math.max(0.1, it.dur).toFixed(2)}" step="0.05" value="${it.cover}" data-cover aria-label="Capa"></div></div>`
    : `<div class="pub-trim"><div class="row" style="justify-content:space-between"><span class="small muted">Início ${fmt(it.start)}</span><span class="small">${fmt(Math.max(0, it.end - it.start))}</span><span class="small muted">Fim ${fmt(it.end)}</span></div>
        <div class="dual"><div class="dual-fill" style="left:${it.dur ? it.start / it.dur * 100 : 0}%;right:${it.dur ? 100 - it.end / it.dur * 100 : 0}%"></div>
          <input type="range" min="0" max="${it.dur.toFixed(2)}" step="0.05" value="${it.start}" data-ts aria-label="Início do trecho"><input type="range" min="0" max="${it.dur.toFixed(2)}" step="0.05" value="${it.end}" data-te aria-label="Fim do trecho"></div>
        <p class="small muted" style="margin-top:8px">Também dá para arrastar o vídeo para ajustar o enquadramento.</p></div>`;
  function bindStage() {
    const stage = $('.pub-stage', root); const media = $('img,video', stage); const it = P.items[P.cur];
    const apply = () => { const r = stage.getBoundingClientRect(); clampFrame(it, r.width, r.height); media.style.transform = tf(it); const z = $('[data-zoom]', root); if (z) z.value = it.s; };
    frameGestures(stage, () => it, apply); requestAnimationFrame(apply);
    if (it.type === 'video') { media.addEventListener('loadedmetadata', () => { media.currentTime = it.start; }); media.addEventListener('timeupdate', () => { if (it.end && media.currentTime >= it.end) media.currentTime = it.start; }); }
  }
  function renderDetails() {
    const it = P.items[0];
    root.innerHTML = head(`<button class="pub-ic" data-back aria-label="Voltar">${I('back', 20)}</button>`, P.textOnly ? 'Novo texto' : 'Nova publicação', `<button class="pub-next share" data-share>Compartilhar</button>`) + `
      <div class="pub-body details">
        ${P.textOnly ? `<div class="tpost bg-${P.bg} pub-tprev"><p>${esc(P.caption) || 'Seu texto aparece aqui'}</p></div><div class="bgs" style="margin:10px 0 4px">${BGS.map((k) => `<button class="bgsw bg-${k} ${k === P.bg ? 'on' : ''}" data-bg="${k}" aria-label="${k}"></button>`).join('')}</div>` : ''}
        <div class="pub-cap">${!P.textOnly ? `<div class="pub-mini">${it.type === 'video' ? `<video src="${it.url}" muted playsinline preload="metadata"></video>` : `<img src="${it.url}" alt="" style="filter:${cssF(FIL(it.filter))}">`}${P.items.length > 1 ? `<i>${I('copy', 12)}</i>` : ''}</div>` : ''}
          <textarea id="pcap" maxlength="3000" placeholder="${P.textOnly ? 'O que você quer compartilhar?' : 'Escreva uma legenda…'}" aria-label="Legenda">${esc(P.caption)}</textarea></div>
        <div class="pub-tagsug" id="ptags"></div>
        <div class="pub-rows">
          <button class="pr" data-people>${I('user', 20)}<span class="grow">Marcar pessoas</span><span class="pr-v">${P.mentions.length ? P.mentions.length + ' ' + (P.mentions.length === 1 ? 'pessoa' : 'pessoas') : ''}</span>${I('next', 16)}</button>
          ${P.mentions.length ? `<div class="pub-chips">${P.mentions.map((id) => { const pp = S.cache.get(id) || {}; return `<span class="chip on">${esc((pp.full_name || '').split(' ').slice(0, 2).join(' '))}<button data-unm="${id}" aria-label="Remover">${I('x', 12)}</button></span>`; }).join('')}</div>` : ''}
          <label class="pr">${I('pin', 20)}<input class="grow" id="ploc" maxlength="120" placeholder="Adicionar localização" value="${esc(P.location)}"></label>
          <details class="pr-more" ${P.music_title ? 'open' : ''}><summary class="pr">${I('music', 20)}<span class="grow">Adicionar música</span>${I('down', 16)}</summary>
            <div class="f2" style="padding:4px 0 10px"><input class="pin" id="pmt" maxlength="120" placeholder="Nome · Artista" value="${esc(P.music_title)}"><input class="pin" id="pmu" maxlength="500" placeholder="Link (Spotify ou YouTube)" value="${esc(P.music_url)}"></div></details>
          <div class="pr col"><span class="small muted">Tipo de publicação</span><div class="pub-kinds">${KINDS.map(([k, n]) => `<button class="chip ${P.kind === k ? 'on' : ''}" data-kind="${k}">${n}</button>`).join('')}</div></div>
          <button class="pr" data-preview>${I('eye', 20)}<span class="grow">Pré-visualizar no feed</span>${I('next', 16)}</button>
        </div></div>`;
    bind();
    const ta = $('#pcap', root); const grow = () => { ta.style.height = 'auto'; ta.style.height = Math.min(320, ta.scrollHeight) + 'px'; };
    ta.addEventListener('input', () => { P.caption = ta.value; grow(); const tp = $('.pub-tprev p', root); if (tp) tp.textContent = ta.value || 'Seu texto aparece aqui'; tagSuggest(); }); grow();
    if (!P.caption) setTimeout(() => ta.focus(), 250);
    $('#ploc', root).oninput = (e) => (P.location = e.target.value); $('#pmt', root).oninput = (e) => (P.music_title = e.target.value); $('#pmu', root).oninput = (e) => (P.music_url = e.target.value);
  }
  function tagSuggest() {                                   // sugestões de hashtag enquanto digita "#..."
    const box = $('#ptags', root); if (!box) return; const m = /(?:^|\s)#([\p{L}\p{N}_]*)$/u.exec(P.caption);
    if (!m) return (box.innerHTML = '');
    const pre = m[1].toLowerCase(); const sug = ['networking', 'clubedoroi', 'negocios', 'empreendedorismo', 'conquista', 'parceria', 'gestao', 'vendas', 'lideranca', 'inovacao'].filter((t) => t.startsWith(pre) && t !== pre).slice(0, 6);
    box.innerHTML = sug.map((t) => `<button class="chip" data-tg="${t}">#${t}</button>`).join('');
    $$('[data-tg]', box).forEach((b) => (b.onclick = () => { P.caption = P.caption.replace(/#[\p{L}\p{N}_]*$/u, '#' + b.dataset.tg + ' '); const ta = $('#pcap', root); ta.value = P.caption; ta.focus(); box.innerHTML = ''; }));
  }
  function bind() {
    $$('[data-close]', root).forEach((b) => (b.onclick = () => close()));
    $$('[data-gal]', root).forEach((b) => (b.onclick = () => gal.click())); $$('[data-cam]', root).forEach((b) => (b.onclick = () => cam.click()));
    $$('[data-text]', root).forEach((b) => (b.onclick = () => { P.textOnly = true; P.step = 'details'; render(); }));
    $$('[data-add]', root).forEach((b) => (b.onclick = () => gal.click()));
    $$('[data-rm]', root).forEach((b) => (b.onclick = (e) => { e.stopPropagation(); const i = +b.dataset.rm; URL.revokeObjectURL(P.items[i].url); P.items.splice(i, 1); P.cur = Math.min(P.cur, P.items.length - 1); render(); }));
    $$('.pth[data-i]', root).forEach((b) => (b.onclick = (e) => { if (e.target.closest('[data-rm]')) return; P.cur = +b.dataset.i; render(); }));
    $$('[data-mv]', root).forEach((b) => (b.onclick = () => { const d = +b.dataset.mv, j = P.cur + d; if (j < 0 || j >= P.items.length) return; [P.items[P.cur], P.items[j]] = [P.items[j], P.items[P.cur]]; P.cur = j; render(); }));
    $$('[data-back]', root).forEach((b) => (b.onclick = () => { P.step = P.step === 'details' ? (P.textOnly ? 'pick' : 'edit') : 'pick'; if (P.step === 'pick' && P.textOnly) P.textOnly = false; render(); }));
    $$('[data-next]', root).forEach((b) => (b.onclick = () => { P.step = P.step === 'pick' ? 'edit' : 'details'; P.tab = 'filtros'; render(); }));
    $$('[data-ar]', root).forEach((b) => (b.onclick = () => { P.aspect = b.dataset.ar; P.items.forEach((i) => { i.x = 0; i.y = 0; }); render(); }));
    $$('[data-tab]', root).forEach((b) => (b.onclick = () => { P.tab = b.dataset.tab; render(); }));
    $$('[data-f]', root).forEach((b) => (b.onclick = () => { const it = P.items[P.cur]; it.filter = b.dataset.f; $('.pub-stage img', root).style.filter = cssF(FIL(it.filter)); $$('[data-f]', root).forEach((x) => x.classList.toggle('on', x === b)); }));
    const z = $('[data-zoom]', root); if (z) z.oninput = () => { const it = P.items[P.cur]; it.s = +z.value; const st = $('.pub-stage', root).getBoundingClientRect(); clampFrame(it, st.width, st.height); $('.pub-stage img,.pub-stage video', root).style.transform = tf(it); };
    const rs = $('[data-reset]', root); if (rs) rs.onclick = () => { const it = P.items[P.cur]; it.s = 1; it.x = 0; it.y = 0; render(); };
    const ts = $('[data-ts]', root), te = $('[data-te]', root);
    if (ts && te) { const upd = () => { const it = P.items[P.cur]; let a = +ts.value, b2 = +te.value; if (b2 - a < 1) { if (document.activeElement === ts) a = Math.max(0, b2 - 1); else b2 = Math.min(it.dur, a + 1); } it.start = a; it.end = b2; ts.value = a; te.value = b2;
        const fill = $('.dual-fill', root); fill.style.left = (a / it.dur * 100) + '%'; fill.style.right = (100 - b2 / it.dur * 100) + '%'; const v = $('.pub-stage video', root); if (v) v.currentTime = document.activeElement === te ? b2 - 0.2 : a;
        const sp = $$('.pub-trim .row span', root); sp[0].textContent = 'Início ' + fmt(a); sp[1].textContent = fmt(b2 - a); sp[2].textContent = 'Fim ' + fmt(b2); };
      ts.oninput = upd; te.oninput = upd; }
    const cv = $('[data-cover]', root); if (cv) cv.oninput = () => { const it = P.items[P.cur]; it.cover = +cv.value; const v = $('[data-cv]', root); if (v) v.currentTime = it.cover; const sv = $('.pub-stage video', root); if (sv) { sv.pause(); sv.currentTime = it.cover; } };
    $$('[data-bg]', root).forEach((b) => (b.onclick = () => { P.bg = b.dataset.bg; render(); }));
    $$('[data-kind]', root).forEach((b) => (b.onclick = () => { P.kind = b.dataset.kind; $$('[data-kind]', root).forEach((x) => x.classList.toggle('on', x === b)); }));
    $$('[data-unm]', root).forEach((b) => (b.onclick = () => { P.mentions = P.mentions.filter((x) => x !== b.dataset.unm); render(); }));
    const pe = $('[data-people]', root); if (pe) pe.onclick = () => peoplePicker(P.mentions, (ids) => { P.mentions = ids; render(); });
    const pv = $('[data-preview]', root); if (pv) pv.onclick = preview;
    const sh = $('[data-share]', root); if (sh) sh.onclick = publish;
  }
  function preview() {
    const fake = { media: P.textOnly ? [] : P.items.map((i) => ({ url: i.url, type: i.type, frame: i.type === 'video' ? { s: i.s, x: i.x, y: i.y } : null })), aspect: P.textOnly ? null : P.aspect };
    const body = P.textOnly ? `<div class="tpost bg-${P.bg}"><p>${esc(P.caption) || '…'}</p></div>` : mediaHtml(fake).replace(/<img src="([^"]+)"/g, (m, u) => { const it = P.items.find((x) => x.url === u); return it ? `<img src="${u}" style="filter:${cssF(FIL(it.filter))};transform:${tf(it)}"` : m; });
    sheet(`<h2>Assim vai aparecer</h2><article class="card post" style="margin:0"><div class="head">${av(S.me)}<div class="grow"><b class="ell" style="display:block">${esc(S.me.full_name)}</b><span class="small muted">${esc(coName(S.me))} · agora</span>${P.location ? `<span class="small muted" style="display:flex;gap:4px;align-items:center">${I('pin', 12)}${esc(P.location)}</span>` : ''}</div>${KIND[P.kind] ? `<span class="badge gold">${KIND[P.kind]}</span>` : ''}</div>
      ${body}${!P.textOnly && P.caption ? `<div class="body">${capHtml(P.caption)}</div>` : ''}</article>`, (el) => { initPostMedia(el); });
  }
  async function publish() {
    if (P.busy) return;
    if (P.textOnly && !P.caption.trim()) return toast('Escreva o texto da publicação', true);
    if (!P.textOnly && !P.items.length) return toast('Escolha uma foto ou vídeo', true);
    P.busy = true;
    const ov = document.createElement('div'); ov.className = 'pub-busy'; ov.innerHTML = `<div class="pb"><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19"/><circle class="pg" cx="22" cy="22" r="19"/></svg><b>Publicando…</b><span class="small muted" id="pbs">Preparando</span></div>`;
    root.appendChild(ov); const ring = $('.pg', ov), lab = $('#pbs', ov);
    const total = P.items.length * 2 + 1; let done = 0; const tick = (t) => { done++; ring.style.strokeDashoffset = String(119.4 * (1 - done / total)); if (t) lab.textContent = t; };
    try {
      const media = [];
      for (const [i, it] of P.items.entries()) {
        const n = P.items.length > 1 ? ` ${i + 1} de ${P.items.length}` : '';
        if (it.type === 'image') { tick('Ajustando foto' + n); const blob = await exportPhoto(it, AR()); tick('Enviando foto' + n); media.push({ url: await put(blob, 'posts', 'jpg', 'image/jpeg'), type: 'image' }); }
        else {
          tick('Enviando vídeo' + n); const url = await put(it.file, 'posts', vext(it.file), it.file.type || 'video/mp4');
          let poster = null; try { const pb = await videoFrame(it.url, it.cover || it.start || 0.1); if (pb) poster = await put(pb, 'posts', 'jpg', 'image/jpeg'); } catch (_) {}
          tick('Processando vídeo' + n);
          media.push({ url, type: 'video', poster, start: +it.start.toFixed(2), end: it.end && it.end < it.dur - 0.2 ? +it.end.toFixed(2) : 0, frame: (it.s !== 1 || it.x || it.y) ? { s: +it.s.toFixed(3), x: +it.x.toFixed(4), y: +it.y.toFixed(4) } : null });
        }
      }
      tick('Publicando');
      const row = { author_id: S.user.id, kind: P.kind, content: P.caption.trim(), location: P.location.trim() || null, music_title: P.music_title.trim() || null, music_url: P.music_url.trim() || null, mentions: P.mentions,
        media, aspect: P.textOnly ? null : P.aspect, media_url: media[0] ? media[0].url : null, media_type: media[0] ? media[0].type : null, bg: P.textOnly ? P.bg : null };
      const { error } = await sb.from('social_posts').insert(row);
      if (error) throw error;
      ring.style.strokeDashoffset = '0'; $('b', ov).textContent = 'Publicado!'; lab.textContent = 'Voltando ao feed'; ov.classList.add('ok');
      await new Promise((r) => setTimeout(r, 450));
      close(true); await new Promise((r) => setTimeout(r, 260));      // espera o editor fechar (histórico do navegador)
      if ((location.hash.split('/')[1] || 'feed') !== 'feed') { FEED_TAB = 'todos'; go('#/feed'); await new Promise((r) => setTimeout(r, 700)); }
      else { FEED_TAB = 'todos'; await loadPosts(); }
      const first = $('#posts .post'); if (first) { first.classList.add('fresh'); first.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      toast('Publicado! 🎉'); if (typeof playChime === 'function') playChime(true);
    } catch (e) {
      P.busy = false; ov.remove(); toast(errMsg(e) || 'Não foi possível publicar. Tente de novo.', true);
    }
  }
  render();
  try { gal.click(); } catch (_) {}                           // abre a galeria na hora (como no Instagram)
}

/* seletor de pessoas para marcar */
async function peoplePicker(selected, done) {
  let sel = [...selected];
  const s = sheet(`<h2>Marcar pessoas</h2><label class="search">${I('search')}<input id="pq" placeholder="Buscar membro" autocomplete="off"></label><div id="pl" style="margin-top:10px">${spinner()}</div><button class="btn btn-gold btn-block" id="pok" style="margin-top:14px">Concluir</button>`);
  const { data } = await sb.from('profiles').select(PROFILE_COLS).eq('status', 'active').order('full_name').limit(500);
  (data || []).forEach((p) => S.cache.set(p.id, p));
  const draw = (q = '') => { q = q.toLowerCase(); const list = (data || []).filter((p) => p.id !== S.user.id && (!q || [p.full_name, coName(p)].join(' ').toLowerCase().includes(q))).slice(0, 80);
    $('#pl', s.el).innerHTML = `<div class="list">${list.map((p) => `<button class="it" style="width:100%;text-align:left" data-p="${p.id}">${av(p, 'sm')}<span class="grow" style="min-width:0"><b class="ell" style="display:block;font-size:14px">${esc(p.full_name)}</b><small class="muted ell" style="display:block">${esc(coName(p))}</small></span><span class="ck ${sel.includes(p.id) ? 'on' : ''}">${I('check', 14)}</span></button>`).join('') || '<p class="muted small">Ninguém encontrado.</p>'}</div>`;
    $$('[data-p]', s.el).forEach((b) => (b.onclick = () => { const id = b.dataset.p; sel = sel.includes(id) ? sel.filter((x) => x !== id) : sel.length >= 20 ? sel : [...sel, id]; $('.ck', b).classList.toggle('on', sel.includes(id)); })); };
  draw(); $('#pq', s.el).oninput = debounce((e) => draw(e.target.value), 120);
  $('#pok', s.el).onclick = () => { s.close(); done(sel); };
}

/* =====================================================================
   2. STORIES
   ===================================================================== */
function openStoryCreator() {
  const T = { mode: 'start', media: null, bg: 'noir', items: [], busy: false, location: '', music_title: '', music_url: '', sel: null };
  const root = overlayRoot('sc');
  const gal = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*,video/*', hidden: true });
  const cam = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*,video/*', hidden: true }); cam.setAttribute('capture', 'environment');
  const selfie = Object.assign(document.createElement('input'), { type: 'file', accept: 'image/*,video/*', hidden: true }); selfie.setAttribute('capture', 'user');
  let closed = false;
  const close = (force) => {
    if (closed) return; if (!force && (T.media || T.items.length) && !confirm('Descartar este story?')) { history.pushState({ cdrOverlay: 'sc' }, ''); return; }
    closed = true; window.removeEventListener('popstate', onPop); if (T.media && T.media.url) URL.revokeObjectURL(T.media.url); root.classList.add('out'); setTimeout(() => root.remove(), 220);
    if (!$('.sheet, .pub:not(.out)')) document.body.style.overflow = ''; if (history.state && history.state.cdrOverlay === 'sc') history.back();
  };
  const onPop = () => { if (!closed) close(); }; window.addEventListener('popstate', onPop);
  const pick = async (inp) => { const f = inp.files[0]; inp.value = ''; if (!f) return;
    if (!/^(image|video)\//.test(f.type)) return toast('Formato não suportado', true);
    if (f.type.startsWith('video/') && f.size > MAX_VIDEO) return toast('Vídeo acima de 50 MB', true);
    try { const m = await loadMeta(f); T.media = { file: f, ...m, s: 1, x: 0, y: 0, cover: 0.1 }; T.mode = 'edit'; render(); } catch (e) { toast(e.message, true); } };
  gal.onchange = () => pick(gal); cam.onchange = () => pick(cam); selfie.onchange = () => pick(selfie);

  function render() {
    if (T.mode === 'start') {
      root.innerHTML = `<div class="sc-start"><button class="pub-ic sc-x" data-close aria-label="Fechar">${I('x', 22)}</button>
        <div class="sc-hero"><span class="pop-ic">${I('camera', 26)}</span><h2>Novo story</h2><p class="muted">Fica visível para os membros por 48 horas.</p></div>
        <div class="sc-opts"><button class="sc-op" data-cam>${I('camera', 26)}<b>Câmera</b><small>Foto ou vídeo</small></button><button class="sc-op" data-selfie>${I('user', 26)}<b>Selfie</b><small>Câmera frontal</small></button>
          <button class="sc-op" data-gal>${I('image', 26)}<b>Galeria</b><small>Fotos e vídeos</small></button><button class="sc-op" data-textmode>${I('type', 26)}<b>Texto</b><small>Fundo colorido</small></button></div></div>`;
      root.append(gal, cam, selfie);
      $('[data-close]', root).onclick = () => close(); $('[data-cam]', root).onclick = () => cam.click(); $('[data-selfie]', root).onclick = () => selfie.click(); $('[data-gal]', root).onclick = () => gal.click();
      $('[data-textmode]', root).onclick = () => { T.media = { type: 'bg' }; T.mode = 'edit'; T.items.push(newText('Toque para escrever')); render(); setTimeout(() => editText(T.items[0], true), 150); };
      return;
    }
    const m = T.media;
    root.innerHTML = `<div class="sc-ed"><div class="sc-stage ${m.type === 'bg' ? 'bg-' + T.bg : ''}">
        ${m.type === 'image' ? `<img class="sc-blur" src="${m.url}" alt=""><img class="sc-m" src="${m.url}" alt="" draggable="false" style="transform:${tf(m)}">` : m.type === 'video' ? `<video class="sc-m" src="${m.url}" playsinline autoplay loop muted style="transform:${tf(m)}"></video>` : ''}
        <div class="sc-items"></div><div class="sc-trash" aria-hidden="true">${I('trash', 22)}</div>
        <div class="sc-top"><button class="pub-ic" data-close aria-label="Fechar">${I('x', 22)}</button><span class="grow"></span>
          <button class="pub-ic" data-addtext aria-label="Adicionar texto"><b style="font-family:var(--display);font-size:17px">Aa</b></button>
          <button class="pub-ic" data-sticker aria-label="Adicionar emoji ou sticker">${I('star', 20)}</button>
          ${m.type === 'bg' ? `<button class="pub-ic" data-bgnext aria-label="Trocar fundo"><i class="bgdot bg-${T.bg}"></i></button>` : ''}
          ${m.type === 'video' ? `<button class="pub-ic" data-mute aria-label="Som">${I('volume', 20)}</button><button class="pub-ic" data-cover aria-label="Capa">${I('image', 20)}</button>` : ''}
          <button class="pub-ic" data-prev aria-label="Pré-visualizar">${I('eye', 20)}</button></div>
        <div class="sc-meta">${T.location ? `<span class="music">${I('pin', 13)}${esc(T.location)}</span>` : ''}${T.music_title ? `<span class="music">${I('music', 13)}${esc(T.music_title)}</span>` : ''}</div>
        <div class="sc-bottom"><button class="sc-share" data-share>${av(S.me, 'sm')}<span>Seu story</span>${I('next', 16)}</button></div>
      </div></div>`;
    drawItems(); bindEditor();
  }
  const newText = (t) => ({ id: uid8(), kind: 'text', text: t, color: '#ffffff', size: 0.075, x: 0.5, y: 0.42, style: 'plain', box: 'rgba(0,0,0,.6)' });
  function itemHtml(it) { return `<div class="sov ${it.kind === 'emoji' ? 'emo' : 'txt'} ${it.style === 'box' ? 'box' : ''}" data-it="${it.id}" style="left:${it.x * 100}%;top:${it.y * 100}%;--fs:${it.size * 100};color:${esc(it.color)};--bx:${esc(it.box)}">${esc(it.text)}</div>`; }
  function drawItems() { const box = $('.sc-items', root); if (box) box.innerHTML = T.items.map(itemHtml).join(''); }
  function bindEditor() {
    const m = T.media;
    const stage = $('.sc-stage', root), media = $('.sc-m', root), trash = $('.sc-trash', root);
    $('[data-close]', root).onclick = () => close();
    $('[data-addtext]', root).onclick = () => { const t = newText(''); T.items.push(t); drawItems(); editText(t, true); };
    $('[data-sticker]', root).onclick = stickerSheet;
    const bn = $('[data-bgnext]', root); if (bn) bn.onclick = () => { T.bg = BGS[(BGS.indexOf(T.bg) + 1) % BGS.length]; render(); };
    const mu = $('[data-mute]', root); if (mu) mu.onclick = () => { media.muted = !media.muted; mu.classList.toggle('on', !media.muted); };
    const cv = $('[data-cover]', root); if (cv) cv.onclick = coverSheet;
    $('[data-prev]', root).onclick = () => { root.classList.add('clean'); toast('Toque na tela para voltar a editar'); setTimeout(() => stage.addEventListener('click', () => root.classList.remove('clean'), { once: true }), 50); };
    $('[data-share]', root).onclick = publish;
    // gestos: em um elemento (texto/emoji) move/redimensiona; fora dele enquadra a foto/vídeo
    const pts = new Map(); let g = null;
    const pos = (e) => { const r = stage.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, r }; };
    stage.addEventListener('pointerdown', (e) => {
      if (e.target.closest('.sc-top,.sc-bottom,.sc-meta,button')) return;
      stage.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const el = e.target.closest('[data-it]'); const p = pos(e);
      if (pts.size === 1) g = el ? { kind: 'item', it: T.items.find((i) => i.id === el.dataset.it), el, ox: p.x, oy: p.y, moved: false } : (m.type === 'bg' ? null : { kind: 'media', ox: p.x, oy: p.y, x: m.x, y: m.y, s: m.s });
      if (g && g.kind === 'item') { g.ix = g.it.x; g.iy = g.it.y; g.is = g.it.size; root.classList.add('dragging'); }
      if (pts.size === 2 && g) { const [a, b] = [...pts.values()]; g.d0 = Math.hypot(a.x - b.x, a.y - b.y); g.s0 = g.kind === 'item' ? g.it.size : m.s; }
    });
    stage.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId) || !g) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); const p = pos(e);
      if (pts.size >= 2 && g.d0) { const [a, b] = [...pts.values()]; const k = Math.hypot(a.x - b.x, a.y - b.y) / g.d0;
        if (g.kind === 'item') { g.it.size = clamp(g.s0 * k, 0.03, g.it.kind === 'emoji' ? 0.6 : 0.25); g.el.style.setProperty('--fs', g.it.size * 100); }
        else { m.s = clamp(g.s0 * k, 0.4, 5); applyMedia(); } return; }
      if (g.kind === 'item') { g.moved = g.moved || Math.abs(p.x - g.ox) + Math.abs(p.y - g.oy) > 0.01; g.it.x = clamp(g.ix + p.x - g.ox, 0.02, 0.98); g.it.y = clamp(g.iy + p.y - g.oy, 0.02, 0.98);
        g.el.style.left = g.it.x * 100 + '%'; g.el.style.top = g.it.y * 100 + '%'; const tr = trash.getBoundingClientRect(); const over = e.clientY > tr.top - 10 && Math.abs(e.clientX - (tr.left + tr.width / 2)) < 60; trash.classList.toggle('hot', over); g.over = over; }
      else { m.x = g.x + (p.x - g.ox); m.y = g.y + (p.y - g.oy); applyMedia(); }
    });
    const end = (e) => { pts.delete(e.pointerId); if (pts.size || !g) return;
      if (g.kind === 'item') { root.classList.remove('dragging'); trash.classList.remove('hot');
        if (g.over) { T.items = T.items.filter((i) => i !== g.it); drawItems(); if (navigator.vibrate) navigator.vibrate(30); }
        else if (!g.moved && g.it.kind === 'text') editText(g.it, false); }
      g = null; };
    stage.addEventListener('pointerup', end); stage.addEventListener('pointercancel', end);
    stage.addEventListener('wheel', (e) => { if (m.type === 'bg') return; e.preventDefault(); m.s = clamp(m.s * (1 - e.deltaY * 0.0015), 0.4, 5); applyMedia(); }, { passive: false });
    function applyMedia() { const r = stage.getBoundingClientRect(); clampFrame(m, r.width, r.height); if (media) media.style.transform = tf(m); }
    if (media) requestAnimationFrame(applyMedia);
  }
  function editText(it, isNew) {
    const ed = document.createElement('div'); ed.className = 'sc-txted';
    ed.innerHTML = `<div class="ste-top"><button class="pub-ic" data-style aria-label="Estilo do texto"><b style="font-family:var(--display)">A</b></button><span class="grow"></span><button class="pub-next" data-done>Concluir</button></div>
      <div class="ste-mid"><input type="range" class="ste-size" min="0.035" max="0.2" step="0.005" value="${it.size}" aria-label="Tamanho do texto">
        <div class="ste-box"><div class="sov txt ${it.style === 'box' ? 'box' : ''} ste-t" contenteditable="true" spellcheck="false" style="--fs:${it.size * 100};color:${esc(it.color)};--bx:${esc(it.box)}">${esc(it.text === 'Toque para escrever' ? '' : it.text)}</div></div></div>
      <div class="ste-colors">${COLORS.map((c) => `<button style="background:${c}" data-c="${c}" class="${c === it.color ? 'on' : ''}" aria-label="Cor ${c}"></button>`).join('')}</div>`;
    root.appendChild(ed);
    const t = $('.ste-t', ed); setTimeout(() => { t.focus(); const r = document.createRange(); r.selectNodeContents(t); r.collapse(false); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }, 60);
    $('.ste-size', ed).oninput = (e) => { it.size = +e.target.value; t.style.setProperty('--fs', it.size * 100); };
    $$('[data-c]', ed).forEach((b) => (b.onclick = () => { if (it.style === 'box') { it.box = b.dataset.c; it.color = ['#ffffff', '#ffd93d', '#e3c47c', '#3ddc84'].includes(b.dataset.c) ? '#111111' : '#ffffff'; } else it.color = b.dataset.c;
      t.style.color = it.color; t.style.setProperty('--bx', it.box); $$('[data-c]', ed).forEach((x) => x.classList.toggle('on', x === b)); t.focus(); }));
    $('[data-style]', ed).onclick = () => { it.style = it.style === 'box' ? 'plain' : 'box'; if (it.style === 'box' && it.box === 'rgba(0,0,0,.6)') it.box = it.color === '#111111' ? '#ffffff' : 'rgba(0,0,0,.6)'; t.classList.toggle('box', it.style === 'box'); t.style.setProperty('--bx', it.box); t.focus(); };
    const done = () => { it.text = t.innerText.replace(/\n{3,}/g, '\n\n').trim().slice(0, 300); if (!it.text) T.items = T.items.filter((x) => x !== it); ed.remove(); drawItems(); };
    $('[data-done]', ed).onclick = done;
    ed.addEventListener('pointerdown', (e) => { if (e.target === ed || e.target.classList.contains('ste-mid') || e.target.classList.contains('ste-box')) done(); });
  }
  function stickerSheet() {
    const s = sheet(`<h2>Adicionar</h2><div class="emo-grid">${EMOJIS.map((e) => `<button data-e="${e}" aria-label="${e}">${e}</button>`).join('')}</div>
      <div class="stk-row"><button class="chip" data-stk="clube">CLUBE DO RØI</button><button class="chip" data-stk="net">#networking</button><button class="chip" data-stk="loc">${I('pin', 13)} Localização</button><button class="chip" data-stk="mus">${I('music', 13)} Música</button></div>
      <div id="stkf"></div>`, (el, close2) => {
      $$('[data-e]', el).forEach((b) => (b.onclick = () => { T.items.push({ id: uid8(), kind: 'emoji', text: b.dataset.e, color: '#fff', size: 0.16, x: 0.5, y: 0.5 }); close2(); drawItems(); }));
      $('[data-stk="clube"]', el).onclick = () => { T.items.push({ ...newText('CLUBE DO RØI'), style: 'box', box: '#e3c47c', color: '#111111', size: 0.055, y: 0.3 }); close2(); drawItems(); };
      $('[data-stk="net"]', el).onclick = () => { T.items.push({ ...newText('#networking'), style: 'box', box: '#ffffff', color: '#111111', size: 0.05, y: 0.62 }); close2(); drawItems(); };
      $('[data-stk="loc"]', el).onclick = () => { $('#stkf', el).innerHTML = `<div class="row" style="margin-top:12px"><input class="pin grow" id="slc" maxlength="120" placeholder="Ex.: Faria Lima, São Paulo" value="${esc(T.location)}"><button class="btn btn-gold btn-sm" id="slok">Adicionar</button></div>`;
        $('#slc', el).focus(); $('#slok', el).onclick = () => { T.location = $('#slc', el).value.trim(); close2(); render(); }; };
      $('[data-stk="mus"]', el).onclick = () => { $('#stkf', el).innerHTML = `<div class="f2" style="margin-top:12px"><input class="pin" id="smt" maxlength="120" placeholder="Nome · Artista" value="${esc(T.music_title)}"><input class="pin" id="smu" maxlength="500" placeholder="Link (opcional)" value="${esc(T.music_url)}"></div><button class="btn btn-gold btn-block" id="smok" style="margin-top:10px">Adicionar música</button>`;
        $('#smt', el).focus(); $('#smok', el).onclick = () => { T.music_title = $('#smt', el).value.trim(); T.music_url = $('#smu', el).value.trim(); close2(); render(); }; };
    });
    return s;
  }
  function coverSheet() {
    const m = T.media;
    sheet(`<h2>Capa do vídeo</h2><div class="cvbig"><video src="${m.url}" muted playsinline preload="auto" id="cvv"></video></div><input type="range" min="0" max="${Math.max(0.1, m.dur).toFixed(2)}" step="0.05" value="${m.cover}" id="cvr" aria-label="Quadro da capa" style="width:100%;margin-top:12px"><button class="btn btn-gold btn-block" id="cvok" style="margin-top:12px">Usar este quadro</button>`, (el, close2) => {
      const v = $('#cvv', el); v.addEventListener('loadeddata', () => { v.currentTime = m.cover; });
      $('#cvr', el).oninput = (e) => { v.currentTime = +e.target.value; };
      $('#cvok', el).onclick = () => { m.cover = +$('#cvr', el).value; close2(); toast('Capa escolhida'); };
    });
  }
  async function bakeImage() {                              // gera a imagem final 1080×1920, igual ao que se vê no editor
    const W = 1080, H = 1920; const c = document.createElement('canvas'); c.width = W; c.height = H; const ctx = c.getContext('2d'); const m = T.media;
    if (m.type === 'bg') { const [a, b] = BG_STOPS[T.bg]; const gr = ctx.createLinearGradient(0, 0, W, H); gr.addColorStop(0, a); gr.addColorStop(1, b); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
    else { const img = await imgEl(m.url); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      if (m.s < 1 || Math.abs(m.x) > 0.001 || Math.abs(m.y) > 0.001) { if (canvasFilterOK) { ctx.filter = 'blur(40px) brightness(.7)'; drawCover(ctx, img, img.naturalWidth, img.naturalHeight, W, H, { s: 1.15, x: 0, y: 0 }); ctx.filter = 'none'; } else { ctx.globalAlpha = 0.35; drawCover(ctx, img, img.naturalWidth, img.naturalHeight, W, H, { s: 1.1, x: 0, y: 0 }); ctx.globalAlpha = 1; } }
      drawCover(ctx, img, img.naturalWidth, img.naturalHeight, W, H, m); }
    await document.fonts.ready;
    for (const it of T.items) drawItemOnCanvas(ctx, it, W, H);
    return toBlob(c, 0.9);
  }
  function drawItemOnCanvas(ctx, it, W, H) {
    const fs = it.size * W, cx = it.x * W, cy = it.y * H;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (it.kind === 'emoji') { ctx.font = `${fs}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; ctx.fillText(it.text, cx, cy); return; }
    ctx.font = `800 ${fs}px "Inter Tight", Inter, system-ui, sans-serif`;
    const maxW = W * 0.86, lines = [];
    String(it.text).split('\n').forEach((para) => { let line = ''; para.split(' ').forEach((w) => { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }); lines.push(line); });
    const lh = fs * 1.18, tw = Math.max(...lines.map((l) => ctx.measureText(l).width)), th = lh * lines.length;
    if (it.style === 'box') { const px = fs * 0.45, py = fs * 0.18, r = fs * 0.3; ctx.fillStyle = it.box; const x0 = cx - tw / 2 - px, y0 = cy - th / 2 - py, w0 = tw + px * 2, h0 = th + py * 2;
      ctx.beginPath(); ctx.moveTo(x0 + r, y0); ctx.arcTo(x0 + w0, y0, x0 + w0, y0 + h0, r); ctx.arcTo(x0 + w0, y0 + h0, x0, y0 + h0, r); ctx.arcTo(x0, y0 + h0, x0, y0, r); ctx.arcTo(x0, y0, x0 + w0, y0, r); ctx.fill(); }
    else { ctx.shadowColor = 'rgba(0,0,0,.35)'; ctx.shadowBlur = fs * 0.25; }
    ctx.fillStyle = it.color; lines.forEach((l, i) => ctx.fillText(l, cx, cy - th / 2 + lh * (i + 0.5))); ctx.shadowBlur = 0; ctx.shadowColor = 'transparent';
  }
  async function publish() {
    if (T.busy) return; const m = T.media;
    if (m.type === 'bg' && !T.items.some((i) => i.text && i.text !== 'Toque para escrever')) return toast('Escreva algo no seu story', true);
    T.busy = true; const btn = $('[data-share]', root); btn.classList.add('busy'); btn.innerHTML = `<span class="spin" style="width:18px;height:18px;margin:0;border-width:2px"></span><span>Publicando…</span>`;
    try {
      const row = { author_id: S.user.id, location: T.location || null, music_title: T.music_title || null, music_url: T.music_url || null };
      if (m.type === 'video') {
        row.media_url = await put(m.file, 'stories', vext(m.file), m.file.type || 'video/mp4'); row.media_type = 'video';
        row.overlays = { frame: { s: +m.s.toFixed(3), x: +m.x.toFixed(4), y: +m.y.toFixed(4) }, items: T.items.filter((i) => i.text).map(({ id, ...r }) => r) };
        try { const pb = await videoFrame(m.url, m.cover || 0.1); if (pb) row.poster_url = await put(pb, 'stories', 'jpg', 'image/jpeg'); } catch (_) {}
      } else {
        T.items = T.items.filter((i) => i.text && i.text !== 'Toque para escrever');
        row.media_url = await put(await bakeImage(), 'stories', 'jpg', 'image/jpeg'); row.media_type = 'image';
      }
      const { error } = await sb.from('stories').insert(row); if (error) throw error;
      close(true); toast('Story publicado por 48 horas ✨'); await new Promise((r) => setTimeout(r, 260));
      if ((location.hash.split('/')[1] || 'feed') === 'feed') loadStories(); else route();
    } catch (e) { T.busy = false; btn.classList.remove('busy'); btn.innerHTML = `${av(S.me, 'sm')}<span>Seu story</span>${I('next', 16)}`; toast(errMsg(e) || 'Não foi possível publicar', true); }
  }
  render();
}

/* ---------- ligação com o app ---------- */
window.composer = function (existing = {}) {
  if (existing && (existing.id || existing.shared_post_id)) return legacyComposer(existing);   // editar legenda / compartilhar post
  return openPublisher();
};
window.storyComposer = openStoryCreator;
window.openPublisher = openPublisher; window.openStoryCreator = openStoryCreator;
})();
