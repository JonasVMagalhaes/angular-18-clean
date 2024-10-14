import { Component, forwardRef } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {ValueAccessorImpl} from "@components/forms/models/value-accessor/value-accessor.impl";

@Component({
  selector: 'value-accessor',
  template: '',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ValueAccessorComponent),
      multi: true
    }
  ]
})
export class ValueAccessorComponent implements ControlValueAccessor, ValueAccessorImpl {
  value: any;
  onChange: Function = () => {};
  onTouched: Function = () => {};
  isDisabled: boolean;

  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: Function): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  updateValue(newValue: any): void {
    this.value = newValue;
    this.onChange(newValue);
    this.onTouched();
  }
}
