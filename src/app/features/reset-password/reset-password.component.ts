import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { RouteEnum } from '@enums/routes/route.enum';
import { CustomValidators } from '@validators/validators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  // protected readonly RouteEnum = RouteEnum;
  // protected readonly resetPasswordFormGroup = new FormGroup({
  //   password: new FormControl(null, [
  //     Validators.required,
  //     CustomValidators.passwordValidator
  //   ]),
  //   confirmPassword: new FormControl(null, [
  //     Validators.required,
  //     CustomValidators.confirmPasswordValidator('password')
  //   ])
  // });
  //
  // constructor(private readonly router: Router) {}
  //
  // goTo(path: RouteEnum): void {
  //   this.router.navigate([path]);
  // }
}
