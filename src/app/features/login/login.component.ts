import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { Router } from '@angular/router';

import {ButtonComponent} from "@components/button/button.component";
import {InputComponent} from "@components/forms/input/input.component";
import { InputType } from '@components/forms/input/models/input-type.interface';
import { AuthService } from '@entities/auth/services/auth.service';
import { LoginFormEnum } from '@enums/forms/login-form.enum';
import { RouteEnum } from '@enums/routes/route.enum';
import { MessageService } from '@services/message/message.service';
import { CustomValidators } from '@validators/validators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,

    InputComponent,
    ButtonComponent
  ],
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  protected loginFormGroup: FormGroup;
  protected readonly INPUT_TYPE: typeof InputType = InputType;
  protected readonly RouteEnum = RouteEnum;
  protected readonly LoginFormEnum = LoginFormEnum;

  constructor(private readonly router: Router,
              private readonly authService: AuthService,
              private readonly messageService: MessageService) { }

  ngOnInit(): void {
    this.createFormGroup();
  }

  goTo(path: RouteEnum): void {
    this.router.navigate([path]);
  }

  signIn(): void {
    this.authService.signIn(this.loginFormGroup.getRawValue())
      .subscribe({
        next: () => {
          this.messageService.toast('Authenticado com sucesso');
          this.router.navigate([RouteEnum.HOME]);
        },
        error: (err: Error) => this.messageService.toast(err.message)
      });
  }

  private createFormGroup(): void {
    this.loginFormGroup = new FormGroup({
      [LoginFormEnum.USERNAME]: new FormControl(null, [
        Validators.required
      ]),
      [LoginFormEnum.PASSWORD]: new FormControl(null, [
        Validators.required,
        CustomValidators.passwordValidator
      ]),
    });
  }
}
