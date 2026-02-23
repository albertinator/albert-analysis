export type ElectricRecord = {
  filename: string;
  kwh: number;
  supply: number;
  delivery: number;
  period_start: string | null;
  period_end: string | null;
  statement_date: string;
};

export type GasRecord = {
  filename: string;
  therms: number;
  supply: number;
  delivery: number;
  period_start: string | null;
  period_end: string | null;
  statement_date: string;
};

export type WaterRecord = {
  filename: string;
  cf: number;
  water: number;
  sewer: number;
  period_start: string | null;
  period_end: string | null;
  statement_date: string;
};

export type VehicleEvent = {
  date: string;
  miles: number;
  label: string;
  detail: string;
  is_purchase: boolean;
  provider: string | null;
  service: string | null;
  cost: number | null;
};

export type VehicleData = {
  make: string;
  model: string;
  year: number;
  vin: string;
  color: string;
  acquired_date: string;
  acquired_miles: number;
  events: VehicleEvent[];
};

export type ChartDataset = {
  label: string;
  data: number[];
  backgroundColor: string;
  borderColor: string;
  borderWidth?: number;
};

export type BarChartTooltipMode = 'usage' | 'cost' | 'rate';
