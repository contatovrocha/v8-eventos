/* Clube do ROI — web app (PWA). Sem build: JS puro.
   Dados: driver "local" (demonstração, localStorage) ou "supabase" (produção, RLS). */
(() => {
'use strict';

/* ============ utilidades ============ */
const $ = (s, r = document) => r.querySelector(s);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2));
const nowISO = () => new Date().toISOString();
const MES = ['JAN','FEV','MAR','ABR','MAI','JUN','JUL','AGO','SET','OUT','NOV','DEZ'];
const MES_L = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const DOW = ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];
const fmtHora = d => `${String(d.getHours()).padStart(2,'0')}h${String(d.getMinutes()).padStart(2,'0')}`;
const fmtData = iso => { const d = new Date(iso); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; };
const ago = iso => { const s = (Date.now() - new Date(iso)) / 1000; if (s < 60) return 'agora'; if (s < 3600) return Math.floor(s/60) + ' min'; if (s < 86400) return Math.floor(s/3600) + ' h'; return Math.floor(s/86400) + ' d'; };
const initials = n => String(n || '?').split(/\s+/).filter(Boolean).slice(0,2).map(p => p[0].toUpperCase()).join('');
const first = n => String(n || '').split(' ')[0];
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), 2600); }
function hash(s) { let h = 5381; for (const c of String(s)) h = ((h << 5) + h + c.charCodeAt(0)) | 0; return 'h' + (h >>> 0).toString(36); }

const P = {
  home:'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  compass:'<circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36z"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  diag:'<circle cx="12" cy="12" r="10"/><path d="m8 12 3 3 5-6"/>',
  book:'<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>',
  mentor:'<circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/><path d="m12 14 1 2-1 3-1-3z"/>',
  users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  cal:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
  plan:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
  chart:'<path d="M3 3v18h18"/><path d="M7 16v-5M12 16V7M17 16v-8"/>',
  help:'<path d="M3 14v-3a9 9 0 0 1 18 0v3"/><path d="M21 16a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2zM3 16a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2z"/><path d="M18 18v1a3 3 0 0 1-3 3h-3"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  out:'<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  arrow:'<path d="M5 12h14M12 5l7 7-7 7"/>',
  down:'<path d="m6 9 6 6 6-6"/>', left:'<path d="m15 18-6-6 6-6"/>', right:'<path d="m9 18 6-6-6-6"/>',
  rocket:'<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  star:'<path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
  pin:'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
  play:'<circle cx="12" cy="12" r="10"/><path d="m10 8 6 4-6 4z"/>',
  more:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  check:'<path d="M20 6 9 17l-5-5"/>', lock:'<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', x:'<path d="M18 6 6 18M6 6l12 12"/>',
  send:'<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  msg:'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  link:'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  video:'<path d="m22 8-6 4 6 4V8z"/><rect x="2" y="6" width="14" height="12" rx="2"/>',
  pdf:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
  shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  edit:'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash:'<path d="M3 6h18M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2"/>',
  swap:'<path d="m16 3 4 4-4 4M20 7H4M8 21l-4-4 4-4M4 17h16"/>',
  phone:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>',
  target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  uplus:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
};
const I = (n, c = '') => `<svg class="i ${c}" viewBox="0 0 24 24" aria-hidden="true">${P[n] || ''}</svg>`;
let _lg = 0;
const LOGO = () => { const g = 'lg' + (++_lg); return `<svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1dcb2"/><stop offset="1" stop-color="#a5814a"/></linearGradient></defs><g fill="none" stroke="url(#${g})" stroke-width="3.2"><path d="M6 24 22 8l8 8-16 16z"/><path d="M42 24 26 40l-8-8 16-16z"/><path d="M14 32 22 40" stroke-width="2"/><path d="M34 16 26 8" stroke-width="2"/></g></svg>`; };
const BRAND_ = () => `<a class="brand" href="#/" aria-label="Clube do ROI — início">${LOGO()}<span class="bt"><small>CLUBE DO</small><b>ROI</b></span></a>`;
const AV = (p, cls = '') => p && p.avatar ? `<img class="avatar ${cls}" src="${esc(p.avatar)}" alt="">` : `<span class="avatar ${cls}">${esc(initials(p && p.name))}</span>`;

/* ============ dados de demonstração ============ */
function seed() {
  const Y = new Date().getFullYear(), M = new Date().getMonth();
  const at = (mOff, d, h = 10) => new Date(Y, M + mOff, d, h).toISOString();
  const fut = (days, h, m = 0) => { const d = new Date(); d.setDate(d.getDate() + days); d.setHours(h, m, 0, 0); return d.toISOString(); };
  // próxima quinta-feira 19h para a masterclass
  const thu = (() => { const d = new Date(); d.setDate(d.getDate() + ((4 - d.getDay() + 7) % 7 || 7) + 14); d.setHours(19,0,0,0); return d.toISOString(); })();
  const users = [
    { id:'u-ricardo', email:'ricardo@clubedoroi.com.br', pw:hash('roi2025') },
    { id:'u-admin',   email:'admin@clubedoroi.com.br',   pw:hash('admin2025') },
    { id:'u-helena',  email:'mentor@clubedoroi.com.br',  pw:hash('mentor2025') },
  ];
  const P = (id, name, company, segment, city, avatar, extra = {}) => ({ id, name, company, segment, city, avatar, headline:'', revenue:'', employees:'', goals:'', member_since: 2025, created_at: at(-6,1), ...extra });
  const profiles = [
    P('u-ricardo','Ricardo Almeida','Almeida Participações','Holding e investimentos','São Paulo/SP','img/av-ricardo.jpg',{headline:'Fundador · Almeida Participações',revenue:'R$ 10 a 50 mi',employees:'51 a 200',goals:'Expandir para 3 novas praças e estruturar o conselho consultivo.'}),
    P('u-admin','Equipe Clube do ROI','Clube do ROI','Comunidade de negócios','São Paulo/SP','',{headline:'Administração do clube'}),
    P('u-helena','Helena Duarte','Duarte Advisory','Consultoria estratégica','São Paulo/SP','img/av2.jpg',{headline:'Mentora · Estratégia e governança'}),
    P('m1','Bruno Carvalho','Carvalho Engenharia','Construção civil','Campinas/SP','img/av1.jpg',{headline:'CEO · Carvalho Engenharia'}),
    P('m2','Juliana Prado','Prado Cosméticos','Varejo e e-commerce','Belo Horizonte/MG','img/av2.jpg',{headline:'Sócia-fundadora'}),
    P('m3','Marcelo Teixeira','Teixeira Logística','Logística','Curitiba/PR','img/av3.jpg',{headline:'Diretor executivo'}),
    P('m4','Camila Rocha','Rocha Saúde','Saúde','Rio de Janeiro/RJ','img/av4.jpg',{headline:'Fundadora · Rede de clínicas'}),
    P('m5','André Nogueira','Nogueira Agro','Agronegócio','Ribeirão Preto/SP','img/av5.jpg',{headline:'Sócio-diretor'}),
    P('m6','Fernanda Lima','Lima Tech','Tecnologia','Florianópolis/SC','',{headline:'CTO e cofundadora'}),
    P('m7','Gustavo Moreira','Moreira Imóveis','Mercado imobiliário','São Paulo/SP','',{headline:'Incorporador'}),
    P('m8','Patrícia Souza','Souza Alimentos','Indústria de alimentos','Goiânia/GO','',{headline:'CEO'}),
    P('m9','Rafael Batista','Batista Educação','Educação','Recife/PE','',{headline:'Fundador'}),
    P('m10','Larissa Mendes','Mendes Moda','Varejo e e-commerce','São Paulo/SP','',{headline:'Diretora comercial'}),
  ];
  const user_roles = [{user_id:'u-admin',role:'admin'},{user_id:'u-helena',role:'mentor'}];
  const S = (ord, key, title, description, minutes, route, label) => ({ id:'s'+ord, ord, key, title, description, minutes, route, label });
  const journey_steps = [
    S(1,'boas-vindas','Boas-vindas ao Clube','Entenda como o Clube do ROI funciona, os pilares do ecossistema e o que esperar dos próximos 90 dias.',5,'#/jornada','Ver boas-vindas'),
    S(2,'perfil','Conhecendo você','Compartilhe mais sobre sua trajetória, empresa e objetivos.',15,'#/perfil','Completar perfil'),
    S(3,'encontro','Seu primeiro encontro','Confirme presença em um encontro da agenda e conheça os membros pessoalmente.',5,'#/agenda','Abrir agenda'),
    S(4,'conexoes','Conexões iniciais','Conecte-se com pelo menos 3 membros alinhados ao seu momento.',10,'#/comunidade','Explorar membros'),
    S(5,'biblioteca','Base de conhecimento','Acesse o Guia Estratégico de Crescimento na biblioteca.',20,'#/biblioteca','Abrir biblioteca'),
    S(6,'diagnostico','Diagnóstico Empresarial','Avalie 8 áreas da sua empresa e descubra onde estão as maiores alavancas de crescimento.',25,'#/diagnosticos','Fazer diagnóstico'),
    S(7,'plano','Plano de Crescimento','Transforme o diagnóstico em metas claras para os próximos 90 dias.',30,'#/plano','Montar plano'),
  ];
  const done = [ [1,at(-5,8)],[2,at(-4,6)],[3,at(-3,12)],[4,at(-2,9)],[5,at(-1,15)] ];
  const member_steps = done.map(([o,d]) => ({ user_id:'u-ricardo', step_id:'s'+o, status:'concluida', completed_at:d }));
  // Membros fictícios com progressos variados (para relatórios do admin)
  ['m1','m2','m3','m4','m5'].forEach((m,i) => journey_steps.slice(0, 2 + i).forEach(s => member_steps.push({user_id:m,step_id:s.id,status:'concluida',completed_at:at(-3,5+i)})));
  const events = [
    { id:'e1', title:'Masterclass com convidado especial', kind:'Masterclass', starts_at:thu, place:'São Paulo/SP', mode:'Evento presencial', cover:'img/auditorio.jpg', seats:120, description:'Uma noite com um convidado que construiu e vendeu empresas em três setores. Bate-papo aberto e networking no final.' },
    { id:'e2', title:'Mentoria coletiva: precificação e margem', kind:'Mentoria', starts_at:fut(9,20), place:'Online', mode:'Ao vivo · link enviado aos inscritos', cover:'img/xadrez.jpg', seats:300, link:'', description:'Sessão prática com casos reais dos membros. Traga seus números.' },
    { id:'e3', title:'Jantar de negócios do Clube', kind:'Networking', starts_at:fut(30,20,30), place:'São Paulo/SP', mode:'Evento presencial', cover:'img/hero.jpg', seats:40, description:'Jantar fechado para membros, com mesas organizadas por segmento e momento de empresa.' },
    { id:'e4', title:'Imersão Estratégica de Verão', kind:'Imersão', starts_at:fut(75,9), place:'Campos do Jordão/SP', mode:'Evento presencial · 2 dias', cover:'img/hero.jpg', seats:60, description:'Dois dias para revisar a estratégia do ano com mentores do clube.' },
  ];
  const rsvps = [{event_id:'e1',user_id:'u-ricardo',created_at:at(-3,12)},{event_id:'e1',user_id:'m1',created_at:at(-1,2)},{event_id:'e1',user_id:'m3',created_at:at(-1,3)}];
  const materials = [
    { id:'mt1', title:'Guia Estratégico de Crescimento', kind:'PDF', size:'12 MB', category:'Estratégia', cover:'img/mat-guia.jpg', url:'', published_at:at(0,1) },
    { id:'mt2', title:'Estratégias de Expansão Global', kind:'Vídeo', size:'28 min', category:'Expansão', cover:'img/mat-video.jpg', url:'', published_at:at(-1,25) },
    { id:'mt3', title:'Checklist de Governança para Empresas Familiares', kind:'PDF', size:'3 MB', category:'Governança', cover:'', url:'', published_at:at(-1,10) },
    { id:'mt4', title:'Como montar um conselho consultivo', kind:'Vídeo', size:'41 min', category:'Governança', cover:'', url:'', published_at:at(-2,18) },
    { id:'mt5', title:'Planilha de Unit Economics', kind:'Link', size:'Google Sheets', category:'Finanças', cover:'', url:'', published_at:at(-2,4) },
  ];
  const mentors = [
    { id:'mn1', user_id:'u-helena', name:'Helena Duarte', specialty:'Estratégia e governança', bio:'20 anos em conselhos de empresas médias. Ajuda fundadores a estruturar crescimento com governança.', avatar:'img/av2.jpg' },
    { id:'mn2', name:'Roberto Lacerda', specialty:'Vendas B2B e expansão', bio:'Escalou times comerciais de 5 a 200 vendedores em três empresas.', avatar:'img/av3.jpg' },
    { id:'mn3', name:'Daniela Freitas', specialty:'Finanças e M&A', bio:'Ex-banco de investimento. Valuation, captação e fusões.', avatar:'img/av4.jpg' },
  ];
  const connections = [
    ...['m1','m2','m3','m4','m5'].map((m,i) => ({ id:'c'+i, requester:i%2?m:'u-ricardo', addressee:i%2?'u-ricardo':m, status:'aceita', created_at:at(-2,3+i) })),
    { id:'c9', requester:'m6', addressee:'u-ricardo', status:'pendente', created_at:at(0,1) },
  ];
  const messages = [
    { id:'g1', sender:'m1', receiver:'u-ricardo', body:'Ricardo, bom te conhecer no último encontro! Vamos marcar um café?', created_at:at(0,1,9) },
    { id:'g2', sender:'u-ricardo', receiver:'m1', body:'Com certeza, Bruno. Quinta pela manhã funciona pra você?', created_at:at(0,1,10) },
  ];
  const notifications = [
    { id:'n1', user_id:'u-ricardo', title:'Novo pedido de conexão', body:'Fernanda Lima quer se conectar com você.', link:'#/comunidade/pedidos', read:false, created_at:at(0,1) },
    { id:'n2', user_id:'u-ricardo', title:'Etapa liberada', body:'Diagnóstico Empresarial está disponível na sua jornada.', link:'#/jornada', read:false, created_at:at(-1,15) },
    { id:'n3', user_id:'u-ricardo', title:'Novo evento na agenda', body:'Masterclass com convidado especial — vagas abertas.', link:'#/agenda', read:true, created_at:at(-1,10) },
  ];
  return { users, profiles, user_roles, journey_steps, member_steps, events, rsvps, materials, mentors, connections, messages, notifications, diagnostics:[], plans:[], mentor_requests:[] };
}

