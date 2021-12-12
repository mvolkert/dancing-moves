import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { MoveDto } from '../model/move-dto';
import { MoveGroupDto } from '../model/move-group-dto';
import { SecretDto } from '../model/secret-dto';
import { UserMode } from '../model/user-mode';
import { DataManagerService } from '../services/data-manager.service';
import { NavService } from '../services/nav.service';
import { SettingsService } from '../services/settings.service';

@Component({
  selector: 'app-move-page',
  templateUrl: './move-page.component.html',
  styleUrls: ['./move-page.component.css']
})
export class MovePageComponent implements OnInit {
  move: MoveDto | undefined;
  dances = new Set<string>();
  types = new Set<string>();
  courseNames = new Set<string>();
  moveForm = new FormGroup({
    name: new FormControl('', [Validators.required, this.nameExistsValidator()]),
    dance: new FormControl('', Validators.required),
    date: new FormControl(null),
    order: new FormControl(''),
    count: new FormControl(''),
    nameVerified: new FormControl(''),
    type: new FormControl('Figur', Validators.required),
    startMove: new FormControl([]),
    endMove: new FormControl([]),
    relatedMoves: new FormControl([]),
    relatedMovesOtherDances: new FormControl([]),
    videoname: new FormControl(''),
    description: new FormControl(''),
    toDo: new FormControl(''),
    links: new FormControl(''),
    row: new FormControl(''),
    courseDates: new FormArray([])
  });
  movesGroup: MoveGroupDto[] | undefined;
  otherMovesNames: Set<string> = new Set<string>();
  danceMovesNames: Set<string> = new Set<string>();
  loaded = false;
  nameParam = ""
  readonly = false;
  videoLink!: SafeResourceUrl;

  constructor(private route: ActivatedRoute, private dataManager: DataManagerService,
    private settings: SettingsService, private navService: NavService, private sanitizer: DomSanitizer) {
    this.route.paramMap.subscribe(params => {
      this.readParams(params);
    });
  }

  async ngOnInit(): Promise<void> {
    this.moveForm.valueChanges.subscribe(value => {
      console.log(value);
    });
    this.dataManager.getGroupedMoveNames().subscribe(groupedMoveNames => {
      this.movesGroup = groupedMoveNames;
    });
    await this.dataManager.loading();
    this.dances = this.dataManager.getDances();
    this.types = this.dataManager.getTypes();
    this.courseNames = this.dataManager.getCourseNames();
    this.otherMovesNames = this.dataManager.getMovesNames();
    this.otherMovesNames.add("new");

    if (this.nameParam == "new") {
      if (this.move) {
        this.moveForm.reset();
        this.move = JSON.parse(JSON.stringify(this.move));
        if (this.move) {
          this.move.row = NaN;
        }
      }
    } else {
      this.move = this.dataManager.getMove(this.nameParam);
      if (this.move) {
        this.move.courseDates.forEach(this.addCourseDateForm);
        this.otherMovesNames.delete(this.move.name);
      }
    }
    this.moveForm.valueChanges.subscribe(value => {
      this.move = value;
      this.danceMovesNames = this.dataManager.getMovesNamesOf(this.move?.dance);
    });
    if (this.move) {
      this.moveForm.patchValue(this.move);
    }

    this.moveForm.updateValueAndValidity();
    this.settings.userMode.subscribe(userMode => {
      if (userMode === UserMode.read) {
        this.moveForm.disable();
        this.readonly = true;
      } else {
        this.videoLink = this.sanitizer.bypassSecurityTrustResourceUrl(`https://mega.nz/embed/${this.settings.secret?.videoLink}`);
      }
    });
    this.loaded = true;
  }

  private readParams(params: ParamMap) {
    if (!params.has('name')) {
      return;
    }
    this.nameParam = params.get('name') as string;
    this.nameParam = decodeURI(this.nameParam);
    this.navService.headlineObservable.next(this.nameParam);
  }

  private createCourseDateForm = () => {
    return new FormGroup({
      course: new FormControl(''),
      date: new FormControl(null),
      row: new FormControl('')
    });
  }

  addCourseDateForm = () => {
    const formArray = this.moveForm.get("courseDates") as FormArray;
    formArray.push(this.createCourseDateForm());
  }

  removeOrClearCourseDate = (i: number) => {
    const formArray = this.moveForm.get('courseDates') as FormArray
    if (formArray.length > 1) {
      formArray.removeAt(i)
    } else {
      formArray.reset()
    }
  }

  getCourseDateControls() {
    return (this.moveForm.get('courseDates') as FormArray).controls;
  }

  onSubmit() {
    if (this.moveForm.valid && this.move) {
      this.loaded = false;
      this.readonly = true;
      this.moveForm.disable();
      this.dataManager.saveOrCreate(this.move).subscribe(m => {
        console.log(m);
        this.moveForm.patchValue(m);
        this.loaded = true;
        this.readonly = false;
        this.moveForm.enable();
      });
    }
  }

  private nameExistsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const forbidden = this.otherMovesNames?.has(control.value);
      return forbidden ? { nameExists: { value: control.value } } : null;
    };
  }
}
