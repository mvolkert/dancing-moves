import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { Params } from '@angular/router';
import { UserMode } from '../model/user-mode';
import { NavService } from '../services/nav.service';
import { SettingsService } from '../services/settings.service';

@Component({
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css']
})
export class SettingsPageComponent implements OnInit {
  settingsForm = new UntypedFormGroup({
    secretRead: new UntypedFormControl(''),
    secretWrite: new UntypedFormControl(''),
    specialRights: new UntypedFormControl(''),
    sheetId: new UntypedFormControl('')
  });
  url!: string;
  constructor(private settings: SettingsService, private navService: NavService) {
    this.navService.headlineObservable.next("Settings");
  }

  async ngOnInit(): Promise<void> {
    await this.settings.loading();
    this.loginGoogle();
    this.settingsForm.valueChanges.subscribe(value => {
      console.log(value);
      const queryJson = { 'secret': value.secretRead, 'secret-write': value.secretWrite, 'special-rights': value.specialRights };
      this.navService.navigate([], queryJson);
      this.url = this.createUrl(queryJson);
      localStorage.setItem('secret', value.secretRead);
      localStorage.setItem('secret-write', value.secretWrite);
      localStorage.setItem('special-rights', value.specialRights);
      localStorage.setItem('sheetId', value.sheetId);
    });
    this.settingsForm.patchValue({
      secretRead: this.settings.secretReadString,
      secretWrite: this.settings.secretWriteString,
      specialRights: this.settings.specialRightsString,
      sheetId: this.settings.sheetId
    });
  }

  private createUrl(queryJson: Params): string {
    const options = Object.entries(queryJson).filter(value => value[1]).map(value => `${value[0]}=${value[1]}`);
    if (options.length > 0) {
      return `${document.baseURI}?${options.join('&')}`
    }
    return document.baseURI
  }

  onSubmit() {

  }

  handleCredentialResponse = (response: any) => {
    console.log("Encoded JWT ID token: " + response.credential);
    if (response.credential) {
      this.settings.googleJwtString = response.credential;
      this.settings.userMode.next(UserMode.write)
    }
  }
  // @ts-ignore
  loginGoogle() {
    // @ts-ignore
    google.accounts.id.initialize({
      client_id: "899905894399-7au62afsvq8l1hqcu5mjh6hbll44vr7t.apps.googleusercontent.com",
      scope: "https://www.googleapis.com/auth/spreadsheets",
      callback: this.handleCredentialResponse
    });
    // @ts-ignore
    google.accounts.id.renderButton(
      document.getElementById("google_button"),
      { theme: "outline", size: "large" }  // customization attributes
    );
    // @ts-ignore
    google.accounts.id.prompt(); // also display the One Tap dialog

  }
}
