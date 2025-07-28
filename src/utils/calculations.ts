import { DailyConsumption, CalculationResults } from '../types/inventory';

// 正規分布のZ値を計算
export function calculateZScore(stockoutProbability: number): number {
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

// 日次消費データから標準偏差を計算
export function calculateStandardDeviation(consumption: DailyConsumption): number {
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

// 安全在庫を計算
export function calculateSafetyStock(
  zScore: number,
  standardDeviation: number,
  timeHorizon: number
): number {
  return zScore * standardDeviation * Math.sqrt(timeHorizon);
}

// 固定数量システムの計算
export function calculateFixedQuantitySystem(
  stockoutProbability: number,
  leadTime: number,
  consumption: DailyConsumption
): CalculationResults {
  const values = Object.values(consumption);
  const totalConsumption = values.reduce((sum, val) => sum + val, 0);
  const averageDailyDemand = totalConsumption / 7;
  
  const standardDeviation = calculateStandardDeviation(consumption);
  const zScore = calculateZScore(stockoutProbability);
  const safetyStock = calculateSafetyStock(zScore, standardDeviation, leadTime);
  const reorderPoint = (averageDailyDemand * leadTime) + safetyStock;
  
  return {
    safetyStock,
    reorderPoint,
    averageDailyDemand,
    standardDeviation,
    zScore,
    serviceLevel: 100 - stockoutProbability
  };
}

// 固定期間システムの計算
export function calculateFixedPeriodSystem(
  stockoutProbability: number,
  leadTime: number,
  orderCycle: number,
  currentInventory: number,
  consumption: DailyConsumption
): CalculationResults {
  const values = Object.values(consumption);
  const totalConsumption = values.reduce((sum, val) => sum + val, 0);
  const averageDailyDemand = totalConsumption / 7;
  
  const standardDeviation = calculateStandardDeviation(consumption);
  const zScore = calculateZScore(stockoutProbability);
  
  // リスク期間 = 発注サイクル + リードタイム
  const riskPeriod = orderCycle + leadTime;
  const safetyStock = calculateSafetyStock(zScore, standardDeviation, riskPeriod);
  
  const expectedDemand = averageDailyDemand * riskPeriod;
  const targetLevel = expectedDemand + safetyStock;
  const orderQuantity = Math.max(0, targetLevel - currentInventory);
  
  return {
    safetyStock,
    targetLevel,
    orderQuantity,
    averageDailyDemand,
    standardDeviation,
    zScore,
    serviceLevel: 100 - stockoutProbability
  };
}