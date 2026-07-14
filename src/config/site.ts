/**
 * Interruptores de secciones de la web (feature flags).
 *
 * `servicios`: hoy la web se enfoca SOLO en la app/plataforma. Cuando quieras
 * reactivar las páginas y el menú de servicios (Industrias y Construcciones,
 * Mediciones, Capacitaciones, Implementación ISO 45001, Auditorías), poné
 * `servicios: true` y vuelven a aparecer en el nav, el footer y el home —
 * sin tocar nada más. No se borra nada: solo se oculta.
 */
export const FEATURES = {
  servicios: false,
} as const;

/**
 * Tenant dueño de los leads que captura ESTA web. Hoy es Sigmetría (la casa) = null.
 * Cuando el CRM se ofrezca a otras consultoras, cada sitio setea su propio consultora_id.
 */
export const CONSULTORA_ID: string | null = null;

/** Versión del texto de política de privacidad aceptado (log de consentimientos). */
export const PRIVACY_VERSION = 'pp-2026-06';

/**
 * Canales de contacto y redes — fuente única de verdad.
 * WhatsApp e Instagram ya están activos. LinkedIn y YouTube valen '#' porque
 * todavía no existen esos perfiles: en el menú "Canales" aparecen GRISES y no
 * clickeables (badge "pronto"). Cuando crees el perfil, pegá la URL real acá y
 * el ítem se activa solo en todos lados (nav desktop + mobile) — sin tocar nada más.
 */
export const CANALES = {
  whatsapp:  'https://wa.me/5491123496789',
  instagram: 'https://www.instagram.com/sigmetria',
  linkedin:  '#', // TODO: pegar la URL real de LinkedIn
  youtube:   '#', // TODO: pegar la URL real de YouTube
} as const;

/**
 * Destino del app (el funnel de conversión) — fuente ÚNICA de verdad.
 *
 * Todos los CTA (Probá gratis / Elegir plan), el onboarding y el trial derivan
 * de esta constante, y el fetch build-time de cupos Fundador también la usa.
 * Si el dominio del app cambia, se toca SOLO esta línea. NO hardcodees la URL
 * en otro lado.
 */
export const APP_URL = 'https://app.sigmetria.com.ar';

export type Ciclo = 'monthly' | 'annual';

export interface OnboardingOpts {
  plan?: string;
  ciclo?: Ciclo;
  fundador?: boolean;
}

/** Construye la URL de onboarding del app con el deep-link de plan/ciclo/fundador. */
export function onboardingUrl(opts: OnboardingOpts = {}): string {
  const qs = new URLSearchParams();
  if (opts.plan) qs.set('plan', opts.plan);
  if (opts.ciclo) qs.set('ciclo', opts.ciclo);
  if (opts.fundador) qs.set('fundador', '1');
  const q = qs.toString();
  return `${APP_URL}/onboarding${q ? `?${q}` : ''}`;
}

/** URL del trial gratuito (el CTA primario del sitio). */
export const TRIAL_URL = onboardingUrl({ plan: 'trial' });
