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
    S(1,'boas-vindas','Boas-vindas ao Clube','Conheça o ecossistema, como funciona sua jornada de integração e o que esperar do clube.',5,'#/jornada/boas-vindas','Ver boas-vindas'),
    S(2,'membro','Conhecendo o membro','Bloco 1 · Sua trajetória como empresário e o motivo de entrar no clube.',5,'#/onboarding/1','Responder bloco 1'),
    S(3,'empresa','Conhecendo sua empresa','Bloco 2 · Segmento, modelo de negócio, porte e estrutura.',7,'#/onboarding/2','Responder bloco 2'),
    S(4,'diagnostico','Diagnóstico empresarial','Bloco 3 · Desafios atuais e o que impede o crescimento.',6,'#/onboarding/3','Responder bloco 3'),
    S(5,'futuro','Oportunidades e visão de futuro','Bloco 4 · Objetivos para os próximos 12 meses e o problema que você resolveria em 90 dias.',6,'#/onboarding/4','Responder bloco 4'),
    S(6,'networking','Networking e conexões estratégicas','Bloco 5 · Que empresários você quer conhecer e o que pode oferecer ao ecossistema.',5,'#/onboarding/5','Responder bloco 5'),
    S(7,'reuniao','Reunião estratégica individual','Depois de analisar suas respostas, a equipe agenda uma conversa de 45 a 60 minutos com você.',60,'#/plano','Ver detalhes'),
  ];
  const done = [ [1,at(-1,8)],[2,at(-1,8)],[3,at(-1,9)],[4,at(0,1)],[5,at(0,2)] ];
  const member_steps = done.map(([o,d]) => ({ user_id:'u-ricardo', step_id:'s'+o, status:'concluida', completed_at:d }));
  // progresso dos outros membros: m1 a m5 integrados (m1 já com reunião), m6 no meio, m7 a m10 integrados
  const PROG = { m1:7, m2:6, m3:6, m4:6, m5:6, m6:3, m7:6, m8:6, m9:6, m10:6 };
  Object.entries(PROG).forEach(([m,n],i) => journey_steps.slice(0, n).forEach(s => member_steps.push({user_id:m,step_id:s.id,status:'concluida',completed_at:at(-2,3+i)})));
  const A = (o) => ({ q1:'', q2:'', q3:'', q4:'De 10 a 20 anos', q5:'', q6:'Ampliar a rede de relacionamento com empresários do mesmo porte.', q7:'', q8:'', q9:'', q10:'', q11:'', q12:'', q13:'De R$ 1 milhão a R$ 3 milhões', q14:'51 a 200', q15:'Não', q16:'Divido a operação e a estratégia', q17:'Vendas e aquisição de clientes', q18:'Dependência de indicação para vender.', q19:['Vendas'], q20:'Parcialmente', q21:'', q22:'Crescer 40% com previsibilidade comercial.', q23:'Sim', q24:'Talvez', q25:['Parcerias'], q26:['Vendas e aquisição de clientes'], q90:'Montar um time comercial que venda sem depender de mim.', q27:'Empresários de setores complementares.', q28:[], q29:'Experiência em expansão e gestão de equipes.', q30:'Sim, com frequência', q31:'', ...o });
  const onboarding = [
    { user_id:'u-ricardo', updated_at:at(0,2), answers: A({ q1:'Ricardo Almeida', q2:'Fundador e CEO', q3:'São Paulo/SP', q4:'Mais de 20 anos', q5:'Comecei no mercado financeiro, abri a primeira empresa aos 28 anos e hoje a holding tem participação em 4 negócios.', q6:'Estar perto de empresários que pensam grande e encontrar sócios para novas frentes.', q7:'Almeida Participações', q8:'almeidaparticipacoes.com.br', q9:'@almeidapar', q10:'Holding e investimentos', q11:'Gestão de participações em empresas de serviços e varejo.', q12:'Holding com participação majoritária em 4 empresas operacionais; receita vem dos dividendos e de serviços de gestão.', q13:'De R$ 3 milhões a R$ 10 milhões', q14:'201 a 500', q15:'Sim, filiais', q16:'Atuo mais na estratégia', q17:'Crescimento e expansão', q18:'Falta de gestores preparados para assumir novas unidades.', q19:['Relacionamento com clientes','Financeiro'], q20:'Parcialmente', q21:'Expansão por franquias em 2023; pausamos por falta de padronização.', q22:'Abrir 3 novas praças e estruturar um conselho consultivo.', q23:'Sim', q24:'Sim', q25:['Adquirir empresas','Parcerias'], q26:['Crescimento e expansão','Gestão de pessoas'], q90:'Formar dois gestores capazes de tocar uma nova praça sem mim.', q27:'', q28:[], q29:'', q30:'', q31:'' }) },
    { user_id:'m1', updated_at:at(-2,3), answers: A({ q1:'Bruno Carvalho', q2:'CEO', q3:'Campinas/SP', q7:'Carvalho Engenharia', q10:'Construção civil', q11:'Obras corporativas e galpões logísticos.', q12:'B2B, contratos por obra.', q13:'De R$ 3 milhões a R$ 10 milhões', q17:'Gestão financeira', q28:['Logística','Mercado imobiliário'], q31:'Incorporadoras para parceria em galpões.' }) },
    { user_id:'m2', updated_at:at(-2,4), answers: A({ q1:'Juliana Prado', q2:'Sócia-fundadora', q3:'Belo Horizonte/MG', q7:'Prado Cosméticos', q10:'Varejo e e-commerce', q17:'Posicionamento e marca', q28:['Indústria de alimentos','Tecnologia','Holding e investimentos'] }) },
    { user_id:'m3', updated_at:at(-2,5), answers: A({ q1:'Marcelo Teixeira', q2:'Diretor executivo', q3:'Curitiba/PR', q7:'Teixeira Logística', q10:'Logística', q17:'Processos e operação', q28:['Construção civil','Varejo e e-commerce'] }) },
    { user_id:'m4', updated_at:at(-2,6), answers: A({ q1:'Camila Rocha', q2:'Fundadora', q3:'Rio de Janeiro/RJ', q7:'Rocha Saúde', q10:'Saúde', q17:'Gestão de pessoas', q28:['Holding e investimentos','Tecnologia'] }) },
    { user_id:'m5', updated_at:at(-2,7), answers: A({ q1:'André Nogueira', q2:'Sócio-diretor', q3:'Ribeirão Preto/SP', q7:'Nogueira Agro', q10:'Agronegócio', q17:'Crescimento e expansão', q28:['Logística','Indústria de alimentos'] }) },
    { user_id:'m6', updated_at:at(-1,2), answers: A({ q1:'Fernanda Lima', q2:'CTO e cofundadora', q3:'Florianópolis/SC', q7:'Lima Tech', q10:'Tecnologia', q17:'', q18:'', q19:[], q20:'', q21:'', q22:'', q23:'', q24:'', q25:[], q26:[], q90:'', q27:'', q28:[], q29:'', q30:'', q31:'' }) },
  ];
  const day = n => { const d = new Date(); d.setDate(d.getDate() - n); return d.toISOString(); };
  const I_ = (id, user_id, name, phone, email, company, owner, acquired, status) => ({ id, user_id, name, phone, email, company, owner, acquired_at:acquired, status, notes:'', created_at:acquired, updated_at:acquired });
  const member_intake = [
    I_('i0','u-ricardo','Ricardo Almeida','(11) 98888-1001','ricardo@clubedoroi.com.br','Almeida Participações','Marina Costa',day(3),'Acesso enviado'),
    I_('i1','m1','Bruno Carvalho','(19) 98888-1002','bruno@carvalhoeng.com.br','Carvalho Engenharia','Marina Costa',day(40),'Plano ativo'),
    I_('i2','m2','Juliana Prado','(31) 98888-1003','juliana@pradocosmeticos.com.br','Prado Cosméticos','Felipe Araújo',day(40),'Reunião agendada'),
    I_('i3','m3','Marcelo Teixeira','(41) 98888-1004','marcelo@teixeiralog.com.br','Teixeira Logística','Felipe Araújo',day(40),'Acesso enviado'),
    I_('i4','m4','Camila Rocha','(21) 98888-1005','camila@rochasaude.com.br','Rocha Saúde','Marina Costa',day(25),'Acesso enviado'),
    I_('i5','m5','André Nogueira','(16) 98888-1006','andre@nogueiraagro.com.br','Nogueira Agro','Felipe Araújo',day(25),'Acesso enviado'),
    I_('i6','m6','Fernanda Lima','(48) 98888-1007','fernanda@limatech.com.br','Lima Tech','Marina Costa',day(9),'Acesso enviado'),
    I_('i7','m7','Gustavo Moreira','(11) 98888-1008','gustavo@moreiraimoveis.com.br','Moreira Imóveis','Felipe Araújo',day(25),'Acesso enviado'),
    I_('i8','m8','Patrícia Souza','(62) 98888-1009','patricia@souzaalimentos.com.br','Souza Alimentos','Marina Costa',day(25),'Acesso enviado'),
    I_('i9','m9','Rafael Batista','(81) 98888-1010','rafael@batistaedu.com.br','Batista Educação','Felipe Araújo',day(25),'Acesso enviado'),
    I_('i10','m10','Larissa Mendes','(11) 98888-1011','larissa@mendesmoda.com.br','Mendes Moda','Marina Costa',day(25),'Acesso enviado'),
    I_('i11',null,'Eduardo Martins','(11) 98888-1012','eduardo@martinsconstrutora.com.br','Martins Construtora','Marina Costa',day(1),'Compra confirmada'),
    I_('i12',null,'Sílvia Ramos','(11) 98888-1013','silvia@ramosadvocacia.com.br','Ramos Advocacia','Felipe Araújo',day(6),'Contato realizado'),
  ];
  const member_sheets = [
    { user_id:'m1', perfil:'Engenheiro, perfil executor, muito técnico. Quer profissionalizar o financeiro.', oportunidades:'Parceria com incorporadoras do clube para galpões logísticos.', conexoes:'Marcelo Teixeira (logística) e Gustavo Moreira (imobiliário).', especialistas:['mn3'], proximos:'Apresentar Daniela Freitas para estruturar a DRE gerencial.', updated_at:day(20) },
  ];
  const dev_plans = [
    { user_id:'m1', objetivos:'Dobrar a margem líquida em 12 meses.', prioridades:'1. DRE gerencial mensal\n2. Precificação por obra', oportunidades:'Galpões logísticos em parceria com membros do clube.', acoes:[{texto:'Implantar DRE gerencial', responsavel:'Daniela Freitas (mentora)', prazo:day(-20).slice(0,10), status:'em andamento'},{texto:'Reunião com Teixeira Logística', responsavel:'Marina Costa', prazo:day(-7).slice(0,10), status:'concluída'}], historico:[{at:day(20), texto:'Plano criado após a reunião estratégica.'},{at:day(5), texto:'Reunião com Teixeira Logística realizada.'}], meeting_at:day(22), meeting_status:'Realizada', updated_at:day(5) },
    { user_id:'m2', objetivos:'', prioridades:'', oportunidades:'', acoes:[], historico:[{at:day(2), texto:'Reunião estratégica agendada.'}], meeting_at:day(-4), meeting_status:'Agendada', updated_at:day(2) },
  ];
  const vip_access = ['m1','m2','m3','m4','m5','m7','m8','m9','m10'].map(u => ({ user_id:u, status:'liberado', requested_at:day(30), approved_at:day(30) }));
  const settings = [
    { key:'vip', value:{ link:'', approval:true, rules:'Grupo exclusivo para membros do Clube do ROI.\n• Não compartilhe o link.\n• Apresente-se ao entrar: nome, empresa e o que você busca.\n• Compartilhe oportunidades e conteúdos relevantes; evite propaganda.\n• Respeito e sigilo sobre o que é conversado aqui.' } },
    { key:'team', value:{ contato:'Marina Costa', onboarding:'Marina Costa', diagnostico:'Felipe Araújo', reunioes:'Felipe Araújo', vip:'Marina Costa', eventos:'Equipe de eventos', plataforma:'V8' } },
  ];
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
    { id:'n2', user_id:'u-ricardo', title:'Etapa liberada', body:'Networking e conexões estratégicas está disponível na sua jornada.', link:'#/onboarding/5', read:false, created_at:at(0,2) },
    { id:'n3', user_id:'u-ricardo', title:'Novo evento na agenda', body:'Masterclass com convidado especial — vagas abertas.', link:'#/agenda', read:true, created_at:at(-1,10) },
  ];
  return { users, profiles, user_roles, journey_steps, member_steps, events, rsvps, materials, mentors, connections, messages, notifications, mentor_requests:[], onboarding, member_intake, member_sheets, dev_plans, vip_access, settings };
}