/* chaves de cada tabela (para update/delete) */
const KEYS = { member_steps:['user_id','step_id'], rsvps:['event_id','user_id'], user_roles:['user_id'], plans:['user_id'] };
const keyOf = (t) => KEYS[t] || ['id'];
const matches = (row, m) => Object.entries(m || {}).every(([k, v]) => row[k] === v);

/* ============ driver local (demonstração) ============ */
function LocalDriver() {
  const K = 'cdr:db:v1';
  let D;
  try { D = JSON.parse(localStorage.getItem(K)); } catch (e) {}
  if (!D) D = seed();
  const save = () => { try { localStorage.setItem(K, JSON.stringify(D)); } catch (e) {} };
  save();
  let me = null;
  try { me = localStorage.getItem('cdr:current'); } catch (e) {}
  if (me && !D.users.find(u => u.id === me)) me = null;
  const isAdmin = () => D.user_roles.some(r => r.user_id === me && r.role === 'admin');
  const PRIV = ['member_steps','notifications','diagnostics','plans','mentor_requests'];
  const ADMIN_ONLY = ['journey_steps','events','materials','mentors','user_roles'];

  // Emulação das políticas RLS do schema.sql — cada membro só enxerga o que é dele.
  function canRead(t, r) {
    if (!me) return false;
    if (PRIV.includes(t)) return r.user_id === me || isAdmin();
    if (t === 'messages') return r.sender === me || r.receiver === me;
    if (t === 'connections') return r.requester === me || r.addressee === me || isAdmin();
    return true;
  }
  function canWrite(t, r, op) {
    if (!me) return false;
    if (isAdmin()) return true;
    if (ADMIN_ONLY.includes(t)) return false;
    if (t === 'profiles') return r.id === me;
    if (PRIV.includes(t)) return r.user_id === me || (t === 'notifications' && op === 'insert');
    if (t === 'rsvps') return r.user_id === me;
    if (t === 'messages') return op === 'insert' && r.sender === me && D.connections.some(c => c.status === 'aceita' && ((c.requester === me && c.addressee === r.receiver) || (c.addressee === me && c.requester === r.receiver)));
    if (t === 'connections') return op === 'insert' ? r.requester === me : (r.requester === me || r.addressee === me);
    return false;
  }
  const deny = () => { throw new Error('Sem permissão para esta ação.'); };
  const clone = o => JSON.parse(JSON.stringify(o));
  const wait = () => new Promise(r => setTimeout(r, 60));

  // "gatilhos" equivalentes aos do banco
  function after(t, row) {
    if (t === 'connections' && row.status === 'pendente') {
      const p = D.profiles.find(x => x.id === row.requester);
      D.notifications.push({ id:uid(), user_id:row.addressee, title:'Novo pedido de conexão', body:`${p ? p.name : 'Um membro'} quer se conectar com você.`, link:'#/comunidade/pedidos', read:false, created_at:nowISO() });
    }
    if (t === 'events') D.profiles.forEach(p => D.notifications.push({ id:uid(), user_id:p.id, title:'Novo evento na agenda', body:row.title, link:'#/evento/' + row.id, read:false, created_at:nowISO() }));
  }

  return {
    mode: 'local',
    me: () => me,
    async list(t, { eq, order, desc, limit } = {}) {
      await wait();
      let rows = (D[t] || []).filter(r => canRead(t, r) && matches(r, eq));
      if (order) rows.sort((a, b) => (a[order] > b[order] ? 1 : a[order] < b[order] ? -1 : 0) * (desc ? -1 : 1));
      if (limit) rows = rows.slice(0, limit);
      return clone(rows);
    },
    async count(t, eq) { return (await this.list(t, { eq })).length; },
    async insert(t, row) {
      await wait();
      if (!row.id && keyOf(t)[0] === 'id') row.id = uid();
      if (!row.created_at && t !== 'journey_steps') row.created_at = nowISO();
      if (!canWrite(t, row, 'insert')) deny();
      D[t] = D[t] || []; D[t].push(row); after(t, row); save(); return clone(row);
    },
    async upsert(t, row) {
      await wait();
      const k = keyOf(t), m = Object.fromEntries(k.map(c => [c, row[c]]));
      const ex = (D[t] || []).find(r => matches(r, m));
      if (ex) { if (!canWrite(t, ex, 'update')) deny(); Object.assign(ex, row); save(); return clone(ex); }
      return this.insert(t, row);
    },
    async update(t, m, patch) {
      await wait();
      const rows = (D[t] || []).filter(r => matches(r, m));
      rows.forEach(r => { if (!canWrite(t, r, 'update')) deny(); Object.assign(r, patch); });
      save(); return rows.length;
    },
    async remove(t, m) {
      await wait();
      const rows = (D[t] || []).filter(r => matches(r, m));
      rows.forEach(r => { if (!canWrite(t, r, 'delete')) deny(); });
      D[t] = D[t].filter(r => !rows.includes(r)); save(); return rows.length;
    },
    auth: {
      async signIn(email, pw) {
        await wait();
        const u = D.users.find(x => x.email.toLowerCase() === String(email).trim().toLowerCase());
        if (!u || u.pw !== hash(pw)) throw new Error('E-mail ou senha incorretos.');
        me = u.id; try { localStorage.setItem('cdr:current', me); } catch (e) {}
        return { id: me, email: u.email };
      },
      async signUp({ name, email, pw }) {
        await wait();
        email = String(email).trim().toLowerCase();
        if (D.users.some(x => x.email === email)) throw new Error('Este e-mail já tem cadastro. Entre com sua senha.');
        if (String(pw).length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.');
        const id = uid();
        D.users.push({ id, email, pw: hash(pw) });
        D.profiles.push({ id, name, company:'', segment:'', city:'', avatar:'', headline:'', revenue:'', employees:'', goals:'', member_since:new Date().getFullYear(), created_at:nowISO() });
        D.notifications.push({ id:uid(), user_id:id, title:'Bem-vindo ao Clube do ROI', body:'Sua jornada de entrada começou. Comece pelas boas-vindas.', link:'#/jornada', read:false, created_at:nowISO() });
        save(); me = id; try { localStorage.setItem('cdr:current', me); } catch (e) {}
        return { id, email, session: true };
      },
      async signOut() { me = null; try { localStorage.removeItem('cdr:current'); } catch (e) {} },
      async switchTo(acc) { me = acc.id; try { localStorage.setItem('cdr:current', me); } catch (e) {} },
      email: () => (D.users.find(u => u.id === me) || {}).email,
      async magicLink() { throw new Error('Link mágico disponível quando o Supabase estiver conectado.'); },
      async resetDemo() { localStorage.removeItem(K); localStorage.removeItem('cdr:current'); localStorage.removeItem('cdr:accounts'); },
    },
  };
}

/* ============ driver Supabase (produção) ============ */
async function SupabaseDriver(url, key) {
  await new Promise((ok, bad) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js'; s.onload = ok; s.onerror = bad; document.head.appendChild(s); });
  const sb = window.supabase.createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'cdr:sb' } });
  let { data: { session } } = await sb.auth.getSession();
  let me = session ? session.user.id : null;
  sb.auth.onAuthStateChange((_e, s) => { me = s ? s.user.id : null; if (s) Accounts.saveTokens(s); });
  const chk = ({ data, error }) => { if (error) throw new Error(error.message); return data; };
  return {
    mode: 'supabase',
    me: () => me,
    async list(t, { eq, order, desc, limit } = {}) {
      let q = sb.from(t).select('*');
      Object.entries(eq || {}).forEach(([k, v]) => { q = q.eq(k, v); });
      if (order) q = q.order(order, { ascending: !desc });
      if (limit) q = q.limit(limit);
      return chk(await q);
    },
    async count(t, eq) {
      let q = sb.from(t).select('*', { count: 'exact', head: true });
      Object.entries(eq || {}).forEach(([k, v]) => { q = q.eq(k, v); });
      const { count, error } = await q; if (error) throw new Error(error.message); return count;
    },
    async insert(t, row) { return chk(await sb.from(t).insert(row).select().single()); },
    async upsert(t, row) { return chk(await sb.from(t).upsert(row, { onConflict: keyOf(t).join(',') }).select().single()); },
    async update(t, m, patch) { let q = sb.from(t).update(patch); Object.entries(m).forEach(([k, v]) => { q = q.eq(k, v); }); chk(await q.select()); return 1; },
    async remove(t, m) { let q = sb.from(t).delete(); Object.entries(m).forEach(([k, v]) => { q = q.eq(k, v); }); chk(await q); return 1; },
    auth: {
      async signIn(email, pw) { const d = chk(await sb.auth.signInWithPassword({ email, password: pw })); me = d.user.id; Accounts.saveTokens(d.session); return d.user; },
      async signUp({ name, email, pw }) {
        const d = chk(await sb.auth.signUp({ email, password: pw, options: { data: { name }, emailRedirectTo: location.origin + location.pathname } }));
        if (d.session) { me = d.user.id; Accounts.saveTokens(d.session); }
        return { id: d.user && d.user.id, email, session: !!d.session };
      },
      async signOut() { await sb.auth.signOut({ scope: 'local' }); me = null; },
      async switchTo(acc) {
        if (!acc.tokens) throw new Error('Sessão expirada. Entre novamente nesta conta.');
        const d = chk(await sb.auth.setSession(acc.tokens)); me = d.user.id;
      },
      email: () => null,
      async magicLink(email) { chk(await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } })); },
      async resetDemo() {},
    },
    sb,
  };
}

/* ============ multi-login (várias contas no mesmo aparelho) ============ */
const Accounts = {
  all() { try { return JSON.parse(localStorage.getItem('cdr:accounts')) || []; } catch (e) { return []; } },
  set(a) { try { localStorage.setItem('cdr:accounts', JSON.stringify(a)); } catch (e) {} },
  remember(p, email) { const a = this.all().filter(x => x.id !== p.id); a.unshift({ id: p.id, name: p.name, avatar: p.avatar && !String(p.avatar).startsWith('data:') ? p.avatar : '', email, tokens: (this.all().find(x => x.id === p.id) || {}).tokens || this._pending }); this.set(a.slice(0, 6)); },
  saveTokens(s) { this._pending = { access_token: s.access_token, refresh_token: s.refresh_token }; const a = this.all(); const x = a.find(y => y.id === s.user.id); if (x) { x.tokens = this._pending; this.set(a); } },
  forget(id) { this.set(this.all().filter(x => x.id !== id)); },
};

/* ============ estado do app ============ */
let db;
const S = { me: null, profile: null, roles: [], unread: 0, route: '', installEvt: null };
const isAdmin = () => S.roles.includes('admin');
const isMentor = () => S.roles.includes('mentor');

async function loadMe() {
  const id = db.me();
  if (!id) { S.me = null; S.profile = null; return; }
  S.me = id;
  const [p] = await db.list('profiles', { eq: { id } });
  S.profile = p || { id, name: 'Membro' };
  S.roles = (await db.list('user_roles', { eq: { user_id: id } })).map(r => r.role);
  S.unread = (await db.list('notifications', { eq: { user_id: id, read: false } })).length;
  Accounts.remember(S.profile, db.auth.email() || (Accounts.all().find(a => a.id === id) || {}).email);
}

