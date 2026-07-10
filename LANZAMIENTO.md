# 🚀 Checklist de Lanzamiento — Sigmetría HyS

> Estado al **2026-07-10**. Marcá `[x]` a medida que cerrás cada ítem.
> Repos: **web** (marketing, Astro) `C:\dev\sigmetria-web` → Vercel `sigmetria-hys` · **app** (Next) `C:\dev\sigmetria-app` → Vercel `hys-app-sig`.

---

## ✅ Hecho y verificado en producción (no tocar)

- [x] **Funnel vivo**: CTAs → onboarding real; `/onboarding` sin sesión → crear cuenta con el plan + reassurance en el alta.
- [x] **Precios**: 3 planes core + tabla colapsable + **coherencia precio↔CTA** (el toggle reescribe el destino).
- [x] **Confianza**: bloque de autoridad (COPIME/CPSH/ISO 45001) + garantías. **CTA de cierre** + **CTA sticky** mobile.
- [x] **Producto visible**: showcase de capturas reales en home + galería en `/plataforma`.
- [x] **CTAs de trial en misma pestaña** (sin `target=_blank`) — mobile no pierde el flujo.
- [x] **Copy de reaseguro de pago** por transferencia (activación en 24 hs hábiles).
- [x] **Fix agenda de Gestiones**: ya no arranca vacía para admins no-ejecutores (muestra todo por default).
- [x] **Tenant demo "Praxis HyS"** (`ssmat.ed@gmail.com`) poblado: 8 empresas, 1037 trabajadores, equipo de 5, gestiones/capacitaciones/observaciones/docs/EPP/mediciones/incidentes/inspecciones/IPERC + dashboards vivos.

---

## ⏳ Pendiente — requiere TU mano (accesos / datos que no se inventan)

### 🌐 Dominio e infraestructura
- [ ] **Cablear `app.sigmetria.com.ar`** en NIC.ar (registro DNS apuntando a Vercel) y agregarlo en el proyecto Vercel `hys-app-sig`.
  - Al resolver: cambiar `APP_URL` en `sigmetria-web/src/config/site.ts` (1 línea) → commit → deploy.
  - **Verificar**: los CTA del sitio abren `app.sigmetria.com.ar/onboarding` (no `hys-app-sig.vercel.app`).
- [ ] **Dominio del sitio** de marketing: confirmar dominio público final (`sigmetriahys.com` / `sigmetria.com.ar`) apuntado al proyecto Vercel `sigmetria-hys`.

### 💳 Pagos
- [ ] **Mercado Pago**: completar la integración (ya hay credenciales cargadas + commit de billing en curso). Al quedar operativa, sacar el "próximamente" del copy en `sigmetria-web/src/pages/precios.astro` (FAQ "¿Cómo se paga?").
- [ ] **Datos de transferencia (alias/CBU)**: asegurar que el **checkout del app** los muestre. El copy del sitio ya promete "te mostramos los datos para transferir".

### 🏷️ Marca / contenido
- [ ] **Nombre del admin demo**: hoy `full_name = "Eduardo Giménez"` (placeholder). Poné el real si esa cuenta se usa en vivo.
- [ ] **Redes LinkedIn / YouTube**: hoy `'#'` (grises) en `sigmetria-web/src/config/site.ts` (`CANALES`). Pegá las URLs reales o dejalas ocultas.
- [ ] **Testimonios / prueba social**: hoy solo autoridad (matrículas/ISO). Sumar 1-2 reseñas reales apenas haya beta activo (consenso — Cialdini).

### 📊 Datos / app
- [ ] **Persona ejecutora del admin** (opcional, ya mitigado): el fix hace que la agenda muestre todo por default; si querés que el default "yo" funcione, asignale una persona ejecutora al usuario admin.
- [ ] **Revisar tenant demo vs. tenant real de lanzamiento**: definir si se lanza con "Praxis HyS" (demo) o se crea el tenant productivo limpio.

### 🔎 QA final (mobile = 80% del tráfico)
- [ ] Recorrer en celular: home → plataforma → precios → "Probá gratis" → alta → onboarding.
- [ ] Confirmar que las capturas del producto cargan y se ven nítidas.
- [ ] Confirmar que el sticky CTA no tapa el botón de WhatsApp.
- [ ] Revisar velocidad (LCP < 2.5s) con el sitio ya en el dominio final.

---

## 📌 Notas técnicas
- URL del app centralizada en `sigmetria-web/src/config/site.ts` (`APP_URL` / `onboardingUrl` / `TRIAL_URL`).
- Capturas del producto en `sigmetria-web/public/producto/` (`dashboard.jpeg`, `cartera.jpeg`, `agenda.jpeg`). Se pueden pasar a WebP a futuro (hoy están lazy + bajo el fold → no afectan LCP).
- Migraciones Supabase: por Management API (ver engram `config/supabase-connection`). No usar `db push`.
