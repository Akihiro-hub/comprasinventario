import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface InventorySimulationChartProps {
  reorderPoint: number;
  safetyStock: number;
  averageDailyDemand: number;
  standardDeviation: number;
  leadTime: number;
}

const InventorySimulationChart: React.FC<InventorySimulationChartProps> = ({
  reorderPoint,
  safetyStock,
  averageDailyDemand,
  standardDeviation,
  leadTime
}) => {
  // シミュレーションデータの生成
  const generateSimulationData = () => {
    const days = 30;
    const data = [];
    let currentInventory = reorderPoint * 3; // 初期在庫を発注点の3倍に設定
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
        inventory: Math.max(0, currentInventory),
        reorderPoint,
        safetyStock
      });
    }

    return data;
  };

  const simulationData = generateSimulationData();

  return (
    <div className="bg-white p-4 rounded-lg border">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={simulationData}>
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
                  inventory: '在庫レベル',
                  reorderPoint: '発注点',
                  safetyStock: '安全在庫'
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
              y={reorderPoint} 
              stroke="#dc2626" 
              strokeDasharray="5 5"
              label={{ value: "発注点", position: "topRight" }}
            />
            <ReferenceLine 
              y={safetyStock} 
              stroke="#f59e0b" 
              strokeDasharray="5 5"
              label={{ value: "安全在庫", position: "topRight" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-sm text-gray-600">
        <p>このシミュレーションは需要の変動を考慮した在庫レベルの推移を示しています。</p>
        <p>青線が在庫レベル、赤の破線が発注点、オレンジの破線が安全在庫レベルです。</p>
      </div>
    </div>
  );
};

export default InventorySimulationChart;