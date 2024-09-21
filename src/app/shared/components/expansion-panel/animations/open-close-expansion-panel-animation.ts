import { trigger, transition, style, animate, AnimationTriggerMetadata, state } from '@angular/animations';

export class OpenCloseExpansionPanelAnimation {
    static get(): AnimationTriggerMetadata {
        return trigger('openCloseExpansionPanel', [
            transition(':enter', [
                style({ height: 0, overflow: 'hidden' }),
                animate('500ms ease', style({ height: '*' }))
            ]),
            transition(':leave', [
                style({ height: '*', overflow: 'hidden' }),
                animate('500ms ease', style({ height: 0 }))
            ])
        ]);
    }
}
