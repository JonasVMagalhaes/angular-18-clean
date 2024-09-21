import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Timer } from "@utils/timer/timer-utils";

@Injectable({
    providedIn: 'root'
})
export class MessageSnackbarService {
    constructor(private readonly snackBar: MatSnackBar) {}

    open(message: string): void {
        this.snackBar.open(message, '', {
            duration: new Timer('3s').get()
        });
    }
}