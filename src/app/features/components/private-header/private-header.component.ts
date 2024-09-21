import { Component } from '@angular/core';

import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-private-header',
  templateUrl: './private-header.component.html',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatIconModule
  ],
  styleUrl: './private-header.component.scss'
})
export class PrivateHeaderComponent {
  constructor(readonly title: Title) {}
}
