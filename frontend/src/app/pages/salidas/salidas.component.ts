import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ParkingRecord } from '../../models/parking.models';
import { formatMoney } from '../../utils/formatters';

@Component({
  selector: 'app-salidas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './salidas.component.html',
  styleUrl: './salidas.component.css'
})
export class SalidasComponent {
  @Input() lastExit?: ParkingRecord;
  @Output() openExitModal = new EventEmitter<void>();

  readonly formatMoney = formatMoney;
}
