import React from 'react';
import { Package, Calendar } from 'lucide-react';

interface SystemSelectorProps {
  selectedSystem: 'fixed-quantity' | 'fixed-period';
  onSystemChange: (system: 'fixed-quantity' | 'fixed-period') => void;
}

const SystemSelector: React.FC<SystemSelectorProps> = ({ selectedSystem, onSystemChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">管理システムを選択</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onSystemChange('fixed-quantity')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedSystem === 'fixed-quantity'
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center mb-2">
            <Package className={`w-6 h-6 mr-2 ${
              selectedSystem === 'fixed-quantity' ? 'text-indigo-600' : 'text-gray-600'
            }`} />
            <h3 className={`font-medium ${
              selectedSystem === 'fixed-quantity' ? 'text-indigo-900' : 'text-gray-900'
            }`}>
              固定数量システム
            </h3>
          </div>
          <p className="text-sm text-gray-600 text-left">
            固定数量を発注し、間隔は変動します。発注点に基づいて管理します。
          </p>
        </button>

        <button
          onClick={() => onSystemChange('fixed-period')}
          className={`p-4 rounded-lg border-2 transition-all ${
            selectedSystem === 'fixed-period'
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="flex items-center mb-2">
            <Calendar className={`w-6 h-6 mr-2 ${
              selectedSystem === 'fixed-period' ? 'text-indigo-600' : 'text-gray-600'
            }`} />
            <h3 className={`font-medium ${
              selectedSystem === 'fixed-period' ? 'text-indigo-900' : 'text-gray-900'
            }`}>
              固定期間システム
            </h3>
          </div>
          <p className="text-sm text-gray-600 text-left">
            固定間隔で発注し、数量は変動します。目標レベルに基づいて管理します。
          </p>
        </button>
      </div>

      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">ℹ️ システムの特徴</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p><strong>固定数量システム:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>発注数量は一定</li>
              <li>発注間隔は変動</li>
              <li>発注点で管理</li>
              <li>継続的な在庫監視が必要</li>
            </ul>
          </div>
          <div>
            <p><strong>固定期間システム:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>発注間隔は一定</li>
              <li>発注数量は変動</li>
              <li>目標レベルで管理</li>
              <li>定期的な在庫確認</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSelector;