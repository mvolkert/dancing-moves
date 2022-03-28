import { Component, OnInit } from '@angular/core';
import { ApiclientService } from './services/apiclient.service';
import { DataManagerService } from './services/data-manager.service';
import { SettingsService } from './services/settings.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'dancing-moves';

  constructor(private settingsService: SettingsService, private dataManagerService: DataManagerService, private apiclientService: ApiclientService) {

  }

  ngOnInit(): void {
    this.settingsService.fetchSettings(() => this.apiclientService.getDataAccess());
    this.dataManagerService.start();
  }
}
