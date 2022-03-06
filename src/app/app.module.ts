import { ClipboardModule } from '@angular/cdk/clipboard';
import { LayoutModule } from '@angular/cdk/layout';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MarkdownModule } from 'ngx-markdown';
import { AppRoutingModuleModule } from './app-routing-module/app-routing-module.module';
import { AppComponent } from './app.component';
import { DanceCardsPageComponent } from './dance-cards-page/dance-cards-page.component';
import { MoveCardComponent } from './move-cards-page/move-card/move-card.component';
import { MoveCardsPageComponent } from './move-cards-page/move-cards-page.component';
import { MovePageComponent } from './move-page/move-page.component';
import { DanceMoveSelectionComponent } from './nav/dance-move-selection/dance-move-selection.component';
import { NavComponent } from './nav/nav.component';
import { RelationsSelectionComponent } from './nav/relations-selection/relations-selection.component';
import { RelationsPageComponent } from './relations-page/relations-page.component';
import { SettingsPageComponent } from './settings-page/settings-page.component';
import { CourseCardsPageComponent } from './course-cards-page/course-cards-page.component';
import { CoursePageComponent } from './course-page/course-page.component';
@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    MoveCardComponent,
    MoveCardsPageComponent,
    MovePageComponent,
    SettingsPageComponent,
    DanceCardsPageComponent,
    RelationsPageComponent,
    RelationsSelectionComponent,
    DanceMoveSelectionComponent,
    CourseCardsPageComponent,
    CoursePageComponent
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
    MatExpansionModule,
    MarkdownModule.forRoot(),
  ],
  providers: [{ provide: MAT_DATE_LOCALE, useValue: 'de-DE' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
