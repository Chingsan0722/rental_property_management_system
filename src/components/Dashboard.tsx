import { useState, useEffect } from 'react';
import { FileText, TrendingUp, Home, Building2, Key, Calendar, DollarSign, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  onNavigate?: (page: 'quotation' | 'benefit' | 'package' | 'management' | 'agency') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    quotations: 0,
    evaluations: 0,
    packageRentals: 0,
    propertyManagement: 0,
    rentalAgency: 0,
    activeContracts: 0,
    activePackageCount: 0,
    activeManagementCount: 0,
    activeAgencyCount: 0,
    monthlyRevenue: 0,
    recentActivities: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [quotations, evaluations, packageRentals, propertyManagement, rentalAgency] = await Promise.all([
        supabase.from('quotations').select('*', { count: 'exact' }),
        supabase.from('benefit_evaluations').select('*', { count: 'exact' }),
        supabase.from('package_rental_cases').select('*', { count: 'exact' }),
        supabase.from('property_management_cases').select('*', { count: 'exact' }),
        supabase.from('rental_agency_cases').select('*', { count: 'exact' }),
      ]);

      const activePackage = packageRentals.data?.filter(c => c.status === '已簽約') || [];
      const activeManagement = propertyManagement.data?.filter(c => c.status === '執行中') || [];
      const activeAgency = rentalAgency.data?.filter(c => c.status === '已出租') || [];

      const totalRevenue = [
        ...activePackage.map(c => c.monthly_rent),
        ...activeManagement.map(c => c.management_fee),
      ].reduce((sum, val) => sum + (Number(val) || 0), 0);

      setStats({
        quotations: quotations.count || 0,
        evaluations: evaluations.count || 0,
        packageRentals: packageRentals.count || 0,
        propertyManagement: propertyManagement.count || 0,
        rentalAgency: rentalAgency.count || 0,
        activeContracts: activePackage.length + activeManagement.length,
        activePackageCount: activePackage.length,
        activeManagementCount: activeManagement.length,
        activeAgencyCount: activeAgency.length,
        monthlyRevenue: totalRevenue,
        recentActivities: [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: '報價單', value: stats.quotations, icon: FileText, color: 'bg-blue-500', page: 'quotation' as const },
    { label: '效益評估', value: stats.evaluations, icon: TrendingUp, color: 'bg-green-500', page: 'benefit' as const },
    { label: '包租案件', value: stats.packageRentals, icon: Home, color: 'bg-purple-500', page: 'package' as const },
    { label: '代管案件', value: stats.propertyManagement, icon: Building2, color: 'bg-orange-500', page: 'management' as const },
    { label: '代租案件', value: stats.rentalAgency, icon: Key, color: 'bg-pink-500', page: 'agency' as const },
    { label: '執行中合約', value: stats.activeContracts, icon: Calendar, color: 'bg-teal-500', page: null },
  ];

  if (loading) {
    return <div className="text-center py-12 text-gray-500">載入中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">儀表板</h2>
          <p className="text-gray-600 mt-1">歡迎使用貼心房屋管理系統</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">今天是</div>
          <div className="text-lg font-semibold text-gray-900">
            {new Date().toLocaleDateString('zh-TW', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              onClick={() => card.page && onNavigate?.(card.page)}
              className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all p-6 ${
                card.page ? 'cursor-pointer hover:scale-105' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`${card.color} p-4 rounded-xl`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-white bg-opacity-20 p-4 rounded-xl">
              <DollarSign className="w-8 h-8" />
            </div>
            <div>
              <p className="text-teal-100 text-sm">每月營收</p>
              <p className="text-3xl font-bold">規劃中</p>
            </div>
          </div>
          <p className="text-teal-100 text-sm">功能開發中，敬請期待</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="w-6 h-6 text-gray-600" />
            <h3 className="text-xl font-bold text-gray-900">快速統計</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">總案件數</span>
              <span className="font-bold text-gray-900">
                {stats.quotations + stats.evaluations + stats.packageRentals +
                 stats.propertyManagement + stats.rentalAgency}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">執行中包租</span>
              <span className="font-bold text-purple-600">
                {stats.activePackageCount}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-gray-600">執行中代管</span>
              <span className="font-bold text-orange-600">
                {stats.activeManagementCount}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">執行中代租</span>
              <span className="font-bold text-pink-600">
                {stats.activeAgencyCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-6 border-2 border-blue-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4">系統小提示</h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start">
            <span className="text-teal-600 mr-2">•</span>
            <span>使用效益評估表可快速比較包租與代管方案，幫助屋主做出最佳決策</span>
          </li>
          <li className="flex items-start">
            <span className="text-teal-600 mr-2">•</span>
            <span>報價單支援多個項目，並會自動計算總金額</span>
          </li>
          <li className="flex items-start">
            <span className="text-teal-600 mr-2">•</span>
            <span>所有單據都支援匯出功能，方便與客戶分享</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
