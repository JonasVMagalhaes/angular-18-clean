import { FormGroup } from "@angular/forms";
import { RegisterFormEnum } from "@enums/forms/register-form.enum";
import { RegisterForm } from "@features/register/models/register-form.interface";
import { PrimitiveRegisterRequest } from "@models/primitives/register/register-request-interface";
import { PrimitiveRegisterResponse } from "@models/primitives/register/register-response.interface";

export class Register {
    access_token: string;
    expires_in: number;

    static toDto(form: FormGroup<RegisterForm>): PrimitiveRegisterRequest {
        return {
            username: form.get([RegisterFormEnum.USERNAME])?.value || '',
            password: form.get([RegisterFormEnum.PASSWORD])?.value || '',
            email: form.get([RegisterFormEnum.EMAIL])?.value || '',
        }
    }

    static fromDto(response: PrimitiveRegisterResponse): Register {
        return new Register();
    }
}
