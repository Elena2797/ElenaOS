# src/ — estructura del proyecto

## Archivos

| Archivo | Qué vive aquí |
|---------|---------------|
| `main.js` | Estado global (`S`), render de la UI, handlers de eventos, lógica de navegación. No habla directamente con Supabase ni con Isabel. |
| `main.css` | Todos los estilos. Variables CSS globales, layout, componentes visuales. |
| `config.js` | Lee variables de entorno (`import.meta.env`). Exporta constantes: `SUPABASE_URL`, `SUPABASE_ANON_KEY`. |
| `services/db.js` | Único punto de acceso a Supabase. 19 funciones con nombre orientado a intención. Ningún otro módulo llama a `.from()` directamente. |
| `services/isabel.js` | Único punto de contacto con el bridge de Isabel. Resuelve URL y token, expone `sendMessage`, `isAvailable`, `getAgentUrl`. |

## Arrancar en local

```bash
cp .env.example .env.local   # rellenar con las claves reales
npm install
npm run dev                  # http://localhost:5173
```

## Build de producción

```bash
npm run build   # genera dist/
```

## Variables de entorno necesarias

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

En Vercel: Settings → Environment Variables.

## Reglas de arquitectura

- La UI no habla directamente con Supabase. Todo pasa por `services/db.js`.
- La UI no habla directamente con el bridge de Isabel. Todo pasa por `services/isabel.js`.
- Toda nueva integración externa → nuevo archivo en `services/`.
- Toda nueva configuración o clave → `config.js` + `.env.local`.
