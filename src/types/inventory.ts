export interface DailyConsumption {
  day7: number;
  day6: number;
  day5: number;
  day4: number;
  day3: number;
  day2: number;
  day1: number;
}

export interface FixedQuantityParams {
  stockoutProbability: number;
  leadTime: number;
  dailyConsumption: DailyConsumption;
}

export interface FixedPeriodParams {
  stockoutProbability: number;
  leadTime: number;
  orderCycle: number;
  currentInventory: number;
  dailyConsumption: DailyConsumption;
}

export interface CalculationResults {
  safetyStock: number;
  reorderPoint?: number;
  orderQuantity?: number;
  targetLevel?: number;
  averageDailyDemand: number;
  standardDeviation: number;
  zScore: number;
  serviceLevel: number;
}