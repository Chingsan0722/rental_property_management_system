import { supabase } from './supabase';

const FALLBACK_USER_ID_STORAGE_KEY = 'rental_management_fallback_user_id';

export async function getCurrentUserId(): Promise<string> {
  const storedUserId = localStorage.getItem(FALLBACK_USER_ID_STORAGE_KEY);
  if (storedUserId) {
    return storedUserId;
  }

  const { data, error } = await supabase
    .from('property_management_cases')
    .select('user_id')
    .not('user_id', 'is', null)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data?.user_id) {
    localStorage.setItem(FALLBACK_USER_ID_STORAGE_KEY, data.user_id);
    return data.user_id;
  }

  const { data: authData } = await supabase.auth.getUser();
  if (authData.user?.id) {
    localStorage.setItem(FALLBACK_USER_ID_STORAGE_KEY, authData.user.id);
    return authData.user.id;
  }

  throw new Error('找不到可用的使用者 ID。請先在 Supabase 建立使用者，或啟用登入流程。');
}
