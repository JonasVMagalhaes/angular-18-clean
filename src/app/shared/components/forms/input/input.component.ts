import { Component, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, FormsModule } from '@angular/forms';

import { ValueAccessorComponent } from '@components/forms/value-accessor/value-accessor.component';
import { InputType } from './models/input-type.interface';
import {InputMaskDirective} from "@components/forms/input/directives/input-mask.directive";

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  standalone: true,
  imports: [
    InputMaskDirective,
    FormsModule
  ],
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ]
})
export class InputComponent extends ValueAccessorComponent {
  @Input({ required: true }) id: string;
  @Input({ required: true }) label: string;
  @Input() mask: string;
  @Input() type: InputType = InputType.TEXT;
  @Input() placeholder: string = "";

  public setValue(event: Event): void {
    this.updateValue((event.target as HTMLInputElement).value)
  }
}
