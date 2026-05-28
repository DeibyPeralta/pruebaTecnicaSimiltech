import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ApiError, DashboardData, DashboardRevenueByType, DashboardView, VehicleType } from '../../models/parking.models';
import { ParkingService } from '../../services/parking.service';
import { formatMinutes, formatMoney } from '../../utils/formatters';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnChanges {
  @Input() refreshKey = 0;
  @Output() viewSelected = new EventEmitter<DashboardView>();
  @Output() errorMessage = new EventEmitter<string>();

  readonly formatMoney = formatMoney;
  readonly formatMinutes = formatMinutes;
  readonly rangeOrder = ['0 - 30 min', '31 min - 1 h', '1 h - 2 h', '2 h - 4 h', '4 h+'];

  dashboard?: DashboardData;
  loadingDashboard = false;

  constructor(private readonly parkingService: ParkingService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['refreshKey']?.firstChange) {
      this.loadDashboard();
    }
  }

  loadDashboard(): void {
    this.loadingDashboard = true;
    this.parkingService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard = dashboard;
        this.loadingDashboard = false;
      },
      error: (error) => {
        this.loadingDashboard = false;
        this.errorMessage.emit(this.getErrorMessage(error));
      }
    });
  }

  activeTypeTotal(type: VehicleType): number {
    return Number(this.dashboard?.activeByType.find((item) => item.vehicleType === type)?.total || 0);
  }

  activeTypePercent(type: VehicleType): number {
    const total = this.dashboard?.summary.activeVehicles || 0;
    return total ? Math.round((this.activeTypeTotal(type) / total) * 1000) / 10 : 0;
  }

  revenueByType(type: VehicleType): DashboardRevenueByType {
    return this.dashboard?.revenueByType.find((item) => item.vehicleType === type) || { vehicleType: type, exitsToday: 0, revenue: 0 };
  }

  rangeTotal(label: string): number {
    return Number(this.dashboard?.timeRanges.find((range) => range.label === label)?.total || 0);
  }

  rangeHeight(label: string): string {
    const max = Math.max(...this.rangeOrder.map((range) => this.rangeTotal(range)), 1);
    return `${Math.max((this.rangeTotal(label) / max) * 100, this.rangeTotal(label) ? 12 : 0)}%`;
  }

  activeDonutGradient(): string {
    const carPercent = this.activeTypePercent('Carro');
    return `conic-gradient(#126fe8 0 ${carPercent}%, #8650d8 ${carPercent}% 100%)`;
  }

  revenueDonutGradient(): string {
    const total = this.dashboard?.summary.revenueToday || 0;
    const cars = this.revenueByType('Carro').revenue;
    const carPercent = total ? Math.round((cars / total) * 1000) / 10 : 0;
    return `conic-gradient(#126fe8 0 ${carPercent}%, #8650d8 ${carPercent}% 100%)`;
  }

  trackById(_: number, item: { id: number }): number {
    return item.id;
  }

  trackByRange(_: number, range: string): string {
    return range;
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const apiError = error.error as ApiError | undefined;
    return apiError?.message || 'No fue posible completar la operacion.';
  }
}
