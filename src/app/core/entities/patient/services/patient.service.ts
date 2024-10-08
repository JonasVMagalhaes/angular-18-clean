import { HttpClient } from '@angular/common/http';
import {Injectable} from '@angular/core';

import {Observable, map, of, switchMap, first} from 'rxjs';

import { Primitive } from '@enums/primitives/primitive.enum';
import {PrimitivePatientResponse} from "@models/primitives/patient/patient-response.interface";
import {Patient} from "@entities/patient/dto/patient";

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  constructor(private readonly httpClient: HttpClient) {}
    getPatient(id: string): Observable<Patient> {
        return of(null)
            .pipe(
              first(),
              switchMap(() => this.httpClient.get<PrimitivePatientResponse>(`${Primitive.PATIENT}/${id}`)),
              map(Patient.fromDto)
        );
    }
}
