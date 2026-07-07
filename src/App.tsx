import { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { FileText, TrendingUp, Home as HomeIcon, Building2, Key, Menu, X, LayoutDashboard, Type, LogOut, Shield, Eye } from 'lucide-react';
import Dashboard from './components/Dashboard';
import QuotationManager from './components/QuotationManager';
import BenefitEvaluationManager from './components/BenefitEvaluationManager';
import PackageRentalManager from './components/PackageRentalManager';
import PropertyManagementManager from './components/PropertyManagementManager';
import RentalAgencyManager from './components/RentalAgencyManager';
import RentalAgencyDetail from './components/RentalAgencyDetail';
import AdminNavBar from './components/AdminNavBar';
import Header from './components/Header';
import LoginPage from './components/LoginPage';
import { AuthProvider, useAuth } from './lib/auth';

type PageType = 'home' | 'quotation' | 'benefit' | 'package' | 'management' | 'agency';

function GuestView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-red-50">
      <Header isGuest={true} onLoginClick={() => navigate('/admin')} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RentalAgencyManager isGuest={true} />
      </main>
    </div>
  );
}

function AdminView() {
  const { user, role, canEdit, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLargeFont, setIsLargeFont] = useState(false);

  const menuItems = [
    { id: 'quotation' as const, label: '工程/裝修報價單', icon: FileText },
    { id: 'benefit' as const, label: '效益評估表', icon: TrendingUp },
    { id: 'package' as const, label: '包租案件', icon: HomeIcon },
    { id: 'management' as const, label: '代管案件', icon: Building2 },
    { id: 'agency' as const, label: '代租案件', icon: Key },
  ];

  const textSize = isLargeFont ? {
    nav: 'text-lg',
    heading: 'text-2xl',
    button: 'text-lg',
  } : {
    nav: 'text-sm',
    heading: 'text-xl',
    button: 'text-sm',
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'quotation':
        return <QuotationManager />;
      case 'benefit':
        return <BenefitEvaluationManager />;
      case 'package':
        return <PackageRentalManager />;
      case 'management':
        return <PropertyManagementManager />;
      case 'agency':
        return <RentalAgencyManager isGuest={false} />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-red-50">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <button
              onClick={() => setCurrentPage('home')}
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
              <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                {canEdit ? <Shield className="w-4 h-4 text-teal-600" /> : <Eye className="w-4 h-4 text-blue-600" />}
                <span>{canEdit ? '管理員' : '僅供檢視'}</span>
                <span className="text-gray-400">|</span>
                <span className="max-w-48 truncate">{user?.email}</span>
              </div>
              <button
                onClick={() => setCurrentPage('home')}
                className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${textSize.nav} ${
                  currentPage === 'home'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
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
                onClick={() => signOut()}
                className={`hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${textSize.nav} text-gray-700 hover:bg-gray-100`}
                title="登出"
              >
                <LogOut className="w-5 h-5" />
              </button>

              <button
                className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          <div className="hidden md:flex space-x-2 pb-3 overflow-x-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${textSize.button} ${
                    currentPage === item.id
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <div className="px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-sm text-gray-700">
                <div className="flex items-center gap-2 font-medium">
                  {role === 'admin' ? <Shield className="w-4 h-4 text-teal-600" /> : <Eye className="w-4 h-4 text-blue-600" />}
                  <span>{role === 'admin' ? '管理員' : '僅供檢視'}</span>
                </div>
                <div className="text-gray-500 truncate mt-1">{user?.email}</div>
              </div>
              <button
                onClick={() => {
                  setCurrentPage('home');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${textSize.button} ${
                  currentPage === 'home'
                    ? 'bg-teal-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">儀表板</span>
              </button>

              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${textSize.button} ${
                      currentPage === item.id
                        ? 'bg-teal-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}

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
                <button
                  onClick={() => signOut()}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${textSize.button} text-gray-700 hover:bg-gray-100`}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">登出</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPage()}
      </main>
    </div>
  );
}

function ProtectedAdminView() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-red-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return session ? <AdminView /> : <LoginPage />;
}

function ProtectedRentalAgencyDetail() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-red-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-red-50">
      <AdminNavBar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RentalAgencyDetail />
      </main>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/visitor" element={<GuestView />} />
      <Route path="/visitor/rental-agency/:id" element={
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-red-50">
          <Header isGuest={true} onLoginClick={() => window.location.href = '/admin'} />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <RentalAgencyDetail />
          </main>
        </div>
      } />
      <Route path="/admin" element={<ProtectedAdminView />} />
      <Route path="/admin/rental-agency/:id" element={<ProtectedRentalAgencyDetail />} />
      <Route path="/" element={<ProtectedAdminView />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
