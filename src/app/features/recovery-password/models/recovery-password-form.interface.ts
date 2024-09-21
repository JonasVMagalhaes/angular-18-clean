import { FormControl } from "@angular/forms";

export interface RecoveryPasswordForm {
    email: FormControl<string | null>;
}