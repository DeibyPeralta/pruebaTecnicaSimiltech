import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { EntryRequest, ParkingRecord } from '../models/parking.models';

@Injectable({ providedIn: 'root' })
export class ParkingService {
  private readonly baseUrl = `${environment.apiUrl}/parking`;

  constructor(private readonly http: HttpClient) {}

  registerEntry(request: EntryRequest): Observable<ParkingRecord> {
    return this.http.post<ParkingRecord>(`${this.baseUrl}/entries`, request);
  }

  registerExit(plate: string): Observable<ParkingRecord> {
    return this.http.post<ParkingRecord>(`${this.baseUrl}/exits/${encodeURIComponent(plate)}`, {});
  }

  listActive(): Observable<ParkingRecord[]> {
    return this.http.get<ParkingRecord[]>(`${this.baseUrl}/active`);
  }
}
