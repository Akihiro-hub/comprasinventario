import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar } from 'recharts';

interface InventoryProjectionChartProps {
  currentInventory: number;
  orderQuantity: number;
  averageDailyDemand: number;
  safetyStock: number;
  leadTime: number;
  orderCycle: number;
  targetLevel: number;
}

const InventoryProjectionChart: React.FC<InventoryProjectionChartProps> = ({
  currentInventory,
  orderQuantity,
  averageDailyDemand,
  safetyStock,
  leadTime,
  orderCycle,
  targetLevel
}) => {
  // 在庫予測データの生成
  const generateProjectionData = () => {
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
        inventory: Math.max(0, inventory),
        safetyStock,
        targetLevel
      });
    }

    return data;
  };

  // 比較データの生成
  const generateComparisonData = () => {
    const expectedDemand = averageDailyDemand * (orderCycle + leadTime);
    
    return [
      { category: '現在在庫', value: currentInventory, color: '#3b82f6' },
      { category: '安全在庫', value: safetyStock, color: '#f59e0b' },
      { category: '期待需要', value: expectedDemand, color: '#10b981' },
      { category: '目標レベル', value: targetLevel, color: '#dc2626' }
    ];
  };

  const projectionData = generateProjectionData();
  const comparisonData = generateComparisonData();

  return (
    <div className="space-y-6">
      {/* 在庫予測チャート */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-md font-medium text-gray-900 mb-3">在庫レベル予測</h4>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="day" 
                label={{ value: '日数', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                label={{ value: '在庫数量', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value, name) => {
                  const labels: { [key: string]: string } = {
                    inventory: '予測在庫',
                    safetyStock: '安全在庫',
                    targetLevel: '目標レベル'
                  };
                  return [Math.round(Number(value)), labels[name] || name];
                }}
                labelFormatter={(day) => `${day}日目`}
              />
              <Line 
                type="monotone" 
                dataKey="inventory" 
                stroke="#2563eb" 
                strokeWidth={2}
                name="inventory"
                dot={false}
              />
              <ReferenceLine 
                y={safetyStock} 
                stroke="#f59e0b" 
                strokeDasharray="5 5"
                label={{ value: "安全在庫", position: "insideTopRight" }}
              />
              <ReferenceLine 
                x={leadTime + 1} 
                stroke="#10b981" 
                strokeDasharray="3 3"
                label={{ value: "1回目到着", position: "insideTopLeft" }}
              />
              <ReferenceLine 
                x={orderCycle + leadTime + 1} 
                stroke="#2563eb" 
                strokeDasharray="3 3"
                label={{ value: "2回目到着", position: "insideTopLeft" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>緑の破線は最初の発注到着、青の破線は次の発注到着を示しています。</p>
        </div>
      </div>

      {/* 在庫レベル比較チャート */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="text-md font-medium text-gray-900 mb-3">在庫レベル比較</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis label={{ value: '数量', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value) => [Math.round(Number(value)), '数量']}
              />
              <Bar 
                dataKey="value" 
                fill={(entry) => entry.color}
                name="数量"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p>各在庫レベルの比較を示しています。目標レベルが期待需要と安全在庫の合計になります。</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryProjectionChart;