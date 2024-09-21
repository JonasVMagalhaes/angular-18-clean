import { Directive } from '@angular/core';

import { ButtonBaseDirective } from './button-impl.directive';

@Directive({
    selector: '[button-primary]',
    standalone: true
})
export class ButtonPrimaryDirective extends ButtonBaseDirective {
    protected override readonly classButton = 'button-primary';
}
