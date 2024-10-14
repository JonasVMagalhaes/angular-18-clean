import { Component, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

import { InfoHintError } from './models/info-hint-error/info-hint-error.interface';
import {NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-hint-error',
  templateUrl: './hint-error.component.html',
  standalone: true,
  styleUrls: ['./hint-error.component.scss'],
  imports: [
    NgIf,
    NgForOf
  ]
})
export class HintErrorComponent {
  @Input({ required: true }) id: string;
  @Input({ required: true }) control: FormControl;
  @Input({ required: true }) set errorMessages(errorMessage: Record<string , string>) {
    this.infoErrors = Object.entries(errorMessage).map(([error, message]) => ({ error, message }));
  };

  public infoErrors: InfoHintError[] = [];
}
