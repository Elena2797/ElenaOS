import './main.css';
import { createClient } from '@supabase/supabase-js';
import * as dbSvc from './services/db.js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';
import * as isabelSvc from './services/isabel.js';
import * as invSvc from './services/inventory.js';
import * as hotoSvc from './services/hoto.js';

const PIN = '1965';
// Secciones e items EXACTOS del PDF oficial "Handover / Takeover Checklist" de VistaJet.
// No inventar items: este checklist replica el documento real.
const VJ_HOTO_SECTIONS=[
  {id:'galley',name:'GALLEY DAILY DUTIES',items:[
    {id:'g1',text:'Clean and disinfect all surfaces'},
    {id:'g2',text:'Clean Oven'},
    {id:'g3',text:'Clean Microwave'},
    {id:'g4',text:'Clean Coffee Machine'},
    {id:'g5',text:'Replenish tea and coffee from aft storage to galley'},
    {id:'g6',text:'Clean and disinfect Chiller'},
    {id:'g7',text:'Clean and disinfect Fridge (Global), Chiller (Challenger)'},
    {id:'g8',text:'Clean drawers (also rims)'},
    {id:'g9',text:'Wipe Oil/Vinegar servers and protect nozzle with aluminum'},
    {id:'g10',text:'Wipe Salt and Pepper grinders and refill'},
    {id:'g11',text:'Clean sink and washing up bowl'},
    {id:'g12',text:'Empty ice from ice drawer — no item left inside (butter, lemon slice…)'},
    {id:'g13',text:'All bottles protected by wine sleeve in ice drawer, sealed properly'},
    {id:'g14',text:'No item left opened in galley/crew box · no nuts in Zanetto bowls'},
    {id:'g15',text:'Empty bin, clean inside, replace bag (double bag)'},
    {id:'g16',text:'When leaving aircraft open: Bin, Chiller, Fridge, Oven, Sink'},
    {id:'g17',text:'Organise compartments/drawers according to stowage guide'},
  ]},
  {id:'cabin',name:'CABIN DAILY DUTIES',items:[
    {id:'c1',text:'Vacuum carpets and mats'},
    {id:'c2',text:'Clean side pockets'},
    {id:'c3',text:'Clean cup holders'},
    {id:'c4',text:'Clean and polish wooden surfaces'},
    {id:'c5',text:'Reposition seats and fold seatbelts correctly'},
    {id:'c6',text:'Polish monitor screens with dry microfibre'},
    {id:'c7',text:'Polish iPods'},
    {id:'c8',text:'Clean windows'},
    {id:'c9',text:'Organize every cupboard/storage according to stowage guide'},
    {id:'c10',text:'Check headphones are clean, neatly stacked and fully charged'},
    {id:'c11',text:'Polish handrail'},
    {id:'c12',text:'Clean service trays and ensure they are in good condition'},
  ]},
  {id:'washroom',name:'WASHROOM DAILY DUTIES',items:[
    {id:'w1',text:'Clean and disinfect toilet bowl and surrounding'},
    {id:'w2',text:'Clean and disinfect surfaces'},
    {id:'w3',text:'Clean and shine water basin and taps'},
    {id:'w4',text:'Clean and wipe soap/lotion/leather holders'},
    {id:'w5',text:'Refill paper tissues and fold into a point'},
    {id:'w6',text:'Refill toilet paper, fold into a point'},
    {id:'w7',text:'Polish mirrors'},
    {id:'w8',text:'Empty toilet bin, replace bag'},
    {id:'w9',text:'Organise compartments/drawers according to stowage guide'},
  ]},
  {id:'stock',name:'AIRCRAFT STOCK MANAGEMENT',items:[
    {id:'s1',text:'Dishes Offloaded'},
    {id:'s2',text:'Fridge Bag offloaded'},
    {id:'s3',text:'Laundry Offloaded'},
    {id:'s4',text:'Linens correct to AC type, neatly folded, good condition'},
    {id:'s5',text:'Chinaware in good condition (silver rim)'},
    {id:'s6',text:'CH iPad — minimum charge 80%'},
    {id:'s7',text:'Customer iPad — minimum charge 80%'},
    {id:'s8',text:'Global 7500 Jet Bed Pumps charged'},
    {id:'s9',text:'Winter/Summer Ops performed'},
  ]},
];
// Cabin Care "Date last done" — 17 filas del PDF oficial, en el MISMO orden que los
// campos de fecha del formulario (verificado por posición). El índice i de este array
// corresponde a cabin_care[i] del registro HOTO y a la fila i del PDF exportado.
const VJ_CABIN_CARE_LABELS=[
  'Blankets dry cleaned',
  'Pillow covers dry cleaned',
  'Wipe leather surfaces and seats',
  'Hoover bag changed / empty Dyson after each use',
  'Cutlery polished',
  'Stairs cleaned',
  'Check no watermarks/stickers on the glasses',
  'Kettle descaled',
  'Remove bin insert and clean below',
  'Toppers/Duvets properly vacuum packed',
  'Check no unwanted content on iPods (notes/pictures)',
  'Safety Cards in good condition',
  'Magazines free of adverts, no price stickers on cover',
  'Full Stock Check',
  'Expiry dates checked — including Crew Box',
  'Empty, clean & refill olive oil and vinegar servers',
  'Customer iPads updated with new content',
];
// Aircraft Shopping — los 14 items reales de la página 2 del PDF oficial.
// opts = opciones del dropdown oficial (null = campo de texto libre en el PDF).
// inv = palabras clave para buscar el item en Inventario (solo lectura, referencia).
const VJ_SHOPPING_ITEMS=[
  {key:'lemons',label:'Lemons',opts:['0','1','2','3','+4'],inv:['lemon']},
  {key:'limes',label:'Limes',opts:['0','1','2','3','+4'],inv:['lime']},
  {key:'celery',label:'Celery',opts:['0','1 pack'],inv:['celery']},
  {key:'green_olives',label:'Green Olives',opts:['0','1 Jar','2 Jar'],inv:['olive']},
  {key:'oranges',label:'Oranges',opts:['0','1','2','3','+4'],inv:['orange']},
  {key:'cucumber',label:'Cucumber',opts:['0','1','2'],inv:['cucumber']},
  {key:'milk_full',label:'Milk Full Fat',opts:['0','1','2'],inv:['full fat','whole milk']},
  {key:'milk_skimmed',label:'Milk Skimmed',opts:['0','1','2'],inv:['skimmed']},
  {key:'oat_milk',label:'Oat Milk',opts:null,inv:['oat milk','oat']},
  {key:'almond_milk',label:'Almond Milk',opts:null,inv:['almond']},
  {key:'evian',label:'Evian',opts:null,inv:['evian']},
  {key:'volvic',label:'Volvic',opts:null,inv:['volvic']},
  {key:'herbs',label:'Selection of Herbs',opts:null,inv:['herb']},
  {key:'magazines',label:'Magazines',opts:null,inv:['magazine']},
];
const VJ_LAUNDRY_ITEMS=[
  {id:'pillowcases',name:'Pillowcases'},
  {id:'blankets',name:'Blankets'},
  {id:'duvets',name:'Duvets'},
  {id:'towels',name:'Towels'},
  {id:'tablecloths',name:'Tablecloths'},
  {id:'napkins',name:'Napkins'},
  {id:'seat_covers',name:'Seat covers'},
  {id:'other',name:'Other items'},
];
let pinVal = '';

function showPin() {
  if (sessionStorage.getItem('unlocked') === '1') { initApp(); return; }
  const el = document.createElement('div');
  el.className = 'pin-screen'; el.id = 'pin-screen';
  el.innerHTML = `
    <div class="pin-logo">Life OS</div>
    <div class="pin-dots" id="pin-dots">
      ${[0,1,2,3].map(i=>`<div class="pin-dot" id="pd${i}"></div>`).join('')}
    </div>
    <div class="pin-err" id="pin-err"></div>
    <div class="pin-pad">
      ${[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map(n=>`<button class="pin-btn" onclick="pinPress('${n}')">${n}</button>`).join('')}
    </div>`;
  document.body.appendChild(el);
}

function pinPress(v) {
  if (v === '') return;
  if (v === '⌫') { pinVal = pinVal.slice(0,-1); }
  else if (pinVal.length < 4) { pinVal += v; }
  [0,1,2,3].forEach(i => {
    const d = document.getElementById('pd'+i);
    if(d) d.className = 'pin-dot' + (i < pinVal.length ? ' filled' : '');
  });
  if (pinVal.length === 4) {
    if (pinVal === PIN) {
      sessionStorage.setItem('unlocked','1');
      document.getElementById('pin-screen')?.remove();
      initApp();
    } else {
      const dots = document.getElementById('pin-dots');
      if(dots){ dots.classList.add('pin-shake'); setTimeout(()=>dots.classList.remove('pin-shake'),300); }
      const err = document.getElementById('pin-err');
      if(err) err.textContent = 'PIN incorrecto';
      pinVal = '';
      setTimeout(()=>{ [0,1,2,3].forEach(i=>{ const d=document.getElementById('pd'+i); if(d) d.className='pin-dot'; }); if(err) err.textContent=''; }, 600);
    }
  }
}

let db, S = { mode:'OFF', view:'home', areaId:null, projectId:null, avanzarCtx:null, areas:[], tasks:[], wf:[], dec:[], metrics:[], operators:[], chatHistory:[], pendingImage:null, transactions:[], finMonth: new Date().toISOString().slice(0,7), finCat: null, budgets: JSON.parse(localStorage.getItem('life_budgets')||'{}'), finHide: false, vjState:{}, vjTasks:[], projects:[], eventos:[], alertas:[], vjHotoTab:'checklist', vjInventTab:'resumen', vjLaundryTab:'hoy', invSession:null, invItems:[], invChat:[], invSearch:'', invChatLoading:false, invProposal:null };

async function initApp() {
  db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  dbSvc.setClient(db);
  invSvc.setClient(db);
  hotoSvc.setClient(db);
  isabelSvc.setUrlGetter(() => S.metrics.find(m => m.key === 'agent_url')?.value || '');
  const now = new Date();
  document.getElementById('td').textContent = now.toLocaleDateString('es-ES',{weekday:'short',day:'numeric',month:'short'});
  await reload();
  render();
}

async function reload() {
  try {
    const {ctx:c,areas:a,tasks:t,waiting:w,decisions:d,metrics:m,operators:op,transactions:tr,vjState:vjs,vjTasks:vjt,projects:pj,eventos:ev,alertas:al} = await dbSvc.loadAll();
    if(c.data&&c.data[0]) S.mode=c.data[0].mode;
    S.areas=a.data||[]; S.tasks=t.data||[]; S.wf=w.data||[]; S.dec=d.data||[];
    S.metrics=m.data||[]; S.operators=op.data||[]; S.transactions=tr.data||[];
    S.vjState=vjs.data&&vjs.data[0]||{}; S.vjTasks=vjt.data||[];
    S.projects=pj.data||[]; S.eventos=ev.data||[]; S.alertas=al.data||[];
    // Rebuild budgets from metrics (key prefix 'budget_')
    S.budgets={};
    (m.data||[]).filter(x=>x.key&&x.key.startsWith('budget_')).forEach(x=>{
      const cat=x.key.slice(7);
      S.budgets[cat]=parseFloat(x.value)||0;
    });
  } catch(e){ console.error(e); }
}

function render() {
  ['home','areas','avanzar'].forEach(v=>{
    const el=document.getElementById('nb-'+v);
    if(!el) return;
    const on=S.view===v||(v==='areas'&&(S.view==='area'||S.view==='project'))||(v==='avanzar'&&S.view==='resultado_ia');
    el.className='nb'+(on?' on':'');
  });
  const mp=document.getElementById('mp');
  mp.textContent=S.mode; mp.className='mode-pill '+(S.mode==='ON'?'m-on':'m-off');
  const views={home:homeView,areas:areasView,area:areaView,global:globalView,project:projectView,avanzar:avanzarView,resultado_ia:resultadoIAView,dashboard:dashboardView,vj_hoto:vjHotoView,vj_inventario:vjInventarioView,vj_laundry:vjLaundryView,vj_fresh:vjFreshView,vj_status:vjStatusView};
  document.getElementById('main').innerHTML=(views[S.view]||homeView)();
}

function visibleDomains() {
  return S.areas.filter(a=>['VistaJet','JETMI','Finanzas','Salud','Marca Personal','Vida Personal'].includes(a.name));
}

function domainBlueprint(name) {
  const data={
    'VistaJet':{icon:'✈️',prd:'PRD operativo VistaJet',specialist:'acompañamiento',mode:'ON/OFF operativo',purpose:'Rotación, documentos y preparación sin carga mental.',tone:'#854F0B'},
    'JETMI':{icon:'🚀',prd:'PRD Semilla v0.3',specialist:'producción',mode:'OFF construcción',purpose:'Negocio, operadores, web, contenido y decisiones estratégicas.',tone:'#534AB7'},
    'Finanzas':{icon:'💰',prd:'Modelo financiero personal',specialist:'acompañamiento',mode:'control mensual',purpose:'Saber si el mes está bajo control y dónde actuar.',tone:'#185FA5'},
    'Salud':{icon:'🩺',prd:'Protocolo salud + entrenamiento',specialist:'acompañamiento',mode:'seguimiento',purpose:'Dolor, síntomas, hábitos y entrenamiento dentro de un mismo dominio.',tone:'#0F6E56'},
    'Marca Personal':{icon:'📣',prd:'Sistema de contenido',specialist:'híbrido',mode:'captura/publicación',purpose:'Presencia pública sostenible según energía y modo.',tone:'#993556'},
    'Vida Personal':{icon:'🌱',prd:'Mapa de vida personal',specialist:'acompañamiento',mode:'carga mental',purpose:'Viajes, hábitos y asuntos personales que no deben quedarse flotando.',tone:'#993C1D'},
  };
  return data[name]||{icon:'•',prd:'Sin PRD visible',specialist:'acompañamiento',mode:'activo',purpose:'Dominio activo de LIFEOS.',tone:'#6b6b6b'};
}

function daysSinceDate(value) {
  if(!value) return null;
  const t=new Date(value).getTime();
  if(Number.isNaN(t)) return null;
  return Math.max(0,Math.floor((Date.now()-t)/864e5));
}

function fmtLastActivity(value) {
  const d=daysSinceDate(value);
  if(d===null) return 'sin actividad registrada';
  if(d===0) return 'hoy';
  if(d===1) return 'ayer';
  return 'hace '+d+' días';
}

function domainStats(area) {
  const projects=S.projects.filter(p=>p.area_id===area.id&&['active','paused'].includes(p.status));
  const activeProjects=projects.filter(p=>p.status==='active');
  const tasks=S.tasks.filter(t=>t.area_id===area.id&&t.status!=='done');
  const waits=S.wf.filter(w=>w.area_id===area.id);
  const decisions=S.dec.filter(d=>d.area_id===area.id);
  const events=S.eventos.filter(e=>e.area_id===area.id||projects.some(p=>p.id===e.project_id));
  // VistaJet: include vj_tasks and vj_state in activity signal
  const vjExtra=area.name==='VistaJet'?{tasks:S.vjTasks||[],stateDates:[(S.vjState||[])[0]?.updated_at,(S.vjState||[])[0]?.created_at].filter(Boolean)}:{tasks:[],stateDates:[]};
  const allTaskDates=[...tasks.map(t=>t.updated_at||t.created_at),...vjExtra.tasks.map(t=>t.updated_at||t.created_at)];
  const dates=[...projects.map(p=>p.last_activity_at||p.created_at),...allTaskDates,...events.map(e=>e.created_at),...vjExtra.stateDates].filter(Boolean).map(x=>new Date(x).getTime()).filter(x=>!Number.isNaN(x));
  const lastAt=dates.length?new Date(Math.max(...dates)).toISOString():null;
  const withNext=activeProjects.filter(p=>p.next_action).length;
  const withIa=activeProjects.filter(p=>p.ia_last_session).length;
  const progress=activeProjects.length?Math.min(96,Math.round(((withNext*0.55+withIa*0.35)/activeProjects.length)*100)+10):Math.min(35,tasks.length*8+events.length*5);
  const health=areaHealth(area.id);
  const statusLabel={rojo:'necesita atención',naranja:'en seguimiento',verde:'en progreso',gris:'en reposo'}[health]||'en progreso';
  const vjTaskCount=area.name==='VistaJet'?(S.vjTasks||[]).filter(t=>t.status!=='done').length:0;
  const score=activeProjects.length*4+events.length*3+(tasks.length+vjTaskCount)+waits.length+decisions.length;
  return {projects,activeProjects,tasks,waits,decisions,events,lastAt,progress,statusLabel,score,vjTaskCount};
}

function domainCard(a) {
  const bp=domainBlueprint(a.name), st=domainStats(a);
  const prdClass=bp.prd.toLowerCase().includes('sin')?'muted':'';
  return `<button class="domain-card" onclick="go('area','${a.id}')" style="--domain:${bp.tone}">
    <div class="domain-top"><span class="domain-icon">${bp.icon}</span><span class="domain-state">${st.statusLabel}</span></div>
    <div class="domain-name">${a.name}</div>
    <div class="domain-purpose">${bp.purpose}</div>
    <div class="domain-progress"><span style="width:${st.progress}%"></span></div>
    <div class="domain-meta"><span>${st.activeProjects.length} proyectos activos</span><span>${fmtLastActivity(st.lastAt)}</span></div>
    <div class="domain-tags"><span class="domain-tag ${prdClass}">${bp.prd}</span><span class="domain-tag">${bp.specialist}</span></div>
  </button>`;
}

function domainSignal(area) {
  const name = area.name;
  const health = areaHealth(area.id);
  const areaProjects = S.projects.filter(p => p.area_id === area.id && p.status === 'active');
  const projectIds = areaProjects.map(p => p.id);

  if (name === 'VistaJet') {
    if (S.vjState.status === 'rotacion') {
      const day = S.vjState.rotation_day;
      return day ? `Rotación activa · Día ${day}` : 'Rotación activa';
    }
    const pending = (S.vjTasks || []).filter(t => t.status !== 'done');
    if (pending.length > 0) return `${pending.length} tarea${pending.length !== 1 ? 's' : ''} pendiente${pending.length !== 1 ? 's' : ''}`;
    return 'Tranquilo por ahora';
  }

  if (name === 'JETMI') {
    const recentIA = S.eventos.filter(e =>
      (e.area_id === area.id || projectIds.includes(e.project_id)) &&
      ['ia', 'isabel'].includes(e.origen)
    );
    if (recentIA.length > 0) return `${recentIA.length} avance${recentIA.length !== 1 ? 's' : ''} mientras volabas`;
    const openDec = S.dec.filter(d => d.area_id === area.id);
    if (openDec.length > 0) return `${openDec.length} decisión${openDec.length !== 1 ? 'es' : ''} pendiente${openDec.length !== 1 ? 's' : ''}`;
    if (areaProjects.length > 0) return `${areaProjects.length} proyecto${areaProjects.length !== 1 ? 's' : ''} en curso`;
    return 'En construcción';
  }

  if (name === 'Finanzas') {
    if (health === 'rojo') {
      const al = S.alertas.filter(a => a.area_id === area.id && a.urgencia === 'critica' && a.status === 'active');
      if (al.length > 0) return (al[0].texto || 'Alerta financiera activa').slice(0, 45);
    }
    const d = S.dec.filter(x => x.area_id === area.id);
    if (d.length > 0) return (d[0].title || 'Decisión pendiente').slice(0, 45);
    const mes = new Date().toLocaleString('es-ES', { month: 'long' });
    return `${mes.charAt(0).toUpperCase() + mes.slice(1)} bajo control`;
  }

  if (name === 'Salud') {
    if (health === 'rojo') return 'Requiere atención';
    if (health === 'naranja') return 'En seguimiento';
    return 'Todo bajo control';
  }

  // Marca Personal, Vida Personal y resto
  if (health === 'rojo') {
    const al = S.alertas.filter(a => a.area_id === area.id && a.urgencia === 'critica' && a.status === 'active');
    if (al.length > 0) return (al[0].texto || 'Alerta activa').slice(0, 45);
    const ov = S.tasks.filter(t => t.area_id === area.id && t.status !== 'done' && t.due_date && new Date(t.due_date) < new Date());
    if (ov.length > 0) return (ov[0].title || 'Tarea vencida').slice(0, 45);
    return 'Necesita atención';
  }
  if (health === 'naranja') {
    const stale = areaProjects.find(p => Math.floor((Date.now() - new Date(p.last_activity_at || p.created_at)) / 864e5) > 7);
    if (stale) return `${(stale.title || '').slice(0, 35)} sin actividad`;
    return 'En seguimiento';
  }
  if (!areaProjects.length) return 'Sin novedades';
  return 'Todo bajo control';
}

function attentionItems() {
  const todayish=S.tasks.filter(t=>t.status!=='done'&&(t.horizon==='today'||t.priority==='critical'||t.status==='avoiding'||(t.due_date&&new Date(t.due_date)<=new Date(Date.now()+3*864e5))));
  const taskItems=todayish.map(t=>({kind:t.status==='avoiding'?'bloqueo':'tarea',title:t.title,meta:t.due_date?fmtDate(t.due_date):(t.areas?.name||''),weight:t.status==='avoiding'?4:t.priority==='critical'?5:3}));
  const decisionItems=S.dec.slice(0,2).map(d=>({kind:'decisión',title:d.title,meta:d.areas?.name||'',weight:3}));
  const waitItems=S.wf.slice(0,1).map(w=>({kind:'espera',title:w.title,meta:w.waiting_on||'',weight:2}));
  return [...taskItems,...decisionItems,...waitItems].sort((a,b)=>b.weight-a.weight).slice(0,3);
}

