import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { DataManagerService } from '../services/data-manager.service';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {

  devMode = !environment.production;
  readonly = !this.settingsService.secretWrite

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver,
    private dataManager: DataManagerService,
    private settingsService: SettingsService) {

  }

  normalize() {
    this.dataManager.normalize();
  }

}
