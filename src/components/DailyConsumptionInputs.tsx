import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DailyConsumption } from '../types/inventory';

interface DailyConsumptionInputsProps {
  consumption: DailyConsumption;
  onChange: (consumption: DailyConsumption) => void;
  showChart?: boolean;
}

const DailyConsumptionInputs: React.FC<DailyConsumptionInputsProps> = ({
  consumption,
  onChange,
  showChart = false
}) => {
  const handleChange = (field: keyof DailyConsumption, value: number) => {
    onChange({
      ...consumption,
      [field]: value
    });
  };

  const totalConsumption = Object.values(consumption).reduce((sum, val) => sum + val, 0);
  const averageConsumption = totalConsumption / 7;

  const chartData = [
    { day: '7日前', consumption: consumption.day7 },
    { day: '6日前', consumption: consumption.day6 },
    { day: '5日前', consumption: consumption.day5 },
    { day: '4日前', consumption: consumption.day4 },
    { day: '3日前', consumption: consumption.day3 },
    { day: '2日前', consumption: consumption.day2 },
    { day: '昨日', consumption: consumption.day1 },
  ];

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

      {showChart && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">日次消費パターン</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <ReferenceLine y={averageConsumption} stroke="red" strokeDasharray="5 5" label="平均" />
                <Bar dataKey="consumption" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyConsumptionInputs;