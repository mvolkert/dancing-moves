import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SecretDto } from '../model/secret-dto';
import * as CryptoJS from 'crypto-js';
import { SecretWriteDto } from '../model/secret-write-dto';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  secret: SecretDto | undefined;
  secretWrite: SecretWriteDto = {} as SecretWriteDto;

  constructor(private route: ActivatedRoute, private cookies: CookieService, private http: HttpClient) { }

  fetchSettings() {
    this.http.get('assets/secret-write.txt')
    this.route.queryParams.subscribe(params => {
      console.log(params);
      const secretBase64 = this.getSetting(params, 'secret');
      // console.log(btoa(JSON.stringify({sheetId:"",apiKey:""})));
      if (secretBase64) {
        this.secret = JSON.parse(atob(secretBase64));
      }
      const secretWriteKey = this.getSetting(params, 'secret-write');

      if (secretWriteKey) {
        this.http.get<string>('assets/secret-write.txt', { responseType: 'text' as 'json' }).subscribe(data => {
          const decrypted = CryptoJS.AES.decrypt(data, secretWriteKey)
          this.secretWrite = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
        });
      }
    })
  }

  private getSetting(params: Params, key: string): string {
    let settingString = params[key];
    if (settingString) {
      this.cookies.set(key, settingString, new Date(Date.now() + 1000 * 3600 * 24 * 10));
    } else {
      settingString = this.cookies.get(key);
    }
    return settingString;
  }
}
