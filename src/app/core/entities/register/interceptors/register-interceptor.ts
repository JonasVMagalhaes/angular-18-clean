import { Injectable } from "@angular/core";
import { Register } from "../dtos/register";
import { AuthStoreService } from "@entities/auth/store/auth-store.service";
import { Auth } from "@entities/auth/dtos/auth";

@Injectable({
    providedIn: 'root'
})
export class RegisterInterceptorsService {
    constructor(private readonly authStoreService: AuthStoreService) {}

    executeSuccess(response: Register): void {
        const auth: Auth = new Auth({
            access_token: response.access_token,
            expires_in: response.expires_in
        });
        
        this.authStoreService.save(auth);
    }
}