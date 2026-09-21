// Revalidación barata entre superficies. Telegram y LIFEOS escriben en las
// mismas fuentes persistentes; al volver a una app ya abierta solo hay que
// volver a leer datos. No hay polling y este servicio no llama a ningún modelo.
//
// Desde D50 también se vuelve a pedir la prioridad de Home: sin eso, lo que
// ella acababa de contarle a Isabel cambiaba las listas pero no la tarjeta de
// prioridad, que se quedaba con la evaluación de cuando abrió la app. El Core
// reutiliza su última respuesta si el contexto no cambió, así que volver sin
// novedades no paga otra llamada al modelo.

export function createSurfaceRevalidator({
  isReady = () => true,
  refreshActiveDomain = async () => {},
  reloadPrimaryState,
  refreshPendingQuestions = async () => {},
  refreshGymState = async () => {},
  refreshSleepState = async () => {},
  refreshFinanceState = async () => {},
  refreshReminders = async () => {},
  refreshHabits = async () => {},
  refreshPriority = async () => {},
  render = () => {},
  now = () => Date.now(),
  minIntervalMs = 2000,
} = {}) {
  if (typeof reloadPrimaryState !== 'function') {
    throw new TypeError('reloadPrimaryState is required');
  }

  let inFlight = null;
  let lastStartedAt = Number.NEGATIVE_INFINITY;

  async function run(reason) {
    // El contexto de una pantalla con identidad propia (hoy VistaJet) se
    // refresca antes del load global para que pueda comparar entidad vieja y
    // nueva e invalidar sus caches correlacionadas.
    const domain = await Promise.allSettled([refreshActiveDomain()]);
    const primary = await Promise.allSettled([
      reloadPrimaryState(),
      refreshPendingQuestions(),
      refreshGymState(),
      refreshSleepState(),
      refreshFinanceState(),
      refreshReminders(),
      refreshPriority(),
      refreshHabits(),
    ]);
    render();
    return {
      status: 'revalidated',
      reason,
      sources: {
        active_domain: domain[0].status,
        primary_state: primary[0].status,
        pending_questions: primary[1].status,
        gym_state: primary[2].status,
        sleep_state: primary[3].status,
        finance_state: primary[4].status,
        reminders: primary[5].status,
        priority: primary[6].status,
        habits: primary[7].status,
      },
    };
  }

  function revalidate({ force = false, reason = 'surface_return' } = {}) {
    if (!isReady()) return Promise.resolve({ status: 'not_ready', reason });
    if (inFlight) return inFlight;

    const startedAt = now();
    if (!force && startedAt - lastStartedAt < minIntervalMs) {
      return Promise.resolve({ status: 'throttled', reason });
    }
    lastStartedAt = startedAt;
    inFlight = run(reason).finally(() => { inFlight = null; });
    return inFlight;
  }

  return { revalidate };
}

export function shouldRevalidateVisibility(visibilityState) {
  return visibilityState === 'visible';
}
