import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SettingsService } from '../services/settings.service';

@Component({
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.css']
})
export class SettingsPageComponent implements OnInit {
  settingsForm = new FormGroup({
    secretRead: new FormControl(''),
    secretWrite: new FormControl(''),
  });
  url: string = this.createUrl();
  constructor(private settings: SettingsService, private router: Router) { }

  ngOnInit(): void {
    this.settingsForm.patchValue({
      secretRead: this.settings.secretReadString,
      secretWrite: this.settings.secretWriteString
    });
    this.settingsForm.valueChanges.subscribe(value => {
      this.router.navigate([], {
        queryParams: { 'secret': value.secretRead, 'secret-write': value.secretWrite },
        queryParamsHandling: 'merge'
      })
      this.url = this.createUrl();
    });
  }

  private createUrl() {
    const options = []
    if (this.settings.secretReadString) {
      options.push(`secret=${this.settings.secretReadString}`)
    }
    if (this.settings.secretWriteString) {
      options.push(`secret-write=${this.settings.secretWriteString}`)
    }
    if (options.length > 0) {
      return `${document.baseURI}?${options.join('&')}`
    }
    return document.baseURI
  }

  onSubmit() {

  }
}
