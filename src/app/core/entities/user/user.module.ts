import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserStoreService } from './store/user-store.service';
import { UserService } from './services/user.service';

@NgModule({
  declarations: [],
  imports: [CommonModule],
  providers: [
    UserService,
    UserStoreService,
  ]
})
export class UserEntityModule { }
