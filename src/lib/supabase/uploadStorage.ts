import imageCompression from 'browser-image-compression';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabaseClient';

type UploadStorage = {
  folder: FileList;
  bucketName: string;
};

type UploadPathname = {
  path: string;
};

export const uploadStorage = async ({
  folder,
  bucketName,
}: UploadStorage): Promise<UploadPathname> => {
  const file = folder[0]; // 1ファイルアップロード

  // 画像を圧縮
  const compressedFile = await imageCompression(file, {
    maxSizeMB: 1, // 最大ファイルサイズ（MB）
    maxWidthOrHeight: 1920, // 最大幅または高さ（ピクセル）
  });

  const pathName = `/${uuidv4()}`; // パス名の設定
  const { data, error } = await supabase.storage.from(bucketName).upload(pathName, compressedFile, {
    // 圧縮されたファイルを使用
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return {
    path: data?.path ?? null,
  };
};
