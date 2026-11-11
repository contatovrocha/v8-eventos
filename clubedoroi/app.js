const HERO_IMG = 'img/hero.jpg';
/* ===================== Clube do RØI Network — núcleo ===================== */
const SUPABASE_URL = 'https://fazwyyjgnpcicoicwagn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LBlTDBCLDK2XcK4YVwxm0w_1tfYgTpI';
const APP_URL = location.origin + location.pathname;

const INITIAL_HASH = location.hash;
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });

const S = { user: null, me: null, role: 'member', perms: [], unread: 0, cache: new Map(), following: new Set(), chan: null };
const PERM_LABELS = { users: 'Usuários', content: 'Conteúdo', deals: 'Negócios', finance: 'Financeiro', support: 'Suporte', events: 'Eventos' };
const isSuper = () => S.role === 'super_admin';
const can = (p) => isSuper() || (S.role === 'admin' && S.perms.includes(p));
const isAdmin = () => S.role === 'super_admin' || S.role === 'admin';

/* ---------- utils ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const h = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const one = (x) => (Array.isArray(x) ? x[0] : x) || null;
const money = (n) => 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const money2 = (n) => 'R$ ' + Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const compact = (n) => { n = Number(n || 0); if (n >= 1e6) return 'R$ ' + (n / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi'; if (n >= 1e3) return 'R$ ' + (n / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil'; return money(n); };
const ago = (d) => { const s = (Date.now() - new Date(d)) / 1000; if (s < 60) return 'agora'; if (s < 3600) return Math.floor(s / 60) + ' min'; if (s < 86400) return Math.floor(s / 3600) + ' h'; if (s < 604800) return Math.floor(s / 86400) + ' d'; return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }); };
const fdate = (d, o = { day: '2-digit', month: 'short', year: 'numeric' }) => new Date(d).toLocaleDateString('pt-BR', o);
const ftime = (d) => new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const initials = (n) => (n || '?').trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join('').toUpperCase();
const safeUrl = (u) => { u = String(u || '').trim(); if (!u) return ''; if (/^(https?:|mailto:|tel:)/i.test(u)) return u; return 'https://' + u.replace(/^\/+/, ''); };
const waLink = (n) => { const d = String(n || '').replace(/\D/g, ''); if (!d) return ''; return 'https://wa.me/' + (d.length <= 11 ? '55' + d : d); };
const igLink = (v) => { v = String(v || '').trim(); if (!v) return ''; if (/^https?:/i.test(v)) return v; return 'https://instagram.com/' + v.replace(/^@/, ''); };
const debounce = (fn, ms = 300) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const errMsg = (e) => { const m = (e && (e.message || e.error_description || e.error)) || 'Algo deu errado'; if (/duplicate key|23505/.test(m)) return 'Este registro já existe.'; if (/Invalid login/.test(m)) return 'E-mail ou senha incorretos.'; if (/row-level security/.test(m)) return 'Você não tem permissão para esta ação.'; return m; };

function toast(msg, bad = false) {
  const t = document.createElement('div'); t.className = 'toast' + (bad ? ' bad' : ''); t.textContent = msg;
  document.body.appendChild(t); setTimeout(() => t.remove(), 2800);
}

/* ---------- icons ---------- */
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.8c1.9.7 3.1 2.4 3.5 5.2"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4.2 4.2-6.5 8-6.5s7 2.3 8 6.5"/>',
  bell: '<path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/>',
  heart: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>',
  msg: '<path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z"/>',
  share: '<path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v12M7.5 7.5 12 3l4.5 4.5"/>',
  repost: '<path d="M17 2l3 3-3 3"/><path d="M4 11V9a4 4 0 0 1 4-4h12M7 22l-3-3 3-3"/><path d="M20 13v2a4 4 0 0 1-4 4H4"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  next: '<path d="M9 5l7 7-7 7"/>',
  more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  edit: '<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  check: '<path d="M5 12.5 10 17 19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  deal: '<path d="M3 7h18v12H3z"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
  whatsapp: '<path d="M4 20l1.2-4A8 8 0 1 1 8.4 19z"/><path d="M9 9.5c.3 2.5 2.4 4.6 5 5l1.2-1.3-1.8-1-1 .7c-.9-.4-1.6-1.1-2-2l.7-1-1-1.8z"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".8"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5"/>',
  linkedin: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 10.5V16M8 7.8v.1M11.5 16v-5.5M11.5 13c0-1.6 1-2.5 2.3-2.5S16 11.2 16 13v3"/>',
  pin: '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  star: '<path d="m12 3.5 2.6 5.3 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8L3.5 9.6l5.9-.8z"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3.6 15H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1.3z"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  logout: '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l-5-5 5-5M5 12h11"/>',
  shield: '<path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="3"/><circle cx="9" cy="10" r="1.8"/><path d="m20.5 16-5-5-9 8.5"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M3 3l18 18M10.6 6A9 9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M6.3 7.4C3.9 9.1 2.5 12 2.5 12S6 18.5 12 18.5c1.5 0 2.8-.4 4-1"/>',
  up: '<path d="m6 15 6-6 6 6"/>', down: '<path d="m6 9 6 6 6-6"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
  target: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1"/>',
  ticket: '<path d="M3 8a2 2 0 0 0 2-2h14a2 2 0 0 0 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 0-2 2H5a2 2 0 0 0-2-2v-2a2 2 0 0 0 0-4z"/><path d="M13 6v12" stroke-dasharray="2 2"/>',
  download: '<path d="M12 4v11M7 10.5l5 5 5-5M4 20h16"/>',
};
const I = (n, w) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"${w ? ` style="width:${w}px;height:${w}px"` : ''}>${P[n] || ''}</svg>`;
const LOGO = (cls = '') => `<span class="logo ${cls}"><small>CLUBE DO</small><b>RØI</b></span>`;

function av(p, cls = '') {
  if (p && p.avatar_url) return `<img class="av ${cls}" src="${h(p.avatar_url)}" alt="" loading="lazy">`;
  return `<div class="av av-ph ${cls}">${h(initials(p && p.full_name))}</div>`;
}
const coName = (p) => { const c = one(p && p.companies); return (c && c.name) || ''; };
const spinner = () => '<div class="spin"></div>';
function readMore(p, btn) { if (!p || !btn) return; requestAnimationFrame(() => { if (p.scrollHeight > p.clientHeight + 4) { btn.hidden = false; btn.onclick = () => { const open = p.classList.toggle('clamp'); btn.textContent = open ? 'Ler mais' : 'Ler menos'; }; } }); }
const empty = (icon, msg) => `<div class="empty">${I(icon)}<div>${h(msg)}</div></div>`;

/* ---------- profiles cache ---------- */
const PROFILE_COLS = 'id,full_name,avatar_url,cover_url,role_title,city,bio,status,created_at,metrics_public,email_notifications,lgpd_consent_at,companies(id,name,logo_url,tagline,segment,description,website,instagram,whatsapp,address)';
async function loadProfiles(ids) {
  const miss = [...new Set(ids.filter((i) => i && !S.cache.has(i)))];
  if (miss.length) {
    const { data } = await sb.from('profiles').select(PROFILE_COLS).in('id', miss);
    (data || []).forEach((p) => S.cache.set(p.id, p));
  }
  return (id) => S.cache.get(id) || { id, full_name: 'Membro' };
}
async function getProfile(id, fresh = false) {
  if (!fresh && S.cache.has(id)) return S.cache.get(id);
  const { data, error } = await sb.from('profiles').select(PROFILE_COLS).eq('id', id).maybeSingle();
  if (error) throw error;
  if (data) S.cache.set(id, data);
  return data;
}

/* ---------- uploads ---------- */
async function compressImage(file, max = 1600) {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file;
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(file); });
  const sc = Math.min(1, max / Math.max(img.width, img.height));
  const c = document.createElement('canvas'); c.width = Math.round(img.width * sc); c.height = Math.round(img.height * sc);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return await new Promise((res) => c.toBlob((b) => res(b), 'image/jpeg', 0.86));
}
async function upload(file, folder, owner = S.user.id) {
  if (!file) return null;
  const isVideo = file.type.startsWith('video/');
  if (isVideo && file.size > 50 * 1024 * 1024) throw new Error('Vídeo acima de 50 MB');
  if (!isVideo && !file.type.startsWith('image/')) throw new Error('Formato não suportado');
  const blob = isVideo ? file : await compressImage(file, folder === 'cover' || folder === 'banner' ? 2000 : 1400);
  const ext = isVideo ? (file.name.split('.').pop() || 'mp4').toLowerCase() : 'jpg';
  const path = `${owner}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const { error } = await sb.storage.from('media').upload(path, blob, { contentType: isVideo ? file.type : 'image/jpeg', upsert: false });
  if (error) throw error;
  return sb.storage.from('media').getPublicUrl(path).data.publicUrl;
}
function uploadField(name, label, current, wide = false, accept = 'image/*') {
  return `<div class="f"><label>${h(label)}</label><div class="upl ${wide ? 'wide' : ''}">
    ${current ? `<img class="pv" src="${h(current)}" data-pv="${name}">` : `<div class="pv" data-pv="${name}" style="display:grid;place-items:center;color:var(--mut2)">${I('image')}</div>`}
    <label class="btn btn-ghost btn-sm" style="margin:0;text-transform:none;letter-spacing:0;color:var(--ink)">Escolher arquivo<input type="file" name="${name}" accept="${accept}" hidden></label></div></div>`;
}
function bindUploadPreviews(root) {
  $$('input[type=file]', root).forEach((inp) => inp.addEventListener('change', () => {
    const f = inp.files[0]; if (!f) return; const pv = $(`[data-pv="${inp.name}"]`, root);
    if (pv && f.type.startsWith('image/')) { const img = document.createElement('img'); img.className = 'pv'; img.dataset.pv = inp.name; img.src = URL.createObjectURL(f); pv.replaceWith(img); }
    else if (pv) pv.innerHTML = I('check');
  }));
}

/* ---------- sheet ---------- */
function sheet(html, mount) {
  const bg = document.createElement('div'); bg.className = 'sheet-bg';
  const el = document.createElement('div'); el.className = 'sheet'; el.innerHTML = `<div class="grab"></div>${html}`;
  document.body.append(bg, el); document.body.style.overflow = 'hidden';
  const close = () => { bg.remove(); el.remove(); if (!$('.sheet')) document.body.style.overflow = ''; };
  bg.onclick = close;
  let y0 = null; el.addEventListener('touchstart', (e) => { if (el.scrollTop <= 0) y0 = e.touches[0].clientY; }, { passive: true });
  el.addEventListener('touchend', (e) => { if (y0 !== null && e.changedTouches[0].clientY - y0 > 90) close(); y0 = null; });
  $$('[data-close]', el).forEach((b) => (b.onclick = close));
  mount && mount(el, close);
  return { el, close };
}
function confirmSheet(title, text, okLabel = 'Confirmar', danger = false) {
  return new Promise((res) => {
    sheet(`<h2>${h(title)}</h2><p class="muted" style="margin-bottom:18px">${h(text)}</p>
      <div class="f2"><button class="btn btn-ghost" data-no>Voltar</button><button class="btn ${danger ? 'btn-bad' : 'btn-gold'}" data-yes>${h(okLabel)}</button></div>`,
      (el, close) => { $('[data-no]', el).onclick = () => { close(); res(false); }; $('[data-yes]', el).onclick = () => { close(); res(true); }; });
  });
}

/* ---------- forms ---------- */
function field(name, label, val = '', type = 'text', extra = '') {
  if (type === 'textarea') return `<div class="f"><label>${h(label)}</label><textarea name="${name}" ${extra}>${h(val)}</textarea><div class="err"></div></div>`;
  return `<div class="f"><label>${h(label)}</label><input name="${name}" type="${type}" value="${h(val)}" ${extra}><div class="err"></div></div>`;
}
function selectField(name, label, opts, val = '') {
  return `<div class="f"><label>${h(label)}</label><select name="${name}">${opts.map(([v, t]) => `<option value="${h(v)}" ${String(v) === String(val) ? 'selected' : ''}>${h(t)}</option>`).join('')}</select><div class="err"></div></div>`;
}
function formData(form) { const o = {}; new FormData(form).forEach((v, k) => { if (!(v instanceof File)) o[k] = typeof v === 'string' ? v.trim() : v; }); return o; }
function validate(form, rules) {
  let ok = true, first = null;
  $$('.f', form).forEach((f) => f.classList.remove('bad'));
  for (const [name, fn] of Object.entries(rules)) {
    const el = form.elements[name]; if (!el) continue;
    const msg = fn(el.value.trim(), el);
    if (msg) { ok = false; const f = el.closest('.f'); f.classList.add('bad'); $('.err', f).textContent = msg; first = first || el; }
  }
  if (first) first.focus();
  return ok;
}
const req = (m = 'Campo obrigatório') => (v) => (v ? '' : m);
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
async function withBtn(btn, fn) {
  const t = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="spin" style="width:16px;height:16px;margin:0;border-width:2px"></span>';
  try { return await fn(); } catch (e) { toast(errMsg(e), true); } finally { btn.disabled = false; btn.innerHTML = t; }
}
async function fn(name, body) {
  const { data, error } = await sb.functions.invoke(name, { body });
  if (error) { let m = error.message; try { const j = await error.context.json(); m = j.error || m; } catch (_) {} throw new Error(m); }
  if (data && data.error) throw new Error(data.error);
  return data;
}

/* ===================== Shell, autenticação e rotas ===================== */
const root = document.getElementById('app');

function shell(title, body, opts = {}) {
  const r = location.hash.split('/')[1] || 'feed';
  const tab = (key, ic, label, keys = [key]) => `<a href="#/${key}" class="${keys.includes(r) ? 'on' : ''}">${I(ic)}<span>${label}</span></a>`;
  root.innerHTML = `
    ${opts.noTop ? '' : `<header class="topbar">${opts.back ? `<button class="icon-btn" onclick="history.length>1?history.back():go('#/feed')">${I('back')}</button>` : LOGO()}
      ${title ? `<div class="t grow ell" style="${opts.back ? '' : 'display:none'}">${h(title)}</div>` : '<div class="grow"></div>'}
      ${opts.right || ''}
      <a class="icon-btn" href="#/notificacoes" aria-label="Notificações">${I('bell')}${S.unread ? `<span class="dot">${S.unread > 9 ? '9+' : S.unread}</span>` : ''}</a>
    </header>`}
    <main class="page" id="view">${body}</main>
    <nav class="nav">
      ${tab('feed', 'home', 'Início', ['feed', 'post'])}
      ${tab('membros', 'users', 'Membros', ['membros'])}
      <a class="plus" href="#/novo" aria-label="Publicar">${I('plus')}</a>
      ${tab('eventos', 'cal', 'Eventos', ['eventos', 'evento', 'meus-eventos'])}
      ${tab('eu', 'user', 'Perfil', ['eu', 'u', 'negocios', 'oportunidades', 'rede', 'config', 'admin'])}
    </nav>`;
  window.scrollTo(0, 0);
  return $('#view');
}
const go = (hash) => { if (location.hash === hash) route(); else location.hash = hash; };

/* ---------- boot ---------- */
async function boot() {
  root.innerHTML = `<div class="auth" style="justify-content:center;align-items:center">${LOGO('lg')}${spinner()}</div>`;
  const inviteFlow = /type=(invite|signup|recovery)/.test(INITIAL_HASH);
  sb.auth.onAuthStateChange((ev, session) => {
    if (ev === 'PASSWORD_RECOVERY') return setPasswordScreen('Crie sua nova senha');
    if (ev === 'SIGNED_OUT') { S.user = null; S.me = null; authScreen(); }
  });
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return authScreen();
  S.user = session.user;
  if (inviteFlow && /type=(invite|recovery)/.test(INITIAL_HASH)) return setPasswordScreen(/invite/.test(INITIAL_HASH) ? 'Bem-vindo ao Clube. Crie sua senha' : 'Crie sua nova senha');
  await enter();
}

async function enter() {
  const uid = S.user.id;
  const [{ data: me, error }, { data: role }] = await Promise.all([
    sb.from('profiles').select(PROFILE_COLS).eq('id', uid).maybeSingle(),
    sb.from('user_roles').select('role,permissions').eq('user_id', uid).maybeSingle(),
  ]);
  if (error || !me) { toast('Não foi possível carregar sua conta', true); await sb.auth.signOut(); return; }
  S.me = me; S.cache.set(uid, me); S.role = (role && role.role) || 'member'; S.perms = (role && role.permissions) || [];
  if (me.status === 'pending') return statusScreen('Cadastro em análise', 'Sua conta ainda não foi liberada pela administração do Clube. Você será avisado por e-mail.');
  if (me.status === 'suspended') return statusScreen('Acesso suspenso', 'Seu acesso está temporariamente suspenso. Fale com a administração do Clube do RØI.');
  if (!me.lgpd_consent_at) return consentScreen();
  const { data: fl } = await sb.from('follows').select('following_id').eq('follower_id', uid);
  S.following = new Set((fl || []).map((x) => x.following_id));
  refreshUnread(); listenNotifications();
  if (!location.hash || location.hash.includes('access_token') || location.hash === '#') history.replaceState(null, '', '#/feed');
  window.onhashchange = route; route();
}

async function refreshUnread() {
  const { count } = await sb.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', S.user.id).is('read_at', null);
  S.unread = count || 0;
  const b = $('.topbar a[href="#/notificacoes"]');
  if (b) b.innerHTML = I('bell') + (S.unread ? `<span class="dot">${S.unread > 9 ? '9+' : S.unread}</span>` : '');
}
function listenNotifications() {
  if (S.chan) sb.removeChannel(S.chan);
  S.chan = sb.channel('notif-' + S.user.id)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${S.user.id}` }, (p) => { toast(p.new.title); refreshUnread(); })
    .subscribe();
  setInterval(refreshUnread, 60000);
}

