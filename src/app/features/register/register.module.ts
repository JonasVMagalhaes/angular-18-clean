import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from 'app/shared/shared.module';
import { RegisterComponent } from './register.component';
import { MessageModule } from '@services/message/message.module';

@NgModule({
    declarations: [RegisterComponent],
    imports: [
        ReactiveFormsModule,
        CommonModule,
        SharedModule,
        MessageModule
    ],
    exports: [RegisterComponent]
})
export class RegisterModule { }
