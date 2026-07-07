// isabel.js — único punto de contacto con el bridge de Isabel
// main.js no sabe nada sobre URLs, puertos ni tokens.

const DEFAULT_TOKEN = 'isabel-bridge-2026';
const UNAVAILABLE_MSG = 'Isabel no está conectada. Abre "Arrancar Isabel.bat" en el escritorio.';

let _storedUrlGetter = null;

export function setUrlGetter(fn) {
  _storedUrlGetter = fn;
}

function resolveUrl() {
  const stored = _storedUrlGetter ? _storedUrlGetter() : '';
  return localStorage.getItem('agent_url') || stored || '';
}

function resolveToken() {
  return localStorage.getItem('agent_token') || DEFAULT_TOKEN;
}

export function getAgentUrl() {
  return resolveUrl();
}

export function isAvailable() {
  return !!resolveUrl();
}

export async function sendMessage({ message, history, context, image }) {
  const url = resolveUrl();
  if (!url) return { reply: UNAVAILABLE_MSG, available: false };

  const token = resolveToken();
  const body = { message, history, context };
  if (image) body.image = image;

  const res = await fetch(url + '/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return { reply: data.reply, actions: data.actions, available: true };
}
