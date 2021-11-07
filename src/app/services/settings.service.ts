import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { SecretDto } from '../model/secret-dto';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  secret: SecretDto | undefined;

  constructor(private route: ActivatedRoute, private cookies: CookieService) { }

  fetchSettings() {
    this.route.queryParams.subscribe(params => {
      console.log(params);
      let secretBase64 = params['secret'];
      if (secretBase64) {
        this.cookies.set("secret", secretBase64, new Date(Date.now() + 1000 * 3600 * 24 * 10));
      } else {
        secretBase64 = this.cookies.get('secret');
      }
      // console.log(btoa(JSON.stringify({sheetId:"",apiKey:""})));
      if (secretBase64) {
        this.secret = JSON.parse(atob(secretBase64));
      }
    })
  }
}
