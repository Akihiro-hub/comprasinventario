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

// シンプルなSVGグラフコンポーネント
const SimpleLineChart: React.FC<{
  data: Array<{day: number, inventory: number}>;
  reorderPoint: number;
  safetyStock: number;
  title: string;
}> = ({ data, reorderPoint, safetyStock, title }) => {
  // レスポンシブ対応: 画面サイズに応じてサイズを調整
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const width = isMobile ? 350 : 800;
  const height = isMobile ? 250 : 400;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const maxInventory = Math.max(...data.map(d => d.inventory), reorderPoint * 1.2);
  const minInventory = 0;

  const xScale = (day: number) => (day / (data.length - 1)) * chartWidth;
  const yScale = (inventory: number) => chartHeight - ((inventory - minInventory) / (maxInventory - minInventory)) * chartHeight;

  const pathData = data.map((d, i) => 
    `${i === 0 ? 'M' : 'L'} ${xScale(d.day)} ${yScale(d.inventory)}`
  ).join(' ');

  // モバイル用のフォントサイズとラベル調整
  const fontSize = isMobile ? 8 : 10;
  const labelFontSize = isMobile ? 10 : 12;
  const titleFontSize = isMobile ? 12 : 14;

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: isMobile ? '0.5rem' : '1rem', 
      borderRadius: '0.5rem', 
      border: '1px solid #e5e7eb',
      overflow: 'hidden'
    }}>
      <h4 style={{ 
        fontSize: isMobile ? '0.875rem' : '1rem', 
        fontWeight: '500', 
        color: '#111827', 
        marginBottom: '1rem',
        textAlign: 'center'
      }}>{title}</h4>
      <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        <svg width={width} height={height} style={{ minWidth: isMobile ? '350px' : 'auto', height: 'auto' }}>
        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {/* Grid lines */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <line
              key={i}
              x1={-5}
              y1={yScale(maxInventory * i / 5)}
              x2={chartWidth + 5}
              y2={yScale(maxInventory * i / 5)}
              stroke="#f1f5f9"
              strokeWidth={1}
            />
          ))}
          
          {/* Y-axis labels */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <text
              key={i}
              x={-10}
              y={yScale(maxInventory * i / 5) + 4}
              fill="#64748b"
              fontSize={fontSize}
              textAnchor="end"
            >
              {Math.round(maxInventory * i / 5)}
            </text>
          ))}
          
          {/* X-axis labels */}
          {(isMobile ? [0, 10, 20, 30] : [0, 5, 10, 15, 20, 25, 30]).map(day => (
            <text
              key={day}
              x={xScale(day)}
              y={chartHeight + 20}
              fill="#64748b"
              fontSize={fontSize}
              textAnchor="middle"
            >
              {day}
            </text>
          ))}
          
          {/* Main line */}
          <path
            d={pathData}
            fill="none"
            stroke="#1e40af"
            strokeWidth={3}
          />
          
          {/* Data points */}
          {data.map((d, i) => (
            <circle
              key={i}
              cx={xScale(d.day)}
              cy={yScale(d.inventory)}
              r={isMobile ? 1.5 : 2}
              fill="#1e40af"
            />
          ))}
          
          {/* Reorder point line */}
          <line
            x1={-5}
            y1={yScale(reorderPoint)}
            x2={chartWidth + 5}
            y2={yScale(reorderPoint)}
            stroke="#dc2626"
            strokeWidth={3}
            strokeDasharray="5,5"
          />
          
          {/* Safety stock line */}
          <line
            x1={-5}
            y1={yScale(safetyStock)}
            x2={chartWidth + 5}
            y2={yScale(safetyStock)}
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="5,5"
          />
          
          {/* Reorder point label with value */}
          <rect
            x={isMobile ? chartWidth - 140 : chartWidth - 180}
            y={yScale(reorderPoint) - 25}
            width={isMobile ? 135 : 175}
            height={isMobile ? 18 : 20}
            fill="white"
            stroke="#dc2626"
            strokeWidth={1}
            rx={3}
          />
          <text 
            x={isMobile ? chartWidth - 72 : chartWidth - 92} 
            y={yScale(reorderPoint) - 10} 
            fill="#dc2626" 
            fontSize={labelFontSize} 
            textAnchor="middle" 
            fontWeight="bold"
          >
            {isMobile ? `P.Reorden: ${Math.round(reorderPoint)}` : `Punto de Reorden: ${Math.round(reorderPoint)}`}
          </text>
          
          {/* Safety stock label with value */}
          <rect
            x={isMobile ? chartWidth - 150 : chartWidth - 200}
            y={yScale(safetyStock) - 25}
            width={isMobile ? 145 : 195}
            height={isMobile ? 18 : 20}
            fill="white"
            stroke="#f59e0b"
            strokeWidth={1}
            rx={3}
          />
          <text 
            x={isMobile ? chartWidth - 77 : chartWidth - 102} 
            y={yScale(safetyStock) - 10} 
            fill="#f59e0b" 
            fontSize={labelFontSize} 
            textAnchor="middle" 
            fontWeight="bold"
          >
            {isMobile ? `Inv.Seguridad: ${Math.round(safetyStock)}` : `Inventario de Seguridad: ${Math.round(safetyStock)}`}
          </text>
          
          {/* Axes */}
          <line x1={0} y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#475569" strokeWidth={2} />
          <line x1={0} y1={0} x2={0} y2={chartHeight} stroke="#475569" strokeWidth={2} />
          
          {/* Axis labels */}
          <text x={chartWidth / 2} y={chartHeight + 35} textAnchor="middle" fontSize={titleFontSize} fill="#374151" fontWeight="500">
            Días
          </text>
          <text x={-35} y={chartHeight / 2} textAnchor="middle" fontSize={titleFontSize} fill="#374151" fontWeight="500" transform={`rotate(-90, -35, ${chartHeight / 2})`}>
            {isMobile ? 'Unidades' : 'Unidades en Inventario'}
          </text>
        </g>
      </svg>
      </div>
      <div style={{ 
        marginTop: '1rem', 
        fontSize: isMobile ? '0.75rem' : '0.875rem', 
        color: '#6b7280', 
        lineHeight: '1.5',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0 }}>
          <span style={{ color: '#1e40af', fontWeight: '500' }}>━━━</span> Nivel de Inventario | 
          <span style={{ color: '#dc2626', fontWeight: '500' }}> ┅┅┅</span> Punto de Reorden ({Math.round(reorderPoint)} unidades) | 
          <span style={{ color: '#f59e0b', fontWeight: '500' }}> ┅┅┅</span> {isMobile ? 'Inv.' : 'Inventario'} de Seguridad ({Math.round(safetyStock)} unidades)
        </p>
      </div>
    </div>
  );
};

