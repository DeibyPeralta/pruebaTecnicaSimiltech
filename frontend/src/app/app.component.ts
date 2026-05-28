import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { SalidaModalComponent } from './components/salida-modal/salida-modal.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardView, ParkingRecord } from './models/parking.models';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { IngresosComponent } from './pages/ingresos/ingresos.component';
import { SalidasComponent } from './pages/salidas/salidas.component';
import { VehiculosComponent } from './pages/vehiculos/vehiculos.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    DashboardComponent,
    IngresosComponent,
    SalidasComponent,
    VehiculosComponent,
    SalidaModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  activeView: DashboardView = 'dashboard';
  showExitModal = false;
  exitPlate = '';
  refreshKey = 0;
  lastExit?: ParkingRecord;
  message = '';
  error = '';

  get pageTitle(): string {
    const titles: Record<DashboardView, string> = {
      dashboard: 'Bienvenido, Administrador',
      ingresos: 'Registrar ingresos',
      salidas: 'Registrar salidas',
      vehiculos: 'Vehiculos activos'
    };
    return titles[this.activeView];
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

  openExitModal(plate = ''): void {
    this.clearMessages();
    this.exitPlate = plate;
    this.showExitModal = true;
  }

  closeExitModal(): void {
    this.showExitModal = false;
  }

  handleEntryRegistered(message: string): void {
    this.showMessage(message);
    this.refreshData();
  }

  handleRecordUpdated(message: string): void {
    this.showMessage(message);
    this.refreshData();
  }

  handleExitRegistered(record: ParkingRecord): void {
    this.lastExit = record;
    this.showExitModal = false;
    this.showMessage('Salida registrada correctamente.');
    this.refreshData();
  }

  logout(): void {
    this.activeView = 'dashboard';
    this.showMessage('Sesion cerrada localmente. No hay autenticacion configurada en este examen.');
  }

  showMessage(message: string): void {
    this.message = message;
    this.error = '';
  }

  showError(error: string): void {
    this.error = error;
    this.message = '';
  }

  private refreshData(): void {
    this.refreshKey += 1;
  }

  private clearMessages(): void {
    this.message = '';
    this.error = '';
  }
}
