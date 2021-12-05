import { LayoutModule } from '@angular/cdk/layout';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
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
import { MoveCardComponent } from './move-cards-page/move-card/move-card.component';
import { MoveCardsPageComponent } from './move-cards-page/move-cards-page.component';
import { MovePageComponent } from './move-page/move-page.component';
import { NavComponent } from './nav/nav.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { HttpClientModule } from '@angular/common/http';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MarkdownModule } from 'ngx-markdown';
import { RelationsPageComponent } from './relations-page/relations-page.component';
import { GojsAngularModule } from 'gojs-angular';
@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    MoveCardComponent,
    MoveCardsPageComponent,
    MovePageComponent,
    SettingsPageComponent,
    DanceCardsPageComponent,
    RelationsPageComponent
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
    MatDatepickerModule,
    AppRoutingModuleModule,
    ReactiveFormsModule,
    MatNativeDateModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    HttpClientModule,
    ClipboardModule,
    MatProgressBarModule,
    MatSnackBarModule,
    GojsAngularModule,
    MarkdownModule.forRoot(),
  ],
  providers: [CookieService, {provide: MAT_DATE_LOCALE, useValue: 'de-DE'}],
  bootstrap: [AppComponent]
})
export class AppModule { }
