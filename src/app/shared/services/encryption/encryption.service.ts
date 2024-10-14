import { Injectable } from '@angular/core';

import CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  private readonly secretKey: string = 'chave_secreta_para_criptografia';

  constructor() { }

  encrypt(value: string): string {
    return CryptoJS.AES.encrypt(value, this.secretKey).toString();
  }

  decrypt(encryptedvalue: string): string {
    const decryptedBytes: CryptoJS.lib.WordArray = CryptoJS.AES.decrypt(encryptedvalue, this.secretKey);
    return decryptedBytes.toString(CryptoJS.enc.Utf8);
  }
}
