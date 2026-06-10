/**
 * setup-storage.mjs — crea el bucket privado `lead-magnets` y sube los PDFs.
 *
 * Uso:
 *   node scripts/setup-storage.mjs            → crea el bucket (idempotente)
 *   node scripts/setup-storage.mjs --upload   → además sube los PDFs que encuentre
 *
 * .env.local necesario:
 *   SUPABASE_SERVICE_ROLE_KEY=...   (service_role key — NO la anon key)
 *   PUBLIC_SUPABASE_URL=...
 *
 * Dónde poner los PDFs (para --upload):
 *   Carpeta por defecto:  ./lead-magnets-pdf/   (o configurá LEAD_MAGNETS_DIR en .env.local)
 *   Nombrá cada archivo EXACTAMENTE con su key + .pdf, por ejemplo:
 *     ebook-digitalizar.pdf · plantilla-recorrida.pdf · plantilla-iper.pdf ·
 *     plan-capacitacion.pdf · checklist-iso-45001.pdf
 *   El script sube los que existan y avisa los que falten. Podés correrlo varias veces.
 *
 * Alternativa sin script: Supabase → Storage → bucket lead-magnets → Upload,
 *   renombrando cada archivo a "<key>.pdf".
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Las keys deben coincidir con lead_magnets.key (tabla) y con el leadMagnetKey de cada form.
const LEAD_MAGNETS = [
  'ebook-digitalizar',
  'plantilla-recorrida',
  'plantilla-iper',
  'plan-capacitacion',
  'checklist-iso-45001',
];

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) throw new Error('.env.local no encontrado. Crealo con SUPABASE_SERVICE_ROLE_KEY y PUBLIC_SUPABASE_URL.');
  const env = {};
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const url = env['PUBLIC_SUPABASE_URL'];
  const key = env['SUPABASE_SERVICE_ROLE_KEY'];
  const doUpload = process.argv.includes('--upload');
  const dir = env['LEAD_MAGNETS_DIR'] || resolve(process.cwd(), 'lead-magnets-pdf');

  if (!url || !key) throw new Error('Falta PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');

  const supabase = createClient(url, key, { auth: { persistSession: false } });

  // 1. Crear el bucket privado (idempotente)
  const { error: bucketErr } = await supabase.storage.createBucket('lead-magnets', {
    public: false,
    allowedMimeTypes: ['application/pdf'],
    fileSizeLimit: '20MB',
  });
  if (bucketErr?.message?.includes('already exists')) console.log('✅ El bucket lead-magnets ya existe.');
  else if (bucketErr) throw new Error(`Error al crear el bucket: ${bucketErr.message}`);
  else console.log('✅ Bucket lead-magnets creado.');

  // 2. Subir los PDFs presentes
  if (doUpload) {
    console.log(`\nBuscando PDFs en: ${dir}\n`);
    let subidos = 0, faltan = 0;
    for (const slug of LEAD_MAGNETS) {
      const file = resolve(dir, `${slug}.pdf`);
      if (!existsSync(file)) {
        console.log(`⏭️  Falta  ${slug}.pdf  (todavía no lo subo)`);
        faltan++;
        continue;
      }
      const { error } = await supabase.storage
        .from('lead-magnets')
        .upload(`${slug}.pdf`, readFileSync(file), { contentType: 'application/pdf', upsert: true });
      if (error) { console.error(`❌ Error subiendo ${slug}.pdf: ${error.message}`); continue; }
      console.log(`✅ Subido ${slug}.pdf`);
      subidos++;
    }
    console.log(`\nResumen: ${subidos} subidos, ${faltan} pendientes.`);
  }

  console.log('\nListo. El gate de descarga está operativo para los PDFs que ya subiste.');
}

main().catch(err => { console.error(err.message); process.exit(1); });
