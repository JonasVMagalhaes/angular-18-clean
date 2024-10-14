import { Component, Input } from '@angular/core';
import { NgClass } from "@angular/common";

import { ButtonPriority } from "@components/button/models/button-priority.enum";

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  standalone: true,
  imports: [ NgClass ],
  styleUrls: [
    './button.component.scss',
    './styles/button-directives.scss',
  ]
})
export class ButtonComponent {
  @Input({ required: true }) id: string;
  @Input({ required: true }) label: string;
  @Input() priority: ButtonPriority;
}