// ログインフォームコンポーネント
const LoginForm: React.FC<{ onLogin: (success: boolean) => void }> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState('');

  const correctPassword = 'edificar';
  const maxAttempts = 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (attempts >= maxAttempts) {
      setError('Acceso bloqueado. Intenta más tarde.');
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
        setError(`Contraseña incorrecta. Te quedan ${remaining} intento(s).`);
      } else {
        setError('Acceso bloqueado. Intenta más tarde.');
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
            Sistema de Gestión de Inventario
          </h1>
          <p style={{ color: '#6b7280' }}>Introduce la contraseña para acceder al sistema</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              Contraseña
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
              placeholder="Introduce la contraseña"
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
            Iniciar sesión
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          <p>Contraseña de demostración: edificar</p>
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
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    outline: 'none',
    fontSize: '1rem'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '1rem' }}>
          Consumo Diario de los Últimos 7 Días
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          Ingrese el volumen consumido para cada día:
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Volumen consumido hace 7 días</label>
              <input
                type="number"
                min="0"
                value={consumption.day7}
                onChange={(e) => handleChange('day7', Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Volumen consumido hace 6 días</label>
              <input
                type="number"
                min="0"
                value={consumption.day6}
                onChange={(e) => handleChange('day6', Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Volumen consumido hace 5 días</label>
              <input
                type="number"
                min="0"
                value={consumption.day5}
                onChange={(e) => handleChange('day5', Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Volumen consumido hace 4 días</label>
              <input
                type="number"
                min="0"
                value={consumption.day4}
                onChange={(e) => handleChange('day4', Number(e.target.value))}
                style={inputStyle}
              />
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Volumen consumido hace 3 días</label>
              <input
                type="number"
                min="0"
                value={consumption.day3}
                onChange={(e) => handleChange('day3', Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Volumen consumido hace 2 días</label>
              <input
                type="number"
                min="0"
                value={consumption.day2}
                onChange={(e) => handleChange('day2', Number(e.target.value))}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Volumen consumido ayer</label>
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
        borderRadius: '0.5rem'
      }}>
        <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0 }}>
          <strong>Total consumido en 7 días:</strong> {totalConsumption} unidades
        </p>
        <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: '0.25rem 0 0 0' }}>
          <strong>Promedio diario:</strong> {averageConsumption.toFixed(1)} unidades
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
      borderRadius: '0.75rem',
      boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb',
      padding: '1.5rem'
    }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '1rem' }}>
        Seleccionar Método de Gestión
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        <button
          onClick={() => onSystemChange('fixed-quantity')}
          style={{
            padding: '1.5rem',
            borderRadius: '0.5rem',
            border: selectedSystem === 'fixed-quantity' ? '2px solid #4f46e5' : '2px solid #e5e7eb',
            backgroundColor: selectedSystem === 'fixed-quantity' ? '#eef2ff' : 'white',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ marginRight: '0.5rem', fontSize: '1.5rem' }}>📦</span>
            <h3 style={{
              fontWeight: '500',
              color: selectedSystem === 'fixed-quantity' ? '#312e81' : '#111827',
              margin: 0,
              fontSize: '1rem'
            }}>
              Sistema de Cantidad Fija
            </h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            Pedidos de cantidad fija con intervalos variables. Basado en punto de reorden.
          </p>
        </button>

        <button
          onClick={() => onSystemChange('fixed-period')}
          style={{
            padding: '1.5rem',
            borderRadius: '0.5rem',
            border: selectedSystem === 'fixed-period' ? '2px solid #4f46e5' : '2px solid #e5e7eb',
            backgroundColor: selectedSystem === 'fixed-period' ? '#eef2ff' : 'white',
            cursor: 'pointer',
            transition: 'all 0.2s',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ marginRight: '0.5rem', fontSize: '1.5rem' }}>📅</span>
            <h3 style={{
              fontWeight: '500',
              color: selectedSystem === 'fixed-period' ? '#312e81' : '#111827',
              margin: 0,
              fontSize: '1rem'
            }}>
              Sistema de Período Fijo
            </h3>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
            Pedidos en intervalos fijos con cantidades variables. Basado en nivel objetivo.
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
  const [showResults, setShowResults] = useState(false);
  const [consumption, setConsumption] = useState<DailyConsumption>({
    day7: 10,
    day6: 6,
    day5: 17,
    day4: 14,
    day3: 10,
    day2: 6,
    day1: 7
  });

  const handleAnalyze = () => {
    setShowResults(true);
  };

  const totalConsumption = Object.values(consumption).reduce((sum, val) => sum + val, 0);
  const averageDailyDemand = totalConsumption / 7;
  const standardDeviation = calculateStandardDeviation(consumption);
  const zScore = calculateZScore(stockoutProbability);
  const safetyStock = calculateSafetyStock(zScore, standardDeviation, leadTime);
  const reorderPoint = (averageDailyDemand * leadTime) + safetyStock;

  // シミュレーションデータの生成
  const generateSimulationData = () => {
    const days = 30;
    const data = [];
    let currentInventory = reorderPoint * 3; // 初期在庫
    const orderQuantity = reorderPoint * 2; // 発注量
    let orderInTransit = 0;
    let orderArrivalDay = -1;

    for (let day = 0; day <= days; day++) {
      // 発注が到着する日かチェック
      if (day === orderArrivalDay && orderInTransit > 0) {
        currentInventory += orderInTransit;
        orderInTransit = 0;
        orderArrivalDay = -1;
      }

      // 日次消費（正規分布に基づく変動）
      if (day > 0) {
        const dailyConsumption = Math.max(0, 
          averageDailyDemand + (Math.random() - 0.5) * standardDeviation * 2
        );
        currentInventory -= dailyConsumption;
      }

      // 発注点に達したら発注（発注中でない場合のみ）
      if (currentInventory <= reorderPoint && orderInTransit === 0) {
        orderInTransit = orderQuantity;
        orderArrivalDay = day + leadTime;
      }

      data.push({
        day,
        inventory: Math.max(0, currentInventory)
      });
    }

    return data;
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    outline: 'none',
    fontSize: '1rem'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          📊 Sistema de Cantidad Fija
        </h2>
        <p style={{ color: '#6b7280' }}>
          Este sistema determina cuándo hacer el pedido según un nivel bajo de inventario.
        </p>
      </div>

      {/* Parámetros de Entrada */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '1rem' }}>
              Parámetros de Entrada
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Probabilidad aceptable de escasez de stock (%)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={stockoutProbability}
                  onChange={(e) => setStockoutProbability(Number(e.target.value))}
                  style={inputStyle}
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Porcentaje de probabilidad de quedarse sin stock que está dispuesto a aceptar
                </p>
              </div>

              <div>
                <label style={labelStyle}>Plazo de entrega para aprovisionamiento después del pedido (días)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={leadTime}
                  onChange={(e) => setLeadTime(Number(e.target.value))}
                  style={inputStyle}
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Días que transcurren desde que se hace el pedido hasta que se recibe
                </p>
              </div>
            </div>
          </div>

          <DailyConsumptionInputs
            consumption={consumption}
            onChange={setConsumption}
          />

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              onClick={handleAnalyze}
              style={{
                minWidth: '200px',
                padding: '0.875rem 2rem',
                backgroundColor: '#4f46e5',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(79, 70, 229, 0.3)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
            >
              Analizar
            </button>
          </div>
        </div>
      </div>

      {/* Resultados del Cálculo */}
      {showResults && (
        <>
          <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>Resultados del Cálculo</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                <div style={{
                  backgroundColor: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: '0.5rem',
                  padding: '1.25rem',
                  textAlign: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ marginRight: '0.5rem', fontSize: '1.5rem' }}>🛡️</span>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#92400e', margin: 0 }}>Inventario de Seguridad</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#78350f', margin: '0.25rem 0 0 0' }}>
                        {Math.round(safetyStock)} unidades
                      </p>
                    </div>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#fecaca',
                  border: '1px solid #dc2626',
                  borderRadius: '0.5rem',
                  padding: '1.25rem',
                  textAlign: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ marginRight: '0.5rem', fontSize: '1.5rem' }}>🎯</span>
                    <div>
                      <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#991b1b', margin: 0 }}>Punto de Reorden</p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7f1d1d', margin: '0.25rem 0 0 0' }}>
                        {Math.round(reorderPoint)} unidades
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
                  Información Adicional
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#374151' }}>
                  <p style={{ margin: 0 }}><strong>Demanda promedio diaria:</strong> {averageDailyDemand.toFixed(1)} unidades</p>
                  <p style={{ margin: 0 }}><strong>Desviación estándar de la demanda:</strong> {standardDeviation.toFixed(1)} unidades</p>
                  <p style={{ margin: 0 }}><strong>Coeficiente de variación:</strong> {((standardDeviation / averageDailyDemand) * 100).toFixed(1)}%</p>
                  <p style={{ margin: 0 }}><strong>Z-score (nivel de servicio):</strong> {zScore.toFixed(2)}</p>
                  <p style={{ margin: 0 }}><strong>Nivel de servicio:</strong> {(100 - stockoutProbability).toFixed(1)}%</p>
                  <p style={{ margin: 0 }}><strong>Fórmula aplicada:</strong> z × σ × √(tiempo de reposición)</p>
                </div>
              </div>
            </div>
          </div>

          {/* グラフ表示 */}
          <SimpleLineChart
            data={generateSimulationData()}
            reorderPoint={reorderPoint}
            safetyStock={safetyStock}
            title="Simulación del Sistema de Cantidad Fija"
          />
        </>
      )}
    </div>
  );
};

