import { supabase } from '../supabaseClient';

export const deleteStorage = async (path: string, bucketName: string) => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .remove([path]);
  if (error) throw error;
  return data;
};
