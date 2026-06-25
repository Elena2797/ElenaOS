export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { message, history = [], image, context } = req.body;

  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  const h = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };

  // Fetch current state from Supabase
  const [ctx, areas, tasks, metrics, operators, wf] = await Promise.all([
    fetch(`${SUPABASE_URL}/rest/v1/life_context?select=*&order=created_at.desc&limit=1`, { headers: h }).then(r => r.json()),
    fetch(`${SUPABASE_URL}/rest/v1/areas?select=*&order=sort_order`, { headers: h }).then(r => r.json()),
    fetch(`${SUPABASE_URL}/rest/v1/tasks?select=*,areas(name,color)&status=neq.done`, { headers: h }).then(r => r.json()),
    fetch(`${SUPABASE_URL}/rest/v1/metrics?select=*`, { headers: h }).then(r => r.json()),
    fetch(`${SUPABASE_URL}/rest/v1/operators?select=*`, { headers: h }).then(r => r.json()),
    fetch(`${SUPABASE_URL}/rest/v1/waiting_for?select=*&status=eq.active`, { headers: h }).then(r => r.json()),
  ]);

  const mode = ctx[0]?.mode || 'OFF';
  const today = new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const systemPrompt = `Eres Isabel, la asistente personal de Estefanía dentro de su Life OS.
Tienes acceso total a su sistema y puedes editar datos en tiempo real.

ESTADO ACTUAL:
- Fecha: ${today}
- Modo: ${mode} (${mode === 'ON' ? 'De servicio en VistaJet — energía limitada, solo lo urgente' : 'OFF duty — construcción, JETMI, salud, personal'})

ÁREAS (${areas.length}):
${areas.map(a => `- ${a.name}`).join('\n')}

TAREAS PENDIENTES (${tasks.length}):
${tasks.map(t => `- [${t.id}] ${t.title} | área: ${t.areas?.name || 'sin área'} | prioridad: ${t.priority || 'medium'}`).join('\n') || '(ninguna)'}

ESPERANDO RESPUESTA (${wf.length}):
${wf.map(w => `- ${w.title} → ${w.waiting_on}`).join('\n') || '(ninguno)'}

MÉTRICAS:
${metrics.map(m => `- ${m.label}: ${m.value} ${m.unit || ''}${m.target ? ` (objetivo: ${m.target})` : ''}`).join('\n') || '(ninguna)'}

OPERADORES JETMI:
${operators.map(o => `- ${o.name}: ${o.status} | comisión: ${o.commission || '—'}${o.notes ? ' | ' + o.notes : ''}`).join('\n') || '(ninguno)'}

ACCIONES QUE PUEDES EJECUTAR:
Incluye estos comandos al final de tu respuesta cuando necesites modificar datos. El sistema los ejecutará automáticamente.

[ACTION:ADD_TASK:{"title":"texto","area_name":"nombre exacto del área","priority":"medium"}]
[ACTION:COMPLETE_TASK:{"title":"título o parte del título"}]
[ACTION:UPDATE_METRIC:{"key":"clave_metrica","value":"nuevo valor","area_name":"nombre área"}]
[ACTION:CHANGE_MODE:{"mode":"ON"}]
[ACTION:ADD_WAITING:{"title":"qué esperas","waiting_on":"de quién"}]
[ACTION:ADD_OPERATOR:{"name":"nombre","status":"identified","commission":"","notes":""}]

PANTALLA ACTUAL: ${context || 'general'}

INSTRUCCIONES:
- Responde siempre en español, de forma concisa y directa
- Cuando te pidan añadir una tarea, hazlo con ACTION:ADD_TASK inmediatamente
- Cuando confirmen que algo está hecho, usa ACTION:COMPLETE_TASK
- Eres su aliada, no un asistente genérico — conoces su vida, su negocio, su salud
- Si hay algo urgente (renta ogasun.eus vence el 30 de junio), recuérdalo
- No uses asteriscos para negrita, escribe texto plano
- NUNCA digas que eres un modelo de IA, que te creó Anthropic, o que eres Claude. Eres Isabel, la asistente personal de Estefanía. Si te preguntan quién eres, di únicamente: "Soy Isabel, tu asistente personal en Life OS."`;

  const userContent = image
    ? image.mediaType === 'application/pdf'
      ? [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: image.data } },
          { type: 'text', text: message || 'Analiza este documento en el contexto de mi Life OS' }
        ]
      : [
          { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.data } },
          { type: 'text', text: message || 'Analiza esta imagen en el contexto de mi Life OS' }
        ]
    : message;

  const messages = [
    ...history.slice(-10).map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: userContent }
  ];

  // Call Claude
  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages
    })
  });

  const claudeData = await claudeRes.json();
  let reply = claudeData.content?.[0]?.text || 'No pude procesar el mensaje.';

  // Parse and execute actions
  const actions = [];
  const actionRegex = /\[ACTION:(\w+):(.*?)\]/gs;
  let match;
  while ((match = actionRegex.exec(reply)) !== null) {
    try {
      const params = JSON.parse(match[2]);
      actions.push({ type: match[1], params });
      reply = reply.replace(match[0], '').trim();
    } catch (e) {}
  }

  for (const { type, params } of actions) {
    try {
      if (type === 'ADD_TASK') {
        const titleNorm = params.title.toLowerCase().trim();
        const exists = tasks.find(t => t.title.toLowerCase().trim() === titleNorm);
        if (exists) { console.log('ADD_TASK skipped — ya existe:', params.title); continue; }
        const area = areas.find(a => a.name === params.area_name);
        await fetch(`${SUPABASE_URL}/rest/v1/tasks`, {
          method: 'POST',
          headers: { ...h, 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            title: params.title,
            area_id: area?.id || null,
            priority: params.priority || 'medium',
            suitable_modes: ['ON', 'OFF'],
            horizon: params.priority === 'critical' ? 'today' : 'this_week'
          })
        });
      } else if (type === 'COMPLETE_TASK') {
        const task = tasks.find(t =>
          t.title.toLowerCase().includes(params.title.toLowerCase()) ||
          t.id === params.title
        );
        if (task) {
          await fetch(`${SUPABASE_URL}/rest/v1/tasks?id=eq.${task.id}`, {
            method: 'PATCH',
            headers: { ...h, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ status: 'done', completed_at: new Date().toISOString() })
          });
        }
      } else if (type === 'UPDATE_METRIC') {
        const area = areas.find(a => a.name === params.area_name);
        const metric = metrics.find(m => {
          const keyMatch = m.key && m.key === params.key;
          const labelMatch = m.label && m.label.toLowerCase() === (params.key || '').toLowerCase();
          const areaMatch = !area || m.area_id === area?.id;
          return (keyMatch || labelMatch) && areaMatch;
        });
        if (metric) {
          await fetch(`${SUPABASE_URL}/rest/v1/metrics?id=eq.${metric.id}`, {
            method: 'PATCH',
            headers: { ...h, 'Prefer': 'return=minimal' },
            body: JSON.stringify({ value: String(params.value), updated_at: new Date().toISOString() })
          });
        }
      } else if (type === 'CHANGE_MODE') {
        await fetch(`${SUPABASE_URL}/rest/v1/life_context`, {
          method: 'POST',
          headers: { ...h, 'Prefer': 'return=minimal' },
          body: JSON.stringify({ mode: params.mode })
        });
      } else if (type === 'ADD_WAITING') {
        await fetch(`${SUPABASE_URL}/rest/v1/waiting_for`, {
          method: 'POST',
          headers: { ...h, 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            title: params.title,
            waiting_on: params.waiting_on,
            status: 'active'
          })
        });
      } else if (type === 'ADD_OPERATOR') {
        const opExists = operators.find(o => o.name.toLowerCase() === params.name.toLowerCase());
        if (opExists) { console.log('ADD_OPERATOR skipped — ya existe:', params.name); continue; }
        await fetch(`${SUPABASE_URL}/rest/v1/operators`, {
          method: 'POST',
          headers: { ...h, 'Prefer': 'return=minimal' },
          body: JSON.stringify({
            name: params.name,
            status: params.status || 'identified',
            commission: params.commission || '',
            notes: params.notes || ''
          })
        });
      }
    } catch (e) {
      console.error('Action error:', type, e);
    }
  }

  res.json({ reply, actions });
}
