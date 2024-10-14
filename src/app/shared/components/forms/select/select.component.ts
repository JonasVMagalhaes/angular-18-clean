import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import {ValueAccessorComponent} from "@components/forms/value-accessor/value-accessor.component";

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  standalone: true,
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true
    }
  ]
})
export class SelectComponent extends ValueAccessorComponent {
  public setValue(event: Event): void {
    this.updateValue((event.target as HTMLSelectElement).value)
  }
}
