import {Component, Input} from '@angular/core';
import {Patient} from "@entities/patient/dto/patient";

@Component({
  selector: 'app-patient-appointment',
  standalone: true,
  imports: [],
  templateUrl: './patient-appointment.component.html',
  styleUrl: './patient-appointment.component.scss'
})
export class PatientAppointmentComponent {
  @Input() patient: Patient;
}
