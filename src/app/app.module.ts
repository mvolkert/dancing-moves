import { LayoutModule } from '@angular/cdk/layout';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CookieService } from 'ngx-cookie-service';
import { AppRoutingModuleModule } from './app-routing-module/app-routing-module.module';
import { AppComponent } from './app.component';
import { DanceCardsPageComponent } from './dance-cards-page/dance-cards-page.component';
import { MoveCardComponent } from './move-card/move-card.component';
import { MoveCardsPageComponent } from './move-cards-page/move-cards-page.component';
import { MovePageComponent } from './move-page/move-page.component';
import { NavComponent } from './nav/nav.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';
@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    MoveCardComponent,
    MoveCardsPageComponent,
    MovePageComponent,
    SettingsPageComponent,
    DanceCardsPageComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    AppRoutingModuleModule, 
    ReactiveFormsModule
  ],
  providers: [CookieService],
  bootstrap: [AppComponent]
})
export class AppModule { }
