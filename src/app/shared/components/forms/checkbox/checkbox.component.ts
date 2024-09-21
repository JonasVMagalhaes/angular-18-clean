import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { ValueAcessorComponent } from '../value-acessor/value-acessor.component';

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  standalone: true,
  styleUrls: ['./checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckBoxComponent),
      multi: true
    }
  ]
})
export class CheckBoxComponent extends ValueAcessorComponent {
  public setValue(event: Event): void {
    this.updateValue((event.target as HTMLInputElement).checked);
  }
}
