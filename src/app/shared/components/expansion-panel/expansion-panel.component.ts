import { Component, signal } from '@angular/core';

import { OpenCloseExpansionPanelAnimation } from './animations/open-close-expansion-panel-animation';
import {
  ExpansionPanelHeaderComponent
} from "@components/expansion-panel/components/expansion-panel-header/expansion-panel-header.component";
import {
  ExpansionPanelDescriptionComponent
} from "@components/expansion-panel/components/expansion-panel-body/expansion-panel-description.component";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-expansion-panel',
  templateUrl: './expansion-panel.component.html',
  standalone: true,
  imports: [
    ExpansionPanelHeaderComponent,
    ExpansionPanelDescriptionComponent,
    NgIf
  ],
  styleUrls: ['./expansion-panel.component.scss'],
  animations: [OpenCloseExpansionPanelAnimation.get()]
})
export class ExpansionPanelComponent {
  readonly showDescription = signal(false);

  toggleDescription(): void {
    this.showDescription.update(show => !show);
  }
}
