import React, { useState } from 'react';
import { Shield, Target, Info } from 'lucide-react';
import DailyConsumptionInputs from './DailyConsumptionInputs';
import InventorySimulationChart from './InventorySimulationChart';
import { DailyConsumption } from '../types/inventory';
import { calculateFixedQuantitySystem } from '../utils/calculations';

const FixedQuantitySystem: React.FC = () => {
  const [stockoutProbability, setStockoutProbability] = useState(10);
  const [leadTime, setLeadTime] = useState(3);
  const [showChart, setShowChart] = useState(false);
  const [consumption, setConsumption] = useState<DailyConsumption>({
    day7: 10,
    day6: 6,
    day5: 17,
    day4: 14,
    day3: 10,
    day2: 6,
    day1: 7
  });

  const results = calculateFixedQuantitySystem(stockoutProbability, leadTime, consumption);

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
            showChart={showChart}
          />

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showChart}
                onChange={(e) => setShowChart(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2 text-sm text-gray-700">日次消費グラフを表示</span>
            </label>
          </div>
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
                  <p className="text-2xl font-bold text-orange-900">{Math.round(results.safetyStock)} 単位</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <Target className="w-6 h-6 text-red-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-red-800">発注点</p>
                  <p className="text-2xl font-bold text-red-900">{Math.round(results.reorderPoint!)} 単位</p>
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
              <p><strong>1日平均需要:</strong> {results.averageDailyDemand.toFixed(1)} 単位</p>
              <p><strong>需要の標準偏差:</strong> {results.standardDeviation.toFixed(1)} 単位</p>
              <p><strong>変動係数:</strong> {((results.standardDeviation / results.averageDailyDemand) * 100).toFixed(1)}%</p>
              <p><strong>Z値 (サービスレベル):</strong> {results.zScore.toFixed(2)}</p>
              <p><strong>サービスレベル:</strong> {results.serviceLevel.toFixed(1)}%</p>
              <p><strong>適用式:</strong> z × σ × √(納期)</p>
            </div>
          </div>
        </div>
      </div>

      {/* シミュレーションチャート */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">📈 在庫レベルシミュレーション</h3>
        <InventorySimulationChart
          reorderPoint={results.reorderPoint!}
          safetyStock={results.safetyStock}
          averageDailyDemand={results.averageDailyDemand}
          standardDeviation={results.standardDeviation}
          leadTime={leadTime}
        />
      </div>
    </div>
  );
};

export default FixedQuantitySystem;