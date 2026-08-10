function formatDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ''))) return null;
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export function financeStateSummary(model, month) {
  if (!model || model.month !== month) {
    return { state: 'loading', headline: 'Actualizando estado financiero', detail: null };
  }
  if (model.error || model.ok === false) {
    return { state: 'unavailable', headline: 'Estado financiero no disponible', detail: 'Las transacciones existentes no se interpretan como cero.' };
  }

  const signal = Array.isArray(model.signals) ? model.signals[0] : null;
  if (signal?.type === 'budget_exceeded') {
    return {
      state: 'attention',
      headline: `Presupuesto superado: ${signal.evidence.category}`,
      detail: signal.reason || null,
    };
  }
  if (signal?.type === 'budget_near_limit') {
    return {
      state: 'attention',
      headline: `Presupuesto próximo al límite: ${signal.evidence.category}`,
      detail: signal.reason || null,
    };
  }

  const count = Number(model.coverage?.transaction_count) || 0;
  const latestInMonth = formatDate(model.coverage?.latest_date);
  const latestAvailable = formatDate(model.coverage?.latest_available_date);
  if (count > 0) {
    return {
      state: 'current',
      headline: `${count} movimiento${count === 1 ? '' : 's'} verificado${count === 1 ? '' : 's'} este mes`,
      detail: latestInMonth ? `Datos del mes hasta ${latestInMonth}.` : null,
    };
  }
  if (latestAvailable) {
    return {
      state: 'stale',
      headline: 'Sin movimientos verificados este mes',
      detail: `El último movimiento disponible es del ${latestAvailable}.`,
    };
  }
  return { state: 'empty', headline: 'Sin movimientos financieros registrados', detail: null };
}
