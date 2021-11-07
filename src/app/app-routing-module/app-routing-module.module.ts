import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DanceCardsPageComponent } from '../dance-cards-page/dance-cards-page.component';
import { MoveCardsPageComponent } from '../move-cards-page/move-cards-page.component';
import { MovePageComponent } from '../move-page/move-page.component';
import { SettingsPageComponent } from '../settings-page/settings-page.component';


const routes: Routes = [
  { path: '',   redirectTo: 'moves', pathMatch: 'full' },
  { path: 'settings', component: SettingsPageComponent },
  { path: 'dances', component: DanceCardsPageComponent },
  { path: 'moves', component: MoveCardsPageComponent },
  { path: 'move/:name', component: MovePageComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModuleModule { }
