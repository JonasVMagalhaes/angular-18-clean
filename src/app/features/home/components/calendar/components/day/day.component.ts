import { Component } from '@angular/core';
import {UUID} from "@utils/uuid/uuid-utils";

@Component({
  selector: 'app-day',
  standalone: true,
  imports: [],
  templateUrl: './day.component.html',
  styleUrl: './day.component.scss'
})
export class DayComponent {
  id: string = UUID.generate();
}