function authScreen() {
  window.onhashchange = null;
  root.innerHTML = `<div class="auth"><div class="hero"><img src="${HERO_IMG}" alt=""></div>
    ${LOGO('lg')}<h1>Network</h1><p class="muted" style="margin-bottom:24px;max-width:340px">A rede privada dos membros do Clube do RØI.</p>
    <div id="authBox">${spinner()}</div></div>`;
  sb.rpc('platform_has_admin').then(({ data }) => (data === false ? bootstrapForm() : loginForm()));
}
function loginForm() {
  $('#authBox').innerHTML = `<form id="lf" novalidate>${field('email', 'E-mail', '', 'email', 'autocomplete="email" inputmode="email"')}${field('password', 'Senha', '', 'password', 'autocomplete="current-password"')}
    <button class="btn btn-gold btn-block" style="margin-top:6px">Entrar</button>
    <button type="button" class="btn btn-block" id="forgot" style="margin-top:8px;color:var(--mut)">Esqueci minha senha</button>
    <p class="muted small" style="text-align:center;margin-top:12px">Acesso exclusivo para membros convidados.</p></form>`;
  const f = $('#lf');
  f.onsubmit = (e) => { e.preventDefault(); if (!validate(f, { email: (v) => (isEmail(v) ? '' : 'E-mail inválido'), password: req('Informe a senha') })) return;
    withBtn($('button', f), async () => { const { data, error } = await sb.auth.signInWithPassword({ email: f.email.value.trim(), password: f.password.value }); if (error) throw error; S.user = data.user; await enter(); }); };
  $('#forgot').onclick = () => sheet(`<h2>Recuperar acesso</h2><form>${field('email', 'Seu e-mail', f.email.value, 'email')}<button class="btn btn-gold btn-block">Enviar link</button></form>`, (el, close) => {
    const ff = $('form', el); ff.onsubmit = (e) => { e.preventDefault(); if (!validate(ff, { email: (v) => (isEmail(v) ? '' : 'E-mail inválido') })) return;
      withBtn($('button', ff), async () => { const { error } = await sb.auth.resetPasswordForEmail(ff.email.value.trim(), { redirectTo: APP_URL }); if (error) throw error; close(); toast('Se o e-mail existir, você receberá o link.'); }); };
  });
}
function bootstrapForm() {
  $('#authBox').innerHTML = `<div class="card" style="margin-bottom:14px"><b class="gold">Configuração inicial</b><p class="muted small">Nenhum administrador existe ainda. Esta conta será o Super Admin da plataforma.</p></div>
    <form id="bf" novalidate>${field('full_name', 'Nome completo')}${field('email', 'E-mail', '', 'email')}${field('password', 'Senha (mín. 8)', '', 'password', 'autocomplete="new-password"')}
    <label class="check"><input type="checkbox" name="lgpd"> Concordo com o tratamento dos meus dados (LGPD).</label>
    <button class="btn btn-gold btn-block" style="margin-top:8px">Criar Super Admin</button></form>`;
  const f = $('#bf');
  f.onsubmit = (e) => { e.preventDefault();
    if (!validate(f, { full_name: (v) => (v.length >= 3 ? '' : 'Informe o nome'), email: (v) => (isEmail(v) ? '' : 'E-mail inválido'), password: (v) => (v.length >= 8 ? '' : 'Mínimo 8 caracteres') })) return;
    if (!f.lgpd.checked) return toast('Aceite o termo LGPD', true);
    withBtn($('button', f), async () => {
      const { data, error } = await sb.auth.signUp({ email: f.email.value.trim(), password: f.password.value, options: { data: { full_name: f.full_name.value.trim() }, emailRedirectTo: APP_URL } });
      if (error) throw error;
      if (data.session) { S.user = data.user; await enter(); } else { $('#authBox').innerHTML = `<div class="card"><b class="gold">Confirme seu e-mail</b><p class="muted small">Enviamos um link para ${h(f.email.value)}. Depois de confirmar, volte e entre.</p></div>`; setTimeout(loginForm, 8000); }
    }); };
}
function setPasswordScreen(title) {
  window.onhashchange = null;
  root.innerHTML = `<div class="auth"><div class="hero"><img src="${HERO_IMG}" alt=""></div>${LOGO('lg')}<h1>${h(title)}</h1><p class="muted" style="margin-bottom:20px">Use pelo menos 8 caracteres.</p>
    <form id="pf" novalidate>${field('p1', 'Nova senha', '', 'password', 'autocomplete="new-password"')}${field('p2', 'Confirme a senha', '', 'password', 'autocomplete="new-password"')}
    <button class="btn btn-gold btn-block">Salvar e entrar</button></form></div>`;
  const f = $('#pf');
  f.onsubmit = (e) => { e.preventDefault(); if (!validate(f, { p1: (v) => (v.length >= 8 ? '' : 'Mínimo 8 caracteres'), p2: (v) => (v === f.p1.value ? '' : 'As senhas não conferem') })) return;
    withBtn($('button', f), async () => { const { data, error } = await sb.auth.updateUser({ password: f.p1.value }); if (error) throw error; S.user = data.user; history.replaceState(null, '', '#/feed'); toast('Senha definida'); await enter(); }); };
}
function statusScreen(t, m) {
  root.innerHTML = `<div class="auth" style="justify-content:center"><div class="hero"><img src="${HERO_IMG}" alt=""></div>${LOGO('lg')}<h1>${h(t)}</h1><p class="muted" style="margin-bottom:24px">${h(m)}</p><button class="btn btn-ghost btn-block" id="so">Sair</button></div>`;
  $('#so').onclick = () => sb.auth.signOut();
}
function consentScreen() {
  root.innerHTML = `<div class="auth" style="justify-content:center">${LOGO('lg')}<h1>Seus dados, suas regras</h1>
    <p class="muted" style="margin-bottom:18px">Usamos seus dados apenas para operar a rede do Clube: perfil, conexões, negócios e eventos. Você decide o que fica visível e pode exportar seus dados a qualquer momento em Configurações.</p>
    <label class="check"><input type="checkbox" id="ok"> Li e concordo com o tratamento dos meus dados conforme a LGPD.</label>
    <button class="btn btn-gold btn-block" id="go" style="margin-top:14px">Continuar</button><button class="btn btn-block" id="so" style="margin-top:8px;color:var(--mut)">Sair</button></div>`;
  $('#go').onclick = () => { if (!$('#ok').checked) return toast('Marque a concordância para continuar', true);
    withBtn($('#go'), async () => { const { error } = await sb.from('profiles').update({ lgpd_consent_at: new Date().toISOString() }).eq('id', S.user.id); if (error) throw error; await enter(); }); };
  $('#so').onclick = () => sb.auth.signOut();
}

/* ---------- router ---------- */
const ROUTES = {
  feed: () => viewFeed(), post: (id) => viewPost(id), novo: () => { history.replaceState(null, '', '#/feed'); viewFeed().then(() => composer()); },
  membros: () => viewMembers(), u: (id) => viewProfile(id), eu: () => viewMe(),
  negocios: () => viewDeals(), oportunidades: () => viewIntents(), rede: (t) => viewNetwork(t), notificacoes: () => viewNotifications(),
  config: () => viewSettings(), eventos: () => viewEvents(), evento: (id) => viewEvent(id), 'meus-eventos': () => viewMyEvents(), admin: (t) => viewAdmin(t),
};
async function route() {
  if (!S.me) return;
  const [, name = 'feed', arg] = location.hash.split('/');
  const fnr = ROUTES[name] || ROUTES.feed;
  if (name === 'admin' && !isAdmin()) return go('#/feed');
  try { await fnr(arg); } catch (e) { console.error(e); const v = $('#view'); if (v) v.innerHTML = `<div class="empty">${I('x')}<div>${h(errMsg(e))}</div><button class="btn btn-ghost btn-sm" style="margin-top:12px" onclick="route()">Tentar novamente</button></div>`; }
}

/* ===================== FEED ===================== */
let FEED_TAB = 'todos';
async function viewFeed() {
  const hr = new Date().getHours();
  const v = shell('', `<p class="eyebrow" style="margin-top:4px">${hr < 12 ? 'Bom dia' : hr < 18 ? 'Boa tarde' : 'Boa noite'}</p><h1 class="hd lg" style="margin:6px 0 16px">${h((S.me.full_name || '').split(' ')[0] || 'Network')}</h1>
    <div id="banners"></div><div class="stories" id="stories"></div>
    <button class="composer-btn" onclick="composer()">${av(S.me, 'sm')}<span class="grow">Compartilhe uma conquista, projeto ou oportunidade</span>${I('image', 20)}</button>
    <div class="seg" style="margin-top:16px"><button data-t="todos" class="${FEED_TAB === 'todos' ? 'on' : ''}">Para você</button><button data-t="seguindo" class="${FEED_TAB === 'seguindo' ? 'on' : ''}">Seguindo</button></div>
    <div id="posts">${spinner()}</div>`);
  $$('.seg button', v).forEach((b) => (b.onclick = () => { FEED_TAB = b.dataset.t; $$('.seg button', v).forEach((x) => x.classList.toggle('on', x === b)); loadPosts(); }));
  loadBanners(); loadStories(); await loadPosts();
}
async function loadBanners() {
  const { data } = await sb.from('banners').select('*').eq('active', true).order('featured', { ascending: false }).order('position');
  const box = $('#banners'); if (!box) return;
  if (!data || !data.length) return (box.innerHTML = '');
  const get = await loadProfiles(data.map((b) => b.profile_id));
  box.innerHTML = `<div class="carousel"><div class="track">${data.map((b) => { const p = get(b.profile_id); const c = one(p.companies) || {};
    return `<a class="slide" href="${b.profile_id ? '#/u/' + b.profile_id : '#/feed'}">${b.image_url || p.cover_url ? `<img class="bg" src="${h(b.image_url || p.cover_url)}" alt="">` : ''}
      ${c.logo_url ? `<img class="lg" src="${h(c.logo_url)}" alt="">` : ''}
      <div class="cap"><span class="badge gold">${h(c.name || 'Membro')}</span><h4 style="margin-top:8px">${h(b.title || c.name || p.full_name)}</h4><div class="small muted">${h(b.tagline || c.tagline || p.full_name)}</div></div></a>`; }).join('')}</div>
    <div class="dots">${data.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div></div>`;
  autoCarousel($('.track', box), $$('.dots i', box));
}
function autoCarousel(track, dots) {
  if (!track) return; let i = 0, paused = false; const n = track.children.length;
  const sync = () => { i = Math.round(track.scrollLeft / (track.children[0].offsetWidth + 12)); dots.forEach((d, k) => d.classList.toggle('on', k === i)); };
  track.addEventListener('scroll', debounce(sync, 60), { passive: true });
  track.addEventListener('touchstart', () => (paused = true), { passive: true });
  track.addEventListener('touchend', () => setTimeout(() => (paused = false), 4000), { passive: true });
  dots.forEach((d, k) => (d.onclick = () => track.scrollTo({ left: k * (track.children[0].offsetWidth + 12), behavior: 'smooth' })));
  if (n < 2) return;
  const t = setInterval(() => { if (!document.body.contains(track)) return clearInterval(t); if (paused) return; i = (i + 1) % n; track.scrollTo({ left: i * (track.children[0].offsetWidth + 12), behavior: 'smooth' }); }, 5000);
}
async function loadStories() {
  const { data } = await sb.from('profiles').select(PROFILE_COLS).eq('status', 'active').order('created_at', { ascending: false }).limit(30);
  (data || []).forEach((p) => S.cache.set(p.id, p));
  const box = $('#stories'); if (!box) return;
  box.innerHTML = (data || []).filter((p) => p.id !== S.user.id).map((p) => `<a class="story" href="#/u/${p.id}"><div class="ring">${av(p)}</div><b class="ell">${h((p.full_name || '').split(' ')[0])}</b><span class="ell">${h(coName(p))}</span></a>`).join('');
}
async function loadPosts() {
  const box = $('#posts'); box.innerHTML = spinner();
  let q = sb.from('social_posts').select('*').order('created_at', { ascending: false }).limit(40);
  if (FEED_TAB === 'seguindo') q = q.in('author_id', [...S.following, S.user.id]);
  const { data, error } = await q; if (error) throw error;
  if (!data.length) return (box.innerHTML = empty('spark', FEED_TAB === 'seguindo' ? 'Siga membros para ver as publicações deles aqui.' : 'Seja o primeiro a publicar.'));
  box.innerHTML = await renderPosts(data);
  bindPosts(box);
}
async function hydratePosts(posts) {
  const ids = posts.map((p) => p.id);
  const sharedIds = posts.map((p) => p.shared_post_id).filter(Boolean);
  const [likes, comments, shared] = await Promise.all([
    sb.from('post_likes').select('post_id,user_id').in('post_id', ids),
    sb.from('post_comments').select('post_id').in('post_id', ids),
    sharedIds.length ? sb.from('social_posts').select('*').in('id', sharedIds) : { data: [] },
  ]);
  const get = await loadProfiles([...posts.map((p) => p.author_id), ...(shared.data || []).map((p) => p.author_id)]);
  const sh = new Map((shared.data || []).map((p) => [p.id, p]));
  return posts.map((p) => ({ ...p, author: get(p.author_id), likes: (likes.data || []).filter((l) => l.post_id === p.id),
    ncom: (comments.data || []).filter((c) => c.post_id === p.id).length, shared: p.shared_post_id ? sh.get(p.shared_post_id) : null, sharedAuthor: p.shared_post_id && sh.get(p.shared_post_id) ? get(sh.get(p.shared_post_id).author_id) : null }));
}
const KIND = { post: '', conquista: 'Conquista', novidade: 'Novidade', projeto: 'Projeto', case: 'Case', oportunidade: 'Oportunidade', evento: 'Evento' };
function mediaHtml(p) { if (!p.media_url) return ''; return `<div class="media">${p.media_type === 'video' ? `<video src="${h(p.media_url)}" controls playsinline preload="metadata"></video>` : `<img src="${h(p.media_url)}" loading="lazy" alt="">`}</div>`; }
async function renderPosts(list) {
  const posts = await hydratePosts(list);
  return posts.map((p) => { const liked = p.likes.some((l) => l.user_id === S.user.id); const mine = p.author_id === S.user.id;
    return `<article class="card post" data-id="${p.id}">
      <div class="head"><a href="#/u/${p.author_id}">${av(p.author)}</a><a class="grow" href="#/u/${p.author_id}"><b class="ell" style="display:block">${h(p.author.full_name)}</b><span class="small muted ell" style="display:block">${h(coName(p.author))} · ${ago(p.created_at)}${p.updated_at > p.created_at && new Date(p.updated_at) - new Date(p.created_at) > 60000 ? ' · editado' : ''}</span></a>
        ${KIND[p.kind] ? `<span class="badge gold">${KIND[p.kind]}</span>` : ''}${mine || can('content') ? `<button class="icon-btn" style="width:34px;height:34px" data-more>${I('more')}</button>` : ''}</div>
      ${p.hidden ? '<div class="badge bad" style="margin-top:8px">Oculto pela moderação</div>' : ''}
      ${p.content ? `<div class="body">${h(p.content)}</div>` : ''}${mediaHtml(p)}
      ${p.shared ? `<a class="shared" href="#/post/${p.shared.id}" style="display:block"><div class="row">${av(p.sharedAuthor, 'sm')}<b class="small">${h(p.sharedAuthor.full_name)}</b></div>${p.shared.content ? `<div class="body small">${h(p.shared.content.slice(0, 280))}</div>` : ''}${mediaHtml(p.shared)}</a>` : (p.shared_post_id ? '<div class="shared small muted">Publicação original removida</div>' : '')}
      <div class="acts"><button data-like class="${liked ? 'on' : ''}">${I('heart')}<span>${p.likes.length || ''}</span></button>
        <button data-com>${I('msg')}<span>${p.ncom || ''}</span></button><button data-share>${I('repost')}</button></div></article>`; }).join('');
}
function bindPosts(box) {
  $$('.post', box).forEach((el) => {
    const id = el.dataset.id;
    $('[data-like]', el).onclick = async (e) => { const b = e.currentTarget; const on = b.classList.toggle('on'); const sp = $('span', b); sp.textContent = Math.max(0, (+sp.textContent || 0) + (on ? 1 : -1)) || '';
      const { error } = on ? await sb.from('post_likes').insert({ post_id: id, user_id: S.user.id }) : await sb.from('post_likes').delete().match({ post_id: id, user_id: S.user.id }); if (error && !/duplicate/.test(error.message)) toast(errMsg(error), true); };
    $('[data-com]', el).onclick = () => commentsSheet(id, el);
    $('[data-share]', el).onclick = () => composer({ shared_post_id: id });
    const m = $('[data-more]', el); if (m) m.onclick = () => postMenu(id, el);
  });
}
async function postMenu(id, el) {
  const { data: p } = await sb.from('social_posts').select('*').eq('id', id).single(); const mine = p.author_id === S.user.id;
  sheet(`<h2>Publicação</h2><div class="menu">
    ${mine ? `<button class="it" data-a="edit">${I('edit')}<span class="grow">Editar</span></button>` : ''}
    ${can('content') && !mine ? `<button class="it" data-a="hide">${I(p.hidden ? 'eye' : 'eyeoff')}<span class="grow">${p.hidden ? 'Reexibir' : 'Ocultar (moderação)'}</span></button>` : ''}
    <button class="it" data-a="del">${I('trash')}<span class="grow" style="color:var(--bad)">Excluir</span></button></div>`, (s, close) => {
    $$('[data-a]', s).forEach((b) => (b.onclick = async () => { close();
      if (b.dataset.a === 'edit') return composer(p);
      if (b.dataset.a === 'hide') { const { error } = await sb.from('social_posts').update({ hidden: !p.hidden }).eq('id', id); if (error) return toast(errMsg(error), true); await sb.rpc('log_admin', { p_action: p.hidden ? 'post_unhidden' : 'post_hidden', p_type: 'post', p_id: id }); toast('Atualizado'); return route(); }
      if (await confirmSheet('Excluir publicação?', 'Esta ação não pode ser desfeita.', 'Excluir', true)) { const { error } = await sb.from('social_posts').delete().eq('id', id); if (error) return toast(errMsg(error), true); if (!mine) await sb.rpc('log_admin', { p_action: 'post_deleted', p_type: 'post', p_id: id }); el.remove(); toast('Publicação excluída'); }
    }));
  });
}
function composer(existing = {}) {
  const editing = !!existing.id;
  sheet(`<h2>${editing ? 'Editar publicação' : existing.shared_post_id ? 'Compartilhar' : 'Nova publicação'}</h2><form novalidate>
    ${selectField('kind', 'Tipo', Object.entries({ post: 'Publicação', conquista: 'Conquista', novidade: 'Novidade', projeto: 'Projeto', case: 'Case', oportunidade: 'Oportunidade comercial', evento: 'Evento' }), existing.kind || 'post')}
    ${field('content', 'Texto', existing.content || '', 'textarea', 'maxlength="3000" placeholder="O que você quer compartilhar?"')}
    ${existing.shared_post_id ? '' : uploadField('media', 'Foto ou vídeo', existing.media_type === 'image' ? existing.media_url : '', true, 'image/*,video/*')}
    <button class="btn btn-gold btn-block">${editing ? 'Salvar' : 'Publicar'}</button></form>`, (el, close) => {
    bindUploadPreviews(el); const f = $('form', el);
    f.onsubmit = (e) => { e.preventDefault(); const file = f.media && f.media.files[0];
      if (!f.content.value.trim() && !file && !existing.media_url && !existing.shared_post_id) return validate(f, { content: req('Escreva algo ou envie uma mídia') });
      withBtn($('button.btn-gold', f), async () => {
        const row = { kind: f.kind.value, content: f.content.value.trim() };
        if (file) { row.media_url = await upload(file, 'posts'); row.media_type = file.type.startsWith('video/') ? 'video' : 'image'; }
        const { error } = editing ? await sb.from('social_posts').update(row).eq('id', existing.id) : await sb.from('social_posts').insert({ ...row, author_id: S.user.id, shared_post_id: existing.shared_post_id || null });
        if (error) throw error; close(); toast(editing ? 'Publicação atualizada' : 'Publicado'); if ((location.hash.split('/')[1] || 'feed') === 'feed') loadPosts(); else route();
      }); };
  });
}
async function commentsSheet(postId, postEl) {
  const s = sheet(`<h2>Comentários</h2><div id="cl">${spinner()}</div><form class="row" style="margin-top:12px;position:sticky;bottom:0;background:var(--bg2);padding-top:8px"><div class="f grow" style="margin:0"><input name="c" placeholder="Escreva um comentário" maxlength="1000"></div><button class="icon-btn" style="background:var(--gold-lam);color:#1e1406">${I('check')}</button></form>`);
  const load = async () => { const { data } = await sb.from('post_comments').select('*').eq('post_id', postId).order('created_at');
    const get = await loadProfiles((data || []).map((c) => c.author_id));
    $('#cl', s.el).innerHTML = (data || []).length ? `<div class="list">${data.map((c) => `<div class="it" style="align-items:flex-start">${av(get(c.author_id), 'sm')}<div class="grow"><b class="small">${h(get(c.author_id).full_name)}</b> <span class="small muted">${ago(c.created_at)}</span><div style="white-space:pre-wrap">${h(c.content)}</div></div>${c.author_id === S.user.id || can('content') ? `<button class="icon-btn" style="width:30px;height:30px" data-del="${c.id}">${I('trash', 15)}</button>` : ''}</div>`).join('')}</div>` : '<p class="muted small">Nenhum comentário ainda.</p>';
    $$('[data-del]', s.el).forEach((b) => (b.onclick = async () => { await sb.from('post_comments').delete().eq('id', b.dataset.del); load(); }));
    if (postEl) $('[data-com] span', postEl).textContent = (data || []).length || '';
  };
  load();
  const f = $('form', s.el); f.onsubmit = async (e) => { e.preventDefault(); const c = f.c.value.trim(); if (!c) return; f.c.value = '';
    const { error } = await sb.from('post_comments').insert({ post_id: postId, author_id: S.user.id, content: c }); if (error) return toast(errMsg(error), true); load(); };
}
async function viewPost(id) {
  const v = shell('Publicação', spinner(), { back: true });
  const { data } = await sb.from('social_posts').select('*').eq('id', id).maybeSingle();
  if (!data) return (v.innerHTML = empty('x', 'Publicação não encontrada.'));
  v.innerHTML = await renderPosts([data]); bindPosts(v);
}

