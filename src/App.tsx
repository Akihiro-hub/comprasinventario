import React, { useState } from 'react';
import { Lock, Shield, Target, Package, Calendar, Info, CheckCircle, AlertCircle } from 'lucide-react';

// 型定義
interface DailyConsumption {
  day7: number;
  day6: number;
  day5: number;
  day4: number;
  day3: number;
  day2: number;
  day1: number;
}

// 計算関数
function calculateZScore(stockoutProbability: number): number {
  const serviceLevel = (100 - stockoutProbability) / 100;
  
  // 正規分布の逆関数の近似計算
  const t = Math.sqrt(-2 * Math.log(1 - serviceLevel));
  const c0 = 2.515517;
  const c1 = 0.802853;
  const c2 = 0.010328;
  const d1 = 1.432788;
  const d2 = 0.189269;
  const d3 = 0.001308;
  
  const zScore = t - (c0 + c1 * t + c2 * t * t) / (1 + d1 * t + d2 * t * t + d3 * t * t * t);
  return zScore;
}

function calculateStandardDeviation(consumption: DailyConsumption): number {
  const values = [
    consumption.day7,
    consumption.day6,
    consumption.day5,
    consumption.day4,
    consumption.day3,
    consumption.day2,
    consumption.day1
  ];
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (values.length - 1);
  
  return Math.sqrt(variance);
}

function calculateSafetyStock(zScore: number, standardDeviation: number, timeHorizon: number): number {
  return zScore * standardDeviation * Math.sqrt(timeHorizon);
}

// ログインフォームコンポーネント
const LoginForm: React.FC<{ onLogin: (success: boolean) => void }> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');

  const correctPassword = 'inventory2024';
  const maxAttempts = 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (attempts >= maxAttempts) {
      setError('アクセスがブロックされました。しばらく時間をおいてから再試行してください。');
      return;
    }

    if (password === correctPassword) {
      onLogin(true);
      setError('');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      const remaining = maxAttempts - newAttempts;
      
      if (remaining > 0) {
        setError(`パスワードが間違っています。残り${remaining}回の試行が可能です。`);
      } else {
        setError('アクセスがブロックされました。しばらく時間をおいてから再試行してください。');
      }
    }
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">在庫管理システム</h1>
          <p className="text-gray-600">システムにアクセスするにはパスワードを入力してください</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="パスワードを入力"
              disabled={attempts >= maxAttempts}
            />
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={attempts >= maxAttempts}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            ログイン
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>デモ用パスワード: inventory2024</p>
        </div>
      </div>
    </div>
  );
};

