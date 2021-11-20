import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SecretDto } from '../model/secret-dto';
import * as CryptoJS from 'crypto-js';
import { SecretWriteDto } from '../model/secret-write-dto';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  secret: SecretDto | undefined;
  secretWrite: SecretWriteDto | undefined;
  secretReadString: string | undefined;
  secretWriteString: string | undefined;
  isStarted = false;
  isStarting = new Subject<boolean>();

  constructor(private route: ActivatedRoute, private cookies: CookieService, private http: HttpClient) { }

  fetchSettings() {
    this.http.get('assets/secret-write.txt')
    this.route.queryParams.subscribe(params => {
      this.initSettings(params);
    })
  }

  async loading() {
    if (!this.isStarted) {
      await firstValueFrom(this.isStarting);
    }
  }

  initSettings(params: Params) {
    this.secretReadString = this.getSetting(params, 'secret');

    if (this.secretReadString) {
      this.http.get<string>('assets/secret-read.txt', { responseType: 'text' as 'json' }).subscribe(data => {
        const decrypted = CryptoJS.AES.decrypt(data, this.secretReadString as string);
        this.secret = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
        this.isStarting.next(false);
        this.isStarted = true;
      });
    }
    this.secretWriteString = this.getSetting(params, 'secret-write');

    if (this.secretWriteString) {
      this.http.get<string>('assets/secret-write.txt', { responseType: 'text' as 'json' }).subscribe(data => {
        const decrypted = CryptoJS.AES.decrypt(data, this.secretWriteString as string);
        this.secretWrite = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
      });
    }
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
