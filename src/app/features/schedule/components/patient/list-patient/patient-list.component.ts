import {Component} from '@angular/core';
import { MatList } from "@angular/material/list";

import { PatientListItemComponent } from "@features/schedule/components/patient/list-patient-item/patient-list-item.component";

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [PatientListItemComponent, MatList],
  templateUrl: './patient-list.component.html',
  styleUrl: './patient-list.component.scss'
})
export class PatientListComponent {
  patients: any[] = [1, 2, 3, 4, 5]
}