// 日次消費入力コンポーネント
const DailyConsumptionInputs: React.FC<{
  consumption: DailyConsumption;
  onChange: (consumption: DailyConsumption) => void;
}> = ({ consumption, onChange }) => {
  const handleChange = (field: keyof DailyConsumption, value: number) => {
    onChange({
      ...consumption,
      [field]: value
    });
  };

  const totalConsumption = Object.values(consumption).reduce((sum, val) => sum + val, 0);
  const averageConsumption = totalConsumption / 7;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">過去7日間の日次消費量</h3>
        <p className="text-sm text-gray-600 mb-4">各日の消費量を入力してください：</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">7日前の消費量</label>
              <input
                type="number"
                min="0"
                value={consumption.day7}
                onChange={(e) => handleChange('day7', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">6日前の消費量</label>
              <input
                type="number"
                min="0"
                value={consumption.day6}
                onChange={(e) => handleChange('day6', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">5日前の消費量</label>
              <input
                type="number"
                min="0"
                value={consumption.day5}
                onChange={(e) => handleChange('day5', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">4日前の消費量</label>
              <input
                type="number"
                min="0"
                value={consumption.day4}
                onChange={(e) => handleChange('day4', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">3日前の消費量</label>
              <input
                type="number"
                min="0"
                value={consumption.day3}
                onChange={(e) => handleChange('day3', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">2日前の消費量</label>
              <input
                type="number"
                min="0"
                value={consumption.day2}
                onChange={(e) => handleChange('day2', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">昨日の消費量</label>
              <input
                type="number"
                min="0"
                value={consumption.day1}
                onChange={(e) => handleChange('day1', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>7日間の合計消費量:</strong> {totalConsumption} 単位
        </p>
        <p className="text-sm text-blue-800">
          <strong>1日平均消費量:</strong> {averageConsumption.toFixed(1)} 単位
        </p>
      </div>
    </div>
  );
};

// システム選択コンポーネント
const SystemSelector: React.FC<{
  selectedSystem: 'fixed-quantity' | 'fixed-period';
  onSystemChange: (system: 'fixed-quantity' | 'fixed-period') => void;
}> = ({ selectedSystem, onSystemChange }) => {
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
    </div>
  );
};

// 固定数量システムコンポーネント
const FixedQuantitySystem: React.FC = () => {
  const [stockoutProbability, setStockoutProbability] = useState(10);
  const [leadTime, setLeadTime] = useState(3);
  const [consumption, setConsumption] = useState<DailyConsumption>({
    day7: 10,
    day6: 6,
    day5: 17,
    day4: 14,
    day3: 10,
    day2: 6,
    day1: 7
  });

  const totalConsumption = Object.values(consumption).reduce((sum, val) => sum + val, 0);
  const averageDailyDemand = totalConsumption / 7;
  const standardDeviation = calculateStandardDeviation(consumption);
  const zScore = calculateZScore(stockoutProbability);
  const safetyStock = calculateSafetyStock(zScore, standardDeviation, leadTime);
  const reorderPoint = (averageDailyDemand * leadTime) + safetyStock;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📊 固定数量システム</h2>
        <p className="text-gray-600">このシステムは在庫レベルが低くなったときに発注するタイミングを決定します。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 入力パラメータ */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">入力パラメータ</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  欠品許容確率 (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={stockoutProbability}
                  onChange={(e) => setStockoutProbability(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  在庫切れを許容する確率のパーセンテージ
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  発注後の納期 (日)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={leadTime}
                  onChange={(e) => setLeadTime(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  発注してから商品が到着するまでの日数
                </p>
              </div>
            </div>
          </div>

          <DailyConsumptionInputs
            consumption={consumption}
            onChange={setConsumption}
          />
        </div>

        {/* 計算結果 */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">計算結果</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-orange-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-orange-800">安全在庫</p>
                  <p className="text-2xl font-bold text-orange-900">{Math.round(safetyStock)} 単位</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <Target className="w-6 h-6 text-red-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-red-800">発注点</p>
                  <p className="text-2xl font-bold text-red-900">{Math.round(reorderPoint)} 単位</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              詳細情報
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>1日平均需要:</strong> {averageDailyDemand.toFixed(1)} 単位</p>
              <p><strong>需要の標準偏差:</strong> {standardDeviation.toFixed(1)} 単位</p>
              <p><strong>変動係数:</strong> {((standardDeviation / averageDailyDemand) * 100).toFixed(1)}%</p>
              <p><strong>Z値 (サービスレベル):</strong> {zScore.toFixed(2)}</p>
              <p><strong>サービスレベル:</strong> {(100 - stockoutProbability).toFixed(1)}%</p>
              <p><strong>適用式:</strong> z × σ × √(納期)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 固定期間システムコンポーネント
const FixedPeriodSystem: React.FC = () => {
  const [stockoutProbability, setStockoutProbability] = useState(20);
  const [leadTime, setLeadTime] = useState(3);
  const [orderCycle, setOrderCycle] = useState(7);
  const [currentInventory, setCurrentInventory] = useState(80);
  const [consumption, setConsumption] = useState<DailyConsumption>({
    day7: 35,
    day6: 22,
    day5: 15,
    day4: 19,
    day3: 13,
    day2: 14,
    day1: 22
  });

  const totalConsumption = Object.values(consumption).reduce((sum, val) => sum + val, 0);
  const averageDailyDemand = totalConsumption / 7;
  const standardDeviation = calculateStandardDeviation(consumption);
  const zScore = calculateZScore(stockoutProbability);
  
  const riskPeriod = orderCycle + leadTime;
  const safetyStock = calculateSafetyStock(zScore, standardDeviation, riskPeriod);
  const expectedDemand = averageDailyDemand * riskPeriod;
  const targetLevel = expectedDemand + safetyStock;
  const orderQuantity = Math.max(0, targetLevel - currentInventory);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">📅 固定期間システム</h2>
        <p className="text-gray-600">このシステムは定期的な間隔で発注する数量を決定します。</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 入力パラメータ */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">入力パラメータ</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  欠品許容確率 (%)
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={stockoutProbability}
                  onChange={(e) => setStockoutProbability(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  発注後の納期 (日)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={leadTime}
                  onChange={(e) => setLeadTime(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  発注サイクル (日)
                </label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={orderCycle}
                  onChange={(e) => setOrderCycle(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  現在の在庫量
                </label>
                <input
                  type="number"
                  min="0"
                  value={currentInventory}
                  onChange={(e) => setCurrentInventory(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <DailyConsumptionInputs
            consumption={consumption}
            onChange={setConsumption}
          />
        </div>

        {/* 計算結果 */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">計算結果</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-orange-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-orange-800">安全在庫</p>
                  <p className="text-2xl font-bold text-orange-900">{Math.round(safetyStock)} 単位</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Package className="w-6 h-6 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-800">発注数量</p>
                  <p className="text-2xl font-bold text-blue-900">{Math.round(orderQuantity)} 単位</p>
                </div>
              </div>
            </div>
          </div>

          {/* 推奨事項 */}
          <div className={`p-4 rounded-lg ${orderQuantity > 0 ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center">
              {orderQuantity > 0 ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
              )}
              <div>
                <p className={`text-sm font-medium ${orderQuantity > 0 ? 'text-green-800' : 'text-blue-800'}`}>
                  推奨事項
                </p>
                <p className={`text-sm ${orderQuantity > 0 ? 'text-green-700' : 'text-blue-700'}`}>
                  {orderQuantity > 0 
                    ? `${Math.round(orderQuantity)} 単位の発注を推奨します`
                    : '現時点では発注の必要はありません'
                  }
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              詳細情報
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>1日平均需要:</strong> {averageDailyDemand.toFixed(1)} 単位</p>
              <p><strong>需要の標準偏差:</strong> {standardDeviation.toFixed(1)} 単位</p>
              <p><strong>変動係数:</strong> {((standardDeviation / averageDailyDemand) * 100).toFixed(1)}%</p>
              <p><strong>リスク期間:</strong> {riskPeriod} 日</p>
              <p><strong>期待需要 (リスク期間):</strong> {Math.round(expectedDemand)} 単位</p>
              <p><strong>目標在庫レベル:</strong> {Math.round(targetLevel)} 単位</p>
              <p><strong>サービスレベル:</strong> {(100 - stockoutProbability).toFixed(1)}%</p>
              <p><strong>適用式:</strong> z × σ × √(サイクル + 納期)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// メインアプリコンポーネント
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