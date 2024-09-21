import { Directive, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[inputMask]',
  standalone: true
})
export class InputMaskDirective {
  @Input('inputMask') mask: string = '';

  @HostListener('input', ['$event'])
  onInput(event: any) {
    if(!this.mask) {
      return;
    }

    const input = event.target;
    const value = input.value.replace(/\D/g, '');
    const maskArray = this.mask.split('');
    let maskedValue = '';

    for (let i = 0, j = 0; i < maskArray.length && j < value.length; i++) {
      if (maskArray[i] === '0') {
        maskedValue += value[j++];
      } else {
        maskedValue += maskArray[i];
      }
    }

    input.value = maskedValue;
  }

}
