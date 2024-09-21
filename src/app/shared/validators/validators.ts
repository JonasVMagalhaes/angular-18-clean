import { ValidatorFn } from "@angular/forms";
import { ConfirmPasswordValidator } from "./password-validator/confirm-password.validator";
import { PasswordValidator } from "./password-validator/password-validator";

export class CustomValidators {
    public static confirmPasswordValidator(password: string): ValidatorFn {
        return ConfirmPasswordValidator.get(password);
    }

    public static passwordValidator: ValidatorFn = PasswordValidator.strong();
}