import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { RouteEnum } from '@enums/routes/route.enum';
import { MessageService } from '@services/message/message.service';
import { RegisterForm } from './models/register-form.interface';
import { RegisterService } from '@entities/register/services/register.service';
import { filter, of } from 'rxjs';
import { RegisterFormEnum } from '@enums/forms/register-form.enum';
import { RegisterValidatorsErrors } from './validators-errors/register-validators-errors';
import { CustomValidators } from '@validators/validators';
import { InputType } from '@components/forms/input/models/input-type.interface';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  protected registerFormGroup: FormGroup<RegisterForm>;
  protected readonly ROUTE_ENUM = RouteEnum;
  protected readonly REGISTER_FORM_ENUM = RegisterFormEnum;
  protected readonly REGISTER_VALIDATORS_ERROR = RegisterValidatorsErrors;
  protected readonly INPUT_TYPE = InputType;

  constructor(private readonly router: Router,
              private readonly messageService: MessageService,
              private readonly registerService: RegisterService
  ) { }

  ngOnInit(): void {
    this.createFormGroup();
  }

  goTo(path: RouteEnum): void {
    this.router.navigate([path]);
  }

  register(): void {
    of(this.registerFormGroup)
      .pipe(
        filter(() => this.isFormValid()))
      .subscribe(() => this.performRegister());    
  }
  
  private performRegister() {
    this.registerService.register(this.registerFormGroup)
    .subscribe({
      next: () => {
        this.messageService.toast('Usuário criado com sucesso');
        this.router.navigate([RouteEnum.HOME]);
      },
      error: (err: Error) => this.messageService.toast(err.message)
    });
  }

  private createFormGroup(): void {
    this.registerFormGroup = new FormGroup<RegisterForm>({
      [RegisterFormEnum.USERNAME]: new FormControl('', [
        Validators.minLength(3),
        Validators.required
      ]),
      [RegisterFormEnum.EMAIL]: new FormControl(null, [
        Validators.required,
        Validators.email
      ]),
      [RegisterFormEnum.PASSWORD]: new FormControl(null, [
        Validators.required,
        CustomValidators.passwordValidator
      ]),
      [RegisterFormEnum.CONFIRM_PASSWORD]: new FormControl(null, [
        Validators.required,
        CustomValidators.confirmPasswordValidator(RegisterFormEnum.PASSWORD)
      ])
    });
  }

  private isFormValid(): boolean {
    if(this.registerFormGroup.valid) {
      return true;
    } else {
      this.messageService.toast("Existem campos não preenchidos ou inválidos no formulário");
      return false;
    }
  }
}