// 固定期間システムコンポーネント
const FixedPeriodSystem: React.FC = () => {
  const [stockoutProbability, setStockoutProbability] = useState(20);
  const [leadTime, setLeadTime] = useState(3);
  const [orderCycle, setOrderCycle] = useState(7);
  const [currentInventory, setCurrentInventory] = useState(80);
  const [showResults, setShowResults] = useState(false);
  const [consumption, setConsumption] = useState<DailyConsumption>({
    day7: 35,
    day6: 22,
    day5: 15,
    day4: 19,
    day3: 13,
    day2: 14,
    day1: 22
  });

  const handleAnalyze = () => {
    setShowResults(true);
  };

  const totalConsumption = Object.values(consumption).reduce((sum, val) => sum + val, 0);
  const averageDailyDemand = totalConsumption / 7;
  const standardDeviation = calculateStandardDeviation(consumption);
  const zScore = calculateZScore(stockoutProbability);
  
  const riskPeriod = orderCycle + leadTime;
  const safetyStock = calculateSafetyStock(zScore, standardDeviation, riskPeriod);
  const expectedDemand = averageDailyDemand * riskPeriod;
  const targetLevel = expectedDemand + safetyStock;
  const orderQuantity = Math.max(0, targetLevel - currentInventory);

  // 固定期間システム用の在庫予測データ生成
  const generateFixedPeriodProjectionData = () => {
    const totalDays = orderCycle + leadTime + 5;
    const data = [];
    let inventory = currentInventory;

    for (let day = 0; day <= totalDays; day++) {
      // 日次消費（0日目は消費なし）
      if (day > 0) {
        inventory -= averageDailyDemand;
      }

      // 最初の発注の到着（リードタイム + 1日目）
      if (day === leadTime + 1 && orderQuantity > 0) {
        inventory += orderQuantity;
      }

      // 2回目の発注の到着（サイクル + リードタイム + 1日目）
      if (day === orderCycle + leadTime + 1 && orderQuantity > 0) {
        inventory += orderQuantity;
      }

      data.push({
        day,
        inventory: Math.max(0, inventory)
      });
    }

    return data;
  };
  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    outline: 'none',
    fontSize: '1rem'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem'
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
          📅 Sistema de Período Fijo
        </h2>
        <p style={{ color: '#6b7280' }}>
          Este sistema determina cuánto pedir en intervalos de tiempo regulares.
        </p>
      </div>

      {/* Parámetros de Entrada */}
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '1rem' }}>
              Parámetros de Entrada
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Probabilidad aceptable de escasez de stock (%)</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={stockoutProbability}
                  onChange={(e) => setStockoutProbability(Number(e.target.value))}
                  style={inputStyle}
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Porcentaje de probabilidad de quedarse sin stock
                </p>
              </div>

              <div>
                <label style={labelStyle}>Plazo de entrega para aprovisionamiento después del pedido (días)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={leadTime}
                  onChange={(e) => setLeadTime(Number(e.target.value))}
                  style={inputStyle}
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Días desde el pedido hasta la recepción
                </p>
              </div>

              <div>
                <label style={labelStyle}>Período de ciclo para el sistema de pedidos periódicos (días)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={orderCycle}
                  onChange={(e) => setOrderCycle(Number(e.target.value))}
                  style={inputStyle}
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Intervalo de tiempo entre pedidos (tal como cada 7 días)
                </p>
              </div>

              <div>
                <label style={labelStyle}>Volumen del inventario que actualmente tenemos al momento de ordenar</label>
                <input
                  type="number"
                  min="0"
                  value={currentInventory}
                  onChange={(e) => setCurrentInventory(Number(e.target.value))}
                  style={inputStyle}
                />
                <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  Cantidad actual en inventario
                </p>
              </div>
            </div>
          </div>

          {/* グラフ表示 */}
          <SimpleLineChart
            data={generateFixedPeriodProjectionData()}
            reorderPoint={0} // 固定期間システムでは発注点は使用しない
            safetyStock={safetyStock}
            targetLevel={targetLevel}
            title="Proyección del Inventario - Sistema de Período Fijo"
            leadTime={leadTime}
            orderCycle={orderCycle}
            isFixedPeriod={true}
          />
        </>
          <DailyConsumptionInputs
            consumption={consumption}
            onChange={setConsumption}
          />

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button
              onClick={handleAnalyze}
              style={{
                minWidth: '200px',
                padding: '0.875rem 2rem',
                backgroundColor: '#4f46e5',
                color: 'white',
                borderRadius: '0.5rem',
                border: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(79, 70, 229, 0.3)'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4338ca'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
            >
              Analizar
            </button>
          </div>
        </div>
      </div>

      {/* Resultados del Cálculo */}
      {showResults && (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827' }}>Resultados del Cálculo</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '0.5rem',
                padding: '1.25rem',
                textAlign: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ marginRight: '0.5rem', fontSize: '1.5rem' }}>🛡️</span>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#92400e', margin: 0 }}>Inventario de Seguridad</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#78350f', margin: '0.25rem 0 0 0' }}>
                      {Math.round(safetyStock)} unidades
                    </p>
                  </div>
                </div>
              </div>

              <div style={{
                backgroundColor: '#dbeafe',
                border: '1px solid #3b82f6',
                borderRadius: '0.5rem',
                padding: '1.25rem',
                textAlign: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ marginRight: '0.5rem', fontSize: '1.5rem' }}>📦</span>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e40af', margin: 0 }}>Cantidad a Pedir</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e3a8a', margin: '0.25rem 0 0 0' }}>
                      {Math.round(orderQuantity)} unidades
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
                <span style={{ marginRight: '0.5rem', fontSize: '1.25rem' }}>
                  {orderQuantity > 0 ? '✅' : '⚠️'}
                </span>
                <div>
                  <p style={{
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: orderQuantity > 0 ? '#166534' : '#1e40af',
                    margin: 0
                  }}>
                    Recomendación
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: orderQuantity > 0 ? '#15803d' : '#1d4ed8',
                    margin: '0.25rem 0 0 0'
                  }}>
                    {orderQuantity > 0 
                      ? `Realizar pedido de ${Math.round(orderQuantity)} unidades`
                      : 'No es necesario realizar pedido en este momento'
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
                Información Adicional
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: '#374151' }}>
                <p style={{ margin: 0 }}><strong>Demanda promedio diaria:</strong> {averageDailyDemand.toFixed(1)} unidades</p>
                <p style={{ margin: 0 }}><strong>Desviación estándar de la demanda:</strong> {standardDeviation.toFixed(1)} unidades</p>
                <p style={{ margin: 0 }}><strong>Coeficiente de variación:</strong> {((standardDeviation / averageDailyDemand) * 100).toFixed(1)}%</p>
                <p style={{ margin: 0 }}><strong>Período de riesgo:</strong> {riskPeriod} días</p>
                <p style={{ margin: 0 }}><strong>Demanda esperada (período de riesgo):</strong> {Math.round(expectedDemand)} unidades</p>
                <p style={{ margin: 0 }}><strong>Nivel objetivo de inventario:</strong> {Math.round(targetLevel)} unidades</p>
                <p style={{ margin: 0 }}><strong>Nivel de servicio:</strong> {(100 - stockoutProbability).toFixed(1)}%</p>
                <p style={{ margin: 0 }}><strong>Fórmula aplicada:</strong> z × σ × √(ciclo + tiempo de reposición)</p>
              </div>
            </div>
          </div>
        </div>
      )}
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
            📦 Sistema de Gestión de Inventario
          </h1>
          <p style={{ color: '#6b7280' }}>
            Cálculo de inventario para sistemas de cantidad fija y período fijo
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
        {selectedSystem === 'fixed-quantity' ? (
          <FixedQuantitySystem />
        ) : (
          <FixedPeriodSystem />
        )}

        {/* フッター */}
        <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' }}>
          <p>📊 Sistema de cálculo de inventario basado en teoría estadística</p>
          <p>Desarrollado para gestión de inventario</p>
        </div>
      </div>
    </div>
  );
}

export default App;