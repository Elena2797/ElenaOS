// inventoryProvisional.js (app) — lo puro del inventario provisional: cómo se reconoce y qué se le dice a Estefanía.
// El trabajo de verdad (clonar el estándar, integrar lo contado) lo hace isabel-api: core/inventoryProvisional.js.

/** ¿Esta sesión es un inventario PROVISIONAL (sin Excel oficial todavía)? */
export function isProvisional(session) {
  return !!(session && session.column_map && session.column_map.provisional);
}

/** De dónde se copió el estándar (matrícula), si se sabe. */
export function provisionalFrom(session) {
  return isProvisional(session) ? (session.column_map.provisional.from_tail || null) : null;
}

/** Respuesta de POST /v1/app/inventory/provisional → { ok, message }. `ok` también cuando ya había uno abierto. */
export function startResult(r) {
  if (r && (r.ok || r.error === 'already_open')) return { ok: true, message: '' };
  const why = {
    no_catalog: 'No hay ningún inventario anterior del que copiar el estándar: sube el Excel.',
    no_aircraft: 'No tienes avión asignado todavía.',
    not_linked: 'Conecta la app con Isabel para crear el inventario provisional.',
  }[r && r.error];
  return { ok: false, message: why || 'No se pudo crear ahora mismo. Prueba otra vez.' };
}

/** Respuesta de POST /v1/app/inventory/integrate → texto para el aviso tras subir el Excel oficial. */
export function integrationMessage(r) {
  if (!r || !r.ok) return 'El inventario oficial se creó, pero no pude integrar lo que contaste en el provisional. Sigue abierto: díselo a Isabel.';
  const n = r.integrated || 0;
  const un = (r.unmatched || []).map((u) => u.description).filter(Boolean);
  let t = `Inventario oficial listo. Integré ${n} ${n === 1 ? 'ítem' : 'ítems'} que ya habías contado.`;
  if (un.length) t += ` No los encontré en el oficial: ${un.slice(0, 8).join(', ')}${un.length > 8 ? '…' : ''}.`;
  return t;
}

/** Tras importar el PDF oficial sobre un HOTO provisional: qué pasó (lo suyo manda; el PDF rellenó lo vacío). Null si no aplica. */
export function hotoIntegrationMessage(provisional) {
  if (!provisional || !provisional.integrated) return null;
  const kept = provisional.kept || [];
  let t = 'HOTO oficial listo. Mantuve lo que ya tenías puesto y el PDF rellenó solo lo que estaba vacío.';
  if (kept.length) t += ` En ${kept.length} ${kept.length === 1 ? 'cosa era distinto' : 'cosas eran distintas'} y me quedé con lo tuyo: ${kept.slice(0, 6).join('; ')}${kept.length > 6 ? '…' : ''}.`;
  return t;
}
