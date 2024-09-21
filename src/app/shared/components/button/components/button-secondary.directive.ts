import { Directive } from '@angular/core';

import { ButtonBaseDirective } from './button-impl.directive';

@Directive({
    selector: '[button-secondary]',
    standalone: true
})
export class ButtonSecondaryDirective extends ButtonBaseDirective {
    protected override readonly classButton = 'button-secondary';
}
