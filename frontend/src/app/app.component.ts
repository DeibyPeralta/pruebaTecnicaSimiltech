import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiError, ParkingRecord, VehicleType } from './models/parking.models';
import { ParkingService } from './services/parking.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  readonly vehicleTypes: VehicleType[] = ['Carro', 'Moto'];
  activeRecords: ParkingRecord[] = [];
  lastExit?: ParkingRecord;
  loadingActive = false;
  savingEntry = false;
  savingExit = false;
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

  constructor(
    private readonly fb: FormBuilder,
    private readonly parkingService: ParkingService
  ) {}

  ngOnInit(): void {
    this.loadActive();
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
      plate: this.normalizePlate(value.plate),
      ...(value.entryDateTime ? { entryDateTime: new Date(value.entryDateTime).toISOString() } : {})
    };

    this.parkingService.registerEntry(request)
      .pipe(finalize(() => (this.savingEntry = false)))
      .subscribe({
        next: () => {
          this.message = 'Ingreso registrado correctamente.';
          this.entryForm.reset({ vehicleType: 'Carro', plate: '', entryDateTime: '' });
          this.loadActive();
        },
        error: (error) => this.showError(error)
      });
  }

  registerExit(plate?: string): void {
    const selectedPlate = this.normalizePlate(plate || this.exitForm.getRawValue().plate);
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
          this.loadActive();
        },
        error: (error) => this.showError(error)
      });
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

  formatMoney(value?: number | null): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value || 0);
  }

  private normalizePlate(plate: string): string {
    return plate.trim().toUpperCase();
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
