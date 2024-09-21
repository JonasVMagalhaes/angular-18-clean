import { Injectable } from '@angular/core';

import CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  private readonly secretKey: string = 'chave_secreta_para_criptografia';

  constructor() { }

  encrypt(value: string): string {
    const encryptedToken = CryptoJS.AES.encrypt(value, this.secretKey).toString();
    return encryptedToken;
  }

  decrypt(encryptedvalue: string): string {
    const decryptedBytes = CryptoJS.AES.decrypt(encryptedvalue, this.secretKey);
    const decryptedToken = decryptedBytes.toString(CryptoJS.enc.Utf8);
    return decryptedToken;
  }
}