function isabelContributions(areaId=null, limit=4) {
  const areaProjects=areaId?S.projects.filter(p=>p.area_id===areaId).map(p=>p.id):[];
  let evs=S.eventos.filter(e=>['ia','isabel'].includes(e.origen));
  if(areaId) evs=evs.filter(e=>e.area_id===areaId||areaProjects.includes(e.project_id));
  return evs.slice(0,limit).map(e=>({title:e.resumen||e.texto,meta:(e.herramienta||e.origen)+' · '+new Date(e.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short'}),type:e.origen}));
}

function contributionList(items) {
  return items.map(x=>`<div class="contrib-item"><span class="contrib-dot"></span><div><div class="contrib-title">${x.title}</div><div class="contrib-meta">${x.meta}</div></div></div>`).join('');
}

function projectVisualCard(p) {
  const hasNext=!!p.next_action;
  const isStale=p.last_activity_at&&(Date.now()-new Date(p.last_activity_at))>7*864e5;
  const dot=!hasNext?'#A32D2D':isStale?'#D97706':'#0F6E56';
  return `<div class="project-vcard" onclick="goProject('${p.id}')">
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <span style="width:8px;height:8px;border-radius:50%;background:${dot};flex-shrink:0"></span>
      <div class="project-vtitle" style="margin:0">${p.title}</div>
    </div>
    <div class="project-next">${hasNext?'→ '+p.next_action:'<span style="color:#A32D2D">Sin próxima acción definida</span>'}</div>
    <div class="contrib-meta" style="margin-top:6px">Última actividad: ${fmtLastActivity(p.last_activity_at||p.created_at)}</div>
  </div>`;
}

function homeView() {
  const now = Date.now();
  const hour = new Date().getHours();
  const LOK = 'lifeos_last_open';
  const lastOpen = parseInt(localStorage.getItem(LOK) || '0');
  const daysSinceOpen = lastOpen ? Math.floor((now - lastOpen) / 864e5) : 0;
  if (!lastOpen || now - lastOpen > 3600000) localStorage.setItem(LOK, String(now));

  // ── Lógica de prioridad (igual que antes) ────────────────────────────
  const visdoms = visibleDomains();
  const vjArea = visdoms.find(a => a.name === 'VistaJet');
  const jetmiArea = visdoms.find(a => a.name === 'JETMI');
  const vjHealth = vjArea ? areaHealth(vjArea.id) : 'gris';
  const jetmiHealth = jetmiArea ? areaHealth(jetmiArea.id) : 'gris';
  const vjCritTasks = S.vjTasks.filter(t => t.status !== 'done' && t.due_date && Math.ceil((new Date(t.due_date) - new Date()) / 864e5) <= 0);
  const oldDecJetmi = jetmiArea ? S.dec.filter(d => d.area_id === jetmiArea.id && Math.floor((now - new Date(d.created_at)) / 864e5) > 7) : [];
  const critAlerts = S.alertas.filter(a => a.urgencia === 'critica');
  const vjUrgent = vjHealth === 'rojo' || vjCritTasks.length > 0 || critAlerts.some(a => a.area_id === vjArea?.id);
  const jetmiUrgent = jetmiHealth === 'rojo' || oldDecJetmi.length > 1;
  let primaryArea = null, primaryReason = '', secondaryArea = null;
  if (vjUrgent && jetmiUrgent) {
    primaryArea = vjArea; primaryReason = 'Hay urgencias operativas en VistaJet. Empieza ahí.'; secondaryArea = jetmiArea;
  } else if (vjUrgent) {
    primaryArea = vjArea;
    primaryReason = vjCritTasks.length > 0 ? 'Hay tareas del avión que vencieron hoy.' : 'VistaJet necesita atención antes de continuar.';
    if (jetmiHealth !== 'gris') secondaryArea = jetmiArea;
  } else if (S.vjState.status === 'rotacion') {
    primaryArea = vjArea;
    primaryReason = `Rotación activa — día ${S.vjState.rotation_day || '?'}. El avión primero.`;
    if (jetmiUrgent) secondaryArea = jetmiArea;
  } else if (jetmiUrgent) {
    primaryArea = jetmiArea;
    primaryReason = oldDecJetmi.length > 0
      ? `${oldDecJetmi.length} decisión${oldDecJetmi.length > 1 ? 'es llevan' : ' lleva'} más de 7 días sin respuesta en JETMI.`
      : 'JETMI necesita tu atención hoy.';
  } else {
    primaryArea = jetmiArea;
    primaryReason = 'Sin urgencias operativas. Buen momento para avanzar en JETMI.';
  }

  // ── Briefing de Isabel — prosa unificada ─────────────────────────────
  const briefParts = [];
  if (daysSinceOpen >= 3) briefParts.push('Bienvenida de vuelta, Estefanía.');
  else if (hour < 13) briefParts.push('Buenos días, Estefanía.');
  else if (hour < 20) briefParts.push('Buenas tardes, Estefanía.');
  else briefParts.push('Buenas noches, Estefanía.');
  if (primaryReason) briefParts.push(primaryReason);
  const recentIA = S.eventos.filter(e => ['ia', 'isabel'].includes(e.origen));
  if (recentIA.length > 0 && daysSinceOpen >= 1) {
    briefParts.push(`Mientras estuviste fuera avancé en ${recentIA.length} ${recentIA.length === 1 ? 'punto' : 'puntos'}.`);
  }
  if (secondaryArea) briefParts.push(`${secondaryArea.name} también merece un momento hoy.`);
  const briefing = briefParts.join(' ');

  // ── Atención ─────────────────────────────────────────────────────────
  const atItems = attentionItems();

  return `
  <div style="padding:0 0 80px">

    <!-- Isabel habla primero -->
    <div style="background:var(--surface);border-radius:14px;padding:16px;margin-bottom:10px;border:0.5px solid var(--border)">
      <div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-bottom:10px">Isabel</div>
      <div style="font-size:15px;color:var(--text);line-height:1.7">${briefing}</div>
      <button onclick="openChat()" style="background:none;border:none;padding:6px 0 0;font-size:11px;font-weight:500;color:var(--t2);cursor:pointer;display:block;margin-top:4px">Hablar con Isabel →</button>
    </div>

    <!-- ¿Qué merece mi atención ahora? -->
    <div style="background:var(--surface);border-radius:14px;padding:16px;margin-bottom:10px;border:0.5px solid var(--border)">
      <div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-bottom:10px">Atención</div>
      ${atItems.length > 0
        ? atItems.map((it, i) => `<div style="display:flex;align-items:flex-start;gap:10px;${i < atItems.length - 1 ? 'padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid var(--border)' : ''}">
            <span style="color:var(--t3);font-size:12px;margin-top:2px;flex-shrink:0">→</span>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;font-weight:500;color:var(--text);line-height:1.4">${it.title}</div>
              ${it.meta ? `<div style="font-size:11px;color:var(--t3);margin-top:2px">${it.meta}</div>` : ''}
            </div>
          </div>`).join('')
        : `<div style="font-size:13px;color:var(--t2)">Nada urgente hoy.</div>`}
    </div>

    <!-- Dominios — puertas -->
    <div style="display:flex;flex-direction:column;gap:6px">
      ${visdoms.map(a => {
        const bp = domainBlueprint(a.name);
        const signal = domainSignal(a);
        const isPrimary = primaryArea?.id === a.id;
        return `<button onclick="go('area','${a.id}')" style="width:100%;display:flex;align-items:center;gap:12px;padding:13px 14px;background:${isPrimary ? 'var(--text)' : 'var(--surface)'};border-radius:12px;border:${isPrimary ? 'none' : '0.5px solid var(--border)'};cursor:pointer;text-align:left">
          <span style="font-size:18px;flex-shrink:0">${bp.icon}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:14px;font-weight:600;color:${isPrimary ? '#fff' : 'var(--text)'}">${a.name}</div>
            <div style="font-size:11px;color:${isPrimary ? 'rgba(255,255,255,0.55)' : 'var(--t3)'};margin-top:2px">${signal}</div>
          </div>
          <i class="ti ti-chevron-right" style="font-size:13px;color:${isPrimary ? 'rgba(255,255,255,0.35)' : 'var(--t3)'};flex-shrink:0"></i>
        </button>`;
      }).join('')}
    </div>
  </div>`;
}

// ────── Area health (computed, never stored) ─────────────────────────────────
function areaHealth(areaId) {
  const now=Date.now();
  const ts=S.tasks.filter(t=>t.area_id===areaId&&t.status!=='done');
  const ps=S.projects.filter(p=>p.area_id===areaId&&p.status==='active');
  const als=S.alertas.filter(a=>a.area_id===areaId&&a.status==='active');
  const ws=S.wf.filter(w=>w.area_id===areaId);
  const ds=S.dec.filter(d=>d.area_id===areaId);
  if(als.some(a=>a.urgencia==='critica')||ts.some(t=>t.due_date&&new Date(t.due_date)<new Date())) return 'rojo';
  if(ps.some(p=>Math.floor((now-new Date(p.last_activity_at||p.created_at))/864e5)>7)||ws.some(w=>w.follow_up_date&&new Date(w.follow_up_date)<new Date())||ds.some(d=>Math.floor((now-new Date(d.created_at))/864e5)>14)) return 'naranja';
  if(!ps.length) return 'gris';
  return 'verde';
}

// ────── Project view ──────────────────────────────────────────────────────────
function projectView() {
  const p=S.projects.find(x=>x.id===S.projectId);
  if(!p) return `<div class="ph"><button class="back" onclick="go('areas')"><i class="ti ti-arrow-left"></i></button><h2>Proyecto no encontrado</h2></div>`;
  const a=S.areas.find(x=>x.id===p.area_id);
  const projTasks=S.tasks.filter(t=>t.project_id===p.id&&t.status!=='done');
  const projEvs=S.eventos.filter(e=>e.project_id===p.id).slice(0,5);
  const sColors={active:'#0F6E56',paused:'#854F0B',completed:'#6b6b6b',abandoned:'#A32D2D'};
  const sLabels={active:'Activo',paused:'Pausado',completed:'Completado',abandoned:'Abandonado'};
  const dSince=Math.floor((Date.now()-new Date(p.last_activity_at||p.created_at))/864e5);
  return `
  <div class="ph">
    <button class="back" onclick="go('area','${a?.id||''}')"><i class="ti ti-arrow-left"></i></button>
    <div style="flex:1;min-width:0">
      <h2 style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.title}</h2>
      <div style="font-size:11px;color:var(--t2);margin-top:2px">${a?.name||'Sin área'} · <span style="color:${sColors[p.status]||'#6b6b6b'}">${sLabels[p.status]||p.status}</span>${dSince>0?` · ${dSince}d sin actividad`:''}</div>
    </div>
    <button onclick="openProjectMenu('${p.id}')" style="background:none;border:none;padding:4px 8px;cursor:pointer;color:var(--t2);font-size:20px;flex-shrink:0"><i class="ti ti-dots-vertical"></i></button>
  </div>
  ${p.next_action?`
  <div style="background:#EEEDFE;border-radius:var(--r-sm);padding:12px 14px;margin-bottom:10px;border-left:3px solid #534AB7">
    <div style="font-size:10px;font-weight:700;color:#534AB7;letter-spacing:.4px;margin-bottom:4px">SIGUIENTE ACCIÓN</div>
    <div style="font-size:14px;font-weight:600;color:#26215C">${p.next_action}</div>
    <button onclick="openEditNextAction('${p.id}','')" style="background:none;border:none;padding:2px 0;font-size:11px;color:#534AB7;cursor:pointer;margin-top:4px">Actualizar →</button>
  </div>`:`
  <div style="background:#FCEBEB;border-radius:var(--r-sm);padding:12px 14px;margin-bottom:10px;border-left:3px solid #A32D2D">
    <div style="font-size:13px;color:#A32D2D;font-weight:500">Sin próxima acción definida</div>
    <button onclick="openEditNextAction('${p.id}','')" style="background:none;border:none;padding:2px 0;font-size:12px;color:#A32D2D;cursor:pointer;margin-top:4px;text-decoration:underline">Definir ahora →</button>
  </div>`}
  ${p.ia_last_session?`
  <div class="card" style="margin-bottom:10px">
    <div class="card-head" style="background:#EEEDFE18"><span class="ch-icon" style="color:#534AB7">🤖</span><span class="ch-label" style="color:#534AB7">Última sesión IA</span></div>
    <div style="padding:12px 14px">
      <div style="font-size:13px;color:var(--text);line-height:1.5;margin-bottom:10px">${p.ia_last_session}</div>
      <button onclick="openEventoForm('${p.id}')" style="width:100%;padding:10px;border-radius:8px;background:#EEEDFE;color:#534AB7;border:none;font-size:13px;font-weight:600;cursor:pointer">+ Registrar contribución IA</button>
    </div>
  </div>`:`
  <div style="padding:6px 0 8px"><button onclick="openEventoForm('${p.id}')" style="width:100%;padding:10px;border-radius:8px;background:var(--surface);border:1.5px dashed var(--border);font-size:13px;color:var(--t2);cursor:pointer">🤖 Registrar contribución IA</button></div>`}
  ${section('✓','Acciones del proyecto',projTasks.map(t=>taskEl(t)).join('')||empty('Sin tareas — añade una desde el botón +'))}
  ${p.ia_context?`
  <div class="card" style="margin-bottom:10px">
    <div class="card-head"><span class="ch-icon">🎯</span><span class="ch-label">Contexto IA</span><button onclick="openEditIAContext('${p.id}')" style="margin-left:auto;border:none;background:none;font-size:12px;color:var(--t3);cursor:pointer">editar</button></div>
    <div style="padding:12px 14px;font-size:12px;color:var(--t2);line-height:1.6">${p.ia_context}</div>
  </div>`:`
  <div style="padding:0 0 8px"><button onclick="openEditIAContext('${p.id}')" style="width:100%;padding:9px;border-radius:8px;background:var(--surface);border:1.5px dashed var(--border);font-size:12px;color:var(--t2);cursor:pointer">+ Añadir contexto para la IA</button></div>`}
  ${projEvs.length?`
  <div class="card" style="margin-bottom:10px">
    <div class="card-head"><span class="ch-icon">📋</span><span class="ch-label">Historial</span></div>
    ${projEvs.map(e=>`<div style="padding:9px 14px;border-top:1px solid var(--border)"><div style="font-size:12px;color:var(--text);margin-bottom:2px">${e.resumen||e.texto}</div><div style="font-size:11px;color:var(--t3)">${e.origen==='ia'?`🤖 ${e.herramienta||'IA'}`:e.origen} · ${new Date(e.created_at).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</div></div>`).join('')}
  </div>`:''}
  <div style="display:flex;gap:8px;margin-bottom:16px">
    <button onclick="goAvanzar('project','${p.id}')" style="flex:2;padding:13px;border-radius:var(--r-sm);background:var(--accent);color:#fff;border:none;font-size:14px;font-weight:600;cursor:pointer"><i class="ti ti-bolt"></i> Avanzar</button>
    <button onclick="openProjectMenu('${p.id}')" style="flex:0;padding:13px 16px;border-radius:var(--r-sm);background:var(--surface);border:1px solid var(--border);font-size:14px;cursor:pointer;color:var(--t2)">···</button>
  </div>`;
}

// ────── Dashboard view ────────────────────────────────────────────────────────
function dashboardView() {
  const active=S.projects.filter(p=>p.status==='active');
  const paused=S.projects.filter(p=>p.status==='paused');
  const pending=S.tasks.filter(t=>t.status==='pending');
  return `
  <div class="ph"><span class="logo" style="font-size:16px">Dashboard</span></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
    ${[['📁',active.length,'proyectos activos'],['✓',pending.length,'tareas pendientes'],['❓',S.dec.length,'decisiones abiertas'],['⏳',S.wf.length,'esperas activas']].map(([ic,n,lb])=>`<div style="background:var(--surface);border-radius:var(--r-sm);padding:12px;text-align:center"><div style="font-size:22px;font-weight:700">${n}</div><div style="font-size:11px;color:var(--t2);margin-top:2px">${lb}</div></div>`).join('')}
  </div>
  ${section('📁','Proyectos activos',active.map(p=>{const a=S.areas.find(x=>x.id===p.area_id);const dSince=Math.floor((Date.now()-new Date(p.last_activity_at||p.created_at))/864e5);return`<div onclick="goProject('${p.id}')" class="item" style="cursor:pointer;flex-direction:column;align-items:flex-start;gap:2px"><div style="display:flex;align-items:center;gap:8px;width:100%"><span style="font-size:14px;font-weight:600;flex:1">${p.title}</span>${p.ia_last_session?'<span style="font-size:10px;color:#534AB7;background:#EEEDFE;border-radius:5px;padding:1px 5px">IA</span>':''}${dSince>7?`<span style="font-size:10px;color:#854F0B;background:#FAEEDA;border-radius:5px;padding:1px 5px">${dSince}d</span>`:''}</div><div style="font-size:12px;color:var(--t2)">${a?.name||'Sin área'}${p.next_action?' · → '+p.next_action:' · Sin próxima acción'}</div></div>`;}).join('')||empty('Sin proyectos activos'))}
  ${paused.length?section('⏸','Pausados',paused.map(p=>{const a=S.areas.find(x=>x.id===p.area_id);return`<div onclick="goProject('${p.id}')" class="item" style="cursor:pointer;opacity:0.6"><span class="item-txt">${p.title}</span><span class="pill p-gray">${a?.name||''}</span></div>`;}).join('')):''}
  ${section('❓','Decisiones pendientes',S.dec.map(decEl).join('')||empty('Sin decisiones abiertas'))}
  ${section('⏳','Esperando respuesta',S.wf.map(wfEl).join('')||empty('Sin elementos esperando'))}
  <div style="margin-bottom:16px"></div>`;
}

// ────── Avanzar view ──────────────────────────────────────────────────────────
function avanzarView() {
  const now=Date.now();
  const proposals=[];

  const critTasks=S.tasks.filter(t=>t.status==='pending'&&t.due_date&&Math.ceil((new Date(t.due_date)-new Date())/864e5)<=1);
  critTasks.slice(0,2).forEach(t=>{
    const days=Math.ceil((new Date(t.due_date)-new Date())/864e5);
    proposals.push({id:'task_'+t.id,title:t.title,impact:'crítico',time:'~15-30 min',reason:days<=0?'Vencida hoy':days===1?'Vence mañana':'Vence hoy',area:S.areas.find(x=>x.id===t.area_id)?.name||'',type:'task',ref:t.id});
  });
  S.projects.filter(p=>p.status==='active'&&p.ia_last_session).slice(0,2).forEach(p=>{
    proposals.push({id:'proj_ia_'+p.id,title:'Revisar resultado IA: '+p.title,impact:'alto',time:'~20 min',reason:p.ia_last_session,area:S.areas.find(x=>x.id===p.area_id)?.name||'',type:'project_ia',ref:p.id});
  });
  S.dec.filter(d=>Math.floor((now-new Date(d.created_at))/864e5)>7).slice(0,2).forEach(d=>{
    const days=Math.floor((now-new Date(d.created_at))/864e5);
    proposals.push({id:'dec_'+d.id,title:'Cerrar decisión: '+d.title,impact:'estratégico',time:'~10 min',reason:`Abierta hace ${days} días`,area:S.areas.find(x=>x.id===d.area_id)?.name||'',type:'decision',ref:d.id});
  });
  S.projects.filter(p=>p.status==='active'&&!p.next_action).slice(0,2).forEach(p=>{
    proposals.push({id:'proj_next_'+p.id,title:'Definir próxima acción: '+p.title,impact:'medio',time:'~5 min',reason:'Sin próxima acción — Isabel no puede priorizar este proyecto',area:S.areas.find(x=>x.id===p.area_id)?.name||'',type:'project_next',ref:p.id});
  });

  const iCol={crítico:'#A32D2D',alto:'#534AB7',medio:'#854F0B',estratégico:'#0F6E56'};
  const iBg={crítico:'#FCEBEB',alto:'#EEEDFE',medio:'#FAEEDA',estratégico:'#E1F5EE'};
  const ctx=S.avanzarCtx;
  const ctxLabel=ctx?.project?'Proyecto: '+(S.projects.find(p=>p.id===ctx.project)?.title||''):ctx?.area?'Área: '+(S.areas.find(a=>a.id===ctx.area)?.name||''):'Visión global';

  return `
  <div class="ph"><span class="logo" style="font-size:15px">⚡ Avanzar</span><span style="font-size:11px;color:var(--t2)">${ctxLabel}</span></div>
  <div style="background:#0f0f1a;border-radius:14px;padding:13px 15px;margin-bottom:10px">
    <div style="font-size:10px;font-weight:600;color:#a5b4fc;letter-spacing:.5px;margin-bottom:6px">ISABEL · ANÁLISIS</div>
    <p style="font-size:13px;line-height:1.6;color:#d8d8f0;margin:0">${proposals.length?`${proposals.length} propuesta${proposals.length!==1?'s':''} ordenadas por impacto.${critTasks.length?` <span style="color:#f87171">${critTasks.length} urgencia${critTasks.length>1?'s':''}.</span>`:''}`:' Todo al día — sin urgencias detectadas.'}</p>
  </div>
  ${proposals.map((p,i)=>`
  <div id="ap_${p.id}" onclick="selectProposal('${p.id}')" style="border:1.5px solid var(--border);border-radius:12px;padding:12px 14px;margin-bottom:8px;cursor:pointer">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">
      <div style="font-size:13px;font-weight:600;flex:1">${i+1}. ${p.title}</div>
      <span style="font-size:10px;font-weight:700;background:${iBg[p.impact]||'#f0f0f5'};color:${iCol[p.impact]||'#6b6b6b'};border-radius:5px;padding:2px 7px;white-space:nowrap;flex-shrink:0">${p.impact.toUpperCase()}</span>
    </div>
    <div style="font-size:11px;color:var(--t2);margin-top:3px">${p.time}${p.area?' · '+p.area:''}</div>
    <div style="font-size:12px;color:var(--t3);margin-top:4px;line-height:1.4">${p.reason}</div>
  </div>`).join('')}
  ${proposals.length===0?empty('Sin propuestas — todo al día'):''}
  <div id="btn-empezar" style="display:none;margin-bottom:8px"><button onclick="empezarPropuesta()" style="width:100%;padding:13px;border-radius:var(--r-sm);background:var(--accent);color:#fff;border:none;font-size:14px;font-weight:600;cursor:pointer"><i class="ti ti-arrow-right"></i> Empezar con esta acción</button></div>
  <button onclick="go('global')" style="width:100%;padding:12px;border-radius:var(--r-sm);background:var(--surface);border:1px solid var(--border);font-size:13px;color:var(--t2);cursor:pointer;margin-bottom:16px">Ver todo — tareas · decisiones · esperas</button>`;
}

// ────── Resultado IA view ─────────────────────────────────────────────────────
function resultadoIAView() {
  const p=S.projects.find(x=>x.id===S.projectId);
  const projOpts=S.projects.filter(p=>p.status==='active').map(p=>`<option value="${p.id}"${p.id===S.projectId?' selected':''}>${p.title}</option>`).join('');
  return `
  <div class="ph">
    <button class="back" onclick="goProject('${S.projectId||''}')"><i class="ti ti-arrow-left"></i></button>
    <h2>Registrar contribución IA</h2>
  </div>
  ${p?`<div style="padding:0 0 10px"><span style="font-size:12px;color:var(--t2)">Proyecto: </span><span style="font-size:13px;font-weight:600">${p.title}</span></div>`:''}
  <div class="card">
    <div style="padding:14px">
      <label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px">Herramienta</label>
      <select class="fi" id="ev-tool">
        <option value="claude">Claude</option>
        <option value="claude_code">Claude Code</option>
        <option value="chatgpt">ChatGPT</option>
        <option value="otro">Otra</option>
      </select>
      <label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px;margin-top:12px">Qué produjo (resumen en una línea)</label>
      <input class="fi" id="ev-resumen" placeholder="Ej: 3 variantes de copy para el hero de JETMI">
      <label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px;margin-top:12px">Dónde quedó guardado</label>
      <select class="fi" id="ev-ubicacion">
        <option value="ninguno">No guardado externamente</option>
        <option value="drive">Google Drive</option>
        <option value="github">GitHub</option>
        <option value="vercel">Vercel</option>
        <option value="supabase">Supabase</option>
      </select>
      <label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px;margin-top:12px">Proyecto</label>
      <select class="fi" id="ev-project">${projOpts}</select>
      <div style="display:flex;gap:8px;margin-top:16px">
        <button onclick="goProject('${S.projectId||''}')" style="flex:1;padding:12px;border-radius:var(--r-sm);background:var(--surface);border:1px solid var(--border);font-size:13px;cursor:pointer;color:var(--t2)">Cancelar</button>
        <button onclick="saveEvento()" style="flex:2;padding:12px;border-radius:var(--r-sm);background:var(--accent);color:#fff;border:none;font-size:14px;font-weight:600;cursor:pointer"><i class="ti ti-check"></i> Registrar</button>
      </div>
    </div>
  </div>`;
}

function domainDashboardIntro(a) {
  const bp=domainBlueprint(a.name), st=domainStats(a);
  const isStrategic=['VistaJet','JETMI'].includes(a.name);
  const prdNotes={
    'VistaJet':['Protocolo de rotación','Checklist de maleta','Estado operativo ON/OFF'],
    'JETMI':['PRD Semilla v0.3','Proyectos derivados del dominio','Bloqueos y oportunidades de negocio'],
    'Finanzas':['Control mensual','Presupuestos por categoría','Proyección anual'],
    'Salud':['Seguimiento de dolor','Protocolo diario','Entrenamiento integrado'],
    'Marca Personal':['Sistema de contenido','Captura en ON','Publicación en OFF'],
    'Vida Personal':['Carga mental','Viajes y planes','Hábitos relevantes'],
  }[a.name]||['Mapa del dominio'];
  const contribs=isabelContributions(a.id,3);
  const projects=st.activeProjects.length?st.activeProjects:S.projects.filter(p=>p.area_id===a.id).slice(0,3);
  const activeCount=a.name==='VistaJet'?st.vjTaskCount:(st.activeProjects.length);
  const activeLabel=a.name==='VistaJet'
    ?(st.vjTaskCount>0?`${st.vjTaskCount} tarea${st.vjTaskCount!==1?'s':''} VJ activa${st.vjTaskCount!==1?'s':''}`:'sin tareas VJ pendientes')
    :`${st.activeProjects.length} proyecto${st.activeProjects.length!==1?'s':''} activo${st.activeProjects.length!==1?'s':''}`;
  return `<section class="domain-dashboard" style="--domain:${bp.tone}">
    <div class="domain-hero-card">
      <div class="domain-hero-top"><span class="domain-hero-icon">${bp.icon}</span><span>${st.statusLabel}</span></div>
      <h2>${a.name}</h2>
      <p>${bp.purpose}</p>
      <div class="domain-hero-meta"><span>${activeLabel}</span><span>${fmtLastActivity(st.lastAt)}</span><span>Especialista: ${bp.specialist}</span></div>
    </div>
    ${isStrategic&&contribs.length?`<div class="brief-card"><div class="brief-label">Contribuciones de Isabel</div>${contributionList(contribs)}</div>`:''}
    ${projects.length?`<div class="visual-projects"><div class="section-title-inline">Proyectos reales del dominio</div>${projects.slice(0,4).map(projectVisualCard).join('')}</div>`:''}
    <details class="prd-card-collapsible">
      <summary><span class="brief-label" style="display:inline">PRD / mapa del dominio</span> <span style="font-size:12px;color:var(--t2)">${bp.prd}</span></summary>
      <div class="prd-notes" style="margin-top:8px">${prdNotes.map(x=>`<span>${x}</span>`).join('')}</div>
    </details>
  </section>`;
}

function areasView() {
  const domains=visibleDomains();
  return `<div class="domains-page">
    <div class="page-intro">
      <div class="brief-kicker">Dominios</div>
      <h2>Mapa visual de LIFEOS</h2>
      <p>Cada dominio muestra estado, progreso, proyectos, PRD y modo del especialista.</p>
    </div>
    <div class="domains-list">${domains.map(domainCard).join('')}</div>
  </div>`;
}

function areaView() {
  const a=S.areas.find(x=>x.id===S.areaId);
  if(!a) return '';
  const ts=S.tasks.filter(t=>t.area_id===a.id);
  const ws=S.wf.filter(w=>w.area_id===a.id);
  const ds=S.dec.filter(d=>d.area_id===a.id);
  const areaProjects=S.projects.filter(p=>p.area_id===a.id);
  const isVJ=a.name==='VistaJet';
  const isJETMI=a.name==='JETMI';
  const isFin=a.name==='Finanzas';
  const isSalud=a.name==='Salud';
  const isGym=a.name==='Gym';
  const isMarca=a.name==='Marca Personal';
  const isVida=a.name==='Vida Personal';
  const domainIntroHtml=domainDashboardIntro(a);

  const vjView=isVJ?()=>{
    const vj=S.vjState;
    const now=new Date();
    const status=vj.status||'libre';
    const statusMap={rotacion:{label:'En rotación',bg:'#FAEEDA',color:'#854F0B'},libre:{label:'Libre',bg:'#E1F5EE',color:'#0F6E56'},standby:{label:'Standby',bg:'#EEEDFE',color:'#534AB7'}};
    const st=statusMap[status]||statusMap.libre;
    const pendTasks=S.vjTasks.filter(t=>t.status!=='done');

    const isAircraftTask=t=>/\bho\b|hoto|hand.?over|inventar|laundry|lavand|uplift|catering|amenities|defect|kettle|polish|leather|drawer/i.test(t.title);
    const isAdminTask=t=>/factura|elearning|e.?learning|visa|revis|correo|revista/i.test(t.title);
    const aircraftPend=pendTasks.filter(isAircraftTask);
    const adminPend=pendTasks.filter(isAdminTask);
    const allAircraftPend=[...aircraftPend,...pendTasks.filter(t=>!isAircraftTask(t)&&!isAdminTask(t))];

    const alerts=[];
    pendTasks.forEach(t=>{
      if(!t.due_date) return;
      const d=Math.ceil((new Date(t.due_date)-now)/864e5);
      if(d<0) alerts.push({level:'red',text:`Vencida: ${t.title}`});
      else if(d<=2) alerts.push({level:'amber',text:`${d===0?'Hoy':d===1?'Mañana':'En 2 días'}: ${t.title}`});
    });
    if(vj.passport_exp){const d=Math.ceil((new Date(vj.passport_exp)-now)/864e5);if(d<=90) alerts.push({level:d<=30?'red':'amber',text:`Pasaporte vence en ${d} días`});}

    const critAlert=alerts.find(al=>al.level==='red');
    let isabelCriterion;
    if(critAlert){
      isabelCriterion=`Urgente antes del siguiente sector: ${critAlert.text.replace(/^Vencida: /,'').replace(/^En \d+ días: /,'')}.`;
    } else if(allAircraftPend.length===1){
      isabelCriterion=`Una cosa antes de salir: ${allAircraftPend[0].title}.`;
    } else if(allAircraftPend.length===2){
      isabelCriterion=`${allAircraftPend[0].title}. Después, ${allAircraftPend[1].title}.`;
    } else if(allAircraftPend.length>=3){
      isabelCriterion=`${allAircraftPend[0].title}. ${allAircraftPend[1].title}. Y ${allAircraftPend[2].title}${allAircraftPend.length>3?' (y '+(allAircraftPend.length-3)+' más)':''}.`;
    } else if(adminPend.length>0){
      isabelCriterion=`El avión está al día. Queda pendiente: ${adminPend[0].title}.`;
    } else if(status==='rotacion'){
      isabelCriterion='El avión está bajo control. Buen momento para actualizar el HO si hay cambios de última hora.';
    } else if(status==='libre'){
      isabelCriterion='Todo cerrado. El avión está listo para la próxima rotación.';
    } else {
      isabelCriterion='Sin acciones pendientes.';
    }

    const hotoTasksExist=pendTasks.some(t=>/hoto|hand.?over|defect/i.test(t.title));
    const primaryCTA=hotoTasksExist?{label:'Ir al HOTO',view:'vj_hoto'}:status==='rotacion'?{label:'Ver Laundry Form',view:'vj_laundry'}:null;

    const hoToChecks=JSON.parse(localStorage.getItem('vj_hoto_checks')||'{}');
    const allHotoItems=VJ_HOTO_SECTIONS.flatMap(s=>s.items);
    const hotoCompleted=allHotoItems.filter(i=>hoToChecks[i.id]).length;
    const hotoTotal=allHotoItems.length;
    const hotoTasks=pendTasks.filter(t=>/hoto|hand.?over|defect/i.test(t.title));

    const todayStr=now.toISOString().slice(0,10);
    const laundryDate=localStorage.getItem('vj_laundry_date');
    const laundryItems=JSON.parse(localStorage.getItem('vj_laundry_items')||'{}');
    const laundryToday=laundryDate===todayStr;
    const laundryTotal=laundryToday?Object.values(laundryItems).reduce((a,b)=>a+b,0):0;

    const inventTasks=pendTasks.filter(t=>/inventar|catering|amenities|uplift/i.test(t.title));
    const elearningTasks=pendTasks.filter(t=>/elearning|e.?learning/i.test(t.title));
    const facturaTasks=pendTasks.filter(t=>/factura/i.test(t.title));
    const passportDays=vj.passport_exp?Math.ceil((new Date(vj.passport_exp)-now)/864e5):null;
    const bagTemplates=JSON.parse(localStorage.getItem('vj_bag_templates')||'null')||[{id:'standard',name:'Rotación estándar',items:['Uniforme completo','Zapatos negros','Medias/calcetines','Documentos de identidad','Pasaporte','Licencia','Manuals tablet','Cargadores','Neceser','Medicación','Ropa casual (3 días)','Pijama']},{id:'long',name:'Rotación larga (+7 días)',items:['Todo de estándar','Ropa extra (4 días)','Vitaminas','Snacks','Auriculares','Libro/tablet personal']},{id:'visa',name:'Destino con visa',items:['Pasaporte vigente','Visa/permiso entrada','Seguro viaje','Formularios entrada','Fotos carnet']}];
    const activeBag=vj.active_bag||null;
    const bagChecks=vj.bag_checks||{};
    const activeTpl=bagTemplates.find(t=>t.id===activeBag);
    const bagTotal=activeTpl?activeTpl.items.length:0;
    const bagDone=activeTpl?activeTpl.items.filter((_,i)=>bagChecks[activeBag+'_'+i]).length:0;

    const toolCard=(icon,name,sl,sc,sb,summary,view)=>
      `<button onclick="go('${view}')" style="background:var(--surface);border:0.5px solid var(--border);border-radius:12px;padding:14px;text-align:left;cursor:pointer;display:flex;flex-direction:column;width:100%;min-height:105px">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:6px;width:100%">
          <span style="font-size:18px">${icon}</span>
          <span style="font-size:10px;font-weight:600;color:${sc};background:${sb};border-radius:999px;padding:2px 7px">${sl}</span>
        </div>
        <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:3px">${name}</div>
        <div style="font-size:11px;color:var(--t2);line-height:1.45;margin-top:auto">${summary}</div>
      </button>`;

    const adminCard=(icon,name,sl,sc,sb,summary,onclick)=>
      `<button onclick="${onclick}" style="background:var(--surface);border:0.5px solid var(--border);border-radius:12px;padding:14px;text-align:left;cursor:pointer;display:flex;flex-direction:column;width:100%;min-height:105px">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:6px;width:100%">
          <span style="font-size:18px">${icon}</span>
          <span style="font-size:10px;font-weight:600;color:${sc};background:${sb};border-radius:999px;padding:2px 7px">${sl}</span>
        </div>
        <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:3px">${name}</div>
        <div style="font-size:11px;color:var(--t2);line-height:1.45;margin-top:auto">${summary}</div>
      </button>`;

    const hotoSL=hotoCompleted===hotoTotal?'Completado':status!=='rotacion'?'Preparado':hotoCompleted===0?'Pendiente':'En progreso';
    const hotoSC=hotoCompleted===hotoTotal?'#0F6E56':status!=='rotacion'?'#9CA3AF':hotoCompleted===0?'#854F0B':'#185FA5';
    const hotoSB=hotoCompleted===hotoTotal?'#E1F5EE':status!=='rotacion'?'#F5F5F5':hotoCompleted===0?'#FAEEDA':'#EEF4FD';
    const hotoSummary=status!=='rotacion'&&hotoCompleted===0?'Disponible durante rotación':hotoCompleted===0?(hotoTasks.length>0?hotoTasks.length+' tarea'+(hotoTasks.length>1?'s':'')+' pendiente'+(hotoTasks.length>1?'s':''):'Checklist no iniciado'):hotoCompleted+'/'+hotoTotal+' completado'+(hotoCompleted>1?'s':'');

    const inventSL=inventTasks.length>0?'Revisar':'Al día';
    const inventSC=inventTasks.length>0?'#854F0B':'#0F6E56';
    const inventSB=inventTasks.length>0?'#FAEEDA':'#E1F5EE';
    const inventSummary=inventTasks.length>0?inventTasks.length+' ítem'+(inventTasks.length>1?'s':'')+' pendiente'+(inventTasks.length>1?'s':''):'Sin novedades';

    const laundrySL=!laundryToday?(status==='rotacion'?'Hoy pendiente':'No activo'):(laundryTotal>0?laundryTotal+' ítems':'En blanco');
    const laundrySC=!laundryToday&&status==='rotacion'?'#854F0B':!laundryToday?'#9CA3AF':'#185FA5';
    const laundrySB=!laundryToday&&status==='rotacion'?'#FAEEDA':!laundryToday?'#F5F5F5':'#EEF4FD';
    const laundrySummary=laundryToday&&laundryTotal>0?'Registrado hoy: '+laundryTotal+' ítems':status==='rotacion'?'Se completa al final del día':'Disponible en rotación';

    const freshSL=status==='rotacion'?'Recomendado':'No activo';
    const freshSC=status==='rotacion'?'#185FA5':'#9CA3AF';
    const freshSB=status==='rotacion'?'#EEF4FD':'#F5F5F5';

    const elearSL=elearningTasks.length>0?elearningTasks.length+' pendiente'+(elearningTasks.length>1?'s':''):'Al día';
    const elearSC=elearningTasks.length>0?'#854F0B':'#0F6E56';
    const elearSB=elearningTasks.length>0?'#FAEEDA':'#E1F5EE';
    const elearSummary=elearningTasks.length>0?(elearningTasks[0].due_date?'Vence: '+new Date(elearningTasks[0].due_date).toLocaleDateString('es-ES',{day:'numeric',month:'short'}):elearningTasks[0].title.slice(0,35)):'Sin eLearnings pendientes';

    const factSL=facturaTasks.length>0?facturaTasks.length+' pendiente'+(facturaTasks.length>1?'s':''):'Al día';
    const factSC=facturaTasks.length>0?'#854F0B':'#0F6E56';
    const factSB=facturaTasks.length>0?'#FAEEDA':'#E1F5EE';
    const factSummary=facturaTasks.length>0?facturaTasks[0].title.slice(0,38):'Sin facturas pendientes';

    const visaSL=passportDays===null?'Sin datos':passportDays<=30?'Urgente':passportDays<=90?'Revisar':'En orden';
    const visaSC=passportDays===null?'#9CA3AF':passportDays<=30?'#A32D2D':passportDays<=90?'#854F0B':'#0F6E56';
    const visaSB=passportDays===null?'#F5F5F5':passportDays<=30?'#FCEBEB':passportDays<=90?'#FAEEDA':'#E1F5EE';
    const visaSummary=passportDays===null?'Fecha no registrada':'Pasaporte: '+passportDays+' días';

    const maletaSL=!activeTpl?'Sin plantilla':bagDone===bagTotal?'Lista':bagDone===0?'Por preparar':bagDone+'/'+bagTotal;
    const maletaSC=!activeTpl?'#9CA3AF':bagDone===bagTotal?'#0F6E56':bagDone===0?'#854F0B':'#185FA5';
    const maletaSB=!activeTpl?'#F5F5F5':bagDone===bagTotal?'#E1F5EE':bagDone===0?'#FAEEDA':'#EEF4FD';
    const maletaSummary=!activeTpl?'Selecciona una plantilla':bagDone===bagTotal?'Todo preparado':bagDone+' de '+bagTotal+' preparados';

    return `
    <div style="background:var(--surface);border-radius:12px;padding:16px;margin-bottom:10px;border:0.5px solid var(--border)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
        <div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)">Isabel · copiloto</div>
        <button onclick="openVjState()" style="border:none;background:var(--bg);border-radius:8px;padding:4px 10px;font-size:11px;font-weight:500;cursor:pointer;color:var(--t2)">${st.label}</button>
      </div>
      ${vj.aircraft?`<div style="font-size:11px;color:var(--t3);margin-bottom:8px">${vj.aircraft}${status==='rotacion'&&vj.rotation_day&&vj.rotation_total?' · Día '+vj.rotation_day+'/'+vj.rotation_total:''}</div>`:''}
      <div style="font-size:15px;font-weight:500;color:var(--text);line-height:1.55;margin-bottom:${primaryCTA?12:10}px">${isabelCriterion}</div>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        ${primaryCTA?`<button onclick="go('${primaryCTA.view}')" style="border:none;background:var(--text);color:#fff;border-radius:8px;padding:8px 14px;font-size:12px;font-weight:600;cursor:pointer">${primaryCTA.label}</button>`:''}
        <button onclick="openChat()" style="border:none;background:none;padding:0;font-size:12px;font-weight:500;color:var(--t2);cursor:pointer">Hablar con Isabel →</button>
      </div>
    </div>

    ${(()=>{
      const hasProblems=allAircraftPend.length>0;
      const acSL=status!=='rotacion'?'Fuera de rotación':hasProblems?allAircraftPend.length+' pendiente'+(allAircraftPend.length>1?'s':''):'Bajo control';
      const acSC=status!=='rotacion'?'#9CA3AF':hasProblems?'#854F0B':'#0F6E56';
      const acSB=status!=='rotacion'?'#F5F5F5':hasProblems?'#FAEEDA':'#E1F5EE';
      const acSummary=status!=='rotacion'?'Disponible durante rotación':hasProblems?allAircraftPend.slice(0,2).map(t=>t.title).join(' · ')+(allAircraftPend.length>2?' · …':''):'HOTO, inventario y tareas al día';
      return `<button onclick="go('vj_status')" style="background:var(--surface);border:0.5px solid var(--border);border-radius:12px;padding:14px;text-align:left;cursor:pointer;display:flex;justify-content:space-between;align-items:center;width:100%;margin-bottom:8px">
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:20px">✈️</span>
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--text)">Estado del avión</div>
            <div style="font-size:11px;color:var(--t2);margin-top:2px">${acSummary}</div>
          </div>
        </div>
        <span style="font-size:10px;font-weight:600;color:${acSC};background:${acSB};border-radius:999px;padding:3px 9px;white-space:nowrap">${acSL}</span>
      </button>`;
    })()}
    <div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin:8px 0 8px">Herramientas de la rotación</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:4px">
      ${toolCard('📋','HOTO',hotoSL,hotoSC,hotoSB,hotoSummary,'vj_hoto')}
      ${toolCard('📦','Inventario',inventSL,inventSC,inventSB,inventSummary,'vj_inventario')}
      ${toolCard('🧺','Laundry Form',laundrySL,laundrySC,laundrySB,laundrySummary,'vj_laundry')}
      ${toolCard('🥗','Fresh Items Plan',freshSL,freshSC,freshSB,'Basado en sectores y pasajeros','vj_fresh')}
    </div>

    <div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin:16px 0 8px">Administrativo y personal</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px">
      ${adminCard('📚','eLearnings',elearSL,elearSC,elearSB,elearSummary,"openAddVjTask()")}
      ${adminCard('🧾','Facturas',factSL,factSC,factSB,factSummary,"openAddVjTask()")}
      ${adminCard('📄','Visas & Docs',visaSL,visaSC,visaSB,visaSummary,"openVjState()")}
      ${adminCard('🧳','Maleta',maletaSL,maletaSC,maletaSB,maletaSummary,"selectVjBag('standard')")}
    </div>

    <div style="text-align:center;padding-bottom:10px">
      <button onclick="openAddVjTask()" style="border:none;background:none;font-size:12px;font-weight:500;color:var(--t2);cursor:pointer">+ Añadir tarea</button>
    </div>`;
  }:'';
  const jetmiView=isJETMI?()=>{
    const now=Date.now();
    const met=S.metrics.filter(x=>x.area_id===a.id);
    const mv=k=>met.find(x=>x.key===k);
    const jetmiProjs=S.projects.filter(p=>p.area_id===a.id);
    const activeProjs=jetmiProjs.filter(p=>p.status==='active');
    const jetmiTasks=S.tasks.filter(t=>t.area_id===a.id&&t.status!=='done');
    const jetmiDec=S.dec.filter(d=>d.area_id===a.id);
    const jetmiWF=S.wf.filter(w=>w.area_id===a.id);
    const jetmiProjIds=jetmiProjs.map(p=>p.id);
    const jetmiEvs=S.eventos.filter(e=>e.area_id===a.id||jetmiProjIds.includes(e.project_id));
    const recentEvs=jetmiEvs.filter(e=>now-new Date(e.created_at)<7*864e5);
    const ops=Array.from(new Map(S.operators.map(o=>[(o.name||'')+'|'+(o.notes||''),o])).values());
    const activeOps=ops.filter(o=>o.status==='active');
    const contribs=isabelContributions(a.id,4);

    // ── Momentum (interpretación cualitativa de Isabel sobre velocidad) ──
    let momentum,momentumColor,momentumBg;
    const staleProjs=activeProjs.filter(p=>Math.floor((now-new Date(p.last_activity_at||p.created_at))/864e5)>7);
    const oldDec=jetmiDec.filter(d=>Math.floor((now-new Date(d.created_at))/864e5)>7);
    if(recentEvs.length>=3&&oldDec.length===0){
      momentum='JETMI avanzó esta semana.';momentumColor='#0F6E56';momentumBg='#E1F5EE';
    } else if(recentEvs.length>=1&&oldDec.length<=1){
      momentum='Ritmo moderado — hay avance pero queda capacidad.';momentumColor='#534AB7';momentumBg='#EEEDFE';
    } else if(staleProjs.length>0||oldDec.length>1){
      momentum='El ritmo ha bajado. Hay decisiones sin cerrar que bloquean el avance.';momentumColor='#D97706';momentumBg='#FAEEDA';
    } else {
      momentum='Sin actividad reciente. Es momento de registrar avances o abrir una sesión de trabajo.';momentumColor='#9CA3AF';momentumBg='#F5F5F5';
    }

    // ── Brújula estratégica (Dashboard) ───────────────────────────────
    // Nivel actual → siguiente nivel (derivado de datos)
    const nivelActual=
      activeOps.length===0&&activeProjs.length===0?'Pre-operativa — base en construcción':
      activeOps.length===0&&activeProjs.length>0?'Construyendo oferta — sin operadores activos':
      activeOps.length>0&&leadsMetric===0?'Red inicial activa — sin pipeline':
      leadsMetric>0&&ingresosMetric===0?'Pipeline en marcha — sin ingresos':
      ingresosMetric>0?'Operación activa':
      'Construcción de red';

    const siguienteNivel=activeOps.length===0?'Primer operador cualificado':
      activeOps.length<3?'Red de 3 operadores cualificados':
      !mv('leads')||parseInt(mv('leads')?.value||'0')===0?'Primer lead calificado':
      'Primera operación cerrada';

    // Cuello de botella (mayor freno actual)
    const stallProject=staleProjs[0];
    const oldestDec=oldDec.sort((x,y)=>new Date(x.created_at)-new Date(y.created_at))[0];
    let cuello;
    if(oldestDec) cuello=`Decisión sin cerrar: "${oldestDec.title}" lleva ${Math.floor((now-new Date(oldestDec.created_at))/864e5)} días abierta.`;
    else if(activeOps.length===0) cuello='No hay operadores activos — sin red de operación, no hay cotizaciones posibles.';
    else if(stallProject) cuello=`"${stallProject.title}" lleva ${Math.floor((now-new Date(stallProject.last_activity_at||stallProject.created_at))/864e5)} días sin actividad.`;
    else cuello=null;

    // Acción de hoy (mayor impacto ahora)
    const critTask=jetmiTasks.find(t=>t.priority==='critical'||t.priority==='alta');
    const projNNA=activeProjs.find(p=>!p.next_action);
    let accionHoy;
    if(critTask) accionHoy=critTask.title;
    else if(oldestDec) accionHoy=`Cerrar: "${oldestDec.title}"`;
    else if(projNNA) accionHoy=`Definir próxima acción en "${projNNA.title}"`;
    else if(activeOps.length===0) accionHoy='Registrar primer operador cualificado';
    else accionHoy=null;

    // Riesgo activo
    const riesgoDec=jetmiDec.filter(d=>Math.floor((now-new Date(d.created_at))/864e5)>14);
    const riesgo=riesgoDec.length>0?`${riesgoDec.length} decisión${riesgoDec.length>1?'es':''} lleva${riesgoDec.length>1?'n':''} más de 14 días sin respuesta.`:null;

    // ── Rol activo de Isabel (auto-activado por contexto) ──────────────
    let isabelRol,isabelRolLabel;
    if(oldestDec&&/legal|contrato|validac/i.test(oldestDec.title)){isabelRol='legal';isabelRolLabel='Legal & Compliance';}
    else if(critTask&&/contenido|instagram|tiktok|post/i.test(critTask.title)){isabelRol='marketing';isabelRolLabel='Responsable de Marketing';}
    else if(critTask&&/operador|fleet|aeronave/i.test(critTask.title)){isabelRol='partnerships';isabelRolLabel='Head of Partnerships';}
    else if(jetmiDec.some(d=>/estrateg|direcci|nivel|objetivo/i.test(d.title))){isabelRol='strategy';isabelRolLabel='Cofundadora / Estratega';}
    else if(accionHoy&&activeProjs.length>0){isabelRol='cro';isabelRolLabel='CRO — Pipeline Comercial';}
    else{isabelRol='strategy';isabelRolLabel='Cofundadora / Estratega';}

    // Criterio de Isabel
    let isabelCriterion;
    if(cuello&&oldestDec) isabelCriterion=`El cuello de botella real es "${oldestDec.title}". Hasta que se cierre, todo lo demás avanza en ralentí.`;
    else if(accionHoy&&cuello) isabelCriterion=`${cuello} Empezaría por resolverlo antes de abrir nuevos frentes.`;
    else if(activeProjs.length>0&&staleProjs.length>0) isabelCriterion=`${staleProjs.length} proyecto${staleProjs.length>1?'s están':' está'} parado${staleProjs.length>1?'s':''}. Antes de abrir nuevos, definiría qué desbloquea los existentes.`;
    else if(activeOps.length===0) isabelCriterion='Sin operadores activos no hay oferta posible. El primer operador cualificado es la mayor palanca ahora mismo.';
    else isabelCriterion='El dominio está avanzando. Mantener el ritmo y cerrar las decisiones pendientes.';

    // ── 5 motores empresariales ────────────────────────────────────────
    const leadsMetric=parseInt(mv('leads')?.value||'0');
    const cajaMetric=parseFloat(mv('caja')?.value||'0');
    const ingresosMetric=parseFloat(mv('ingresos')?.value||'0');
    const motorsJETMI=[
      {icon:'🧭',name:'Dirección',desc:'¿Cuál es el siguiente nivel?',
       state:activeProjs.length>0?'verde':'amber',
       detail:`→ ${siguienteNivel}`},
      {icon:'🤝',name:'Relaciones',desc:'Operadores · clientes · partners',
       state:activeOps.length>0?'verde':'amber',
       detail:activeOps.length>0?`${activeOps.length} operador${activeOps.length>1?'es activos':' activo'} · ${ops.filter(o=>o.status==='contacted').length} en contacto`:'Sin operadores activos'},
      {icon:'📈',name:'Pipeline',desc:'¿Qué oportunidades están avanzando?',
       state:leadsMetric>0?'verde':'gris',
       detail:leadsMetric>0?`${leadsMetric} lead${leadsMetric>1?'s':''} en seguimiento`:'Sin leads registrados'},
      {icon:'📣',name:'Adquisición',desc:'¿Cómo llegan nuevas oportunidades?',
       state:activeProjs.some(p=>/instagram|tiktok|web|landing|contenido|seo/i.test(p.title))?'verde':'amber',
       detail:activeProjs.find(p=>/instagram|tiktok|web|landing|contenido|seo/i.test(p.title))?.title||'Sin canal de adquisición activo'},
      {icon:'💰',name:'Finanzas',desc:'¿El crecimiento es sostenible?',
       state:cajaMetric>0||ingresosMetric>0?'verde':'gris',
       detail:cajaMetric>0?`Caja: ${cajaMetric.toLocaleString('es')}€`:ingresosMetric>0?`Ingresos: ${ingresosMetric.toLocaleString('es')}€`:'Sin datos financieros registrados'},
    ];
    const mSC={verde:'#0F6E56',amber:'#D97706',gris:'#9CA3AF'};
    const mSB={verde:'#E1F5EE',amber:'#FAEEDA',gris:'#F5F5F5'};

    // ── Red de relaciones (extensión principal) ───────────────────────
    const opStatusColor={contacted:'#534AB7',active:'#0F6E56',identified:'#9CA3AF',declined:'#A32D2D'};
    const opStatusLabel={contacted:'En contacto',active:'Activo',identified:'Identificado',declined:'Descartado'};

    // ── Deriva espacios de trabajo desde el criterio de Isabel ────────────
    // Máximo 3. Prioridad: acción concreta → decisiones bloqueantes → operadores
    const jWorkspaces = [];

    // Workspace primario: el proyecto/acción derivada de accionHoy
    const accionProj = projNNA || staleProjs[0] || null;
    const accionProjRef = critTask ? activeProjs.find(p => S.tasks.find(t => t.id === critTask.id && t.project_id === p.id)) : null;
    const primaryProj = accionProjRef || accionProj;
    if (primaryProj) {
      jWorkspaces.push({ type: 'project', proj: primaryProj });
    } else if (activeOps.length === 0 && jWorkspaces.length === 0) {
      // Si no hay operadores activos, eso ES la acción
      jWorkspaces.push({ type: 'operators_empty' });
    }

    // Workspace secundario: decisiones bloqueantes (siempre si existen)
    if (jetmiDec.length > 0 && jWorkspaces.length < 3) {
      jWorkspaces.push({ type: 'decisions' });
    }

    // Workspace terciario: operadores si la acción los requiere O si no hay otro workspace
    const needsOps = accionHoy && /operador|fleet|relacion/i.test(accionHoy);
    if ((needsOps || jWorkspaces.length === 0) && ops.length > 0 && jWorkspaces.length < 3) {
      jWorkspaces.push({ type: 'operators' });
    }

    // Si sigue vacío (nada urgente), mostrar proyectos activos
    if (jWorkspaces.length === 0 && activeProjs.length > 0) {
      jWorkspaces.push({ type: 'projects_all' });
    }

    return `
    <!-- CRITERIO DE ISABEL — BRÚJULA ESTRATÉGICA -->
    <div style="background:var(--surface);border-radius:12px;padding:16px;margin-bottom:12px;border:0.5px solid var(--border)">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
        <div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)">Isabel · modo producción</div>
        <span style="font-size:10px;font-weight:600;background:#EEEDFE;color:#534AB7;padding:2px 8px;border-radius:999px">${isabelRolLabel}</span>
      </div>

      <!-- Nivel actual → siguiente -->
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding:10px 12px;background:var(--bg);border-radius:8px">
        <div style="flex:1">
          <div style="font-size:10px;color:var(--t3);margin-bottom:3px">Ahora</div>
          <div style="font-size:13px;font-weight:500;color:var(--text)">${nivelActual}</div>
        </div>
        <span style="font-size:16px;color:var(--t3)">→</span>
        <div style="flex:1;text-align:right">
          <div style="font-size:10px;color:var(--t3);margin-bottom:3px">Siguiente nivel</div>
          <div style="font-size:13px;font-weight:600;color:#534AB7">${siguienteNivel}</div>
        </div>
      </div>

      <!-- Cuello de botella -->
      ${cuello?`<div style="padding:9px 12px;background:#FAEEDA;border-radius:8px;margin-bottom:8px">
        <div style="font-size:10px;font-weight:700;color:#D97706;text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px">Cuello de botella</div>
        <div style="font-size:13px;color:#854F0B;line-height:1.45">${cuello}</div>
      </div>`:''}

      <!-- Acción de hoy -->
      ${accionHoy?`<div style="padding:9px 12px;background:#E1F5EE;border-radius:8px;margin-bottom:10px">
        <div style="font-size:10px;font-weight:700;color:#0F6E56;text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px">Acción de hoy</div>
        <div style="font-size:13px;color:#085041;line-height:1.45">${accionHoy}</div>
      </div>`:''}

      <!-- Criterio de Isabel -->
      <div style="font-size:13px;color:var(--text);line-height:1.55;margin-bottom:12px">${isabelCriterion}</div>
      <button onclick="openChat()" style="background:none;border:none;padding:0;font-size:11px;font-weight:500;color:var(--t2);cursor:pointer">Hablar con Isabel →</button>
    </div>

    <!-- ESPACIOS DE TRABAJO DERIVADOS DEL CRITERIO -->
    ${jWorkspaces.map(ws => {
      if (ws.type === 'project') return `
      <div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-bottom:4px">Proyecto prioritario</div>
      <div onclick="goProject('${ws.proj.id}')" style="background:var(--surface);border-radius:12px;padding:14px;margin-bottom:12px;border:0.5px solid var(--border);cursor:pointer">
        <div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:6px">${ws.proj.title}</div>
        ${ws.proj.next_action?`<div style="font-size:12px;color:var(--t2)">→ ${ws.proj.next_action}</div>`:`<div style="display:flex;align-items:center;gap:6px"><span style="width:6px;height:6px;border-radius:50%;background:#A32D2D;flex-shrink:0"></span><span style="font-size:12px;color:#A32D2D">Sin próxima acción definida</span></div>`}
        ${Math.floor((now-new Date(ws.proj.last_activity_at||ws.proj.created_at))/864e5)>7?`<div style="font-size:11px;color:#D97706;margin-top:4px">${Math.floor((now-new Date(ws.proj.last_activity_at||ws.proj.created_at))/864e5)} días sin actividad</div>`:''}
      </div>`;

      if (ws.type === 'decisions') return `
      <div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-bottom:4px">Requiere tu decisión</div>
      <div style="background:var(--surface);border-radius:12px;padding:2px 14px;margin-bottom:12px;border:0.5px solid var(--border)">
        ${[...jetmiDec.map((d,i)=>`<div style="padding:10px 0;${i<jetmiDec.length-1||jetmiWF.length?'border-bottom:0.5px solid var(--border);':''}">
          <div style="font-size:13px;font-weight:500;color:var(--text)">${d.title}</div>
          <div style="font-size:10px;color:${Math.floor((now-new Date(d.created_at))/864e5)>7?'#D97706':'var(--t3)'};margin-top:2px">Abierta hace ${Math.floor((now-new Date(d.created_at))/864e5)} días</div>
        </div>`),
        ...jetmiWF.map((w,i,arr)=>`<div style="padding:10px 0;${i<arr.length-1?'border-bottom:0.5px solid var(--border);':''}">
          <div style="font-size:13px;font-weight:500;color:var(--text)">${w.title}</div>
          <div style="font-size:10px;color:var(--t3);margin-top:2px">Esperando: ${w.waiting_on||'sin definir'}${w.follow_up_date?' · '+new Date(w.follow_up_date).toLocaleDateString('es-ES',{day:'numeric',month:'short'}):''}</div>
        </div>`)].join('')}
      </div>`;

      if (ws.type === 'operators_empty') return `
      <div style="background:#FAEEDA;border-radius:12px;padding:14px;margin-bottom:12px;border:0.5px solid #D97706">
        <div style="font-size:10px;font-weight:700;color:#D97706;text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px">Sin operadores activos</div>
        <div style="font-size:13px;color:#854F0B;line-height:1.5">El primer operador cualificado desbloquea todo lo demás. Sin red de operación, no hay cotizaciones posibles.</div>
      </div>`;

      if (ws.type === 'operators') return `
      <div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-bottom:4px">Relaciones</div>
      <div style="background:var(--surface);border-radius:12px;padding:2px 14px;margin-bottom:12px;border:0.5px solid var(--border)">
        ${ops.filter(o=>o.status!=='declined').map((o,i,arr)=>`<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;${i<arr.length-1?'border-bottom:0.5px solid var(--border);':''}">
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:500">${o.name}</div>
            ${o.notes?`<div style="font-size:11px;color:var(--t2);margin-top:2px">${o.notes}</div>`:''}
          </div>
          <span style="font-size:11px;font-weight:600;color:${opStatusColor[o.status]||'#888'};background:${opStatusColor[o.status]||'#888'}15;padding:3px 8px;border-radius:999px;flex-shrink:0">${opStatusLabel[o.status]||o.status}</span>
        </div>`).join('')}
      </div>`;

      if (ws.type === 'projects_all') return `
      <div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-bottom:4px">Proyectos activos</div>
      <div style="background:var(--surface);border-radius:12px;padding:2px 14px;margin-bottom:12px;border:0.5px solid var(--border)">
        ${activeProjs.map((p,i)=>`<div onclick="goProject('${p.id}')" style="display:flex;align-items:flex-start;gap:10px;padding:11px 0;${i<activeProjs.length-1?'border-bottom:0.5px solid var(--border);':''}cursor:pointer">
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:500">${p.title}</div>
            ${p.next_action?`<div style="font-size:11px;color:var(--t2);margin-top:2px">→ ${p.next_action}</div>`:`<div style="font-size:11px;color:#A32D2D;margin-top:2px">Sin próxima acción</div>`}
          </div>
          <i class="ti ti-chevron-right" style="font-size:13px;color:var(--t3);flex-shrink:0;margin-top:2px"></i>
        </div>`).join('')}
      </div>`;

      return '';
    }).join('')}

    <!-- TODO EN PROFUNDIDAD -->
    <details style="margin-bottom:14px">
      <summary style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;padding:4px 0">
        <span>Ver todo</span><span style="font-size:14px;color:var(--t3)">›</span>
      </summary>
      <div style="background:var(--surface);border-radius:12px;padding:2px 14px;margin-top:8px;border:0.5px solid var(--border)">
        ${activeProjs.map((p,i,arr)=>`<div onclick="goProject('${p.id}')" style="display:flex;align-items:center;gap:12px;padding:12px 0;${i<arr.length-1?'border-bottom:0.5px solid var(--border);':''}cursor:pointer">
          <span style="width:8px;height:8px;border-radius:50%;background:${p.next_action?'#0F6E56':'#A32D2D'};flex-shrink:0"></span>
          <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:500">${p.title}</div>${p.next_action?`<div style="font-size:11px;color:var(--t2);margin-top:1px">→ ${p.next_action}</div>`:''}</div>
          <i class="ti ti-chevron-right" style="font-size:13px;color:var(--t3)"></i>
        </div>`).join('')}
        ${ops.length?`<div style="padding:10px 0 4px;border-top:0.5px solid var(--border)">
          <div style="font-size:10px;color:var(--t3);margin-bottom:6px">Operadores · ${activeOps.length} activos · ${ops.filter(o=>o.status==='contacted').length} en contacto</div>
          ${ops.filter(o=>o.status!=='declined').slice(0,3).map(o=>`<div style="font-size:12px;color:var(--text);padding:3px 0">${o.name} <span style="color:${opStatusColor[o.status]||'#888'}">${opStatusLabel[o.status]||o.status}</span></div>`).join('')}
        </div>`:''}
        ${met.length?`<div style="padding:10px 0 4px;border-top:0.5px solid var(--border);display:grid;grid-template-columns:1fr 1fr;gap:8px">${met.slice(0,4).map(x=>`<div style="background:var(--bg);border-radius:8px;padding:8px 10px"><div style="font-size:15px;font-weight:700">${x.value}<span style="font-size:10px;color:var(--t2);font-weight:400"> ${x.unit||''}</span></div><div style="font-size:10px;color:var(--t3);margin-top:1px">${x.label||x.key}</div></div>`).join('')}</div>`:''}
      </div>
    </details>`;
  }:'';

  const vidaView=isVida?()=>{
    const m=S.metrics.filter(x=>x.area_id===a.id);
    const get=k=>m.find(x=>x.key===k);
    const cannabisStart=get('cannabis_start_date');
    const sueno=get('horas_sueno');
    const diasSinCannabis=cannabisStart?Math.floor((Date.now()-new Date(cannabisStart.value))/(864e5)):0;
    const cannabisColor=diasSinCannabis>30?'#0F6E56':diasSinCannabis>7?'#854F0B':'#A32D2D';
    const rels=[
      {name:'Jaime',status:'Pareja · conexión fuerte',icon:'❤️'},
      {name:'Madre',status:'Cercana · apoyo clave',icon:'💛'},
      {name:'Padre',status:'Melanoma · apoyo con límites',icon:'🧡'},
    ];
    const planes=[
      {icon:'🇨🇳',label:'China',desc:'Hong Kong · Shenzhen · Chongqing · Guilin'},
      {icon:'🇵🇹',label:'Portugal',desc:'Residencia fiscal norte Portugal — objetivo medio plazo'},
    ];
    return `
    <div class="card" style="margin-bottom:10px">
      <div class="card-head"><span class="ch-icon">🌱</span><span class="ch-label">Hábitos</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border)">
        <div style="background:var(--surface);padding:14px 12px;text-align:center">
          <div style="font-size:28px;font-weight:700;color:${cannabisColor}">${diasSinCannabis}</div>
          <div style="font-size:10px;color:var(--t2);margin-top:2px">días sin cannabis</div>
          ${cannabisStart?`<div style="font-size:9px;color:var(--t3);margin-top:2px">desde ${new Date(cannabisStart.value).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</div>`:''}
          <button onclick="resetCannabis()" style="margin-top:6px;padding:4px 10px;border-radius:6px;background:var(--bg);border:1px solid var(--border);font-size:11px;cursor:pointer">Reiniciar</button>
        </div>
        <div style="background:var(--surface);padding:14px 12px;text-align:center">
          <div style="font-size:28px;font-weight:700">${sueno?sueno.value:'—'}<span style="font-size:14px;color:var(--t2);font-weight:400">h</span></div>
          <div style="font-size:10px;color:var(--t2);margin-top:2px">sueño anoche</div>
          <div style="display:flex;gap:4px;justify-content:center;margin-top:6px">
            ${[6,7,8,9].map(h=>`<button onclick="setSueno(${h})" style="padding:3px 6px;border-radius:5px;border:1px solid ${sueno&&parseInt(sueno.value)===h?'var(--text)':'var(--border)'};background:${sueno&&parseInt(sueno.value)===h?'var(--text)':'var(--surface)'};color:${sueno&&parseInt(sueno.value)===h?'#fff':'var(--t2)'};font-size:10px;cursor:pointer">${h}h</button>`).join('')}
          </div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-bottom:10px">
      <div class="card-head"><span class="ch-icon">👥</span><span class="ch-label">Relaciones</span></div>
      ${rels.map(r=>`
      <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-top:1px solid var(--border)">
        <span style="font-size:20px">${r.icon}</span>
        <div>
          <div style="font-size:14px;font-weight:600">${r.name}</div>
          <div style="font-size:12px;color:var(--t2)">${r.status}</div>
        </div>
      </div>`).join('')}
    </div>
    <div class="card" style="margin-bottom:10px">
      <div class="card-head"><span class="ch-icon">✈️</span><span class="ch-label">Planes</span></div>
      ${planes.map(p=>`
      <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-top:1px solid var(--border)">
        <span style="font-size:22px">${p.icon}</span>
        <div>
          <div style="font-size:14px;font-weight:600">${p.label}</div>
          <div style="font-size:12px;color:var(--t2)">${p.desc}</div>
        </div>
      </div>`).join('')}
    </div>`;
  }:'';

  const marcaView=isMarca?()=>{
    const m=S.metrics.filter(x=>x.area_id===a.id);
    const get=k=>m.find(x=>x.key===k);
    const posts=get('posts_semana');
    const replies=get('replies_stories');
    const saves=get('saves');
    const diasSin=get('dias_sin_publicar');
    const diasVal=diasSin?parseInt(diasSin.value):0;
    const capas=[
      {icon:'✈️',label:'ON duty — captura',desc:'Fotos, audios, notas. Sin publicar. Acumulas.'},
      {icon:'📱',label:'OFF duty — publica',desc:'Procesa lo capturado. Máx. 3 stories/semana.'},
      {icon:'📌',label:'Mensual — ancla',desc:'Una pieza de fondo. Conecta con tu posicionamiento.'},
    ];
    return `
    <div style="background:#EEEDFE;border-radius:var(--r-sm);padding:10px 12px;margin-bottom:10px;font-size:12px;color:#534AB7;display:flex;align-items:center;gap:8px">
      <i class="ti ti-info-circle" style="font-size:15px;flex-shrink:0"></i>
      <span>Fase 0 · Instagram Stories primero · TikTok cuando tengas audiencia base</span>
    </div>
    <div class="card" style="margin-bottom:10px">
      <div class="card-head"><span class="ch-icon">📊</span><span class="ch-label">Métricas que importan</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border)">
        <div style="background:var(--surface);padding:14px 12px;text-align:center">
          <div style="font-size:26px;font-weight:700;color:${posts&&parseInt(posts.value)>=3?'#993556':'#854F0B'}">${posts?posts.value:'0'}<span style="font-size:12px;color:var(--t2);font-weight:400"> / 3</span></div>
          <div style="font-size:10px;color:var(--t2);margin-top:2px">posts esta semana</div>
        </div>
        <div style="background:var(--surface);padding:14px 12px;text-align:center">
          <div style="font-size:26px;font-weight:700;color:${diasVal>5?'#A32D2D':diasVal>0?'#854F0B':'#0F6E56'}">${diasVal}</div>
          <div style="font-size:10px;color:var(--t2);margin-top:2px">días sin publicar</div>
        </div>
        <div style="background:var(--surface);padding:14px 12px;text-align:center">
          <div style="font-size:26px;font-weight:700">${replies?replies.value:'0'}</div>
          <div style="font-size:10px;color:var(--t2);margin-top:2px">respuestas stories</div>
        </div>
        <div style="background:var(--surface);padding:14px 12px;text-align:center">
          <div style="font-size:26px;font-weight:700">${saves?saves.value:'0'}</div>
          <div style="font-size:10px;color:var(--t2);margin-top:2px">saves este mes</div>
        </div>
      </div>
    </div>
    <div class="card" style="margin-bottom:10px">
      <div class="card-head"><span class="ch-icon">🎯</span><span class="ch-label">Sistema de contenido</span></div>
      ${capas.map(c=>`
      <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border-top:1px solid var(--border)">
        <span style="font-size:20px">${c.icon}</span>
        <div>
          <div style="font-size:13px;font-weight:600">${c.label}</div>
          <div style="font-size:12px;color:var(--t2);margin-top:2px">${c.desc}</div>
        </div>
      </div>`).join('')}
    </div>`;
  }:'';

  const gymView=isGym?()=>{
    const m=S.metrics.filter(x=>x.area_id===a.id);
    const get=k=>m.find(x=>x.key===k);
    const ses=get('sesiones_semana');
    const lastSession=get('last_session_date');
    const prensa=get('prensa_kg');
    const ext=get('extension_kg');
    const sesVal=ses?parseInt(ses.value):0;
    const diasSinGym=lastSession?Math.floor((Date.now()-new Date(lastSession.value))/(864e5)):null;
    const ejercicios=[
      {name:'Aductora',kg:'70',series:'3×10-15'},
      {name:'Prensa 45°',kg:'120',series:'3×8'},
      {name:'Smith squat',kg:'25-30/lado',series:'3×8'},
      {name:'Extensión cuádriceps',kg:'80→85',series:'3×7'},
      {name:'Curl inclinado 45°',kg:'7',series:'2×7'},
    ];
    const restricciones=['Sin back squat con barra','Sin peso muerto convencional','Sin RDL sin validación previa','Búlgaras solo con energía alta'];
    return `
    <div class="card" style="margin-bottom:10px">
      <div class="card-head"><span class="ch-icon">📊</span><span class="ch-label">Esta semana</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border)">
        <div style="background:var(--surface);padding:14px 12px;text-align:center">
          <div style="font-size:28px;font-weight:700;color:${sesVal>=2?'#3B6D11':'#854F0B'}">${sesVal}<span style="font-size:14px;color:var(--t2);font-weight:400"> / 2</span></div>
          <div style="font-size:10px;color:var(--t2);margin-top:2px">sesiones</div>
          <div style="display:flex;gap:4px;justify-content:center;margin-top:6px">
            ${[1,2].map(n=>`<div style="width:28px;height:6px;border-radius:3px;background:${sesVal>=n?'#3B6D11':'var(--border)'}"></div>`).join('')}
          </div>
        </div>
        <div style="background:var(--surface);padding:14px 12px;text-align:center">
          <div style="font-size:28px;font-weight:700;color:${diasSinGym===null?'var(--t3)':diasSinGym>7?'#A32D2D':diasSinGym>4?'#854F0B':'#3B6D11'}">${diasSinGym===null?'—':diasSinGym}</div>
          <div style="font-size:10px;color:var(--t2);margin-top:2px">días sin entrenar</div>
          ${lastSession?`<div style="font-size:9px;color:var(--t3);margin-top:2px">última: ${new Date(lastSession.value).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</div>`:''}
        </div>
      </div>
      <div style="padding:10px 14px;border-top:1px solid var(--border);display:flex;gap:8px">
        <button onclick="regSesion()" style="flex:1;padding:10px;border-radius:8px;background:#3B6D11;color:#fff;border:none;font-size:13px;font-weight:600;cursor:pointer">✓ Registrar sesión hoy</button>
      </div>
    </div>
    <div class="card" style="margin-bottom:10px">
      <div class="card-head"><span class="ch-icon">🏋️</span><span class="ch-label">Pesos de referencia</span></div>
      ${ejercicios.map(e=>`
      <div style="display:flex;align-items:center;padding:10px 14px;border-top:1px solid var(--border)">
        <span style="flex:1;font-size:13px">${e.name}</span>
        <span style="font-size:12px;color:var(--t2);margin-right:10px">${e.series}</span>
        <span style="font-size:13px;font-weight:700">${e.kg} kg</span>
      </div>`).join('')}
    </div>
    <div class="card" style="margin-bottom:10px">
      <div class="card-head"><span class="ch-icon">⚠️</span><span class="ch-label">Restricciones</span></div>
      ${restricciones.map(r=>`<div style="padding:9px 14px;border-top:1px solid var(--border);font-size:12px;color:#A32D2D;display:flex;gap:8px"><span>✗</span>${r}</div>`).join('')}
    </div>`;
  }:'';

  const saludView=isSalud?()=>{
    const m=S.metrics.filter(x=>x.area_id===a.id);
    const get=k=>m.find(x=>x.key===k);
    const dias=get('dias_sin_sintomas');
    const dolor=get('dolor_hoy');
    const itu=get('iti_año');
    const meds=['Hiprex 1g (noche)','D-manosa diaria','Probióticos','Vitamina C','Cranberry PAC 36','NAC 600mg (noche)','L-glutamina','GABA + L-teanina + B6','Creatina'];
    const conds=['Vejiga dolorosa (crónica)','HPV — seguimiento activo','Hernia lumbar + ciática','Escoliosis dorsolumbar','Posible endometriosis (sin confirmar)','Hiperreactividad respiratoria'];
    return `
    <div class="card" style="margin-bottom:10px">
      <div class="card-head"><span class="ch-icon">📊</span><span class="ch-label">Seguimiento</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:var(--border)">
        <div style="background:var(--surface);padding:14px 10px;text-align:center">
          <div style="font-size:26px;font-weight:700;color:#0F6E56">${dias?dias.value:'0'}</div>
          <div style="font-size:10px;color:var(--t2);margin-top:2px">días sin síntomas</div>
        </div>
        <div style="background:var(--surface);padding:14px 10px;text-align:center">
          <div style="font-size:26px;font-weight:700;color:${dolor&&parseInt(dolor.value)>3?'#A32D2D':dolor&&parseInt(dolor.value)>0?'#854F0B':'#0F6E56'}">${dolor?dolor.value:'0'}</div>
          <div style="font-size:10px;color:var(--t2);margin-top:2px">dolor hoy (0-10)</div>
        </div>
        <div style="background:var(--surface);padding:14px 10px;text-align:center">
          <div style="font-size:26px;font-weight:700">${itu?itu.value:'0'}</div>
          <div style="font-size:10px;color:var(--t2);margin-top:2px">ITU este año</div>
        </div>
      </div>
      <div style="padding:12px 14px;border-top:1px solid var(--border);display:flex;gap:8px">
        ${[0,1,2,3,4,5,6,7,8,9,10].map(n=>`<button onclick="updateDolor(${n})" style="flex:1;padding:6px 2px;border-radius:6px;border:1.5px solid ${dolor&&parseInt(dolor.value)===n?'var(--text)':'var(--border)'};background:${dolor&&parseInt(dolor.value)===n?'var(--text)':'var(--surface)'};color:${dolor&&parseInt(dolor.value)===n?'#fff':'var(--t2)'};font-size:11px;font-weight:600;cursor:pointer">${n}</button>`).join('')}
      </div>
    </div>
    <div class="card" style="margin-bottom:10px">
      <div class="card-head"><span class="ch-icon">💊</span><span class="ch-label">Protocolo diario</span></div>
      ${meds.map(m=>`<div style="padding:9px 14px;border-top:1px solid var(--border);font-size:13px;color:var(--text)">${m}</div>`).join('')}
    </div>
    <div class="card" style="margin-bottom:10px">
      <div class="card-head"><span class="ch-icon">🩺</span><span class="ch-label">Condiciones activas</span></div>
      ${conds.map(c=>`<div style="padding:9px 14px;border-top:1px solid var(--border);font-size:13px;color:var(--text);display:flex;align-items:center;gap:8px"><span style="width:6px;height:6px;border-radius:50%;background:#0F6E56;flex-shrink:0;display:inline-block"></span>${c}</div>`).join('')}
    </div>`;
  }:'';

  const finView=isFin?()=>{
    const met=S.metrics.filter(x=>x.area_id===a.id);
    const get=k=>met.find(x=>x.key===k);
    const deuda=get('deuda_visa');
    const ahorroTotal=S.metrics.find(x=>x.key==='ahorro_total');

    // Month navigation
    const [yr,mo]=S.finMonth.split('-').map(Number);
    const monthName=new Date(yr,mo-1,1).toLocaleDateString('es-ES',{month:'long',year:'numeric'});

    // Filter transactions for this month
    const txs=S.transactions.filter(t=>t.date&&t.date.startsWith(S.finMonth));
    const gastos=txs.filter(t=>t.type==='expense');
    const ingresos=txs.filter(t=>t.type==='income');
    const ahorros=txs.filter(t=>t.category==='Ahorro');
    const EXCLUIR=['Transferencias','Ahorro','Nómina'];
    const gastosReales=gastos.filter(t=>!EXCLUIR.includes(t.category));
    const totalGasto=gastosReales.reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const totalAhorro=ahorros.reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const totalNomina=ingresos.filter(t=>t.category==='Nómina').reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const margen=totalNomina-totalGasto;
    const tasaMes=totalNomina>0?Math.max(0,Math.round((margen/totalNomina)*100)):0;

    // YTD + monthly breakdown
    const CY=new Date().getFullYear();
    const CM=new Date().getMonth()+1;
    const SAVE_KEYS=Array.from({length:CM},(_,i)=>CY+'-'+String(i+1).padStart(2,'0'));
    const SAVE_LABS=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'].slice(0,CM);
    const txsYTD=S.transactions.filter(t=>t.date&&t.date.startsWith(String(CY)));
    const ytdIngreso=txsYTD.filter(t=>t.category==='Nómina').reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const ytdGasto=txsYTD.filter(t=>t.type==='expense'&&!EXCLUIR.includes(t.category)).reduce((s,t)=>s+parseFloat(t.amount||0),0);
    // Solo cuenta como patrimonio las transferencias reales a ahorro (excluye redondeos Sabadell)
    const isPatrimonio=t=>t.category==='Ahorro'&&!(t.description||'').toUpperCase().includes('PARA AHORRO');
    const ytdAhorro=txsYTD.filter(isPatrimonio).reduce((s,t)=>s+parseFloat(t.amount||0),0);
    const ytdTasa=ytdIngreso>0?Math.max(0,Math.round(((ytdIngreso-ytdGasto)/ytdIngreso)*100)):0;
    const monthlyData=SAVE_KEYS.map((mk,i)=>{
      const mtxs=S.transactions.filter(t=>t.date&&t.date.startsWith(mk));
      const ing=mtxs.filter(t=>t.category==='Nómina').reduce((s,t)=>s+parseFloat(t.amount||0),0);
      const gas=mtxs.filter(t=>t.type==='expense'&&!EXCLUIR.includes(t.category)).reduce((s,t)=>s+parseFloat(t.amount||0),0);
      const aho=mtxs.filter(isPatrimonio).reduce((s,t)=>s+parseFloat(t.amount||0),0);
      return {mk,lab:SAVE_LABS[i],ing,gas,aho,mar:ing-gas,tasa:ing>0?Math.max(0,Math.round(((ing-gas)/ing)*100)):0};
    });
    const fn=v=>S.finHide?'<span style="filter:blur(6px);user-select:none;display:inline-block">'+v+'</span>':String(v);

    // === HEATMAP DATA ===
    const HEAT_CATS=['Renta','Rotación','Ropa','Comida','Viajes','Ocio','Belleza','Salud','Suscripciones','Amigas'];
    const heatD={};
    SAVE_KEYS.forEach(mk=>{heatD[mk]={};S.transactions.filter(t=>t.date&&t.date.startsWith(mk)&&t.type==='expense'&&!EXCLUIR.includes(t.category)).forEach(t=>{const c=t.category||'Otros';heatD[mk][c]=(heatD[mk][c]||0)+parseFloat(t.amount||0);});});
    const activeHeatCats=HEAT_CATS.filter(c=>SAVE_KEYS.some(mk=>(heatD[mk][c]||0)>0));
    const catRowMax={};activeHeatCats.forEach(c=>{catRowMax[c]=Math.max(...SAVE_KEYS.map(mk=>heatD[mk][c]||0));});
    const hexRgb=hex=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return r+','+g+','+b;};

    // === PROJECTION ===
    const mthsWI=monthlyData.filter(m=>m.ing>0).length;
    const remMths=Math.max(0,12-mthsWI);
    const avgMonIncome=mthsWI>0?ytdIngreso/mthsWI:0;
    const avgMonBalance=mthsWI>0?(ytdIngreso-ytdGasto)/mthsWI:0;
    const projCurrent=Math.round(ytdAhorro+Math.max(0,avgMonBalance)*remMths);
    const projTarget20=Math.round(ytdAhorro+avgMonIncome*0.20*remMths);
    const autoTrf=Math.round(avgMonIncome*0.20);

    // === FLOW DATA ===
    const totalDep=ytdGasto+ytdAhorro;
    const ytdCatTots={};
    S.transactions.filter(t=>t.date&&t.date.startsWith(String(CY))&&t.type==='expense'&&!EXCLUIR.includes(t.category)).forEach(t=>{const c=t.category||'Otros';ytdCatTots[c]=(ytdCatTots[c]||0)+parseFloat(t.amount||0);});
    const flowItems=Object.entries(ytdCatTots).sort((a,b)=>b[1]-a[1]).slice(0,7).map(([c,v])=>({c,v,pct:totalDep>0?Math.round((v/totalDep)*100):0}));
    const flowAhoItem={c:'Ahorro',v:ytdAhorro,pct:totalDep>0?Math.round((ytdAhorro/totalDep)*100):0};
    const flowRestPct=Math.max(0,100-flowItems.reduce((s,x)=>s+x.pct,0)-flowAhoItem.pct);

    // Categories (excluye Transferencias y Ahorro del gráfico)
    const cats={};
    gastosReales.forEach(t=>{
      const c=t.category||'Otros';
      cats[c]=(cats[c]||0)+parseFloat(t.amount||0);
    });
    const catList=Object.entries(cats).sort((a,b)=>b[1]-a[1]);
    const catColors={'Comida':'#E8734A','Transporte':'#185FA5','Ocio':'#7C3AED','Ropa':'#DB2777','Salud':'#0F6E56','Suscripciones':'#854F0B','Transferencias':'#6B7280','Otros':'#9CA3AF','Hogar':'#0369A1','Renta':'#DC2626','Jaime':'#BE185D','Familia':'#B45309','Belleza':'#9333EA','Amigas':'#0891B2','Viajes':'#059669','Ahorro':'#16A34A','Nómina':'#16A34A','Farmacia':'#0891B2','Seguro':'#6B7280','Suplementos':'#7C3AED','Donaciones':'#B45309','Multas':'#DC2626','Perú':'#E8734A','Rotación':'#9CA3AF','Deuda':'#A32D2D'};
    const categories=['Comida','Renta','Hogar','Transporte','Ocio','Ropa','Salud','Farmacia','Suplementos','Suscripciones','Seguro','Belleza','Amigas','Jaime','Familia','Viajes','Perú','Donaciones','Multas','Ahorro','Deuda','Transferencias','Rotación','Nómina','Otros'];

    // === BUILD HTML BLOCKS ===
    const budgetCardHtml=(()=>{
      if(!catList.length) return '';
      let h='<div class="card" style="margin-bottom:10px"><div class="card-head"><span class="ch-icon">🎯</span><span class="ch-label">Presupuesto mensual</span><span class="ch-count" style="font-style:italic;font-size:10px">✏️ edita límites</span></div>';
      for(const [cat,total] of catList){
        const bud=S.budgets[cat]||0;
        const budPct=bud>0?Math.min(Math.round((total/bud)*100),999):null;
        const pctOfGasto=Math.round((total/totalGasto)*100)||0;
        const col=catColors[cat]||'#9CA3AF';
        const barCol=budPct===null?col:budPct>=100?'#DC2626':budPct>=80?'#D97706':'#16A34A';
        const barW=bud>0?Math.min(budPct,100):pctOfGasto;
        h+='<div style="padding:10px 14px;border-top:1px solid var(--border)">';
        h+='<div style="display:flex;align-items:center;gap:5px;margin-bottom:5px">';
        h+='<span style="flex:1;font-size:13px;font-weight:500;cursor:pointer" onclick="S.finCat=\''+cat+'\';render()">'+cat+'</span>';
        h+='<span style="font-size:13px;font-weight:700;color:'+(budPct!==null&&budPct>=100?'#DC2626':'var(--text)')+'">'+total.toFixed(0)+'€</span>';
        if(bud>0){h+='<span style="font-size:11px;color:var(--t3)">/ '+bud+'€</span><span style="font-size:11px;font-weight:700;color:'+barCol+'"> '+budPct+'%</span>';}
        else{h+='<span style="font-size:11px;color:var(--t2)">'+pctOfGasto+'%</span>';}
        h+='<button onclick="openBudgetEdit(\''+cat+'\','+bud+')" style="border:none;background:none;cursor:pointer;padding:2px 4px;color:var(--t3);font-size:13px;flex-shrink:0;line-height:1">✏️</button>';
        h+='</div>';
        h+='<div style="background:var(--bg);border-radius:999px;height:6px;overflow:hidden"><div style="background:'+barCol+';height:100%;width:'+barW+'%;border-radius:999px;transition:width 0.35s"></div></div>';
        if(bud>0) h+='<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--t3);margin-top:2px"><span>0€</span><span>límite '+bud+'€</span></div>';
        h+='</div>';
      }
      h+='</div>';
      return h;
    })();

    const heatmapCardHtml=(()=>{
      if(!activeHeatCats.length) return '';
      let h='<div class="card" style="margin-bottom:10px"><div class="card-head"><span class="ch-icon">🗓</span><span class="ch-label">Mapa de gastos</span><span class="ch-count">${CY}</span></div><div style="padding:10px 14px;overflow-x:auto"><table style="border-collapse:separate;border-spacing:3px;font-size:10px;width:100%">';
      h+='<tr><td style="padding-right:6px;min-width:72px"></td>'+SAVE_LABS.map(l=>'<td style="text-align:center;font-weight:700;color:var(--t2);padding:2px 4px;min-width:36px">'+l+'</td>').join('')+'</tr>';
      for(const cat of activeHeatCats){
        const rgb=hexRgb(catColors[cat]||'#9CA3AF');
        h+='<tr><td style="font-weight:500;color:var(--text);padding:3px 6px 3px 0;white-space:nowrap">'+cat+'</td>';
        for(const mk of SAVE_KEYS){
          const val=Math.round(heatD[mk][cat]||0);
          const op=catRowMax[cat]>0?(0.15+(val/catRowMax[cat])*0.75):0;
          const bg=val>0?'rgba('+rgb+','+op.toFixed(2)+')':'transparent';
          const tc=val>0?(op>0.55?'#fff':'var(--text)'):'var(--t3)';
          h+='<td style="text-align:center;background:'+bg+';border-radius:4px;padding:3px 2px;color:'+tc+';font-weight:'+(val>0?600:400)+'">'+( val>0?val:'—')+'</td>';
        }
        h+='</tr>';
      }
      h+='</table></div></div>';
      return h;
    })();

    const projectionCardHtml=(()=>{
      if(mthsWI===0) return '';
      const fmt=n=>Math.round(n).toLocaleString('es');
      const gap=projTarget20-projCurrent;
      return '<div class="card" style="margin-bottom:10px"><div class="card-head"><span class="ch-icon">📈</span><span class="ch-label">Proyección 2026</span><span class="ch-count">'+mthsWI+' meses</span></div><div style="padding:10px 14px"><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px"><div style="background:var(--bg);border-radius:var(--r-sm);padding:10px;text-align:center"><div style="font-size:10px;color:var(--t2);margin-bottom:3px">A este ritmo</div><div style="font-size:20px;font-weight:800;color:#085041">'+fmt(projCurrent)+'€</div><div style="font-size:10px;color:var(--t3)">fin de año</div></div><div style="background:var(--ok-bg);border-radius:var(--r-sm);padding:10px;text-align:center"><div style="font-size:10px;color:var(--ok);margin-bottom:3px">Con 20%/mes</div><div style="font-size:20px;font-weight:800;color:#085041">'+fmt(projTarget20)+'€</div><div style="font-size:10px;color:var(--t3)">'+(gap>0?'+'+fmt(gap)+'€ más':'')+'</div></div></div><div style="background:var(--warn-bg);border-radius:var(--r-sm);padding:10px;font-size:12px;color:var(--warn)">💡 Transferir <strong>'+fmt(autoTrf)+'€</strong> a Esther justo al cobrar cada mes te daría <strong>'+fmt(projTarget20)+'€</strong> ahorrados en diciembre.</div></div></div>';
    })();

    const flowCardHtml=(()=>{
      if(!totalDep) return '';
      const allSegs=[...flowItems,flowAhoItem].filter(x=>x.pct>1);
      let bar='<div style="display:flex;height:20px;border-radius:6px;overflow:hidden;margin-bottom:10px">';
      for(const x of allSegs){const col=x.c==='Ahorro'?'#16A34A':(catColors[x.c]||'#9CA3AF');bar+='<div style="flex:'+x.pct+';background:'+col+';min-width:0"></div>';}
      if(flowRestPct>2) bar+='<div style="flex:'+flowRestPct+';background:#e5e7eb;min-width:0"></div>';
      bar+='</div>';
      let leg='<div style="display:flex;flex-wrap:wrap;gap:6px 10px">';
      for(const x of [...flowItems,flowAhoItem].filter(x=>x.pct>0)){const col=x.c==='Ahorro'?'#16A34A':(catColors[x.c]||'#9CA3AF');leg+='<div style="display:flex;align-items:center;gap:4px"><span style="width:8px;height:8px;border-radius:2px;background:'+col+';flex-shrink:0;display:inline-block"></span><span style="font-size:11px;color:var(--t2)">'+x.c+'</span><span style="font-size:11px;font-weight:700">'+x.pct+'%</span></div>';}
      leg+='</div>';
      return '<div class="card" style="margin-bottom:10px"><div class="card-head"><span class="ch-icon">💸</span><span class="ch-label">¿A dónde fue el dinero?</span><span class="ch-count">YTD</span></div><div style="padding:10px 14px">'+bar+leg+'</div></div>';
    })();

    if(S.finCat){
      const catTxs=txs.filter(t=>t.category===S.finCat);
      const catTotal=catTxs.reduce((s,t)=>s+parseFloat(t.amount||0),0);
      return `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px">
        <button onclick="S.finCat=null;render()" style="background:none;border:none;font-size:24px;cursor:pointer;color:var(--text);padding:0;line-height:1">‹</button>
        <div>
          <div style="font-size:15px;font-weight:700">${S.finCat}</div>
          <div style="font-size:12px;color:var(--t2)">${monthName} · ${catTxs.length} transacciones · ${catTotal.toFixed(2)}€</div>
        </div>
      </div>
      <div class="card">
        ${catTxs.length===0?`<div class="empty">Sin transacciones en esta categoría</div>`:''}
        ${catTxs.map(t=>`
        <div style="padding:10px 14px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px">
          <div style="flex:1;min-width:0">
            <div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.description}</div>
            <div style="font-size:11px;color:var(--t2)">${t.date}</div>
          </div>
          <select onchange="updateTxCat('${t.id}',this.value)" style="font-size:11px;padding:3px 6px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--text);max-width:90px">
            ${categories.map(c=>`<option value="${c}"${t.category===c?' selected':''}>${c}</option>`).join('')}
          </select>
          <span style="font-size:13px;font-weight:700;color:${t.type==='income'||t.category==='Ahorro'?'#0F6E56':'#A32D2D'};white-space:nowrap">${parseFloat(t.amount).toFixed(2)}€</span>
          <button onclick="openEditTx('${t.id}')" style="border:none;background:none;cursor:pointer;padding:2px 4px;color:var(--t3);font-size:15px;line-height:1;flex-shrink:0"><i class="ti ti-pencil"></i></button>
        </div>`).join('')}
      </div>`;
    }

    return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
      <button onclick="finPrev()" style="border:none;background:var(--surface);padding:8px 12px;border-radius:8px;cursor:pointer;font-size:16px">‹</button>
      <span style="font-size:14px;font-weight:600;text-transform:capitalize">${monthName}</span>
      <div style="display:flex;align-items:center;gap:4px">
        <button onclick="S.finHide=!S.finHide;render()" style="border:none;background:var(--surface);padding:8px 10px;border-radius:8px;cursor:pointer;font-size:16px;color:${S.finHide?'var(--text)':'var(--t3)'}"><i class="ti ti-${S.finHide?'eye-off':'eye'}"></i></button>
        <button onclick="finNext()" style="border:none;background:var(--surface);padding:8px 12px;border-radius:8px;cursor:pointer;font-size:16px">›</button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px">
      <div onclick="openIngresoModal('${S.finMonth}')" style="background:var(--surface);border-radius:var(--r-sm);padding:12px;text-align:center;cursor:pointer;position:relative">
        <div style="font-size:11px;color:var(--t2);margin-bottom:4px">Ingreso</div>
        <div style="font-size:18px;font-weight:700;color:#0F6E56">${totalNomina>0?fn(totalNomina.toFixed(0)+'€'):'—'}</div>
        <div style="font-size:9px;color:var(--t3);margin-top:2px">toca para editar</div>
      </div>
      <div style="background:var(--surface);border-radius:var(--r-sm);padding:12px;text-align:center">
        <div style="font-size:11px;color:var(--t2);margin-bottom:4px">Gasto</div>
        <div style="font-size:18px;font-weight:700;color:#A32D2D">${fn(totalGasto.toFixed(0)+'€')}</div>
      </div>
      <div style="background:var(--surface);border-radius:var(--r-sm);padding:12px;text-align:center">
        <div style="font-size:11px;color:var(--t2);margin-bottom:4px">Balance</div>
        <div style="font-size:18px;font-weight:700;color:${margen>=0?'#0F6E56':'#A32D2D'}">${fn((margen>=0?'+':'')+margen.toFixed(0)+'€')}</div>
      </div>
      <div style="background:var(--surface);border-radius:var(--r-sm);padding:12px;text-align:center">
        <div style="font-size:11px;color:var(--t2);margin-bottom:4px">Patrimonio</div>
        <div style="font-size:18px;font-weight:700;color:#085041">${fn(ytdAhorro.toFixed(0)+'€')}</div>
        <div style="font-size:10px;color:var(--t3);margin-top:2px">total ${new Date().getFullYear()}</div>
      </div>
    </div>
    <div style="text-align:center;margin-bottom:8px">
      <span style="font-size:12px;color:var(--t2)">Balance ${monthName.split(' ')[0]}: </span>
      <span style="font-size:13px;font-weight:700;color:${margen>=0?'#16A34A':'#A32D2D'}">${fn((margen>=0?'+':'')+margen.toFixed(0)+'€')}</span>
      ${totalNomina>0?`<span style="font-size:11px;color:var(--t2)"> · tasa ahorro: </span><span style="font-size:12px;font-weight:700;color:${tasaMes>=20?'#16A34A':tasaMes>=10?'#854F0B':'var(--t2)'}">${fn(tasaMes+'%')}</span>`:''}
    </div>
    <div class="card" style="margin-bottom:8px">
      <div class="card-head"><span class="ch-icon">💰</span><span class="ch-label">${CY} — Balance mensual</span><span class="ch-count">${ytdTasa}% tasa</span></div>
      <div style="padding:10px 14px 4px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
          <span style="font-size:11px;color:var(--t2)">Tasa ahorro YTD (balance / ingreso)</span>
          <span style="font-size:12px;font-weight:700;color:#085041">${ytdTasa}% · ${(ytdIngreso/1000).toFixed(1)}k€</span>
        </div>
        <div style="background:var(--bg);border-radius:999px;height:8px;overflow:hidden;margin-bottom:8px">
          <div style="background:#16A34A;height:100%;width:${Math.min(ytdTasa,100)}%;border-radius:999px"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--t2);padding-top:8px;border-top:1px solid var(--border)">
          <span>Patrimonio acumulado ${CY}</span>
          <span style="font-weight:700;color:#085041">${ytdAhorro.toFixed(0)}€</span>
        </div>
      </div>
      ${monthlyData.filter(m=>m.ing>0||m.gas>0).map(m=>{
        const barW=m.ing>0?Math.min(Math.max(0,Math.round((m.mar/m.ing)*100)),100):0;
        const isActive=m.mk===S.finMonth;
        const col=m.tasa>=20?'#16A34A':m.tasa>=10?'#65A96E':'#D97706';
        const marCol=m.mar>=0?'#085041':'#A32D2D';
        return `<div style="padding:8px 14px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px;cursor:pointer;${isActive?'background:rgba(21,128,61,0.06)':''}" onclick="S.finCat=null;S.finMonth='${m.mk}';render()">
          <span style="font-size:12px;font-weight:${isActive?700:500};width:28px;color:${isActive?'var(--text)':'var(--t2)'}">${m.lab}</span>
          <div style="flex:1;background:var(--bg);border-radius:999px;height:5px;overflow:hidden">
            <div style="background:${col};height:100%;width:${barW}%;border-radius:999px"></div>
          </div>
          <span style="font-size:12px;font-weight:600;color:${marCol};width:56px;text-align:right">${m.ing>0?fn((m.mar>=0?'+':'')+m.mar.toFixed(0)+'€'):'—'}</span>
          <span style="font-size:11px;color:var(--t2);width:28px;text-align:right">${m.ing>0?fn(m.tasa+'%'):'—'}</span>
        </div>`;
      }).join('')}
    </div>
    ${deuda?`<div style="background:var(--surface);border-radius:var(--r-sm);padding:10px 16px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between">
      <span style="font-size:12px;color:var(--t2)">Deuda Visa Sabadell</span>
      <span style="font-size:15px;font-weight:700;color:${parseFloat(deuda.value)>0?'#A32D2D':'#6B7280'}">${parseFloat(deuda.value).toFixed(0)}€</span>
    </div>`:''}

    ${budgetCardHtml}
    ${heatmapCardHtml}
    ${flowCardHtml}
    ${projectionCardHtml}

    <div class="card" style="margin-bottom:10px">
      <div class="card-head"><span class="ch-icon">📋</span><span class="ch-label">Transacciones (${txs.length})</span><button onclick="openAddTx('${S.finMonth}')" style="border:none;background:var(--accent);color:white;border-radius:999px;padding:5px 12px;font-size:12px;font-weight:600;cursor:pointer;margin-left:auto">+ Añadir</button></div>
      ${txs.length===0?`<div class="empty">Sin transacciones este mes</div>`:''}
      ${txs.map(t=>`
      <div style="padding:10px 14px;border-top:1px solid var(--border);display:flex;align-items:center;gap:10px">
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${t.description}</div>
          <div style="font-size:11px;color:var(--t2)">${t.date}</div>
        </div>
        <select onchange="updateTxCat('${t.id}',this.value)" style="font-size:11px;padding:3px 6px;border:1px solid var(--border);border-radius:6px;background:var(--surface);color:var(--text);max-width:90px">
          ${categories.map(c=>`<option value="${c}"${t.category===c?' selected':''}>${c}</option>`).join('')}
        </select>
        <span style="font-size:13px;font-weight:700;color:${t.type==='income'||t.category==='Ahorro'?'#0F6E56':'#A32D2D'};white-space:nowrap">${parseFloat(t.amount).toFixed(2)}€</span>
        <button onclick="openEditTx('${t.id}')" style="border:none;background:none;cursor:pointer;padding:2px 4px;color:var(--t3);font-size:15px;line-height:1;flex-shrink:0"><i class="ti ti-pencil"></i></button>
      </div>`).join('')}
    </div>`;
  }:'';

  return `
  <div class="ph">
    <button class="back" onclick="go('areas')"><i class="ti ti-arrow-left"></i></button>
    <span class="dot" style="background:${a.color};width:12px;height:12px"></span>
    <h2>${a.name}</h2>
  </div>
  ${isVJ||isJETMI?'':domainIntroHtml}
  ${isVJ?vjView():''}
  ${isJETMI?jetmiView():''}
  ${isFin?finView():''}
  ${isSalud?saludView():''}
  ${isGym?gymView():''}
  ${isMarca?marcaView():''}
  ${isVida?vidaView():''}
  ${areaProjects.length?`<div class="card" style="margin-bottom:10px">
    <div class="card-head"><span class="ch-icon">📁</span><span class="ch-label">Proyectos</span><span class="ch-count">${areaProjects.length}</span>
      <button onclick="openProjectAdd()" style="border:none;background:var(--text);color:#fff;border-radius:999px;padding:4px 11px;font-size:11px;font-weight:600;cursor:pointer;margin-left:6px">+ Nuevo</button>
    </div>
    ${areaProjects.map(p=>{
      const stale=p.last_activity_at&&(Date.now()-new Date(p.last_activity_at))>7*864e5;
      const badge=p.ia_last_session?`<span class="pill" style="background:#EEEDFE;color:#534AB7;font-size:10px">IA</span>`:'';
      const staleBadge=stale?`<span class="pill p-warn" style="font-size:10px">+7d</span>`:'';
      return `<div onclick="goProject('${p.id}')" style="padding:12px 14px;border-top:1px solid var(--border);cursor:pointer;display:flex;align-items:flex-start;gap:10px">
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:600;margin-bottom:2px">${p.title}</div>
          ${p.next_action?`<div style="font-size:12px;color:var(--t2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">→ ${p.next_action}</div>`:
            `<div style="font-size:12px;color:#A32D2D">Sin próxima acción</div>`}
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0;align-items:center">${badge}${staleBadge}</div>
      </div>`;
    }).join('')}
  </div>`:''}
  ${isVJ?'':`${section('✓','Tareas',ts.map(t=>taskEl(t)).join('')||empty('Sin tareas'))}
  ${ws.length?section('⏳','Esperando',ws.map(wfEl).join('')):''}
  ${ds.length?section('❓','Decisiones',ds.map(decEl).join('')):''}`}`;
}

function globalView() {
  return `
  <p class="section-title">Todas las tareas</p>
  ${section('','',S.tasks.map(t=>taskEl(t)).join('')||empty('Sin tareas'))}
  <p class="section-title">Waiting For</p>
  ${section('','',S.wf.map(wfEl).join('')||empty('Sin elementos'))}
  <p class="section-title">Decisiones</p>
  ${section('','',S.dec.map(decEl).join('')||empty('Sin decisiones'))}`;
}

function section(icon,label,content) {
  const countMatch=content.match(/class="item"/g)||[];
  const wfMatch=content.match(/class="wf-item"/g)||[];
  const count=countMatch.length+wfMatch.length;
  return `<div class="card">
    ${label?`<div class="card-head"><span class="ch-icon">${icon}</span><span class="ch-label">${label}</span>${count?`<span class="ch-count">${count}</span>`:''}</div>`:''}
    ${content}
  </div>`;
}

function taskEl(t,avoid=false) {
  const a=t.areas;
  const col=a?a.color:'#aaa';
  const aname=a?a.name:'';
  const isCrit=t.priority==='critical';
  const tag=t.due_date?fmtDate(t.due_date):(aname||'');
  const tagCls=isCrit?'p-urg':(t.horizon==='today'?'p-warn':'p-gray');
  const tagStyle=aname&&!isCrit?`background:${col}18;color:${col}`:'';
  return `<div class="item${avoid?' avoiding':''}">
    <div class="chk" onclick="done('${t.id}')"><i class="ti ti-check" style="font-size:12px;color:transparent"></i></div>
    <span class="item-txt">${t.title}</span>
    ${tag?`<span class="pill ${tagCls}" style="${tagStyle}">${tag}</span>`:''}
  </div>`;
}

function decEl(d) {
  const a=d.areas; const col=a?a.color:'#888'; const aname=a?a.name:'';
  return `<div class="item">
    <i class="ti ti-help-circle" style="font-size:17px;color:#534AB7;flex-shrink:0"></i>
    <span class="item-txt">${d.title}</span>
    ${aname?`<span class="pill" style="background:${col}18;color:${col}">${aname}</span>`:''}
  </div>`;
}

function wfEl(w) {
  return `<div class="wf-item">
    <div class="wf-t">${w.title}</div>
    <div class="wf-s"><i class="ti ti-clock" style="font-size:11px"></i> ${w.waiting_on}${w.follow_up_date?' · seguimiento '+fmtDate(w.follow_up_date):''}</div>
  </div>`;
}

function empty(msg) { return `<div class="empty">${msg}</div>`; }

function fmtDate(s) {
  if(!s) return '';
  const d=new Date(s), t=new Date(), diff=Math.ceil((d-t)/864e5);
  if(diff<0) return 'vencida';
  if(diff===0) return 'hoy';
  if(diff===1) return 'mañana';
  if(diff<=7) return diff+'d';
  return d.toLocaleDateString('es-ES',{day:'numeric',month:'short'});
}

function setVjTab(field,value){S[field]=value;render();}

function toggleHotoCheck(itemId){
  const c=JSON.parse(localStorage.getItem('vj_hoto_checks')||'{}');
  c[itemId]=!c[itemId];
  localStorage.setItem('vj_hoto_checks',JSON.stringify(c));
  render();
}

function resetHotoChecks(){localStorage.removeItem('vj_hoto_checks');render();}

function updateLaundryItem(itemId,delta){
  const today=new Date().toISOString().slice(0,10);
  localStorage.setItem('vj_laundry_date',today);
  const items=JSON.parse(localStorage.getItem('vj_laundry_items')||'{}');
  items[itemId]=Math.max(0,(items[itemId]||0)+delta);
  localStorage.setItem('vj_laundry_items',JSON.stringify(items));
  render();
}

function resetLaundry(){localStorage.removeItem('vj_laundry_items');localStorage.removeItem('vj_laundry_date');render();}

function vjHotoView(){
  const head=`<div class="ph"><button class="back" onclick="hotoBack()"><i class="ti ti-arrow-left"></i></button><h2>HOTO</h2></div>`;

  // ── Carga asíncrona del HOTO activo ──────────────────────────────────────
  if(!S._hotoLoaded){
    S._hotoLoaded=true;
    (async()=>{
      try{
        S.hotoRec=await hotoSvc.loadActiveHoto();
        S.hotoItems=S.hotoRec?await hotoSvc.loadItems(S.hotoRec.id):[];
      }catch(e){ console.error('hoto load',e); S.hotoErr=e.message; }
      // Inventario: SOLO LECTURA, como referencia para Aircraft Shopping.
      // Si falla o no hay sesión abierta, la sección funciona igual en modo manual.
      try{
        const invSess=await invSvc.loadActiveSession();
        S.hotoInvItems=invSess?await invSvc.loadSessionItems(invSess.id):[];
      }catch(e){ S.hotoInvItems=[]; }
      render();
    })();
    return `${head}<div style="display:flex;align-items:center;justify-content:center;height:200px;color:var(--t3);font-size:13px">Cargando HOTO…</div>`;
  }

  if(S.hotoErr){
    return `${head}<div style="background:var(--surface);border-radius:12px;padding:20px;border:0.5px solid var(--border);font-size:13px;color:var(--t2);line-height:1.6">No se pudo cargar el HOTO.<br><span style="color:var(--t3);font-size:12px">${S.hotoErr}</span><br><br>Si las tablas del HOTO aún no existen, ejecuta la migración <code>hoto_migration.sql</code> en Supabase.</div>`;
  }

  const tab=S.vjHotoTab==='checklist'?'checklist':'entrega';
  const tabs=[['entrega','Entrega'],['checklist','Checklist']];
  const tabBar=`<div style="display:flex;gap:2px;margin-bottom:14px;background:var(--surface);border-radius:10px;padding:3px;border:0.5px solid var(--border)">${tabs.map(([k,l])=>`<button onclick="setVjTab('vjHotoTab','${k}')" style="flex:1;padding:8px 2px;border:none;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;background:${tab===k?'var(--text)':'transparent'};color:${tab===k?'#fff':'var(--t2)'}">${l}</button>`).join('')}</div>`;

  if(tab==='checklist') return head+tabBar+hotoChecklistTab();
  return head+tabBar+hotoEntregaTab();
}

// ── Pestaña Entrega: editor vivo + exportación al PDF oficial ────────────────
function hotoEntregaTab(){
  const rec=S.hotoRec;
  const lbl=(t)=>`<div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin:14px 0 6px">${t}</div>`;
  const fieldStyle=`width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--border);border-radius:8px;font-size:14px;background:var(--bg);color:var(--text)`;

  // Sin HOTO activo → crear uno nuevo
  if(!rec){
    return `
    <div style="background:var(--surface);border-radius:12px;padding:20px;border:0.5px solid var(--border)">
      <div style="font-size:14px;font-weight:600;color:var(--text);margin-bottom:6px">Nuevo HOTO</div>
      <div style="font-size:12px;color:var(--t2);line-height:1.5;margin-bottom:14px">No hay ningún HOTO activo. Empieza uno para esta rotación. Se irá construyendo solo mientras trabajas; el día de la entrega solo exportas el PDF oficial.</div>
      <label style="font-size:11px;font-weight:600;color:var(--t2)">Matrícula</label>
      <input id="hoto-new-tail" placeholder="9H-JHK" style="${fieldStyle};margin:4px 0 10px;text-transform:uppercase">
      <label style="font-size:11px;font-weight:600;color:var(--t2)">ICAO destino</label>
      <input id="hoto-new-icao" placeholder="LPFR" style="${fieldStyle};margin:4px 0 10px;text-transform:uppercase">
      <label style="font-size:11px;font-weight:600;color:var(--t2)">Pattern</label>
      <select id="hoto-new-pattern" style="${fieldStyle};margin:4px 0 10px">
        <option value="">—</option><option>Summer - P2</option><option>Winter - P1</option>
      </select>
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--t2);margin:4px 0 16px"><input type="checkbox" id="hoto-new-noprior" checked> No recibí HOTO previo (reconstruido durante esta rotación)</label>
      <button onclick="hotoCreate()" style="width:100%;padding:13px;border:none;background:var(--text);color:#fff;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer">Crear HOTO</button>
    </div>`;
  }

  const v=(x)=>x==null?'':String(x).replace(/"/g,'&quot;');
  const opt=(val,cur)=>`<option${val===cur?' selected':''}>${val}</option>`;

  // Sección de líneas (defects / comments / offload) con añadir y borrar
  const section=(title,sec,placeholder,max)=>{
    const list=(S.hotoItems||[]).filter(i=>i.section===sec).sort((a,b)=>a.position-b.position);
    const rows=list.map(i=>`<div style="display:flex;align-items:flex-start;gap:8px;padding:10px 0;border-bottom:0.5px solid var(--border)">
      <span style="flex:1;font-size:13px;color:var(--text);line-height:1.4">${v(i.content)}</span>
      <button onclick="hotoDelItem('${i.id}')" style="border:none;background:none;color:var(--t3);cursor:pointer;font-size:15px;line-height:1"><i class="ti ti-x"></i></button>
    </div>`).join('');
    const full=max&&list.length>=max;
    return `${lbl(title+' · '+list.length+(max?'/'+max:''))}
    <div style="background:var(--surface);border-radius:12px;padding:4px 14px;border:0.5px solid var(--border)">
      ${rows||'<div style="padding:10px 0;font-size:12px;color:var(--t3)">Sin registros todavía.</div>'}
      ${full?'':`<div style="display:flex;gap:8px;padding:10px 0">
        <input id="hoto-add-${sec}" placeholder="${placeholder}" style="flex:1;box-sizing:border-box;padding:9px 11px;border:1px solid var(--border);border-radius:8px;font-size:13px;background:var(--bg);color:var(--text)" onkeydown="if(event.key==='Enter')hotoAddItem('${sec}')">
        <button onclick="hotoAddItem('${sec}')" style="border:none;background:var(--text);color:#fff;border-radius:8px;padding:0 14px;font-size:13px;font-weight:600;cursor:pointer">+</button>
      </div>`}
    </div>`;
  };

  const prior=rec.has_prior_hoto;
  const bannerNoPrior=!prior?`<div style="background:#FBF3E4;border:0.5px solid #E8D9B5;border-radius:10px;padding:12px 14px;margin-bottom:14px;font-size:12px;color:#7A5B12;line-height:1.5">No existe HOTO previo. Las fechas históricas no pueden verificarse. Este HOTO se ha reconstruido durante esta rotación.</div>`:'';

  return `
  ${bannerNoPrior}
  <div style="background:var(--surface);border-radius:12px;padding:16px;border:0.5px solid var(--border)">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
      <div><label style="font-size:10px;font-weight:600;color:var(--t3)">MATRÍCULA</label>
        <input value="${v(rec.tail_number)}" onchange="hotoField('tail_number',this.value)" style="${fieldStyle};margin-top:4px;text-transform:uppercase"></div>
      <div><label style="font-size:10px;font-weight:600;color:var(--t3)">ICAO</label>
        <input value="${v(rec.icao)}" onchange="hotoField('icao',this.value)" style="${fieldStyle};margin-top:4px;text-transform:uppercase"></div>
      <div><label style="font-size:10px;font-weight:600;color:var(--t3)">ESTADO</label>
        <select onchange="hotoField('aircraft_status',this.value)" style="${fieldStyle};margin-top:4px">${['Good','Bad','Requires Attention'].map(o=>opt(o,rec.aircraft_status)).join('')}</select></div>
      <div><label style="font-size:10px;font-weight:600;color:var(--t3)">PATTERN</label>
        <select onchange="hotoField('pattern',this.value)" style="${fieldStyle};margin-top:4px"><option value="">—</option>${['Summer - P2','Winter - P1'].map(o=>opt(o,rec.pattern)).join('')}</select></div>
      <div><label style="font-size:10px;font-weight:600;color:var(--t3)">CH CODE</label>
        <input value="${v(rec.ch_code)}" onchange="hotoField('ch_code',this.value)" style="${fieldStyle};margin-top:4px;text-transform:uppercase"></div>
      <div><label style="font-size:10px;font-weight:600;color:var(--t3)">DÍAS A BORDO</label>
        <input value="${v(rec.days_on_aircraft)}" onchange="hotoField('days_on_aircraft',this.value)" style="${fieldStyle};margin-top:4px"></div>
      <div style="grid-column:1/3"><label style="font-size:10px;font-weight:600;color:var(--t3)">FECHA DE RECEPCIÓN</label>
        <input value="${v(rec.received_date)}" onchange="hotoField('received_date',this.value)" placeholder="25-May-26" style="${fieldStyle};margin-top:4px"></div>
    </div>
  </div>

  ${hotoCabinCareSection()}

  ${hotoShoppingSection()}

  ${section('Defects','defect','Añadir defecto…',6)}
  ${section('Additional Comments','comment','Añadir comentario…',null)}
  ${section('Items to offload','offload','Añadir item a descargar…',3)}

  <button onclick="hotoExport()" style="width:100%;margin-top:18px;padding:15px;border:none;background:#0F6E56;color:#fff;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px"><i class="ti ti-file-download"></i> Exportar HOTO PDF oficial</button>
  <div style="text-align:center;font-size:11px;color:var(--t3);margin-top:8px;line-height:1.5">Genera el PDF oficial de VistaJet con estos datos.<br>El PDF nunca se edita a mano: siempre se exporta desde aquí.</div>`;
}

// ── Pestaña Checklist: la lista "Leaving Aircraft" (localStorage, sin cambios) ─
function hotoChecklistTab(){
  const checks=JSON.parse(localStorage.getItem('vj_hoto_checks')||'{}');
  const allItems=VJ_HOTO_SECTIONS.flatMap(s=>s.items);
  const completed=allItems.filter(i=>checks[i.id]).length;
  const total=allItems.length;
  const pct=Math.round(completed/total*100);
  return `
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <span style="font-size:12px;color:var(--t2)">${completed}/${total} · ${pct}%</span>
      <button onclick="resetHotoChecks()" style="border:none;background:none;color:var(--t3);font-size:11px;cursor:pointer;text-decoration:underline">Reiniciar</button>
    </div>
    <div style="background:var(--border);border-radius:999px;height:4px;overflow:hidden;margin-bottom:14px">
      <div style="width:${pct}%;height:100%;background:${pct===100?'#0F6E56':'#185FA5'};border-radius:999px"></div>
    </div>
    ${VJ_HOTO_SECTIONS.map(sec=>{
      const sDone=sec.items.filter(i=>checks[i.id]).length;
      return `<div style="margin-bottom:12px">
        <div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-bottom:6px">${sec.name} · ${sDone}/${sec.items.length}</div>
        <div style="background:var(--surface);border-radius:12px;border:0.5px solid var(--border)">
          ${sec.items.map((item,i,arr)=>{const done=checks[item.id];return `<div onclick="toggleHotoCheck('${item.id}')" style="display:flex;align-items:center;gap:12px;padding:12px 14px;${i<arr.length-1?'border-bottom:0.5px solid var(--border)':''}cursor:pointer"><div style="width:20px;height:20px;border-radius:5px;border:1.5px solid ${done?'#0F6E56':'var(--border)'};background:${done?'#0F6E56':'none'};flex-shrink:0;display:flex;align-items:center;justify-content:center">${done?'<i class="ti ti-check" style="color:#fff;font-size:11px"></i>':''}</div><span style="font-size:13px;color:${done?'var(--t3)':'var(--text)'};text-decoration:${done?'line-through':'none'}">${item.text}</span></div>`;}).join('')}
        </div>
      </div>`;
    }).join('')}`;
}

function vjInventarioView(){
  // ── Renderizado asíncrono: carga sesión si aún no está en S ──────────────
  if(!S._invLoaded){
    S._invLoaded=true;
    (async()=>{
      try{
        S.invSession=await invSvc.loadActiveSession();
        if(S.invSession){
          S.invItems=await invSvc.loadSessionItems(S.invSession.id);
          S.invChat=await invSvc.getChatHistory(S.invSession.id,30);
        }
      }catch(e){ console.error('inv load',e); }
      render();
    })();
    // Muestra spinner mientras carga
    return `<div class="ph"><button class="back" onclick="invBack()"><i class="ti ti-arrow-left"></i></button><h2>Inventario</h2></div>
    <div style="display:flex;align-items:center;justify-content:center;height:200px;color:var(--t3);font-size:13px">Cargando inventario…</div>`;
  }

  const sess=S.invSession;

  // ── Sin sesión activa → formulario de nueva sesión ───────────────────────
  if(!sess){
    return `<div class="ph"><button class="back" onclick="invBack()"><i class="ti ti-arrow-left"></i></button><h2>Inventario</h2></div>

    <div style="background:var(--surface);border-radius:12px;padding:20px;border:0.5px solid var(--border);margin-bottom:12px">
      <div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-bottom:14px">Nueva sesión de inventario</div>

      <div style="margin-bottom:12px">
        <label style="font-size:11px;font-weight:600;color:var(--t2);display:block;margin-bottom:4px">Matrícula</label>
        <input id="inv-reg" type="text" placeholder="9H-VCQ" maxlength="10"
          style="width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--border);border-radius:8px;font-size:14px;font-weight:600;background:var(--bg);color:var(--text);letter-spacing:.05em;text-transform:uppercase">
      </div>

      <div style="margin-bottom:12px">
        <label style="font-size:11px;font-weight:600;color:var(--t2);display:block;margin-bottom:4px">Tipo de avión</label>
        <input id="inv-type" type="text" value="CL350" maxlength="20"
          style="width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--border);border-radius:8px;font-size:14px;background:var(--bg);color:var(--text);text-transform:uppercase">
      </div>

      <div style="margin-bottom:16px">
        <label style="font-size:11px;font-weight:600;color:var(--t2);display:block;margin-bottom:4px">Fecha de sesión</label>
        <input id="inv-date" type="date" value="${new Date().toISOString().slice(0,10)}"
          style="width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid var(--border);border-radius:8px;font-size:14px;background:var(--bg);color:var(--text)">
      </div>

      <div style="margin-bottom:16px">
        <label style="font-size:11px;font-weight:600;color:var(--t2);display:block;margin-bottom:4px">Excel de inventario (.xlsx)</label>
        <input id="inv-file" type="file" accept=".xlsx"
          onchange="invPreviewFile(this)"
          style="width:100%;box-sizing:border-box;padding:8px 0;font-size:13px;color:var(--text)">
        <div id="inv-preview" style="margin-top:10px;font-size:12px;color:var(--t2)"></div>
      </div>

      <button onclick="invCreateSession()"
        style="width:100%;padding:13px;border:none;background:var(--text);color:#fff;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer">
        Crear sesión
      </button>
    </div>`;
  }

  // ── Sesión activa ─────────────────────────────────────────────────────────
  const items=S.invItems;
  const stats=invSvc.getSessionStats(items);
  const search=(S.invSearch||'').toLowerCase();
  const filtered=search
    ? items.filter(i=>i.description.toLowerCase().includes(search)||i.code.toLowerCase().includes(search)||i.category.toLowerCase().includes(search))
    : items;

  // Agrupar por categoría para la lista
  const byCategory={};
  filtered.forEach(i=>{
    const cat=i.category||'Sin categoría';
    if(!byCategory[cat]) byCategory[cat]=[];
    byCategory[cat].push(i);
  });

  const statusBadge=(item)=>{
    if(item.discrepancy) return `<span style="font-size:10px;font-weight:600;padding:2px 6px;border-radius:999px;background:#FEF3C7;color:#92400E">Discrepancia</span>`;
    if(item.verified) return `<span style="font-size:10px;font-weight:600;padding:2px 6px;border-radius:999px;background:#D1FAE5;color:#065F46">Verificado</span>`;
    return `<span style="font-size:10px;font-weight:600;padding:2px 6px;border-radius:999px;background:var(--surface);color:var(--t3);border:0.5px solid var(--border)">Pendiente</span>`;
  };

  const itemsList=Object.entries(byCategory).map(([cat,catItems])=>`
    <div style="font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);padding:10px 14px 4px;background:var(--bg)">${cat}</div>
    ${catItems.map((item,idx,arr)=>`
      <div style="display:flex;align-items:center;gap:10px;padding:10px 14px;${idx<arr.length-1?'border-bottom:0.5px solid var(--border)':''}">
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${item.description}</div>
          <div style="font-size:11px;color:var(--t3);margin-top:1px">${item.code} · std ${item.std_qty} · actual <b style="color:var(--text)">${item.current_qty}</b></div>
        </div>
        ${statusBadge(item)}
      </div>`).join('')}`).join('');

  // ── Chat messages ────────────────────────────────────────────────────────
  const chatMsgs=S.invChat.map(m=>{
    const isUser=m.role==='user';
    return `<div style="display:flex;justify-content:${isUser?'flex-end':'flex-start'};margin-bottom:8px">
      <div style="max-width:82%;padding:10px 13px;border-radius:${isUser?'12px 12px 2px 12px':'12px 12px 12px 2px'};background:${isUser?'var(--text)':'var(--surface)'};color:${isUser?'#fff':'var(--text)'};font-size:13px;line-height:1.5;border:${isUser?'none':'0.5px solid var(--border)'}">${m.content}</div>
    </div>`;
  }).join('');

  return `<div class="ph"><button class="back" onclick="invBack()"><i class="ti ti-arrow-left"></i></button><h2>Inventario</h2></div>

  <!-- Cabecera de sesión -->
  <div style="background:var(--surface);border-radius:12px;padding:14px 16px;margin-bottom:10px;border:0.5px solid var(--border)">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <div>
        <div style="font-size:16px;font-weight:700;color:var(--text)">${sess.aircraft_registration}</div>
        <div style="font-size:11px;color:var(--t3)">${sess.aircraft_type} · ${sess.session_date}</div>
      </div>
      <span style="font-size:10px;font-weight:600;padding:3px 8px;border-radius:999px;background:#D1FAE5;color:#065F46">Activa</span>
    </div>
    <!-- Métricas -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">
      ${[
        {label:'Total',val:stats.total,color:'var(--text)'},
        {label:'Verificados',val:stats.verified,color:'#059669'},
        {label:'Pendientes',val:stats.pending,color:'var(--t2)'},
        {label:'Discrepancias',val:stats.discrepancies,color:stats.discrepancies>0?'#B45309':'var(--t3)'},
      ].map(s=>`<div style="text-align:center;background:var(--bg);border-radius:8px;padding:8px 4px">
        <div style="font-size:18px;font-weight:700;color:${s.color}">${s.val}</div>
        <div style="font-size:9px;color:var(--t3);margin-top:2px">${s.label}</div>
      </div>`).join('')}
    </div>
  </div>

  <!-- Chat de inventario con Isabel -->
  <div style="background:var(--surface);border-radius:12px;padding:16px;margin-bottom:10px;border:0.5px solid var(--border)">
    <div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin-bottom:12px">Isabel · Inventario</div>
    <div id="inv-chat-msgs" style="min-height:60px;max-height:300px;overflow-y:auto;margin-bottom:12px">
      ${S.invChat.length===0 && !S.invChatLoading
        ? `<div style="font-size:13px;color:var(--t2);line-height:1.55">Dime qué has contado, qué usaste o qué falta. Ejemplo: <em>"he contado 13 Coca-Colas"</em> o <em>"usé 2 botellas de agua"</em>.</div>`
        : chatMsgs}
      ${S.invChatLoading ? `<div style="display:flex;justify-content:flex-start;margin-bottom:8px"><div style="padding:10px 13px;border-radius:12px 12px 12px 2px;background:var(--surface);border:0.5px solid var(--border);font-size:13px;color:var(--t3)">Isabel está pensando…</div></div>` : ''}
    </div>
    ${S.invProposal ? `
    <div style="display:flex;gap:8px;margin-bottom:8px">
      <button onclick="invConfirm()"
        style="flex:1;padding:10px 16px;border:none;background:#15803D;color:#fff;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer">
        ✓ Confirmar
      </button>
      <button onclick="S.invProposal=null;render()"
        style="padding:10px 16px;border:1px solid var(--border);background:var(--bg);color:var(--t2);border-radius:8px;font-size:13px;cursor:pointer">
        Cancelar
      </button>
    </div>` : ''}
    <div style="display:flex;gap:8px">
      <input id="inv-chat-input" type="text" placeholder="Escribe a Isabel…"
        onkeydown="if(event.key==='Enter'&&!${S.invChatLoading})invSendMessage()"
        style="flex:1;padding:10px 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;background:var(--bg);color:var(--text)"
        ${S.invChatLoading ? 'disabled' : ''}>
      <button onclick="invSendMessage()"
        style="padding:10px 16px;border:none;background:${S.invChatLoading?'var(--t3)':'var(--text)'};color:#fff;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer"
        ${S.invChatLoading ? 'disabled' : ''}>Enviar</button>
    </div>
  </div>

  <!-- Buscador + lista de ítems -->
  <div style="background:var(--surface);border-radius:12px;border:0.5px solid var(--border);overflow:hidden;margin-bottom:10px">
    <div style="padding:12px 14px;border-bottom:0.5px solid var(--border)">
      <input type="text" placeholder="Buscar ítem, código o categoría…"
        value="${S.invSearch||''}"
        oninput="invSetSearch(this.value)"
        style="width:100%;box-sizing:border-box;padding:9px 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;background:var(--bg);color:var(--text)">
      ${search?`<div style="font-size:11px;color:var(--t3);margin-top:6px">${filtered.length} resultado${filtered.length!==1?'s':''}</div>`:''}
    </div>
    ${filtered.length===0
      ? `<div style="padding:20px 14px;font-size:13px;color:var(--t2)">Sin resultados.</div>`
      : itemsList}
  </div>

  <!-- Cerrar sesión -->
  <div style="text-align:center;padding:4px 0 16px">
    <button onclick="invCloseSession()"
      style="border:none;background:none;color:var(--t3);font-size:12px;cursor:pointer;text-decoration:underline">
      Cerrar sesión de inventario
    </button>
  </div>`;
}

function vjLaundryView(){
  const today=new Date().toISOString().slice(0,10);
  const laundryDate=localStorage.getItem('vj_laundry_date');
  const isToday=laundryDate===today;
  const items=isToday?JSON.parse(localStorage.getItem('vj_laundry_items')||'{}'):{};
  const total=Object.values(items).reduce((a,b)=>a+b,0);
  const tab=S.vjLaundryTab||'hoy';
  const tabBar=`<div style="display:flex;gap:2px;margin-bottom:14px;background:var(--surface);border-radius:10px;padding:3px;border:0.5px solid var(--border)">${['hoy','historial'].map(t=>`<button onclick="setVjTab('vjLaundryTab','${t}')" style="flex:1;padding:8px 2px;border:none;border-radius:8px;font-size:12px;font-weight:500;cursor:pointer;background:${tab===t?'var(--text)':'transparent'};color:${tab===t?'#fff':'var(--t2)'}">${t.charAt(0).toUpperCase()+t.slice(1)}</button>`).join('')}</div>`;
  const hoy=`
    <div style="background:var(--surface);border-radius:12px;border:0.5px solid var(--border);overflow:hidden;margin-bottom:12px">
      <div style="padding:14px;border-bottom:0.5px solid var(--border);display:flex;align-items:center;justify-content:space-between">
        <div>
          <div style="font-size:13px;font-weight:600;color:var(--text)">Laundry Form · Hoy</div>
          <div style="font-size:11px;color:var(--t2);margin-top:2px">${total>0?total+' ítem'+(total>1?'s':'')+' registrado'+(total>1?'s':''):'Aún no registrado'}</div>
        </div>
        ${total>0?`<button onclick="resetLaundry()" style="border:none;background:none;color:var(--t3);font-size:11px;cursor:pointer;text-decoration:underline">Reiniciar</button>`:''}
      </div>
      ${VJ_LAUNDRY_ITEMS.map((item,i,arr)=>{
        const count=items[item.id]||0;
        return `<div style="display:flex;align-items:center;gap:12px;padding:11px 14px;${i<arr.length-1?'border-bottom:0.5px solid var(--border)':''}">
          <span style="flex:1;font-size:13px;color:var(--text)">${item.name}</span>
          <div style="display:flex;align-items:center">
            <button onclick="updateLaundryItem('${item.id}',-1)" style="width:28px;height:28px;border:1px solid var(--border);border-radius:8px 0 0 8px;background:var(--bg);cursor:pointer;font-size:16px;color:var(--t2);display:flex;align-items:center;justify-content:center;padding:0">−</button>
            <div style="width:36px;height:28px;border-top:1px solid var(--border);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;color:${count>0?'var(--text)':'var(--t3)'};background:var(--surface)">${count}</div>
            <button onclick="updateLaundryItem('${item.id}',1)" style="width:28px;height:28px;border:1px solid var(--border);border-radius:0 8px 8px 0;background:var(--bg);cursor:pointer;font-size:16px;color:var(--t2);display:flex;align-items:center;justify-content:center;padding:0">+</button>
          </div>
        </div>`;
      }).join('')}
      <div style="padding:12px 14px;border-top:0.5px solid var(--border);display:flex;align-items:center;justify-content:space-between">
        <span style="font-size:13px;font-weight:600;color:var(--text)">TOTAL</span>
        <span style="font-size:16px;font-weight:700;color:var(--text)">${total}</span>
      </div>
    </div>
    <button style="width:100%;padding:14px;border:none;background:${total>0?'var(--text)':'var(--border)'};color:${total>0?'#fff':'var(--t3)'};border-radius:12px;font-size:14px;font-weight:600;cursor:${total>0?'pointer':'default'}">${total>0?'Ver y enviar Laundry Form →':'Registra ítems para continuar'}</button>`;
  const historial=`
    <div style="background:var(--surface);border-radius:12px;padding:24px 16px;text-align:center;border:0.5px solid var(--border)">
      <div style="font-size:32px;margin-bottom:12px">🧺</div>
      <div style="font-size:14px;font-weight:500;color:var(--text);margin-bottom:8px">Historial de Laundry Forms</div>
      <div style="font-size:12px;color:var(--t2);line-height:1.6">El historial de formularios enviados estará disponible próximamente.</div>
    </div>`;
  return `<div class="ph"><button class="back" onclick="go('area','${S.areaId}')"><i class="ti ti-arrow-left"></i></button><h2>Laundry Form</h2></div>${tabBar}${tab==='hoy'?hoy:historial}`;
}

function vjFreshView(){
  const status=S.vjState.status||'libre';
  return `<div class="ph"><button class="back" onclick="go('area','${S.areaId}')"><i class="ti ti-arrow-left"></i></button><h2>Fresh Items Plan</h2></div>
  <div style="background:var(--surface);border-radius:12px;padding:24px 16px;text-align:center;border:0.5px solid var(--border);margin-bottom:12px">
    <div style="font-size:32px;margin-bottom:12px">🥗</div>
    <div style="font-size:14px;font-weight:500;color:var(--text);margin-bottom:8px">Fresh Items Plan</div>
    <div style="font-size:12px;color:var(--t2);line-height:1.6">Las recomendaciones de catering fresco basadas en sectores y pasajeros estarán disponibles próximamente. Habla con Isabel para planificar el catering del próximo sector.</div>
  </div>
  ${status==='rotacion'?`<button onclick="openChat()" style="width:100%;padding:14px;border:none;background:var(--text);color:#fff;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer">Planificar con Isabel →</button>`:''}`;
}

function vjStatusView(){
  if(!S._invLoaded){
    S._invLoaded=true;
    (async()=>{
      try{
        S.invSession=await invSvc.loadActiveSession();
        if(S.invSession){
          S.invItems=await invSvc.loadSessionItems(S.invSession.id);
          S.invChat=await invSvc.getChatHistory(S.invSession.id,30);
        }
      }catch(e){ console.error('inv load',e); }
      render();
    })();
    return `<div class="ph"><button class="back" onclick="go('area','${S.areaId}')"><i class="ti ti-arrow-left"></i></button><h2>Estado del avión</h2></div>
    <div style="display:flex;align-items:center;justify-content:center;height:200px;color:var(--t3);font-size:13px">Cargando…</div>`;
  }

  const vj=S.vjState;
  const status=vj.status||'libre';
  const statusMap={rotacion:{label:'En rotación',bg:'#FAEEDA',color:'#854F0B'},libre:{label:'Libre',bg:'#E1F5EE',color:'#0F6E56'},standby:{label:'Standby',bg:'#EEEDFE',color:'#534AB7'}};
  const st=statusMap[status]||statusMap.libre;

  const isAircraftTask=t=>/\bho\b|hoto|hand.?over|inventar|laundry|lavand|uplift|catering|amenities|defect|kettle|polish|leather|drawer/i.test(t.title);
  const aircraftPend=(S.vjTasks||[]).filter(t=>t.status!=='done'&&isAircraftTask(t));

  const items=S.invItems||[];
  const invTotal=items.length;
  const invDisc=items.filter(i=>i.discrepancy).length;
  const invPend=items.filter(i=>(i.current_qty??i.std_qty??0)<(i.std_qty??0)).length;
  const sess=S.invSession;

  const hoToChecks=JSON.parse(localStorage.getItem('vj_hoto_checks')||'{}');
  const allHotoItems=VJ_HOTO_SECTIONS.flatMap(s=>s.items);
  const hotoDone=allHotoItems.filter(i=>hoToChecks[i.id]).length;
  const hotoTotal=allHotoItems.length;

  const hasProblems=aircraftPend.length>0||invDisc>0;
  const ctrlLabel=status!=='rotacion'?'Fuera de rotación':hasProblems?(aircraftPend.length+invDisc)+' elemento'+(aircraftPend.length+invDisc>1?'s':'')+' requieren atención':'El avión está bajo control';
  const ctrlColor=status!=='rotacion'?'#9CA3AF':hasProblems?'#854F0B':'#0F6E56';
  const ctrlBg=status!=='rotacion'?'#F5F5F5':hasProblems?'#FAEEDA':'#E1F5EE';

  const secTitle=t=>`<div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin:16px 0 8px">${t}</div>`;
  const row=(label,val,hi=false)=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-bottom:0.5px solid var(--border)"><span style="font-size:13px;color:var(--t2)">${label}</span><span style="font-size:13px;font-weight:600;color:${hi?'#854F0B':'var(--text)'}">${val}</span></div>`;

  const invBlock=sess
    ?`<div style="background:var(--surface);border-radius:12px;padding:4px 16px;border:0.5px solid var(--border)">
        ${row('Total ítems',invTotal)}
        ${row('Discrepancias',invDisc,invDisc>0)}
        ${row('Pendientes de reposición',invPend,invPend>0)}
        ${row('Sesión',sess.aircraft_registration+' · '+(sess.session_date||'').slice(0,10))}
      </div>`
    :`<div style="background:var(--surface);border-radius:12px;padding:16px;border:0.5px solid var(--border);text-align:center;color:var(--t3);font-size:13px">Sin sesión activa</div>`;

  const hotoBlock=`<div style="background:var(--surface);border-radius:12px;padding:4px 16px;border:0.5px solid var(--border)">
    ${row('Completados',`${hotoDone} / ${hotoTotal}`,hotoDone<hotoTotal&&status==='rotacion')}
    ${row('Estado',hotoDone===hotoTotal?'Completado':hotoDone===0?'No iniciado':'En progreso')}
  </div>`;

  const tasksBlock=aircraftPend.length>0
    ?`<div style="background:var(--surface);border-radius:12px;padding:0 16px;border:0.5px solid var(--border)">
        ${aircraftPend.map(t=>`<div style="padding:10px 0;border-bottom:0.5px solid var(--border);font-size:13px;color:var(--text)">${t.title}${t.due_date?`<span style="font-size:11px;color:#854F0B;margin-left:6px">${new Date(t.due_date).toLocaleDateString('es-ES',{day:'numeric',month:'short'})}</span>`:''}</div>`).join('')}
      </div>`
    :`<div style="background:var(--surface);border-radius:12px;padding:16px;border:0.5px solid var(--border);text-align:center;color:var(--t3);font-size:13px">Sin tareas de avión pendientes</div>`;

  return `<div class="ph"><button class="back" onclick="go('area','${S.areaId}')"><i class="ti ti-arrow-left"></i></button><h2>Estado del avión</h2></div>

  <div style="background:${ctrlBg};border-radius:12px;padding:16px;border:0.5px solid var(--border)">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">
      <span style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3)">Resumen</span>
      <span style="font-size:10px;font-weight:600;color:${st.color};background:${st.bg};border-radius:999px;padding:2px 8px">${st.label}</span>
    </div>
    ${vj.aircraft?`<div style="font-size:11px;color:var(--t3);margin-bottom:6px">${vj.aircraft}${status==='rotacion'&&vj.rotation_day&&vj.rotation_total?' · Día '+vj.rotation_day+'/'+vj.rotation_total:''}</div>`:''}
    <div style="font-size:15px;font-weight:500;color:${ctrlColor}">${ctrlLabel}</div>
  </div>

  ${secTitle('Inventario')}
  ${invBlock}

  ${secTitle('HOTO')}
  ${hotoBlock}

  ${secTitle('Tareas del avión')}
  ${tasksBlock}

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:20px">
    <button onclick="go('vj_inventario')" style="padding:13px;border:0.5px solid var(--border);background:var(--surface);color:var(--text);border-radius:12px;font-size:13px;font-weight:600;cursor:pointer">Ir a Inventario</button>
    <button onclick="invExport()" ${!sess?'disabled':''} style="padding:13px;border:none;background:${sess?'var(--text)':'var(--surface)'};color:${sess?'#fff':'var(--t3)'};border-radius:12px;font-size:13px;font-weight:600;cursor:${sess?'pointer':'not-allowed'};border:0.5px solid var(--border)">Exportar Excel</button>
  </div>`;
}

async function invExport(){
  if(!S.invSession) return;
  try{
    const res=await fetch(`${ISABEL_API}/v1/session/${S.invSession.id}/export`,{headers:{'x-api-key':ISABEL_KEY}});
    if(!res.ok) throw new Error(`Export ${res.status}`);
    const blob=await res.blob();
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    const cd=res.headers.get('Content-Disposition')||'';
    const m=cd.match(/filename="([^"]+)"/);
    a.download=m?m[1]:'inventory.xlsx';
    a.click();
    URL.revokeObjectURL(a.href);
  }catch(e){ alert('Error exportando: '+e.message); }
}

// ═══ HOTO — módulo vivo ═══════════════════════════════════════════════════════
function hotoBack(){ S._hotoLoaded=false; S.hotoErr=null; go('area',S.areaId); }

async function hotoReload(){
  try{
    S.hotoRec=await hotoSvc.loadActiveHoto();
    S.hotoItems=S.hotoRec?await hotoSvc.loadItems(S.hotoRec.id):[];
    S.hotoErr=null;
  }catch(e){ S.hotoErr=e.message; }
  render();
}

async function hotoCreate(){
  const tail=(document.getElementById('hoto-new-tail')?.value||'').trim().toUpperCase();
  const icao=(document.getElementById('hoto-new-icao')?.value||'').trim().toUpperCase();
  const pattern=document.getElementById('hoto-new-pattern')?.value||null;
  const noPrior=document.getElementById('hoto-new-noprior')?.checked;
  if(!tail){ alert('Introduce la matrícula.'); return; }
  try{
    await hotoSvc.createHoto({ tail_number:tail, icao, pattern, has_prior_hoto:!noPrior });
    await hotoReload();
  }catch(e){ alert('No se pudo crear el HOTO: '+e.message); }
}

async function hotoField(field,value){
  if(!S.hotoRec) return;
  const val=value===''?null:value;
  S.hotoRec[field]=val;              // optimista, sin re-render (no perder foco)
  try{ await hotoSvc.updateHoto(S.hotoRec.id,{ [field]:val }); }
  catch(e){ alert('No se pudo guardar: '+e.message); }
}

async function hotoAddItem(section){
  const input=document.getElementById('hoto-add-'+section);
  const content=(input?.value||'').trim();
  if(!content||!S.hotoRec) return;
  try{
    await hotoSvc.addItem(S.hotoRec.id,section,content);
    S.hotoItems=await hotoSvc.loadItems(S.hotoRec.id);
    render();
  }catch(e){ alert('No se pudo añadir: '+e.message); }
}

async function hotoDelItem(id){
  try{
    await hotoSvc.deleteItem(id);
    S.hotoItems=(S.hotoItems||[]).filter(i=>i.id!==id);
    render();
  }catch(e){ alert('No se pudo borrar: '+e.message); }
}

function hotoExport(){
  if(!S.hotoRec) return;
  // Navegación directa (no fetch+blob): en iOS/PWA los blobs de descarga fallan,
  // pero abrir la URL muestra el PDF en el visor nativo con compartir/guardar.
  const url=`${ISABEL_API}/v1/hoto/${S.hotoRec.id}/export?inline=1&api_key=${encodeURIComponent(ISABEL_KEY)}`;
  window.open(url,'_blank');
}

// ── Cabin Care · Date last done ──────────────────────────────────────────────
// cabin_care[i] ↔ VJ_CABIN_CARE_LABELS[i] ↔ fila i del PDF. Cada elemento {d,n}:
// d = fecha M/D/YY o null (unknown), n = nota (solo app; el PDF no tiene celda).
function hotoCareArr(){
  const raw=Array.isArray(S.hotoRec?.cabin_care)?S.hotoRec.cabin_care:[];
  return VJ_CABIN_CARE_LABELS.map((_,i)=>{
    const x=raw[i];
    if(typeof x==='string') return {d:x||null,n:''};
    return {d:x?.d||null,n:x?.n||''};
  });
}

async function hotoCareSave(arr){
  S.hotoRec.cabin_care=arr;
  try{ await hotoSvc.updateHoto(S.hotoRec.id,{cabin_care:arr}); }
  catch(e){ alert('No se pudo guardar Cabin Care: '+e.message); }
}

function hotoCareToggle(i){ S.hotoCareOpen=S.hotoCareOpen===i?null:i; render(); }

function hotoCareToday(i){
  const t=new Date();
  const arr=hotoCareArr();
  arr[i].d=`${t.getMonth()+1}/${t.getDate()}/${String(t.getFullYear()).slice(2)}`;
  hotoCareSave(arr); render();
}

function hotoCareUnknown(i){
  const arr=hotoCareArr();
  arr[i].d=null;
  hotoCareSave(arr); render();
}

function hotoCareDate(i,val){
  if(!val) return;                      // yyyy-mm-dd del <input type="date">
  const [y,m,d]=val.split('-');
  const arr=hotoCareArr();
  arr[i].d=`${parseInt(m)}/${parseInt(d)}/${y.slice(2)}`;
  hotoCareSave(arr); render();
}

function hotoCareNote(i,val){
  const arr=hotoCareArr();
  arr[i].n=val;
  hotoCareSave(arr);                    // sin render: no perder el foco del input
}

function hotoCabinCareSection(){
  const arr=hotoCareArr();
  const withDate=arr.filter(x=>x.d).length;
  const open=S.hotoCareOpen;
  // M/D/YY → yyyy-mm-dd para precargar el input date
  const toISO=(s)=>{
    const m=String(s||'').match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
    return m?`20${m[3]}-${String(m[1]).padStart(2,'0')}-${String(m[2]).padStart(2,'0')}`:'';
  };
  const rows=VJ_CABIN_CARE_LABELS.map((label,i)=>{
    const {d,n}=arr[i];
    const isOpen=open===i;
    const editor=!isOpen?'':`
      <div style="padding:10px 0 12px;display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;gap:8px">
          <button onclick="hotoCareToday(${i})" style="flex:1;padding:9px;border:none;background:#0F6E56;color:#fff;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">Hecho hoy</button>
          <button onclick="hotoCareUnknown(${i})" style="flex:1;padding:9px;border:0.5px solid var(--border);background:var(--bg);color:var(--t2);border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">Unknown</button>
          <input type="date" value="${toISO(d)}" onchange="hotoCareDate(${i},this.value)" style="flex:1.4;box-sizing:border-box;padding:8px;border:0.5px solid var(--border);border-radius:8px;font-size:12px;background:var(--bg);color:var(--text)">
        </div>
        <input value="${(n||'').replace(/"/g,'&quot;')}" placeholder="Nota (solo en la app, no va al PDF)" onchange="hotoCareNote(${i},this.value)" style="box-sizing:border-box;padding:8px 10px;border:0.5px solid var(--border);border-radius:8px;font-size:12px;background:var(--bg);color:var(--text)">
      </div>`;
    return `<div style="${i<VJ_CABIN_CARE_LABELS.length-1?'border-bottom:0.5px solid var(--border);':''}">
      <div onclick="hotoCareToggle(${i})" style="display:flex;align-items:center;gap:10px;padding:11px 0;cursor:pointer">
        <span style="flex:1;font-size:13px;color:var(--text);line-height:1.35">${label}${n?' <i class="ti ti-note" style="font-size:11px;color:var(--t3)"></i>':''}</span>
        <span style="font-size:12px;font-weight:600;color:${d?'#0F6E56':'var(--t3)'};white-space:nowrap">${d||'unknown'}</span>
        <i class="ti ti-chevron-${isOpen?'up':'down'}" style="font-size:12px;color:var(--t3)"></i>
      </div>${editor}
    </div>`;
  }).join('');
  return `<div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin:14px 0 6px">Cabin Care · Date last done · ${withDate}/${VJ_CABIN_CARE_LABELS.length}</div>
  <div style="background:var(--surface);border-radius:12px;padding:2px 14px;border:0.5px solid var(--border)">${rows}</div>`;
}

// ── Aircraft Shopping · interactivo ──────────────────────────────────────────
// Regla HOTO ↔ Inventario: Inventario es la verdad del stock; el HOTO copia un
// valor con gesto explícito ("Usar"). Editar aquí NUNCA modifica Inventario.
function hotoInvRef(item){
  const items=S.hotoInvItems||[];
  for(const kw of item.inv){
    const hit=items.find(x=>(x.description||'').toLowerCase().includes(kw));
    if(hit) return hit;
  }
  return null;
}

function hotoShopToggle(i){ S.hotoShopOpen=S.hotoShopOpen===i?null:i; render(); }

async function hotoShopSet(key,val){
  if(!S.hotoRec) return;
  const shopping={...(S.hotoRec.shopping||{})};
  if(val==null||String(val).trim()==='') delete shopping[key];
  else shopping[key]=String(val).trim();
  S.hotoRec.shopping=shopping;
  try{ await hotoSvc.updateHoto(S.hotoRec.id,{shopping}); }
  catch(e){ alert('No se pudo guardar: '+e.message); }
  render();
}

function hotoShoppingSection(){
  const shopping=S.hotoRec?.shopping||{};
  const open=S.hotoShopOpen;
  const filled=VJ_SHOPPING_ITEMS.filter(it=>shopping[it.key]!=null&&shopping[it.key]!=='').length;
  const esc=(s)=>String(s??'').replace(/"/g,'&quot;');
  const rows=VJ_SHOPPING_ITEMS.map((it,i)=>{
    const val=shopping[it.key];
    const has=val!=null&&val!=='';
    const isOpen=open===i;
    const ref=hotoInvRef(it);
    const refLine=ref?`<div style="display:flex;align-items:center;gap:8px;font-size:12px;color:var(--t2)">
        <span>Inventario: <b>${ref.current_qty??'?'}</b>${ref.verified?' · verificado':''}</span>
        <button onclick="hotoShopSet('${it.key}','${esc(ref.current_qty)}')" style="border:0.5px solid var(--border);background:var(--bg);color:var(--text);border-radius:7px;padding:4px 10px;font-size:11px;font-weight:600;cursor:pointer">Usar</button>
      </div>`:'';
    const chips=it.opts
      ?`<div style="display:flex;gap:6px;flex-wrap:wrap">${it.opts.map(o=>`<button onclick="hotoShopSet('${it.key}','${esc(o)}')" style="padding:8px 13px;border:0.5px solid ${val===o?'#0F6E56':'var(--border)'};background:${val===o?'#0F6E56':'var(--bg)'};color:${val===o?'#fff':'var(--text)'};border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">${o}</button>`).join('')}</div>`
      :`<input value="${esc(val)}" placeholder="Cantidad o nota…" onchange="hotoShopSet('${it.key}',this.value)" style="box-sizing:border-box;width:100%;padding:9px 11px;border:0.5px solid var(--border);border-radius:8px;font-size:13px;background:var(--bg);color:var(--text)">`;
    const editor=!isOpen?'':`
      <div style="padding:4px 0 12px;display:flex;flex-direction:column;gap:8px">
        <div style="font-size:12px;color:var(--t2)">¿Cuántos <b>${it.label}</b> quedan?</div>
        ${chips}
        ${refLine}
        ${has?`<button onclick="hotoShopSet('${it.key}','')" style="align-self:flex-start;border:none;background:none;color:var(--t3);font-size:11px;cursor:pointer;text-decoration:underline;padding:0">Dejar vacío en el PDF</button>`:''}
      </div>`;
    return `<div style="${i<VJ_SHOPPING_ITEMS.length-1?'border-bottom:0.5px solid var(--border);':''}">
      <div onclick="hotoShopToggle(${i})" style="display:flex;align-items:center;gap:10px;padding:11px 0;cursor:pointer">
        <span style="flex:1;font-size:13px;color:var(--text)">${it.label}</span>
        <span style="font-size:12px;font-weight:600;color:${has?'#0F6E56':'var(--t3)'};max-width:45%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${has?esc(val):'—'}</span>
        <i class="ti ti-chevron-${isOpen?'up':'down'}" style="font-size:12px;color:var(--t3)"></i>
      </div>${editor}
    </div>`;
  }).join('');
  return `<div style="font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--t3);margin:14px 0 6px">Aircraft Shopping · ${filled}/${VJ_SHOPPING_ITEMS.length}</div>
  <div style="background:var(--surface);border-radius:12px;padding:2px 14px;border:0.5px solid var(--border)">${rows}</div>
  <div style="font-size:11px;color:var(--t3);margin-top:6px;line-height:1.5">Editar aquí solo cambia el HOTO. El stock real vive en Inventario; "Usar" copia su valor como foto de la entrega.</div>`;
}

function go(view, id=null) {
  S.view=view; if(id) S.areaId=id;
  window.scrollTo(0,0); render();
}

async function toggleMode() {
  S.mode=S.mode==='ON'?'OFF':'ON'; render();
  await dbSvc.setMode(S.mode);
}

async function done(id) {
  S.tasks=S.tasks.filter(t=>t.id!==id); render();
  await dbSvc.completeTask(id);
}

function openAdd() {
  const opts=S.areas.map(a=>`<option value="${a.id}">${a.name}</option>`).join('');
  const m=document.createElement('div');
  m.className='overlay'; m.id='modal';
  m.innerHTML=`<div class="modal">
    <h3>Nueva tarea</h3>
    <input class="fi" id="nt" placeholder="¿Qué tienes pendiente?" autocomplete="off">
    <select class="fi" id="na"><option value="">Sin área</option>${opts}</select>
    <select class="fi" id="np">
      <option value="medium">Prioridad normal</option>
      <option value="critical">Crítica — urgente</option>
      <option value="high">Alta</option>
      <option value="low">Baja</option>
    </select>
    <div class="ma">
      <button class="btn btn-s" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-p" onclick="addTask()">Añadir</button>
    </div>
  </div>`;
  m.onclick=e=>{if(e.target===m)closeModal()};
  document.body.appendChild(m);
  setTimeout(()=>document.getElementById('nt').focus(),150);
}

function closeModal() { const m=document.getElementById('modal'); if(m)m.remove(); }

// ---- Check-in matutino ----
async function checkinSueno(h) {
  const a=S.areas.find(x=>x.name==='Vida Personal');
  if(!a) return;
  const m=S.metrics.find(x=>x.area_id===a.id&&x.key==='horas_sueno');
  if(m){await dbSvc.updateMetric(m.id,h);m.value=String(h);}
  render();
}

async function checkinDolor(n) {
  const a=S.areas.find(x=>x.name==='Salud');
  if(!a) return;
  const m=S.metrics.find(x=>x.area_id===a.id&&x.key==='dolor_hoy');
  if(m){await dbSvc.updateMetric(m.id,n);m.value=String(n);}
  render();
}

async function checkinVJ(status) {
  await saveVjState({status});
}

function completeCheckin() {
  localStorage.setItem('checkin_date',new Date().toISOString().slice(0,10));
  render();
}

// ---- VistaJet functions ----
async function saveVjState(patch) {
  if(!S.vjState.id) return;
  patch.updated_at=new Date().toISOString();
  await dbSvc.updateVjState(S.vjState.id, patch);
  Object.assign(S.vjState,patch);
  render();
}

function openVjState() {
  const vj=S.vjState;
  const el=document.createElement('div');
  el.className='overlay'; el.id='modal';
  el.innerHTML=`<div class="modal">
    <h3>Estado VistaJet</h3>
    <select class="fi" id="vj-status">
      <option value="libre"${vj.status==='libre'?' selected':''}>🏠 Libre</option>
      <option value="rotacion"${vj.status==='rotacion'?' selected':''}>✈️ En rotación</option>
      <option value="standby"${vj.status==='standby'?' selected':''}>⏳ Standby</option>
    </select>
    <input class="fi" id="vj-aircraft" placeholder="Avión actual (ej. 9H-VCF)" value="${vj.aircraft||''}">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <input class="fi" id="vj-rday" type="number" placeholder="Día rotación" value="${vj.rotation_day||''}" style="margin-bottom:0">
      <input class="fi" id="vj-rtotal" type="number" placeholder="Total días" value="${vj.rotation_total||''}" style="margin-bottom:0">
    </div>
    <div style="height:8px"></div>
    <input class="fi" id="vj-rstart" type="date" placeholder="Inicio rotación" value="${vj.rotation_start||''}">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <input class="fi" id="vj-hmonth" type="number" placeholder="Horas mes" value="${vj.hours_month||''}" style="margin-bottom:0">
      <input class="fi" id="vj-hyear" type="number" placeholder="Horas año" value="${vj.hours_year||''}" style="margin-bottom:0">
    </div>
    <div style="height:8px"></div>
    <input class="fi" id="vj-passport" type="date" placeholder="Vencimiento pasaporte" value="${vj.passport_exp||''}">
    <div class="ma">
      <button class="btn btn-s" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-p" onclick="saveVjStateForm()">Guardar</button>
    </div>
  </div>`;
  el.addEventListener('click',e=>{if(e.target===el)closeModal();});
  document.body.appendChild(el);
}

function saveVjStateForm() {
  const toNull=v=>v===''?null:v;
  saveVjState({
    status:document.getElementById('vj-status').value,
    aircraft:document.getElementById('vj-aircraft').value.trim()||null,
    rotation_day:toNull(document.getElementById('vj-rday').value)||null,
    rotation_total:toNull(document.getElementById('vj-rtotal').value)||null,
    rotation_start:toNull(document.getElementById('vj-rstart').value),
    hours_month:toNull(document.getElementById('vj-hmonth').value)||0,
    hours_year:toNull(document.getElementById('vj-hyear').value)||0,
    passport_exp:toNull(document.getElementById('vj-passport').value),
  });
  closeModal();
}

function openAddVjTask() {
  const el=document.createElement('div');
  el.className='overlay'; el.id='modal';
  el.innerHTML=`<div class="modal">
    <h3>Nueva tarea VJ</h3>
    <input class="fi" id="vjt-title" placeholder="Título (ej. Enviar facturas)">
    <input class="fi" id="vjt-due" type="date" placeholder="Fecha límite">
    <select class="fi" id="vjt-priority">
      <option value="normal">Prioridad normal</option>
      <option value="alta">Alta prioridad</option>
    </select>
    <div class="ma">
      <button class="btn btn-s" onclick="closeModal()">Cancelar</button>
      <button class="btn btn-p" onclick="saveVjTask()">Guardar</button>
    </div>
  </div>`;
  el.addEventListener('click',e=>{if(e.target===el)closeModal();});
  document.body.appendChild(el);
}

async function saveVjTask() {
  const title=document.getElementById('vjt-title').value.trim();
  if(!title) return;
  const due=document.getElementById('vjt-due').value||null;
  const priority=document.getElementById('vjt-priority').value;
  const data=await dbSvc.createVjTask({title,due_date:due,priority});
  if(data) S.vjTasks.push(data);
  closeModal(); render();
}

async function toggleVjTask(id) {
  const t=S.vjTasks.find(x=>x.id===id);
  if(!t) return;
  const newStatus=t.status==='done'?'pending':'done';
  await dbSvc.updateVjTaskStatus(id, newStatus);
  t.status=newStatus;
  render();
}

async function deleteVjTask(id) {
  await dbSvc.deleteVjTask(id);
  S.vjTasks=S.vjTasks.filter(x=>x.id!==id);
  render();
}

async function clearDoneVjTasks() {
  const ids=S.vjTasks.filter(x=>x.status==='done').map(x=>x.id);
  if(!ids.length) return;
  await dbSvc.deleteVjTasksByIds(ids);
  S.vjTasks=S.vjTasks.filter(x=>x.status!=='done');
  render();
}

function selectVjBag(id) {
  saveVjState({active_bag:id,bag_checks:{}});
}

async function toggleVjBagItem(key) {
  const checks=Object.assign({},S.vjState.bag_checks||{});
  checks[key]=!checks[key];
  await saveVjState({bag_checks:checks});
}

function resetVjBag() {
  saveVjState({bag_checks:{}});
}

function toggleVjRecv(key) {
  const checks=JSON.parse(localStorage.getItem('vj_recv_checks')||'{}');
  checks[key]=!checks[key];
  localStorage.setItem('vj_recv_checks',JSON.stringify(checks));
  render();
}

function resetVjRecv() {
  localStorage.removeItem('vj_recv_checks');
  render();
}

async function setSueno(h) {
  const a=S.areas.find(x=>x.name==='Vida Personal');
  if(!a) return;
  const m=S.metrics.find(x=>x.area_id===a.id&&x.key==='horas_sueno');
  if(m){await dbSvc.updateMetric(m.id,h);m.value=String(h);}
  render();
}

async function resetCannabis() {
  const a=S.areas.find(x=>x.name==='Vida Personal');
  if(!a) return;
  const today=new Date().toISOString().slice(0,10);
  let m=S.metrics.find(x=>x.area_id===a.id&&x.key==='cannabis_start_date');
  if(m){await dbSvc.updateMetric(m.id,today);m.value=today;}
  else{const data=await dbSvc.createMetric({area_id:a.id,key:'cannabis_start_date',value:today,label:'Inicio sin cannabis',unit:''});if(data)S.metrics.push(data);}
  render();
}

async function regSesion() {
  const a=S.areas.find(x=>x.name==='Gym');
  if(!a) return;
  const today=new Date().toISOString().slice(0,10);
  const ses=S.metrics.find(x=>x.area_id===a.id&&x.key==='sesiones_semana');
  let lastSes=S.metrics.find(x=>x.area_id===a.id&&x.key==='last_session_date');
  if(ses){await dbSvc.updateMetric(ses.id,parseInt(ses.value)+1);ses.value=String(parseInt(ses.value)+1);}
  if(lastSes){await dbSvc.updateMetric(lastSes.id,today);lastSes.value=today;}
  else{const data=await dbSvc.createMetric({area_id:a.id,key:'last_session_date',value:today,label:'Última sesión',unit:''});if(data)S.metrics.push(data);}
  render();
}

async function updateDolor(n) {
  const a=S.areas.find(x=>x.name==='Salud');
  if(!a) return;
  const m=S.metrics.find(x=>x.area_id===a.id&&x.key==='dolor_hoy');
  if(m){await dbSvc.updateMetric(m.id,n);m.value=String(n);}
  render();
}

async function addTask() {
  const title=document.getElementById('nt').value.trim();
  const area_id=document.getElementById('na').value||null;
  const priority=document.getElementById('np').value;
  if(!title) return;
  closeModal();
  const data=await dbSvc.createTask({title,area_id,priority,suitable_modes:['ON','OFF'],horizon:priority==='critical'?'today':'this_week'});
  if(data){S.tasks.unshift(data);render();}
}

function openChat() {
  if(document.getElementById('chat-overlay')) return;
  const ctxName = S.areaId ? (S.areas.find(a=>a.id===S.areaId)?.name||'Área') :
    S.view==='home'?'Inicio':S.view==='global'?'Vista global':'Life OS';
  const welcome = S.chatHistory.length===0 ?
    `<div class="msg-a">Hola Estefanía 👋 Soy Isabel.\n\nPuedo añadir tareas, actualizar métricas, cambiar el modo... ¿en qué te ayudo?</div>` : '';
  const msgs = S.chatHistory.map(m=>`<div class="${m.role==='user'?'msg-u':'msg-a'}">${m.content}</div>`).join('');
  const ov=document.createElement('div');
  ov.className='chat-overlay'; ov.id='chat-overlay';
  ov.onclick=e=>{if(e.target===ov)closeChat()};
  ov.innerHTML=`<div class="chat-panel">
    <div class="chat-ph">
      <div>
        <div style="font-size:15px;font-weight:700">Isabel</div>
        <div style="font-size:11px;color:var(--t2)">Contexto: ${ctxName}</div>
      </div>
      <button onclick="closeChat()" style="background:none;border:none;padding:4px;cursor:pointer;color:var(--t2);font-size:22px;line-height:1"><i class="ti ti-x"></i></button>
    </div>
    <div class="chat-msgs" id="chat-msgs">${welcome}${msgs}</div>
    <div class="chat-input-row">
      <label for="chat-file" class="chat-attach"><i class="ti ti-paperclip" style="font-size:18px"></i></label>
      <input type="file" id="chat-file" accept="image/*,application/pdf" style="display:none" onchange="handleFile(this)">
      <input class="fi" id="chat-in" placeholder="Escribe algo..." autocomplete="off" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendMsg()}" style="margin:0;flex:1">
      <button class="btn btn-p" onclick="sendMsg()" style="flex:0;padding:11px 14px;min-width:46px"><i class="ti ti-send" style="font-size:15px"></i></button>
    </div>
  </div>`;
  document.body.appendChild(ov);
  scrollChat();
  setTimeout(()=>document.getElementById('chat-in')?.focus(),300);
}

function closeChat() { const el=document.getElementById('chat-overlay'); if(el) el.remove(); }

async function sendMsg() {
  const input=document.getElementById('chat-in');
  const msg=input?.value.trim();
  if(!msg&&!S.pendingImage) return;
  if(input) input.value='';
  const userText=msg||(S.pendingImage?`📎 ${S.pendingImage.name}`:'');
  S.chatHistory.push({role:'user',content:userText});
  const msgs=document.getElementById('chat-msgs');
  if(msgs){
    const u=document.createElement('div'); u.className='msg-u'; u.textContent=userText; msgs.appendChild(u);
    const ld=document.createElement('div'); ld.className='msg-loading'; ld.id='chat-ld'; ld.textContent='Isabel está pensando...'; msgs.appendChild(ld);
    scrollChat();
  }
  const ctx=S.areaId?(S.areas.find(a=>a.id===S.areaId)?.name||''):S.view;
  if(!isabelSvc.isAvailable()){
    const unavail='Isabel no está conectada. Abre "Arrancar Isabel.bat" en el escritorio.';
    S.chatHistory.push({role:'assistant',content:unavail});
    document.getElementById('chat-ld')?.remove();
    if(msgs){const a=document.createElement('div');a.className='msg-a';a.textContent=unavail;msgs.appendChild(a);}
    scrollChat(); return;
  }
  try {
    const image=S.pendingImage||null; if(S.pendingImage) S.pendingImage=null;
    const {reply,actions}=await isabelSvc.sendMessage({message:msg,history:S.chatHistory.slice(0,-1),context:ctx,image});
    S.chatHistory.push({role:'assistant',content:reply});
    document.getElementById('chat-ld')?.remove();
    if(msgs){const a=document.createElement('div');a.className='msg-a';a.textContent=reply;msgs.appendChild(a);}
    if(actions?.length){await reload();render();}
  } catch(e) {
    document.getElementById('chat-ld')?.remove();
    const errMsg='Error de conexión.';
    S.chatHistory.push({role:'assistant',content:errMsg});
    if(msgs){const a=document.createElement('div');a.className='msg-a';a.textContent=errMsg;msgs.appendChild(a);}
  }
  scrollChat();
}

function handleFile(input) {
  const file=input.files[0]; if(!file) return; input.value='';
  const reader=new FileReader();
  reader.onload=e=>{
    S.pendingImage={data:e.target.result.split(',')[1],mediaType:file.type,name:file.name};
    const msgs=document.getElementById('chat-msgs');
    if(msgs){const el=document.createElement('div');el.className='msg-u';el.textContent=`📎 ${file.name} — escribe tu pregunta y envía`;msgs.appendChild(el);scrollChat();}
  };
  reader.readAsDataURL(file);
}

function scrollChat() {
  setTimeout(()=>{const el=document.getElementById('chat-msgs');if(el)el.scrollTop=el.scrollHeight;},60);
}

async function updateTxCat(id, category) {
  await dbSvc.updateTransactionCategory(id, category);
  const tx=S.transactions.find(t=>t.id===id);
  if(tx) tx.category=category;
}

function openBudgetEdit(cat,current){
  const m=document.createElement('div');m.className='overlay';m.id='modal';
  m.innerHTML='<div class="modal"><h3>Límite: '+cat+'</h3><p style="font-size:13px;color:var(--t2);margin-bottom:14px">Cuánto quieres gastar en <strong>'+cat+'</strong> al mes. La barra se pondrá roja si lo superas.</p><input class="fi" id="bv" type="number" inputmode="decimal" placeholder="Importe €" value="'+(current||'')+'"><div class="ma"><button class="btn btn-s" onclick="closeModal()">Cancelar</button>'+(current?'<button class="btn btn-s" onclick="deleteBudget(\''+cat+'\')" style="flex:0;padding:13px 14px;color:#DC2626">Borrar</button>':'')+'<button class="btn btn-p" onclick="saveBudgetVal(\''+cat+'\')">Guardar</button></div></div>';
  m.onclick=e=>{if(e.target===m)closeModal()};
  document.body.appendChild(m);
  setTimeout(()=>document.getElementById('bv')?.focus(),150);
}
async function saveBudgetVal(cat){
  const val=parseFloat(document.getElementById('bv')?.value);
  if(!isNaN(val)&&val>0){
    const existing=S.metrics.find(x=>x.key==='budget_'+cat);
    const data=await dbSvc.upsertBudget(cat, val, existing?.id);
    if(existing){existing.value=String(val);}
    else if(data){S.metrics.push(data);}
    S.budgets[cat]=val;
  }
  closeModal();render();
}
async function deleteBudget(cat){
  const existing=S.metrics.find(x=>x.key==='budget_'+cat);
  if(existing){
    await dbSvc.deleteMetric(existing.id);
    S.metrics=S.metrics.filter(x=>x.id!==existing.id);
  }
  delete S.budgets[cat];
  closeModal();render();
}

const catList=['Comida','Renta','Hogar','Transporte','Ocio','Ropa','Salud','Farmacia','Suplementos','Suscripciones','Seguro','Belleza','Amigas','Jaime','Familia','Viajes','Perú','Donaciones','Multas','Ahorro','Deuda','Transferencias','Rotación','Nómina','Otros'];

function openIngresoModal(month){
  const monthNames={jan:'Enero',feb:'Febrero',mar:'Marzo',apr:'Abril',may:'Mayo',jun:'Junio',jul:'Julio',aug:'Agosto',sep:'Septiembre',oct:'Octubre',nov:'Noviembre',dec:'Diciembre'};
  const d=new Date(month+'-15');
  const mName=d.toLocaleDateString('es-ES',{month:'long',year:'numeric'});
  const ingresos=S.transactions.filter(t=>t.date&&t.date.startsWith(month)&&(t.type==='income'||t.category==='Nómina')).sort((a,b)=>a.date>b.date?1:-1);
  const total=ingresos.reduce((s,t)=>s+parseFloat(t.amount||0),0);
  const rows=ingresos.length===0
    ?'<div style="text-align:center;padding:20px;color:var(--t2);font-size:13px">Sin ingresos este mes</div>'
    :ingresos.map(t=>`
      <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--border)">
        <div style="flex:1;min-width:0">
          <div style="font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.description}</div>
          <div style="font-size:11px;color:var(--t2)">${t.date}</div>
        </div>
        <span style="font-size:14px;font-weight:700;color:#0F6E56;white-space:nowrap">${parseFloat(t.amount).toFixed(2)}€</span>
        <button onclick="closeModal();openEditTx('${t.id}')" style="border:none;background:none;cursor:pointer;padding:4px;color:var(--t3);font-size:16px;line-height:1"><i class="ti ti-pencil"></i></button>
      </div>`).join('');
  const m=document.createElement('div');m.className='overlay';m.id='modal';
  m.innerHTML='<div class="modal">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'
    +'<h3 style="margin:0">Ingresos · '+mName+'</h3>'
    +'<span style="font-size:16px;font-weight:700;color:#0F6E56">'+total.toFixed(0)+'€</span>'
    +'</div>'
    +rows
    +'<button onclick="closeModal();openAddIngreso(\''+month+'\')" style="width:100%;margin-top:14px;padding:13px;background:var(--accent);color:white;border:none;border-radius:var(--r-sm);font-size:14px;font-weight:600;cursor:pointer">+ Añadir nómina / ingreso</button>'
    +'<button onclick="closeModal()" style="width:100%;margin-top:8px;padding:11px;background:none;color:var(--t2);border:1px solid var(--border);border-radius:var(--r-sm);font-size:13px;cursor:pointer">Cerrar</button>'
    +'</div>';
  m.onclick=e=>{if(e.target===m)closeModal()};
  document.body.appendChild(m);
}

function openAddIngreso(month){
  const d=new Date(month+'-15');
  const mName=d.toLocaleDateString('es-ES',{month:'long'});
  const mNameCap=mName.charAt(0).toUpperCase()+mName.slice(1);
  const defDate=month+'-28';
  const today=new Date().toISOString().slice(0,10);
  const finalDate=defDate<=today?defDate:today;
  const m=document.createElement('div');m.className='overlay';m.id='modal';
  m.innerHTML='<div class="modal">'
    +'<h3>Añadir ingreso · '+mNameCap+'</h3>'
    +'<label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px">Fecha</label>'
    +'<input class="fi" id="ai-date" type="date" value="'+finalDate+'">'
    +'<label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px;margin-top:12px">Concepto</label>'
    +'<input class="fi" id="ai-desc" type="text" value="Nómina '+mNameCap+'" placeholder="Nómina '+mNameCap+'">'
    +'<label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px;margin-top:12px">Importe €</label>'
    +'<input class="fi" id="ai-amt" type="number" inputmode="decimal" placeholder="0.00" min="0" step="0.01">'
    +'<label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px;margin-top:12px">Categoría</label>'
    +'<select class="fi" id="ai-cat"><option value="Nómina" selected>Nómina</option><option value="Otros">Otros ingresos</option><option value="Transferencias">Transferencia</option></select>'
    +'<label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px;margin-top:12px">Cuenta</label>'
    +'<select class="fi" id="ai-src"><option value="Revolut" selected>Revolut</option><option value="Sabadell">Sabadell</option></select>'
    +'<div class="ma" style="margin-top:16px">'
    +'<button class="btn btn-s" onclick="closeModal();openIngresoModal(\''+month+'\')">← Atrás</button>'
    +'<button class="btn btn-p" onclick="saveAddIngreso(\''+month+'\')">Guardar</button>'
    +'</div></div>';
  m.onclick=e=>{if(e.target===m)closeModal()};
  document.body.appendChild(m);
  setTimeout(()=>document.getElementById('ai-amt')?.focus(),150);
}

async function saveAddIngreso(month){
  const date=document.getElementById('ai-date')?.value;
  const desc=(document.getElementById('ai-desc')?.value||'').trim();
  const amt=parseFloat(document.getElementById('ai-amt')?.value);
  const cat=document.getElementById('ai-cat')?.value;
  const src=document.getElementById('ai-src')?.value;
  if(!date||!desc||isNaN(amt)||amt<=0){alert('Falta el importe');return;}
  closeModal();
  const{data,error}=await dbSvc.createTransaction({date,description:desc,amount:amt,type:'income',category:cat,source:src});
  if(!error&&data?.[0]){S.transactions=[...S.transactions,data[0]];}
  else{S.transactions=await dbSvc.getTransactionsYTD();}
  render();
  openIngresoModal(month);
}

function openAddTx(monthPrefix) {
  const today=new Date().toISOString().slice(0,10);
  const defDate=monthPrefix?(monthPrefix+'-'+today.slice(8,10)):today;
  const finalDate=defDate<=today?defDate:today;
  const catOpts=catList.map(c=>`<option value="${c}"${c==='Nómina'?' selected':''}>${c}</option>`).join('');
  const m=document.createElement('div');m.className='overlay';m.id='modal';
  m.innerHTML='<div class="modal"><h3>Nueva transacción</h3>'
    +'<label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px">Fecha</label>'
    +'<input class="fi" id="tx-date" type="date" value="'+finalDate+'">'
    +'<label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px;margin-top:10px">Descripción</label>'
    +'<input class="fi" id="tx-desc" type="text" placeholder="Ej: Nómina junio, Freelance...">'
    +'<label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px;margin-top:10px">Importe €</label>'
    +'<input class="fi" id="tx-amt" type="number" inputmode="decimal" placeholder="0.00" min="0" step="0.01">'
    +'<label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px;margin-top:10px">Tipo</label>'
    +'<select class="fi" id="tx-type" onchange="txTypeChanged()"><option value="income" selected>Ingreso</option><option value="expense">Gasto</option></select>'
    +'<label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px;margin-top:10px">Categoría</label>'
    +'<select class="fi" id="tx-cat">'+catOpts+'</select>'
    +'<label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px;margin-top:10px">Cuenta</label>'
    +'<select class="fi" id="tx-src"><option value="Revolut">Revolut</option><option value="Sabadell">Sabadell</option></select>'
    +'<div class="ma"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" onclick="saveNewTx()">Guardar</button></div></div>';
  m.onclick=e=>{if(e.target===m)closeModal()};
  document.body.appendChild(m);
  setTimeout(()=>document.getElementById('tx-desc')?.focus(),150);
}

function txTypeChanged(){
  const type=document.getElementById('tx-type')?.value;
  const cat=document.getElementById('tx-cat');
  if(!cat)return;
  cat.value=type==='income'?'Nómina':'Comida';
}

async function saveNewTx(){
  const date=document.getElementById('tx-date')?.value;
  const desc=(document.getElementById('tx-desc')?.value||'').trim();
  const amt=parseFloat(document.getElementById('tx-amt')?.value);
  const type=document.getElementById('tx-type')?.value;
  const cat=document.getElementById('tx-cat')?.value;
  const src=document.getElementById('tx-src')?.value;
  if(!date||!desc||isNaN(amt)||amt<=0){alert('Rellena todos los campos');return;}
  closeModal();
  const {data,error}=await dbSvc.createTransaction({date,description:desc,amount:amt,type,category:cat,source:src});
  if(!error&&data?.[0]){S.transactions=[...S.transactions,data[0]];}
  else{S.transactions=await dbSvc.getTransactionsYTD();}
  render();
}

function openEditTx(id){
  const t=S.transactions.find(x=>String(x.id)===String(id));
  if(!t)return;
  const catOpts=catList.map(c=>`<option value="${c}"${t.category===c?' selected':''}>${c}</option>`).join('');
  const m=document.createElement('div');m.className='overlay';m.id='modal';
  m.innerHTML='<div class="modal"><h3>Editar transacción</h3>'
    +'<label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px">Fecha</label>'
    +'<input class="fi" id="etx-date" type="date" value="'+t.date+'">'
    +'<label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px;margin-top:10px">Descripción</label>'
    +'<input class="fi" id="etx-desc" type="text" value="'+(t.description||'')+'">'
    +'<label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px;margin-top:10px">Importe €</label>'
    +'<input class="fi" id="etx-amt" type="number" inputmode="decimal" value="'+parseFloat(t.amount).toFixed(2)+'" min="0" step="0.01">'
    +'<label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px;margin-top:10px">Tipo</label>'
    +'<select class="fi" id="etx-type"><option value="income"'+(t.type==='income'?' selected':'')+'>Ingreso</option><option value="expense"'+(t.type==='expense'?' selected':'')+'>Gasto</option></select>'
    +'<label style="font-size:12px;color:var(--t2);display:block;margin-bottom:4px;margin-top:10px">Categoría</label>'
    +'<select class="fi" id="etx-cat">'+catOpts+'</select>'
    +'<div class="ma" style="flex-wrap:wrap;gap:8px">'
    +'<button class="btn btn-s" onclick="closeModal()">Cancelar</button>'
    +'<button class="btn btn-s" onclick="deleteTx(\''+id+'\')" style="flex:0;padding:13px 14px;color:#DC2626"><i class="ti ti-trash"></i></button>'
    +'<button class="btn btn-p" onclick="saveEditTx(\''+id+'\')">Guardar</button></div></div>';
  m.onclick=e=>{if(e.target===m)closeModal()};
  document.body.appendChild(m);
}

async function saveEditTx(id){
  const date=document.getElementById('etx-date')?.value;
  const desc=(document.getElementById('etx-desc')?.value||'').trim();
  const amt=parseFloat(document.getElementById('etx-amt')?.value);
  const type=document.getElementById('etx-type')?.value;
  const cat=document.getElementById('etx-cat')?.value;
  if(!date||!desc||isNaN(amt)||amt<=0){alert('Rellena todos los campos');return;}
  closeModal();
  await dbSvc.updateTransaction(id, {date,description:desc,amount:amt,type,category:cat});
  const tx=S.transactions.find(t=>String(t.id)===String(id));
  if(tx){tx.date=date;tx.description=desc;tx.amount=amt;tx.type=type;tx.category=cat;}
  render();
}

async function deleteTx(id){
  if(!confirm('¿Borrar esta transacción?'))return;
  closeModal();
  await dbSvc.deleteTransaction(id);
  S.transactions=S.transactions.filter(t=>String(t.id)!==String(id));
  render();
}

function finPrev() {
  const [yr,mo]=S.finMonth.split('-').map(Number);
  const d=new Date(yr,mo-2,1);
  S.finMonth=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
  S.finCat=null; render();
}

function finNext() {
  const [yr,mo]=S.finMonth.split('-').map(Number);
  const d=new Date(yr,mo,1);
  S.finMonth=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');
  S.finCat=null; render();
}

// ────── Project & Avanzar functions ──────────────────────────────────────────

function goProject(id) {
  if(!id) return;
  S.projectId=id; S.view='project';
  window.scrollTo(0,0); render();
}

function goAvanzar(ctxType, ctxId) {
  S.avanzarCtx=ctxId?{[ctxType]:ctxId}:null;
  S.view='avanzar';
  window.scrollTo(0,0); render();
}

function openProjectAdd() {
  const opts=S.areas.map(a=>`<option value="${a.id}">${a.name}</option>`).join('');
  const m=document.createElement('div'); m.className='overlay'; m.id='modal';
  m.innerHTML=`<div class="modal"><h3>Nuevo proyecto</h3>`
    +`<input class="fi" id="pj-title" placeholder="Nombre del proyecto" autocomplete="off">`
    +`<select class="fi" id="pj-area"><option value="">Sin área</option>${opts}</select>`
    +`<input class="fi" id="pj-next" placeholder="Primera acción (opcional)">`
    +`<textarea class="fi" id="pj-ctx" placeholder="Contexto para la IA (opcional)" rows="3" style="resize:vertical"></textarea>`
    +`<div class="ma"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" onclick="saveNewProject()">Crear</button></div></div>`;
  m.onclick=e=>{if(e.target===m)closeModal()};
  document.body.appendChild(m);
  setTimeout(()=>document.getElementById('pj-title')?.focus(),150);
}

async function saveNewProject() {
  const title=(document.getElementById('pj-title')?.value||'').trim();
  if(!title) return;
  const area_id=document.getElementById('pj-area')?.value||null;
  const next_action=document.getElementById('pj-next')?.value.trim()||null;
  const ia_context=document.getElementById('pj-ctx')?.value.trim()||null;
  closeModal();
  const data=await dbSvc.createProject({title,area_id,next_action,ia_context});
  if(data){S.projects.unshift(data);render();}
}

function openEditNextAction(projectId) {
  const p=S.projects.find(x=>x.id===projectId);
  const m=document.createElement('div'); m.className='overlay'; m.id='modal';
  m.innerHTML=`<div class="modal"><h3>Siguiente acción</h3>`
    +`<input class="fi" id="na-input" value="${p?.next_action||''}" placeholder="¿Cuál es el siguiente paso concreto?">`
    +`<div class="ma"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" onclick="saveNextAction('${projectId}')">Guardar</button></div></div>`;
  m.onclick=e=>{if(e.target===m)closeModal()};
  document.body.appendChild(m);
  setTimeout(()=>document.getElementById('na-input')?.focus(),150);
}

async function saveNextAction(projectId) {
  const val=(document.getElementById('na-input')?.value||'').trim();
  closeModal();
  await dbSvc.updateProject(projectId,{next_action:val||null,last_activity_at:new Date().toISOString()});
  const p=S.projects.find(x=>x.id===projectId);
  if(p){p.next_action=val||null;p.last_activity_at=new Date().toISOString();}
  render();
}

function openEditIAContext(projectId) {
  const p=S.projects.find(x=>x.id===projectId);
  const m=document.createElement('div'); m.className='overlay'; m.id='modal';
  m.innerHTML=`<div class="modal"><h3>Contexto IA del proyecto</h3>`
    +`<textarea class="fi" id="ctx-input" rows="5" placeholder="Qué debe saber la IA al trabajar en este proyecto">${p?.ia_context||''}</textarea>`
    +`<div class="ma"><button class="btn btn-s" onclick="closeModal()">Cancelar</button><button class="btn btn-p" onclick="saveIAContext('${projectId}')">Guardar</button></div></div>`;
  m.onclick=e=>{if(e.target===m)closeModal()};
  document.body.appendChild(m);
  setTimeout(()=>document.getElementById('ctx-input')?.focus(),150);
}

async function saveIAContext(projectId) {
  const val=(document.getElementById('ctx-input')?.value||'').trim();
  closeModal();
  await dbSvc.updateProject(projectId,{ia_context:val||null});
  const p=S.projects.find(x=>x.id===projectId);
  if(p) p.ia_context=val||null;
  render();
}

function openEventoForm(projectId) {
  S.projectId=projectId;
  go('resultado_ia');
}

async function saveEvento() {
  const projectId=document.getElementById('ev-project')?.value;
  const herramienta=document.getElementById('ev-tool')?.value;
  const resumen=(document.getElementById('ev-resumen')?.value||'').trim();
  const resultado_ubicacion=document.getElementById('ev-ubicacion')?.value;
  if(!resumen){alert('Escribe qué produjo la herramienta');return;}
  const data=await dbSvc.createEvento({project_id:projectId||null,origen:'ia',texto:resumen,herramienta,resumen,resultado_ubicacion});
  if(data) S.eventos.unshift(data);
  const p=S.projects.find(x=>x.id===projectId);
  if(p){
    const label=`${herramienta}: ${resumen}`;
    await dbSvc.updateProject(projectId,{ia_last_session:label,last_activity_at:new Date().toISOString()});
    p.ia_last_session=label; p.last_activity_at=new Date().toISOString();
  }
  goProject(projectId||S.projectId);
}

function openProjectMenu(projectId) {
  const p=S.projects.find(x=>x.id===projectId);
  if(!p) return;
  const m=document.createElement('div'); m.className='overlay'; m.id='modal';
  m.innerHTML=`<div class="modal"><h3 style="margin-bottom:10px">${p.title}</h3>`
    +`<button onclick="closeModal();openEditNextAction('${projectId}')" class="btn btn-s" style="width:100%;margin-bottom:6px;text-align:left">Actualizar próxima acción</button>`
    +`<button onclick="closeModal();openEditIAContext('${projectId}')" class="btn btn-s" style="width:100%;margin-bottom:6px;text-align:left">Editar contexto IA</button>`
    +(p.status==='active'?`<button onclick="closeModal();pauseProject('${projectId}')" class="btn btn-s" style="width:100%;margin-bottom:6px;text-align:left">Pausar proyecto</button>`:
      p.status==='paused'?`<button onclick="closeModal();resumeProject('${projectId}')" class="btn btn-s" style="width:100%;margin-bottom:6px;text-align:left">Reactivar proyecto</button>`:'')
    +`<button onclick="closeModal()" class="btn btn-s" style="width:100%">Cancelar</button></div>`;
  m.onclick=e=>{if(e.target===m)closeModal()};
  document.body.appendChild(m);
}

async function pauseProject(id) {
  await dbSvc.updateProject(id,{status:'paused'});
  const p=S.projects.find(x=>x.id===id);
  if(p) p.status='paused';
  render();
}

async function resumeProject(id) {
  await dbSvc.updateProject(id,{status:'active',last_activity_at:new Date().toISOString()});
  const p=S.projects.find(x=>x.id===id);
  if(p){p.status='active';p.last_activity_at=new Date().toISOString();}
  render();
}

let _selectedProposal=null;

function selectProposal(id) {
  _selectedProposal=id;
  document.querySelectorAll('[id^="ap_"]').forEach(el=>{el.style.borderColor='var(--border)';el.style.background='';});
  const sel=document.getElementById('ap_'+id);
  if(sel){sel.style.borderColor='var(--accent)';sel.style.background='rgba(83,74,183,0.07)';}
  const btn=document.getElementById('btn-empezar');
  if(btn) btn.style.display='block';
}

function empezarPropuesta() {
  if(!_selectedProposal) return;
  const id=_selectedProposal; _selectedProposal=null;
  if(id.startsWith('proj_ia_')||id.startsWith('proj_next_')) goProject(id.replace('proj_ia_','').replace('proj_next_',''));
  else if(id.startsWith('dec_')||id.startsWith('task_')) go('home');
}

// ─── Inventario VistaJet ─────────────────────────────────────────────────────

function invBack() {
  S._invLoaded = false;
  S.invSession = null;
  S.invItems = [];
  S.invChat = [];
  S.invSearch = '';
  S.invProposal = null;
  go('area', S.areaId);
}

let _invParsedItems = [];
let _invParsedFilename = '';
let _invParsedFile = null;
let _invParsedColumnMap = null;

async function invPreviewFile(input) {
  const file = input.files[0];
  if (!file) return;
  const preview = document.getElementById('inv-preview');
  if (preview) preview.textContent = 'Leyendo archivo…';
  try {
    const result = await invSvc.parseXlsx(file);
    _invParsedItems    = result.items;
    _invParsedFilename = file.name;
    _invParsedFile     = file;
    _invParsedColumnMap = result.columnMap;
    if (preview) preview.textContent = `✓ ${result.items.length} ítems encontrados en ${result.items.length > 0 ? [...new Set(result.items.map(i=>i.category))].length : 0} categorías. Hoja: ${result.sheetName}.`;
  } catch(e) {
    _invParsedItems = [];
    _invParsedFile  = null;
    if (preview) preview.textContent = '✗ Error al leer el archivo. Comprueba que es un .xlsx válido.';
  }
}

async function invCreateSession() {
  const reg = document.getElementById('inv-reg')?.value?.trim().toUpperCase();
  const type = document.getElementById('inv-type')?.value?.trim().toUpperCase() || 'CL350';
  const date = document.getElementById('inv-date')?.value;

  if (!reg) { alert('Introduce la matrícula'); return; }
  if (!_invParsedItems.length) { alert('Sube un archivo Excel válido primero'); return; }

  try {
    // Subir Excel original a Supabase Storage antes de crear la sesión
    if (_invParsedFile) {
      await invSvc.uploadTemplate(_invParsedFile, _invParsedFilename);
    }
    const sess = await invSvc.createSession({
      aircraft_registration: reg,
      aircraft_type: type,
      session_date: date,
      source_filename: _invParsedFilename,
      column_map: _invParsedColumnMap,
    });
    await invSvc.bulkInsertItems(sess.id, _invParsedItems);
    S.invSession = sess;
    S.invItems = await invSvc.loadSessionItems(sess.id);
    S.invChat = [];
    S.invSearch = '';
    S.invChatLoading = false;
    S._invLoaded = true;
    _invParsedItems    = [];
    _invParsedFile     = null;
    _invParsedColumnMap = null;
    render();
  } catch(e) {
    alert('Error creando sesión: ' + e.message);
  }
}

// Fallback = producción: el build desplegado no tiene .env.local, y un fallback
// a localhost rompe la app en móvil ("Load failed"). Para dev local, define
// VITE_ISABEL_API_URL=http://localhost:3002 en .env.local.
const ISABEL_API = import.meta.env.VITE_ISABEL_API_URL || 'https://isabel-api-production.up.railway.app';
const ISABEL_KEY = import.meta.env.VITE_ISABEL_KEY || 'isabel-api-2026';

async function isabelPost(path, body) {
  const res = await fetch(ISABEL_API + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': ISABEL_KEY },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Isabel API ${res.status}`);
  return res.json();
}

async function invSendMessage() {
  const input = document.getElementById('inv-chat-input');
  const msg = input?.value?.trim();
  if (!msg || !S.invSession || S.invChatLoading) return;
  if (input) input.value = '';

  S.invProposal = null;
  S.invChat.push({ id: 'u_' + Date.now(), role: 'user', content: msg, created_at: new Date().toISOString() });
  S.invChatLoading = true;
  render();
  setTimeout(()=>{ const el=document.getElementById('inv-chat-msgs'); if(el) el.scrollTop=el.scrollHeight; }, 50);

  try {
    const data = await isabelPost('/v1/message', { message: msg, client: 'lifeos' });
    S.invChat.push({ id: 'a_' + Date.now(), role: 'assistant', content: data.message, created_at: new Date().toISOString() });
    if (data.requires_confirmation && data.proposal_id) {
      S.invProposal = { id: data.proposal_id, summary: data.message };
    }
  } catch (e) {
    S.invChat.push({ id: 'err_' + Date.now(), role: 'assistant', content: 'Error conectando con Isabel API. Verifica que el servicio esté activo.', created_at: new Date().toISOString() });
  }

  S.invChatLoading = false;
  render();
  setTimeout(()=>{ const el=document.getElementById('inv-chat-msgs'); if(el) el.scrollTop=el.scrollHeight; }, 50);
}

async function invConfirm() {
  if (!S.invProposal || !S.invSession) return;
  const proposal_id = S.invProposal.id;
  S.invProposal = null;
  S.invChatLoading = true;
  render();

  try {
    const data = await isabelPost('/v1/confirm', { proposal_id });
    S.invChat.push({ id: 'a_' + Date.now(), role: 'assistant', content: data.message, created_at: new Date().toISOString() });
    // Refrescar ítems para que los stats se actualicen
    S.invItems = await invSvc.loadSessionItems(S.invSession.id);
  } catch (e) {
    S.invChat.push({ id: 'err_' + Date.now(), role: 'assistant', content: 'Error al confirmar. Inténtalo de nuevo.', created_at: new Date().toISOString() });
  }

  S.invChatLoading = false;
  render();
  setTimeout(()=>{ const el=document.getElementById('inv-chat-msgs'); if(el) el.scrollTop=el.scrollHeight; }, 50);
}

function invSetSearch(val) {
  S.invSearch = val;
  render();
}

async function invCloseSession() {
  if (!S.invSession) return;
  if (!confirm('¿Cerrar esta sesión de inventario? No se puede reabrir.')) return;
  await invSvc.closeSession(S.invSession.id);
  S._invLoaded = false;
  S.invSession = null;
  S.invItems = [];
  S.invChat = [];
  S.invSearch = '';
  render();
}

// Expose functions to global scope for inline onclick handlers (required in ES module context)
Object.assign(window, {
  showPin, pinPress,
  go, toggleMode, openAdd, openChat, closeChat, sendMsg, handleFile,
  done, closeModal,
  checkinSueno, checkinDolor, checkinVJ, completeCheckin,
  saveVjState, openVjState, saveVjStateForm,
  openAddVjTask, saveVjTask, toggleVjTask, deleteVjTask, clearDoneVjTasks,
  selectVjBag, toggleVjBagItem, resetVjBag,
  setSueno, resetCannabis, regSesion, updateDolor,
  addTask,
  updateTxCat, openBudgetEdit, saveBudgetVal, deleteBudget,
  openIngresoModal, openAddIngreso, saveAddIngreso,
  openAddTx, txTypeChanged, saveNewTx,
  openEditTx, saveEditTx, deleteTx,
  finPrev, finNext,
  goProject, goAvanzar,
  openProjectAdd, saveNewProject,
  openEditNextAction, saveNextAction,
  openEditIAContext, saveIAContext,
  openEventoForm, saveEvento,
  openProjectMenu, pauseProject, resumeProject,
  selectProposal, empezarPropuesta,
  setVjTab, toggleHotoCheck, resetHotoChecks, updateLaundryItem, resetLaundry,
  invBack, invPreviewFile, invCreateSession, invSendMessage, invConfirm, invSetSearch, invCloseSession, invExport,
  hotoBack, hotoCreate, hotoField, hotoAddItem, hotoDelItem, hotoExport,
  hotoCareToggle, hotoCareToday, hotoCareUnknown, hotoCareDate, hotoCareNote,
  hotoShopToggle, hotoShopSet,
});

window.addEventListener('load', showPin);
