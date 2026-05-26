export type VehicleType = 'Carro' | 'Moto';

export interface EntryRequest {
  vehicleType: VehicleType;
  plate: string;
  entryDateTime?: string;
}

export interface UpdateActiveRecordRequest {
  vehicleType: VehicleType;
  plate: string;
  entryDateTime: string;
}

export interface ParkingRecord {
  id: number;
  plate: string;
  vehicleType: VehicleType;
  entryDateTime: string;
  exitDateTime?: string | null;
  totalMinutes?: number | null;
  totalAmount?: number | null;
  tariffPerMinute: number;
  email?: {
    sent: boolean;
    message?: string;
    warning?: string;
  };
}

export interface ApiError {
  message: string;
  details?: string[];
}

export type DashboardView = 'dashboard' | 'ingresos' | 'salidas' | 'vehiculos';

export interface DashboardSummary {
  activeVehicles: number;
  activeCars: number;
  activeMotorcycles: number;
  averageActiveMinutes: number;
  entriesToday: number;
  revenueToday: number;
  tariffPerMinute: number;
}

export interface DashboardTypeTotal {
  vehicleType: VehicleType;
  total: number;
}

export interface DashboardTimeRange {
  label: string;
  total: number;
}

export interface DashboardRevenueByType {
  vehicleType: VehicleType;
  exitsToday: number;
  revenue: number;
}

export interface DashboardActiveVehicle {
  id: number;
  plate: string;
  vehicleType: VehicleType;
  entryDateTime: string;
  elapsedMinutes: number;
  accumulatedAmount: number;
  tariffPerMinute: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  activeByType: DashboardTypeTotal[];
  timeRanges: DashboardTimeRange[];
  revenueByType: DashboardRevenueByType[];
  recentActive: DashboardActiveVehicle[];
}