/* ===================== MEMBROS ===================== */
async function viewMembers() {
  const v = shell('', `<p class="eyebrow" style="margin-top:6px">A rede do clube</p><h1 class="hd xl" style="margin:6px 0 18px">Membros</h1>
    <label class="search">${I('search')}<input id="q" placeholder="Nome, empresa ou segmento" autocomplete="off"></label><div id="ml">${spinner()}</div>`);
  const { data, error } = await sb.from('profiles').select(PROFILE_COLS).eq('status', 'active').order('full_name').limit(500);
  if (error) throw error; data.forEach((p) => S.cache.set(p.id, p));
  const draw = (q = '') => { q = q.toLowerCase(); const list = data.filter((p) => { const c = one(p.companies) || {}; return !q || [p.full_name, c.name, c.segment, p.role_title, p.city].join(' ').toLowerCase().includes(q); });
    $('#ml').innerHTML = list.length ? `<div class="mgrid">${list.map((p) => { const c = one(p.companies) || {}; const img = p.avatar_url || p.cover_url; return `<a class="mcard" href="#/u/${p.id}"><div class="ph">${img ? `<img src="${h(img)}" loading="lazy" alt="">` : h(initials(p.full_name))}${c.segment ? `<span class="badge gold co ell">${h(c.segment)}</span>` : ''}</div><b class="ell">${h(p.full_name)}</b><span class="ell">${h(coName(p) || p.role_title || '')}</span></a>`; }).join('')}</div>` : empty('search', 'Nenhum membro encontrado.'); };
  draw(); $('#q').oninput = debounce((e) => draw(e.target.value), 150);
}

/* ===================== PERFIL ===================== */
const LINK_META = {
  email: ['mail', 'E-mail', (v) => 'mailto:' + v], phone: ['phone', 'Telefone', (v) => 'tel:' + v.replace(/[^\d+]/g, '')], whatsapp: ['whatsapp', 'WhatsApp', waLink],
  instagram: ['instagram', 'Instagram', igLink], site: ['globe', 'Site', safeUrl], linkedin: ['linkedin', 'LinkedIn', safeUrl], link: ['link', 'Link', safeUrl],
};

async function viewProfile(id) {
  if (!id) return go('#/eu');
  const v = shell('', spinner(), { noTop: true });
  const p = await getProfile(id, true);
  if (!p) return (v.innerHTML = empty('user', 'Membro não encontrado.'));
  const c = one(p.companies) || {}; const mine = id === S.user.id;
  const [counts, metrics, services, links, rel, posts] = await Promise.all([
    sb.rpc('social_counts', { p_user: id }), sb.rpc('member_metrics', { p_user: id }),
    sb.from('services').select('*').eq('owner_id', id).order('position').order('created_at'),
    sb.from('contact_links').select('*').eq('owner_id', id).order('position'),
    mine ? null : relationship(id),
    sb.from('social_posts').select('*').eq('author_id', id).order('created_at', { ascending: false }).limit(10),
  ]);
  const ct = counts.data || {}; const m = metrics.data || {};
  const visLinks = (links.data || []).filter((l) => l.visible || mine);
  const companyLinks = [c.website && ['site', c.website], c.instagram && ['instagram', c.instagram], c.whatsapp && ['whatsapp', c.whatsapp]].filter(Boolean);
  const site = c.website || ((links.data || []).find((l) => l.kind === 'site' && l.visible) || {}).value;

  const ambImg = p.cover_url || p.avatar_url;
  v.innerHTML = `
    ${ambImg ? `<div class="amb" style="--amb:url('${h(ambImg)}')"></div>` : ''}
    <div class="dtop"><button class="pill" onclick="history.length>1?history.back():go('#/feed')">${I('back')} Voltar</button>
      <div class="pills">${c.segment ? `<span class="pill">${h(c.segment)}</span>` : ''}${p.city ? `<span class="pill">${I('pin')}${h(p.city.split('/')[0])}</span>` : ''}
        ${mine ? `<a class="icon-btn" style="width:34px;height:34px" href="#/eu" aria-label="Meu painel">${I('gear', 16)}</a>` : ''}${can('users') && !mine ? `<button class="icon-btn" style="width:34px;height:34px" id="adm" aria-label="Administrar membro">${I('shield', 16)}</button>` : ''}</div></div>
    <div class="cover">${p.cover_url ? `<img src="${h(p.cover_url)}" alt="">` : ''}</div>
    <div class="pf-head">
      <div class="row" style="align-items:flex-end;justify-content:space-between">${p.avatar_url ? `<img class="pf-av" src="${h(p.avatar_url)}" alt="">` : `<div class="pf-av av-ph" style="display:grid;place-items:center;font-size:30px">${h(initials(p.full_name))}</div>`}
        ${c.logo_url ? `<img src="${h(c.logo_url)}" style="width:52px;height:52px;border-radius:14px;object-fit:cover;background:#fff;margin-bottom:6px" alt="">` : ''}</div>
      <div class="pf-name">${h(p.full_name)}</div>
      <div class="pf-sub">${[p.role_title, c.name].filter(Boolean).map(h).join(' · ')}</div>
      ${p.city ? `<div class="pf-sub row" style="gap:4px">${I('pin', 14)}${h(p.city)}</div>` : ''}
      ${p.bio ? `<p class="clamp muted" id="bio" style="margin-top:12px;white-space:pre-wrap;color:#d1d1d6">${h(p.bio)}</p><button class="readmore" id="bioMore" hidden>Ler mais</button>` : ''}
      <div class="stats"><button data-net="seguidores"><b>${ct.followers ?? 0}</b><span>Seguidores</span></button><button data-net="seguindo"><b>${ct.following ?? 0}</b><span>Seguindo</span></button>
        <button data-net="conexoes"><b>${ct.connections ?? 0}</b><span>Conexões</span></button>${!mine && ct.mutual ? `<div><b>${ct.mutual}</b><span>Em comum</span></div>` : ''}</div>
      ${mine ? `<div class="pf-actions"><button class="btn btn-gold" onclick="editProfile()">Editar perfil</button><a class="btn btn-ghost" href="#/eu">Meu painel</a></div>` : `
      <div class="pf-actions">
        <button class="btn ${rel.following ? 'btn-ghost' : 'btn-line'}" id="fol">${rel.following ? 'Seguindo' : 'Seguir'}</button>
        <button class="btn btn-ghost" id="con">${rel.connected ? 'Conectado' : rel.sent ? 'Solicitado' : rel.received ? 'Aceitar conexão' : 'Conectar'}</button>
        <button class="btn btn-gold full" id="int">${I('target')} Tenho interesse em fazer negócio</button>
        <button class="btn btn-ghost" id="deal">${I('deal')} Registrar negócio</button>
        ${site ? `<a class="btn btn-ghost" href="${h(safeUrl(site))}" target="_blank" rel="noopener">${I('globe')} Site</a>` : `<button class="btn btn-ghost" disabled>${I('globe')} Site</button>`}
      </div>`}
    </div>

    ${Object.keys(m).some((k) => ['deals', 'volume', 'companies'].includes(k)) ? `<div class="sec"><h3>Negócios no ecossistema</h3></div>
      <div class="kpis">${m.volume !== undefined ? `<div class="kpi big"><span>Volume movimentado</span><b>${compact(m.volume)}</b></div>
        <div class="kpi"><span>Recebido</span><b>${compact(m.received)}</b></div><div class="kpi"><span>Gerado p/ membros</span><b>${compact(m.generated)}</b></div>` : ''}
        ${m.deals !== undefined ? `<div class="kpi"><span>Negócios</span><b>${m.deals}</b></div>` : ''}${m.companies !== undefined ? `<div class="kpi"><span>Empresas</span><b>${m.companies}</b></div>` : ''}
        ${m.volume !== undefined && Number(m.referral) ? `<div class="kpi"><span>Via indicação</span><b>${compact(m.referral)}</b></div>` : ''}</div>
      ${m.history_public ? `<div id="hist"></div>` : ''}` : ''}

    ${c.name || c.description ? `<div class="sec"><h3>Empresa</h3></div><div class="card"><div class="company">${c.logo_url ? `<img class="lg" src="${h(c.logo_url)}" alt="">` : `<div class="lg av-ph" style="display:grid;place-items:center;background:var(--card2)">${h(initials(c.name))}</div>`}
      <div class="grow"><b>${h(c.name)}</b>${c.segment ? `<div class="small muted">${h(c.segment)}</div>` : ''}${c.tagline ? `<div class="small gold" style="margin-top:4px">${h(c.tagline)}</div>` : ''}</div></div>
      ${c.description ? `<p style="margin-top:12px;white-space:pre-wrap" class="small">${h(c.description)}</p>` : ''}${c.address ? `<div class="small muted row" style="gap:6px;margin-top:10px">${I('pin', 14)}${h(c.address)}</div>` : ''}
      ${companyLinks.length ? `<div class="links" style="margin-top:12px">${companyLinks.map(([k, val]) => `<a class="lnk" href="${h(LINK_META[k][2](val))}" target="_blank" rel="noopener">${I(LINK_META[k][0])}<span class="ell">${h(LINK_META[k][1])}</span></a>`).join('')}</div>` : ''}</div>` : ''}

    ${(services.data || []).length || mine ? `<div class="sec"><h3>Serviços</h3>${mine ? '<button onclick="serviceForm()">+ Adicionar</button>' : ''}</div>
      ${(services.data || []).length ? `<div class="hscroll">${services.data.map((s) => `<button class="svc" data-svc="${s.id}"><div class="im">${s.image_url ? `<img src="${h(s.image_url)}" alt="" loading="lazy">` : I('deal', 28)}</div><div class="tx"><b class="ell">${h(s.title)}</b><span>${h(s.description)}</span></div></button>`).join('')}</div>` : '<p class="muted small">Adicione os serviços que sua empresa oferece.</p>'}` : ''}

    ${visLinks.length ? `<div class="sec"><h3>Contato</h3></div><div class="links">${visLinks.map((l) => { const meta = LINK_META[l.kind]; return `<a class="lnk" href="${h(meta[2](l.value))}" target="_blank" rel="noopener" style="${l.visible ? '' : 'opacity:.5'}">${I(meta[0])}<span class="ell">${h(l.label || meta[1])}</span></a>`; }).join('')}</div>` : ''}

    <div class="sec"><h3>Publicações</h3></div><div id="pposts"></div>`;

  if ((posts.data || []).length) { const box = $('#pposts'); box.innerHTML = await renderPosts(posts.data); bindPosts(box); } else $('#pposts').innerHTML = '<p class="muted small">Nenhuma publicação ainda.</p>';
  if (m.history_public && $('#hist')) sb.rpc('member_deal_history', { p_user: id }).then(({ data }) => { if (!data || !data.length) return;
    $('#hist').innerHTML = `<div class="card" style="margin-top:8px"><div class="list">${data.slice(0, 6).map((d) => `<div class="it"><div class="grow"><b class="small ell" style="display:block">${h(d.description)}</b><span class="small muted">${d.role === 'vendeu' ? 'Vendeu para' : 'Contratou'} <a class="gold" href="#/u/${d.other_id}">${h(d.other_name)}</a> · ${fdate(d.closed_on, { month: 'short', year: 'numeric' })}</span></div><b class="gold small">${compact(d.amount)}</b></div>`).join('')}</div></div>`; });

  readMore($('#bio'), $('#bioMore'));
  $$('[data-svc]', v).forEach((b) => (b.onclick = () => serviceModal((services.data || []).find((s) => s.id === b.dataset.svc), mine)));
  $$('[data-net]', v).forEach((b) => (b.onclick = () => peopleSheet(id, b.dataset.net)));
  if (mine) return;
  $('#fol').onclick = (e) => withBtn(e.currentTarget, async () => {
    if (rel.following) { await sb.from('follows').delete().match({ follower_id: S.user.id, following_id: id }); S.following.delete(id); }
    else { const { error } = await sb.from('follows').insert({ follower_id: S.user.id, following_id: id }); if (error && !/duplicate/.test(error.message)) throw error; S.following.add(id); }
    viewProfile(id);
  });
  $('#con').onclick = (e) => withBtn(e.currentTarget, async () => {
    if (rel.connected) { if (!(await confirmSheet('Remover conexão?', `Você deixará de estar conectado a ${p.full_name}.`, 'Remover', true))) return; await sb.rpc('remove_connection', { p_other: id }); toast('Conexão removida'); }
    else if (rel.sent) { if (!(await confirmSheet('Cancelar solicitação?', 'A solicitação de conexão será retirada.', 'Cancelar solicitação', true))) return; await sb.from('connection_requests').delete().eq('id', rel.sent); }
    else if (rel.received) { const { error } = await sb.from('connection_requests').update({ status: 'accepted', responded_at: new Date().toISOString() }).eq('id', rel.received); if (error) throw error; toast('Conexão aceita'); }
    else { const { error } = await sb.from('connection_requests').insert({ from_id: S.user.id, to_id: id }); if (error) throw error; toast('Solicitação enviada'); }
    viewProfile(id);
  });
  $('#int').onclick = () => intentForm(p);
  $('#deal').onclick = () => dealForm(p);
  const adm = $('#adm'); if (adm) adm.onclick = () => adminMemberSheet(id);
}
async function relationship(id) {
  const me = S.user.id;
  const [f, c, r] = await Promise.all([
    sb.from('follows').select('follower_id').match({ follower_id: me, following_id: id }).maybeSingle(),
    sb.from('connections').select('user_a').match({ user_a: me < id ? me : id, user_b: me < id ? id : me }).maybeSingle(),
    sb.from('connection_requests').select('id,from_id').eq('status', 'pending').or(`and(from_id.eq.${me},to_id.eq.${id}),and(from_id.eq.${id},to_id.eq.${me})`),
  ]);
  const pend = r.data || [];
  return { following: !!f.data, connected: !!c.data, sent: (pend.find((x) => x.from_id === me) || {}).id, received: (pend.find((x) => x.from_id === id) || {}).id };
}
async function peopleSheet(uid, kind) {
  const s = sheet(`<h2>${{ seguidores: 'Seguidores', seguindo: 'Seguindo', conexoes: 'Conexões' }[kind]}</h2><div id="pl">${spinner()}</div>`);
  let ids = [];
  if (kind === 'seguidores') ids = ((await sb.from('follows').select('follower_id').eq('following_id', uid)).data || []).map((x) => x.follower_id);
  if (kind === 'seguindo') ids = ((await sb.from('follows').select('following_id').eq('follower_id', uid)).data || []).map((x) => x.following_id);
  if (kind === 'conexoes') ids = ((await sb.from('connections').select('*').or(`user_a.eq.${uid},user_b.eq.${uid}`)).data || []).map((x) => (x.user_a === uid ? x.user_b : x.user_a));
  const get = await loadProfiles(ids);
  $('#pl', s.el).innerHTML = ids.length ? `<div class="list">${ids.map((i) => `<a class="it" href="#/u/${i}" data-close>${av(get(i))}<div class="grow"><b class="ell" style="display:block">${h(get(i).full_name)}</b><span class="small muted ell" style="display:block">${h(coName(get(i)))}</span></div>${I('next', 18)}</a>`).join('')}</div>` : '<p class="muted">Ninguém aqui ainda.</p>';
  $$('[data-close]', s.el).forEach((a) => a.addEventListener('click', s.close));
}
function serviceModal(s, mine) {
  sheet(`${s.image_url ? `<img src="${h(s.image_url)}" style="width:100%;border-radius:16px;aspect-ratio:16/10;object-fit:cover;margin-bottom:14px" alt="">` : ''}<h2>${h(s.title)}</h2>
    ${s.description ? `<p style="white-space:pre-wrap">${h(s.description)}</p>` : ''}
    ${s.differentials ? `<div class="sec"><h3 style="font-size:18px">Diferenciais</h3></div><p class="muted" style="white-space:pre-wrap">${h(s.differentials)}</p>` : ''}
    <div style="display:grid;gap:8px;margin-top:18px">${s.link ? `<a class="btn btn-gold" href="${h(safeUrl(s.link))}" target="_blank" rel="noopener">${I('link')} Saiba mais</a>` : ''}
    ${mine ? `<div class="f2"><button class="btn btn-ghost" data-e>Editar</button><button class="btn btn-bad" data-d>Excluir</button></div>` : ''}</div>`, (el, close) => {
    if (!mine) return;
    $('[data-e]', el).onclick = () => { close(); serviceForm(s); };
    $('[data-d]', el).onclick = async () => { if (!(await confirmSheet('Excluir serviço?', s.title, 'Excluir', true))) return; const { error } = await sb.from('services').delete().eq('id', s.id); if (error) return toast(errMsg(error), true); close(); toast('Serviço excluído'); route(); };
  });
}
function serviceForm(s = {}, owner = S.user.id, after) {
  sheet(`<h2>${s.id ? 'Editar serviço' : 'Novo serviço'}</h2><form novalidate>${uploadField('img', 'Imagem de capa', s.image_url, true)}
    ${field('title', 'Nome do serviço', s.title, 'text', 'maxlength="80"')}${field('description', 'Descrição', s.description, 'textarea', 'maxlength="1500"')}
    ${field('differentials', 'Diferenciais', s.differentials, 'textarea', 'maxlength="1000"')}${field('link', 'Link externo', s.link, 'url', 'placeholder="https://"')}
    <button class="btn btn-gold btn-block">Salvar</button></form>`, (el, close) => {
    bindUploadPreviews(el); const f = $('form', el);
    f.onsubmit = (e) => { e.preventDefault(); if (!validate(f, { title: (v) => (v.length >= 2 ? '' : 'Informe o nome') })) return;
      withBtn($('button.btn-gold', f), async () => {
        const row = formData(f); delete row.img; const file = f.img.files[0]; if (file) row.image_url = await upload(file, 'services', owner);
        let error;
        if (s.id) ({ error } = await sb.from('services').update(row).eq('id', s.id));
        else { const { count } = await sb.from('services').select('id', { count: 'exact', head: true }).eq('owner_id', owner); ({ error } = await sb.from('services').insert({ ...row, owner_id: owner, position: count || 0 })); }
        if (error) throw error; close(); toast('Serviço salvo'); after ? after() : route();
      }); };
  });
}

