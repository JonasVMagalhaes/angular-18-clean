import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, MaybeAsync, Resolve} from "@angular/router";
import {Patient} from "@entities/patient/dto/patient";
import {PatientService} from "@entities/patient/services/patient.service";

@Injectable({
  providedIn: 'root'
})
export class PatientResolverService implements Resolve<Patient> {
  constructor(private readonly patientService: PatientService) {}

  resolve(route: ActivatedRouteSnapshot): MaybeAsync<Patient> {
    return this.patientService.getPatient(route.params['id']);
  }
}
