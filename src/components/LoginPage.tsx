import { FormEvent, useState } from 'react';
import { Eye, Lock, LogIn, Shield } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function LoginPage() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      await signIn(email.trim(), password);
    } catch (error: any) {
      setErrorMessage(error.message || '登入失敗，請確認帳號密碼。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-red-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-xl">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <img src="/LOGO.png" alt="Logo" className="h-12 w-12 object-contain" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">後台登入</h1>
              <p className="text-sm text-gray-500">管理員與檢視帳號</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-sm text-blue-900">
            <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">權限說明</p>
              <p>管理員可新增、修改與同步資料；檢視帳號只能讀取資料。</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">密碼</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="請輸入密碼"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                title={showPassword ? '隱藏密碼' : '顯示密碼'}
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-gray-400"
          >
            <LogIn className="w-5 h-5" />
            <span>{loading ? '登入中...' : '登入'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
