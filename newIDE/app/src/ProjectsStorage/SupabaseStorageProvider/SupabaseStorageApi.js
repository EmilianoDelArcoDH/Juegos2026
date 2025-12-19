// @flow
import { supabase } from './SupabaseClient';

const BUCKET = 'gdevelop-projects';

export async function uploadProjectJson({
  ownerId,
  projectId,
  json,
}: {|
  ownerId: string,
  projectId: string,
  json: Object,
|}): Promise<string> {
  const path = `${ownerId}/${projectId}/project.json`;
  const body = new Blob([JSON.stringify(json)], { type: 'application/json' });

  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    upsert: true,
    contentType: 'application/json',
  });

  if (error) throw error;
  return path;
}

export async function upsertProjectRow({
  projectId,
  ownerId,
  name,
  jsonPath,
}: {|
  projectId: string,
  ownerId: string,
  name: string,
  jsonPath: string,
|}): Promise<void> {
  // Si querés que el projectId sea el mismo UUID de la tabla, usá `id: projectId`:
  const { error } = await supabase.from('projects').upsert(
    {
      id: projectId,
      owner_id: ownerId,
      name,
      json_path: jsonPath,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );

  if (error) throw error;
}
