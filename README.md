# ⚽ Armar Equipos

App mobile-first para armar 2 equipos de fútbol desde una lista de WhatsApp.

## Funcionalidades

- Parsea listas de WhatsApp (numeradas, con bullets, guiones, etc.)
- Reparte jugadores aleatoriamente en Equipo A y Equipo B
- Drag & drop para mover jugadores entre equipos (funciona en móvil)
- Exporta PNG de los equipos para compartir en WhatsApp
- Toggle opcional para recordar la lista en el dispositivo (localStorage)

## Correr en local

```bash
npm install
npm run dev
```

## Deploy en GitHub Pages

1. Crear el repo en GitHub.
2. Ir a **Settings → Pages → Source → GitHub Actions**.
3. Hacer push a `main`. El workflow `.github/workflows/deploy.yml` buildea y despliega automáticamente.

> La URL será: `https://<usuario>.github.io/<nombre-del-repo>/`

## Permisos Clipboard en iOS

En iOS Safari, `navigator.clipboard.readText()` requiere que la acción sea disparada directamente por el usuario (tap). Si falla, la app abre automáticamente un modal donde podés pegar manualmente.

Para mejores resultados en iOS:
1. Copiá la lista en WhatsApp.
2. Abrí la app y tocá **"Pegar lista"**.
3. Si aparece el modal, pegá (mantené presionado → Pegar) y confirmá.
