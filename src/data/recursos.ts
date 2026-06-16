/**
 * Catálogo de recursos descargables (lead magnets) que viven en los artículos del blog.
 *
 * Fuente única de verdad para la galería de /recursos. Hoy cada recurso se
 * captura/descarga DENTRO de su artículo (dos sistemas: descarga directa con
 * cuenta y envío por email), así que cada card de la galería linkea al artículo
 * — no reimplementamos el gate ni rompemos el tracking de funnel.
 *
 * Si sumás un lead magnet nuevo en un artículo, agregalo también acá.
 */

export type RecursoTipo = 'E-book' | 'Plantilla' | 'Checklist' | 'Guía' | 'Reporte';

/** Cómo se entrega el recurso: descarga directa (requiere cuenta) o envío por email. */
export type RecursoEntrega = 'descarga' | 'email';

export interface Recurso {
  /** leadMagnetKey / leadMagnet usado en el artículo (identificador estable). */
  slug: string;
  /** Título para la card de la galería (redactado para vidriera, no el CTA del artículo). */
  titulo: string;
  /** Descripción corta — 1 o 2 líneas. */
  descripcion: string;
  tipo: RecursoTipo;
  /** Artículo del blog donde el recurso se descarga/solicita. */
  articulo: string;
  entrega: RecursoEntrega;
}

export const RECURSOS: Recurso[] = [
  // ── Descarga directa (FormLeadMagnetPDF — requiere cuenta) ──────────────────
  {
    slug: 'plantilla-iper',
    titulo: 'Plantilla de matriz de riesgos (IPER)',
    descripcion: 'Identificá peligros, evaluá riesgos y definí controles en una matriz que el auditor no objeta.',
    tipo: 'Plantilla',
    articulo: '/blog/como-hacer-matriz-riesgos-iper-paso-a-paso/',
    entrega: 'descarga',
  },
  {
    slug: 'plantilla-recorrida',
    titulo: 'Plantilla de recorrida de seguridad',
    descripcion: 'La planilla profesional para que cada recorrida dispare acciones y no termine en un PDF muerto.',
    tipo: 'Plantilla',
    articulo: '/blog/como-hacer-recorrida-seguridad-que-sirva/',
    entrega: 'descarga',
  },
  {
    slug: 'ebook-digitalizar',
    titulo: 'E-book: Digitalizá tu gestión de HyS',
    descripcion: 'Las 5 cosas que perdés en Excel y el método para ordenar toda tu cartera de una vez.',
    tipo: 'E-book',
    articulo: '/blog/excel-vs-software-gestion-hys/',
    entrega: 'descarga',
  },
  {
    slug: 'checklist-iso-45001',
    titulo: 'Checklist de requisitos ISO 45001',
    descripcion: 'Las 10 cláusulas de la norma con el documento que te van a pedir en cada una, en un PDF para tildar.',
    tipo: 'Checklist',
    articulo: '/blog/requisitos-iso-45001-checklist-completo/',
    entrega: 'descarga',
  },
  {
    slug: 'plan-capacitacion',
    titulo: 'Plantilla de plan anual de capacitación',
    descripcion: 'Armá el plan por puesto, con cronograma y registros firmados que aguantan cualquier auditoría.',
    tipo: 'Plantilla',
    articulo: '/blog/plan-anual-capacitacion-seguridad-plantilla/',
    entrega: 'descarga',
  },

  // ── Envío por email (form MOFU) ─────────────────────────────────────────────
  {
    slug: 'guia-8-pasos-sgs',
    titulo: 'Guía: 8 pasos para tu sistema de gestión',
    descripcion: 'El roadmap real que usamos con clientes en Argentina para llegar a un SGS certificable.',
    tipo: 'Guía',
    articulo: '/blog/como-certificar-iso-45001-roadmap-completo/',
    entrega: 'email',
  },
  {
    slug: 'mediciones-tecnicas-obligatorias-srt',
    titulo: 'Guía de mediciones técnicas obligatorias (SRT)',
    descripcion: 'Qué tenés que medir ante la SRT, con qué protocolo y cada cuánto, puesto por puesto.',
    tipo: 'Guía',
    articulo: '/blog/mediciones-obligatorias-srt-cuales-son-y-cuando/',
    entrega: 'email',
  },
  {
    slug: 'capacitaciones-obligatorias-por-puesto',
    titulo: 'Lista de capacitaciones obligatorias por puesto',
    descripcion: 'Qué capacitación necesita cada trabajador según su tarea y la normativa vigente.',
    tipo: 'Guía',
    articulo: '/blog/capacitaciones-obligatorias-seguridad-higiene-lista/',
    entrega: 'email',
  },
  {
    slug: '10-errores-iso-45001-primer-ano',
    titulo: 'Guía: 10 errores en el primer año de ISO 45001',
    descripcion: 'Los tropiezos más comunes al implementar la norma y cómo evitarlos desde el arranque.',
    tipo: 'Guía',
    articulo: '/blog/errores-comunes-implementacion-iso-45001/',
    entrega: 'email',
  },
  {
    slug: 'implementar-iso-45001-sin-burocracia',
    titulo: 'E-book: Implementar ISO 45001 sin burocracia',
    descripcion: '12 páginas con el roadmap real para implementar la norma en PyMEs argentinas.',
    tipo: 'E-book',
    articulo: '/blog/como-implementar-iso-45001-pyme/',
    entrega: 'email',
  },
  {
    slug: 'comparativa-excel-vs-software-hys',
    titulo: 'Comparativa: Excel vs software de gestión HyS',
    descripcion: 'Cuándo conviene cada uno y cómo decidir sin medias tintas para tu operación.',
    tipo: 'Guía',
    articulo: '/blog/como-digitalizar-gestion-hys-sin-fracasar/',
    entrega: 'email',
  },
  {
    slug: 'checklist-srt-obras',
    titulo: 'Checklist SRT para obras',
    descripcion: 'Todo lo que la SRT te exige en una obra, ordenado para que no te falte nada en la inspección.',
    tipo: 'Checklist',
    articulo: '/blog/aviso-de-obra-srt-como-hacerlo-paso-a-paso/',
    entrega: 'email',
  },
  {
    slug: 'plantilla-gap-analysis-iso-45001',
    titulo: 'Plantilla de GAP analysis ISO 45001',
    descripcion: 'Medí cláusula por cláusula cuánto te falta para certificar y priorizá el trabajo.',
    tipo: 'Plantilla',
    articulo: '/blog/gap-analysis-iso-45001-que-es-para-que-sirve/',
    entrega: 'email',
  },
  {
    slug: '15-documentos-inspeccion-obra',
    titulo: 'Los 15 documentos que te piden en una inspección de obra',
    descripcion: 'El legajo técnico completo para que una inspección no te agarre desprevenido.',
    tipo: 'Checklist',
    articulo: '/blog/documentos-obligatorios-srt-obra-construccion/',
    entrega: 'email',
  },
  {
    slug: 'reporte-ejecutivo-hys-directorio',
    titulo: 'Reporte ejecutivo de HyS para el directorio',
    descripcion: 'Los KPI de seguridad que el directorio quiere ver, en un reporte que se entiende de una mirada.',
    tipo: 'Reporte',
    articulo: '/blog/kpi-seguridad-salud-ocupacional-directorio/',
    entrega: 'email',
  },
];
