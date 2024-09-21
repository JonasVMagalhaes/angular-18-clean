import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { ValueAcessorComponent } from '../value-acessor/value-acessor.component';

@Component({
  selector: 'app-switch',
  templateUrl: './switch.component.html',
  standalone: true,
  styleUrls: ['./switch.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SwitchComponent),
      multi: true
    }
  ]
})
export class SwitchComponent extends ValueAcessorComponent {
  public setValue(event: Event): void {
    this.updateValue((event.target as HTMLInputElement).checked);
  }
}
