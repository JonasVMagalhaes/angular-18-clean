import { Injectable } from '@angular/core';
import { User } from '../dtos/user-dto';

@Injectable({
  providedIn: 'root'
})
export class UserStoreService {
  private data: User;

  constructor() { }
}
