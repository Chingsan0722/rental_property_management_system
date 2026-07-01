import { useState, useEffect } from 'react';
import { Building2, ChevronDown, ChevronRight, User, DoorOpen, DoorClosed, Phone, Calendar, MapPin, CreditCard as Edit2, X, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PropertyCase {
  id: string;
  case_number: string;
  case_address: string;
  owner_name: string;
  owner_phone: string | null;
  tenant_name: string | null;
  tenant_phone: string | null;
  property_type: string | null;
  layout: string | null;
  area: string | null;
  monthly_rent: number | null;
  management_fee: number | null;
  contract_start_date: string | null;
  contract_end_date: string | null;
  status: string | null;
  rent_payment_date: string | null;
}

interface GroupedProperty {
  mainAddress: string;
  isSingleUnit: boolean;
  units: PropertyCase[];
}

export default function CaseManagement() {
  const userId = '00000000-0000-0000-0000-000000000000';
  const [cases, setCases] = useState<PropertyCase[]>([]);
  const [groupedProperties, setGroupedProperties] = useState<GroupedProperty[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'rented' | 'vacant'>('all');
  const [editingCase, setEditingCase] = useState<PropertyCase | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCases();
  }, []);

  useEffect(() => {
    if (cases.length > 0) {
      groupCasesByProperty();
    }
  }, [cases]);

  const fetchCases = async () => {
    try {
      const { data, error } = await supabase
        .from('property_management_cases')
        .select('*')
        .eq('user_id', userId)
        .order('case_address', { ascending: true });

      if (error) throw error;
      setCases(data || []);
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const extractMainAddress = (address: string): string => {
    return address.substring(0, 6);
  };

  const extractChinesePrefix = (address: string): string => {
    const match = address.match(/^[\u4e00-\u9fa5]+/);
    if (match) {
      return match[0];
    }
    return address.substring(0, 6);
  };

  const groupCasesByProperty = () => {
    const grouped = new Map<string, PropertyCase[]>();

    cases.forEach(caseItem => {
      const mainPrefix = extractMainAddress(caseItem.case_address);
      if (!grouped.has(mainPrefix)) {
        grouped.set(mainPrefix, []);
      }
      grouped.get(mainPrefix)!.push(caseItem);
    });

    const result: GroupedProperty[] = Array.from(grouped.entries()).map(([mainAddress, units]) => {
      const displayName = units.length === 1
        ? units[0].case_address
        : extractChinesePrefix(units[0].case_address);

      return {
        mainAddress: displayName,
        isSingleUnit: units.length === 1,
        units: units.sort((a, b) => a.case_address.localeCompare(b.case_address)),
      };
    });

    result.sort((a, b) => {
      if (a.isSingleUnit === b.isSingleUnit) {
        return a.mainAddress.localeCompare(b.mainAddress);
      }
      return a.isSingleUnit ? 1 : -1;
    });

    setGroupedProperties(result);
  };

  const toggleGroup = (mainAddress: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(mainAddress)) {
      newExpanded.delete(mainAddress);
    } else {
      newExpanded.add(mainAddress);
    }
    setExpandedGroups(newExpanded);
  };

  const getRentedUnitsCount = (units: PropertyCase[]) => {
    return units.filter(u => u.tenant_name).length;
  };

  const getVacantUnitsCount = (units: PropertyCase[]) => {
    return units.filter(u => !u.tenant_name).length;
  };

  const getFilteredProperties = () => {
    if (filterStatus === 'all') return groupedProperties;

    return groupedProperties.map(prop => ({
      ...prop,
      units: prop.units.filter(unit =>
        filterStatus === 'rented' ? unit.tenant_name : !unit.tenant_name
      )
    })).filter(prop => prop.units.length > 0);
  };

  const handleSave = async () => {
    if (!editingCase) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('property_management_cases')
        .update({
          manager_name: editingCase.manager_name,
          owner_name: editingCase.owner_name,
          owner_phone: editingCase.owner_phone,
          owner_id_number: editingCase.owner_id_number,
          tenant_name: editingCase.tenant_name,
          tenant_phone: editingCase.tenant_phone,
          property_type: editingCase.property_type,
          layout: editingCase.layout,
          area: editingCase.area,
          monthly_rent: editingCase.monthly_rent,
          management_fee_ratio: editingCase.management_fee_ratio,
          management_fee: editingCase.management_fee,
          water_fee: editingCase.water_fee,
          electricity_fee: editingCase.electricity_fee,
          deposit: editingCase.deposit,
          payment_frequency: editingCase.payment_frequency,
          water_electricity_billing: editingCase.water_electricity_billing,
          contract_start_date: editingCase.contract_start_date,
          contract_end_date: editingCase.contract_end_date,
          rent_payment_date: editingCase.rent_payment_date,
          utility_settlement_date: editingCase.utility_settlement_date,
          payment_status: editingCase.payment_status,
          status: editingCase.status,
          commission: editingCase.commission,
          commission_notes: editingCase.commission_notes,
          notes: editingCase.notes,
        })
        .eq('id', editingCase.id);

      if (error) throw error;

      await fetchCases();
      setEditingCase(null);
      alert('儲存成功！');
    } catch (error) {
      console.error('Error saving case:', error);
      alert('儲存失敗，請稍後再試');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
        <p className="text-lg">目前沒有代管案件資料</p>
      </div>
    );
  }

  const filteredProperties = getFilteredProperties();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setFilterStatus('all')}
          className={`bg-gradient-to-br from-teal-50 to-teal-100 border rounded-lg p-4 text-left transition-all hover:shadow-lg ${
            filterStatus === 'all' ? 'border-teal-500 ring-2 ring-teal-300' : 'border-teal-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-teal-700 font-medium">總物件數</p>
              <p className="text-3xl font-bold text-teal-900">{groupedProperties.length}</p>
            </div>
            <Building2 className="w-12 h-12 text-teal-600 opacity-50" />
          </div>
        </button>
        <button
          onClick={() => setFilterStatus('rented')}
          className={`bg-gradient-to-br from-green-50 to-green-100 border rounded-lg p-4 text-left transition-all hover:shadow-lg ${
            filterStatus === 'rented' ? 'border-green-500 ring-2 ring-green-300' : 'border-green-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">已出租單位</p>
              <p className="text-3xl font-bold text-green-900">
                {groupedProperties.reduce((sum, prop) => sum + getRentedUnitsCount(prop.units), 0)}
              </p>
            </div>
            <DoorClosed className="w-12 h-12 text-green-600 opacity-50" />
          </div>
        </button>
        <button
          onClick={() => setFilterStatus('vacant')}
          className={`bg-gradient-to-br from-orange-50 to-orange-100 border rounded-lg p-4 text-left transition-all hover:shadow-lg ${
            filterStatus === 'vacant' ? 'border-orange-500 ring-2 ring-orange-300' : 'border-orange-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-700 font-medium">空置單位</p>
              <p className="text-3xl font-bold text-orange-900">
                {groupedProperties.reduce((sum, prop) => sum + getVacantUnitsCount(prop.units), 0)}
              </p>
            </div>
            <DoorOpen className="w-12 h-12 text-orange-600 opacity-50" />
          </div>
        </button>
      </div>

      <div className="space-y-3">
        {filteredProperties.map((property) => {
          const isExpanded = expandedGroups.has(property.mainAddress);
          const rentedCount = getRentedUnitsCount(property.units);
          const vacantCount = getVacantUnitsCount(property.units);
          const singleCase = property.units[0];

          return (
            <div key={property.mainAddress} className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
              {property.isSingleUnit ? (
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Building2 className="w-6 h-6 text-teal-600" />
                        <h3 className="text-lg font-bold text-gray-900">{singleCase.case_address}</h3>
                        <span className="text-sm text-gray-500">({singleCase.case_number})</span>
                      </div>
                      {singleCase.property_type && (
                        <div className="text-sm text-gray-600 mb-1">
                          物件類型：{singleCase.property_type} {singleCase.layout && `| ${singleCase.layout}`} {singleCase.area && `| ${singleCase.area}坪`}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingCase(singleCase)}
                        className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                        title="編輯"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      {singleCase.tenant_name ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          <DoorClosed className="w-4 h-4" />
                          已出租
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                          <DoorOpen className="w-4 h-4" />
                          空置
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">房東資訊</p>
                      <p className="text-sm font-medium text-gray-900">{singleCase.owner_name}</p>
                      {singleCase.owner_phone && (
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {singleCase.owner_phone}
                        </p>
                      )}
                    </div>
                    {singleCase.tenant_name && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">房客資訊</p>
                        <p className="text-sm font-medium text-gray-900">{singleCase.tenant_name}</p>
                        {singleCase.tenant_phone && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {singleCase.tenant_phone}
                          </p>
                        )}
                      </div>
                    )}
                    {singleCase.monthly_rent && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">月租金</p>
                        <p className="text-sm font-medium text-gray-900">NT$ {singleCase.monthly_rent.toLocaleString()}</p>
                      </div>
                    )}
                    {singleCase.contract_start_date && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">合約期間</p>
                        <p className="text-sm text-gray-600">
                          {singleCase.contract_start_date} ~ {singleCase.contract_end_date || '未設定'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    className="p-5 bg-gradient-to-r from-teal-50 to-blue-50 cursor-pointer hover:from-teal-100 hover:to-blue-100 transition-colors"
                    onClick={() => toggleGroup(property.mainAddress)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <ChevronDown className="w-6 h-6 text-teal-600" />
                        ) : (
                          <ChevronRight className="w-6 h-6 text-teal-600" />
                        )}
                        <Building2 className="w-7 h-7 text-teal-600" />
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{property.mainAddress}</h3>
                          <p className="text-sm text-gray-600">
                            共 {property.units.length} 個單位 | 已出租 {rentedCount} | 空置 {vacantCount}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          {rentedCount} 已租
                        </span>
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                          {vacantCount} 空置
                        </span>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-4">
                        {property.units.map((unit) => (
                          <div
                            key={unit.id}
                            className={`border rounded-lg p-4 relative ${
                              unit.tenant_name
                                ? 'border-green-200 bg-green-50'
                                : 'border-orange-200 bg-orange-50'
                            }`}
                          >
                            <button
                              onClick={() => setEditingCase(unit)}
                              className="absolute top-2 right-2 p-1.5 text-teal-600 hover:bg-white rounded-lg transition-colors"
                              title="編輯"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <div className="flex items-start justify-between mb-3 pr-8">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <MapPin className="w-4 h-4 text-gray-600" />
                                  <h4 className="font-bold text-gray-900">{unit.case_address}</h4>
                                </div>
                                <p className="text-xs text-gray-500">{unit.case_number}</p>
                              </div>
                              {unit.tenant_name ? (
                                <DoorClosed className="w-5 h-5 text-green-600" />
                              ) : (
                                <DoorOpen className="w-5 h-5 text-orange-600" />
                              )}
                            </div>

                            <div className="space-y-2 text-sm">
                              {unit.layout && (
                                <div className="text-gray-700">
                                  格局：{unit.layout} {unit.area && `| ${unit.area}坪`}
                                </div>
                              )}
                              <div className="text-gray-700">
                                房東：{unit.owner_name}
                              </div>
                              {unit.tenant_name ? (
                                <>
                                  <div className="text-gray-700 font-medium">
                                    房客：{unit.tenant_name}
                                  </div>
                                  {unit.tenant_phone && (
                                    <div className="text-gray-600 flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {unit.tenant_phone}
                                    </div>
                                  )}
                                  {unit.monthly_rent && (
                                    <div className="text-gray-900 font-semibold">
                                      月租：NT$ {unit.monthly_rent.toLocaleString()}
                                    </div>
                                  )}
                                  {unit.contract_start_date && (
                                    <div className="text-gray-600 text-xs flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {unit.contract_start_date} ~ {unit.contract_end_date || '未設定'}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-orange-700 font-medium">尚未出租</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filteredProperties.length === 0 && cases.length > 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-gray-200">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg">沒有符合條件的案件</p>
          </div>
        )}
      </div>

      {editingCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
              <div className="flex items-center gap-3">
                <Edit2 className="w-6 h-6 text-teal-600" />
                <h2 className="text-2xl font-bold text-gray-900">編輯案件資料</h2>
              </div>
              <button
                onClick={() => setEditingCase(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">案件編號</h3>
                <p className="text-gray-700">{editingCase.case_number}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">案件地址</h3>
                <p className="text-gray-700">{editingCase.case_address}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">經理人姓名</label>
                  <input
                    type="text"
                    value={editingCase.manager_name || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, manager_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">房東姓名</label>
                  <input
                    type="text"
                    value={editingCase.owner_name || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, owner_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">房東電話</label>
                  <input
                    type="text"
                    value={editingCase.owner_phone || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, owner_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">房東身份證號</label>
                  <input
                    type="text"
                    value={editingCase.owner_id_number || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, owner_id_number: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">房客姓名</label>
                  <input
                    type="text"
                    value={editingCase.tenant_name || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, tenant_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">房客電話</label>
                  <input
                    type="text"
                    value={editingCase.tenant_phone || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, tenant_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">物件類型</label>
                  <input
                    type="text"
                    value={editingCase.property_type || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, property_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">格局</label>
                  <input
                    type="text"
                    value={editingCase.layout || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, layout: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">坪數</label>
                  <input
                    type="text"
                    value={editingCase.area || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, area: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">月租金</label>
                  <input
                    type="number"
                    value={editingCase.monthly_rent || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, monthly_rent: Number(e.target.value) || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">管理費比例 (%)</label>
                  <input
                    type="number"
                    value={editingCase.management_fee_ratio || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, management_fee_ratio: Number(e.target.value) || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">管理費</label>
                  <input
                    type="number"
                    value={editingCase.management_fee || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, management_fee: Number(e.target.value) || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">水費</label>
                  <input
                    type="number"
                    value={editingCase.water_fee || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, water_fee: Number(e.target.value) || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電費</label>
                  <input
                    type="number"
                    value={editingCase.electricity_fee || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, electricity_fee: Number(e.target.value) || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">押金</label>
                  <input
                    type="number"
                    value={editingCase.deposit || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, deposit: Number(e.target.value) || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">繳款頻率</label>
                  <input
                    type="text"
                    value={editingCase.payment_frequency || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, payment_frequency: e.target.value })}
                    placeholder="例：月繳、季繳、半年繳"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">水電計費方式</label>
                  <input
                    type="text"
                    value={editingCase.water_electricity_billing || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, water_electricity_billing: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">承租日期</label>
                  <input
                    type="date"
                    value={editingCase.contract_start_date || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, contract_start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">期滿日期</label>
                  <input
                    type="date"
                    value={editingCase.contract_end_date || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, contract_end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">房租繳款日</label>
                  <input
                    type="date"
                    value={editingCase.rent_payment_date || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, rent_payment_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">水電結算日</label>
                  <input
                    type="date"
                    value={editingCase.utility_settlement_date || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, utility_settlement_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">付款狀態</label>
                  <input
                    type="text"
                    value={editingCase.payment_status || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, payment_status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">狀態</label>
                  <input
                    type="text"
                    value={editingCase.status || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">佣金</label>
                  <input
                    type="number"
                    value={editingCase.commission || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, commission: Number(e.target.value) || null })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">佣金備註</label>
                  <input
                    type="text"
                    value={editingCase.commission_notes || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, commission_notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">備註</label>
                  <textarea
                    value={editingCase.notes || ''}
                    onChange={(e) => setEditingCase({ ...editingCase, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setEditingCase(null)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? '儲存中...' : '儲存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
