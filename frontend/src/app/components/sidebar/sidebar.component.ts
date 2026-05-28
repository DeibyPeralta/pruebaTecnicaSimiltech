import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DashboardView } from '../../models/parking.models';

interface MenuItem {
  id: DashboardView;
  label: string;
  marker: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input({ required: true }) activeView!: DashboardView;
  @Output() viewSelected = new EventEmitter<DashboardView>();
  @Output() logout = new EventEmitter<void>();

  readonly menu: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', marker: 'D' },
    { id: 'ingresos', label: 'Ingresos', marker: 'I' },
    { id: 'salidas', label: 'Salidas', marker: 'S' },
    { id: 'vehiculos', label: 'Vehiculos', marker: 'V' }
  ];

  trackByMenuId(_: number, item: MenuItem): DashboardView {
    return item.id;
  }
}
