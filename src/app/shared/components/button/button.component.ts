import { Component, Input } from '@angular/core';

import {ButtonPrimaryDirective} from "@components/button/components/button-primary.directive";
import {ButtonSecondaryDirective} from "@components/button/components/button-secondary.directive";
import {ButtonLinkDirective} from "@components/button/components/button-link.directive";
import {ButtonWarningDirective} from "@components/button/components/button-warning.directive";
import {ButtonDangerDirective} from "@components/button/components/button-danger.directive";
import {ButtonHelpDirective} from "@components/button/components/button-help.directive";

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  standalone: true,
  imports: [
    ButtonPrimaryDirective,
    ButtonSecondaryDirective,
    ButtonLinkDirective,
    ButtonWarningDirective,
    ButtonDangerDirective,
    ButtonHelpDirective
  ],
  styleUrls: [
    './button.component.scss',
    './styles/button-directives.scss',
  ]
})
export class ButtonComponent {
  @Input({ required: true }) id: string;
  @Input({ required: true }) label: string;
}
