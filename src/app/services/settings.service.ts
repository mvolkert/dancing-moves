import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import CryptoES from 'crypto-es';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, firstValueFrom, of, Subject, switchMap, tap } from 'rxjs';
import { SecretDto } from '../model/secret-dto';
import { SecretWriteDto } from '../model/secret-write-dto';
import { UserMode } from '../model/user-mode';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  secret: SecretDto | undefined;
  secretWrite: SecretWriteDto | undefined;
  secretReadString!: string;
  secretWriteString!: string;
  isStarted = false;
  isStarting = new Subject<boolean>();
  userMode = new BehaviorSubject<UserMode>(UserMode.test);
  specialRightsString!: string;
  specialRights!: Array<string>;
  specialRightsMap = {
    '8ccc189d957167a5f153089f7f50bc7574332880011eefd0470ac84534471a7c': 'admin',
    'e9a03c9d033097130b229c2044eae02c80fd47dd2214952a6558c656b5386640': 'video-ssm'
  } as { [key: string]: string };

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  fetchSettings() {
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
    this.secretWriteString = this.getSetting(params, 'secret-write');

    if (this.secretReadString) {
      this.getFile('secret-read.txt').pipe(tap(data => {
        this.secret = this.decrypt(data, this.secretReadString);
      }), switchMap(() => this.getFile('secret-write.txt'))).subscribe(data => {
        this.secretWrite = this.decrypt(data, this.secretWriteString);
        if (this.secret && this.secretWrite) {
          this.userMode.next(UserMode.write)
        } else if (this.secret) {
          this.userMode.next(UserMode.read)
        } else {
          this.userMode.next(UserMode.test)
        }
        this.isStarting.next(false);
        this.isStarted = true;
      });;
    }

    this.specialRightsString = this.getSetting(params, 'special-rights');
    this.specialRights = new Array<string>();
    this.specialRightsString?.split(",").forEach((key: string) => {
      const hash = this.hash(key);
      if (this.specialRightsMap[hash]) {
        this.specialRights.push(this.specialRightsMap[hash]);
      }
    });
  }

  private getFile(filename: string) {
    return this.http.get<string>(`assets/${filename}`, { responseType: 'text' as 'json' });
  }

  private decrypt(data: string, key: string): any {
    if (!key) {
      return undefined;
    }
    try {
      const decrypted = CryptoES.AES.decrypt(data, key);
      const decryptedString = decrypted.toString(CryptoES.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (e) {
      console.log('incorrect secret', key, e);
      return undefined;
    }
  }

  encrypt(data: string, key: string) {
    const encrypted = CryptoES.AES.encrypt(data, key);
    const encryptedString = encrypted.toString();
    console.log(encryptedString);
  }

  hash(key: string) {
    const hash = CryptoES.SHA256(key).toString();
    console.log(hash);
    return hash;
  }

  hasSpecialRight(key: string) {
    return this.specialRights.includes(key);
  }

  private getSetting(params: Params, key: string): string {
    return params[key];
  }
}
