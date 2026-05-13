# Sigmetría HyS — Web

## Knowledge base

Todo el contexto estratégico, de marca y de servicios vive aquí:
`C:\Users\pherr\.claude\knowledge\sigmetria\CLAUDE.md`

Leé ese archivo primero si la tarea involucra copy, mensajería, buyer personas, servicios o diseño. Tiene el mapa completo de qué archivo cargar según la tarea.

---

## Stack y estructura

- **Framework:** Astro SSG (NO Next.js, NO React, NO SSR)
- **Deploy:** Vercel — auto-deploy en `git push origin master`
- **Repo remoto:** `github.com/ezequieldanza93-tech/sigmetria`

### Rutas clave

| Qué | Dónde |
|---|---|
| Páginas | `src/pages/` |
| Blog posts (individuales) | `src/pages/blog/*.astro` |
| Datos del blog (metadata) | `src/data/blog-posts.ts` |
| Layout base | `src/layouts/BaseLayout.astro` |
| CSS global + variables | `src/styles/global.css` |
| Sub-landings geo CABA | `src/pages/servicios/hys-construccion-caba/` |
| Sub-landings geo GBA | `src/pages/servicios/hys-construccion-gba/` |

### Reglas de desarrollo

- Nunca hardcodear colores — usar variables CSS (`--verde`, `--gris-1`, etc.)
- Nunca hacer build después de cambios
- CSS con scope por página en `<style>` del propio `.astro`
- Commits en conventional commits, sin Co-Authored-By
