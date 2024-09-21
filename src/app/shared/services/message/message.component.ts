import { Component } from "@angular/core";

import { MatSnackBarRef } from "@angular/material/snack-bar";

@Component({
  selector: 'app-message',
  templateUrl: 'message.component.html',
  styleUrl: 'message.component.scss'
})
export class MessageComponent {
  constructor(readonly snackBarRef: MatSnackBarRef<any>) {}
}