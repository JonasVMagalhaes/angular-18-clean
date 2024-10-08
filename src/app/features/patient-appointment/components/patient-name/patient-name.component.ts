import {Component, Input} from '@angular/core';

@Component({
  selector: 'app-patient-name',
  standalone: true,
  imports: [],
  templateUrl: './patient-name.component.html',
  styleUrl: './patient-name.component.scss'
})
export class PatientNameComponent {
  @Input({ required: true }) personalName: string;
  @Input({ required: true }) nickName: string;
}
