import { supabase } from './supabase';

const BUCKET_NAME = 'rental-photos';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export const uploadPhoto = async (file: File, userId: string): Promise<UploadResult> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    }

    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: '上傳失敗' };
  }
};

export const deletePhoto = async (photoUrl: string): Promise<boolean> => {
  try {
    const path = photoUrl.split(`${BUCKET_NAME}/`)[1];
    if (!path) return false;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

export const checkBucketExists = async (): Promise<boolean> => {
  try {
    // 改用嘗試列出檔案的方式來檢查 bucket 是否存在並且可訪問
    // 這個方法不需要管理員權限，只需要基本的 storage 使用權限
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1 });

    // 如果 error 是 null 或者 bucket 不存在的錯誤，都表示 bucket 已正確設置
    if (!error) {
      return true;
    }

    // 如果錯誤訊息是 bucket not found，回傳 false
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      console.error('Bucket not found:', error);
      return false;
    }

    // 其他錯誤也當作 bucket 存在但可能是權限問題
    console.warn('Bucket check warning:', error);
    return true;
  } catch (error) {
    console.error('Error checking bucket:', error);
    // 在 catch 情況下，我們假設 bucket 存在，讓用戶可以嘗試上傳
    return true;
  }
};
