import { readFileSync } from 'fs';
import { join } from 'path';
import type {
  ElectricRecord,
  GasRecord,
  WaterRecord,
  VehicleData,
} from './types';

function dataPath(filename: string): string {
  return join(process.cwd(), 'data', filename);
}

function readJson<T>(filename: string): T {
  return JSON.parse(readFileSync(dataPath(filename), 'utf-8')) as T;
}

export function formatBillingLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function formatDateRange(start: string, end: string): string {
  const s = new Date(start + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
  const e = new Date(end + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
  return `${s} – ${e}`;
}

export function formatCurrency(amount: number, decimals = 0): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// ── Electric ────────────────────────────────────────────────────────────────

export function loadElectricRecords(filename: string): ElectricRecord[] {
  return readJson<ElectricRecord[]>(filename);
}

export type ElectricChartData = {
  labels: string[];
  kwhData: number[];
  supplyData: number[];
  deliveryData: number[];
  supplyPerKwh: number[];
  deliveryPerKwh: number[];
  totalKwh: number;
  totalCost: number;
  avgKwh: number;
  peakKwh: number;
  periodCount: number;
  dateRange: string;
};

export function processElectricData(records: ElectricRecord[]): ElectricChartData {
  const labels = records.map((r) => formatBillingLabel(r.period_end ?? r.statement_date));
  const kwhData = records.map((r) => r.kwh);
  const supplyData = records.map((r) => r.supply);
  const deliveryData = records.map((r) => r.delivery);
  const supplyPerKwh = records.map((r) =>
    r.kwh > 0 ? Math.round((r.supply / r.kwh) * 1e4) / 1e4 : 0
  );
  const deliveryPerKwh = records.map((r) =>
    r.kwh > 0 ? Math.round((r.delivery / r.kwh) * 1e4) / 1e4 : 0
  );
  const totalKwh = kwhData.reduce((a, b) => a + b, 0);
  const totalCost = records.reduce((a, r) => a + r.supply + r.delivery, 0);
  const avgKwh = Math.round(totalKwh / records.length);
  const peakKwh = Math.max(...kwhData);
  const dateRange = formatDateRange(
    records[0].period_end ?? records[0].statement_date,
    records[records.length - 1].period_end ?? records[records.length - 1].statement_date
  );

  return {
    labels,
    kwhData,
    supplyData,
    deliveryData,
    supplyPerKwh,
    deliveryPerKwh,
    totalKwh,
    totalCost,
    avgKwh,
    peakKwh,
    periodCount: records.length,
    dateRange,
  };
}

// ── Gas ─────────────────────────────────────────────────────────────────────

export function loadGasRecords(filename: string): GasRecord[] {
  return readJson<GasRecord[]>(filename);
}

export type GasChartData = {
  labels: string[];
  thermsData: number[];
  supplyData: number[];
  deliveryData: number[];
  supplyPerTherm: number[];
  deliveryPerTherm: number[];
  totalTherms: number;
  totalCost: number;
  avgTherms: number;
  peakTherms: number;
  periodCount: number;
  dateRange: string;
};

export function processGasData(records: GasRecord[]): GasChartData {
  const labels = records.map((r) => formatBillingLabel(r.period_end ?? r.statement_date));
  const thermsData = records.map((r) => r.therms);
  const supplyData = records.map((r) => r.supply);
  const deliveryData = records.map((r) => r.delivery);
  const supplyPerTherm = records.map((r) =>
    r.therms > 0 ? Math.round((r.supply / r.therms) * 1e4) / 1e4 : 0
  );
  const deliveryPerTherm = records.map((r) =>
    r.therms > 0 ? Math.round((r.delivery / r.therms) * 1e4) / 1e4 : 0
  );
  const totalTherms = thermsData.reduce((a, b) => a + b, 0);
  const totalCost = records.reduce((a, r) => a + r.supply + r.delivery, 0);
  const avgTherms = Math.round(totalTherms / records.length);
  const peakTherms = Math.max(...thermsData);
  const dateRange = formatDateRange(
    records[0].period_end ?? records[0].statement_date,
    records[records.length - 1].period_end ?? records[records.length - 1].statement_date
  );

  return {
    labels,
    thermsData,
    supplyData,
    deliveryData,
    supplyPerTherm,
    deliveryPerTherm,
    totalTherms,
    totalCost,
    avgTherms,
    peakTherms,
    periodCount: records.length,
    dateRange,
  };
}

// ── Water ───────────────────────────────────────────────────────────────────

export function loadWaterRecords(filename: string): WaterRecord[] {
  return readJson<WaterRecord[]>(filename);
}

export type WaterChartData = {
  labels: string[];
  cfData: number[];
  waterData: number[];
  sewerData: number[];
  waterPerCf: number[];
  sewerPerCf: number[];
  totalCf: number;
  totalCost: number;
  avgCf: number;
  peakCf: number;
  periodCount: number;
  dateRange: string;
};

export function processWaterData(records: WaterRecord[]): WaterChartData {
  const labels = records.map((r) => formatBillingLabel(r.period_end ?? r.statement_date));
  const cfData = records.map((r) => r.cf);
  const waterData = records.map((r) => r.water);
  const sewerData = records.map((r) => r.sewer);
  const waterPerCf = records.map((r) =>
    r.cf > 0 ? Math.round((r.water / r.cf) * 1e4) / 1e4 : 0
  );
  const sewerPerCf = records.map((r) =>
    r.cf > 0 ? Math.round((r.sewer / r.cf) * 1e4) / 1e4 : 0
  );
  const totalCf = cfData.reduce((a, b) => a + b, 0);
  const totalCost = records.reduce((a, r) => a + r.water + r.sewer, 0);
  const avgCf = Math.round(totalCf / records.length);
  const peakCf = Math.max(...cfData);
  const dateRange = formatDateRange(
    records[0].period_end ?? records[0].statement_date,
    records[records.length - 1].period_end ?? records[records.length - 1].statement_date
  );

  return {
    labels,
    cfData,
    waterData,
    sewerData,
    waterPerCf,
    sewerPerCf,
    totalCf,
    totalCost,
    avgCf,
    peakCf,
    periodCount: records.length,
    dateRange,
  };
}

// ── Vehicle ──────────────────────────────────────────────────────────────────

export function loadVehicleData(filename: string): VehicleData {
  return readJson<VehicleData>(filename);
}

export type VehicleSummary = {
  acquiredMiles: number;
  latestMiles: number;
  milesDriven: number;
  avgMilesPerMonth: number;
  totalServiceCost: number;
  serviceEventCount: number;
  dateRange: string;
};

export function processVehicleData(vehicle: VehicleData): VehicleSummary {
  const events = vehicle.events;
  const latestEvent = events[events.length - 1];
  const serviceEvents = events.filter((e) => !e.is_purchase);
  const totalServiceCost = serviceEvents
    .filter((e) => e.cost !== null)
    .reduce((sum, e) => sum + (e.cost ?? 0), 0);
  const milesDriven = latestEvent.miles - vehicle.acquired_miles;

  const startDate = new Date(vehicle.acquired_date + 'T12:00:00');
  const endDate = new Date(latestEvent.date + 'T12:00:00');
  const monthsDiff =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());
  const avgMilesPerMonth =
    monthsDiff > 0 ? Math.round(milesDriven / monthsDiff) : milesDriven;

  const dateRange = formatDateRange(vehicle.acquired_date, latestEvent.date);

  return {
    acquiredMiles: vehicle.acquired_miles,
    latestMiles: latestEvent.miles,
    milesDriven,
    avgMilesPerMonth,
    totalServiceCost,
    serviceEventCount: serviceEvents.length,
    dateRange,
  };
}
