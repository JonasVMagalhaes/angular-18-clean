import { Directive } from '@angular/core';

import { ButtonBaseDirective } from './button-impl.directive';

@Directive({
    selector: '[button-warning]',
    standalone: true
})
export class ButtonWarningDirective extends ButtonBaseDirective {
    protected override readonly classButton = 'button-warning';
}
