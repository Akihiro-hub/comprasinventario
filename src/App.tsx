import React, { useState } from 'react';
import LoginForm from './components/LoginForm';
import SystemSelector from './components/SystemSelector';
import FixedQuantitySystem from './components/FixedQuantitySystem';
import FixedPeriodSystem from './components/FixedPeriodSystem';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<'fixed-quantity' | 'fixed-period'>('fixed-quantity');

  if (!isAuthenticated) {
    return <LoginForm onLogin={setIsAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 在庫管理システム</h1>
          <p className="text-gray-600">固定数量システムと固定期間システムによる在庫計算</p>
        </div>

        {/* システム選択 */}
        <div className="mb-8">
          <SystemSelector
            selectedSystem={selectedSystem}
            onSystemChange={setSelectedSystem}
          />
        </div>

        {/* メインコンテンツ */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          {selectedSystem === 'fixed-quantity' ? (
            <FixedQuantitySystem />
          ) : (
            <FixedPeriodSystem />
          )}
        </div>

        {/* フッター */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>📊 統計理論に基づく在庫計算システム</p>
          <p>在庫管理の最適化をサポートします</p>
        </div>
      </div>
    </div>
  );
}

export default App;