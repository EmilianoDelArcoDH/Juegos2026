// @flow

export const saveProjectJson = async ({
  userId,
  projectId,
  json,
  name,
}: {|
  userId: string,
  projectId: string,
  json: Object,
  name: string,
|}): Promise<void> => {
  const key = `supabase_fake:${userId}:${projectId}`;
  const payload = {
    name,
    updatedAt: Date.now(),
    json,
  };
  localStorage.setItem(key, JSON.stringify(payload));
};
