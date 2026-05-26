import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  ApiError,
  DashboardData,
  DashboardRevenueByType,
  DashboardView,
  ParkingRecord,
  VehicleType
} from './models/parking.models';
import { ParkingService } from './services/parking.service';
import { formatMinutes, formatMoney, normalizePlate, toDateTimeLocal } from './utils/formatters';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  readonly formatMoney = formatMoney;
  readonly formatMinutes = formatMinutes;
  readonly vehicleTypes: VehicleType[] = ['Carro', 'Moto'];
  readonly menu: { id: DashboardView; label: string; marker: string }[] = [
    { id: 'dashboard', label: 'Dashboard', marker: 'D' },
    { id: 'ingresos', label: 'Ingresos', marker: 'I' },
    { id: 'salidas', label: 'Salidas', marker: 'S' },
    { id: 'vehiculos', label: 'Vehiculos', marker: 'V' }
  ];
  readonly rangeOrder = ['0 - 30 min', '31 min - 1 h', '1 h - 2 h', '2 h - 4 h', '4 h+'];

  activeView: DashboardView = 'dashboard';
  activeRecords: ParkingRecord[] = [];
  dashboard?: DashboardData;
  lastExit?: ParkingRecord;
  editingRecord?: ParkingRecord;
  loadingActive = false;
  loadingDashboard = false;
  savingEntry = false;
  savingExit = false;
  savingEdit = false;
  showExitModal = false;
  message = '';
  error = '';

  entryForm = this.fb.nonNullable.group({
    vehicleType: ['Carro' as VehicleType, Validators.required],
    plate: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
    entryDateTime: ['']
  });

  exitForm = this.fb.nonNullable.group({
    plate: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]]
  });

  editForm = this.fb.nonNullable.group({
    vehicleType: ['Carro' as VehicleType, Validators.required],
    plate: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
    entryDateTime: ['', Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly parkingService: ParkingService
  ) {}

  ngOnInit(): void {
    this.refreshData();
  }

  setView(view: DashboardView): void {
    if (view === 'salidas') {
      this.openExitModal();
      return;
    }

    this.activeView = view;
    this.clearMessages();
    this.showExitModal = false;
  }

  registerEntry(): void {
    if (this.entryForm.invalid) {
      this.entryForm.markAllAsTouched();
      return;
    }

    this.clearMessages();
    this.savingEntry = true;
    const value = this.entryForm.getRawValue();
    const request = {
      vehicleType: value.vehicleType,
      plate: normalizePlate(value.plate),
      ...(value.entryDateTime ? { entryDateTime: new Date(value.entryDateTime).toISOString() } : {})
    };

    this.parkingService.registerEntry(request)
      .pipe(finalize(() => (this.savingEntry = false)))
      .subscribe({
        next: () => {
          this.message = 'Ingreso registrado correctamente.';
          this.entryForm.reset({ vehicleType: 'Carro', plate: '', entryDateTime: '' });
          this.refreshData();
        },
        error: (error) => this.showError(error)
      });
  }

  registerExit(plate?: string): void {
    const selectedPlate = normalizePlate(plate || this.exitForm.getRawValue().plate);
    if (!selectedPlate) {
      this.exitForm.markAllAsTouched();
      return;
    }

    this.clearMessages();
    this.savingExit = true;
    this.parkingService.registerExit(selectedPlate)
      .pipe(finalize(() => (this.savingExit = false)))
      .subscribe({
        next: (record) => {
          this.lastExit = record;
          this.message = 'Salida registrada correctamente.';
          this.exitForm.reset({ plate: '' });
          this.showExitModal = false;
          this.refreshData();
        },
        error: (error) => this.showError(error)
      });
  }

  openExitModal(plate?: string): void {
    this.clearMessages();
    if (plate) {
      this.exitForm.reset({ plate: normalizePlate(plate) });
    }
    this.showExitModal = true;
  }

  closeExitModal(): void {
    if (this.savingExit) {
      return;
    }
    this.showExitModal = false;
  }

  startEdit(record: ParkingRecord): void {
    this.clearMessages();
    this.editingRecord = record;
    this.editForm.reset({
      vehicleType: record.vehicleType,
      plate: record.plate,
      entryDateTime: toDateTimeLocal(record.entryDateTime)
    });
  }

  cancelEdit(): void {
    this.editingRecord = undefined;
    this.editForm.reset({ vehicleType: 'Carro', plate: '', entryDateTime: '' });
  }

  saveEdit(): void {
    if (!this.editingRecord) {
      return;
    }

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }

    this.clearMessages();
    this.savingEdit = true;
    const value = this.editForm.getRawValue();
    const request = {
      vehicleType: value.vehicleType,
      plate: normalizePlate(value.plate),
      entryDateTime: new Date(value.entryDateTime).toISOString()
    };

    this.parkingService.updateActiveRecord(this.editingRecord.id, request)
      .pipe(finalize(() => (this.savingEdit = false)))
      .subscribe({
        next: () => {
          this.message = 'Informacion del vehiculo actualizada correctamente.';
          this.cancelEdit();
          this.refreshData();
        },
        error: (error) => this.showError(error)
      });
  }

  refreshData(): void {
    this.loadDashboard();
    this.loadActive();
  }

  loadActive(): void {
    this.loadingActive = true;
    this.parkingService.listActive()
      .pipe(finalize(() => (this.loadingActive = false)))
      .subscribe({
        next: (records) => (this.activeRecords = records),
        error: (error) => this.showError(error)
      });
  }

  loadDashboard(): void {
    this.loadingDashboard = true;
    this.parkingService.getDashboard()
      .pipe(finalize(() => (this.loadingDashboard = false)))
      .subscribe({
        next: (dashboard) => (this.dashboard = dashboard),
        error: (error) => this.showError(error)
      });
  }

  logout(): void {
    this.clearMessages();
    this.message = 'Sesion cerrada localmente. No hay autenticacion configurada en este examen.';
    this.activeView = 'dashboard';
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

  trackByRecordId(_: number, record: ParkingRecord): number {
    return record.id;
  }

  trackById(_: number, item: { id: number }): number {
    return item.id;
  }

  trackByMenuId(_: number, item: { id: DashboardView }): DashboardView {
    return item.id;
  }

  trackByRange(_: number, range: string): string {
    return range;
  }

  trackByVehicleType(_: number, type: VehicleType): VehicleType {
    return type;
  }

  private clearMessages(): void {
    this.message = '';
    this.error = '';
  }

  private showError(error: HttpErrorResponse): void {
    const apiError = error.error as ApiError | undefined;
    this.error = apiError?.message || 'No fue posible completar la operacion.';
  }
}
