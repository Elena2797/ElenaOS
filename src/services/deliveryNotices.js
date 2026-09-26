// deliveryNotices.js — avisos "para repasar" del Copiloto de entrega que NO cuentan en la confianza.
// Las reglas del Copiloto (readiness.js) están congeladas: evalúa solo lo que depende de ella y con evidencia. Estos avisos
// son informativos, como "Por comprar": enseñan lo que otros módulos saben (notas pre-HOTO, Fresh Items sin contar) sin
// tocar el veredicto. Función pura: entra lo que ya tiene la app cargado, sale un módulo { name, lines } o null.

export function reviewNotices({ preHotoNotes, fresh } = {}) {
  const lines = [];
  const notes = Array.isArray(preHotoNotes) ? preHotoNotes : [];
  if (notes.length) {
    lines.push({ level: 'warn', text: `${notes.length} ${notes.length === 1 ? 'nota provisional sin resolver' : 'notas provisionales sin resolver'} (pestaña Entrega del HOTO)` });
  }
  const uncounted = fresh && fresh.ok && Array.isArray(fresh.items)
    ? fresh.items.filter((i) => i.in_inventory && i.counted === false).map((i) => i.label)
    : [];
  if (uncounted.length) lines.push({ level: 'warn', text: `Fresh Items sin contar de verdad: ${uncounted.join(', ')}` });
  return lines.length ? { name: 'Para repasar (no baja la confianza)', lines } : null;
}