/* ---------- interesse em negócio ---------- */
function intentForm(p) {
  const myCo = coName(S.me); const myWa = '';
  sheet(`<h2>Fazer negócio com ${h((p.full_name || '').split(' ')[0])}</h2><form novalidate>
    ${field('name', 'Seu nome', S.me.full_name)}<div class="f2">${field('company', 'Empresa', myCo)}${field('whatsapp', 'WhatsApp', myWa, 'tel', 'inputmode="tel"')}</div>
    ${field('email', 'E-mail', S.user.email, 'email')}${field('subject', 'Assunto', '', 'text', 'maxlength="120"')}
    ${selectField('opp_type', 'Tipo de oportunidade', [['parceria', 'Parceria'], ['contratar', 'Quero contratar'], ['fornecer', 'Quero fornecer'], ['indicacao', 'Indicação'], ['investimento', 'Investimento'], ['outro', 'Outro']])}
    ${field('message', 'Mensagem', '', 'textarea', 'maxlength="2000"')}<button class="btn btn-gold btn-block">Enviar interesse</button></form>`, (el, close) => {
    const f = $('form', el);
    f.onsubmit = (e) => { e.preventDefault();
      if (!validate(f, { name: req(), email: (v) => (isEmail(v) ? '' : 'E-mail inválido'), subject: req('Informe o assunto'), message: (v) => (v.length >= 5 ? '' : 'Escreva uma mensagem') })) return;
      withBtn($('button', f), async () => {
        const { data, error } = await sb.from('business_intents').insert({ ...formData(f), from_id: S.user.id, to_id: p.id }).select('id').single();
        if (error) throw error; close(); toast('Interesse enviado. O empresário foi notificado.');
        fn('notify-email', { kind: 'intent', id: data.id, app_url: APP_URL }).catch(() => {});
      }); };
  });
}

