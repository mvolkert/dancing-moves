import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import CryptoES from 'crypto-es';
import { BehaviorSubject, firstValueFrom, forkJoin, Observable, Subject, switchMap, tap } from 'rxjs';
import { DataAccessDto } from '../model/data-access-dto';
import { SecretDto } from '../model/secret-dto';
import { SecretWriteDto } from '../model/secret-write-dto';
import { SpecialRight } from '../model/special-right';
import { UserMode } from '../model/user-mode';
import { ApiclientService } from './apiclient.service';
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
  specialRights!: Array<DataAccessDto>;

  constructor(private route: ActivatedRoute, private http: HttpClient) { }

  fetchSettings(getDataAccess: () => DataAccessDto[]) {
    this.route.queryParams.subscribe(params => {
      this.initSettings(params, getDataAccess);
    })
  }

  async loading() {
    if (!this.isStarted) {
      await firstValueFrom(this.isStarting);
    }
  }

  initSettings(params: Params, getDataAccess: () => DataAccessDto[]) {
    this.secretReadString = this.getSetting(params, 'secret');
    this.secretWriteString = this.getSetting(params, 'secret-write');

    forkJoin({ read: this.getFile('secret-read.txt'), write: this.getFile('secret-write.txt') }).subscribe(data => {
      this.secret = this.decrypt(data.read, this.secretReadString);
      this.secretWrite = this.decrypt(data.write, this.secretWriteString);
      if (this.secret && this.secretWrite) {
        this.userMode.next(UserMode.write)
      } else if (this.secret) {
        this.userMode.next(UserMode.read)
      } else {
        this.userMode.next(UserMode.test)
      }
      this.specialRightsString = this.getArraySetting(params, 'special-rights');
      const specialRightsArray = this.specialRightsString?.split(",").map(this.hash);
      console.log(specialRightsArray);
      this.specialRights = getDataAccess().filter(s => specialRightsArray.includes(s.hash));
      const queryJson = { 'secret': this.secretReadString, 'secret-write': this.secretWriteString, 'special-rights': this.specialRightsString };
      //this.navService.navigate([this.navService.getPath()], queryJson);
      this.isStarting.next(false);
      this.isStarted = true;
    });;

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

  hash = (key: string) => {
    const hash = CryptoES.SHA256(key).toString();
    return hash;
  }

  hasSpecialRight = (key: string) => {
    return this.specialRights.map(a => a.name).includes(key);
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
