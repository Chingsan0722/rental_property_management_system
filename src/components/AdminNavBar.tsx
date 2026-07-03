import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Type } from 'lucide-react';

export default function AdminNavBar() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLargeFont, setIsLargeFont] = useState(false);

  const textSize = isLargeFont ? {
    nav: 'text-lg',
    heading: 'text-2xl',
    button: 'text-lg',
  } : {
    nav: 'text-sm',
    heading: 'text-xl',
    button: 'text-sm',
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <button
            onClick={() => navigate('/admin')}
            className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/LOGO.png"
              alt="貼心房屋管理顧問"
              className="h-12 w-12 object-contain"
            />
            <div className="flex flex-col items-start">
              <span className={`${textSize.heading} font-bold text-gray-900`}>貼心房屋管理顧問</span>
              <span className="text-xs text-gray-500">線上管理系統</span>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin')}
              className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${textSize.nav} text-gray-700 hover:bg-gray-100`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">儀表板</span>
            </button>

            <button
              onClick={() => setIsLargeFont(!isLargeFont)}
              className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${textSize.nav} text-gray-700 hover:bg-gray-100 ${isLargeFont ? 'bg-teal-50 text-teal-700' : ''}`}
              title="字體大小"
            >
              <Type className="w-5 h-5" />
            </button>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <button
              onClick={() => {
                navigate('/admin');
                setMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${textSize.button} text-gray-700 hover:bg-gray-100`}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span className="font-medium">儀表板</span>
            </button>

            <div className="border-t pt-2 mt-2">
              <button
                onClick={() => {
                  setIsLargeFont(!isLargeFont);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${textSize.button} text-gray-700 hover:bg-gray-100 ${isLargeFont ? 'bg-teal-50' : ''}`}
              >
                <Type className="w-5 h-5" />
                <span className="font-medium">{isLargeFont ? '標準字體' : '放大字體'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
