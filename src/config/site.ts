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
