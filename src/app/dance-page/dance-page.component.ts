import { Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { DanceDto } from '../model/dance-dto';
import { UserMode } from '../model/user-mode';
import { DataManagerService } from '../services/data-manager.service';
import { NavService } from '../services/nav.service';
import { SettingsService } from '../services/settings.service';
import { deepCopy, nameExistsValidator } from '../util/util';

@Component({
  templateUrl: './dance-page.component.html',
  styleUrls: ['./dance-page.component.css']
})
export class DancePageComponent implements OnInit, OnDestroy {
  dance: DanceDto | undefined;
  otherNames: Set<string> = new Set<string>();
  dances = new Set<string>();
  schools = new Set<string>();
  levels = new Set<string>();
  loaded = false;
  nameParam = "";
  readonly = false;
  form = this.create_form();
  subscriptionsGlobal = new Array<Subscription>();
  subscriptions = new Array<Subscription>();

  constructor(private route: ActivatedRoute, private dataManager: DataManagerService,
    private settings: SettingsService, private navService: NavService) {
    this.subscriptionsGlobal.push(this.route.paramMap.subscribe(params => {
      this.readParams(params);
    }));
  }

  ngOnInit(): void {
    this.subscriptionsGlobal.push(this.dataManager.isStarting.subscribe(starting => {
      if (!starting) {
        this.start();
      }
      this.loaded = !starting;
    }));
  }

  private start() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.form = this.create_form();
    this.dances = new Set(this.dataManager.getDances().map(dance => dance.name));
    const dances = this.dataManager.getDances();
    this.otherNames = new Set(dances.map(dance => dance.name));
    this.otherNames.add("new");

    if (this.nameParam == "new") {
      if (this.dance) {
        this.dance = deepCopy(this.dance);
        this.dance.row = NaN;
        this.form?.markAllAsTouched();
      }
    } else {
      this.dance = dances.find(dance => dance.name == this.nameParam);
      if (this.dance) {
        this.otherNames.delete(this.dance.name);
      }
    }
    this.subscriptions.push(this.form.valueChanges.subscribe(value => {
      if (!this.dance) {
        this.dance = {} as DanceDto;
      }
      this.dance.name = value.name;
      this.dance.type = value.type;
      this.dance.music = value.music;
      this.dance.rhythm = value.rhythm;
      this.dance.description = value.description;
      this.dance.links = value.links;
    }));
    if (this.dance) {
      this.form.patchValue(this.dance);
    }
    this.subscriptions.push(this.settings.userMode.subscribe(userMode => {
      if (userMode === UserMode.read) {
        this.form.disable();
        this.readonly = true;
      }
    }));
  }

  private create_form() {
    return new UntypedFormGroup({
      name: new UntypedFormControl('', [Validators.required, nameExistsValidator(() => this.otherNames)]),
      type: new UntypedFormControl([]),
      music: new UntypedFormControl(''),
      rhythm: new UntypedFormControl(''),
      description: new UntypedFormControl(null),
      links: new UntypedFormControl(null),
      row: new UntypedFormControl(''),
    });
  }
  private readParams(params: ParamMap) {
    if (!params.has('name')) {
      return;
    }
    this.nameParam = params.get('name') as string;
    this.nameParam = decodeURI(this.nameParam);
    this.navService.headlineObservable.next(this.nameParam);
    if (this.loaded) {
      this.start();
    }
  }

  private createContentForm = () => {
    return new UntypedFormGroup({
      name: new UntypedFormControl(''),
      link: new UntypedFormControl(null),
      row: new UntypedFormControl('')
    });
  }

  addContentForm = () => {
    const formArray = this.form.get("contents") as UntypedFormArray;
    formArray.push(this.createContentForm());
  }

  getContentControls() {
    return (this.form.get('contents') as UntypedFormArray).controls;
  }

  onSubmit() {
    if (this.form.valid && this.dance) {
      this.loaded = false;
      this.form.disable();
      this.dataManager.saveOrCreateDance(this.dance).subscribe(m => {
        console.log(m);
        this.form.patchValue(m);
        this.loaded = true;
        this.form.enable();
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptionsGlobal.forEach(s => s.unsubscribe());
  }
}
