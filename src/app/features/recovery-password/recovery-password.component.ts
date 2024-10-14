import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { RouteEnum } from '@enums/routes/route.enum';
import { RecoveryPasswordFormEnum } from '@enums/forms/recovery-password-form';
import { RecoveryPasswordForm } from './models/recovery-password-form.interface';

@Component({
  selector: 'app-recovery-password',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './recovery-password.component.html',
  styleUrl: './recovery-password.component.scss'
})
export class RecoveryPasswordComponent implements OnInit {
  // protected recoveryPasswordFormGroup: FormGroup<RecoveryPasswordForm>;
  // protected readonly RouteEnum = RouteEnum;
  // protected readonly RecoveryPasswordFormEnum = RecoveryPasswordFormEnum;
  //
  // constructor(private readonly router: Router) {}

  ngOnInit(): void {
  //   this.createFormGroup();
  }

  // goTo(path: RouteEnum): void {
  //   this.router.navigate([path]);
  // }
  //
  // private createFormGroup(): void {
  //   this.recoveryPasswordFormGroup = new FormGroup<RecoveryPasswordForm>({
  //     [RecoveryPasswordFormEnum.EMAIL]: new FormControl(null, [
  //       Validators.required,
  //       Validators.email
  //     ])
  //   });
  // }
}
