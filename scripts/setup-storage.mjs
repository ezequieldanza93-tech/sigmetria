/**
 * setup-storage.mjs — crea el bucket privado `lead-magnets` en Supabase Storage.
 *
 * Ejecutar una sola vez, después de ingresar las credenciales en .env.local:
 *   node scripts/setup-storage.mjs
 *
 * .env.local necesario:
 *   SUPABASE_SERVICE_ROLE_KEY=...   (service_role key del proyecto — NO la anon key)
 *   PUBLIC_SUPABASE_URL=...         (la URL pública del proyecto)
 *
 * Subir el PDF manualmente después:
 *   node scripts/setup-storage.mjs --upload
 *   (Requiere que el archivo exista en: LEAD_MAGNET_PATH o ./Sigmetria_Plantilla_Recorrida.pdf)
 *
 * Alternativa desde el dashboard:
 *   1. Ir a Storage → New bucket → Nombre: lead-magnets → Private ✓ → Create
 *   2. Upload → seleccionar el PDF → Renombrarlo a "plantilla-recorrida.pdf"
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

// Leer .env.local manualmente (sin dotenv para no agregar dependencia)
function loadEnv() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) throw new Error('.env.local no encontrado. Crealo con SUPABASE_SERVICE_ROLE_KEY y PUBLIC_SUPABASE_URL.');
  const lines = readFileSync(envPath, 'utf-8').split('\n');
  const env = {};
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const url      = env['PUBLIC_SUPABASE_URL'];
  const key      = env['SUPABASE_SERVICE_ROLE_KEY'];
  const doUpload = process.argv.includes('--upload');

  if (!url || !key) throw new Error('Falta PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');

  const supabase = createClient(url, key, {
    auth: { persistSession: false },
  });

  // 1. Crear el bucket privado
  const { data: bucket, error: bucketErr } = await supabase.storage.createBucket('lead-magnets', {
    public: false,
    allowedMimeTypes: ['application/pdf'],
    fileSizeLimit: '20MB',
  });

  if (bucketErr?.message?.includes('already exists')) {
    console.log('✅ El bucket lead-magnets ya existe.');
  } else if (bucketErr) {
    throw new Error(`Error al crear el bucket: ${bucketErr.message}`);
  } else {
    console.log('✅ Bucket lead-magnets creado exitosamente.');
  }

  // 2. Subir el PDF (solo si se pasa --upload)
  if (doUpload) {
    const pdfPath = env['LEAD_MAGNET_PATH'] || resolve(process.cwd(), 'Sigmetria_Plantilla_Recorrida.pdf');
    if (!existsSync(pdfPath)) {
      console.error(`❌ PDF no encontrado en: ${pdfPath}`);
      console.error('   Copiá el archivo ahí o configurá LEAD_MAGNET_PATH en .env.local');
      process.exit(1);
    }
    const pdfBuffer = readFileSync(pdfPath);
    const { error: uploadErr } = await supabase.storage
      .from('lead-magnets')
      .upload('plantilla-recorrida.pdf', pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    if (uploadErr) throw new Error(`Error al subir el PDF: ${uploadErr.message}`);
    console.log('✅ plantilla-recorrida.pdf subido exitosamente.');
    console.log('');
    console.log('TODO — integración email-marketing:');
    console.log('  Al guardar cada lead, llamar a subscribeToList(lead) con tu proveedor (Brevo, etc.).');
    console.log('  Opción recomendada: Supabase Edge Function escuchando INSERT en tabla `leads`');
    console.log('  filtrado por lead_magnet = "plantilla-recorrida". Ver: supabase/functions/on-lead-insert/');
  }

  console.log('\nListo. El gate del PDF está operativo.');
}

main().catch(err => { console.error(err.message); process.exit(1); });
