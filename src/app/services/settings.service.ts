import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import CryptoES from 'crypto-es';
import { BehaviorSubject, firstValueFrom, Subject, switchMap, tap } from 'rxjs';
import { SecretDto } from '../model/secret-dto';
import { SecretWriteDto } from '../model/secret-write-dto';
import { SpecialRight } from '../model/special-right';
import { UserMode } from '../model/user-mode';
import { NavService } from './nav.service';

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
    '8ccc189d957167a5f153089f7f50bc7574332880011eefd0470ac84534471a7c': SpecialRight.admin,
    'e9a03c9d033097130b229c2044eae02c80fd47dd2214952a6558c656b5386640': SpecialRight.video_ssm,
    'e0644e066bfe48ac317a8073b017af01e67506ad3d28144ec5a9f98f928aad0f': SpecialRight.video_ssm_sc,
    '2a81a551f614d45c8a87fd178d4a135d37fb79280fd108183cb17393d354d66c': SpecialRight.video_fau,
    'cca543992247230ebe41022d5e14ba0e8337c97b98c1fc1118bc30d07b672ca4': SpecialRight.video_tsm,
    '28c48b8eb4d51ab963b42acb377ab809b8bd15c0977ca6325439bff6ea5e61be': SpecialRight.video_tsc
  } as { [key: string]: string };

  constructor(private route: ActivatedRoute, private http: HttpClient, private navService: NavService) { }

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

    this.specialRightsString = this.getArraySetting(params, 'special-rights');
    this.specialRights = new Array<string>();
    this.specialRightsString?.split(",").forEach((key: string) => {
      const hash = this.hash(key);
      if (this.specialRightsMap[hash]) {
        this.specialRights.push(this.specialRightsMap[hash]);
      }
    });
    const queryJson = { 'secret': this.secretReadString, 'secret-write': this.secretWriteString, 'special-rights': this.specialRightsString };
    //this.navService.navigate([this.navService.getPath()], queryJson);
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
    return hash;
  }

  hasSpecialRight = (key: string) => {
    return this.specialRights.includes(key);
  }

  hasOneSpecialRight(keys: Array<string>) {
    return keys.filter(this.hasSpecialRight).length > 0;
  }

  private getSetting(params: Params, key: string): string {
    if (params[key]) {
      const value = params[key];
      localStorage.setItem(key, value);
      return value;
    }
    return localStorage.getItem(key) ?? '';
  }

  private getArraySetting(params: Params, key: string): string {
    const localEntries = (localStorage.getItem(key) ?? '').split(',');
    const queryEntries = (params[key] ?? '').split(',');
    const mergedString = Array.from(new Set([...localEntries, ...queryEntries].filter(e => e))).join(',');
    localStorage.setItem(key, mergedString);
    return mergedString;
  }
}