/* chaves de cada tabela (para update/delete) */
const KEYS = { member_steps:['user_id','step_id'], rsvps:['event_id','user_id'], user_roles:['user_id'], onboarding:['user_id'], member_sheets:['user_id'], dev_plans:['user_id'], vip_access:['user_id'], settings:['key'] };
const keyOf = (t) => KEYS[t] || ['id'];
const matches = (row, m) => Object.entries(m || {}).every(([k, v]) => row[k] === v);

/* ============ driver local (demonstração) ============ */
function LocalDriver() {
  const K = 'cdr:db:v2';
  let D;
  try { D = JSON.parse(localStorage.getItem(K)); } catch (e) {}
  if (!D) D = seed();
  const save = () => { try { localStorage.setItem(K, JSON.stringify(D)); } catch (e) {} };
  save();
  let me = null;
  try { me = localStorage.getItem('cdr:current'); } catch (e) {}
  if (me && !D.users.find(u => u.id === me)) me = null;
  const isAdmin = () => D.user_roles.some(r => r.user_id === me && r.role === 'admin');
  const PRIV = ['member_steps','notifications','mentor_requests','onboarding','dev_plans','vip_access'];
  const ADMIN_ONLY = ['journey_steps','events','materials','mentors','user_roles','member_intake','member_sheets','settings'];
  const ADMIN_READ = ['member_intake','member_sheets'];

  // Emulação das políticas RLS do schema.sql — cada membro só enxerga o que é dele.
  function canRead(t, r) {
    if (!me) return false;
    if (ADMIN_READ.includes(t)) return isAdmin();
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
    if (t === 'vip_access') return r.user_id === me && r.status === 'solicitado';
    if (t === 'dev_plans') return r.user_id === me && op === 'update';
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
        const intake = D.member_intake.find(x => String(x.email).toLowerCase() === email);
        if (!intake) throw new Error('Este e-mail ainda não foi liberado pela equipe do Clube do ROI. Fale com seu responsável de relacionamento.');
        const id = uid();
        intake.user_id = id; intake.updated_at = nowISO();
        if (!name) name = intake.name;
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
      // equipe libera o acesso de um membro cadastrado no jantar (demonstração: senha provisória)
      async invite(it) {
        if (!isAdmin()) deny();
        const email = String(it.email).trim().toLowerCase();
        let u = D.users.find(x => x.email === email);
        const pw = 'roi' + Math.random().toString().slice(2, 6);
        if (!u) {
          u = { id: uid(), email, pw: hash(pw) }; D.users.push(u);
          D.profiles.push({ id:u.id, name:it.name, company:it.company || '', segment:'', city:'', avatar:'', headline:'', revenue:'', employees:'', goals:'', phone:it.phone || '', member_since:new Date().getFullYear(), created_at:nowISO() });
          D.notifications.push({ id:uid(), user_id:u.id, title:'Bem-vindo ao Clube do ROI', body:'Sua jornada de entrada começou. Comece pelas boas-vindas.', link:'#/jornada', read:false, created_at:nowISO() });
        } else u.pw = hash(pw);
        const x = D.member_intake.find(r => r.id === it.id); if (x) { x.user_id = u.id; x.updated_at = nowISO(); }
        save(); return { password: pw };
      },
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
      async magicLink(email) { chk(await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: false, emailRedirectTo: location.origin + location.pathname } })); },
      // envia o e-mail de primeiro acesso (link mágico); o vínculo com o cadastro é feito pelo gatilho do banco
      async invite(it) { chk(await sb.auth.signInWithOtp({ email: it.email, options: { shouldCreateUser: true, data: { name: it.name }, emailRedirectTo: location.origin + location.pathname } })); return { password: null }; },
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
  const mand = list.filter(s => s.key !== 'reuniao');
  const mandDone = mand.filter(s => s.status === 'done').length;
  return { steps: list, current, done, total: list.length, pct: list.length ? Math.round(done * 100 / list.length) : 0, mandDone, mandTotal: mand.length, onbDone: mand.length > 0 && mandDone === mand.length };
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
  ['diagnosticos', 'Meu Diagnóstico', 'diag'], ['biblioteca', 'Biblioteca', 'book'], ['mentores', 'Mentores', 'mentor'],
  ['comunidade', 'Comunidade', 'users'], ['agenda', 'Agenda', 'cal'], ['plano', 'Meu Plano', 'plan'], ['integrado', 'Grupo VIP', 'star'], ['relatorios', 'Relatórios', 'chart'],
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
      <h1>${mode === 'cadastro' ? 'Primeiro acesso' : 'Bem-vindo ao Clube do ROI.'}</h1>
      <p class="muted" style="margin:6px 0 22px">${mode === 'cadastro' ? 'Use o e-mail que você informou no jantar. O acesso é liberado pela equipe do clube.' : 'Acesse com o login enviado pela equipe do clube.'}</p>
      <form data-form="${mode === 'cadastro' ? 'signup' : 'signin'}" novalidate>
        ${mode === 'cadastro' ? `<div class="field"><label for="nm">Nome completo</label><input class="input" id="nm" name="name" autocomplete="name" required></div>` : ''}
        <div class="field"><label for="em">E-mail</label><input class="input" id="em" name="email" type="email" autocomplete="email" inputmode="email" required></div>
        <div class="field"><label for="pw">Senha</label><input class="input" id="pw" name="pw" type="password" autocomplete="${mode === 'cadastro' ? 'new-password' : 'current-password'}" required minlength="6"></div>
        <button class="btn gold block" type="submit">${mode === 'cadastro' ? 'Criar minha senha' : 'Entrar'} ${I('arrow')}</button>
      </form>
      <div class="row" style="justify-content:space-between;margin-top:14px;flex-wrap:wrap;gap:6px">
        ${mode === 'cadastro' ? `<a class="link" href="#/login">Já tenho conta</a>` : `<a class="link" href="#/cadastro">Primeiro acesso</a>`}
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
  const welcomeDone = j.steps.some(s => s.key === 'boas-vindas' && s.status === 'done');
  if (!welcomeDone && !S.welcomed) { S.welcomed = true; setTimeout(() => ACT.welcome(), 400); }
  const stepHref = s => s.key === 'boas-vindas' ? '#/jornada/boas-vindas' : s.route;
  return `
  <section class="hero">
    <div>
      <h1>Bem-vindo, <span class="gold">${esc(first(S.profile.name))}.</span></h1>
      <p>${j.onbDone ? 'Você faz parte de um ecossistema privado de empresários que buscam novas perspectivas, conexões estratégicas e novas formas de criar receita.' : 'Esta é a sua jornada de entrada no Clube do ROI. Queremos conhecer você, sua trajetória e o negócio que construiu para aproveitar ao máximo as oportunidades do ecossistema.'}</p>
      <a class="btn line" href="${nxt ? stepHref(nxt) : '#/plano'}">${j.onbDone ? (nxt ? 'Ver próxima etapa' : 'Ver meu plano') : 'Continuar minha jornada'} ${I('arrow')}</a>
    </div>
    <a class="journey-card" href="#/jornada" aria-label="Sua jornada de entrada: ${j.pct}%">
      <b style="font-weight:600">Sua jornada de entrada</b>
      <div class="pct">${j.pct}%</div>
      <div class="progress"><i style="width:${j.pct}%"></i></div>
      <p class="muted" style="margin-top:14px;font-size:14px">${nxt ? 'Próxima etapa:' : 'Jornada concluída'}</p>
      ${nxt ? `<div class="next"><span class="ring">${I('arrow')}</span>${esc(nxt.title)}</div>` : ''}
    </a>
  </section>

  <div class="kpis">
    <a class="kpi" href="#/jornada">${I('rocket')}<span><b>${j.done}/${j.total}</b><small>Etapas concluídas</small></span></a>
    <a class="kpi" href="#/agenda">${I('cal')}<span><b>${upcoming.length}</b><small>Próximos eventos</small></span></a>
    <a class="kpi" href="${j.onbDone ? '#/comunidade' : '#/jornada'}">${I('users')}<span><b>${profiles.length}</b><small>Membros no clube</small></span></a>
    <a class="kpi" href="${j.onbDone ? '#/integrado' : '#/jornada'}">${I(j.onbDone ? 'star' : 'lock')}<span><b>${j.onbDone ? 'VIP' : `${j.mandDone}/${j.mandTotal}`}</b><small>${j.onbDone ? 'Grupo VIP liberado' : 'Etapas para o Grupo VIP'}</small></span></a>
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
            <span class="muted row" style="gap:6px;font-size:13px">${I('clock')} ${nxt.key === 'reuniao' ? '45 a 60 min' : nxt.minutes + ' min'}</span>
            <a class="link" href="#/jornada" style="text-decoration:underline">Ver jornada ${I('arrow')}</a>
            <a class="btn gold" style="margin-left:auto" href="${stepHref(nxt)}">${nxt.key === 'reuniao' ? 'Ver detalhes' : 'Continuar etapa'}</a>
          </div>
        </div>
      </div>` : `<div class="empty">${I('star')}<p>Você concluiu toda a jornada de entrada.</p><a class="btn line sm" style="margin-top:12px" href="#/plano">Ver meu plano</a></div>`}
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
      ${j.onbDone || isAdmin() ? `
      <div class="card-h"><h2>Sua rede de conexões</h2><a class="link" href="#/comunidade/rede">Ver todos ${I('arrow')}</a></div>
      <div class="faces">${friends.slice(0, 5).map(f => `<a href="#/membro/${esc(f.id)}" title="${esc(f.name)}">${AV(f)}</a>`).join('')}${profiles.length - 1 - friends.length > 0 ? `<a class="more" href="#/comunidade" aria-label="Encontrar membros">+${profiles.length - 1 - friends.length}</a>` : ''}</div>
      <p class="muted" style="font-size:14px">Conecte-se com outros membros e amplie suas oportunidades.</p>
      <div style="text-align:right;margin-top:14px"><a class="btn gold sm" href="#/comunidade">Explorar rede</a></div>`
      : `<div class="card-h"><h2>Comunidade privada</h2>${I('lock', 'gold')}</div>
      <p class="muted" style="font-size:14px">A comunidade, o diretório de empresários e o Grupo VIP são liberados quando você conclui as etapas obrigatórias da jornada.</p>
      <div class="progress" style="margin:14px 0 6px"><i style="width:${Math.round(j.mandDone * 100 / j.mandTotal)}%"></i></div>
      <small class="muted">${j.mandDone} de ${j.mandTotal} etapas obrigatórias</small>
      <div style="text-align:right;margin-top:14px"><a class="btn gold sm" href="${nxt ? stepHref(nxt) : '#/jornada'}">Continuar jornada</a></div>`}
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
  <div class="page-h"><h1>Minha Jornada</h1><p>${j.onbDone ? 'Etapas obrigatórias concluídas. Você está integrado ao clube.' : `Conclua as ${j.mandTotal} etapas obrigatórias para liberar a comunidade e o Grupo VIP.`}</p></div>
  <div class="card glow" style="margin-bottom:18px"><div class="row"><div class="grow"><b>Progresso</b><div class="progress" style="margin-top:10px"><i style="width:${j.pct}%"></i></div><small class="muted">${j.done} de ${j.total} etapas</small></div><span class="serif gold" style="font-size:38px">${j.pct}%</span></div></div>
  <div class="timeline">
    ${j.steps.map(s => {
      const team = s.key === 'reuniao';
      return `
    <div class="tl-item ${s.status}">
      <div class="tl-dot">${s.status === 'done' ? I('check') : s.status === 'locked' ? I('lock') : String(s.ord).padStart(2, '0')}</div>
      <div class="card tl-card ${s.status === 'current' ? 'glow' : ''}">
        <div class="row" style="justify-content:space-between;gap:8px;flex-wrap:wrap">
          <span class="dim" style="font-size:12px;letter-spacing:.06em">ETAPA ${String(s.ord).padStart(2, '0')}${team ? ' · COM A EQUIPE' : ''}</span>
          ${s.status === 'done' ? `<span class="chip ok">${I('check')} Concluída ${s.completed_at ? 'em ' + fmtData(s.completed_at) : ''}</span>` : s.status === 'current' ? `<span class="chip gold">${team ? 'Aguardando a equipe' : 'Em andamento'}</span>` : `<span class="chip">Bloqueada</span>`}
        </div>
        <h3 style="margin-top:6px">${esc(s.title)}</h3>
        <p>${esc(s.description)}</p>
        <div class="acts">
          <span class="muted row" style="gap:6px;font-size:13px">${I('clock')} ${team ? '45 a 60 min' : s.minutes + ' min'}</span>
          ${s.status === 'current' ? `<a class="btn gold sm" href="${s.key === 'boas-vindas' ? '#/jornada/boas-vindas' : esc(s.route)}">${esc(s.label || 'Continuar')}</a>` : ''}
          ${s.status === 'done' && /^#\/onboarding/.test(s.route) ? `<a class="link" href="${esc(s.route)}">Revisar respostas ${I('arrow')}</a>` : ''}
        </div>
      </div>
    </div>`; }).join('')}
  </div>
  ${j.onbDone ? `<a class="btn line block" href="#/integrado" style="margin-top:8px">${I('star')} Acessar o Grupo VIP</a>` : ''}`;
};

/* ---------- Formulário de onboarding (5 blocos do documento) ---------- */
const SEGMENTOS = ['Agronegócio','Construção civil','Consultoria estratégica','Educação','Holding e investimentos','Indústria de alimentos','Indústria','Jurídico','Logística','Marketing e comunicação','Mercado imobiliário','Saúde','Serviços financeiros','Tecnologia','Varejo e e-commerce','Outro'];
const FAIXAS = ['Até R$ 100 mil','De R$ 100 mil a R$ 300 mil','De R$ 300 mil a R$ 500 mil','De R$ 500 mil a R$ 1 milhão','De R$ 1 milhão a R$ 3 milhões','De R$ 3 milhões a R$ 10 milhões','Acima de R$ 10 milhões'];
const EQUIPES = ['1 a 10','11 a 50','51 a 200','201 a 500','Acima de 500'];
const DESAFIOS = ['Crescimento e expansão','Vendas e aquisição de clientes','Gestão comercial','Processos e operação','Gestão de pessoas','Gestão financeira','Posicionamento e marca','Inovação e tecnologia','Outros'];
const AREAS_DONO = ['Vendas','Relacionamento com clientes','Financeiro','Operação','Pessoas','Marketing','Produto','Nenhuma'];
const SNT = ['Sim','Talvez','Não'];
// [id, pergunta, tipo, obrigatória, opções, dica]
const BLOCOS = [
  { key:'membro', title:'Conhecendo o membro', intro:'Queremos conhecer você e a sua trajetória.', q:[
    ['q1','Nome completo','text',1],
    ['q2','Cargo ou função dentro da empresa','text',1,null,'Ex.: Fundador e CEO'],
    ['q3','Cidade e estado','text',1,null,'Ex.: São Paulo/SP'],
    ['q4','Há quantos anos empreende?','radio',1,['Menos de 2 anos','De 2 a 5 anos','De 5 a 10 anos','De 10 a 20 anos','Mais de 20 anos']],
    ['q5','Como você descreveria sua trajetória empresarial?','textarea',0],
    ['q6','Qual foi o principal motivo que fez você entrar no Clube do ROI?','textarea',1]] },
  { key:'empresa', title:'Conhecendo sua empresa', intro:'Agora, o negócio que você construiu.', q:[
    ['q7','Qual é o nome da sua empresa?','text',1],
    ['q8','Qual é o site da empresa?','text',0,null,'empresa.com.br'],
    ['q9','Qual é o Instagram da empresa?','text',0,null,'@empresa'],
    ['q10','Em qual segmento sua empresa atua?','select',1,SEGMENTOS],
    ['q11','Qual é o principal produto ou serviço comercializado?','textarea',1],
    ['q12','Como funciona seu modelo de negócio?','textarea',0,null,'Ex.: B2B, contratos recorrentes, venda por projeto, franquias...'],
    ['q13','Qual é o faturamento médio mensal da empresa?','radio',1,FAIXAS],
    ['q14','Quantas pessoas trabalham atualmente na empresa?','radio',1,EQUIPES],
    ['q15','Sua empresa possui outras unidades, filiais ou franquias?','radio',0,['Não','Sim, filiais','Sim, franquias','Sim, outras unidades']],
    ['q16','Qual é seu nível de participação na operação atualmente?','radio',0,['Estou na operação o dia todo','Divido a operação e a estratégia','Atuo mais na estratégia','Participo só como sócio ou conselheiro']]] },
  { key:'diagnostico', title:'Diagnóstico empresarial', intro:'O momento atual da empresa e o que trava o crescimento.', q:[
    ['q17','Qual é hoje o maior desafio da sua empresa?','radio',1,DESAFIOS],
    ['q18','O que atualmente mais impede sua empresa de crescer?','textarea',1],
    ['q19','Quais áreas da empresa ainda dependem excessivamente de você?','multi',0,AREAS_DONO],
    ['q20','Sua empresa possui processos comerciais e operacionais estruturados?','radio',0,['Sim, bem estruturados','Parcialmente','Ainda não']],
    ['q21','Quais estratégias de crescimento você já tentou implementar e não conseguiu executar como gostaria?','textarea',0]] },
  { key:'futuro', title:'Oportunidades e visão de futuro', intro:'Para onde você quer levar a empresa.', q:[
    ['q22','Qual é o principal objetivo da sua empresa para os próximos 12 meses?','textarea',1],
    ['q23','Você pretende expandir para novos mercados ou regiões?','radio',0,SNT],
    ['q24','Tem interesse em desenvolver novos produtos, serviços ou fontes de receita?','radio',0,SNT],
    ['q25','Existe interesse em adquirir empresas, fazer parcerias ou se conectar com outros negócios?','multi',0,['Adquirir empresas','Parcerias','Conexão com outros negócios','No momento, não']],
    ['q26','Quais áreas você gostaria de desenvolver com o apoio de especialistas?','multi',0,DESAFIOS.filter(x => x !== 'Outros')],
    ['q90','Se você pudesse resolver apenas um grande problema da sua empresa nos próximos 90 dias, qual seria?','strategic',1]] },
  { key:'networking', title:'Networking e conexões estratégicas', intro:'Suas respostas ajudam a equipe a mapear interesses e conectar você às pessoas certas.', q:[
    ['q27','Que tipo de empresário você gostaria de conhecer dentro do clube?','textarea',1],
    ['q28','Quais mercados ou segmentos são estratégicos para você?','multi',0,SEGMENTOS.filter(x => x !== 'Outro')],
    ['q29','O que você acredita que poderia oferecer aos outros membros do ecossistema?','textarea',1],
    ['q30','Você tem interesse em participar de encontros, jantares e experiências presenciais?','radio',0,['Sim, com frequência','De vez em quando','Prefiro encontros online']],
    ['q31','Existe alguma parceria estratégica que você está buscando atualmente?','textarea',0]] },
];
const ALLQ = BLOCOS.flatMap((b, i) => b.q.map(q => ({ id: q[0], label: q[1], type: q[2], req: q[3], bloco: i })));
const ansText = v => Array.isArray(v) ? v.join(', ') : (v || '');

function qField([id, label, type, req, opts, ph], val) {
  const num = id === 'q90' ? '' : `<span class="qn">${id.slice(1)}</span>`;
  const star = req ? ' <span class="gold" aria-label="obrigatória">*</span>' : '';
  if (type === 'radio' || type === 'multi') {
    const arr = Array.isArray(val) ? val : [val];
    return `<fieldset class="q"><legend>${num}${esc(label)}${star}${type === 'multi' ? ' <small class="dim">(pode marcar mais de uma)</small>' : ''}</legend>
      <div class="opts">${opts.map((o, k) => `<label class="opt"><input type="${type === 'multi' ? 'checkbox' : 'radio'}" name="${id}" value="${esc(o)}" ${arr.includes(o) ? 'checked' : ''} id="${id}-${k}"><span>${esc(o)}</span></label>`).join('')}</div></fieldset>`;
  }
  const lab = `<label for="${id}">${num}${esc(label)}${star}</label>`;
  if (type === 'select') return `<div class="q field">${lab}<select class="input" id="${id}" name="${id}"><option value="">Selecione</option>${opts.map(o => `<option ${o === val ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select></div>`;
  if (type === 'textarea') return `<div class="q field">${lab}<textarea class="input" id="${id}" name="${id}" placeholder="${esc(ph || '')}">${esc(val)}</textarea></div>`;
  if (type === 'strategic') return `<div class="q strategic"><span class="chip gold">Pergunta estratégica</span><label for="${id}" class="serif">${esc(label)}${star}</label><textarea class="input" id="${id}" name="${id}">${esc(val)}</textarea></div>`;
  return `<div class="q field">${lab}<input class="input" id="${id}" name="${id}" value="${esc(val)}" placeholder="${esc(ph || '')}"></div>`;
}
function readForm(f) {
  const out = {};
  const fd = new FormData(f);
  for (const q of ALLQ) if (f.querySelector(`[name="${q.id}"]`)) out[q.id] = q.type === 'multi' ? fd.getAll(q.id) : String(fd.get(q.id) || '').trim();
  return out;
}
async function myOnboarding() { const [o] = await db.list('onboarding', { eq: { user_id: S.me } }); return o || { user_id: S.me, answers: {} }; }

V.onboarding = async (arg) => {
  const n = Math.min(5, Math.max(1, Number(arg) || 1)), bl = BLOCOS[n - 1];
  const [j, ob] = await Promise.all([journey(), myOnboarding()]);
  const ans = { ...ob.answers };
  if (!ans.q1) ans.q1 = S.profile.name; if (!ans.q3) ans.q3 = S.profile.city; if (!ans.q7) ans.q7 = S.profile.company;
  const step = j.steps.find(s => s.key === bl.key);
  if (step && step.status === 'locked') {
    const cur = j.current;
    return `<div class="empty">${I('lock')}<p>Este bloco é liberado depois da etapa anterior.</p>${cur ? `<a class="btn line sm" style="margin-top:12px" href="${cur.key === 'boas-vindas' ? '#/jornada/boas-vindas' : esc(cur.route)}">Ir para ${esc(cur.title)}</a>` : ''}</div>`;
  }
  S.onb = { ...ob.answers };
  return `
  <div class="onb-head">
    <span class="dim" style="font-size:12px;letter-spacing:.08em">FORMULÁRIO DE ONBOARDING · BLOCO ${n} DE 5</span>
    <div class="steps5" aria-hidden="true">${BLOCOS.map((b, i) => { const st = j.steps.find(s => s.key === b.key); return `<i class="${st && st.status === 'done' ? 'done' : i === n - 1 ? 'on' : ''}"></i>`; }).join('')}</div>
    <h1 class="serif">${esc(bl.title)}</h1>
    <p class="muted">${esc(bl.intro)}</p>
  </div>
  <form class="card onb" data-form="onb" data-n="${n}" novalidate>
    ${bl.q.map(q => qField(q, ans[q[0]] ?? (q[2] === 'multi' ? [] : ''))).join('')}
    <p class="autosave dim" id="autosave">${ob.updated_at ? `${I('check')} Respostas salvas automaticamente` : 'Suas respostas são salvas automaticamente.'}</p>
    <div class="onb-nav">
      ${n > 1 ? `<a class="btn ghost" href="#/onboarding/${n - 1}">${I('left')} Voltar</a>` : `<a class="btn ghost" href="#/jornada">${I('left')} Jornada</a>`}
      <button class="btn gold" type="submit">${n < 5 ? 'Salvar e continuar' : 'Concluir onboarding'} ${I('arrow')}</button>
    </div>
  </form>
  <p class="dim" style="font-size:12px;margin-top:12px;text-align:center">${I('lock')} Suas respostas são vistas só por você e pela equipe do Clube do ROI.</p>`;
};

let _saveT;
function autosave(f) {
  clearTimeout(_saveT);
  const el = $('#autosave'); if (el) el.textContent = 'Salvando...';
  _saveT = setTimeout(async () => {
    try {
      S.onb = { ...(S.onb || {}), ...readForm(f) };
      await db.upsert('onboarding', { user_id: S.me, answers: S.onb, updated_at: nowISO() });
      const e2 = $('#autosave'); if (e2) e2.innerHTML = `${I('check')} Salvo automaticamente às ${fmtHora(new Date())}`;
    } catch (e) { const e2 = $('#autosave'); if (e2) e2.textContent = 'Não foi possível salvar agora. Verifique sua conexão.'; }
  }, 700);
}

V.integrado = async () => {
  const [j, [vipCfg], acc] = await Promise.all([journey(), db.list('settings', { eq: { key: 'vip' } }), db.list('vip_access', { eq: { user_id: S.me } })]);
  if (!j.onbDone) return `<div class="empty">${I('lock')}<p>O convite para o Grupo VIP é liberado quando você conclui as etapas obrigatórias da jornada (${j.mandDone} de ${j.mandTotal}).</p><a class="btn gold sm" style="margin-top:12px" href="#/jornada">Ver minha jornada</a></div>`;
  const vip = (vipCfg && vipCfg.value) || {};
  const st = (acc[0] || {}).status;
  const open = !vip.approval || st === 'liberado';
  let cta;
  if (open && vip.link) cta = `<a class="btn gold block vip-btn" href="${esc(vip.link)}" target="_blank" rel="noopener">ACESSAR GRUPO VIP DO CLUBE DO ROI</a>`;
  else if (open) cta = `<p class="notice">Seu acesso está liberado. A equipe vai enviar o convite do grupo pelo seu WhatsApp.</p>`;
  else if (st === 'solicitado') cta = `<p class="notice">${I('clock', 'gold')} Solicitação recebida. A equipe valida a entrada de cada membro para preservar a exclusividade do grupo e libera seu acesso em breve.</p>`;
  else cta = `<button class="btn gold block vip-btn" data-act="vip">ACESSAR GRUPO VIP DO CLUBE DO ROI</button>`;
  return `
  <section class="integrado">
    <span class="seal">${LOGO()}</span>
    <p class="dim" style="letter-spacing:.14em;font-size:12px">JORNADA DE ENTRADA CONCLUÍDA</p>
    <h1 class="serif">Você está oficialmente integrado ao Clube do ROI.</h1>
    <p>Agora você tem acesso à nossa comunidade privada, um ambiente exclusivo para empresários que compartilham perspectivas, experiências, oportunidades e conexões estratégicas.</p>
    <p>Aqui, cada conexão pode abrir uma nova possibilidade de negócio.</p>
    <p class="serif gold" style="font-size:24px;margin:18px 0 22px">Bem-vindo ao círculo privado do Clube do ROI.</p>
    ${cta}
    ${vip.rules ? `<details class="card" style="text-align:left;margin-top:18px"><summary style="cursor:pointer;font-weight:600">Diretrizes do Grupo VIP</summary><p class="muted" style="white-space:pre-line;margin-top:10px;font-size:14px">${esc(vip.rules)}</p></details>` : ''}
    <div class="row" style="justify-content:center;gap:10px;margin-top:18px;flex-wrap:wrap"><a class="btn ghost sm" href="#/comunidade">${I('users')} Explorar a comunidade</a><a class="btn ghost sm" href="#/plano">${I('plan')} Próximos passos</a></div>
  </section>`;
};

V.perfil = async () => {
  const p = S.profile;
  const opt = (arr, v) => `<option value="">Selecione</option>` + arr.map(a => `<option ${a === v ? 'selected' : ''}>${esc(a)}</option>`).join('');
  return `
  <div class="page-h"><h1>Meu Perfil Empresarial</h1><p>Seu cartão de visitas no diretório do clube. As respostas do onboarding atualizam este perfil automaticamente.</p></div>
  <form class="card" data-form="profile">
    <div class="row" style="margin-bottom:18px">
      ${AV(p, 'lg')}
      <div><label class="btn ghost sm" for="avf">${I('edit')} Trocar foto</label><input id="avf" type="file" accept="image/*" class="sr" data-act="avatar"><p class="dim" style="font-size:12px;margin-top:6px">JPG ou PNG</p></div>
    </div>
    <div class="grid2">
      <div class="field"><label for="f1">Nome completo</label><input class="input" id="f1" name="name" value="${esc(p.name)}" required></div>
      <div class="field"><label for="f2">Cargo ou função</label><input class="input" id="f2" name="headline" value="${esc(p.headline)}" placeholder="Ex.: Fundador e CEO"></div>
      <div class="field"><label for="f3">Empresa</label><input class="input" id="f3" name="company" value="${esc(p.company)}" required></div>
      <div class="field"><label for="f4">Segmento</label><select class="input" id="f4" name="segment" required>${opt(SEGMENTOS, p.segment)}</select></div>
      <div class="field"><label for="f5">Faturamento médio mensal</label><select class="input" id="f5" name="revenue">${opt(FAIXAS, p.revenue)}</select></div>
      <div class="field"><label for="f6">Número de colaboradores</label><select class="input" id="f6" name="employees">${opt(EQUIPES, p.employees)}</select></div>
      <div class="field"><label for="f7">Cidade/UF</label><input class="input" id="f7" name="city" value="${esc(p.city)}" placeholder="São Paulo/SP" required></div>
      <div class="field"><label for="f8">WhatsApp (visível só para suas conexões)</label><input class="input" id="f8" name="phone" value="${esc(p.phone || '')}" inputmode="tel" placeholder="(11) 90000-0000"></div>
      <div class="field"><label for="f10">Site</label><input class="input" id="f10" name="site" value="${esc(p.site || '')}"></div>
      <div class="field"><label for="f11">Instagram</label><input class="input" id="f11" name="instagram" value="${esc(p.instagram || '')}"></div>
    </div>
    <div class="field"><label for="f9">Objetivos para os próximos 12 meses</label><textarea class="input" id="f9" name="goals">${esc(p.goals)}</textarea></div>
    <button class="btn gold block" type="submit">Salvar perfil</button>
  </form>`;
};

V.diagnosticos = async () => {
  const [j, ob] = await Promise.all([journey(), myOnboarding()]);
  const a = ob.answers || {};
  if (!Object.keys(a).length) return `<div class="page-h"><h1>Meu Diagnóstico</h1></div><div class="empty">${I('diag')}<p>Seu diagnóstico é montado a partir do formulário de onboarding.</p><a class="btn gold sm" style="margin-top:12px" href="#/onboarding/1">Começar o formulário</a></div>`;
  return `
  <div class="page-h"><h1>Meu Diagnóstico</h1><p>Suas respostas do onboarding. A equipe usa estas informações para montar sua ficha estratégica e seu plano.</p></div>
  ${a.q90 ? `<div class="card glow strategic-out"><span class="chip gold">Seu problema dos próximos 90 dias</span><p class="serif">“${esc(a.q90)}”</p></div>` : ''}
  <div class="list" style="margin-top:14px">${BLOCOS.map((b, i) => {
    const st = j.steps.find(s => s.key === b.key);
    return `<section class="card"><div class="card-h"><h3>${i + 1}. ${esc(b.title)}</h3>${st && st.status === 'done' ? `<span class="chip ok">${I('check')} Respondido</span>` : `<span class="chip">Pendente</span>`}</div>
      <dl class="answers">${b.q.filter(q => q[0] !== 'q90').map(q => `<div><dt>${esc(q[1])}</dt><dd>${esc(ansText(a[q[0]])) || '<span class="dim">Sem resposta</span>'}</dd></div>`).join('')}</dl>
      ${st && st.status !== 'locked' ? `<a class="link" href="#/onboarding/${i + 1}">${I('edit')} Editar respostas</a>` : ''}</section>`;
  }).join('')}</div>`;
};

V.plano = async () => {
  const [[plan], j] = await Promise.all([db.list('dev_plans', { eq: { user_id: S.me } }), journey()]);
  const meet = plan && plan.meeting_at ? new Date(plan.meeting_at) : null;
  const meetCard = `<section class="card glow" style="margin-bottom:14px"><div class="card-h"><h2>Reunião estratégica individual</h2>${plan && plan.meeting_status ? `<span class="chip ${plan.meeting_status === 'Realizada' ? 'ok' : 'gold'}">${esc(plan.meeting_status)}</span>` : ''}</div>
    ${meet ? `<div class="info-list"><div>${I('cal')} ${DOW[meet.getDay()]}, ${meet.getDate()} de ${MES_L[meet.getMonth()].toLowerCase()} · ${fmtHora(meet)}</div><div>${I('clock')} 45 a 60 minutos com a equipe do Clube do ROI</div></div>`
      : `<p class="muted" style="font-size:14px">${j.onbDone ? 'A equipe está analisando suas respostas e vai entrar em contato para agendar uma conversa de 45 a 60 minutos.' : 'Depois que você concluir o onboarding, a equipe analisa suas respostas e agenda uma conversa individual com você.'}</p>`}
    <details style="margin-top:8px"><summary class="link" style="cursor:pointer">Pauta da reunião</summary><ol class="muted" style="font-size:14px;margin:8px 0 0;padding-left:20px">${PAUTA.map(p => `<li>${p}</li>`).join('')}</ol></details></section>`;
  if (!plan || !(plan.objetivos || plan.prioridades || (plan.acoes || []).length)) return `
    <div class="page-h"><h1>Meu Plano de Desenvolvimento</h1><p>Seu plano é montado pela equipe depois da reunião estratégica e atualizado ao longo da sua participação no clube.</p></div>
    ${meetCard}
    <div class="empty">${I('plan')}<p>Seu plano ainda não foi publicado.</p></div>`;
  const acoes = plan.acoes || [];
  const sec = (t, v) => v ? `<section class="card"><div class="card-h"><h3>${t}</h3></div><p style="white-space:pre-line;color:var(--text)">${esc(v)}</p></section>` : '';
  return `
  <div class="page-h"><h1>Meu Plano de Desenvolvimento</h1><p>Atualizado em ${fmtData(plan.updated_at)}. Privado: só você e a equipe do clube têm acesso.</p></div>
  ${meetCard}
  <div class="split">
    <div class="list" style="margin-bottom:14px">${sec('Objetivos estratégicos', plan.objetivos)}${sec('Principais prioridades', plan.prioridades)}${sec('Oportunidades identificadas', plan.oportunidades)}</div>
    <div class="list">
      <section class="card"><div class="card-h"><h3>Ações recomendadas</h3><small class="muted">${acoes.filter(a => a.status === 'concluída').length}/${acoes.length}</small></div>
        <div class="list">${acoes.map((a, i) => `<label class="action ${a.status === 'concluída' ? 'is-done' : ''}"><input type="checkbox" data-act="plan-act" data-i="${i}" ${a.status === 'concluída' ? 'checked' : ''}><span class="grow"><b>${esc(a.texto)}</b><small>${a.responsavel ? esc(a.responsavel) : 'Sem responsável'}${a.prazo ? ' · até ' + fmtData(a.prazo + 'T12:00') : ''}</small></span><span class="chip ${a.status === 'concluída' ? 'ok' : a.prazo && new Date(a.prazo + 'T23:59') < Date.now() ? '' : 'gold'}">${esc(a.status || 'a fazer')}</span></label>`).join('') || '<p class="muted">Nenhuma ação ainda.</p>'}</div></section>
      <section class="card"><div class="card-h"><h3>Histórico de evolução</h3></div>
        <ul class="hist">${(plan.historico || []).slice().reverse().map(h => `<li><time>${fmtData(h.at)}</time>${esc(h.texto)}</li>`).join('')}</ul></section>
    </div>
  </div>`;
};
const PAUTA = ['Conhecer melhor a trajetória do empresário.','Entender o momento atual da empresa.','Aprofundar os principais desafios.','Identificar oportunidades de crescimento.','Entender as expectativas em relação ao clube.','Identificar possíveis conexões estratégicas.','Definir prioridades e próximos passos.'];

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

async function communityGate() {
  if (isAdmin()) return '';
  const j = await journey();
  if (j.onbDone) return '';
  return `<div class="page-h"><h1>Comunidade</h1></div><div class="card glow empty">${I('lock')}<p style="max-width:420px;margin:0 auto">A comunidade privada é liberada quando você conclui as etapas obrigatórias da sua jornada de entrada (${j.mandDone} de ${j.mandTotal}).</p><a class="btn gold sm" style="margin-top:14px" href="#/jornada">Continuar minha jornada</a></div>`;
}
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
  const g = await communityGate(); if (g) return g;
  const { profiles, conns, rel } = await social();
  const others = profiles.filter(p => p.id !== S.me && p.id !== 'u-admin' && p.company !== 'Clube do ROI');
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
  const g = await communityGate(); if (g) return g;
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
  const g = await communityGate(); if (g) return g;
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
  const [j, rs, conns, ob, ms] = await Promise.all([journey(), db.list('rsvps', { eq: { user_id: S.me } }), db.list('connections'), myOnboarding(), db.list('messages')]);
  const acc = conns.filter(c => c.status === 'aceita').length;
  const a = ob.answers || {};
  const row = (l, v) => v ? `<div><dt>${l}</dt><dd>${esc(ansText(v))}</dd></div>` : '';
  return `
  <div class="page-h"><h1>Relatórios</h1><p>Sua evolução dentro do clube.</p></div>
  <div class="kpis">
    <div class="kpi">${I('rocket')}<span><b>${j.pct}%</b><small>Jornada concluída</small></span></div>
    <div class="kpi">${I('cal')}<span><b>${rs.length}</b><small>Eventos confirmados</small></span></div>
    <div class="kpi">${I('users')}<span><b>${acc}</b><small>Conexões</small></span></div>
    <div class="kpi">${I('msg')}<span><b>${ms.length}</b><small>Mensagens trocadas</small></span></div>
  </div>
  <div class="split">
    <section class="card" style="margin-bottom:14px"><div class="card-h"><h2>Evolução da jornada</h2></div>${evolutionChart(j)}</section>
    <section class="card"><div class="card-h"><h2>Resumo do diagnóstico</h2><a class="link" href="#/diagnosticos">Ver tudo ${I('arrow')}</a></div>
      ${Object.keys(a).length ? `<dl class="answers compact">${row('Maior desafio', a.q17)}${row('O que impede o crescimento', a.q18)}${row('Objetivo para 12 meses', a.q22)}${row('Problema para resolver em 90 dias', a.q90)}${row('Áreas que dependem de você', a.q19)}</dl>` : `<div class="empty">${I('diag')}<p>Responda o onboarding para ver seu resumo.</p></div>`}</section>
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
  journey_steps: { label: 'Etapas', order: 'ord', cols: ['ord', 'title', 'minutes'], fields: [['ord', 'Ordem', 'number'], ['key', 'Chave (ex.: membro)', 'text'], ['title', 'Título', 'text'], ['description', 'Descrição', 'textarea'], ['minutes', 'Duração (min)', 'number'], ['route', 'Link da ação (ex.: #/onboarding/1)', 'text'], ['label', 'Texto do botão', 'text']] },
  events: { label: 'Eventos', order: 'starts_at', cols: ['starts_at', 'title', 'place'], fields: [['title', 'Título', 'text'], ['kind', 'Tipo (Jantar, Masterclass...)', 'text'], ['starts_at', 'Data e hora', 'datetime-local'], ['place', 'Local', 'text'], ['mode', 'Formato', 'text'], ['seats', 'Vagas', 'number'], ['link', 'Link da sala (online)', 'text'], ['cover', 'Imagem de capa (URL)', 'text'], ['description', 'Descrição', 'textarea']] },
  materials: { label: 'Biblioteca', order: 'published_at', cols: ['published_at', 'title', 'kind'], fields: [['title', 'Título', 'text'], ['kind', 'Tipo (PDF, Vídeo, Link)', 'text'], ['category', 'Categoria', 'text'], ['size', 'Tamanho/duração', 'text'], ['url', 'URL do arquivo', 'text'], ['cover', 'Capa (URL)', 'text'], ['published_at', 'Publicado em', 'datetime-local']] },
  mentors: { label: 'Mentores', order: 'name', cols: ['name', 'specialty'], fields: [['name', 'Nome', 'text'], ['specialty', 'Especialidade', 'text'], ['bio', 'Bio', 'textarea'], ['avatar', 'Foto (URL)', 'text']] },
};
const STATUS = ['Compra confirmada', 'Contato realizado', 'Acesso enviado', 'Onboarding em andamento', 'Onboarding concluído', 'Reunião agendada', 'Reunião realizada', 'Plano ativo'];
const TEAM_ROLES = [['contato', 'Primeiro contato individual'], ['onboarding', 'Acompanhamento do onboarding'], ['diagnostico', 'Análise dos diagnósticos'], ['reunioes', 'Reuniões individuais'], ['vip', 'Administrador do Grupo VIP'], ['eventos', 'Eventos e experiências'], ['plataforma', 'Plataforma']];
const daysSince = iso => iso ? Math.floor((Date.now() - new Date(iso)) / 864e5) : null;

async function adminData() {
  const [intakes, profiles, steps, ms, obs, vips, plans, sheets, sets, mentors, roles] = await Promise.all([
    db.list('member_intake', { order: 'acquired_at', desc: true }), db.list('profiles'), db.list('journey_steps', { order: 'ord' }), db.list('member_steps'),
    db.list('onboarding'), db.list('vip_access'), db.list('dev_plans'), db.list('member_sheets'), db.list('settings'), db.list('mentors', { order: 'name' }), db.list('user_roles')]);
  const mand = steps.filter(s => s.key !== 'reuniao');
  const setting = k => ((sets.find(x => x.key === k) || {}).value) || {};
  const info = it => {
    const uid_ = it.user_id;
    const mine = ms.filter(m => m.user_id === uid_ && m.status === 'concluida');
    const mandDone = mand.filter(s => mine.some(m => m.step_id === s.id)).length;
    const ob = obs.find(o => o.user_id === uid_);
    const plan = plans.find(p => p.user_id === uid_);
    let i = Math.max(0, STATUS.indexOf(it.status));
    if (uid_) i = Math.max(i, 2);
    if (mandDone > 0) i = Math.max(i, 3);
    if (mand.length && mandDone === mand.length) i = Math.max(i, 4);
    if (plan && plan.meeting_status === 'Agendada') i = Math.max(i, 5);
    if (plan && plan.meeting_status === 'Realizada') i = Math.max(i, 6);
    if (plan && (plan.acoes || []).length) i = Math.max(i, 7);
    const last = [it.updated_at, ob && ob.updated_at, ...mine.map(m => m.completed_at), plan && plan.updated_at].filter(Boolean).sort().pop();
    const idle = daysSince(last);
    const stalled = (i < 4 && idle >= 3) || (i >= 4 && i < 6 && idle >= 7);
    return { it, status: STATUS[i], si: i, pct: steps.length ? Math.round(mine.length * 100 / steps.length) : 0, mandDone, mandTotal: mand.length, ob, plan, sheet: sheets.find(x => x.user_id === uid_), vip: vips.find(v => v.user_id === uid_), profile: profiles.find(p => p.id === uid_), idle, stalled };
  };
  return { intakes, profiles, steps, obs, vips, plans, sheets, mentors, roles, setting, info, rows: intakes.map(info) };
}

V.admin = async (arg) => {
  arg = arg || 'membros';
  if (!isAdmin()) return `<div class="empty">${I('lock')}<p>Área restrita à equipe do clube.</p></div>`;
  const [tab, sub] = arg.split('/');
  if (tab === 'ficha') return ficha(sub);
  const tabs = [['membros', 'Membros'], ['novo', 'Novo membro'], ['vip', 'Grupo VIP'], ['equipe', 'Equipe'], ['solicitacoes', 'Mentorias'], ...Object.entries(ADMIN).map(([k, v]) => [k, v.label])];
  let body = '';
  if (tab === 'membros') {
    const d = await adminData();
    const f = S.admFilter || '';
    const rows = d.rows.filter(r => !f || (f === 'parados' ? r.stalled : r.status === f));
    const cnt = st => d.rows.filter(r => r.status === st).length;
    body = `
    <div class="kpis">
      <div class="kpi">${I('users')}<span><b>${d.rows.length}</b><small>Membros cadastrados</small></span></div>
      <div class="kpi">${I('compass')}<span><b>${d.rows.filter(r => r.si === 3).length}</b><small>Em onboarding</small></span></div>
      <div class="kpi">${I('check')}<span><b>${d.rows.filter(r => r.si >= 4).length}</b><small>Integrados</small></span></div>
      <button class="kpi warn" data-act="adm-filter" data-f="parados">${I('clock')}<span><b>${d.rows.filter(r => r.stalled).length}</b><small>Parados no processo</small></span></button>
    </div>
    <div class="tabs pipeline" aria-label="Filtrar por status"><button class="${!f ? 'on' : ''}" data-act="adm-filter" data-f="">Todos (${d.rows.length})</button>${STATUS.map(st => `<button class="${f === st ? 'on' : ''}" data-act="adm-filter" data-f="${esc(st)}">${esc(st)} (${cnt(st)})</button>`).join('')}<button class="${f === 'parados' ? 'on' : ''}" data-act="adm-filter" data-f="parados">Parados</button></div>
    <div class="list">${rows.map(r => `
      <a class="card member mrow" href="#/admin/ficha/${esc(r.it.id)}">
        ${AV(r.profile || { name: r.it.name })}
        <span class="grow" style="min-width:0"><b class="ellip" style="display:block">${esc(r.it.name)}</b><small class="ellip">${esc(r.it.company)} · resp. ${esc(r.it.owner || '—')} · entrou em ${fmtData(r.it.acquired_at)}</small>
          <span class="row" style="gap:8px;margin-top:6px;flex-wrap:wrap"><span class="chip ${r.si >= 4 ? 'ok' : 'gold'}">${esc(r.status)}</span>${r.stalled ? `<span class="chip bad">${I('clock')} Parado há ${r.idle} dias</span>` : ''}${r.si === 3 ? `<span class="chip">${r.mandDone}/${r.mandTotal} etapas</span>` : ''}</span></span>
        <span class="mini-prog" aria-label="${r.pct}% da jornada"><i style="height:${r.pct}%"></i></span>
      </a>`).join('') || `<div class="empty">${I('users')}<p>Nenhum membro neste filtro.</p></div>`}</div>`;
  } else if (tab === 'novo') {
    const team = await db.list('settings', { eq: { key: 'team' } });
    const t = (team[0] || {}).value || {};
    const names = [...new Set(Object.values(t).filter(Boolean))];
    body = `<form class="card" data-form="intake" style="max-width:640px">
      <p class="muted" style="margin-bottom:16px">Etapa 1 · Registre o empresário logo após a confirmação da compra no jantar. A equipe faz o contato individual antes de enviar o acesso.</p>
      <div class="grid2">
        <div class="field"><label for="in1">Nome completo</label><input class="input" id="in1" name="name" required></div>
        <div class="field"><label for="in2">Telefone (WhatsApp)</label><input class="input" id="in2" name="phone" inputmode="tel" placeholder="(11) 90000-0000" required></div>
        <div class="field"><label for="in3">E-mail</label><input class="input" id="in3" name="email" type="email" inputmode="email" required></div>
        <div class="field"><label for="in4">Empresa</label><input class="input" id="in4" name="company" required></div>
        <div class="field"><label for="in5">Responsável pelo relacionamento</label><input class="input" id="in5" name="owner" list="team-names" value="${esc(t.contato || '')}" required><datalist id="team-names">${names.map(n => `<option value="${esc(n)}">`).join('')}</datalist></div>
        <div class="field"><label for="in6">Data da aquisição</label><input class="input" id="in6" name="acquired_at" type="date" value="${new Date().toISOString().slice(0, 10)}" required></div>
      </div>
      <div class="field"><label for="in7">Observações do jantar</label><textarea class="input" id="in7" name="notes" placeholder="Com quem sentou, o que comentou, interesses..."></textarea></div>
      <button class="btn gold block">Registrar membro</button></form>`;
  } else if (tab === 'vip') {
    const [[cfg], vips, profiles] = await Promise.all([db.list('settings', { eq: { key: 'vip' } }), db.list('vip_access'), db.list('profiles')]);
    const v = (cfg && cfg.value) || {};
    const pend = vips.filter(x => x.status === 'solicitado');
    body = `<div class="split">
      <form class="card" data-form="vipcfg" style="margin-bottom:14px">
        <div class="card-h"><h2>Configuração do grupo</h2></div>
        <div class="field"><label for="v1">Link oficial do grupo de WhatsApp</label><input class="input" id="v1" name="link" value="${esc(v.link || '')}" placeholder="https://chat.whatsapp.com/..."></div>
        <label class="action" style="margin-bottom:14px"><input type="checkbox" name="approval" ${v.approval ? 'checked' : ''}><span class="grow"><b>Entrada controlada pela equipe</b><small>O membro solicita ao concluir o onboarding e o link só aparece depois que a equipe aprova.</small></span></label>
        <div class="field"><label for="v2">Diretrizes e regras de convivência</label><textarea class="input" id="v2" name="rules" style="min-height:160px">${esc(v.rules || '')}</textarea></div>
        <p class="dim" style="font-size:12px;margin-bottom:12px">Dica: no WhatsApp, ative “Aprovar novos participantes” nas configurações do grupo. Assim, mesmo que o link vaze, ninguém entra sem a aprovação de um administrador.</p>
        <button class="btn gold block">Salvar</button>
      </form>
      <section class="card"><div class="card-h"><h2>Solicitações de entrada</h2><span class="chip gold">${pend.length}</span></div>
        <div class="list">${pend.map(x => { const p = profiles.find(y => y.id === x.user_id) || { name: 'Membro' }; return `<div class="member">${AV(p, 'sm')}<span class="grow"><b style="font-size:14px">${esc(p.name)}</b><small>${esc(p.company || '')} · ${ago(x.requested_at)}</small></span><button class="btn gold sm" data-act="vip-ok" data-id="${esc(x.user_id)}">Liberar</button></div>`; }).join('') || `<p class="muted">Nenhuma solicitação pendente.</p>`}</div>
        <p class="muted" style="font-size:13px;margin-top:14px">${vips.filter(x => x.status === 'liberado').length} membros com acesso liberado.</p></section></div>`;
  } else if (tab === 'equipe') {
    const [cfg] = await db.list('settings', { eq: { key: 'team' } });
    const t = (cfg && cfg.value) || {};
    body = `<form class="card" data-form="team" style="max-width:640px"><p class="muted" style="margin-bottom:16px">Quem cuida de cada parte da experiência do membro.</p>
      ${TEAM_ROLES.map(([k, l]) => `<div class="field"><label for="t-${k}">${l}</label><input class="input" id="t-${k}" name="${k}" value="${esc(t[k] || '')}"></div>`).join('')}
      <button class="btn gold block">Salvar responsáveis</button></form>`;
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
  return `<div class="page-h"><h1>Administração</h1><p>Onboarding, membros, agenda e conteúdos do clube.</p></div>
  <div class="tabs">${tabs.map(([k, l]) => `<a href="#/admin/${k}" class="${k === tab ? 'on' : ''}">${l}</a>`).join('')}</div>${body}`;
};

function suggestConnections(r, d) {
  const a = (r.ob && r.ob.answers) || {};
  const mySeg = (r.profile && r.profile.segment) || a.q10;
  const wants = a.q28 || [];
  return d.rows.filter(o => o.it.id !== r.it.id && o.profile).map(o => {
    const oa = (o.ob && o.ob.answers) || {};
    const seg = o.profile.segment || oa.q10;
    const why = [];
    if (seg && wants.includes(seg)) why.push(`atua em ${seg}, mercado estratégico para ${first(r.it.name)}`);
    if (mySeg && (oa.q28 || []).includes(mySeg)) why.push(`busca contatos em ${mySeg}`);
    if (a.q17 && oa.q17 && a.q17 === oa.q17) why.push(`mesmo desafio: ${a.q17.toLowerCase()}`);
    return { o, why };
  }).filter(x => x.why.length).sort((x, y) => y.why.length - x.why.length).slice(0, 5);
}

function welcomeMsg(r, team, pw) {
  const url = location.origin + location.pathname;
  return `Olá, ${first(r.it.name)}! Aqui é ${r.it.owner || team.contato || 'a equipe'}, do Clube do ROI.

Quero agradecer pela confiança e dar oficialmente as boas-vindas. A partir de agora você faz parte de um ecossistema privado de empresários que buscam novas perspectivas, conexões estratégicas e novas formas de criar receita.

Sua integração começa pela nossa plataforma. Lá você conhece o clube, apresenta sua empresa e compartilha seus objetivos. Leva uns 30 minutos e as respostas ficam salvas, então dá para fazer em partes.

Acesse: ${url}
Login: ${r.it.email}${pw ? `\nSenha provisória: ${pw}` : '\n(enviamos também um link de acesso para o seu e-mail)'}

Estou acompanhando sua entrada e fico à disposição para qualquer dúvida.`;
}

async function ficha(id) {
  const d = await adminData();
  const r = d.rows.find(x => x.it.id === id);
  if (!r) return notFound();
  const team = d.setting('team');
  const a = (r.ob && r.ob.answers) || {};
  const sh = r.sheet || {};
  const pl = r.plan || { acoes: [], historico: [] };
  const sug = suggestConnections(r, d);
  const phone = String(r.it.phone || '').replace(/\D/g, '');
  const msg = welcomeMsg(r, team, S.lastPw && S.lastPw.id === id ? S.lastPw.pw : null);
  const meetLocal = pl.meeting_at ? (dt => new Date(dt - dt.getTimezoneOffset() * 6e4).toISOString().slice(0, 16))(new Date(pl.meeting_at)) : '';
  return `
  <a class="link" href="#/admin/membros">${I('left')} Membros</a>
  <div class="card glow ficha-h" style="margin-top:12px">
    <div class="member">${AV(r.profile || { name: r.it.name }, 'lg')}<div class="grow" style="min-width:0"><h1 class="serif" style="font-size:30px">${esc(r.it.name)}</h1><p class="muted">${esc(r.it.company)}${a.q2 ? ' · ' + esc(a.q2) : ''}</p>
      <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><span class="chip ${r.si >= 4 ? 'ok' : 'gold'}">${esc(r.status)}</span>${r.stalled ? `<span class="chip bad">Parado há ${r.idle} dias</span>` : ''}<span class="chip">Jornada ${r.pct}%</span>${r.vip ? `<span class="chip ${r.vip.status === 'liberado' ? 'ok' : 'gold'}">VIP: ${esc(r.vip.status)}</span>` : ''}</div></div></div>
    <div class="info-list">
      <div>${I('phone')} ${esc(r.it.phone || '—')}</div><div>${I('msg')} ${esc(r.it.email)}</div>
      <div>${I('cal')} Entrou no jantar em ${fmtData(r.it.acquired_at)} · responsável: ${esc(r.it.owner || '—')}</div>
      ${r.it.notes ? `<div>${I('edit')} ${esc(r.it.notes)}</div>` : ''}
    </div>
    <div class="row" style="gap:8px;flex-wrap:wrap"><label for="st" class="muted" style="font-size:13px">Status manual</label><select class="input" id="st" style="max-width:260px;min-height:40px;padding:6px 10px" data-act="intake-status" data-id="${esc(id)}">${STATUS.map(s => `<option ${s === r.it.status ? 'selected' : ''}>${esc(s)}</option>`).join('')}</select>
      ${r.it.user_id ? (() => { const rl = (d.roles.find(x => x.user_id === r.it.user_id) || {}).role || 'membro'; return `<label for="rl" class="muted" style="font-size:13px">Papel</label><select class="input" id="rl" style="max-width:160px;min-height:40px;padding:6px 10px" data-act="role" data-id="${esc(r.it.user_id)}">${['membro', 'mentor', 'admin'].map(x => `<option ${x === rl ? 'selected' : ''}>${x}</option>`).join('')}</select>`; })() : ''}</div>
  </div>

  <section class="card" style="margin-top:14px">
    <div class="card-h"><h2>Contato individualizado</h2><span class="dim" style="font-size:12px">ETAPA 2</span></div>
    <p class="muted" style="font-size:14px;margin-bottom:10px">Agradeça, dê as boas-vindas e envie o acesso. Ajuste a mensagem antes de mandar.</p>
    <textarea class="input" id="wmsg" style="min-height:220px;font-size:14px">${esc(msg)}</textarea>
    <div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap">
      ${r.it.user_id ? `<button class="btn ghost sm" data-act="invite" data-id="${esc(id)}">${I('swap')} Reenviar acesso</button>` : `<button class="btn gold sm" data-act="invite" data-id="${esc(id)}">${I('uplus')} Gerar acesso à plataforma</button>`}
      <button class="btn line sm" data-act="copy-msg">${I('plan')} Copiar mensagem</button>
      ${phone ? `<a class="btn line sm" href="https://wa.me/55${esc(phone)}?text=" data-act="wa" target="_blank" rel="noopener">${I('msg')} Abrir no WhatsApp</a>` : ''}
      ${r.si < 1 ? `<button class="btn ghost sm" data-act="intake-mark" data-id="${esc(id)}" data-s="Contato realizado">${I('check')} Marcar contato realizado</button>` : ''}
    </div>
  </section>

  <section class="card" style="margin-top:14px">
    <div class="card-h"><h2>Respostas do onboarding</h2><span class="chip">${r.mandDone}/${r.mandTotal} etapas</span></div>
    ${!r.it.user_id ? `<p class="muted">Aguardando o primeiro acesso.</p>` : !Object.keys(a).length ? `<p class="muted">Ainda não começou o formulário.</p>` : `
    ${a.q90 ? `<div class="strategic-out"><span class="chip gold">Problema para resolver em 90 dias</span><p class="serif">“${esc(a.q90)}”</p></div>` : ''}
    ${BLOCOS.map((b, i) => `<details class="blk" ${i < 3 ? 'open' : ''}><summary>${i + 1}. ${esc(b.title)}</summary><dl class="answers">${b.q.filter(q => q[0] !== 'q90').map(q => `<div><dt>${q[0].slice(1)}. ${esc(q[1])}</dt><dd>${esc(ansText(a[q[0]])) || '<span class="dim">—</span>'}</dd></div>`).join('')}</dl></details>`).join('')}`}
  </section>

  <form class="card" data-form="sheet" data-uid="${esc(r.it.user_id || '')}" style="margin-top:14px">
    <div class="card-h"><h2>Ficha estratégica</h2><span class="dim" style="font-size:12px">ETAPA 6 · INTERNA</span></div>
    <dl class="answers compact">
      <div><dt>Segmento e modelo de negócio</dt><dd>${esc(a.q10 || (r.profile || {}).segment || '—')}${a.q12 ? ' · ' + esc(a.q12) : ''}</dd></div>
      <div><dt>Porte e estrutura</dt><dd>${esc([a.q13, a.q14 && a.q14 + ' pessoas', a.q15].filter(Boolean).join(' · ') || '—')}</dd></div>
      <div><dt>Principais desafios</dt><dd>${esc([a.q17, a.q18].filter(Boolean).join(' — ') || '—')}</dd></div>
      <div><dt>Objetivos para 12 meses</dt><dd>${esc(a.q22 || '—')}</dd></div>
    </dl>
    ${!r.it.user_id ? `<p class="muted">A ficha fica disponível depois do primeiro acesso do membro.</p>` : `
    <div class="field"><label for="sh1">Perfil do empresário</label><textarea class="input" id="sh1" name="perfil">${esc(sh.perfil || '')}</textarea></div>
    <div class="field"><label for="sh2">Oportunidades identificadas</label><textarea class="input" id="sh2" name="oportunidades">${esc(sh.oportunidades || '')}</textarea></div>
    <div class="field"><label for="sh3">Possíveis conexões estratégicas</label><textarea class="input" id="sh3" name="conexoes">${esc(sh.conexoes || '')}</textarea>
      ${sug.length ? `<div class="sug"><small class="dim">Sugestões a partir das respostas:</small>${sug.map(x => `<button type="button" class="sug-i" data-act="sug" data-t="${esc(x.o.it.name + ' (' + x.o.it.company + ')')}"><b>${esc(x.o.it.name)}</b> · ${esc(x.why.join('; '))}</button>`).join('')}</div>` : ''}</div>
    <fieldset class="q"><legend>Especialistas e mentores relevantes</legend><div class="opts">${d.mentors.map(m => `<label class="opt"><input type="checkbox" name="especialistas" value="${esc(m.id)}" ${(sh.especialistas || []).includes(m.id) ? 'checked' : ''}><span>${esc(m.name)} · ${esc(m.specialty)}</span></label>`).join('')}</div></fieldset>
    <div class="field"><label for="sh4">Próximos passos recomendados</label><textarea class="input" id="sh4" name="proximos">${esc(sh.proximos || '')}</textarea></div>
    <button class="btn gold block">Salvar ficha</button>`}
  </form>

  ${r.it.user_id ? `
  <form class="card" data-form="meeting" data-uid="${esc(r.it.user_id)}" data-iid="${esc(id)}" style="margin-top:14px">
    <div class="card-h"><h2>Reunião estratégica individual</h2><span class="dim" style="font-size:12px">ETAPA 7 · 45 A 60 MIN</span></div>
    <div class="grid2">
      <div class="field"><label for="mt1">Data e hora</label><input class="input" id="mt1" type="datetime-local" name="meeting_at" value="${meetLocal}"></div>
      <div class="field"><label for="mt2">Situação</label><select class="input" id="mt2" name="meeting_status">${['Não agendada', 'Agendada', 'Realizada'].map(x => `<option ${x === (pl.meeting_status || 'Não agendada') ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
    </div>
    <details style="margin-bottom:14px"><summary class="link" style="cursor:pointer">Pauta sugerida</summary><ol class="muted" style="font-size:14px;margin:8px 0 0;padding-left:20px">${PAUTA.map(p => `<li>${p}</li>`).join('')}</ol></details>
    <button class="btn gold block">Salvar reunião</button>
  </form>

  <form class="card" data-form="devplan" data-uid="${esc(r.it.user_id)}" data-iid="${esc(id)}" style="margin-top:14px">
    <div class="card-h"><h2>Plano de desenvolvimento</h2><span class="dim" style="font-size:12px">ETAPA 8 · VISÍVEL PARA O MEMBRO</span></div>
    <div class="field"><label for="dp1">Objetivos estratégicos</label><textarea class="input" id="dp1" name="objetivos">${esc(pl.objetivos || '')}</textarea></div>
    <div class="field"><label for="dp2">Principais prioridades</label><textarea class="input" id="dp2" name="prioridades">${esc(pl.prioridades || '')}</textarea></div>
    <div class="field"><label for="dp3">Oportunidades identificadas</label><textarea class="input" id="dp3" name="oportunidades">${esc(pl.oportunidades || sh.oportunidades || '')}</textarea></div>
    <b style="display:block;margin:6px 0 10px">Ações recomendadas</b>
    <div class="list" id="acoes">${(pl.acoes || []).map((x, i) => acaoRow(x, i)).join('')}</div>
    <button type="button" class="btn line sm" style="margin-top:10px" data-act="add-acao">${I('plus')} Adicionar ação</button>
    <div class="field" style="margin-top:14px"><label for="dp4">Registrar no histórico de evolução (opcional)</label><input class="input" id="dp4" name="hist" placeholder="Ex.: Primeira reunião com mentora realizada"></div>
    <button class="btn gold block">Salvar e publicar plano</button>
    ${(pl.historico || []).length ? `<ul class="hist" style="margin-top:16px">${pl.historico.slice().reverse().map(h => `<li><time>${fmtData(h.at)}</time>${esc(h.texto)}</li>`).join('')}</ul>` : ''}
  </form>` : ''}`;
}
const acaoRow = (x = {}, i) => `<div class="acao"><input class="input" name="a_texto" value="${esc(x.texto || '')}" placeholder="Ação" aria-label="Ação"><input class="input" name="a_resp" value="${esc(x.responsavel || '')}" placeholder="Responsável" aria-label="Responsável"><input class="input" type="date" name="a_prazo" value="${esc(x.prazo || '')}" aria-label="Prazo"><select class="input" name="a_status" aria-label="Situação">${['a fazer', 'em andamento', 'concluída'].map(s => `<option ${s === (x.status || 'a fazer') ? 'selected' : ''}>${s}</option>`).join('')}</select><button type="button" class="iconbtn" data-act="del-acao" aria-label="Remover ação">${I('x')}</button></div>`;

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
      ${[['perfil', 'Meu Perfil Empresarial', 'user'], ['diagnosticos', 'Diagnósticos', 'diag'], ['biblioteca', 'Biblioteca', 'book'], ['mentores', 'Mentores', 'mentor'], ['mensagens', 'Mensagens', 'msg'], ['plano', 'Meu Plano', 'plan'], ['integrado', 'Grupo VIP', 'star'], ['relatorios', 'Relatórios', 'chart'], ...(isAdmin() ? [['admin', 'Administração', 'shield']] : [])].map(([k, l, i]) => `<a href="#/${k}" data-act="close">${I(i)} ${l}</a>`).join('')}
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
    sheet(`<p class="dim" style="letter-spacing:.12em;font-size:12px">ETAPA 01 · BOAS-VINDAS</p><h3 class="serif" style="font-size:30px;margin:6px 0 12px">Bem-vindo ao Clube do ROI.</h3>
      <p class="muted" style="margin-bottom:10px">Você agora faz parte de um ecossistema privado de empresários que buscam novas perspectivas, conexões estratégicas e novas formas de criar receita.</p>
      <p class="muted" style="margin-bottom:18px">Esta é a primeira etapa da sua jornada. Queremos conhecer você, sua trajetória e o negócio que construiu para aproveitar ao máximo as oportunidades dentro do nosso ecossistema.</p>
      <b style="display:block;margin-bottom:10px">Como funciona a sua integração</b>
      <div class="list" style="gap:12px;margin-bottom:18px">
        ${[['diag', 'Formulário de onboarding', '5 blocos curtos sobre você, sua empresa, seus desafios, seus objetivos e as conexões que busca. Tudo é salvo automaticamente.'], ['star', 'Grupo VIP e comunidade', 'Ao concluir, você recebe o convite para o grupo oficial e acesso ao diretório de empresários.'], ['target', 'Reunião estratégica', 'A equipe analisa suas respostas e agenda uma conversa individual de 45 a 60 minutos.'], ['plan', 'Plano de desenvolvimento', 'Objetivos, prioridades e ações acompanhados pela equipe ao longo da sua participação.']]
          .map(([i, t, d]) => `<div class="row" style="align-items:flex-start">${I(i, 'gold')}<div><b>${t}</b><p class="muted" style="font-size:14px">${d}</p></div></div>`).join('')}
      </div>
      <button class="btn gold block" data-act="done-step" data-k="boas-vindas">Começar minha jornada</button>`);
  },
  async 'done-step'(el) { closeSheet(); await completeStep(el.dataset.k, true); location.hash = '#/onboarding/1'; },
  async vip() {
    await db.upsert('vip_access', { user_id: S.me, status: 'solicitado', requested_at: nowISO() });
    toast('Solicitação enviada à equipe'); route();
  },
  async 'vip-ok'(el) {
    await db.upsert('vip_access', { user_id: el.dataset.id, status: 'liberado', approved_at: nowISO() });
    await db.insert('notifications', { user_id: el.dataset.id, title: 'Grupo VIP liberado', body: 'Seu acesso ao grupo oficial do Clube do ROI foi aprovado.', link: '#/integrado', read: false });
    toast('Acesso liberado'); route();
  },
  'adm-filter'(el) { S.admFilter = el.dataset.f; route(); },
  async invite(el) {
    const [it] = await db.list('member_intake', { eq: { id: el.dataset.id } });
    const r = await db.auth.invite(it);
    if (r.password) S.lastPw = { id: it.id, pw: r.password };
    const patch = { updated_at: nowISO() };
    if (STATUS.indexOf(it.status) < 2) patch.status = 'Acesso enviado';
    await db.update('member_intake', { id: it.id }, patch);
    toast(r.password ? 'Acesso criado. A senha provisória está na mensagem.' : 'E-mail de acesso enviado'); route();
  },
  async 'copy-msg'() {
    const t = $('#wmsg');
    try { await navigator.clipboard.writeText(t.value); toast('Mensagem copiada'); } catch (e) { t.select(); toast('Selecionei o texto. Copie com Ctrl+C ou segurando o dedo.'); }
  },
  wa(el) { el.href = el.href.split('?')[0] + '?text=' + encodeURIComponent(($('#wmsg') || {}).value || ''); },
  async 'intake-mark'(el) { await db.update('member_intake', { id: el.dataset.id }, { status: el.dataset.s, updated_at: nowISO() }); toast('Status atualizado'); route(); },
  sug(el) { const t = $('#sh3'); t.value = (t.value ? t.value.replace(/\s*$/, '') + '\n' : '') + el.dataset.t; el.disabled = true; },
  'add-acao'() { $('#acoes').insertAdjacentHTML('beforeend', acaoRow({}, Date.now())); $('#acoes .acao:last-child input').focus(); },
  'del-acao'(el) { el.closest('.acao').remove(); },
  async 'plan-act'(el) {
    const [pl] = await db.list('dev_plans', { eq: { user_id: S.me } });
    const a = pl.acoes[Number(el.dataset.i)]; a.status = el.checked ? 'concluída' : 'em andamento';
    const historico = [...(pl.historico || [])]; if (el.checked) historico.push({ at: nowISO(), texto: `Ação concluída: ${a.texto}` });
    await db.update('dev_plans', { user_id: S.me }, { acoes: pl.acoes, historico, updated_at: nowISO() });
    toast(el.checked ? 'Ação concluída ✓' : 'Ação reaberta'); route();
  },
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
  'plan-act'(el) { return ACT['plan-act'](el); },
  async 'intake-status'(el) { await db.update('member_intake', { id: el.dataset.id }, { status: el.value, updated_at: nowISO() }); toast('Status atualizado'); },
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
    toast('Perfil salvo'); route();
  },
  async onb(f) {
    const n = Number(f.dataset.n), bl = BLOCOS[n - 1];
    const vals = readForm(f);
    const miss = bl.q.filter(q => q[3] && (Array.isArray(vals[q[0]]) ? !vals[q[0]].length : !vals[q[0]]));
    if (miss.length) {
      const el = f.querySelector(`[name="${miss[0][0]}"]`);
      if (el) { el.closest('.q').classList.add('miss'); el.closest('.q').scrollIntoView({ block: 'center', behavior: 'smooth' }); if (el.focus) el.focus({ preventScroll: true }); }
      return toast(`Falta responder: ${miss[0][1]}`);
    }
    clearTimeout(_saveT);
    S.onb = { ...(S.onb || {}), ...vals };
    await db.upsert('onboarding', { user_id: S.me, answers: S.onb, updated_at: nowISO() });
    const P_ = {};
    if (n === 1) Object.assign(P_, { name: vals.q1, headline: vals.q2, city: vals.q3 });
    if (n === 2) Object.assign(P_, { company: vals.q7, site: vals.q8, instagram: vals.q9, segment: vals.q10, revenue: vals.q13, employees: vals.q14 });
    if (n === 4) P_.goals = vals.q22;
    if (Object.keys(P_).length) { await db.update('profiles', { id: S.me }, P_); Object.assign(S.profile, P_); }
    const before = await journey();
    await completeStep(bl.key, true);
    const j = await journey();
    if (j.onbDone && !before.onbDone) { location.hash = '#/integrado'; }
    else { toast(`Bloco ${n} salvo ✓`); location.hash = n < 5 ? '#/onboarding/' + (n + 1) : '#/diagnosticos'; }
    scrollTo(0, 0);
  },
  async intake(f, fd) {
    const email = String(fd.email || '').trim().toLowerCase();
    if (!fd.name || !email || !fd.phone) return toast('Preencha nome, telefone e e-mail.');
    const ex = (await db.list('member_intake')).find(x => String(x.email).toLowerCase() === email);
    if (ex) { location.hash = '#/admin/ficha/' + ex.id; return toast('Este e-mail já está cadastrado.'); }
    const r = await db.insert('member_intake', { ...fd, email, acquired_at: new Date(fd.acquired_at + 'T12:00').toISOString(), status: 'Compra confirmada', user_id: null, updated_at: nowISO() });
    toast('Membro registrado. Próximo passo: contato individual.'); location.hash = '#/admin/ficha/' + r.id;
  },
  async vipcfg(f, fd) { await db.upsert('settings', { key: 'vip', value: { link: (fd.link || '').trim(), approval: !!fd.approval, rules: fd.rules || '' } }); toast('Configuração salva'); },
  async team(f, fd) { await db.upsert('settings', { key: 'team', value: fd }); toast('Responsáveis salvos'); },
  async sheet(f, fd) {
    if (!f.dataset.uid) return;
    await db.upsert('member_sheets', { user_id: f.dataset.uid, perfil: fd.perfil || '', oportunidades: fd.oportunidades || '', conexoes: fd.conexoes || '', especialistas: new FormData(f).getAll('especialistas'), proximos: fd.proximos || '', updated_at: nowISO() });
    toast('Ficha salva');
  },
  async meeting(f, fd) {
    const uid_ = f.dataset.uid;
    const [pl] = await db.list('dev_plans', { eq: { user_id: uid_ } });
    const at = fd.meeting_at ? new Date(fd.meeting_at).toISOString() : null;
    if (fd.meeting_status !== 'Não agendada' && !at) return toast('Informe a data e a hora da reunião.');
    const historico = [...((pl && pl.historico) || [])];
    if (!pl || pl.meeting_status !== fd.meeting_status) historico.push({ at: nowISO(), texto: fd.meeting_status === 'Realizada' ? 'Reunião estratégica realizada.' : fd.meeting_status === 'Agendada' ? `Reunião estratégica agendada para ${fmtData(at)} às ${fmtHora(new Date(at))}.` : 'Reunião desmarcada.' });
    await db.upsert('dev_plans', { ...(pl || { objetivos: '', prioridades: '', oportunidades: '', acoes: [] }), user_id: uid_, meeting_at: at, meeting_status: fd.meeting_status, historico, updated_at: nowISO() });
    if (fd.meeting_status === 'Agendada') {
      await db.insert('notifications', { user_id: uid_, title: 'Reunião estratégica agendada', body: `${DOW[new Date(at).getDay()]}, ${fmtData(at)} às ${fmtHora(new Date(at))}.`, link: '#/plano', read: false });
      await db.update('member_intake', { id: f.dataset.iid }, { status: 'Reunião agendada', updated_at: nowISO() });
    }
    if (fd.meeting_status === 'Realizada') {
      const step = (await db.list('journey_steps', { eq: { key: 'reuniao' } }))[0];
      if (step) await db.upsert('member_steps', { user_id: uid_, step_id: step.id, status: 'concluida', completed_at: nowISO() });
      await db.update('member_intake', { id: f.dataset.iid }, { status: 'Reunião realizada', updated_at: nowISO() });
    }
    toast('Reunião salva'); route();
  },
  async devplan(f, fd) {
    const uid_ = f.dataset.uid;
    const [pl] = await db.list('dev_plans', { eq: { user_id: uid_ } });
    const acoes = [...f.querySelectorAll('#acoes .acao')].map(r => ({ texto: r.querySelector('[name=a_texto]').value.trim(), responsavel: r.querySelector('[name=a_resp]').value.trim(), prazo: r.querySelector('[name=a_prazo]').value, status: r.querySelector('[name=a_status]').value })).filter(x => x.texto);
    const historico = [...((pl && pl.historico) || [])];
    historico.push({ at: nowISO(), texto: fd.hist ? fd.hist : (pl && (pl.acoes || []).length ? 'Plano atualizado pela equipe.' : 'Plano de desenvolvimento publicado.') });
    await db.upsert('dev_plans', { ...(pl || {}), user_id: uid_, objetivos: fd.objetivos || '', prioridades: fd.prioridades || '', oportunidades: fd.oportunidades || '', acoes, historico, updated_at: nowISO() });
    await db.insert('notifications', { user_id: uid_, title: 'Seu plano foi atualizado', body: 'A equipe publicou novidades no seu Plano de Desenvolvimento.', link: '#/plano', read: false });
    if (acoes.length) await db.update('member_intake', { id: f.dataset.iid }, { status: 'Plano ativo', updated_at: nowISO() });
    toast('Plano publicado para o membro'); route();
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
  const navSec = { evento: 'agenda', membro: 'comunidade', mensagens: 'comunidade', material: 'biblioteca', notificacoes: '', busca: '', onboarding: 'jornada' }[sec] ?? sec;
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
document.addEventListener('input', e => {
  if (e.target.matches('[data-act=msearch]')) memberFilter();
  const f = e.target.closest('form[data-form=onb]');
  if (f) { const q = e.target.closest('.q'); if (q) q.classList.remove('miss'); autosave(f); }
});
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
