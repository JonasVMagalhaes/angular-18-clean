import {Component} from '@angular/core';
import {MatListItem} from "@angular/material/list";

@Component({
  selector: 'app-patient-list-item',
  standalone: true,
  imports: [
    MatListItem
  ],
  templateUrl: './patient-list-item.component.html',
  styleUrl: './patient-list-item.component.scss'
})
export class PatientListItemComponent {
}
