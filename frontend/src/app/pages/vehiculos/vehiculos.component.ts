import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiError, ParkingRecord, VehicleType } from '../../models/parking.models';
import { ParkingService } from '../../services/parking.service';
import { formatMoney, normalizePlate, toDateTimeLocal } from '../../utils/formatters';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './vehiculos.component.html',
  styleUrl: './vehiculos.component.css'
})
export class VehiculosComponent implements OnInit, OnChanges {
  @Input() refreshKey = 0;
  @Output() exitRequested = new EventEmitter<string>();
  @Output() recordUpdated = new EventEmitter<string>();
  @Output() errorMessage = new EventEmitter<string>();

  readonly formatMoney = formatMoney;
  readonly vehicleTypes: VehicleType[] = ['Carro', 'Moto'];

  activeRecords: ParkingRecord[] = [];
  editingRecord?: ParkingRecord;
  loadingActive = false;
  savingEdit = false;

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
    this.loadActive();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['refreshKey']?.firstChange) {
      this.loadActive();
    }
  }

  loadActive(): void {
    this.loadingActive = true;
    this.parkingService.listActive()
      .pipe(finalize(() => (this.loadingActive = false)))
      .subscribe({
        next: (records) => (this.activeRecords = records),
        error: (error) => this.errorMessage.emit(this.getErrorMessage(error))
      });
  }

  startEdit(record: ParkingRecord): void {
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
          this.cancelEdit();
          this.loadActive();
          this.recordUpdated.emit('Informacion del vehiculo actualizada correctamente.');
        },
        error: (error) => this.errorMessage.emit(this.getErrorMessage(error))
      });
  }

  trackByRecordId(_: number, record: ParkingRecord): number {
    return record.id;
  }

  trackByVehicleType(_: number, type: VehicleType): VehicleType {
    return type;
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const apiError = error.error as ApiError | undefined;
    return apiError?.message || 'No fue posible completar la operacion.';
  }
}
