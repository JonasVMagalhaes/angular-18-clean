import { BasicValidatorEnum } from "@validators/enums/basic-validator.enum";
import { EmailValidatorEnum } from "@validators/enums/email-validator.enum";
import { PasswordValidatorEnum } from "@validators/enums/password-validator-enum";
import { StringValidatorEnum } from "@validators/enums/string-validator-enum";

export class RegisterValidatorsErrors {
    static username(): Record<any, string> {
        return {
            [BasicValidatorEnum.REQUIRED]: 'Este campo é obrigatório',
            [BasicValidatorEnum.MIN_LENGTH]: 'O tamanho mínimo desse campo são 3 caracteres'
        }
    }

    static email(): Record<any, string> {
        return {
            [BasicValidatorEnum.REQUIRED]: 'Este campo é obrigatório',
            [EmailValidatorEnum.EMAIL]: 'Este campo só aceita email como valor'
        }
    }

    static password(): Record<any, string> {
        return {
            [BasicValidatorEnum.REQUIRED]: 'Este campo é obrigatório',
            [StringValidatorEnum.TOO_SHORT]: 'O tamanho mínimo para a senha são 6 caracteres',
            [StringValidatorEnum.LOWERCASE_MISSING]: 'É necessário pelo menos 1 caractere minúscula na senha',
            [StringValidatorEnum.UPPERCASE_MISSING]: 'É necessário pelo menos 1 caractere maiúsculo na senha',
            [StringValidatorEnum.NUMBER_MISSING]: 'É necessário pelo menos 1 caractere numérico na senha',
            [StringValidatorEnum.ESPECIAL_CHARACTER_MISSING]: 'É necessário pelo menos 1 caractere especial na senha',
            [StringValidatorEnum.HAS_WHITE_SPACE]: 'A senha não pode conter espaços em branco',
            [PasswordValidatorEnum.COMMON_PASSWORD]: 'Esta senha é muito simples'
        }
    }

    static confirmPassword(): Record<any, string> {
        return {
            [BasicValidatorEnum.REQUIRED]: 'Este campo é obrigatório',
            [PasswordValidatorEnum.MISMATCH]: 'As senhas não coincidem'
        }
    }
}