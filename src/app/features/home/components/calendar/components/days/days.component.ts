import { Component } from '@angular/core';
import {DayComponent} from "@features/home/components/calendar/components/day/day.component";

@Component({
  selector: 'app-days',
  standalone: true,
  imports: [DayComponent],
  templateUrl: './days.component.html',
  styleUrl: './days.component.scss'
})
export class DaysComponent {
  days: any[] =  [1,2,3,4,5,6,7,8,9,10];
}
