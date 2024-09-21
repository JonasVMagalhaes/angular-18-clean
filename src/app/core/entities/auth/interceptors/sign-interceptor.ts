import { Injectable } from "@angular/core";

import { AuthStoreService } from "../store/auth-store.service";
import { Auth } from "../dtos/auth";

@Injectable({
    providedIn: 'root'
})
export class SignInterceptorsService {
    constructor(private readonly authStoreService: AuthStoreService) {}

    executeSuccess(response: Auth): void {
        this.authStoreService.save(response);
    }
}