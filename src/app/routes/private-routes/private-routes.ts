import { RouteEnum } from '@enums/routes/route.enum';
import { HomeComponent } from '@features/home/home.component';
import {Routes} from "@angular/router";
import {ConfigurationComponent} from "@features/configuration/configuration.component";
import {ScheduleResolverService} from "../../core/resolvers/schedule-resolver.service";
import {PatientAppointmentComponent} from "@features/patient-appointment/patient-appointment.component";
import {PatientResolverService} from "../../core/resolvers/patient-resolver.service";

export const privateRoutes: Routes = [
  {
    path: "",
    redirectTo: RouteEnum.SCHEDULE,
    pathMatch: "full",
  },
  {
    path: RouteEnum.SCHEDULE,
    title: "Calendário",
    resolve: {
      schedule: ScheduleResolverService
    },
    loadComponent: () => HomeComponent,
  },
  {
    path: RouteEnum.PATIENT_APPOINTMENT,
    title: "Patient Appointment",
    children: [
      {
        path: ":id",
        resolve: {
          // patient: PatientResolverService
        },
        loadComponent: () => PatientAppointmentComponent
      }
    ]
  },
  {
    path: RouteEnum.CONFIG,
    title: "Configurações",
    loadComponent: () => ConfigurationComponent,
  },
  {
    path: "**",
    redirectTo: RouteEnum.SCHEDULE,
  }
]
