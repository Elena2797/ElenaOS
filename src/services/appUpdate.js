// Actualización de la app instalada.
//
// La PWA (vite-plugin-pwa, autoUpdate) solo buscaba versión nueva al abrirse
// desde cero. En el móvil la app casi siempre vuelve de segundo plano, así que
// seguía enseñando la versión vieja: el 2026-09-21 ella no veía el cambio de
// D55, ya publicado. Ahora, al volver a la app, se le pide al service worker
// que compruebe; si hay versión nueva se activa sola (skipWaiting +
// clientsClaim) y aquí se recarga una vez. El PIN no se vuelve a pedir: vive
// en sessionStorage, que sobrevive a la recarga.
export function watchAppUpdates({ serviceWorker, doc, reload }) {
  if (!serviceWorker || !doc) return false;

  // La primera instalación también cambia de controlador (de ninguno al
  // service worker). Eso no es una versión nueva y no debe recargar.
  let hadController = Boolean(serviceWorker.controller);
  let reloading = false;

  serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController) { hadController = true; return; }
    if (reloading) return;
    reloading = true;
    reload();
  });

  doc.addEventListener('visibilitychange', () => {
    if (doc.visibilityState !== 'visible') return;
    Promise.resolve(serviceWorker.getRegistration?.())
      .then((reg) => reg && reg.update())
      .catch(() => {});
  });

  return true;
}
