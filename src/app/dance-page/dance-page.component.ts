import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
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
  valueChangesSubscription: Subscription | undefined;
  userModeSubscription: Subscription | undefined;

  constructor(private route: ActivatedRoute, private dataManager: DataManagerService,
    private settings: SettingsService, private navService: NavService) {
    this.route.paramMap.subscribe(params => {
      this.readParams(params);
    });
  }

  ngOnInit(): void {
    this.dataManager.isStarting.subscribe(starting => {
      if (!starting) {
        this.start();
      }
      this.loaded = !starting;
    });
  }

  private start() {
    this.valueChangesSubscription?.unsubscribe();
    this.userModeSubscription?.unsubscribe();
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
    this.valueChangesSubscription = this.form.valueChanges.subscribe(value => {
      if (!this.dance) {
        this.dance = {} as DanceDto;
      }
      this.dance.name = value.name;
      this.dance.type = value.type;
      this.dance.music = value.music;
      this.dance.rhythm = value.rhythm;
      this.dance.description = value.description;
      this.dance.links = value.links;
    });
    if (this.dance) {
      this.form.patchValue(this.dance);
    }
    this.userModeSubscription = this.settings.userMode.subscribe(userMode => {
      if (userMode === UserMode.read) {
        this.form.disable();
        this.readonly = true;
      }
    });
  }

  private create_form() {
    return new FormGroup({
      name: new FormControl('', [Validators.required, nameExistsValidator(() => this.otherNames)]),
      type: new FormControl([]),
      music: new FormControl(''),
      rhythm: new FormControl(''),
      description: new FormControl(null),
      links: new FormControl(null),
      row: new FormControl(''),
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
    return new FormGroup({
      name: new FormControl(''),
      link: new FormControl(null),
      row: new FormControl('')
    });
  }

  addContentForm = () => {
    const formArray = this.form.get("contents") as FormArray;
    formArray.push(this.createContentForm());
  }

  getContentControls() {
    return (this.form.get('contents') as FormArray).controls;
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
    this.valueChangesSubscription?.unsubscribe();
    this.userModeSubscription?.unsubscribe();
  }
}
