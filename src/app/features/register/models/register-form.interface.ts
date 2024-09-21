import { FormControl } from "@angular/forms";
import { RegisterFormEnum } from "@enums/forms/register-form.enum";

export interface RegisterForm {
    [RegisterFormEnum.USERNAME]: FormControl<string | null>;
    [RegisterFormEnum.EMAIL]: FormControl<string | null>;
    [RegisterFormEnum.PASSWORD]: FormControl<string | null>;
    [RegisterFormEnum.CONFIRM_PASSWORD]: FormControl<string | null>;
}