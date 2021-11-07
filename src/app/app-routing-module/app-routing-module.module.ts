import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovesContentComponent } from '../moves-content/moves-content.component';


const routes: Routes = [{ path: '**', component: MovesContentComponent }]; // sets up routes constant where you define your routes

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModuleModule { }
