import { Directive } from '@angular/core';

import { ButtonBaseDirective } from './button-impl.directive';

@Directive({
    selector: '[button-help]',
    standalone: true
})
export class ButtonHelpDirective extends ButtonBaseDirective {
    protected override readonly classButton = 'button-help';
}
