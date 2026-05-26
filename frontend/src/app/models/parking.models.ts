export type VehicleType = 'Carro' | 'Moto';

export interface EntryRequest {
  vehicleType: VehicleType;
  plate: string;
  entryDateTime?: string;
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
