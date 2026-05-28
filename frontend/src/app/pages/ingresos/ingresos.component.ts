import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiError, VehicleType } from '../../models/parking.models';
import { ParkingService } from '../../services/parking.service';
import { normalizePlate } from '../../utils/formatters';

@Component({
  selector: 'app-ingresos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ingresos.component.html',
  styleUrl: './ingresos.component.css'
})
export class IngresosComponent {
  @Output() entryRegistered = new EventEmitter<string>();
  @Output() errorMessage = new EventEmitter<string>();

  readonly vehicleTypes: VehicleType[] = ['Carro', 'Moto'];
  savingEntry = false;

  entryForm = this.fb.nonNullable.group({
    vehicleType: ['Carro' as VehicleType, Validators.required],
    plate: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]],
    entryDateTime: ['']
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly parkingService: ParkingService
  ) {}

  registerEntry(): void {
    if (this.entryForm.invalid) {
      this.entryForm.markAllAsTouched();
      return;
    }

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
          this.entryForm.reset({ vehicleType: 'Carro', plate: '', entryDateTime: '' });
          this.entryRegistered.emit('Ingreso registrado correctamente.');
        },
        error: (error) => this.errorMessage.emit(this.getErrorMessage(error))
      });
  }

  trackByVehicleType(_: number, type: VehicleType): VehicleType {
    return type;
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const apiError = error.error as ApiError | undefined;
    return apiError?.message || 'No fue posible completar la operacion.';
  }
}
