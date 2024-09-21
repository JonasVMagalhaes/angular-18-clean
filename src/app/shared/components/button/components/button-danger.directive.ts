import { Directive } from '@angular/core';

import { ButtonBaseDirective } from './button-impl.directive';

@Directive({
    selector: '[button-danger]',
    standalone: true
})
export class ButtonDangerDirective extends ButtonBaseDirective {
    protected override readonly classButton = 'button-danger';
}