/* Jornada: calcula status de cada etapa para o membro atual */
async function journey(userId = S.me) {
  const [steps, mine] = await Promise.all([db.list('journey_steps', { order: 'ord' }), db.list('member_steps', { eq: { user_id: userId } })]);
  const doneIds = new Set(mine.filter(m => m.status === 'concluida').map(m => m.step_id));
  let current = null;
  const list = steps.map(s => {
    let status = doneIds.has(s.id) ? 'done' : 'locked';
    if (status !== 'done' && !current) { status = 'current'; current = s; }
    return { ...s, status, completed_at: (mine.find(m => m.step_id === s.id) || {}).completed_at };
  });
  const done = list.filter(s => s.status === 'done').length;
  return { steps: list, current, done, total: list.length, pct: list.length ? Math.round(done * 100 / list.length) : 0 };
}
async function completeStep(key, silent) {
  const j = await journey();
  const s = j.steps.find(x => x.key === key);
  if (!s || s.status === 'done') return false;
  await db.upsert('member_steps', { user_id: S.me, step_id: s.id, status: 'concluida', completed_at: nowISO() });
  const nxt = j.steps.find(x => x.ord > s.ord && x.status !== 'done');
  if (nxt) { await db.insert('notifications', { user_id: S.me, title: 'Etapa liberada', body: `${nxt.title} está disponível na sua jornada.`, link: '#/jornada', read: false }); S.unread++; }
  if (!silent) toast(`Etapa concluída: ${s.title} ✓`);
  return true;
}

/* ============ navegação ============ */
const NAV = [
  ['', 'Dashboard', 'home'], ['jornada', 'Minha Jornada', 'compass'], ['perfil', 'Meu Perfil Empresarial', 'user'],
  ['diagnosticos', 'Diagnósticos', 'diag'], ['biblioteca', 'Biblioteca', 'book'], ['mentores', 'Mentores', 'mentor'],
  ['comunidade', 'Comunidade', 'users'], ['agenda', 'Agenda', 'cal'], ['plano', 'Meu Plano', 'plan'], ['relatorios', 'Relatórios', 'chart'],
];
const BNAV = [['', 'Início', 'home'], ['jornada', 'Jornada', 'compass'], ['agenda', 'Agenda', 'cal'], ['comunidade', 'Comunidade', 'users']];

function shell(content, sec) {
  const p = S.profile;
  const on = k => (sec === k ? 'on' : '');
  return `
  <div class="shell">
    <aside class="side" aria-label="Menu principal">
      ${BRAND_()}
      <nav>
        ${NAV.map(([k, l, i]) => `<a href="#/${k}" class="${on(k)}">${I(i)}<span>${l}</span></a>`).join('')}
        ${isAdmin() ? `<a href="#/admin" class="${on('admin')}">${I('shield')}<span>Administração</span></a>` : ''}
        <div class="sep"></div>
        <a href="#/suporte" class="${on('suporte')}">${I('help')}<span>Suporte</span></a>
        <a href="#/config" class="${on('config')}">${I('gear')}<span>Configurações</span></a>
        <button data-act="logout">${I('out')}<span>Sair</span></button>
      </nav>
      <div class="tag">Um ecossistema<br>para ir ainda mais longe.</div>
    </aside>
    <div class="wrap">
      <header class="top">
        ${BRAND_()}
        <form class="search" data-form="search" role="search">${I('search')}<input name="q" placeholder="Buscar no Clube do ROI..." aria-label="Buscar"></form>
        <a class="iconbtn" href="#/notificacoes" aria-label="Notificações">${I('bell')}${S.unread ? `<span class="badge">${S.unread > 9 ? '9+' : S.unread}</span>` : ''}</a>
        <button class="userchip" data-act="account" aria-label="Conta">${AV(p)}<span class="ut"><b>${esc(p.name)}</b><small>Membro desde ${esc(p.member_since || new Date().getFullYear())}</small></span><span class="ut">${I('down')}</span></button>
      </header>
      <main class="main" id="main">${content}</main>
    </div>
    <nav class="bnav" aria-label="Navegação">
      ${BNAV.map(([k, l, i]) => `<a href="#/${k}" class="${on(k)}">${I(i)}<span>${l}</span></a>`).join('')}
      <button data-act="more" class="${['', 'jornada', 'agenda', 'comunidade'].includes(sec) ? '' : 'on'}">${I('more')}<span>Mais</span></button>
    </nav>
  </div>`;
}

