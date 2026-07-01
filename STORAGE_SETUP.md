# Supabase Storage 設置指南

照片上傳功能需要先設置 Supabase Storage。請依照以下步驟完成設置。

---

## 設置步驟

### 1. 創建 Storage Bucket

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇你的專案
3. 點選左側選單的 **"Storage"**
4. 點選 **"New bucket"** 或 **"Create a new bucket"**
5. 填寫以下資訊：
   - **Name**: `rental-photos`r
   - **Public bucket**: ✅ **勾選** (讓照片可以公開訪問)
   - **File size limit**: `5242880` (5MB，可選)
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp, image/jpg` (可選)

6. 點選 **"Create bucket"**

### 2. 設定 Storage Policies (安全政策)

Bucket 創建後，需要設定存取權限。

1. 在 Supabase Dashboard 中，點選左側選單的 **"SQL Editor"**
2. 點選 **"New query"**
3. 複製以下 SQL 並執行：

```sql
-- 1. 允許已認證用戶上傳照片到自己的資料夾
CREATE POLICY "Users can upload photos to own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'rental-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 2. 允許已認證用戶刪除自己的照片
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'rental-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. 允許所有人讀取照片（因為 bucket 是 public）
CREATE POLICY "Anyone can view photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'rental-photos');
```

4. 點選 **"Run"** 執行 SQL

---

## 驗證設置

設置完成後：

1. 重新整理應用程式頁面
2. 進入**代租案件**
3. 新增或編輯案件
4. 嘗試上傳照片
5. 如果看到黃色警告訊息消失，且可以正常上傳，代表設置成功

---

## 功能說明

### 照片上傳
- **支援格式**: JPG, PNG, WEBP
- **檔案大小限制**: 單張最大 5MB
- **數量限制**: 每個案件最多 10 張照片
- **儲存路徑**: `rental-photos/{user_id}/{timestamp}_{random}.{ext}`

### 照片管理
- 使用者只能上傳和刪除自己的照片
- 照片 URL 是公開的，任何人都可以透過 URL 訪問
- 刪除案件照片時會同時從 Storage 中移除檔案

---

## 常見問題

### Q: 為什麼無法上傳照片？
A: 請確認：
1. Supabase Storage bucket `rental-photos` 已創建
2. Storage policies 已正確設定
3. Bucket 設為 public
4. 用戶已登入系統

### Q: 照片上傳後看不到？
A: 請檢查：
1. Bucket 是否設為 public
2. "Anyone can view photos" policy 是否已設定
3. 瀏覽器控制台是否有錯誤訊息

### Q: 如何清理未使用的照片？
A: 可以透過 Supabase Dashboard 的 Storage 介面手動刪除，或定期檢查資料庫中已刪除案件對應的照片檔案。

---

## 技術細節

### 檔案命名規則
```
{user_id}/{timestamp}_{random_string}.{extension}
```

範例: `e69712cc-0565-4363-8fa2-e7ea641c0abe/1767429494519_14wv4.png`

### 安全機制
1. **RLS (Row Level Security)**: 確保用戶只能操作自己的照片
2. **路徑隔離**: 每個用戶的照片儲存在獨立資料夾
3. **類型限制**: 只接受圖片格式檔案
4. **大小限制**: 單檔最大 5MB，防止濫用

---

如有任何問題，請聯繫系統管理員。
