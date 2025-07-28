import React, { useState } from 'react';
import { Shield, Package, Info, CheckCircle, AlertCircle } from 'lucide-react';
import DailyConsumptionInputs from './DailyConsumptionInputs';
import InventoryProjectionChart from './InventoryProjectionChart';
import { DailyConsumption } from '../types/inventory';
import { calculateFixedPeriodSystem } from '../utils/calculations';

const FixedPeriodSystem: React.FC = () => {
  const [stockoutProbability, setStockoutProbability] = useState(20);
  const [leadTime, setLeadTime] = useState(3);
  const [orderCycle, setOrderCycle] = useState(7);
  const [currentInventory, setCurrentInventory] = useState(80);
  const [showChart, setShowChart] = useState(false);
  const [consumption, setConsumption] = useState<DailyConsumption>({
    day7: 35,
    day6: 22,
    day5: 15,
    day4: 19,
    day3: 13,
    day2: 14,
    day1: 22
  });

  const results = calculateFixedPeriodSystem(
    stockoutProbability,
    leadTime,
    orderCycle,
    currentInventory,
    consumption
  );

  const riskPeriod = orderCycle + leadTime;
  const expectedDemand = results.averageDailyDemand * riskPeriod;

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
                <p className="text-xs text-gray-500 mt-1">
                  発注を行う間隔
                </p>
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
                <p className="text-xs text-gray-500 mt-1">
                  発注時点での在庫数量
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

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Package className="w-6 h-6 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-800">発注数量</p>
                  <p className="text-2xl font-bold text-blue-900">{Math.round(Math.max(0, results.orderQuantity!))} 単位</p>
                </div>
              </div>
            </div>
          </div>

          {/* 推奨事項 */}
          <div className={`p-4 rounded-lg ${results.orderQuantity! > 0 ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
            <div className="flex items-center">
              {results.orderQuantity! > 0 ? (
                <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
              )}
              <div>
                <p className={`text-sm font-medium ${results.orderQuantity! > 0 ? 'text-green-800' : 'text-blue-800'}`}>
                  推奨事項
                </p>
                <p className={`text-sm ${results.orderQuantity! > 0 ? 'text-green-700' : 'text-blue-700'}`}>
                  {results.orderQuantity! > 0 
                    ? `${Math.round(results.orderQuantity!)} 単位の発注を推奨します`
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
              <p><strong>1日平均需要:</strong> {results.averageDailyDemand.toFixed(1)} 単位</p>
              <p><strong>需要の標準偏差:</strong> {results.standardDeviation.toFixed(1)} 単位</p>
              <p><strong>変動係数:</strong> {((results.standardDeviation / results.averageDailyDemand) * 100).toFixed(1)}%</p>
              <p><strong>リスク期間:</strong> {riskPeriod} 日</p>
              <p><strong>期待需要 (リスク期間):</strong> {Math.round(expectedDemand)} 単位</p>
              <p><strong>目標在庫レベル:</strong> {Math.round(results.targetLevel!)} 単位</p>
              <p><strong>サービスレベル:</strong> {results.serviceLevel.toFixed(1)}%</p>
              <p><strong>適用式:</strong> z × σ × √(サイクル + 納期)</p>
            </div>
          </div>
        </div>
      </div>

      {/* 予測チャート */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">📈 在庫予測</h3>
        <InventoryProjectionChart
          currentInventory={currentInventory}
          orderQuantity={Math.max(0, results.orderQuantity!)}
          averageDailyDemand={results.averageDailyDemand}
          safetyStock={results.safetyStock}
          leadTime={leadTime}
          orderCycle={orderCycle}
          targetLevel={results.targetLevel!}
        />
      </div>
    </div>
  );
};

export default FixedPeriodSystem;