import { NgModule } from '@angular/core';
import {
    MatSnackBarAction,
    MatSnackBarActions,
    MatSnackBarLabel,
    MatSnackBarModule
} from '@angular/material/snack-bar';

import { MessageService } from './message.service';
import { MessageSnackbarService } from './message-snackbar.service';
import { MessageComponent } from './message.component';
import {MatButton} from "@angular/material/button";

@NgModule({
    declarations: [MessageComponent],
    imports: [
        MatSnackBarModule,
        MatSnackBarLabel,
        MatSnackBarActions,
        MatSnackBarAction,
        MatButton
    ],
    providers: [
        MessageService,
        MessageSnackbarService
    ]
})
export class MessageModule { }
