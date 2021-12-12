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
import { NavService } from '../services/nav.service';
import { UserMode } from '../model/user-mode';

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
    private settingsService: SettingsService, private navService: NavService) {

  }
  async ngOnInit() {
    this.navService.headlineObservable.subscribe(headline => this.headline = headline);
    await this.settingsService.loading();
    this.settingsService.userMode.subscribe(userMode => this.readonly = userMode === UserMode.read);
  }

  normalize() {
    this.dataManager.normalize();
  }

  navigate(path: string): Promise<boolean> {
    return this.navService.navigate([path]);
  }
}
