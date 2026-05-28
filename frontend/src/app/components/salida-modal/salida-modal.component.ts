import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ApiError, ParkingRecord } from '../../models/parking.models';
import { ParkingService } from '../../services/parking.service';
import { normalizePlate } from '../../utils/formatters';

@Component({
  selector: 'app-salida-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './salida-modal.component.html',
  styleUrl: './salida-modal.component.css'
})
export class SalidaModalComponent implements OnChanges {
  @Input() open = false;
  @Input() plate = '';
  @Output() closed = new EventEmitter<void>();
  @Output() exitRegistered = new EventEmitter<ParkingRecord>();
  @Output() errorMessage = new EventEmitter<string>();

  savingExit = false;

  exitForm = this.fb.nonNullable.group({
    plate: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(10)]]
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly parkingService: ParkingService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['plate'] && this.plate) {
      this.exitForm.reset({ plate: normalizePlate(this.plate) });
    }
  }

  close(): void {
    if (!this.savingExit) {
      this.closed.emit();
    }
  }

  registerExit(): void {
    const plate = normalizePlate(this.exitForm.getRawValue().plate);
    if (!plate) {
      this.exitForm.markAllAsTouched();
      return;
    }

    this.savingExit = true;
    this.parkingService.registerExit(plate)
      .pipe(finalize(() => (this.savingExit = false)))
      .subscribe({
        next: (record) => {
          this.exitForm.reset({ plate: '' });
          this.exitRegistered.emit(record);
        },
        error: (error) => this.errorMessage.emit(this.getErrorMessage(error))
      });
  }

  private getErrorMessage(error: HttpErrorResponse): string {
    const apiError = error.error as ApiError | undefined;
    return apiError?.message || 'No fue posible completar la operacion.';
  }
}
