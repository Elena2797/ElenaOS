// model.js — definiciones del dominio HOTO (cliente). FUENTE ÚNICA.
//
// Antes estaban sueltas dentro de main.js. Se centralizan aquí para que exista
// un solo sitio donde vive el modelo del HOTO en el frontend.
//
// ── CONTRATO CON EL SERVIDOR (acoplamiento cross-repo) ───────────────────────
// Estas listas tienen un contrato con isabel-api/src/hoto/fieldMap.js, que es
// quien mapea cada dato a su casilla del PDF oficial:
//   • SHOPPING_ITEMS[*].key  DEBE coincidir con SHOPPING_FIELDS[*].key del servidor.
//     Si una key no coincide, el dato se guarda pero NUNCA llega al PDF (bug mudo).
//   • El ORDEN de CABIN_CARE_LABELS DEBE coincidir con el de CABIN_CARE_DATE_FIELDS
//     del servidor: el índice i significa la misma fila del PDF en ambos lados.
//   • SHOPPING_ITEMS[*].opts DEBE coincidir con SHOPPING_FIELDS[*].options.
// Si cambias cualquiera de estas aquí, cámbiala también allí. (La unión física
// en una sola fuente cross-repo queda para una fase posterior: endpoint de schema.)

// Secciones e items EXACTOS del PDF oficial "Handover / Takeover Checklist".
// No inventar items: este checklist replica el documento real.
export const HOTO_SECTIONS = [
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

// Cabin Care "Date last done" — 17 filas del PDF oficial, en el MISMO orden que
// los campos de fecha del formulario. El índice i corresponde a cabin_care[i] del
// registro HOTO y a la fila i del PDF (ver CONTRATO arriba).
export const CABIN_CARE_LABELS = [
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

// Aircraft Shopping — los items reales de la página 2 del PDF oficial.
// opts = opciones del dropdown oficial (null = campo de texto libre en el PDF).
// inv  = palabras clave para buscar el item en Inventario (solo lectura, referencia).
// key/opts tienen CONTRATO con SHOPPING_FIELDS del servidor (ver arriba).
// Magazines NO está aquí: es una sección propia (shopping.magazines_list).
export const SHOPPING_ITEMS = [
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
];

// Estados de una revista (sección Magazines).
export const MAG_STATUS = {
  up_to_date:{label:'Up to date',color:'#0F6E56'},
  needs_renewal:{label:'Needs renewal',color:'#B87A00'},
  missing:{label:'Missing',color:'#A33636'},
};
