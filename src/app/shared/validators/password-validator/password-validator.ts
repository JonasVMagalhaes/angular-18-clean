import { AbstractControl, ValidatorFn, ValidationErrors } from '@angular/forms';
import { PasswordUtils } from '@utils/password/password-utils';
import { StringUtils } from '@utils/string/string-utils';
import { BasicValidatorEnum } from '@validators/enums/basic-validator.enum';
import { PasswordValidatorEnum } from '@validators/enums/password-validator-enum';
import { StringValidatorEnum } from '@validators/enums/string-validator-enum';

export class PasswordValidator {
    public static strong(): ValidatorFn {
        const minLength = 6;
        const maxLength = 100;
        const mustBeContainNumber = true;
        const mustBeContainLowercase = true;
        const mustBeContainUppercase = true;
        const mustBeContainSpecialCharacter = true;
        
        return (control: AbstractControl): { [key: string]: any } | null => {
            const password = control.value;

            if(StringUtils.isEmpty(password)) {
                // If the password is empty, return an error indicating that it is required
                return { [BasicValidatorEnum.REQUIRED]: true };        
            };

            if (StringUtils.isLessThen(password, minLength)) {
                // If the password is shorter than the minimum length, return an error indicating it is too short
                return { [StringValidatorEnum.TOO_SHORT]: true };
            }

            if (StringUtils.isMoreThen(password, maxLength)) {
                // If the password is longer than the maximum length, return an error indicating it is too long
                return { [StringValidatorEnum.TOO_LONG]: true };
            }

            if (mustBeContainNumber && !StringUtils.hasNumber(password)) {
                // If the password must contain a number and it doesn't, return an error indicating it is missing a number
                return { [StringValidatorEnum.NUMBER_MISSING]: true };
            }

            if (mustBeContainLowercase && !StringUtils.hasLowercase(password)) {
                // If the password must contain a lowercase letter and it doesn't, return an error indicating it is missing a lowercase letter
                return { [StringValidatorEnum.LOWERCASE_MISSING]: true };
            }

            if (mustBeContainUppercase && !StringUtils.hasUppercase(password)) {
                // If the password must contain an uppercase letter and it doesn't, return an error indicating it is missing an uppercase letter
                return { [StringValidatorEnum.UPPERCASE_MISSING]: true };
            }

            if (mustBeContainSpecialCharacter && !StringUtils.hasSpecialCharacter(password)) {
                // If the password must contain a special character and it doesn't, return an error indicating it is missing a special character
                return { [StringValidatorEnum.ESPECIAL_CHARACTER_MISSING]: true };
            }

            if (StringUtils.hasWhiteSpace(password)) {
                // If the password contains whitespace, return an error indicating it cannot contain whitespace
                return { [StringValidatorEnum.HAS_WHITE_SPACE]: true };
            }

            if (PasswordUtils.isCommon(password)) {
                // If the password is a common password, return an error indicating it is a common password
                return { [PasswordValidatorEnum.COMMON_PASSWORD]: true };
            } 
                    
            return null;
        };
    }
}