import { LogIn } from 'lucide-react';

interface HeaderProps {
  isGuest: boolean;
  onLoginClick: () => void;
}

export default function Header({ isGuest, onLoginClick }: HeaderProps) {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/LOGO.png" alt="Logo" className="h-12 w-auto" />
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-900">貼心房屋管理顧問</h1>
            <span className="text-xs text-gray-500">線上管理系統</span>
          </div>
        </div>

        {isGuest && (
          <button
            onClick={onLoginClick}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <LogIn className="w-5 h-5" />
            <span>登入</span>
          </button>
        )}
      </div>
    </header>
  );
}
