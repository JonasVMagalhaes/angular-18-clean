import {Component} from '@angular/core';

import { PatientListItemComponent } from "@features/home/components/patient/list-patient-item/patient-list-item.component";

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [PatientListItemComponent],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss'
})
export class PatientListComponent {
}
