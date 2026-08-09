const ACTIVE_GOAL_STATUSES = new Set(['ACTIVE', 'BLOCKED', 'PAUSED']);

export function buildKnowledgeHomeModel(now = {}) {
  const actions = Array.isArray(now.next_actions) ? now.next_actions : [];
  const nextAction = now.next_best_action || actions[0] || null;
  return {
    available: now.knowledge_status?.available === true,
    next_action: nextAction ? {
      id: nextAction.id,
      title: nextAction.title,
      domain: nextAction.domain,
      reason: nextAction.reason,
      evidence: evidenceRows(nextAction.evidence),
      blocked: nextAction.blocked === true,
      priority_basis: nextAction.priority_basis || [],
      status: nextAction.status || 'PROPOSED',
    } : null,
    goals: (now.goals || []).filter(goal => ACTIVE_GOAL_STATUSES.has(goal.status)).slice(0, 4).map(goal => ({
      id: goal.entity_id, title: goal.title, domain: goal.domain, status: goal.status,
      success_criteria: goal.success_criteria || null, target_date: goal.target_date || null,
      last_reason: goal.status_history?.at(-1)?.reason || null,
    })),
    recent_changes: (now.recent_changes || []).slice(0, 5).map(change => ({
      id: change.id, summary: change.summary, domain: change.domain, kind: change.kind, occurred_at: change.occurred_at,
    })),
  };
}

export function actionFeedbackPayload(actionId, status, outcome = null) {
  return { action_id: actionId, status, outcome, source_surface: 'lifeos_home' };
}

export function evidenceRows(evidence) {
  if (!evidence || typeof evidence !== 'object') return [];
  return Object.entries(evidence)
    .filter(([, value]) => value !== null && value !== undefined && typeof value !== 'object')
    .map(([label, value]) => ({ label, value: String(value) }));
}

export function renderKnowledgeCockpit(model) {
  if (!model?.available) return '';
  const action = model.next_action;
  const actionCard = action ? `
    <section class="knowledge-card knowledge-next" data-action-id="${esc(action.id)}">
      <div class="knowledge-eyebrow">Próxima mejor acción</div>
      <h3>${esc(action.title)}</h3>
      <p>${esc(action.reason)}</p>
      ${action.evidence.length ? `<dl>${action.evidence.map(row => `<div><dt>${esc(row.label)}</dt><dd>${esc(row.value)}</dd></div>`).join('')}</dl>` : ''}
      <div class="knowledge-feedback" aria-label="¿Te sirvió esta recomendación?">
        <button data-feedback="ACCEPTED">Me sirve</button>
        <button data-feedback="COMPLETED">Hecho</button>
        <button data-feedback="REJECTED">No me sirve</button>
      </div>
    </section>` : '';
  const goals = model.goals.length ? `
    <section class="knowledge-card"><div class="knowledge-eyebrow">Objetivos relevantes</div>
      ${model.goals.map(goal => `<div class="knowledge-row"><strong>${esc(goal.title)}</strong><span>${goalStatusLabel(goal.status)}</span>${goal.last_reason ? `<small>${esc(goal.last_reason)}</small>` : ''}</div>`).join('')}
    </section>` : '';
  const recent = model.recent_changes.length ? `
    <section class="knowledge-card"><div class="knowledge-eyebrow">Cambios recientes</div>
      ${model.recent_changes.map(change => `<div class="knowledge-row"><strong>${esc(change.summary)}</strong>${change.domain ? `<small>${esc(change.domain)}</small>` : ''}</div>`).join('')}
    </section>` : '';
  return actionCard + goals + recent;
}

function goalStatusLabel(status) {
  return { ACTIVE: 'Activo', BLOCKED: 'Bloqueado', PAUSED: 'En pausa' }[status] || status;
}

function esc(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
