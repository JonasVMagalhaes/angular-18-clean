import { AbstractControl, ValidatorFn } from "@angular/forms";
import { PasswordValidatorEnum } from "@validators/enums/password-validator-enum";

export class ConfirmPasswordValidator {
    public static get(passwordField: string): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            const password = control.root.get(passwordField);
            
            if (password && password.value !== control.value) {
                return { [PasswordValidatorEnum.MISMATCH]: true };
            }
            return null;
        };
    }
}