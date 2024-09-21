import { Injectable } from "@angular/core";

import { MessageSnackbarService } from "./message-snackbar.service";

@Injectable({
    providedIn: 'root'
})
export class MessageService {
    constructor(private readonly messageSnackbar: MessageSnackbarService) {}

    toast(message: string): void {
        this.messageSnackbar.open(message)
    }
}