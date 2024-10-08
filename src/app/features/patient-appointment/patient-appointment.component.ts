import {Component, Input, OnInit} from '@angular/core';
import {Patient} from "@entities/patient/dto/patient";
import {AvatarComponent} from "@features/patient-appointment/components/avatar/avatar.component";
import {PatientNameComponent} from "@features/patient-appointment/components/patient-name/patient-name.component";

@Component({
  selector: 'app-patient-appointment',
  standalone: true,
  imports: [
    AvatarComponent,
    PatientNameComponent
  ],
  templateUrl: './patient-appointment.component.html',
  styleUrl: './patient-appointment.component.scss'
})
export class PatientAppointmentComponent implements OnInit {
  @Input() patient: Patient;

  ngOnInit() {
    this.updateAppTitle();
  }

  private updateAppTitle(): void {
    document.title = `${document.title} ${this.patient.personalName}`;
  }
}