function sheet(html, onMount) {
  closeSheet();
  const d = document.createElement('div');
  d.className = 'scrim'; d.id = 'scrim';
  d.innerHTML = `<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  d.addEventListener('click', e => { if (e.target === d) closeSheet(); });
  document.body.appendChild(d);
  document.body.style.overflow = 'hidden';
  onMount && onMount(d);
  const f = d.querySelector('input,button,a'); f && f.focus({ preventScroll: true });
}
function closeSheet() { const s = $('#scrim'); if (s) s.remove(); document.body.style.overflow = ''; }

/* ============ telas ============ */
const V = {};

V.login = async (mode = 'entrar') => {
  const local = db.mode === 'local';
  const accs = Accounts.all();
  return `
  <div class="auth">
    <div class="auth-art">${BRAND_()}</div>
    <div class="auth-form">
      <h1>${mode === 'cadastro' ? 'Criar sua conta' : 'Bem-vindo de volta.'}</h1>
      <p class="muted" style="margin:6px 0 22px">${mode === 'cadastro' ? 'Entre para o ecossistema do Clube do ROI.' : 'Acesse sua jornada, agenda e conexões.'}</p>
      <form data-form="${mode === 'cadastro' ? 'signup' : 'signin'}" novalidate>
        ${mode === 'cadastro' ? `<div class="field"><label for="nm">Nome completo</label><input class="input" id="nm" name="name" autocomplete="name" required></div>` : ''}
        <div class="field"><label for="em">E-mail</label><input class="input" id="em" name="email" type="email" autocomplete="email" inputmode="email" required></div>
        <div class="field"><label for="pw">Senha</label><input class="input" id="pw" name="pw" type="password" autocomplete="${mode === 'cadastro' ? 'new-password' : 'current-password'}" required minlength="6"></div>
        <button class="btn gold block" type="submit">${mode === 'cadastro' ? 'Criar conta' : 'Entrar'} ${I('arrow')}</button>
      </form>
      <div class="row" style="justify-content:space-between;margin-top:14px;flex-wrap:wrap;gap:6px">
        ${mode === 'cadastro' ? `<a class="link" href="#/login">Já tenho conta</a>` : `<a class="link" href="#/cadastro">Criar conta</a>`}
        ${!local ? `<button class="link" data-act="magic">Entrar com link no e-mail</button>` : ''}
      </div>
      ${accs.length && mode !== 'cadastro' ? `<p class="muted" style="margin:22px 0 8px;font-size:13px">Contas neste aparelho</p><div class="demo-acc">${accs.map(a => `<button data-act="quick" data-id="${esc(a.id)}">${AV(a, 'sm')}<span class="grow"><b style="display:block;font-size:14px">${esc(a.name)}</b><small class="muted">${esc(a.email || '')}</small></span>${I('right')}</button>`).join('')}</div>` : ''}
      ${local && mode !== 'cadastro' ? `
      <div class="notice" style="margin-top:22px"><b class="gold">Modo demonstração.</b> Os dados ficam só neste navegador. Entre com uma das contas de teste:</div>
      <div class="demo-acc">
        <button data-act="demo" data-e="ricardo@clubedoroi.com.br" data-p="roi2025">${AV({ name:'Ricardo Almeida', avatar:'img/av-ricardo.jpg' }, 'sm')}<span class="grow"><b style="display:block;font-size:14px">Ricardo Almeida · Membro</b><small class="muted">ricardo@clubedoroi.com.br · roi2025</small></span></button>
        <button data-act="demo" data-e="mentor@clubedoroi.com.br" data-p="mentor2025">${AV({ name:'Helena Duarte', avatar:'img/av2.jpg' }, 'sm')}<span class="grow"><b style="display:block;font-size:14px">Helena Duarte · Mentora</b><small class="muted">mentor@clubedoroi.com.br · mentor2025</small></span></button>
        <button data-act="demo" data-e="admin@clubedoroi.com.br" data-p="admin2025">${AV({ name:'Equipe ROI' }, 'sm')}<span class="grow"><b style="display:block;font-size:14px">Equipe · Administrador</b><small class="muted">admin@clubedoroi.com.br · admin2025</small></span></button>
      </div>` : ''}
    </div>
  </div>`;
};

V.dashboard = async () => {
  const [j, events, materials, profiles, conns] = await Promise.all([
    journey(), db.list('events', { order: 'starts_at' }), db.list('materials', { order: 'published_at', desc: true, limit: 2 }),
    db.list('profiles'), db.list('connections'),
  ]);
  const upcoming = events.filter(e => new Date(e.starts_at) > Date.now());
  const accepted = conns.filter(c => c.status === 'aceita');
  const friendIds = accepted.map(c => (c.requester === S.me ? c.addressee : c.requester));
  const friends = profiles.filter(p => friendIds.includes(p.id));
  const nxt = j.current;
  return `
  <section class="hero">
    <div>
      <h1>Bem-vindo, <span class="gold">${esc(first(S.profile.name))}.</span></h1>
      <p>Você agora faz parte de um ecossistema criado para ampliar perspectivas, construir conexões estratégicas e identificar novas oportunidades de crescimento.</p>
      <a class="btn line" href="${nxt ? nxt.route : '#/jornada'}">Continuar minha jornada ${I('arrow')}</a>
    </div>
    <a class="journey-card" href="#/jornada" aria-label="Sua jornada de entrada: ${j.pct}%">
      <b style="font-weight:600">Sua jornada de entrada</b>
      <div class="pct">${j.pct}%</div>
      <div class="progress"><i style="width:${j.pct}%"></i></div>
      <p class="muted" style="margin-top:14px;font-size:14px">${nxt ? 'Próxima etapa:' : 'Jornada concluída 🎉'}</p>
      ${nxt ? `<div class="next"><span class="ring">${I('arrow')}</span>${esc(nxt.title)}</div>` : ''}
    </a>
  </section>

  <div class="kpis">
    <a class="kpi" href="#/jornada">${I('rocket')}<span><b>${j.total}</b><small>Etapas da sua jornada</small></span></a>
    <a class="kpi" href="#/agenda">${I('cal')}<span><b>${upcoming.length}</b><small>Próximos eventos</small></span></a>
    <a class="kpi" href="#/comunidade">${I('users')}<span><b>${profiles.length}</b><small>Membros no clube</small></span></a>
    <a class="kpi" href="#/comunidade/rede">${I('star')}<span><b>${accepted.length}</b><small>Suas conexões</small></span></a>
  </div>

  <div class="dash">
    <section class="card c8">
      <div class="card-h"><h2 class="bar-t">Seu próximo passo</h2></div>
      ${nxt ? `
      <div class="next-step">
        <div class="ph" style="background-image:url(img/xadrez.jpg)" role="img" aria-label=""></div>
        <div>
          <h3>Etapa ${String(nxt.ord).padStart(2, '0')} — ${esc(nxt.title)}</h3>
          <p>${esc(nxt.description)}</p>
          <div class="acts">
            <span class="muted row" style="gap:6px;font-size:13px">${I('clock')} ${nxt.minutes} min</span>
            <a class="link" href="#/jornada" style="text-decoration:underline">Ver detalhes ${I('arrow')}</a>
            <a class="btn gold" style="margin-left:auto" href="${nxt.key === 'boas-vindas' ? '#/jornada/boas-vindas' : nxt.route}">Continuar etapa</a>
          </div>
        </div>
      </div>` : `<div class="empty">${I('star')}<p>Você concluiu todas as etapas da jornada de entrada.</p><a class="btn line sm" style="margin-top:12px" href="#/plano">Ver meu plano</a></div>`}
    </section>

    <section class="card c4">
      <div class="card-h"><h2 class="bar-t">Próximos encontros</h2><a class="link" href="#/agenda">Ver todos ${I('arrow')}</a></div>
      ${upcoming.length ? `<div class="hscroll">${upcoming.slice(0, 4).map(evCard).join('')}</div>` : `<div class="empty">${I('cal')}<p>Nenhum encontro agendado.</p></div>`}
    </section>

    <section class="card c4">
      <div class="card-h"><h2>Sua evolução</h2></div>
      ${evolutionChart(j)}
    </section>

    <section class="card c4">
      <div class="card-h"><h2>Últimos materiais</h2><a class="link" href="#/biblioteca" style="text-decoration:underline">Ver biblioteca ${I('arrow')}</a></div>
      <div class="list">${materials.map(matRow).join('') || `<p class="muted">Nenhum material ainda.</p>`}</div>
    </section>

    <section class="card c4">
      <div class="card-h"><h2>Sua rede de conexões</h2><a class="link" href="#/comunidade/rede">Ver todos ${I('arrow')}</a></div>
      <div class="faces">${friends.slice(0, 5).map(f => `<a href="#/membro/${esc(f.id)}" title="${esc(f.name)}">${AV(f)}</a>`).join('')}${friends.length > 5 ? `<span class="more">+${friends.length - 5}</span>` : ''}${profiles.length - 1 - friends.length > 0 ? `<a class="more" href="#/comunidade" aria-label="Encontrar membros">+${profiles.length - 1 - friends.length}</a>` : ''}</div>
      <p class="muted" style="font-size:14px">Conecte-se com outros membros e amplie suas oportunidades.</p>
      <div style="text-align:right;margin-top:14px"><a class="btn gold sm" href="#/comunidade">Explorar rede</a></div>
    </section>
  </div>`;
};

function evCard(e) {
  const d = new Date(e.starts_at);
  return `<a class="ev" href="#/evento/${esc(e.id)}">
    <div class="date"><b>${String(d.getDate()).padStart(2, '0')}</b><small>${MES[d.getMonth()]}</small></div>
    <div class="body"><h4>${esc(e.title)}</h4><span class="meta">${DOW[d.getDay()]} · ${fmtHora(d)}</span>
      <span class="loc">${I('pin')} ${esc(e.place)} · ${esc(e.mode.split('·')[0].trim())}</span></div>
    ${e.cover ? `<div class="cover" style="background-image:url(${esc(e.cover)})"></div>` : ''}
  </a>`;
}
function matRow(m) {
  const ic = m.kind === 'Vídeo' ? 'play' : m.kind === 'Link' ? 'link' : 'pdf';
  return `<a class="mat" href="#/material/${esc(m.id)}">
    <span class="th" style="${m.cover ? `background-image:url(${esc(m.cover)})` : ''}">${m.cover && m.kind !== 'Vídeo' ? '' : I(ic)}</span>
    <span class="grow" style="min-width:0"><b>${esc(m.title)}</b><small>${esc(m.kind)} · ${esc(m.size)} · ${fmtData(m.published_at)}</small></span>
  </a>`;
}
function evolutionChart(j) {
  // % acumulado ao fim de cada um dos últimos 6 meses
  const now = new Date(), pts = [];
  for (let i = 5; i >= 0; i--) {
    const mo = new Date(now.getFullYear(), now.getMonth() - i, 1), end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const n = j.steps.filter(s => s.status === 'done' && s.completed_at && new Date(s.completed_at) < end).length;
    const ml = MES[mo.getMonth()];
    pts.push({ l: ml[0] + ml.slice(1).toLowerCase(), v: j.total ? Math.round(n * 100 / j.total) : 0 });
  }
  pts[pts.length - 1].v = j.pct;
  const W = 320, H = 170, L = 36, R = 12, T = 16, B = 26;
  const x = i => L + i * (W - L - R) / (pts.length - 1), y = v => T + (H - T - B) * (1 - v / 100);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(' ');
  const area = `${line} L${x(pts.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
  const lx = x(pts.length - 1), ly = y(j.pct);
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolução da jornada: ${pts.map(p => p.l + ' ' + p.v + '%').join(', ')}">
    <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4b483" stop-opacity=".35"/><stop offset="1" stop-color="#d4b483" stop-opacity="0"/></linearGradient></defs>
    ${[0, 50, 100].map(v => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="rgba(255,255,255,.07)"/><text x="0" y="${y(v) + 4}">${v}%</text>`).join('')}
    <path d="${area}" fill="url(#ga)"/><path d="${line}" fill="none" stroke="#d4b483" stroke-width="2"/>
    ${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.v)}" r="3" fill="#d4b483"/><text x="${x(i)}" y="${H - 6}" text-anchor="middle">${p.l}</text>`).join('')}
    <line x1="${lx}" x2="${lx}" y1="${ly}" y2="${y(0)}" stroke="rgba(212,180,131,.35)"/>
    <circle cx="${lx}" cy="${ly}" r="6" fill="#fff" stroke="#d4b483" stroke-width="3"/>
    <rect x="${lx - 44}" y="${Math.max(0, ly - 30)}" width="40" height="22" rx="6" fill="#0d1424" stroke="rgba(212,180,131,.5)"/>
    <text x="${lx - 24}" y="${Math.max(0, ly - 30) + 15}" text-anchor="middle" style="fill:#eef0f5;font-weight:600">${j.pct}%</text>
  </svg>`;
}

V.jornada = async (arg) => {
  const j = await journey();
  if (arg === 'boas-vindas') setTimeout(() => ACT.welcome(), 50);
  return `
  <div class="page-h"><h1>Minha Jornada</h1><p>Sua jornada de entrada no clube: ${j.done} de ${j.total} etapas concluídas.</p></div>
  <div class="card glow" style="margin-bottom:18px"><div class="row"><div class="grow"><b>Progresso</b><div class="progress" style="margin-top:10px"><i style="width:${j.pct}%"></i></div></div><span class="serif gold" style="font-size:38px">${j.pct}%</span></div></div>
  <div class="timeline">
    ${j.steps.map(s => `
    <div class="tl-item ${s.status}">
      <div class="tl-dot">${s.status === 'done' ? I('check') : s.status === 'locked' ? I('lock') : String(s.ord).padStart(2, '0')}</div>
      <div class="card tl-card ${s.status === 'current' ? 'glow' : ''}">
        <div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap">
          <span class="dim" style="font-size:12px;letter-spacing:.06em">ETAPA ${String(s.ord).padStart(2, '0')}</span>
          ${s.status === 'done' ? `<span class="chip ok">${I('check')} Concluída ${s.completed_at ? 'em ' + fmtData(s.completed_at) : ''}</span>` : s.status === 'current' ? `<span class="chip gold">Em andamento</span>` : `<span class="chip">Bloqueada</span>`}
        </div>
        <h3 style="margin-top:6px">${esc(s.title)}</h3>
        <p>${esc(s.description)}</p>
        <div class="acts">
          <span class="muted row" style="gap:6px;font-size:13px">${I('clock')} ${s.minutes} min</span>
          ${s.status === 'current' ? `<a class="btn gold sm" href="${s.key === 'boas-vindas' ? '#/jornada/boas-vindas' : esc(s.route)}">${esc(s.label || 'Continuar')}</a>
            ${!['perfil', 'diagnostico', 'plano'].includes(s.key) ? `<button class="btn ghost sm" data-act="done-step" data-k="${esc(s.key)}">Marcar como concluída</button>` : ''}` : ''}
          ${s.status === 'done' && s.route && s.key !== 'boas-vindas' ? `<a class="link" href="${esc(s.route)}">Revisitar ${I('arrow')}</a>` : ''}
        </div>
      </div>
    </div>`).join('')}
  </div>`;
};

const SEGMENTOS = ['Agronegócio','Construção civil','Consultoria estratégica','Educação','Holding e investimentos','Indústria de alimentos','Logística','Mercado imobiliário','Saúde','Serviços financeiros','Tecnologia','Varejo e e-commerce','Outro'];
const FAIXAS = ['Até R$ 1 mi','R$ 1 a 5 mi','R$ 5 a 10 mi','R$ 10 a 50 mi','R$ 50 a 100 mi','Acima de R$ 100 mi'];
const EQUIPES = ['1 a 10','11 a 50','51 a 200','201 a 500','Acima de 500'];
const opt = (arr, v) => `<option value="">Selecione</option>` + arr.map(a => `<option ${a === v ? 'selected' : ''}>${esc(a)}</option>`).join('');

V.perfil = async () => {
  const p = S.profile;
  return `
  <div class="page-h"><h1>Meu Perfil Empresarial</h1><p>Essas informações ajudam o clube a te conectar com as pessoas e oportunidades certas.</p></div>
  <form class="card" data-form="profile">
    <div class="row" style="margin-bottom:18px">
      ${AV(p, 'lg')}
      <div><label class="btn ghost sm" for="avf">${I('edit')} Trocar foto</label><input id="avf" type="file" accept="image/*" class="sr" data-act="avatar"><p class="dim" style="font-size:12px;margin-top:6px">JPG ou PNG</p></div>
    </div>
    <div class="grid2">
      <div class="field"><label for="f1">Nome completo</label><input class="input" id="f1" name="name" value="${esc(p.name)}" required></div>
      <div class="field"><label for="f2">Cargo / apresentação curta</label><input class="input" id="f2" name="headline" value="${esc(p.headline)}" placeholder="Ex.: Fundador · Empresa X"></div>
      <div class="field"><label for="f3">Empresa</label><input class="input" id="f3" name="company" value="${esc(p.company)}" required></div>
      <div class="field"><label for="f4">Segmento</label><select class="input" id="f4" name="segment" required>${opt(SEGMENTOS, p.segment)}</select></div>
      <div class="field"><label for="f5">Faturamento anual</label><select class="input" id="f5" name="revenue">${opt(FAIXAS, p.revenue)}</select></div>
      <div class="field"><label for="f6">Número de colaboradores</label><select class="input" id="f6" name="employees">${opt(EQUIPES, p.employees)}</select></div>
      <div class="field"><label for="f7">Cidade/UF</label><input class="input" id="f7" name="city" value="${esc(p.city)}" placeholder="São Paulo/SP" required></div>
      <div class="field"><label for="f8">WhatsApp (visível só para suas conexões)</label><input class="input" id="f8" name="phone" value="${esc(p.phone || '')}" inputmode="tel" placeholder="(11) 90000-0000"></div>
    </div>
    <div class="field"><label for="f9">Objetivos para os próximos 12 meses</label><textarea class="input" id="f9" name="goals" placeholder="O que você quer conquistar com o clube?">${esc(p.goals)}</textarea></div>
    <button class="btn gold block" type="submit">Salvar perfil</button>
  </form>`;
};

const AREAS = ['Estratégia','Vendas','Marketing','Finanças','Pessoas','Processos','Tecnologia','Liderança'];
const PERG = {
  'Estratégia':'Temos metas anuais claras, conhecidas pelo time e acompanhadas mensalmente.',
  'Vendas':'Nosso processo comercial é previsível: sabemos de onde vêm os clientes e quanto custa conquistá-los.',
  'Marketing':'Temos posicionamento claro e geramos demanda de forma constante, sem depender de indicação.',
  'Finanças':'Conhecemos margem por produto, fluxo de caixa projetado e temos reserva para 6 meses.',
  'Pessoas':'Temos líderes preparados abaixo dos sócios e um plano para reter talentos-chave.',
  'Processos':'As operações principais estão documentadas e funcionam sem a presença do dono.',
  'Tecnologia':'Usamos sistemas integrados e dados para tomar decisões no dia a dia.',
  'Liderança':'Os sócios dedicam a maior parte do tempo a estratégia, não à operação.',
};
V.diagnosticos = async (arg) => {
  const list = await db.list('diagnostics', { eq: { user_id: S.me }, order: 'created_at', desc: true });
  if (arg === 'novo' || !list.length) {
    return `
    <div class="page-h"><h1>Diagnóstico Empresarial</h1><p>Responda de 1 (discordo totalmente) a 5 (concordo totalmente). Leva cerca de 5 minutos. Só você e a equipe do clube veem as respostas.</p></div>
    <form class="card" data-form="diag">
      ${AREAS.map((a, i) => `<div class="q"><span class="chip gold" style="margin-bottom:8px">${a}</span><b>${i + 1}. ${PERG[a]}</b>
        <div class="scale" role="radiogroup" aria-label="${a}">${[1, 2, 3, 4, 5].map(n => `<button type="button" role="radio" aria-checked="false" data-act="scale" data-a="${a}" data-v="${n}">${n}</button>`).join('')}</div>
        <div class="scale-l"><span>Discordo</span><span>Concordo</span></div><input type="hidden" name="${a}"></div>`).join('')}
      <button class="btn gold block" type="submit">Ver meu resultado</button>
    </form>`;
  }
  const d = list[0];
  return `
  <div class="page-h"><h1>Diagnósticos</h1><p>Último diagnóstico em ${fmtData(d.created_at)}.</p></div>
  <div class="split">
    <section class="card glow" style="margin-bottom:14px">
      <div class="card-h"><h2>Resultado geral</h2><span class="serif gold" style="font-size:40px">${d.total}%</span></div>
      ${diagBars(d.scores)}
      <div class="row" style="gap:10px;margin-top:16px;flex-wrap:wrap"><a class="btn gold" href="#/plano">Ver plano de crescimento</a><a class="btn ghost" href="#/diagnosticos/novo">Refazer diagnóstico</a></div>
    </section>
    <section class="card">
      <div class="card-h"><h2>Maiores alavancas</h2></div>
      <div class="list">${weakest(d.scores).map(a => `<div class="row" style="align-items:flex-start">${I('target', 'gold')}<div><b>${a}</b><p class="muted" style="font-size:14px">${DICA[a]}</p></div></div>`).join('')}</div>
      ${list.length > 1 ? `<div class="card-h" style="margin-top:20px"><h3>Histórico</h3></div>${list.map(x => `<div class="row" style="justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line2)"><span>${fmtData(x.created_at)}</span><b class="gold">${x.total}%</b></div>`).join('')}` : ''}
    </section>
  </div>`;
};
const DICA = {
  'Estratégia':'Defina 3 metas do ano e um ritual mensal de acompanhamento com os sócios.',
  'Vendas':'Mapeie o funil, meça conversão por etapa e crie metas por canal.',
  'Marketing':'Clareie o posicionamento e crie uma rotina de geração de demanda própria.',
  'Finanças':'Implante DRE gerencial mensal e projeção de caixa de 13 semanas.',
  'Pessoas':'Identifique sucessores para cada função-chave e crie um plano de desenvolvimento.',
  'Processos':'Documente os 5 processos que mais dependem de você.',
  'Tecnologia':'Integre vendas, financeiro e operação em um painel único de indicadores.',
  'Liderança':'Bloqueie na agenda 1 dia por semana só para estratégia.',
};
const weakest = sc => Object.entries(sc).sort((a, b) => a[1] - b[1]).slice(0, 3).map(x => x[0]);
const diagBars = sc => AREAS.map(a => `<div class="hbar"><span>${a}</span><div class="progress"><i style="width:${sc[a] * 20}%"></i></div><b>${sc[a]}/5</b></div>`).join('');

V.plano = async () => {
  const [[plan], [diag]] = await Promise.all([db.list('plans', { eq: { user_id: S.me } }), db.list('diagnostics', { eq: { user_id: S.me }, order: 'created_at', desc: true, limit: 1 })]);
  let goals = plan ? plan.goals : null;
  if (!goals && diag) goals = weakest(diag.scores).map(a => ({ text: `${a}: ${DICA[a]}`, done: false }));
  goals = goals || [];
  const done = goals.filter(g => g.done).length;
  return `
  <div class="page-h"><h1>Meu Plano</h1><p>Metas para os próximos 90 dias. Privado: só você e a equipe do clube têm acesso.</p></div>
  ${!diag && !plan ? `<div class="notice" style="margin-bottom:14px">Faça o <a class="gold" href="#/diagnosticos" style="text-decoration:underline">Diagnóstico Empresarial</a> para receber sugestões de metas automaticamente.</div>` : ''}
  <form class="card glow" data-form="plan">
    <div class="field"><label for="pf">Foco principal do trimestre</label><input class="input" id="pf" name="focus" value="${esc(plan ? plan.focus : '')}" placeholder="Ex.: estruturar o comercial para dobrar a receita recorrente"></div>
    <div class="card-h" style="margin-top:6px"><h3>Metas ${goals.length ? `<span class="muted" style="font-weight:400;font-size:14px">· ${done}/${goals.length} concluídas</span>` : ''}</h3></div>
    <div class="list" id="goals">
      ${goals.map((g, i) => goalRow(g, i)).join('')}
    </div>
    <div class="row" style="margin-top:12px"><input class="input" id="newgoal" placeholder="Adicionar meta..." aria-label="Nova meta"><button class="btn line" type="button" data-act="add-goal" aria-label="Adicionar">${I('plus')}</button></div>
    <button class="btn gold block" type="submit" style="margin-top:18px">Salvar plano</button>
  </form>`;
};
const goalRow = (g, i) => `<label class="row" style="padding:10px 12px;border:1px solid var(--line2);border-radius:12px;gap:12px">
  <input type="checkbox" name="g${i}" ${g.done ? 'checked' : ''} style="width:22px;height:22px;accent-color:#c9a96e">
  <input class="grow" name="t${i}" value="${esc(g.text)}" style="background:none;border:0;outline:none;font-size:15px;min-width:0" aria-label="Meta ${i + 1}">
  <button type="button" class="iconbtn" style="width:36px;height:36px" data-act="del-goal" aria-label="Remover meta">${I('x')}</button></label>`;

V.biblioteca = async () => {
  const mats = await db.list('materials', { order: 'published_at', desc: true });
  const cats = [...new Set(mats.map(m => m.category))];
  return `
  <div class="page-h"><h1>Biblioteca</h1><p>Guias, aulas e ferramentas selecionadas pelo clube.</p></div>
  <div class="tabs" role="tablist"><button class="on" data-act="filter" data-f="">Todos</button>${cats.map(c => `<button data-act="filter" data-f="${esc(c)}">${esc(c)}</button>`).join('')}</div>
  <div class="card"><div class="list" id="flist">${mats.map(m => `<div data-cat="${esc(m.category)}">${matRow(m)}</div>`).join('') || `<div class="empty">${I('book')}<p>A biblioteca está vazia.</p></div>`}</div></div>`;
};
V.material = async (id) => {
  const [m] = await db.list('materials', { eq: { id } });
  if (!m) return notFound();
  const j = await journey();
  if (j.current && j.current.key === 'biblioteca') await completeStep('biblioteca');
  return `
  <a class="link" href="#/biblioteca">${I('left')} Biblioteca</a>
  <div class="card glow" style="margin-top:12px">
    ${m.cover ? `<div class="event-hero" style="background-image:url(${esc(m.cover)});aspect-ratio:16/7"></div>` : ''}
    <span class="chip gold">${esc(m.category)}</span>
    <h1 class="serif" style="font-size:32px;margin:10px 0 6px">${esc(m.title)}</h1>
    <p class="muted">${esc(m.kind)} · ${esc(m.size)} · publicado em ${fmtData(m.published_at)}</p>
    <div style="margin-top:18px">${m.url ? `<a class="btn gold" href="${esc(m.url)}" target="_blank" rel="noopener">${m.kind === 'Vídeo' ? 'Assistir' : m.kind === 'Link' ? 'Abrir' : 'Baixar'} ${I('arrow')}</a>` : `<p class="notice">O arquivo deste material será adicionado pela equipe do clube.</p>`}</div>
  </div>`;
};

V.agenda = async () => {
  const [events, rs] = await Promise.all([db.list('events', { order: 'starts_at' }), db.list('rsvps', { eq: { user_id: S.me } })]);
  const mine = new Set(rs.map(r => r.event_id));
  const up = events.filter(e => new Date(e.starts_at) > Date.now() - 864e5);
  return `
  <div class="page-h"><h1>Agenda</h1><p>Encontros, masterclasses e mentorias do clube.</p></div>
  <div class="cal card" style="margin-bottom:18px">${calendar(events, mine)}</div>
  <div class="tabs"><button class="on" data-act="agtab" data-f="all">Próximos</button><button data-act="agtab" data-f="mine">Confirmados (${[...mine].filter(id => up.some(e => e.id === id)).length})</button></div>
  <div class="list" id="aglist">${up.map(e => `<div data-mine="${mine.has(e.id) ? 1 : 0}">${evCard(e)}</div>`).join('') || `<div class="empty">${I('cal')}<p>Nenhum evento agendado.</p></div>`}</div>`;
};
function calendar(events, mine) {
  const ref = new Date(S.calRef || Date.now());
  const y = ref.getFullYear(), m = ref.getMonth();
  const start = new Date(y, m, 1 - new Date(y, m, 1).getDay());
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const evs = events.filter(e => new Date(e.starts_at).toDateString() === d.toDateString());
    cells.push(`<div class="d ${d.getMonth() !== m ? 'out' : ''} ${d.toDateString() === new Date().toDateString() ? 'today' : ''}">${d.getDate()}${evs.map(e => `<a class="e" href="#/evento/${esc(e.id)}" title="${esc(e.title)}">${mine.has(e.id) ? '✓ ' : ''}${fmtHora(new Date(e.starts_at))} ${esc(e.title)}</a>`).join('')}</div>`);
  }
  return `<div class="card-h"><h2>${MES_L[m]} ${y}</h2><div class="row"><button class="iconbtn" data-act="cal" data-d="-1" aria-label="Mês anterior">${I('left')}</button><button class="iconbtn" data-act="cal" data-d="1" aria-label="Próximo mês">${I('right')}</button></div></div>
  <div class="cal-grid">${['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(d => `<div class="dow">${d}</div>`).join('')}${cells.join('')}</div>`;
}
V.evento = async (id) => {
  const [[e], rs] = await Promise.all([db.list('events', { eq: { id } }), db.list('rsvps', { eq: { event_id: id } })]);
  if (!e) return notFound();
  const going = rs.some(r => r.user_id === S.me);
  const d = new Date(e.starts_at);
  const people = rs.length ? await db.list('profiles') : [];
  const att = people.filter(p => rs.some(r => r.user_id === p.id));
  const free = e.seats ? Math.max(0, e.seats - rs.length) : null;
  return `
  <a class="link" href="#/agenda">${I('left')} Agenda</a>
  <div style="margin-top:12px">
    ${e.cover ? `<div class="event-hero" style="background-image:url(${esc(e.cover)})"></div>` : ''}
    <span class="chip gold">${esc(e.kind)}</span>
    <h1 class="serif" style="font-size:34px;margin:10px 0 0">${esc(e.title)}</h1>
    <div class="info-list">
      <div>${I('cal')} ${DOW[d.getDay()]}, ${d.getDate()} de ${MES_L[d.getMonth()].toLowerCase()} de ${d.getFullYear()}</div>
      <div>${I('clock')} ${fmtHora(d)}</div>
      <div>${I('pin')} ${esc(e.place)} · ${esc(e.mode)}</div>
      ${free !== null ? `<div>${I('users')} ${rs.length} confirmados · ${free} vagas restantes</div>` : ''}
    </div>
    <p style="color:#cfd4de;margin-bottom:18px">${esc(e.description)}</p>
    ${going ? `<div class="row" style="gap:10px;flex-wrap:wrap"><span class="chip ok" style="padding:10px 14px">${I('check')} Presença confirmada</span>${e.link ? `<a class="btn gold" href="${esc(e.link)}" target="_blank" rel="noopener">Acessar sala</a>` : ''}<button class="btn ghost sm" data-act="rsvp" data-id="${esc(e.id)}" data-on="0">Cancelar presença</button></div>`
      : `<button class="btn gold block" data-act="rsvp" data-id="${esc(e.id)}" data-on="1" ${free === 0 ? 'disabled' : ''}>${free === 0 ? 'Vagas esgotadas' : 'Confirmar presença'}</button>`}
    ${att.length ? `<div class="card" style="margin-top:18px"><div class="card-h"><h3>Quem vai</h3></div><div class="faces">${att.slice(0, 12).map(p => `<a href="#/membro/${esc(p.id)}" title="${esc(p.name)}">${AV(p)}</a>`).join('')}</div></div>` : ''}
  </div>`;
};

async function social() {
  const [profiles, conns] = await Promise.all([db.list('profiles', { order: 'name' }), db.list('connections')]);
  const rel = id => conns.find(c => (c.requester === S.me && c.addressee === id) || (c.addressee === S.me && c.requester === id));
  return { profiles, conns, rel };
}
function relBtn(c, id) {
  if (!c) return `<button class="btn line sm" data-act="connect" data-id="${esc(id)}">${I('uplus')} Conectar</button>`;
  if (c.status === 'aceita') return `<a class="btn ghost sm" href="#/mensagens/${esc(id)}">${I('msg')} Mensagem</a>`;
  if (c.requester === S.me) return `<span class="chip">Pedido enviado</span>`;
  return `<button class="btn gold sm" data-act="accept" data-id="${esc(c.id)}">Aceitar</button><button class="btn ghost sm" data-act="decline" data-id="${esc(c.id)}">Recusar</button>`;
}
V.comunidade = async (tab = 'membros') => {
  const { profiles, conns, rel } = await social();
  const others = profiles.filter(p => p.id !== S.me);
  const pend = conns.filter(c => c.status === 'pendente' && c.addressee === S.me);
  const net = others.filter(p => (rel(p.id) || {}).status === 'aceita');
  const segs = [...new Set(others.map(p => p.segment).filter(Boolean))].sort();
  const cities = [...new Set(others.map(p => p.city).filter(Boolean))].sort();
  const item = p => `<div class="card member" data-s="${esc((p.name + ' ' + p.company + ' ' + p.segment + ' ' + p.city).toLowerCase())}" data-seg="${esc(p.segment)}" data-city="${esc(p.city)}">
      <a href="#/membro/${esc(p.id)}">${AV(p)}</a>
      <a class="grow" href="#/membro/${esc(p.id)}" style="min-width:0"><b class="ellip" style="display:block">${esc(p.name)}</b><small class="ellip">${esc(p.company || p.headline)}${p.segment ? ' · ' + esc(p.segment) : ''}</small><small class="ellip">${esc(p.city)}</small></a>
      <div class="row" style="gap:6px;flex-wrap:wrap;justify-content:flex-end">${relBtn(rel(p.id), p.id)}</div>
    </div>`;
  let body;
  if (tab === 'rede') body = net.length ? net.map(item).join('') : `<div class="empty">${I('users')}<p>Você ainda não tem conexões.</p></div>`;
  else if (tab === 'pedidos') body = pend.length ? pend.map(c => item(profiles.find(p => p.id === c.requester) || { id: c.requester, name: 'Membro' })).join('') : `<div class="empty">${I('uplus')}<p>Nenhum pedido pendente.</p></div>`;
  else body = `<div class="grid2" style="gap:10px;margin-bottom:12px">
      <input class="input" placeholder="Buscar por nome, empresa ou cidade" data-act="msearch" aria-label="Buscar membros">
      <div class="row" style="gap:8px"><select class="input" data-act="mseg" aria-label="Segmento"><option value="">Todos os segmentos</option>${segs.map(s => `<option>${esc(s)}</option>`).join('')}</select>
      <select class="input" data-act="mcity" aria-label="Cidade"><option value="">Todas as cidades</option>${cities.map(s => `<option>${esc(s)}</option>`).join('')}</select></div></div>
    <div class="list" id="mlist">${others.map(item).join('')}</div>`;
  return `
  <div class="page-h"><h1>Comunidade</h1><p>${others.length} membros · ${net.length} na sua rede</p></div>
  <div class="tabs">
    <a href="#/comunidade" class="${tab === 'membros' ? 'on' : ''}">Membros</a>
    <a href="#/comunidade/rede" class="${tab === 'rede' ? 'on' : ''}">Minha rede (${net.length})</a>
    <a href="#/comunidade/pedidos" class="${tab === 'pedidos' ? 'on' : ''}">Pedidos${pend.length ? ` (${pend.length})` : ''}</a>
  </div>
  ${tab === 'membros' ? body : `<div class="list">${body}</div>`}`;
};
V.membro = async (id) => {
  const { profiles, rel } = await social();
  const p = profiles.find(x => x.id === id);
  if (!p) return notFound();
  const c = rel(id);
  return `
  <a class="link" href="#/comunidade">${I('left')} Comunidade</a>
  <div class="card glow" style="margin-top:12px;text-align:center">
    <div style="display:flex;justify-content:center">${AV(p, 'lg')}</div>
    <h1 class="serif" style="font-size:30px;margin-top:12px">${esc(p.name)}</h1>
    <p class="muted">${esc(p.headline || p.company)}</p>
    <div class="row" style="justify-content:center;gap:8px;margin:12px 0;flex-wrap:wrap">${p.segment ? `<span class="chip gold">${esc(p.segment)}</span>` : ''}${p.city ? `<span class="chip">${I('pin')} ${esc(p.city)}</span>` : ''}</div>
    ${id !== S.me ? `<div class="row" style="justify-content:center;gap:8px;flex-wrap:wrap">${relBtn(c, id)}</div>` : `<a class="btn ghost sm" href="#/perfil">Editar meu perfil</a>`}
  </div>
  <div class="card" style="margin-top:14px">
    <div class="list">
      <div><small class="dim">Empresa</small><p>${esc(p.company || '—')}</p></div>
      ${p.revenue ? `<div><small class="dim">Faturamento</small><p>${esc(p.revenue)}</p></div>` : ''}
      ${p.employees ? `<div><small class="dim">Colaboradores</small><p>${esc(p.employees)}</p></div>` : ''}
      ${p.goals ? `<div><small class="dim">Objetivos</small><p>${esc(p.goals)}</p></div>` : ''}
      ${c && c.status === 'aceita' && p.phone ? `<div><small class="dim">WhatsApp</small><p><a class="gold" href="https://wa.me/55${esc(String(p.phone).replace(/\D/g, ''))}" target="_blank" rel="noopener">${esc(p.phone)}</a></p></div>` : ''}
    </div>
  </div>`;
};
V.mensagens = async (id) => {
  const { profiles, rel } = await social();
  const all = await db.list('messages', { order: 'created_at' });
  if (!id) {
    const threads = {};
    all.forEach(m => { const o = m.sender === S.me ? m.receiver : m.sender; threads[o] = m; });
    const ids = Object.keys(threads).sort((a, b) => threads[b].created_at.localeCompare(threads[a].created_at));
    return `<div class="page-h"><h1>Mensagens</h1><p>Converse com suas conexões.</p></div>
    <div class="list">${ids.map(o => { const p = profiles.find(x => x.id === o) || { name: 'Membro' }; const m = threads[o]; return `<a class="card member" href="#/mensagens/${esc(o)}">${AV(p)}<span class="grow" style="min-width:0"><b>${esc(p.name)}</b><small class="ellip">${m.sender === S.me ? 'Você: ' : ''}${esc(m.body)}</small></span><small class="dim">${ago(m.created_at)}</small></a>`; }).join('') || `<div class="empty">${I('msg')}<p>Nenhuma conversa. Abra o perfil de uma conexão para enviar mensagem.</p></div>`}</div>`;
  }
  const p = profiles.find(x => x.id === id);
  if (!p) return notFound();
  const c = rel(id);
  const msgs = all.filter(m => (m.sender === id && m.receiver === S.me) || (m.sender === S.me && m.receiver === id));
  setTimeout(() => { const box = $('.msgs'); if (box) box.scrollTop = box.scrollHeight; }, 0);
  return `
  <div class="row" style="margin-bottom:8px"><a class="iconbtn" href="#/mensagens" aria-label="Voltar">${I('left')}</a><a class="row" href="#/membro/${esc(id)}">${AV(p, 'sm')}<b>${esc(p.name)}</b></a></div>
  <div class="chat card" style="padding:12px">
    <div class="msgs">${msgs.map(m => `<div class="bubble ${m.sender === S.me ? 'me' : ''}">${esc(m.body)}<time>${ago(m.created_at)}</time></div>`).join('') || `<p class="muted" style="text-align:center;margin:auto">Diga olá para ${esc(first(p.name))} 👋</p>`}</div>
    ${c && c.status === 'aceita' ? `<form class="composer" data-form="msg" data-to="${esc(id)}"><input class="input" name="body" placeholder="Escreva uma mensagem..." autocomplete="off" aria-label="Mensagem"><button class="btn gold" aria-label="Enviar">${I('send')}</button></form>`
      : `<p class="notice">Vocês precisam estar conectados para trocar mensagens.</p>`}
  </div>`;
};

V.mentores = async () => {
  const [ms, reqs] = await Promise.all([db.list('mentors', { order: 'name' }), db.list('mentor_requests', { eq: { user_id: S.me } })]);
  return `
  <div class="page-h"><h1>Mentores</h1><p>Especialistas do clube disponíveis para sessões individuais.</p></div>
  <div class="list">${ms.map(m => {
    const r = reqs.find(x => x.mentor_id === m.id && x.status !== 'concluida');
    return `<div class="card"><div class="member">${AV(m, 'lg')}<div class="grow"><b style="font-size:17px">${esc(m.name)}</b><small class="gold">${esc(m.specialty)}</small></div></div>
      <p class="muted" style="margin:12px 0">${esc(m.bio)}</p>
      ${r ? `<span class="chip ok">${I('check')} Solicitação enviada · ${esc(r.status)}</span>` : `<button class="btn line sm" data-act="mentor" data-id="${esc(m.id)}" data-n="${esc(m.name)}">${I('cal')} Solicitar mentoria</button>`}</div>`;
  }).join('') || `<div class="empty">${I('mentor')}<p>Nenhum mentor cadastrado.</p></div>`}</div>
  ${isMentor() ? await mentorInbox() : ''}`;
};
async function mentorInbox() {
  const [mine] = await db.list('mentors', { eq: { user_id: S.me } });
  if (!mine) return '';
  return `<div class="notice" style="margin-top:18px">Você é mentora/mentor no clube. As solicitações de mentoria chegam para a equipe, que agenda com você.</div>`;
}

V.relatorios = async () => {
  const [j, rs, conns, diags, events, ms] = await Promise.all([journey(), db.list('rsvps', { eq: { user_id: S.me } }), db.list('connections'), db.list('diagnostics', { eq: { user_id: S.me }, order: 'created_at', desc: true }), db.list('events'), db.list('messages')]);
  const acc = conns.filter(c => c.status === 'aceita').length;
  const past = events.filter(e => rs.some(r => r.event_id === e.id) && new Date(e.starts_at) < Date.now()).length;
  return `
  <div class="page-h"><h1>Relatórios</h1><p>Seu desempenho dentro do clube.</p></div>
  <div class="kpis">
    <div class="kpi">${I('rocket')}<span><b>${j.pct}%</b><small>Jornada concluída</small></span></div>
    <div class="kpi">${I('cal')}<span><b>${rs.length}</b><small>Eventos confirmados${past ? ` · ${past} realizados` : ''}</small></span></div>
    <div class="kpi">${I('users')}<span><b>${acc}</b><small>Conexões</small></span></div>
    <div class="kpi">${I('msg')}<span><b>${ms.length}</b><small>Mensagens trocadas</small></span></div>
  </div>
  <div class="split">
    <section class="card" style="margin-bottom:14px"><div class="card-h"><h2>Evolução da jornada</h2></div>${evolutionChart(j)}</section>
    <section class="card"><div class="card-h"><h2>Último diagnóstico</h2>${diags[0] ? `<b class="gold">${diags[0].total}%</b>` : ''}</div>${diags[0] ? diagBars(diags[0].scores) : `<div class="empty">${I('diag')}<p>Nenhum diagnóstico ainda.</p><a class="btn line sm" style="margin-top:10px" href="#/diagnosticos">Fazer agora</a></div>`}</section>
  </div>`;
};

V.notificacoes = async () => {
  const ns = await db.list('notifications', { eq: { user_id: S.me }, order: 'created_at', desc: true });
  return `
  <div class="page-h row" style="justify-content:space-between;flex-wrap:wrap"><div><h1>Notificações</h1></div>${ns.some(n => !n.read) ? `<button class="btn ghost sm" data-act="readall">Marcar todas como lidas</button>` : ''}</div>
  <div class="list">${ns.map(n => `<a class="card member" href="${esc(n.link || '#/')}" data-act="readone" data-id="${esc(n.id)}" style="${n.read ? 'opacity:.65' : 'border-color:var(--line)'}">
    <span class="avatar">${I(n.title.includes('conexão') ? 'uplus' : n.title.includes('evento') ? 'cal' : 'bell')}</span>
    <span class="grow"><b>${esc(n.title)}</b><small>${esc(n.body)}</small></span><small class="dim">${ago(n.created_at)}</small></a>`).join('') || `<div class="empty">${I('bell')}<p>Nada novo por aqui.</p></div>`}</div>`;
};

V.busca = async (q) => {
  q = decodeURIComponent(q || '').toLowerCase().trim();
  const [ps, ms, es] = await Promise.all([db.list('profiles'), db.list('materials'), db.list('events')]);
  const hit = s => String(s || '').toLowerCase().includes(q);
  const P_ = ps.filter(p => p.id !== S.me && (hit(p.name) || hit(p.company) || hit(p.segment) || hit(p.city)));
  const M_ = ms.filter(m => hit(m.title) || hit(m.category));
  const E_ = es.filter(e => hit(e.title) || hit(e.place));
  return `<div class="page-h"><h1>Busca</h1><p>Resultados para “${esc(q)}”</p></div>
  ${!(P_.length + M_.length + E_.length) ? `<div class="empty">${I('search')}<p>Nada encontrado.</p></div>` : ''}
  ${P_.length ? `<h3 style="margin:10px 0">Membros</h3><div class="list">${P_.map(p => `<a class="card member" href="#/membro/${esc(p.id)}">${AV(p)}<span class="grow"><b>${esc(p.name)}</b><small>${esc(p.company)} · ${esc(p.city)}</small></span></a>`).join('')}</div>` : ''}
  ${E_.length ? `<h3 style="margin:18px 0 10px">Eventos</h3><div class="list">${E_.map(evCard).join('')}</div>` : ''}
  ${M_.length ? `<h3 style="margin:18px 0 10px">Materiais</h3><div class="card">${M_.map(matRow).join('')}</div>` : ''}`;
};

V.config = async () => {
  const accs = Accounts.all();
  const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  return `
  <div class="page-h"><h1>Configurações</h1></div>
  <section class="card" style="margin-bottom:14px">
    <div class="card-h"><h2>Instalar o app</h2></div>
    ${standalone ? `<p class="muted">${I('check', 'gold')} O Clube do ROI já está instalado neste aparelho.</p>`
      : ios ? `<p class="muted">No iPhone: toque em <b>Compartilhar</b> (o quadrado com a seta) e depois em <b>Adicionar à Tela de Início</b>.</p>`
      : `<p class="muted" style="margin-bottom:12px">Tenha o Clube do ROI na tela inicial do celular, como um aplicativo — sem precisar de loja.</p><button class="btn gold" data-act="install">${I('phone')} Instalar app</button>`}
  </section>
  <section class="card" style="margin-bottom:14px">
    <div class="card-h"><h2>Contas conectadas</h2></div>
    <p class="muted" style="font-size:14px;margin-bottom:12px">Use mais de uma conta neste aparelho e alterne sem digitar a senha de novo.</p>
    <div class="list">${accs.map(a => `<div class="member">${AV(a, 'sm')}<span class="grow"><b style="font-size:14px">${esc(a.name)}</b><small>${esc(a.email || '')}</small></span>${a.id === S.me ? `<span class="chip gold">Atual</span>` : `<button class="btn ghost sm" data-act="switch" data-id="${esc(a.id)}">Entrar</button><button class="iconbtn" data-act="forget" data-id="${esc(a.id)}" aria-label="Remover conta">${I('x')}</button>`}</div>`).join('')}</div>
    <button class="btn line sm" style="margin-top:14px" data-act="addacc">${I('plus')} Adicionar outra conta</button>
  </section>
  <section class="card">
    <div class="card-h"><h2>Privacidade</h2></div>
    <p class="muted" style="font-size:14px">Sua jornada, diagnósticos, plano e notificações são privados: outros membros não têm acesso. Perfil público: nome, foto, empresa, segmento e cidade. WhatsApp: só para conexões.</p>
    ${db.mode === 'local' ? `<div class="notice" style="margin-top:14px">Modo demonstração ativo — dados salvos só neste navegador. <button class="link" data-act="reset">Restaurar dados de exemplo</button></div>` : ''}
    <button class="btn danger sm" style="margin-top:14px" data-act="logout">${I('out')} Sair desta conta</button>
  </section>`;
};

V.suporte = async () => `
  <div class="page-h"><h1>Suporte</h1><p>Dúvidas frequentes e contato com a equipe.</p></div>
  <div class="list">
  ${[['Como avanço na minha jornada?', 'Cada etapa é liberada quando a anterior é concluída. Algumas são concluídas automaticamente (perfil, diagnóstico, plano); outras você marca como concluídas na página Minha Jornada.'],
     ['Quem vê meus dados?', 'Diagnósticos, plano e progresso são privados. Outros membros veem apenas seu perfil público.'],
     ['Como instalo o app no celular?', 'Em Configurações › Instalar o app. No iPhone, use Compartilhar › Adicionar à Tela de Início.'],
     ['Posso usar duas contas?', 'Sim. Em Configurações › Contas conectadas você adiciona outra conta e alterna entre elas.']]
    .map(([q, a]) => `<details class="card"><summary style="cursor:pointer;font-weight:600;list-style:none;display:flex;justify-content:space-between;gap:10px">${q}${I('down')}</summary><p class="muted" style="margin-top:10px">${a}</p></details>`).join('')}
  </div>
  <a class="btn gold block" style="margin-top:18px" href="mailto:contato@clubedoroi.com.br?subject=Suporte%20Clube%20do%20ROI">${I('msg')} Falar com a equipe</a>`;

/* ---------- Admin ---------- */
const ADMIN = {
  journey_steps: { label: 'Etapas da jornada', order: 'ord', cols: ['ord', 'title', 'minutes'], fields: [['ord', 'Ordem', 'number'], ['key', 'Chave (ex.: perfil)', 'text'], ['title', 'Título', 'text'], ['description', 'Descrição', 'textarea'], ['minutes', 'Duração (min)', 'number'], ['route', 'Link da ação (ex.: #/agenda)', 'text'], ['label', 'Texto do botão', 'text']] },
  events: { label: 'Eventos', order: 'starts_at', cols: ['starts_at', 'title', 'place'], fields: [['title', 'Título', 'text'], ['kind', 'Tipo (Masterclass, Mentoria...)', 'text'], ['starts_at', 'Data e hora', 'datetime-local'], ['place', 'Local', 'text'], ['mode', 'Formato', 'text'], ['seats', 'Vagas', 'number'], ['link', 'Link da sala (online)', 'text'], ['cover', 'Imagem de capa (URL)', 'text'], ['description', 'Descrição', 'textarea']] },
  materials: { label: 'Materiais', order: 'published_at', cols: ['published_at', 'title', 'kind'], fields: [['title', 'Título', 'text'], ['kind', 'Tipo (PDF, Vídeo, Link)', 'text'], ['category', 'Categoria', 'text'], ['size', 'Tamanho/duração', 'text'], ['url', 'URL do arquivo', 'text'], ['cover', 'Capa (URL)', 'text'], ['published_at', 'Publicado em', 'datetime-local']] },
  mentors: { label: 'Mentores', order: 'name', cols: ['name', 'specialty'], fields: [['name', 'Nome', 'text'], ['specialty', 'Especialidade', 'text'], ['bio', 'Bio', 'textarea'], ['avatar', 'Foto (URL)', 'text']] },
};
V.admin = async (tab = 'membros') => {
  if (!isAdmin()) return `<div class="empty">${I('lock')}<p>Área restrita à administração do clube.</p></div>`;
  const tabs = [['membros', 'Membros'], ['solicitacoes', 'Mentorias'], ...Object.entries(ADMIN).map(([k, v]) => [k, v.label])];
  let body = '';
  if (tab === 'membros') {
    const [ps, roles, steps, ms] = await Promise.all([db.list('profiles', { order: 'name' }), db.list('user_roles'), db.list('journey_steps'), db.list('member_steps')]);
    body = `<div class="card" style="overflow-x:auto"><table class="tbl"><thead><tr><th>Membro</th><th>Jornada</th><th>Papel</th></tr></thead><tbody>${ps.map(p => {
      const r = (roles.find(x => x.user_id === p.id) || {}).role || 'membro';
      const pc = steps.length ? Math.round(ms.filter(m => m.user_id === p.id && m.status === 'concluida').length * 100 / steps.length) : 0;
      return `<tr><td><div class="member">${AV(p, 'sm')}<span><b style="font-size:14px">${esc(p.name)}</b><small>${esc(p.company)}</small></span></div></td><td style="min-width:110px"><div class="progress"><i style="width:${pc}%"></i></div><small class="muted">${pc}%</small></td>
        <td><select class="input" style="min-height:38px;padding:6px 10px;font-size:14px" data-act="role" data-id="${esc(p.id)}" ${p.id === S.me ? 'disabled' : ''}>${['membro', 'mentor', 'admin'].map(x => `<option ${x === r ? 'selected' : ''}>${x}</option>`).join('')}</select></td></tr>`;
    }).join('')}</tbody></table></div>`;
  } else if (tab === 'solicitacoes') {
    const [rq, ps, mn] = await Promise.all([db.list('mentor_requests', { order: 'created_at', desc: true }), db.list('profiles'), db.list('mentors')]);
    body = `<div class="list">${rq.map(r => `<div class="card"><b>${esc((ps.find(p => p.id === r.user_id) || {}).name || 'Membro')}</b> → ${esc((mn.find(m => m.id === r.mentor_id) || {}).name || 'Mentor')}<p class="muted" style="font-size:14px;margin:6px 0">${esc(r.note || 'Sem observações')}</p><div class="row" style="gap:8px;flex-wrap:wrap"><span class="chip gold">${esc(r.status)}</span>${r.status === 'pendente' ? `<button class="btn line sm" data-act="req" data-id="${esc(r.id)}" data-s="agendada">Marcar agendada</button>` : ''}${r.status === 'agendada' ? `<button class="btn ghost sm" data-act="req" data-id="${esc(r.id)}" data-s="concluida">Concluir</button>` : ''}</div></div>`).join('') || `<div class="empty">${I('mentor')}<p>Nenhuma solicitação.</p></div>`}</div>`;
  } else if (ADMIN[tab]) {
    const cfg = ADMIN[tab];
    const rows = await db.list(tab, { order: cfg.order });
    body = `<button class="btn gold sm" style="margin-bottom:12px" data-act="adm-new" data-t="${tab}">${I('plus')} Novo</button>
    <div class="list">${rows.map(r => `<div class="card member"><span class="grow" style="min-width:0"><b class="ellip" style="display:block">${esc(r.title || r.name)}</b><small>${cfg.cols.filter(c => c !== 'title' && c !== 'name').map(c => /_at$/.test(c) ? fmtData(r[c]) : esc(r[c])).join(' · ')}</small></span>
      <button class="iconbtn" data-act="adm-edit" data-t="${tab}" data-id="${esc(r.id)}" aria-label="Editar">${I('edit')}</button><button class="iconbtn" data-act="adm-del" data-t="${tab}" data-id="${esc(r.id)}" aria-label="Excluir">${I('trash')}</button></div>`).join('')}</div>`;
  }
  return `<div class="page-h"><h1>Administração</h1><p>Gerencie membros, jornada, agenda e conteúdos.</p></div>
  <div class="tabs">${tabs.map(([k, l]) => `<a href="#/admin/${k}" class="${k === tab ? 'on' : ''}">${l}</a>`).join('')}</div>${body}`;
};
function admForm(t, r = {}) {
  const cfg = ADMIN[t];
  const val = (f, type) => { const v = r[f]; if (v == null) return ''; if (type === 'datetime-local') { const d = new Date(v); return new Date(d - d.getTimezoneOffset() * 6e4).toISOString().slice(0, 16); } return v; };
  sheet(`<h3>${r.id ? 'Editar' : 'Novo'} · ${cfg.label}</h3><form data-form="adm" data-t="${t}" data-id="${esc(r.id || '')}">
    ${cfg.fields.map(([f, l, type]) => `<div class="field"><label for="a-${f}">${l}</label>${type === 'textarea' ? `<textarea class="input" id="a-${f}" name="${f}">${esc(val(f))}</textarea>` : `<input class="input" id="a-${f}" name="${f}" type="${type}" value="${esc(val(f, type))}">`}</div>`).join('')}
    <button class="btn gold block">Salvar</button></form>`);
}

function notFound() { return `<div class="empty">${I('search')}<p>Página não encontrada.</p><a class="btn line sm" style="margin-top:12px" href="#/">Voltar ao início</a></div>`; }

/* ============ ações (cliques) ============ */
const ACT = {
  async demo(el) { await doSignIn(el.dataset.e, el.dataset.p); },
  async quick(el) {
    const a = Accounts.all().find(x => x.id === el.dataset.id);
    try { await db.auth.switchTo(a); await afterLogin(); }
    catch (e) { const em = $('#em'); if (em) { em.value = a.email || ''; $('#pw').focus(); } toast(e.message || 'Digite a senha desta conta.'); }
  },
  async magic() {
    const em = ($('#em') || {}).value;
    if (!em) return toast('Digite seu e-mail primeiro.');
    try { await db.auth.magicLink(em); toast('Enviamos um link de acesso para o seu e-mail.'); } catch (e) { toast(e.message); }
  },
  async logout() { closeSheet(); await db.auth.signOut(); S.me = null; location.hash = '#/login'; route(); },
  account() {
    const accs = Accounts.all().filter(a => a.id !== S.me);
    sheet(`<div class="member" style="margin-bottom:10px">${AV(S.profile)}<span class="grow"><b>${esc(S.profile.name)}</b><small>${esc(S.roles.join(', ') || 'membro')}</small></span></div>
      <div class="menu-list">
        <a href="#/membro/${esc(S.me)}" data-act="close">${I('user')} Ver meu perfil público</a>
        <a href="#/mensagens" data-act="close">${I('msg')} Mensagens</a>
        ${accs.map(a => `<button data-act="switch" data-id="${esc(a.id)}">${AV(a, 'sm')} Trocar para ${esc(first(a.name))}</button>`).join('')}
        <button data-act="addacc">${I('swap')} Adicionar outra conta</button>
        <div class="menu-sep"></div>
        <button data-act="logout">${I('out')} Sair</button>
      </div>`);
  },
  more() {
    sheet(`<h3>Menu</h3><div class="menu-list">
      ${[['perfil', 'Meu Perfil Empresarial', 'user'], ['diagnosticos', 'Diagnósticos', 'diag'], ['biblioteca', 'Biblioteca', 'book'], ['mentores', 'Mentores', 'mentor'], ['mensagens', 'Mensagens', 'msg'], ['plano', 'Meu Plano', 'plan'], ['relatorios', 'Relatórios', 'chart'], ...(isAdmin() ? [['admin', 'Administração', 'shield']] : [])].map(([k, l, i]) => `<a href="#/${k}" data-act="close">${I(i)} ${l}</a>`).join('')}
      <div class="menu-sep"></div>
      <a href="#/suporte" data-act="close">${I('help')} Suporte</a>
      <a href="#/config" data-act="close">${I('gear')} Configurações</a>
      <button data-act="logout">${I('out')} Sair</button></div>`);
  },
  close() { closeSheet(); },
  async switch(el) {
    const a = Accounts.all().find(x => x.id === el.dataset.id);
    closeSheet();
    try { await db.auth.switchTo(a); await afterLogin(); toast(`Conectado como ${first(a.name)}`); }
    catch (e) { toast(e.message); await db.auth.signOut(); location.hash = '#/login'; route(); }
  },
  forget(el) { Accounts.forget(el.dataset.id); route(); },
  async addacc() { closeSheet(); await db.auth.signOut(); S.me = null; location.hash = '#/login'; route(); },
  welcome() {
    sheet(`<h3 class="serif" style="font-size:28px">Boas-vindas ao Clube do ROI</h3>
      <div class="list" style="gap:14px;margin-bottom:18px">
        ${[['compass', 'Jornada de entrada', '7 etapas para você se integrar, se conhecer melhor como empresário e montar seu plano.'], ['cal', 'Encontros', 'Masterclasses, mentorias e jantares para aprender e se conectar.'], ['users', 'Conexões', 'Uma rede de empresários com quem trocar experiências e gerar negócios.'], ['book', 'Conteúdos', 'Biblioteca de guias e aulas selecionados pelo clube.']]
          .map(([i, t, d]) => `<div class="row" style="align-items:flex-start">${I(i, 'gold')}<div><b>${t}</b><p class="muted" style="font-size:14px">${d}</p></div></div>`).join('')}
      </div>
      <button class="btn gold block" data-act="done-step" data-k="boas-vindas">Entendi, concluir etapa</button>`);
  },
  async 'done-step'(el) { closeSheet(); await completeStep(el.dataset.k); route(); },
  async connect(el) {
    await db.insert('connections', { requester: S.me, addressee: el.dataset.id, status: 'pendente' });
    toast('Pedido de conexão enviado');
    const sent = (await db.list('connections')).filter(c => c.requester === S.me || c.status === 'aceita').length;
    if (sent >= 3) await completeStep('conexoes');
    route();
  },
  async accept(el) { await db.update('connections', { id: el.dataset.id }, { status: 'aceita' }); toast('Conexão aceita'); refreshUnread(); route(); },
  async decline(el) { await db.remove('connections', { id: el.dataset.id }); toast('Pedido recusado'); route(); },
  async rsvp(el) {
    if (el.dataset.on === '1') { await db.upsert('rsvps', { event_id: el.dataset.id, user_id: S.me }); toast('Presença confirmada ✓'); await completeStep('encontro', true); }
    else { await db.remove('rsvps', { event_id: el.dataset.id, user_id: S.me }); toast('Presença cancelada'); }
    route();
  },
  async readall() { await db.update('notifications', { user_id: S.me, read: false }, { read: true }); S.unread = 0; route(); },
  async readone(el) { db.update('notifications', { id: el.dataset.id }, { read: true }).then(refreshUnread); },
  scale(el) {
    const q = el.closest('.q');
    q.querySelectorAll('button').forEach(b => { b.classList.toggle('on', b === el); b.setAttribute('aria-checked', b === el); });
    q.querySelector('input').value = el.dataset.v;
  },
  'add-goal'() {
    const i = $('#newgoal'); if (!i.value.trim()) return;
    const box = $('#goals'); box.insertAdjacentHTML('beforeend', goalRow({ text: i.value.trim(), done: false }, box.children.length + Date.now() % 1000)); i.value = ''; i.focus();
  },
  'del-goal'(el) { el.closest('label').remove(); },
  filter(el) {
    el.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el));
    document.querySelectorAll('#flist>[data-cat]').forEach(r => { r.style.display = !el.dataset.f || r.dataset.cat === el.dataset.f ? '' : 'none'; });
  },
  agtab(el) {
    el.parentElement.querySelectorAll('button').forEach(b => b.classList.toggle('on', b === el));
    document.querySelectorAll('#aglist>[data-mine]').forEach(r => { r.style.display = el.dataset.f === 'all' || r.dataset.mine === '1' ? '' : 'none'; });
  },
  cal(el) { const d = new Date(S.calRef || Date.now()); S.calRef = new Date(d.getFullYear(), d.getMonth() + Number(el.dataset.d), 1).getTime(); route(); },
  mentor(el) {
    sheet(`<h3>Solicitar mentoria com ${esc(el.dataset.n)}</h3><form data-form="mreq" data-id="${esc(el.dataset.id)}">
      <div class="field"><label for="mn">Sobre o que você quer conversar?</label><textarea class="input" id="mn" name="note" required placeholder="Contexto, desafio e melhores horários"></textarea></div>
      <button class="btn gold block">Enviar solicitação</button></form>`);
  },
  async req(el) { await db.update('mentor_requests', { id: el.dataset.id }, { status: el.dataset.s }); route(); },
  async install() {
    if (S.installEvt) { S.installEvt.prompt(); const r = await S.installEvt.userChoice; if (r.outcome === 'accepted') toast('App instalado!'); S.installEvt = null; }
    else toast('Use o menu do navegador › "Instalar app" ou "Adicionar à tela inicial".');
  },
  async reset() { await db.auth.resetDemo(); location.hash = '#/login'; location.reload(); },
  'adm-new'(el) { admForm(el.dataset.t); },
  async 'adm-edit'(el) { const [r] = await db.list(el.dataset.t, { eq: { id: el.dataset.id } }); admForm(el.dataset.t, r); },
  async 'adm-del'(el) {
    if (!el.dataset.sure) { el.dataset.sure = '1'; el.style.color = 'var(--bad)'; el.setAttribute('aria-label', 'Toque de novo para excluir'); toast('Toque de novo na lixeira para excluir'); setTimeout(() => { delete el.dataset.sure; el.style.color = ''; }, 4000); return; }
    await db.remove(el.dataset.t, { id: el.dataset.id }); toast('Excluído'); route(); },
};
const CHANGE = {
  async avatar(el) {
    const f = el.files[0]; if (!f) return;
    const img = new Image(); img.src = URL.createObjectURL(f); await img.decode();
    const c = document.createElement('canvas'); const s = 192; c.width = c.height = s;
    const k = Math.max(s / img.width, s / img.height); const w = img.width * k, h = img.height * k;
    c.getContext('2d').drawImage(img, (s - w) / 2, (s - h) / 2, w, h);
    const url = c.toDataURL('image/jpeg', .82);
    await db.update('profiles', { id: S.me }, { avatar: url });
    S.profile.avatar = url; toast('Foto atualizada'); route();
  },
  async role(el) {
    const id = el.dataset.id, r = el.value;
    await db.remove('user_roles', { user_id: id });
    if (r !== 'membro') await db.insert('user_roles', { user_id: id, role: r });
    toast('Papel atualizado');
  },
  mseg() { memberFilter(); }, mcity() { memberFilter(); },
};
function memberFilter() {
  const q = ($('[data-act=msearch]') || {}).value?.toLowerCase() || '', sg = ($('[data-act=mseg]') || {}).value, ct = ($('[data-act=mcity]') || {}).value;
  document.querySelectorAll('#mlist>.member').forEach(r => { r.style.display = r.dataset.s.includes(q) && (!sg || r.dataset.seg === sg) && (!ct || r.dataset.city === ct) ? '' : 'none'; });
}
async function refreshUnread() { S.unread = (await db.list('notifications', { eq: { user_id: S.me, read: false } })).length; const b = $('.top .iconbtn'); if (b) b.innerHTML = I('bell') + (S.unread ? `<span class="badge">${S.unread}</span>` : ''); }

/* ============ formulários ============ */
const FORM = {
  async signin(f, fd) { await doSignIn(fd.email, fd.pw); },
  async signup(f, fd) {
    if (!fd.name || !fd.email || !fd.pw) return toast('Preencha todos os campos.');
    const r = await db.auth.signUp({ name: fd.name.trim(), email: fd.email, pw: fd.pw });
    if (!r.session) { toast('Conta criada! Confirme pelo link enviado ao seu e-mail.'); location.hash = '#/login'; return; }
    await afterLogin(); toast('Conta criada. Bem-vindo ao clube!');
  },
  async profile(f, fd) {
    const req = ['name', 'company', 'segment', 'city'].filter(k => !fd[k]);
    if (req.length) return toast('Preencha nome, empresa, segmento e cidade.');
    await db.update('profiles', { id: S.me }, fd);
    Object.assign(S.profile, fd);
    toast('Perfil salvo');
    await completeStep('perfil');
    route();
  },
  async diag(f, fd) {
    const sc = {};
    for (const a of AREAS) { if (!fd[a]) return toast(`Responda a pergunta de ${a}.`); sc[a] = Number(fd[a]); }
    const total = Math.round(Object.values(sc).reduce((s, v) => s + v, 0) * 100 / (AREAS.length * 5));
    await db.insert('diagnostics', { user_id: S.me, answers: sc, scores: sc, total });
    await completeStep('diagnostico');
    if (location.hash === '#/diagnosticos') route(); else location.hash = '#/diagnosticos';
    scrollTo(0, 0);
  },
  async plan(f, fd) {
    const goals = [];
    f.querySelectorAll('#goals>label').forEach(l => { const t = l.querySelector('input[name^=t]').value.trim(); if (t) goals.push({ text: t, done: l.querySelector('input[type=checkbox]').checked }); });
    await db.upsert('plans', { user_id: S.me, focus: fd.focus || '', goals, updated_at: nowISO() });
    toast('Plano salvo');
    if (goals.length) await completeStep('plano');
    route();
  },
  async msg(f, fd) {
    if (!fd.body || !fd.body.trim()) return;
    await db.insert('messages', { sender: S.me, receiver: f.dataset.to, body: fd.body.trim() });
    route();
  },
  async mreq(f, fd) {
    await db.insert('mentor_requests', { user_id: S.me, mentor_id: f.dataset.id, note: fd.note, status: 'pendente' });
    closeSheet(); toast('Solicitação enviada à equipe do clube'); route();
  },
  async search(f, fd) { if (fd.q) location.hash = '#/busca/' + encodeURIComponent(fd.q); },
  async adm(f, fd) {
    const t = f.dataset.t, id = f.dataset.id;
    ADMIN[t].fields.forEach(([k, , type]) => { if (type === 'number') fd[k] = fd[k] === '' ? null : Number(fd[k]); if (type === 'datetime-local' && fd[k]) fd[k] = new Date(fd[k]).toISOString(); });
    if (id) await db.update(t, { id }, fd); else await db.insert(t, fd);
    closeSheet(); toast('Salvo'); route();
  },
};
async function doSignIn(email, pw) {
  if (!email || !pw) return toast('Digite e-mail e senha.');
  await db.auth.signIn(email, pw);
  await afterLogin();
}
async function afterLogin() {
  await loadMe();
  if (location.hash.startsWith('#/login') || location.hash.startsWith('#/cadastro') || !location.hash) location.hash = '#/';
  route();
}

/* ============ roteador ============ */
async function route() {
  const app = $('#app');
  const parts = (location.hash.replace(/^#\/?/, '') || '').split('/');
  const [sec, arg] = [parts[0] || '', parts.slice(1).join('/')];
  if (!db.me()) {
    app.innerHTML = await V.login(sec === 'cadastro' ? 'cadastro' : 'entrar');
    return;
  }
  if (!S.me || S.me !== db.me()) await loadMe();
  if (sec === 'login' || sec === 'cadastro') { location.hash = '#/'; return; }
  const viewName = { '': 'dashboard' }[sec] ?? sec;
  const view = V[viewName];
  const navSec = { evento: 'agenda', membro: 'comunidade', mensagens: 'comunidade', material: 'biblioteca', notificacoes: '', busca: '' }[sec] ?? sec;
  const token = (S.rt = (S.rt || 0) + 1);
  // skeleton enquanto carrega
  if (!$('#main')) app.innerHTML = shell(skeleton(), navSec);
  else { $('#main').innerHTML = skeleton(); }
  let html;
  try { html = view ? await view(arg) : notFound(); }
  catch (e) { console.error(e); html = `<div class="empty">${I('x')}<p>Não foi possível carregar: ${esc(e.message)}</p></div>`; }
  if (token !== S.rt) return;
  const y = S.lastRoute === location.hash ? scrollY : 0;
  app.innerHTML = shell(html, navSec);
  scrollTo(0, y);
  S.lastRoute = location.hash;
}
const skeleton = () => `<div class="skel" style="height:44px;width:60%;margin:8px 0 18px"></div><div class="skel" style="height:140px;margin-bottom:12px"></div><div class="skel" style="height:220px"></div>`;

/* ============ eventos globais ============ */
document.addEventListener('click', async e => {
  const el = e.target.closest('[data-act]');
  if (!el || el.tagName === 'INPUT' || el.tagName === 'SELECT') return;
  const fn = ACT[el.dataset.act];
  if (!fn) return;
  if (el.tagName !== 'A') e.preventDefault();
  try { el.disabled = true; await fn(el, e); } catch (err) { console.error(err); toast(err.message || 'Algo deu errado.'); } finally { el.disabled = false; }
});
document.addEventListener('change', async e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = CHANGE[el.dataset.act]; if (!fn) return;
  try { await fn(el); } catch (err) { toast(err.message); }
});
document.addEventListener('input', e => { if (e.target.matches('[data-act=msearch]')) memberFilter(); });
document.addEventListener('submit', async e => {
  const f = e.target.closest('[data-form]'); if (!f) return;
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(f).entries());
  const btn = f.querySelector('button[type=submit],button:not([type])');
  try { if (btn) btn.disabled = true; await FORM[f.dataset.form](f, fd); }
  catch (err) { console.error(err); toast(err.message || 'Algo deu errado.'); }
  finally { if (btn) btn.disabled = false; }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
window.addEventListener('hashchange', () => { closeSheet(); route(); });
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); S.installEvt = e; });

/* ============ início ============ */
(async () => {
  const c = window.CDR_CONFIG || {};
  try { db = c.supabaseUrl && c.supabaseAnonKey ? await SupabaseDriver(c.supabaseUrl, c.supabaseAnonKey) : LocalDriver(); }
  catch (e) { console.error(e); db = LocalDriver(); toast('Sem conexão com o servidor — modo demonstração.'); }
  await route();
  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
})();
