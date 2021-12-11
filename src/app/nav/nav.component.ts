import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DataManagerService } from '../services/data-manager.service';
import { SettingsService } from '../services/settings.service';
import { FormControl, FormGroup } from '@angular/forms';
import { MoveGroupDto } from '../model/move-group-dto';
import { MoveDto } from '../model/move-dto';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  devMode = !environment.production;
  readonly = true;
  headline = "Dancing Moves"

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver,
    private dataManager: DataManagerService,
    private settingsService: SettingsService) {

  }
  async ngOnInit() {
    await this.settingsService.loading();
    this.readonly = !this.settingsService.secretWriteString;
  }

  normalize() {
    this.dataManager.normalize();
  }

  setHeadline(headline: string) {
    this.headline = headline;
  }
}
