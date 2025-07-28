import React, { useState } from 'react';

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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '2rem',
        width: '100%',
        maxWidth: '28rem'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            margin: '0 auto',
            width: '4rem',
            height: '4rem',
            backgroundColor: '#e0e7ff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            🔒
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
            在庫管理システム
          </h1>
          <p style={{ color: '#6b7280' }}>システムにアクセスするにはパスワードを入力してください</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              パスワード
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                outline: 'none'
              }}
              placeholder="パスワードを入力"
              disabled={attempts >= maxAttempts}
            />
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#dc2626',
              backgroundColor: '#fef2f2',
              padding: '0.75rem',
              borderRadius: '0.375rem'
            }}>
              ⚠️
              <span style={{ fontSize: '0.875rem' }}>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={attempts >= maxAttempts}
            style={{
              width: '100%',
              backgroundColor: attempts >= maxAttempts ? '#9ca3af' : '#4f46e5',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: attempts >= maxAttempts ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            ログイン
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
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

  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.25rem'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '1rem' }}>
          過去7日間の日次消費量
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          各日の消費量を入力してください：
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>7日前の消費量</label>
              <input
                type="number"
                min="0"
                value={consumption.day7}
                onChange={(e) => handleChange('day7', Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>6日前の消費量</label>
              <input
                type="number"
                min="0"
                value={consumption.day6}
                onChange={(e) => handleChange('day6', Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>5日前の消費量</label>
              <input
                type="number"
                min="0"
                value={consumption.day5}
                onChange={(e) => handleChange('day5', Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>4日前の消費量</label>
              <input
                type="number"
                min="0"
                value={consumption.day4}
                onChange={(e) => handleChange('day4', Number(e.target.value))}
                style={inputStyle}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>3日前の消費量</label>
              <input
                type="number"
                min="0"
                value={consumption.day3}
                onChange={(e) => handleChange('day3', Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>2日前の消費量</label>
              <input
                type="number"
                min="0"
                value={consumption.day2}
                onChange={(e) => handleChange('day2', Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>昨日の消費量</label>
              <input
                type="number"
                min="0"
                value={consumption.day1}
                onChange={(e) => handleChange('day1', Number(e.target.value))}
                style={inputStyle}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{
        backgroundColor: '#dbeafe',
        padding: '1rem',
        borderRadius: '0.375rem'
      }}>
        <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>
          <strong>7日間の合計消費量:</strong> {totalConsumption} 単位
        </p>
        <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>
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
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      padding: '1.5rem'
    }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '1rem' }}>
        管理システムを選択
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <button
          onClick={() => onSystemChange('fixed-quantity')}
          style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            border: selectedSystem === 'fixed-quantity' ? '2px solid #4f46e5' : '2px solid #e5e7eb',
            backgroundColor: selectedSystem === 'fixed-quantity' ? '#eef2ff' : 'white',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ marginRight: '0.5rem' }}>📦</span>
            <h3 style={{
              fontWeight: '500',
              color: selectedSystem === 'fixed-quantity' ? '#312e81' : '#111827',
              margin: 0
            }}>
              固定数量システム
            </h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'left', margin: 0 }}>
            固定数量を発注し、間隔は変動します。発注点に基づいて管理します。
          </p>
        </button>

        <button
          onClick={() => onSystemChange('fixed-period')}
          style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            border: selectedSystem === 'fixed-period' ? '2px solid #4f46e5' : '2px solid #e5e7eb',
            backgroundColor: selectedSystem === 'fixed-period' ? '#eef2ff' : 'white',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ marginRight: '0.5rem' }}>📅</span>
            <h3 style={{
              fontWeight: '500',
              color: selectedSystem === 'fixed-period' ? '#312e81' : '#111827',
              margin: 0
            }}>
              固定期間システム
            </h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'left', margin: 0 }}>
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

  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          📊 固定数量システム
        </h2>
        <p style={{ color: '#6b7280' }}>
          このシステムは在庫レベルが低くなったときに発注するタイミングを決定します。
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* 入力パラメータ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '1rem' }}>
              入力パラメータ
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>欠品許容確率 (%)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={stockoutProbability}
                  onChange={(e) => setStockoutProbability(Number(e.target.value))}
                  style={inputStyle}
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  在庫切れを許容する確率のパーセンテージ
                </p>
              </div>

              <div>
                <label style={labelStyle}>発注後の納期 (日)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={leadTime}
                  onChange={(e) => setLeadTime(Number(e.target.value))}
                  style={inputStyle}
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>計算結果</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '0.5rem' }}>🛡️</span>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#92400e' }}>安全在庫</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#78350f' }}>
                    {Math.round(safetyStock)} 単位
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#fecaca',
              border: '1px solid #dc2626',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '0.5rem' }}>🎯</span>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#991b1b' }}>発注点</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7f1d1d' }}>
                    {Math.round(reorderPoint)} 単位
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#f9fafb',
            padding: '1rem',
            borderRadius: '0.5rem'
          }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '500',
              color: '#111827',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '0.5rem' }}>ℹ️</span>
              詳細情報
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#374151' }}>
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

  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    outline: 'none'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          📅 固定期間システム
        </h2>
        <p style={{ color: '#6b7280' }}>
          このシステムは定期的な間隔で発注する数量を決定します。
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* 入力パラメータ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '1rem' }}>
              入力パラメータ
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>欠品許容確率 (%)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={stockoutProbability}
                  onChange={(e) => setStockoutProbability(Number(e.target.value))}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>発注後の納期 (日)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={leadTime}
                  onChange={(e) => setLeadTime(Number(e.target.value))}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>発注サイクル (日)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={orderCycle}
                  onChange={(e) => setOrderCycle(Number(e.target.value))}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>現在の在庫量</label>
                <input
                  type="number"
                  min="0"
                  value={currentInventory}
                  onChange={(e) => setCurrentInventory(Number(e.target.value))}
                  style={inputStyle}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>計算結果</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '0.5rem' }}>🛡️</span>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#92400e' }}>安全在庫</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#78350f' }}>
                    {Math.round(safetyStock)} 単位
                  </p>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: '#dbeafe',
              border: '1px solid #3b82f6',
              borderRadius: '0.5rem',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '0.5rem' }}>📦</span>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e40af' }}>発注数量</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e3a8a' }}>
                    {Math.round(orderQuantity)} 単位
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 推奨事項 */}
          <div style={{
            padding: '1rem',
            borderRadius: '0.5rem',
            backgroundColor: orderQuantity > 0 ? '#dcfce7' : '#dbeafe',
            border: orderQuantity > 0 ? '1px solid #16a34a' : '1px solid #3b82f6'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: '0.5rem' }}>
                {orderQuantity > 0 ? '✅' : '⚠️'}
              </span>
              <div>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: orderQuantity > 0 ? '#166534' : '#1e40af'
                }}>
                  推奨事項
                </p>
                <p style={{
                  fontSize: '0.875rem',
                  color: orderQuantity > 0 ? '#15803d' : '#1d4ed8'
                }}>
                  {orderQuantity > 0 
                    ? `${Math.round(orderQuantity)} 単位の発注を推奨します`
                    : '現時点では発注の必要はありません'
                  }
                </p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: '#f9fafb',
            padding: '1rem',
            borderRadius: '0.5rem'
          }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: '500',
              color: '#111827',
              marginBottom: '0.75rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <span style={{ marginRight: '0.5rem' }}>ℹ️</span>
              詳細情報
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#374151' }}>
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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* ヘッダー */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
            📦 在庫管理システム
          </h1>
          <p style={{ color: '#6b7280' }}>
            固定数量システムと固定期間システムによる在庫計算
          </p>
        </div>

        {/* システム選択 */}
        <div style={{ marginBottom: '2rem' }}>
          <SystemSelector
            selectedSystem={selectedSystem}
            onSystemChange={setSelectedSystem}
          />
        </div>

        {/* メインコンテンツ */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb',
          padding: '1.5rem'
        }}>
          {selectedSystem === 'fixed-quantity' ? (
            <FixedQuantitySystem />
          ) : (
            <FixedPeriodSystem />
          )}
        </div>

        {/* フッター */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          <p>📊 統計理論に基づく在庫計算システム</p>
          <p>在庫管理の最適化をサポートします</p>
        </div>
      </div>
    </div>
  );
}

export default App;