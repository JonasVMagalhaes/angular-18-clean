import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, MaybeAsync, Resolve, Router} from "@angular/router";
import {Patient} from "@entities/patient/dto/patient";
import {PatientService} from "@entities/patient/services/patient.service";
import {tap} from "rxjs";
import {RouteEnum} from "@enums/routes/route.enum";

@Injectable({
  providedIn: 'root'
})
export class PatientResolverService implements Resolve<Patient> {
  constructor(private readonly patientService: PatientService,
              private readonly router: Router) {}

  resolve(route: ActivatedRouteSnapshot): MaybeAsync<Patient> {
    return this.patientService.getPatient(route.params['id'])
      .pipe(
        tap({
          error: () => this.router.navigate([RouteEnum.SCHEDULE])
        })
      );
  }
}
