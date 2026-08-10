// Revalidación barata entre superficies. Telegram y LIFEOS escriben en las
// mismas fuentes persistentes; al volver a una app ya abierta solo hay que
// volver a leer datos. No hay polling y este servicio nunca llama a /v1/now ni
// a ningún modelo.

export function createSurfaceRevalidator({
  isReady = () => true,
  refreshActiveDomain = async () => {},
  reloadPrimaryState,
  refreshPendingQuestions = async () => {},
  refreshGymState = async () => {},
  refreshSleepState = async () => {},
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
