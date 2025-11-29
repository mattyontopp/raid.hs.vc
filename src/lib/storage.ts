import { supabase } from '@/integrations/supabase/client';

export const uploadFile = async (
  bucket: string,
  file: File,
  userId: string
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return { url: publicUrl, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
};

export const deleteFile = async (
  bucket: string,
  fileUrl: string
): Promise<{ error: Error | null }> => {
  try {
    const filePath = fileUrl.split(`/${bucket}/`)[1];
    if (!filePath) throw new Error('Invalid file URL');

    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) throw error;

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};