/* ---------- registrar negócio ---------- */
function dealForm(p) {
  const first = (p.full_name || '').split(' ')[0];
  sheet(`<h2>Registrar negócio</h2><p class="muted small" style="margin:-6px 0 14px">${h(first)} vai receber um pedido de confirmação. O valor só entra nos indicadores após o aceite.</p><form novalidate>
    ${selectField('side', 'Quem vendeu?', [['sold', `Eu vendi para ${first}`], ['bought', `Eu contratei ${first}`]])}
    ${field('description', 'Descrição do negócio', '', 'text', 'maxlength="500"')}${field('product', 'Serviço ou produto', '', 'text', 'maxlength="160"')}
    <div class="f2">${field('amount', 'Valor (R$)', '', 'text', 'inputmode="decimal" placeholder="0,00"')}${field('closed_on', 'Fechamento', new Date().toISOString().slice(0, 10), 'date')}</div>
    <div class="f2">${selectField('origin', 'Origem', [['direto', 'Direto'], ['indicacao', 'Indicação']])}${field('category', 'Categoria', '', 'text', 'maxlength="60" placeholder="Ex.: Consultoria"')}</div>
    ${field('notes', 'Observações (opcional)', '', 'textarea', 'maxlength="800"')}<button class="btn btn-gold btn-block">Enviar para confirmação</button></form>`, (el, close) => {
    const f = $('form', el);
    const parse = (v) => Number(String(v).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.'));
    f.onsubmit = (e) => { e.preventDefault();
      if (!validate(f, { description: (v) => (v.length >= 3 ? '' : 'Descreva o negócio'), amount: (v) => (parse(v) > 0 ? '' : 'Valor inválido'), closed_on: (v) => (v && new Date(v) <= new Date(Date.now() + 864e5) ? '' : 'Data inválida') })) return;
      withBtn($('button', f), async () => {
        const d = formData(f); const sold = d.side === 'sold';
        const row = { registered_by: S.user.id, counterparty_id: p.id, seller_id: sold ? S.user.id : p.id, buyer_id: sold ? p.id : S.user.id, description: d.description, product: d.product,
          amount: parse(d.amount), closed_on: d.closed_on, origin: d.origin, category: d.category, notes: d.notes };
        const { data, error } = await sb.from('business_deals').insert(row).select('id').single();
        if (error) throw /duplicate|23505/.test(error.message) ? new Error('Já existe um negócio igual registrado entre vocês.') : error;
        close(); toast('Negócio enviado para confirmação'); fn('notify-email', { kind: 'deal', id: data.id, app_url: APP_URL }).catch(() => {});
      }); };
  });
}

/* ---------- editar perfil ---------- */
async function editProfile(uid = S.user.id) {
  const p = await getProfile(uid, true); const c = one(p.companies) || {}; const self = uid === S.user.id;
  let priv = {}; if (!self || true) { const { data } = await sb.from('profile_private').select('email,phone').eq('user_id', uid).maybeSingle(); priv = data || {}; }
  sheet(`<h2>${self ? 'Editar perfil' : 'Editar ' + h(p.full_name)}</h2><form novalidate>
    <div class="seg"><button type="button" class="on" data-tab="p">Pessoal</button><button type="button" data-tab="c">Empresa</button></div>
    <div data-pane="p">${uploadField('avatar', 'Foto de perfil', p.avatar_url)}${uploadField('cover', 'Foto de capa', p.cover_url, true)}
      ${field('full_name', 'Nome completo', p.full_name)}<div class="f2">${field('role_title', 'Cargo / especialidade', p.role_title)}${field('city', 'Cidade', p.city)}</div>
      ${field('bio', 'Biografia', p.bio, 'textarea', 'maxlength="1500" placeholder="Quem você é, sua trajetória e como pode ajudar outros empresários"')}
      ${!self ? `<div class="f2">${field('email', 'E-mail de acesso', priv.email || '', 'email')}${field('phone', 'Telefone', priv.phone || '', 'tel')}</div>` : ''}</div>
    <div data-pane="c" class="hide">${uploadField('logo', 'Logomarca', c.logo_url)}${field('c_name', 'Nome da empresa', c.name)}
      <div class="f2">${field('c_segment', 'Segmento', c.segment)}${field('c_tagline', 'Frase de posicionamento', c.tagline, 'text', 'maxlength="120"')}</div>
      ${field('c_description', 'Descrição da empresa', c.description, 'textarea', 'maxlength="2000"')}
      <div class="f2">${field('c_website', 'Site', c.website)}${field('c_instagram', 'Instagram', c.instagram, 'text', 'placeholder="@empresa"')}</div>
      <div class="f2">${field('c_whatsapp', 'WhatsApp', c.whatsapp, 'tel')}${field('c_address', 'Endereço (opcional)', c.address)}</div></div>
    <button class="btn btn-gold btn-block">Salvar</button></form>`, (el, close) => {
    bindUploadPreviews(el); const f = $('form', el);
    $$('[data-tab]', el).forEach((b) => (b.onclick = () => { $$('[data-tab]', el).forEach((x) => x.classList.toggle('on', x === b)); $$('[data-pane]', el).forEach((pn) => pn.classList.toggle('hide', pn.dataset.pane !== b.dataset.tab)); }));
    f.onsubmit = (e) => { e.preventDefault(); if (!validate(f, { full_name: (v) => (v.length >= 3 ? '' : 'Informe o nome completo') })) return;
      withBtn($('button.btn-gold', f), async () => {
        const d = formData(f);
        const prof = { full_name: d.full_name, role_title: d.role_title, city: d.city, bio: d.bio };
        if (f.avatar.files[0]) prof.avatar_url = await upload(f.avatar.files[0], 'avatar', uid);
        if (f.cover.files[0]) prof.cover_url = await upload(f.cover.files[0], 'cover', uid);
        const co = { name: d.c_name, segment: d.c_segment, tagline: d.c_tagline, description: d.c_description, website: d.c_website, instagram: d.c_instagram, whatsapp: d.c_whatsapp, address: d.c_address };
        if (f.logo.files[0]) co.logo_url = await upload(f.logo.files[0], 'logo', uid);
        const [a, b] = await Promise.all([sb.from('profiles').update(prof).eq('id', uid), sb.from('companies').update(co).eq('owner_id', uid)]);
        if (a.error) throw a.error; if (b.error) throw b.error;
        if (!self) {
          const changes = {}; if (d.email && d.email !== priv.email) changes.email = d.email; if ((d.phone || '') !== (priv.phone || '')) changes.phone = d.phone;
          if (Object.keys(changes).length) await fn('admin-users', { action: 'update', user_id: uid, ...changes });
          else await sb.rpc('log_admin', { p_action: 'profile_edited', p_type: 'user', p_id: uid });
        }
        S.cache.delete(uid); if (self) S.me = await getProfile(uid, true);
        close(); toast('Perfil atualizado'); route();
      }); };
  });
}

/* ===================== PAINEL DO USUÁRIO ===================== */
async function viewMe() {
  const v = shell('', spinner());
  const [pend, intents, dealsP] = await Promise.all([
    sb.from('connection_requests').select('id', { count: 'exact', head: true }).eq('to_id', S.user.id).eq('status', 'pending'),
    sb.from('business_intents').select('id', { count: 'exact', head: true }).eq('to_id', S.user.id).eq('status', 'nova'),
    sb.from('business_deals').select('id', { count: 'exact', head: true }).eq('counterparty_id', S.user.id).eq('status', 'pending'),
  ]);
  const p = S.me; const it = (href, ic, label, cnt) => `<a class="it" href="${href}">${I(ic)}<span class="grow">${label}</span>${cnt ? `<span class="badge gold">${cnt}</span>` : ''}${I('next', 16)}</a>`;
  v.innerHTML = `<a class="card row" href="#/u/${S.user.id}" style="margin-top:4px">${av(p, 'lg')}<div class="grow"><b style="font-family:var(--serif);font-size:22px;font-weight:500" class="ell">${h(p.full_name)}</b><div class="small muted ell">${h(coName(p) || 'Complete seu perfil')}</div>
      ${isAdmin() ? `<span class="badge gold" style="margin-top:6px">${isSuper() ? 'Super Admin' : 'Administrador'}</span>` : ''}</div>${I('next', 18)}</a>
    <div class="menu" style="margin-top:12px">
      ${it('#/u/' + S.user.id, 'user', 'Meu perfil')}
      <button class="it" onclick="editProfile()">${I('edit')}<span class="grow">Editar perfil e empresa</span>${I('next', 16)}</button>
      <button class="it" onclick="manageServices()">${I('deal')}<span class="grow">Meus serviços</span>${I('next', 16)}</button>
      <button class="it" onclick="manageLinks()">${I('link')}<span class="grow">Central de contatos</span>${I('next', 16)}</button>
      ${it('#/negocios', 'chart', 'Negócios gerados', dealsP.count)}
      ${it('#/oportunidades', 'target', 'Minhas oportunidades', intents.count)}
      ${it('#/rede', 'users', 'Conexões e seguidores', pend.count)}
      ${it('#/meus-eventos', 'cal', 'Meus eventos')}
      ${it('#/notificacoes', 'bell', 'Notificações', S.unread)}
      ${it('#/config', 'gear', 'Configurações e segurança')}
      ${isAdmin() ? it('#/admin', 'shield', 'Painel administrativo') : ''}
      <button class="it" id="out">${I('logout')}<span class="grow" style="color:var(--bad)">Sair</span></button></div>`;
  $('#out').onclick = async () => { await sb.auth.signOut(); };
}
async function manageServices(owner = S.user.id) {
  const s = sheet(`<h2>Serviços</h2><div id="sl">${spinner()}</div><button class="btn btn-gold btn-block" id="add" style="margin-top:12px">${I('plus')} Adicionar serviço</button>`);
  const load = async () => { const { data } = await sb.from('services').select('*').eq('owner_id', owner).order('position').order('created_at');
    $('#sl', s.el).innerHTML = (data || []).length ? `<div class="list">${data.map((x, i) => `<div class="it"><div class="grow"><b class="ell" style="display:block">${h(x.title)}</b><span class="small muted ell" style="display:block">${h(x.description)}</span></div>
      <button class="icon-btn" style="width:34px;height:34px" data-up="${i}" ${i ? '' : 'disabled'}>${I('up', 16)}</button><button class="icon-btn" style="width:34px;height:34px" data-ed="${i}">${I('edit', 16)}</button><button class="icon-btn" style="width:34px;height:34px" data-rm="${x.id}">${I('trash', 16)}</button></div>`).join('')}</div>` : '<p class="muted">Nenhum serviço cadastrado.</p>';
    $$('[data-up]', s.el).forEach((b) => (b.onclick = async () => { const i = +b.dataset.up; const arr = data.slice(); [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      await Promise.all(arr.map((x, k) => sb.from('services').update({ position: k }).eq('id', x.id))); load(); }));
    $$('[data-ed]', s.el).forEach((b) => (b.onclick = () => serviceForm(data[+b.dataset.ed], owner, load)));
    $$('[data-rm]', s.el).forEach((b) => (b.onclick = async () => { if (!(await confirmSheet('Excluir serviço?', 'Ele sairá do seu perfil.', 'Excluir', true))) return; await sb.from('services').delete().eq('id', b.dataset.rm); load(); }));
  };
  $('#add', s.el).onclick = () => serviceForm({}, owner, load); load();
}
async function manageLinks(owner = S.user.id) {
  const s = sheet(`<h2>Central de contatos</h2><p class="muted small" style="margin:-6px 0 12px">Escolha o que fica visível no seu perfil.</p><div id="ll">${spinner()}</div>
    <form class="card" style="margin-top:12px" novalidate><div class="f2">${selectField('kind', 'Tipo', Object.entries(LINK_META).map(([k, v]) => [k, v[1]]))}${field('label', 'Rótulo (opcional)')}</div>${field('value', 'Endereço / número / link')}<button class="btn btn-gold btn-block">Adicionar</button></form>`);
  const load = async () => { const { data } = await sb.from('contact_links').select('*').eq('owner_id', owner).order('position').order('created_at');
    $('#ll', s.el).innerHTML = (data || []).length ? `<div class="list">${data.map((l) => `<div class="it">${I(LINK_META[l.kind][0], 20)}<div class="grow"><b class="small" style="display:block">${h(l.label || LINK_META[l.kind][1])}</b><span class="small muted ell" style="display:block">${h(l.value)}</span></div>
      <button class="icon-btn" style="width:34px;height:34px" data-vis="${l.id}" data-v="${l.visible}">${I(l.visible ? 'eye' : 'eyeoff', 16)}</button><button class="icon-btn" style="width:34px;height:34px" data-rm="${l.id}">${I('trash', 16)}</button></div>`).join('')}</div>` : '<p class="muted small">Nenhum contato.</p>';
    $$('[data-vis]', s.el).forEach((b) => (b.onclick = async () => { await sb.from('contact_links').update({ visible: b.dataset.v !== 'true' }).eq('id', b.dataset.vis); load(); }));
    $$('[data-rm]', s.el).forEach((b) => (b.onclick = async () => { await sb.from('contact_links').delete().eq('id', b.dataset.rm); load(); }));
  };
  const f = $('form', s.el); f.onsubmit = (e) => { e.preventDefault();
    if (!validate(f, { value: (v) => { if (!v) return 'Informe o contato'; if (f.kind.value === 'email' && !isEmail(v)) return 'E-mail inválido'; if (['whatsapp', 'phone'].includes(f.kind.value) && v.replace(/\D/g, '').length < 10) return 'Número inválido'; return ''; } })) return;
    withBtn($('button', f), async () => { const { error } = await sb.from('contact_links').insert({ ...formData(f), owner_id: owner }); if (error) throw error; f.reset(); load(); }); };
  load();
}

/* ---------- rede ---------- */
async function viewNetwork(tab = 'pedidos') {
  const v = shell('Conexões', `<div class="seg">${[['pedidos', 'Pedidos'], ['conexoes', 'Conexões'], ['seguidores', 'Seguidores'], ['seguindo', 'Seguindo']].map(([k, t]) => `<button data-k="${k}" class="${k === tab ? 'on' : ''}">${t}</button>`).join('')}</div><div id="nl">${spinner()}</div>`, { back: true });
  $$('[data-k]', v).forEach((b) => (b.onclick = () => history.replaceState(null, '', '#/rede/' + b.dataset.k) || viewNetwork(b.dataset.k)));
  const me = S.user.id; const box = $('#nl');
  if (tab === 'pedidos') {
    const { data } = await sb.from('connection_requests').select('*').eq('status', 'pending').or(`from_id.eq.${me},to_id.eq.${me}`).order('created_at', { ascending: false });
    const get = await loadProfiles((data || []).flatMap((r) => [r.from_id, r.to_id]));
    const rec = (data || []).filter((r) => r.to_id === me), sent = (data || []).filter((r) => r.from_id === me);
    box.innerHTML = (rec.length ? `<div class="sec"><h3>Recebidos</h3></div><div class="list">${rec.map((r) => `<div class="it"><a href="#/u/${r.from_id}">${av(get(r.from_id))}</a><a class="grow" href="#/u/${r.from_id}"><b class="ell" style="display:block">${h(get(r.from_id).full_name)}</b><span class="small muted">${h(coName(get(r.from_id)))}</span></a>
      <button class="btn btn-gold btn-sm" data-acc="${r.id}">Aceitar</button><button class="icon-btn" style="width:36px;height:36px" data-dec="${r.id}">${I('x', 16)}</button></div>`).join('')}</div>` : '')
      + (sent.length ? `<div class="sec"><h3>Enviados</h3></div><div class="list">${sent.map((r) => `<div class="it">${av(get(r.to_id))}<div class="grow"><b class="ell" style="display:block">${h(get(r.to_id).full_name)}</b><span class="small muted">Aguardando</span></div><button class="btn btn-ghost btn-sm" data-can="${r.id}">Cancelar</button></div>`).join('')}</div>` : '')
      || empty('users', 'Nenhuma solicitação pendente.');
    $$('[data-acc],[data-dec]', box).forEach((b) => (b.onclick = () => withBtn(b, async () => { const acc = !!b.dataset.acc;
      const { error } = await sb.from('connection_requests').update({ status: acc ? 'accepted' : 'declined', responded_at: new Date().toISOString() }).eq('id', b.dataset.acc || b.dataset.dec); if (error) throw error; toast(acc ? 'Conexão aceita' : 'Solicitação recusada'); viewNetwork('pedidos'); })));
    $$('[data-can]', box).forEach((b) => (b.onclick = () => withBtn(b, async () => { await sb.from('connection_requests').delete().eq('id', b.dataset.can); viewNetwork('pedidos'); })));
    return;
  }
  let ids = [];
  if (tab === 'conexoes') ids = ((await sb.from('connections').select('*').or(`user_a.eq.${me},user_b.eq.${me}`)).data || []).map((x) => (x.user_a === me ? x.user_b : x.user_a));
  if (tab === 'seguidores') ids = ((await sb.from('follows').select('follower_id').eq('following_id', me)).data || []).map((x) => x.follower_id);
  if (tab === 'seguindo') ids = ((await sb.from('follows').select('following_id').eq('follower_id', me)).data || []).map((x) => x.following_id);
  const get = await loadProfiles(ids);
  box.innerHTML = ids.length ? `<div class="list">${ids.map((i) => `<div class="it"><a href="#/u/${i}">${av(get(i))}</a><a class="grow" href="#/u/${i}"><b class="ell" style="display:block">${h(get(i).full_name)}</b><span class="small muted ell" style="display:block">${h(coName(get(i)))}</span></a>
    ${tab === 'conexoes' ? `<button class="btn btn-ghost btn-sm" data-rm="${i}">Remover</button>` : tab === 'seguindo' ? `<button class="btn btn-ghost btn-sm" data-uf="${i}">Deixar de seguir</button>` : ''}</div>`).join('')}</div>` : empty('users', 'Nada por aqui ainda.');
  $$('[data-rm]', box).forEach((b) => (b.onclick = () => withBtn(b, async () => { if (!(await confirmSheet('Remover conexão?', 'Vocês deixarão de estar conectados.', 'Remover', true))) return; await sb.rpc('remove_connection', { p_other: b.dataset.rm }); viewNetwork('conexoes'); })));
  $$('[data-uf]', box).forEach((b) => (b.onclick = () => withBtn(b, async () => { await sb.from('follows').delete().match({ follower_id: me, following_id: b.dataset.uf }); S.following.delete(b.dataset.uf); viewNetwork('seguindo'); })));
}

/* ---------- negócios ---------- */
let DEAL_F = { st: 'all', per: 'all' };
const DEAL_ST = { pending: ['warn', 'Pendente'], confirmed: ['ok', 'Confirmado'], declined: ['bad', 'Recusado'], cancelled: ['', 'Cancelado'] };
function periodStart(per) { const d = new Date(); if (per === '30') d.setDate(d.getDate() - 30); else if (per === '90') d.setDate(d.getDate() - 90); else if (per === 'ano') { d.setMonth(0, 1); } else return null; return d.toISOString().slice(0, 10); }
async function viewDeals() {
  const v = shell('Negócios gerados', spinner(), { back: true });
  const [{ data: m }, { data: deals, error }] = await Promise.all([sb.rpc('member_metrics', { p_user: S.user.id }),
    sb.from('business_deals').select('*').or(`seller_id.eq.${S.user.id},buyer_id.eq.${S.user.id}`).order('created_at', { ascending: false })]);
  if (error) throw error;
  const get = await loadProfiles(deals.flatMap((d) => [d.seller_id, d.buyer_id]));
  const draw = () => {
    const start = periodStart(DEAL_F.per);
    const list = deals.filter((d) => (DEAL_F.st === 'all' || d.status === DEAL_F.st) && (!start || d.closed_on >= start));
    $('#dl').innerHTML = list.length ? list.map((d) => { const other = d.seller_id === S.user.id ? d.buyer_id : d.seller_id; const sold = d.seller_id === S.user.id; const [cls, lbl] = DEAL_ST[d.status];
      return `<div class="card" style="margin-top:10px"><div class="row"><a href="#/u/${other}">${av(get(other), 'sm')}</a><div class="grow"><b class="ell" style="display:block">${h(d.description)}</b><span class="small muted">${sold ? 'Vendeu para' : 'Contratou'} ${h(get(other).full_name)} · ${fdate(d.closed_on)}</span></div><span class="badge ${cls}">${lbl}</span></div>
        <div class="row" style="margin-top:10px;justify-content:space-between"><b class="gold" style="font-family:var(--serif);font-size:22px">${money2(d.amount)}</b><span class="small muted">${d.origin === 'indicacao' ? 'Indicação' : 'Direto'}${d.product ? ' · ' + h(d.product) : ''}</span></div>
        ${d.status === 'pending' && d.counterparty_id === S.user.id ? `<div class="f2" style="margin-top:12px"><button class="btn btn-ghost btn-sm" data-act="decline" data-id="${d.id}">Recusar</button><button class="btn btn-gold btn-sm" data-act="confirm" data-id="${d.id}">Confirmar</button></div>` : ''}
        ${d.status === 'pending' && d.registered_by === S.user.id ? `<div class="row" style="margin-top:12px;justify-content:space-between"><span class="small muted">Aguardando a outra parte</span><button class="btn btn-ghost btn-sm" data-act="cancel" data-id="${d.id}">Cancelar</button></div>` : ''}</div>`; }).join('') : empty('chart', 'Nenhum negócio neste filtro.');
    $$('[data-act]', v).forEach((b) => (b.onclick = () => withBtn(b, async () => {
      const a = b.dataset.act; if (a !== 'confirm' && !(await confirmSheet(a === 'cancel' ? 'Cancelar registro?' : 'Recusar negócio?', 'Ele não entrará nos indicadores.', a === 'cancel' ? 'Cancelar registro' : 'Recusar', true))) return;
      const { error: e } = await sb.rpc('respond_deal', { p_deal: b.dataset.id, p_action: a, p_note: '' }); if (e) throw e;
      toast(a === 'confirm' ? 'Negócio confirmado e contabilizado' : 'Atualizado'); viewDeals(); })));
  };
  v.innerHTML = `<div class="kpis"><div class="kpi big"><span>Volume no ecossistema</span><b>${money(m.volume)}</b></div>
    <div class="kpi"><span>Receita recebida</span><b>${compact(m.received)}</b></div><div class="kpi"><span>Gerada p/ membros</span><b>${compact(m.generated)}</b></div>
    <div class="kpi"><span>Negócios</span><b>${m.deals}</b></div><div class="kpi"><span>Empresas</span><b>${m.companies}</b></div></div>
    <p class="small muted" style="margin-top:8px">Cada negócio é contado uma vez no volume. Indicações: ${compact(m.referral)}.</p>
    <div class="chips" style="margin-top:14px">${[['all', 'Todos'], ['pending', 'Pendentes'], ['confirmed', 'Confirmados'], ['declined', 'Recusados'], ['cancelled', 'Cancelados']].map(([k, t]) => `<button class="chip ${DEAL_F.st === k ? 'on' : ''}" data-st="${k}">${t}</button>`).join('')}</div>
    <div class="chips">${[['all', 'Todo período'], ['30', '30 dias'], ['90', '90 dias'], ['ano', 'Este ano']].map(([k, t]) => `<button class="chip ${DEAL_F.per === k ? 'on' : ''}" data-per="${k}">${t}</button>`).join('')}</div>
    <div id="dl"></div><p class="small muted" style="text-align:center;margin-top:18px">Para registrar, abra o perfil do empresário e toque em "Registrar negócio".</p>`;
  $$('[data-st]', v).forEach((b) => (b.onclick = () => { DEAL_F.st = b.dataset.st; $$('[data-st]', v).forEach((x) => x.classList.toggle('on', x === b)); draw(); }));
  $$('[data-per]', v).forEach((b) => (b.onclick = () => { DEAL_F.per = b.dataset.per; $$('[data-per]', v).forEach((x) => x.classList.toggle('on', x === b)); draw(); }));
  draw();
}

/* ---------- oportunidades ---------- */
let INT_TAB = 'recebidas';
async function viewIntents() {
  const v = shell('Minhas oportunidades', `<div class="seg"><button data-t="recebidas" class="${INT_TAB === 'recebidas' ? 'on' : ''}">Recebidas</button><button data-t="enviadas" class="${INT_TAB === 'enviadas' ? 'on' : ''}">Enviadas</button></div><div id="il">${spinner()}</div>`, { back: true });
  $$('[data-t]', v).forEach((b) => (b.onclick = () => { INT_TAB = b.dataset.t; viewIntents(); }));
  const col = INT_TAB === 'recebidas' ? 'to_id' : 'from_id';
  const { data, error } = await sb.from('business_intents').select('*').eq(col, S.user.id).order('created_at', { ascending: false }); if (error) throw error;
  const get = await loadProfiles(data.map((i) => (INT_TAB === 'recebidas' ? i.from_id : i.to_id)));
  const ST = { nova: ['gold', 'Nova'], andamento: ['warn', 'Em andamento'], concluida: ['ok', 'Concluída'] };
  $('#il').innerHTML = data.length ? data.map((i) => { const other = INT_TAB === 'recebidas' ? i.from_id : i.to_id; const p = get(other);
    return `<div class="card" style="margin-top:10px"><div class="row"><a href="#/u/${other}">${av(p, 'sm')}</a><div class="grow"><b class="ell" style="display:block">${h(INT_TAB === 'recebidas' ? i.name : p.full_name)}</b><span class="small muted">${h(INT_TAB === 'recebidas' ? i.company : coName(p))} · ${ago(i.created_at)}</span></div><span class="badge ${ST[i.status][0]}">${ST[i.status][1]}</span></div>
      <b style="display:block;margin-top:10px">${h(i.subject)}</b><span class="badge" style="margin-top:6px">${h(i.opp_type)}</span><p class="small" style="margin-top:8px;white-space:pre-wrap">${h(i.message)}</p>
      ${INT_TAB === 'recebidas' ? `<div class="links" style="margin-top:12px">${i.whatsapp ? `<a class="lnk" href="${h(waLink(i.whatsapp))}" target="_blank" rel="noopener">${I('whatsapp')}WhatsApp</a>` : ''}<a class="lnk" href="mailto:${h(i.email)}">${I('mail')}E-mail</a><a class="lnk" href="#/u/${i.from_id}">${I('user')}Perfil</a></div>
        <div class="chips" style="margin-top:10px">${Object.entries(ST).map(([k, [, t]]) => `<button class="chip ${i.status === k ? 'on' : ''}" data-st="${k}" data-id="${i.id}">${t}</button>`).join('')}</div>` : ''}</div>`; }).join('') : empty('target', INT_TAB === 'recebidas' ? 'Quando alguém demonstrar interesse em fazer negócio com você, aparece aqui.' : 'Você ainda não enviou interesses.');
  $$('[data-st]', v).forEach((b) => (b.onclick = async () => { const { error: e } = await sb.from('business_intents').update({ status: b.dataset.st }).eq('id', b.dataset.id); if (e) return toast(errMsg(e), true); viewIntents(); }));
}

/* ---------- notificações ---------- */
async function viewNotifications() {
  const v = shell('Notificações', spinner(), { back: true, right: `<button class="icon-btn" id="clr" title="Limpar lidas">${I('trash')}</button>` });
  const { data, error } = await sb.from('notifications').select('*').eq('user_id', S.user.id).order('created_at', { ascending: false }).limit(100); if (error) throw error;
  const get = await loadProfiles(data.map((n) => n.actor_id));
  const unread = data.filter((n) => !n.read_at); const read = data.filter((n) => n.read_at);
  const item = (n) => `<a class="it" href="${h(n.link || '#/feed')}" style="${n.read_at ? 'opacity:.65' : ''}">${n.actor_id ? av(get(n.actor_id), 'sm') : `<div class="av sm av-ph">${I('bell', 16)}</div>`}<div class="grow"><b class="small" style="display:block">${h(n.title)}</b>${n.body ? `<span class="small muted ell" style="display:block">${h(n.body)}</span>` : ''}<span class="small muted">${ago(n.created_at)}</span></div>${n.read_at ? '' : '<span style="width:8px;height:8px;border-radius:4px;background:var(--gold)"></span>'}</a>`;
  v.innerHTML = data.length ? `${unread.length ? `<div class="sec"><h3>Não lidas</h3></div><div class="list">${unread.map(item).join('')}</div>` : ''}${read.length ? `<div class="sec"><h3>Lidas</h3></div><div class="list">${read.map(item).join('')}</div>` : ''}` : empty('bell', 'Tudo em dia.');
  if (unread.length) { await sb.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', S.user.id).is('read_at', null); S.unread = 0; }
  $('#clr').onclick = async () => { await sb.from('notifications').delete().eq('user_id', S.user.id).not('read_at', 'is', null); viewNotifications(); };
}

/* ---------- configurações ---------- */
async function viewSettings() {
  const p = await getProfile(S.user.id, true); const mp = p.metrics_public || {};
  const v = shell('Configurações', `
    <div class="sec"><h3>Privacidade dos indicadores</h3></div><div class="card">
      ${[['deals', 'Quantidade de negócios'], ['volume', 'Valores (recebido, gerado, volume)'], ['companies', 'Empresas com quem negociou'], ['history', 'Histórico de negócios']].map(([k, t]) => `<label class="check"><input type="checkbox" data-mp="${k}" ${mp[k] !== false && (k !== 'history' || mp[k]) ? 'checked' : ''}> ${t}</label>`).join('')}
      <label class="check"><input type="checkbox" data-mp="interests" ${mp.interests !== false ? 'checked' : ''}> Mostrar meu nome nos eventos em que demonstro interesse</label></div>
    <div class="sec"><h3>Notificações</h3></div><div class="card"><label class="check"><input type="checkbox" id="em" ${p.email_notifications ? 'checked' : ''}> Receber e-mails de oportunidades e negócios</label></div>
    <div class="sec"><h3>Segurança</h3></div><div class="menu">
      <button class="it" id="pw">${I('lock')}<span class="grow">Alterar senha</span>${I('next', 16)}</button>
      <button class="it" id="mail">${I('mail')}<span class="grow">Alterar e-mail de acesso</span><span class="small muted ell" style="max-width:45%">${h(S.user.email)}</span></button>
      <button class="it" id="exp">${I('download')}<span class="grow">Exportar meus dados (LGPD)</span>${I('next', 16)}</button>
      <button class="it" id="out">${I('logout')}<span class="grow" style="color:var(--bad)">Sair da conta</span></button></div>`, { back: true });
  $$('[data-mp]', v).forEach((c) => (c.onchange = async () => { const nv = { ...(p.metrics_public || {}) }; $$('[data-mp]', v).forEach((x) => (nv[x.dataset.mp] = x.checked)); p.metrics_public = nv;
    const { error } = await sb.from('profiles').update({ metrics_public: nv }).eq('id', S.user.id); toast(error ? errMsg(error) : 'Preferência salva', !!error); }));
  $('#em').onchange = async (e) => { const { error } = await sb.from('profiles').update({ email_notifications: e.target.checked }).eq('id', S.user.id); toast(error ? errMsg(error) : 'Preferência salva', !!error); };
  $('#pw').onclick = () => sheet(`<h2>Alterar senha</h2><form novalidate>${field('p1', 'Nova senha', '', 'password', 'autocomplete="new-password"')}${field('p2', 'Confirme', '', 'password')}<button class="btn btn-gold btn-block">Salvar</button></form>`, (el, close) => {
    const f = $('form', el); f.onsubmit = (e) => { e.preventDefault(); if (!validate(f, { p1: (x) => (x.length >= 8 ? '' : 'Mínimo 8 caracteres'), p2: (x) => (x === f.p1.value ? '' : 'Não confere') })) return;
      withBtn($('button', f), async () => { const { error } = await sb.auth.updateUser({ password: f.p1.value }); if (error) throw error; close(); toast('Senha alterada'); }); }; });
  $('#mail').onclick = () => sheet(`<h2>Alterar e-mail</h2><p class="muted small" style="margin-bottom:12px">Enviaremos um link de confirmação para o novo endereço.</p><form novalidate>${field('email', 'Novo e-mail', '', 'email')}<button class="btn btn-gold btn-block">Enviar confirmação</button></form>`, (el, close) => {
    const f = $('form', el); f.onsubmit = (e) => { e.preventDefault(); if (!validate(f, { email: (x) => (isEmail(x) ? '' : 'E-mail inválido') })) return;
      withBtn($('button', f), async () => { const { error } = await sb.auth.updateUser({ email: f.email.value.trim() }, { emailRedirectTo: APP_URL }); if (error) throw error; close(); toast('Confirme no novo e-mail'); }); }; });
  $('#exp').onclick = (e) => withBtn(e.currentTarget, async () => {
    const me = S.user.id; const q = (t, col = 'owner_id') => sb.from(t).select('*').eq(col, me).then((r) => r.data);
    const out = { exportado_em: new Date().toISOString(), perfil: p, privado: (await sb.from('profile_private').select('*').eq('user_id', me)).data, servicos: await q('services'), contatos: await q('contact_links'),
      publicacoes: await q('social_posts', 'author_id'), comentarios: await q('post_comments', 'author_id'), seguindo: await q('follows', 'follower_id'),
      negocios: (await sb.from('business_deals').select('*').or(`seller_id.eq.${me},buyer_id.eq.${me}`)).data, oportunidades: (await sb.from('business_intents').select('*').or(`from_id.eq.${me},to_id.eq.${me}`)).data,
      eventos: await q('events', 'organizer_id'), interesses_eventos: await q('event_interests', 'user_id') };
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' })); a.download = 'meus-dados-clube-do-roi.json'; a.click();
  });
  $('#out').onclick = () => sb.auth.signOut();
}

/* ===================== EVENTOS ===================== */
let EV_F = 'proximos'; let EV_MONTH = new Date(); EV_MONTH.setDate(1); let EV_DAY = null;
async function fetchEvents() {
  const [{ data, error }, { data: counts }, { data: mine }, { data: cats }] = await Promise.all([
    sb.from('events').select('*').order('pinned', { ascending: false }).order('starts_at'),
    sb.rpc('event_interest_counts'), sb.from('event_interests').select('event_id').eq('user_id', S.user.id), sb.from('event_categories').select('*').order('name'),
  ]);
  if (error) throw error;
  const cnt = new Map((counts || []).map((c) => [c.event_id, Number(c.total)])); const my = new Set((mine || []).map((m) => m.event_id));
  const get = await loadProfiles(data.map((e) => e.organizer_id));
  return { events: data.map((e) => ({ ...e, interested: cnt.get(e.id) || 0, mine: my.has(e.id), org: get(e.organizer_id) })), cats: cats || [] };
}
const evDay = (e) => new Date(e.starts_at).toLocaleDateString('sv-SE');
function evCard(e) {
  const d = new Date(e.starts_at); const free = !Number(e.price);
  return `<a class="ev" href="#/evento/${e.id}"><div class="im">${e.cover_url ? `<img src="${h(e.cover_url)}" alt="" loading="lazy">` : ''}
    <div class="date"><b>${d.getDate()}</b><span>${d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</span></div>
    <div class="tags">${e.status === 'cancelled' ? '<span class="badge bad">Cancelado</span>' : ''}${e.status === 'draft' ? '<span class="badge">Rascunho</span>' : ''}${e.status === 'suspended' ? '<span class="badge bad">Suspenso</span>' : ''}${e.pinned ? `<span class="badge gold">${I('star', 11)}</span>` : ''}<span class="badge ${free ? 'ok' : 'gold'}">${free ? 'Gratuito' : money(e.price)}</span></div></div>
    <div class="tx"><h4>${h(e.title)}</h4><div class="meta"><span>${I('clock', 13)} ${ftime(e.starts_at)}</span><span>${e.mode === 'online' ? 'Online' : h((e.address || 'Presencial').split(',')[0])}</span><span>por ${h(e.organizer_name || e.org.full_name)}</span></div>
    <div class="ft"><span class="small muted">${e.interested} interessado${e.interested === 1 ? '' : 's'}</span>${e.status === 'published' ? `<span class="btn btn-sm ${e.mine ? 'btn-ghost' : 'btn-line'}" data-int="${e.id}" data-on="${e.mine}">${e.mine ? I('check') + ' Interesse registrado' : 'Demonstrar interesse'}</span>` : ''}</div></div></a>`;
}
async function toggleInterest(id, on) {
  if (on) { const { error } = await sb.from('event_interests').delete().match({ event_id: id, user_id: S.user.id }); if (error) throw error; toast('Interesse cancelado'); }
  else { const { error } = await sb.from('event_interests').insert({ event_id: id, user_id: S.user.id, show_public: (S.me.metrics_public || {}).interests !== false }); if (error && !/duplicate/.test(error.message)) throw error; toast('Interesse registrado. O organizador foi avisado.'); }
}
function bindInterest(box, after) {
  $$('[data-int]', box).forEach((b) => (b.onclick = (ev) => { ev.preventDefault(); ev.stopPropagation(); withBtn(b, async () => { await toggleInterest(b.dataset.int, b.dataset.on === 'true'); after(); }); }));
}
function calendar(events) {
  const y = EV_MONTH.getFullYear(), mo = EV_MONTH.getMonth(); const first = new Date(y, mo, 1); const startPad = (first.getDay() + 6) % 7; const days = new Date(y, mo + 1, 0).getDate();
  const byDay = new Map(); events.forEach((e) => { const k = evDay(e); if (!byDay.has(k)) byDay.set(k, []); byDay.get(k).push(e); });
  const today = new Date().toLocaleDateString('sv-SE'); let cells = '';
  for (let i = 0; i < startPad; i++) { const d = new Date(y, mo, i - startPad + 1); cells += `<div class="d out">${d.getDate()}</div>`; }
  for (let d = 1; d <= days; d++) { const k = new Date(y, mo, d).toLocaleDateString('sv-SE'); const evs = byDay.get(k);
    cells += evs ? `<button class="d has ${EV_DAY === k ? 'sel' : ''}" data-day="${k}">${evs[0].cover_url ? `<img src="${h(evs[0].cover_url)}" alt="">` : `<span class="ph">${d}</span>`}${evs.length > 1 ? `<span class="n">${evs.length}</span>` : ''}</button>`
      : `<div class="d ${k === today ? 'today' : ''}">${String(d).padStart(2, '0')}</div>`; }
  const tail = (7 - ((startPad + days) % 7)) % 7; for (let i = 1; i <= tail; i++) cells += `<div class="d out">${String(i).padStart(2, '0')}</div>`;
  return `<div class="cal"><div class="ch"><b>${first.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</b><div class="row" style="gap:0"><button data-m="-1">${I('back')}</button><button data-m="1">${I('next')}</button></div></div>
    <div class="grid">${['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'].map((w) => `<div class="wd">${w}</div>`).join('')}${cells}</div></div>`;
}
async function viewEvents() {
  const v = shell('', spinner());
  const { events } = await fetchEvents();
  const now = new Date();
  const visible = events.filter((e) => e.status === 'published' || e.status === 'cancelled' || e.organizer_id === S.user.id || can('events'));
  const featured = visible.filter((e) => (e.featured || e.pinned) && e.status === 'published' && new Date(e.starts_at) >= now);
  const filters = { todos: 'Todos', proximos: 'Próximos', presencial: 'Presenciais', online: 'Online', gratis: 'Gratuitos', pagos: 'Pagos', meus: 'Meus eventos', interesse: 'Meus interesses' };
  const apply = (e) => ({ todos: true, proximos: new Date(e.starts_at) >= now && e.status === 'published', presencial: e.mode === 'presencial', online: e.mode === 'online', gratis: !Number(e.price), pagos: Number(e.price) > 0, meus: e.organizer_id === S.user.id, interesse: e.mine }[EV_F]);
  const draw = () => {
    const list = visible.filter(apply).filter((e) => !EV_DAY || evDay(e) === EV_DAY);
    $('#evl').innerHTML = (EV_DAY ? `<div class="row" style="justify-content:space-between;margin-top:14px"><b class="cap1">${fdate(EV_DAY + 'T12:00', { weekday: 'long', day: 'numeric', month: 'long' })}</b><button class="chip" id="clrday">Limpar dia</button></div>` : '')
      + (list.length ? list.map(evCard).join('') : empty('cal', 'Nenhum evento encontrado.'));
    bindInterest($('#evl'), viewEvents); const c = $('#clrday'); if (c) c.onclick = () => { EV_DAY = null; drawCal(); draw(); };
  };
  const drawCal = () => { $('#cal').innerHTML = calendar(visible.filter((e) => e.status !== 'suspended'));
    $$('[data-m]', $('#cal')).forEach((b) => (b.onclick = () => { EV_MONTH.setMonth(EV_MONTH.getMonth() + Number(b.dataset.m)); drawCal(); }));
    $$('[data-day]', $('#cal')).forEach((b) => (b.onclick = () => { EV_DAY = EV_DAY === b.dataset.day ? null : b.dataset.day; if (EV_DAY) { EV_F = 'todos'; $$('[data-f]', v).forEach((x) => x.classList.toggle('on', x.dataset.f === 'todos')); } drawCal(); draw(); })); };
  const nextEv = visible.filter((e) => e.status === 'published' && new Date(e.starts_at) >= now).sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))[0];
  v.innerHTML = `<p class="eyebrow" style="margin-top:6px">${nextEv ? 'Próximo encontro' : 'Eventos do ecossistema'}</p>
    <h1 class="hd xl" style="margin:6px 0 8px">${nextEv ? `${new Date(nextEv.starts_at).getDate()} ${new Date(nextEv.starts_at).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase()}` : 'Eventos'}</h1>
    <p class="muted small">Encontros, conexões e oportunidades que movimentam nossa comunidade.</p>
    <button class="btn btn-line btn-block" style="margin:16px 0 4px" onclick="eventForm()">${I('plus')} Adicionar evento</button>
    ${featured.length ? `<div class="sec"><h3>Em destaque</h3></div><div class="carousel"><div class="track">${featured.map((e) => `<a class="slide tall" href="#/evento/${e.id}">${e.cover_url ? `<img class="bg" src="${h(e.cover_url)}" alt="">` : ''}<div class="tl"><span class="badge gold">${ftime(e.starts_at)}</span><span class="badge gold">${e.mode === 'online' ? 'Online' : 'Presencial'}</span></div><div class="cap"><span class="eyebrow" style="color:#d1d1d6">${fdate(e.starts_at, { weekday: 'long', day: '2-digit', month: 'short' })}</span><h4 style="margin-top:8px">${h(e.title)}</h4><div class="small muted" style="margin-top:6px">${h(e.organizer_name || e.org.full_name)}</div></div></a>`).join('')}</div><div class="dots">${featured.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div></div>` : ''}
    <div id="cal" style="margin-top:18px"></div>
    <div class="chips" style="margin-top:16px">${Object.entries(filters).map(([k, t]) => `<button class="chip ${EV_F === k ? 'on' : ''}" data-f="${k}">${t}</button>`).join('')}</div>
    <div id="evl"></div>`;
  if (featured.length) autoCarousel($('.track', v), $$('.dots i', v));
  $$('[data-f]', v).forEach((b) => (b.onclick = () => { EV_F = b.dataset.f; EV_DAY = null; $$('[data-f]', v).forEach((x) => x.classList.toggle('on', x === b)); drawCal(); draw(); }));
  drawCal(); draw();
}
async function viewEvent(id) {
  const v = shell('', spinner(), { noTop: true });
  const { events, cats } = await fetchEvents(); const e = events.find((x) => x.id === id);
  if (!e) return (v.innerHTML = `<div style="padding-top:60px">${empty('cal', 'Evento não encontrado.')}</div>`);
  const { data: ints } = await sb.from('event_interests').select('user_id,show_public').eq('event_id', id);
  const pub = (ints || []).filter((i) => i.show_public || e.organizer_id === S.user.id || can('events'));
  const get = await loadProfiles(pub.map((i) => i.user_id));
  const owner = e.organizer_id === S.user.id; const cat = cats.find((c) => c.id === e.category_id); const free = !Number(e.price);
  const end = e.ends_at ? ' – ' + ftime(e.ends_at) : '';
  v.innerHTML = `${e.cover_url ? `<div class="amb" style="--amb:url('${h(e.cover_url)}')"></div>` : ''}
    <div class="dtop"><button class="pill" onclick="history.length>1?history.back():go('#/eventos')">${I('back')} Voltar</button>
      <div class="pills">${cat ? `<span class="pill">${h(cat.name)}</span>` : ''}<span class="pill">${ftime(e.starts_at)}</span><span class="pill">${free ? 'Gratuito' : money(e.price)}</span>
        ${owner || can('events') ? `<button class="icon-btn" style="width:34px;height:34px" id="emenu" aria-label="Opções do evento">${I('more', 16)}</button>` : ''}</div></div>
    <div class="cover" style="height:auto;aspect-ratio:16/11">${e.cover_url ? `<img src="${h(e.cover_url)}" alt="">` : ''}
      ${e.status === 'published' && e.signup_url ? `<a class="btn btn-play corner" href="${h(safeUrl(e.signup_url))}" target="_blank" rel="noopener"><i>${I('ticket')}</i>Inscrição</a>` : ''}</div>
    <div style="position:relative;margin-top:20px;z-index:2">
      <div class="row" style="gap:6px;flex-wrap:wrap"><span class="badge">${e.mode === 'online' ? 'Online' : 'Presencial'}</span>
        ${e.status !== 'published' ? `<span class="badge bad">${{ draft: 'Rascunho', cancelled: 'Cancelado', suspended: 'Suspenso' }[e.status]}</span>` : ''}</div>
      <h1 class="hd lg" style="margin-top:12px">${h(e.title)}</h1>
      <div class="card" style="margin-top:14px"><div class="list">
        <div class="it">${I('cal', 20)}<div class="grow"><b class="small cap1">${fdate(e.starts_at, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</b><span class="small muted">${ftime(e.starts_at)}${end}</span></div></div>
        <div class="it">${I(e.mode === 'online' ? 'globe' : 'pin', 20)}<div class="grow small">${e.mode === 'online' ? (e.online_url ? `<a class="gold" href="${h(safeUrl(e.online_url))}" target="_blank" rel="noopener">Acessar transmissão</a>` : 'Link enviado pelo organizador') : h(e.address || 'Local a definir')}</div>
          ${e.mode !== 'online' && e.address ? `<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="https://maps.google.com/?q=${encodeURIComponent(e.address)}">Mapa</a>` : ''}</div>
        <a class="it" href="#/u/${e.organizer_id}">${av(e.org, 'sm')}<div class="grow"><b class="small" style="display:block">${h(e.organizer_name || e.org.full_name)}</b><span class="small muted">${h(coName(e.org))}</span></div>${I('next', 16)}</a>
        ${e.capacity ? `<div class="it">${I('users', 20)}<div class="grow small">Limite de ${e.capacity} participantes</div></div>` : ''}</div></div>
      ${e.status === 'published' ? `<div style="display:grid;gap:8px;margin-top:14px">
        <button class="btn ${e.mine ? 'btn-ghost' : 'btn-gold'}" id="intb">${e.mine ? I('check') + ' Interesse registrado · cancelar' : 'Tenho interesse'}</button>
        <div class="f2"><button class="btn btn-ghost" id="shr">${I('share')} Compartilhar</button><button class="btn btn-ghost" id="cpy">${I('copy')} Copiar link</button></div>
        <p class="small muted" style="text-align:center">Demonstrar interesse não confirma inscrição nem garante vaga.</p></div>` : ''}
      ${e.description ? `<p class="clamp" id="edesc" style="white-space:pre-wrap;color:#d1d1d6;margin-top:16px">${h(e.description)}</p><button class="readmore" id="edescMore" hidden>Ler mais</button>` : ''}
      ${e.extra_info ? `<div class="sec"><h3>Informações</h3></div><p class="muted" style="white-space:pre-wrap">${h(e.extra_info)}</p>` : ''}
      ${e.contact ? `<div class="sec"><h3>Contato</h3></div><p class="muted">${h(e.contact)}</p>` : ''}
      <div class="sec"><h3>Quem vai</h3><span class="small muted">${e.interested} interessado${e.interested === 1 ? '' : 's'}</span></div>
      ${pub.length ? `<div class="cast">${pub.map((i) => { const pp = get(i.user_id); return `<a href="#/u/${i.user_id}"><div class="ph">${pp.avatar_url ? `<img src="${h(pp.avatar_url)}" alt="" loading="lazy">` : h(initials(pp.full_name))}</div><b class="ell">${h(pp.full_name || '')}</b><span class="ell">${h(coName(pp))}</span></a>`; }).join('')}</div>` : '<p class="muted small">Seja o primeiro.</p>'}
    </div>`;
  readMore($('#edesc'), $('#edescMore'));
  const link = APP_URL + '#/evento/' + id;
  const ib = $('#intb'); if (ib) ib.onclick = () => withBtn(ib, async () => { await toggleInterest(id, e.mine); viewEvent(id); });
  const sh = $('#shr'); if (sh) sh.onclick = async () => { if (navigator.share) { try { await navigator.share({ title: e.title, text: 'Evento no Clube do RØI', url: link }); } catch (_) {} } else { await navigator.clipboard.writeText(link); toast('Link copiado'); } };
  const cp = $('#cpy'); if (cp) cp.onclick = async () => { await navigator.clipboard.writeText(link); toast('Link copiado'); };
  const m = $('#emenu'); if (m) m.onclick = () => eventMenu(e);
}
function eventMenu(e) {
  const owner = e.organizer_id === S.user.id; const adm = can('events');
  sheet(`<h2>${h(e.title)}</h2><div class="menu">
    <button class="it" data-a="edit">${I('edit')}<span class="grow">Editar</span></button>
    <button class="it" data-a="people">${I('users')}<span class="grow">Ver interessados</span><span class="cnt">${e.interested}</span></button>
    ${e.status === 'draft' ? `<button class="it" data-a="publish">${I('check')}<span class="grow">Publicar</span></button>` : ''}
    ${e.status === 'published' ? `<button class="it" data-a="cancel">${I('x')}<span class="grow">Cancelar evento</span></button>` : ''}
    ${adm ? `<button class="it" data-a="feature">${I('star')}<span class="grow">${e.featured ? 'Remover destaque' : 'Destacar no início'}</span></button>
      <button class="it" data-a="pin">${I('pin')}<span class="grow">${e.pinned ? 'Desafixar' : 'Fixar no topo'}</span></button>
      <button class="it" data-a="suspend">${I('shield')}<span class="grow">${e.status === 'suspended' ? 'Reativar' : 'Suspender'}</span></button>` : ''}
    ${owner || adm ? `<button class="it" data-a="del">${I('trash')}<span class="grow" style="color:var(--bad)">Excluir</span></button>` : ''}</div>`, (el, close) => {
    $$('[data-a]', el).forEach((b) => (b.onclick = async () => { const a = b.dataset.a; close();
      const upd = async (row, log) => { const { error } = await sb.from('events').update(row).eq('id', e.id); if (error) return toast(errMsg(error), true); if (log && !owner) await sb.rpc('log_admin', { p_action: log, p_type: 'event', p_id: e.id }); toast('Evento atualizado'); route(); };
      if (a === 'edit') return eventForm(e);
      if (a === 'people') return interestedSheet(e);
      if (a === 'publish') return upd({ status: 'published' });
      if (a === 'cancel') { if (await confirmSheet('Cancelar evento?', 'Os interessados serão notificados.', 'Cancelar evento', true)) upd({ status: 'cancelled' }, 'event_cancelled'); return; }
      if (a === 'feature') return upd({ featured: !e.featured }, 'event_feature');
      if (a === 'pin') return upd({ pinned: !e.pinned }, 'event_pin');
      if (a === 'suspend') return upd({ status: e.status === 'suspended' ? 'published' : 'suspended' }, 'event_suspend');
      if (a === 'del' && (await confirmSheet('Excluir evento?', 'Esta ação não pode ser desfeita.', 'Excluir', true))) { const { error } = await sb.from('events').delete().eq('id', e.id); if (error) return toast(errMsg(error), true); if (!owner) await sb.rpc('log_admin', { p_action: 'event_deleted', p_type: 'event', p_id: e.id }); toast('Evento excluído'); go('#/eventos'); }
    }));
  });
}
async function interestedSheet(e) {
  const s = sheet(`<h2>Interessados</h2><div id="il">${spinner()}</div>`);
  const { data } = await sb.from('event_interests').select('user_id,created_at').eq('event_id', e.id).order('created_at');
  const get = await loadProfiles((data || []).map((i) => i.user_id));
  $('#il', s.el).innerHTML = (data || []).length ? `<div class="list">${data.map((i) => `<a class="it" href="#/u/${i.user_id}">${av(get(i.user_id), 'sm')}<div class="grow"><b class="small" style="display:block">${h(get(i.user_id).full_name)}</b><span class="small muted">${h(coName(get(i.user_id)))} · ${ago(i.created_at)}</span></div>${I('next', 16)}</a>`).join('')}</div>` : '<p class="muted">Ninguém ainda.</p>';
  $$('a', s.el).forEach((a) => a.addEventListener('click', s.close));
}
async function eventForm(e = {}) {
  const { data: cats } = await sb.from('event_categories').select('*').order('name');
  const local = (d) => (d ? new Date(new Date(d) - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : '');
  sheet(`<h2>${e.id ? 'Editar evento' : 'Novo evento'}</h2><form novalidate>${uploadField('cover', 'Banner do evento', e.cover_url, true)}
    ${field('title', 'Nome do evento', e.title, 'text', 'maxlength="120"')}${field('description', 'Descrição', e.description, 'textarea', 'maxlength="4000"')}
    <div class="f2">${field('organizer_name', 'Organizador', e.organizer_name || S.me.full_name)}${selectField('category_id', 'Categoria', [['', 'Selecione'], ...(cats || []).map((c) => [c.id, c.name])], e.category_id || '')}</div>
    ${field('starts_at', 'Início', local(e.starts_at), 'datetime-local')}${field('ends_at', 'Término (opcional)', local(e.ends_at), 'datetime-local')}
    ${selectField('mode', 'Formato', [['presencial', 'Presencial'], ['online', 'Online']], e.mode || 'presencial')}
    <div data-m="presencial">${field('address', 'Endereço completo', e.address)}</div><div data-m="online">${field('online_url', 'Link de acesso', e.online_url, 'url', 'placeholder="https://"')}</div>
    <div class="f2">${field('price', 'Valor (0 = gratuito)', e.price ?? 0, 'number', 'min="0" step="0.01" inputmode="decimal"')}${field('capacity', 'Limite (opcional)', e.capacity || '', 'number', 'min="1"')}</div>
    ${field('signup_url', 'Link de inscrição/compra (opcional)', e.signup_url, 'url', 'placeholder="https://"')}
    ${field('extra_info', 'Informações adicionais', e.extra_info, 'textarea', 'maxlength="2000"')}${field('contact', 'Contato do responsável', e.contact)}
    <div class="f2"><button type="button" class="btn btn-ghost" data-s="draft">Salvar rascunho</button><button class="btn btn-gold" data-s="published">Publicar</button></div></form>`, (el, close) => {
    bindUploadPreviews(el); const f = $('form', el);
    const mode = () => $$('[data-m]', el).forEach((d) => d.classList.toggle('hide', d.dataset.m !== f.mode.value)); f.mode.onchange = mode; mode();
    const save = (status, btn) => {
      if (!validate(f, { title: (v) => (v.length >= 3 ? '' : 'Informe o nome'), starts_at: (v) => (v ? '' : 'Informe a data'), ends_at: (v) => (!v || v > f.starts_at.value ? '' : 'Término deve ser após o início'),
        address: (v) => (f.mode.value === 'presencial' && status === 'published' && !v ? 'Informe o endereço' : ''), online_url: (v) => (f.mode.value === 'online' && status === 'published' && !v ? 'Informe o link' : ''), price: (v) => (Number(v) >= 0 ? '' : 'Valor inválido') })) return;
      withBtn(btn, async () => {
        const d = formData(f); delete d.cover;
        const row = { ...d, starts_at: new Date(d.starts_at).toISOString(), ends_at: d.ends_at ? new Date(d.ends_at).toISOString() : null, price: Number(d.price || 0), capacity: d.capacity ? Number(d.capacity) : null, category_id: d.category_id || null,
          status: e.status === 'cancelled' || e.status === 'suspended' ? e.status : status };
        if (f.cover.files[0]) row.cover_url = await upload(f.cover.files[0], 'events', e.organizer_id || S.user.id);
        const res = e.id ? await sb.from('events').update(row).eq('id', e.id).select('id').single() : await sb.from('events').insert({ ...row, organizer_id: S.user.id }).select('id').single();
        if (res.error) throw res.error; close(); toast(status === 'draft' ? 'Rascunho salvo' : 'Evento publicado'); go('#/evento/' + res.data.id);
      });
    };
    f.onsubmit = (ev) => { ev.preventDefault(); save('published', $('[data-s=published]', f)); };
    $('[data-s=draft]', f).onclick = (ev) => save('draft', ev.currentTarget);
  });
}
async function viewMyEvents() {
  const v = shell('Meus eventos', spinner(), { back: true });
  const { events } = await fetchEvents(); const now = new Date();
  const mine = events.filter((e) => e.organizer_id === S.user.id);
  const k = { total: mine.length, futuros: mine.filter((e) => new Date(e.starts_at) >= now && e.status === 'published').length, interessados: mine.reduce((a, e) => a + e.interested, 0),
    realizados: mine.filter((e) => new Date(e.starts_at) < now && e.status === 'published').length, cancelados: mine.filter((e) => e.status === 'cancelled').length };
  const interests = events.filter((e) => e.mine);
  v.innerHTML = `<div class="kpis"><div class="kpi big"><span>Total de interessados</span><b>${k.interessados}</b></div><div class="kpi"><span>Eventos criados</span><b>${k.total}</b></div><div class="kpi"><span>Futuros</span><b>${k.futuros}</b></div>
    <div class="kpi"><span>Realizados</span><b>${k.realizados}</b></div><div class="kpi"><span>Cancelados</span><b>${k.cancelados}</b></div></div>
    <button class="btn btn-gold btn-block" style="margin-top:14px" onclick="eventForm()">${I('plus')} Adicionar evento</button>
    <div class="seg" style="margin-top:16px"><button class="on" data-t="org">Organizo</button><button data-t="int">Meus interesses</button></div><div id="mel"></div>`;
  const draw = (t) => { const list = t === 'org' ? mine : interests;
    $('#mel').innerHTML = list.length ? list.map((e) => evCard(e) + (t === 'org' ? `<div class="row" style="gap:8px;margin-top:8px"><button class="btn btn-ghost btn-sm grow" data-ppl="${e.id}">${I('users')} ${e.interested}</button><button class="btn btn-ghost btn-sm grow" data-cp="${e.id}">${I('copy')} Link</button><button class="btn btn-ghost btn-sm grow" data-ed="${e.id}">${I('edit')} Editar</button></div>` : '')).join('') : empty('cal', t === 'org' ? 'Você ainda não criou eventos.' : 'Você ainda não demonstrou interesse em eventos.');
    bindInterest($('#mel'), viewMyEvents);
    $$('[data-ppl]', v).forEach((b) => (b.onclick = () => interestedSheet(mine.find((e) => e.id === b.dataset.ppl))));
    $$('[data-cp]', v).forEach((b) => (b.onclick = async () => { await navigator.clipboard.writeText(APP_URL + '#/evento/' + b.dataset.cp); toast('Link copiado'); }));
    $$('[data-ed]', v).forEach((b) => (b.onclick = () => eventForm(mine.find((e) => e.id === b.dataset.ed))));
  };
  $$('[data-t]', v).forEach((b) => (b.onclick = () => { $$('[data-t]', v).forEach((x) => x.classList.toggle('on', x === b)); draw(b.dataset.t); }));
  draw('org');
}

/* ===================== PAINEL MASTER ===================== */
async function viewAdmin(tab = 'painel') {
  const tabs = [['painel', 'Painel', true], ['membros', 'Membros', can('users') || can('support')], ['banners', 'Banners', can('content')], ['conteudo', 'Conteúdo', can('content')],
    ['negocios', 'Negócios', can('deals') || can('finance')], ['eventos', 'Eventos', can('events')], ['logs', 'Auditoria', isSuper() || can('support')], ['config', 'Ajustes', isSuper()]].filter((t) => t[2]);
  if (!tabs.some((t) => t[0] === tab)) tab = 'painel';
  const v = shell('Administração', `<div class="atabs"><div class="chips">${tabs.map(([k, t]) => `<a class="chip ${k === tab ? 'on' : ''}" href="#/admin/${k}">${t}</a>`).join('')}</div></div><div id="adm">${spinner()}</div>`, { back: true });
  const box = $('#adm');
  await ({ painel: admDash, membros: admMembers, banners: admBanners, conteudo: admPosts, negocios: admDeals, eventos: admEvents, logs: admLogs, config: admConfig }[tab])(box);
}
async function admDash(box) {
  const { data: d, error } = await sb.rpc('admin_dashboard'); if (error) throw error;
  const k = (l, val, big) => `<div class="kpi ${big ? 'big' : ''}"><span>${l}</span><b>${val}</b></div>`;
  box.innerHTML = `<div class="kpis">${k('Volume movimentado', money(d.volume), 1)}${k('Membros', d.members)}${k('Ativos', d.active)}${k('Novos (30d)', d.new30)}${k('Aguardando', d.pending)}${k('Suspensos', d.suspended)}${k('Conexões', d.connections)}
    ${k('Negócios registrados', d.deals)}${k('Confirmados', d.confirmed)}${k('Intenções de negócio', d.intents)}${k('Publicações', d.posts)}${k('Eventos', d.events)}</div>
    ${can('users') ? `<button class="btn btn-gold btn-block" style="margin-top:16px" onclick="inviteMember()">${I('plus')} Cadastrar novo membro</button>` : ''}`;
}
let ADM_MEMBERS = [];
async function admMembers(box) {
  const { data, error } = await sb.rpc('admin_members'); if (error) throw error; ADM_MEMBERS = data;
  box.innerHTML = `${can('users') ? `<button class="btn btn-gold btn-block" onclick="inviteMember()">${I('plus')} Cadastrar novo membro</button>` : ''}
    <label class="search" style="margin-top:12px">${I('search')}<input id="mq" placeholder="Buscar nome, empresa ou e-mail"></label>
    <div class="chips" style="margin-top:10px">${[['', 'Todos'], ['active', 'Ativos'], ['pending', 'Aguardando'], ['suspended', 'Suspensos']].map(([k, t]) => `<button class="chip ${k ? '' : 'on'}" data-s="${k}">${t}</button>`).join('')}</div><div class="tbl" id="mt"></div>`;
  let st = '';
  const ST = { active: ['ok', 'Ativo'], pending: ['warn', 'Aguardando'], suspended: ['bad', 'Suspenso'] };
  const draw = () => { const q = $('#mq').value.toLowerCase();
    const list = data.filter((m) => (!st || m.status === st) && (!q || [m.full_name, m.company, m.email].join(' ').toLowerCase().includes(q)));
    $('#mt').innerHTML = list.length ? list.map((m) => `<button class="it" style="width:100%;text-align:left" data-id="${m.id}">${av(m, 'sm')}<div class="grow"><b class="ell" style="display:block">${h(m.full_name || '(sem nome)')} ${m.role !== 'member' ? `<span class="badge gold">${m.role === 'super_admin' ? 'Super' : 'Admin'}</span>` : ''}</b>
      <span class="small muted ell" style="display:block">${h(m.company || '—')} · ${h(m.email)}</span><span class="small muted">${fdate(m.created_at)} · ${m.connections} conexões · ${m.deals} negócios · ${compact(m.volume)}</span></div><span class="badge ${ST[m.status][0]}">${ST[m.status][1]}</span></button>`).join('') : empty('users', 'Nenhum membro.');
    $$('[data-id]', box).forEach((b) => (b.onclick = () => adminMemberSheet(b.dataset.id)));
  };
  $('#mq').oninput = debounce(draw, 150);
  $$('[data-s]', box).forEach((b) => (b.onclick = () => { st = b.dataset.s; $$('[data-s]', box).forEach((x) => x.classList.toggle('on', x === b)); draw(); }));
  draw();
}
async function adminMemberSheet(id) {
  if (!ADM_MEMBERS.length) { const { data } = await sb.rpc('admin_members'); ADM_MEMBERS = data || []; }
  const m = ADM_MEMBERS.find((x) => x.id === id); if (!m) return toast('Membro não encontrado', true);
  const redirect = APP_URL;
  sheet(`<div class="row">${av(m, 'lg')}<div class="grow"><h2 style="margin:0">${h(m.full_name)}</h2><div class="small muted">${h(m.email)}</div></div></div>
    <div class="menu" style="margin-top:12px">
      <a class="it" href="#/u/${id}" data-close>${I('eye')}<span class="grow">Visualizar perfil</span></a>
      ${can('users') ? `<button class="it" data-a="edit">${I('edit')}<span class="grow">Editar dados, fotos e empresa</span></button>
      <button class="it" data-a="svc">${I('deal')}<span class="grow">Serviços</span></button><button class="it" data-a="links">${I('link')}<span class="grow">Contatos</span></button>
      ${m.status === 'pending' ? `<button class="it" data-a="approve">${I('check')}<span class="grow">Aprovar acesso</span></button>` : ''}
      ${m.status === 'active' ? `<button class="it" data-a="suspend">${I('lock')}<span class="grow">Suspender</span></button>` : ''}${m.status === 'suspended' ? `<button class="it" data-a="reactivate">${I('check')}<span class="grow">Reativar</span></button>` : ''}
      <button class="it" data-a="invite">${I('link')}<span class="grow">Gerar novo link de acesso</span></button>` : ''}
      ${can('support') || can('users') ? `<button class="it" data-a="reset">${I('lock')}<span class="grow">Gerar link de nova senha</span></button>` : ''}
      ${isSuper() && m.role !== 'super_admin' ? `<button class="it" data-a="role">${I('shield')}<span class="grow">Papel e permissões</span><span class="cnt">${m.role === 'admin' ? 'Admin' : 'Membro'}</span></button>` : ''}
      ${can('users') && m.role !== 'super_admin' ? `<button class="it" data-a="del">${I('trash')}<span class="grow" style="color:var(--bad)">Excluir conta</span></button>` : ''}</div>`, (el, close) => {
    $$('[data-close]', el).forEach((a) => a.addEventListener('click', close));
    $$('[data-a]', el).forEach((b) => (b.onclick = async () => { const a = b.dataset.a;
      const refresh = () => { ADM_MEMBERS = []; if (location.hash.startsWith('#/admin')) route(); };
      if (a === 'edit') { close(); return editProfile(id); }
      if (a === 'svc') { close(); return manageServices(id); }
      if (a === 'links') { close(); return manageLinks(id); }
      if (a === 'role') { close(); return roleSheet(m); }
      if (a === 'del' && !(await confirmSheet('Excluir conta?', `${m.full_name} perderá o acesso e todos os dados serão removidos.`, 'Excluir definitivamente', true))) return;
      if (a === 'suspend' && !(await confirmSheet('Suspender acesso?', 'O membro não conseguirá entrar até ser reativado.', 'Suspender', true))) return;
      withBtn(b, async () => {
        const action = { approve: 'approve', suspend: 'suspend', reactivate: 'reactivate', invite: 'resend_invite', reset: 'reset_password', del: 'delete' }[a];
        const res = await fn('admin-users', { action, user_id: id, email: m.email, redirect });
        if (a === 'invite' || a === 'reset') { close(); return accessLinkSheet(res, a === 'reset' ? 'reset' : 'invite'); }
        toast({ approve: 'Acesso aprovado', suspend: 'Membro suspenso', reactivate: 'Membro reativado', invite: 'Convite reenviado', reset: 'E-mail de redefinição enviado', del: 'Conta excluída' }[a]);
        close(); refresh();
      });
    }));
  });
}
function roleSheet(m) {
  sheet(`<h2>Papel de ${h((m.full_name || '').split(' ')[0])}</h2><form>${selectField('role', 'Papel', [['member', 'Membro'], ['admin', 'Administrador']], m.role)}
    <div id="perms" class="${m.role === 'admin' ? '' : 'hide'}"><label class="small gold" style="letter-spacing:.14em;text-transform:uppercase;font-weight:600">Permissões</label>
    ${Object.entries(PERM_LABELS).map(([k, t]) => `<label class="check"><input type="checkbox" name="p" value="${k}" ${(m.permissions || []).includes(k) ? 'checked' : ''}> ${t}</label>`).join('')}</div>
    <button class="btn btn-gold btn-block" style="margin-top:10px">Salvar</button></form>`, (el, close) => {
    const f = $('form', el); f.role.onchange = () => $('#perms', el).classList.toggle('hide', f.role.value !== 'admin');
    f.onsubmit = (e) => { e.preventDefault(); withBtn($('button', f), async () => { await fn('admin-users', { action: 'set_role', user_id: m.id, role: f.role.value, permissions: $$('[name=p]:checked', f).map((x) => x.value) }); close(); toast('Permissões atualizadas'); ADM_MEMBERS = []; route(); }); };
  });
}
function accessLinkSheet(r, kind) {
  const first = (r.name || '').split(' ')[0] || '';
  const msg = kind === 'reset'
    ? `Olá${first ? ', ' + first : ''}! Segue seu link para criar uma nova senha no Clube do RØI Network:\n\n${r.link}\n\nO link vale por tempo limitado e só pode ser usado uma vez.`
    : `Olá${first ? ', ' + first : ''}! Seu acesso ao Clube do RØI Network está liberado.\n\nToque no link para criar sua senha e entrar:\n${r.link}\n\nDepois, é só usar seu e-mail e a senha que você criou. O link vale por tempo limitado e só pode ser usado uma vez.`;
  const wa = r.phone ? waLink(r.phone) : 'https://wa.me/';
  sheet(`<h2>${kind === 'reset' ? 'Link para nova senha' : 'Acesso liberado'}</h2>
    <p class="muted small" style="margin:-6px 0 14px">Envie esta mensagem para ${h(r.name || 'o membro')} pelo WhatsApp. Cada link funciona uma vez; se expirar, gere outro na ficha do membro.</p>
    <div class="f"><label>Mensagem</label><textarea id="alm" style="min-height:190px;font-size:14px">${h(msg)}</textarea></div>
    <div class="f2"><button class="btn btn-ghost" id="alc">${I('copy')} Copiar</button><a class="btn btn-gold" id="alw" target="_blank" rel="noopener" href="${h(wa)}">${I('whatsapp')} WhatsApp</a></div>`, (el) => {
    $('#alc', el).onclick = async () => { const t = $('#alm', el); try { await navigator.clipboard.writeText(t.value); toast('Mensagem copiada'); } catch (_) { t.select(); toast('Texto selecionado: copie com o menu do celular'); } };
    $('#alw', el).onclick = () => { $('#alw', el).href = wa.split('?')[0] + '?text=' + encodeURIComponent($('#alm', el).value); };
  });
}
function inviteMember() {
  sheet(`<h2>Novo membro</h2><p class="muted small" style="margin:-6px 0 14px">Ao salvar, o app gera o link de acesso para você enviar ao membro pelo WhatsApp. Ele cria a própria senha; ninguém vê senhas.</p><form novalidate>
    ${field('full_name', 'Nome completo')}${field('email', 'E-mail de acesso', '', 'email')}<div class="f2">${field('company', 'Empresa')}${field('phone', 'Telefone/WhatsApp', '', 'tel')}</div>
    ${isSuper() ? `${selectField('role', 'Papel', [['member', 'Membro'], ['admin', 'Administrador']])}<div id="perms" class="hide">${Object.entries(PERM_LABELS).map(([k, t]) => `<label class="check"><input type="checkbox" name="p" value="${k}"> ${t}</label>`).join('')}</div>` : ''}
    <button class="btn btn-gold btn-block" style="margin-top:8px">Cadastrar e gerar link</button></form>`, (el, close) => {
    const f = $('form', el); if (f.role) f.role.onchange = () => $('#perms', el).classList.toggle('hide', f.role.value !== 'admin');
    f.onsubmit = (e) => { e.preventDefault(); if (!validate(f, { full_name: (v) => (v.length >= 3 ? '' : 'Informe o nome'), email: (v) => (isEmail(v) ? '' : 'E-mail inválido') })) return;
      withBtn($('button', f), async () => { const d = formData(f);
        const r = await fn('admin-users', { action: 'create', ...d, permissions: $$('[name=p]:checked', f).map((x) => x.value), redirect: APP_URL });
        close(); ADM_MEMBERS = []; if (location.hash.startsWith('#/admin')) route(); accessLinkSheet(r, 'invite'); }); };
  });
}
async function admBanners(box) {
  const { data, error } = await sb.from('banners').select('*').order('position'); if (error) throw error;
  const get = await loadProfiles(data.map((b) => b.profile_id));
  box.innerHTML = `<button class="btn btn-gold btn-block" id="nb">${I('plus')} Adicionar banner</button>
    ${data.length ? data.map((b, i) => `<div class="card" style="margin-top:10px;padding:10px"><div class="row">${b.image_url ? `<img src="${h(b.image_url)}" style="width:86px;height:56px;border-radius:10px;object-fit:cover" alt="">` : `<div style="width:86px;height:56px;border-radius:10px;background:var(--card2)"></div>`}
      <div class="grow"><b class="small ell" style="display:block">${h(b.title || coName(get(b.profile_id)) || 'Banner')}</b><span class="small muted ell" style="display:block">${h(get(b.profile_id).full_name || '')}</span>
      <div class="row" style="gap:4px;margin-top:4px"><span class="badge ${b.active ? 'ok' : ''}">${b.active ? 'Ativo' : 'Inativo'}</span>${b.featured ? '<span class="badge gold">Destaque</span>' : ''}</div></div>
      <div style="display:grid;gap:4px"><button class="icon-btn" style="width:32px;height:32px" data-up="${i}" ${i ? '' : 'disabled'}>${I('up', 15)}</button><button class="icon-btn" style="width:32px;height:32px" data-dn="${i}" ${i < data.length - 1 ? '' : 'disabled'}>${I('down', 15)}</button></div>
      <button class="icon-btn" style="width:36px;height:36px" data-ed="${i}">${I('edit', 16)}</button></div></div>`).join('') : empty('image', 'Nenhum banner. Destaque empresas do Clube no topo do feed.')}`;
  const move = async (i, j) => { const arr = data.slice(); [arr[i], arr[j]] = [arr[j], arr[i]]; await Promise.all(arr.map((b, k) => sb.from('banners').update({ position: k }).eq('id', b.id))); await sb.rpc('log_admin', { p_action: 'banners_reordered', p_type: 'banner', p_id: '' }); admBanners(box); };
  $$('[data-up]', box).forEach((b) => (b.onclick = () => move(+b.dataset.up, +b.dataset.up - 1)));
  $$('[data-dn]', box).forEach((b) => (b.onclick = () => move(+b.dataset.dn, +b.dataset.dn + 1)));
  $$('[data-ed]', box).forEach((b) => (b.onclick = () => bannerForm(data[+b.dataset.ed], () => admBanners(box))));
  $('#nb').onclick = () => bannerForm({ position: data.length, active: true }, () => admBanners(box));
}
async function bannerForm(b, after) {
  const { data: ms } = await sb.from('profiles').select('id,full_name,companies(name)').eq('status', 'active').order('full_name');
  sheet(`<h2>${b.id ? 'Editar banner' : 'Novo banner'}</h2><form novalidate>${uploadField('img', 'Imagem (horizontal)', b.image_url, true)}
    ${selectField('profile_id', 'Empresa / membro vinculado', [['', 'Selecione'], ...(ms || []).map((p) => [p.id, `${coName(p) || '—'} · ${p.full_name}`])], b.profile_id || '')}
    ${field('title', 'Título (opcional)', b.title)}${field('tagline', 'Frase de posicionamento', b.tagline, 'text', 'maxlength="120"')}
    <label class="check"><input type="checkbox" name="active" ${b.active !== false ? 'checked' : ''}> Ativo</label><label class="check"><input type="checkbox" name="featured" ${b.featured ? 'checked' : ''}> Destaque (aparece primeiro)</label>
    <div class="f2" style="margin-top:10px">${b.id ? '<button type="button" class="btn btn-bad" data-del>Excluir</button>' : '<span></span>'}<button class="btn btn-gold">Salvar</button></div></form>`, (el, close) => {
    bindUploadPreviews(el); const f = $('form', el);
    f.onsubmit = (e) => { e.preventDefault(); if (!validate(f, { profile_id: req('Vincule a uma empresa') })) return;
      withBtn($('.btn-gold', f), async () => { const row = { profile_id: f.profile_id.value, title: f.title.value.trim(), tagline: f.tagline.value.trim(), active: f.active.checked, featured: f.featured.checked, position: b.position ?? 0 };
        if (f.img.files[0]) row.image_url = await upload(f.img.files[0], 'banner');
        const { error } = b.id ? await sb.from('banners').update(row).eq('id', b.id) : await sb.from('banners').insert(row); if (error) throw error;
        await sb.rpc('log_admin', { p_action: b.id ? 'banner_updated' : 'banner_created', p_type: 'banner', p_id: b.id || '' }); close(); toast('Banner salvo'); after(); }); };
    const d = $('[data-del]', el); if (d) d.onclick = async () => { if (!(await confirmSheet('Excluir banner?', '', 'Excluir', true))) return; await sb.from('banners').delete().eq('id', b.id); await sb.rpc('log_admin', { p_action: 'banner_deleted', p_type: 'banner', p_id: b.id }); close(); after(); };
  });
}
async function admPosts(box) {
  const { data, error } = await sb.from('social_posts').select('*').order('created_at', { ascending: false }).limit(60); if (error) throw error;
  box.innerHTML = data.length ? await renderPosts(data) : empty('spark', 'Nenhuma publicação.'); bindPosts(box);
}
async function admDeals(box) {
  const { data, error } = await sb.from('business_deals').select('*').order('created_at', { ascending: false }).limit(500); if (error) throw error;
  const get = await loadProfiles(data.flatMap((d) => [d.seller_id, d.buyer_id]));
  const cats = [...new Set(data.map((d) => d.category).filter(Boolean))];
  box.innerHTML = `<div class="kpis" id="dk"></div><label class="search" style="margin-top:12px">${I('search')}<input id="dq" placeholder="Membro, empresa ou descrição"></label>
    <div class="chips" style="margin-top:10px">${[['', 'Todos'], ...Object.entries(DEAL_ST).map(([k, v]) => [k, v[1]])].map(([k, t]) => `<button class="chip ${k ? '' : 'on'}" data-st="${k}">${t}</button>`).join('')}</div>
    <div class="chips">${[['all', 'Todo período'], ['30', '30 dias'], ['90', '90 dias'], ['ano', 'Este ano']].map(([k, t]) => `<button class="chip ${k === 'all' ? 'on' : ''}" data-per="${k}">${t}</button>`).join('')}${cats.map((c) => `<button class="chip" data-cat="${h(c)}">${h(c)}</button>`).join('')}</div><div id="dlst"></div>`;
  const f = { st: '', per: 'all', cat: '' };
  const draw = () => { const q = $('#dq').value.toLowerCase(); const start = periodStart(f.per);
    const list = data.filter((d) => (!f.st || d.status === f.st) && (!start || d.closed_on >= start) && (!f.cat || d.category === f.cat) &&
      (!q || [d.description, d.product, get(d.seller_id).full_name, get(d.buyer_id).full_name, coName(get(d.seller_id)), coName(get(d.buyer_id))].join(' ').toLowerCase().includes(q)));
    const conf = list.filter((d) => d.status === 'confirmed');
    $('#dk').innerHTML = `<div class="kpi big"><span>Volume confirmado (filtro)</span><b>${money(conf.reduce((a, d) => a + Number(d.amount), 0))}</b></div><div class="kpi"><span>Registros</span><b>${list.length}</b></div><div class="kpi"><span>Confirmados</span><b>${conf.length}</b></div>`;
    $('#dlst').innerHTML = list.length ? list.map((d) => { const [cls, lbl] = DEAL_ST[d.status];
      return `<div class="card" style="margin-top:10px"><div class="row"><div class="grow"><b class="ell" style="display:block">${h(d.description)}</b><span class="small muted"><a class="gold" href="#/u/${d.seller_id}">${h(get(d.seller_id).full_name)}</a> → <a class="gold" href="#/u/${d.buyer_id}">${h(get(d.buyer_id).full_name)}</a> · ${fdate(d.closed_on)}</span></div><span class="badge ${cls}">${lbl}</span></div>
        <div class="row" style="margin-top:8px;justify-content:space-between"><b class="gold">${money2(d.amount)}</b><div class="row" style="gap:6px"><button class="btn btn-ghost btn-sm" data-log="${d.id}">Histórico</button>${d.status === 'pending' && can('deals') ? `<button class="btn btn-bad btn-sm" data-cancel="${d.id}">Cancelar</button>` : ''}</div></div></div>`; }).join('') : empty('chart', 'Nenhum negócio.');
    $$('[data-log]', box).forEach((b) => (b.onclick = async () => { const { data: lg } = await sb.from('deal_confirmations').select('*').eq('deal_id', b.dataset.log).order('created_at'); const g2 = await loadProfiles((lg || []).map((x) => x.actor_id));
      sheet(`<h2>Histórico</h2><div class="list">${(lg || []).map((x) => `<div class="it"><div class="grow"><b class="small">${h({ registered: 'Registrado', confirm: 'Confirmado', decline: 'Recusado', cancel: 'Cancelado' }[x.action] || x.action)}</b><div class="small muted">${h(g2(x.actor_id).full_name)} · ${fdate(x.created_at)} ${ftime(x.created_at)}</div></div></div>`).join('')}</div>`); }));
    $$('[data-cancel]', box).forEach((b) => (b.onclick = async () => { if (!(await confirmSheet('Cancelar registro?', 'Ação administrativa registrada em auditoria.', 'Cancelar', true))) return; const { error: e } = await sb.rpc('respond_deal', { p_deal: b.dataset.cancel, p_action: 'cancel', p_note: 'admin' }); if (e) return toast(errMsg(e), true); route(); }));
  };
  $('#dq').oninput = debounce(draw, 150);
  $$('[data-st]', box).forEach((b) => (b.onclick = () => { f.st = b.dataset.st; $$('[data-st]', box).forEach((x) => x.classList.toggle('on', x === b)); draw(); }));
  $$('[data-per]', box).forEach((b) => (b.onclick = () => { f.per = b.dataset.per; $$('[data-per]', box).forEach((x) => x.classList.toggle('on', x === b)); draw(); }));
  $$('[data-cat]', box).forEach((b) => (b.onclick = () => { f.cat = f.cat === b.dataset.cat ? '' : b.dataset.cat; $$('[data-cat]', box).forEach((x) => x.classList.toggle('on', x.dataset.cat === f.cat)); draw(); }));
  draw();
}
async function admEvents(box) {
  const { events, cats } = await fetchEvents();
  box.innerHTML = `<div class="sec" style="margin-top:4px"><h3>Categorias</h3></div><div class="chips" style="flex-wrap:wrap">${cats.map((c) => `<span class="chip" style="display:inline-flex;align-items:center;gap:6px">${h(c.name)}<button data-dc="${c.id}" style="color:var(--bad)">${I('x', 13)}</button></span>`).join('')}<button class="chip" id="nc">+ Nova</button></div>
    <div class="sec"><h3>Todos os eventos</h3></div>${events.length ? events.map((e) => `<div class="row" style="margin-top:10px">${e.cover_url ? `<img src="${h(e.cover_url)}" style="width:56px;height:56px;border-radius:12px;object-fit:cover" alt="">` : `<div style="width:56px;height:56px;border-radius:12px;background:var(--card2)"></div>`}
      <a class="grow" href="#/evento/${e.id}"><b class="small ell" style="display:block">${h(e.title)}</b><span class="small muted">${fdate(e.starts_at)} · ${h(e.org.full_name)} · ${e.interested} int.</span>
      <div class="row" style="gap:4px;margin-top:3px"><span class="badge ${e.status === 'published' ? 'ok' : e.status === 'draft' ? '' : 'bad'}">${{ published: 'Publicado', draft: 'Rascunho', cancelled: 'Cancelado', suspended: 'Suspenso' }[e.status]}</span>${e.featured ? '<span class="badge gold">Destaque</span>' : ''}${e.pinned ? '<span class="badge gold">Fixado</span>' : ''}</div></a>
      <button class="icon-btn" style="width:36px;height:36px" data-em="${e.id}">${I('more', 16)}</button></div>`).join('') : empty('cal', 'Nenhum evento.')}`;
  $$('[data-em]', box).forEach((b) => (b.onclick = () => eventMenu(events.find((e) => e.id === b.dataset.em))));
  $$('[data-dc]', box).forEach((b) => (b.onclick = async () => { if (!(await confirmSheet('Excluir categoria?', 'Eventos ficarão sem categoria.', 'Excluir', true))) return; await sb.from('event_categories').delete().eq('id', b.dataset.dc); admEvents(box); }));
  $('#nc').onclick = () => sheet(`<h2>Nova categoria</h2><form>${field('name', 'Nome', '', 'text', 'maxlength="40"')}<button class="btn btn-gold btn-block">Salvar</button></form>`, (el, close) => {
    const f = $('form', el); f.onsubmit = (e) => { e.preventDefault(); if (!validate(f, { name: req() })) return; withBtn($('button', f), async () => { const { error } = await sb.from('event_categories').insert({ name: f.name.value.trim() }); if (error) throw error; close(); admEvents(box); }); }; });
}
async function admLogs(box) {
  const { data, error } = await sb.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200); if (error) throw error;
  const get = await loadProfiles(data.map((l) => l.actor_id));
  const tgt = await loadProfiles(data.filter((l) => l.target_type === 'user' && /^[0-9a-f-]{36}$/.test(l.target_id || '')).map((l) => l.target_id));
  box.innerHTML = data.length ? `<div class="list">${data.map((l) => `<div class="it"><div class="grow"><b class="small" style="display:block">${h(l.action.replace(/_/g, ' '))}</b><span class="small muted">${h(get(l.actor_id).full_name)}${l.target_type === 'user' && l.target_id ? ' → ' + h(tgt(l.target_id).full_name) : l.target_type ? ' · ' + h(l.target_type) : ''} · ${fdate(l.created_at)} ${ftime(l.created_at)}</span></div></div>`).join('')}</div>` : empty('shield', 'Nenhuma ação administrativa registrada.');
}
async function admConfig(box) {
  const { data } = await sb.from('platform_settings').select('*').eq('key', 'email').maybeSingle(); const cfg = (data && data.value) || {};
  box.innerHTML = `<div class="sec"><h3>E-mails</h3></div><div class="card"><form>
    <label class="check"><input type="checkbox" name="enabled" ${cfg.enabled !== false ? 'checked' : ''}> Enviar e-mails automáticos (intenções e negócios)</label>
    ${field('from', 'Remetente', cfg.from || 'Clube do RØI <onboarding@resend.dev>')}
    <p class="small muted" style="margin-bottom:12px">O envio usa o Resend. Cadastre a chave RESEND_API_KEY nos segredos das Edge Functions do Supabase e verifique seu domínio no Resend.</p>
    <button class="btn btn-gold btn-block">Salvar</button></form></div>`;
  const f = $('form', box); f.onsubmit = (e) => { e.preventDefault(); withBtn($('button', f), async () => { const { error } = await sb.from('platform_settings').update({ value: { enabled: f.enabled.checked, from: f.from.value.trim() } }).eq('key', 'email'); if (error) throw error; await sb.rpc('log_admin', { p_action: 'settings_email', p_type: 'settings', p_id: 'email' }); toast('Ajustes salvos'); }); };
}

boot();
