import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { NavService } from '../services/nav.service';
import { SettingsService } from '../services/settings.service';

@Component({
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css']
})
export class SettingsPageComponent implements OnInit {
  settingsForm = new FormGroup({
    secretRead: new FormControl(''),
    secretWrite: new FormControl(''),
    specialRights: new FormControl(''),
  });
  url!: string;
  constructor(private settings: SettingsService, private navService: NavService) {
    this.navService.headlineObservable.next("Settings");
  }

  async ngOnInit(): Promise<void> {
    await this.settings.loading();
    this.settingsForm.valueChanges.subscribe(value => {
      console.log(value);
      const queryJson = { 'secret': value.secretRead, 'secret-write': value.secretWrite, 'special-rights': value.specialRights }
      this.navService.navigate([], queryJson)
      this.url = this.createUrl(queryJson);
    });
    this.settingsForm.patchValue({
      secretRead: this.settings.secretReadString,
      secretWrite: this.settings.secretWriteString,
      specialRights: this.settings.specialRightsString
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
}
