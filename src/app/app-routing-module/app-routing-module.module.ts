import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseCardsPageComponent } from '../course-cards-page/course-cards-page.component';
import { CoursePageComponent } from '../course-page/course-page.component';
import { DanceCardsPageComponent } from '../dance-cards-page/dance-cards-page.component';
import { DancePageComponent } from '../dance-page/dance-page.component';
import { MoveCardsPageComponent } from '../move-cards-page/move-cards-page.component';
import { MovePageComponent } from '../move-page/move-page.component';
import { RelationsPageComponent } from '../relations-page/relations-page.component';
import { SettingsPageComponent } from '../settings-page/settings-page.component';


const routes: Routes = [
  { path: '', redirectTo: 'moves', pathMatch: 'full' },
  { path: 'settings', component: SettingsPageComponent },
  { path: 'dances', component: DanceCardsPageComponent },
  { path: 'dance/:name', component: DancePageComponent },
  { path: 'courses', component: CourseCardsPageComponent },
  { path: 'course/:name', component: CoursePageComponent },
  { path: 'moves', component: MoveCardsPageComponent },
  { path: 'move/:name', component: MovePageComponent },
  { path: 'relations', component: RelationsPageComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    anchorScrolling: 'enabled',
    scrollPositionRestoration: 'top'
  })],
  exports: [RouterModule]
})
export class AppRoutingModuleModule { }
