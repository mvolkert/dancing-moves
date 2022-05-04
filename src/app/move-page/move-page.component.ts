import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { CourseDateDto } from '../model/course-date-dto';
import { MoveDto } from '../model/move-dto';
import { MoveGroupDto } from '../model/move-group-dto';
import { UserMode } from '../model/user-mode';
import { VideoDto } from '../model/video-dto';
import { DataManagerService } from '../services/data-manager.service';
import { NavService } from '../services/nav.service';
import { SettingsService } from '../services/settings.service';
import { easterEggMoves } from '../util/data';
import { deepCopy, nameExistsValidator } from '../util/util';

@Component({
  selector: 'app-move-page',
  templateUrl: './move-page.component.html',
  styleUrls: ['./move-page.component.css']
})
export class MovePageComponent implements OnInit, OnDestroy {
  move: MoveDto | undefined;
  dances = new Array<string>();
  types = new Set<string>();
  courseNames = new Set<string>();
  moveForm = this.create_form();
  movesGroup: MoveGroupDto[] | undefined;
  otherMovesNames: Set<string> = new Set<string>();
  danceMovesNames: Set<string> = new Set<string>();
  loaded = false;
  nameParam = ""
  readonly = false;
  valueChangesSubscription: Subscription | undefined;
  userModeSubscription: Subscription | undefined;
  description: string = "";

  constructor(private route: ActivatedRoute, private dataManager: DataManagerService,
    private settings: SettingsService, private navService: NavService, private sanitizer: DomSanitizer) {
    this.route.paramMap.subscribe(params => {
      this.readParams(params);
    });
  }

  async ngOnInit(): Promise<void> {
    this.dataManager.getGroupedMoveNames().subscribe(groupedMoveNames => {
      this.movesGroup = groupedMoveNames;
    });
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
    this.moveForm = this.create_form();
    this.dances = Array.from(new Set(this.dataManager.getDances().map(dance => dance.name))).sort();
    this.types = this.dataManager.getTypes();
    this.courseNames = this.dataManager.getCourseNames();
    this.otherMovesNames = this.dataManager.getMovesNames();
    this.otherMovesNames.add("new");

    if (this.nameParam == "new") {
      if (this.move) {
        this.move = deepCopy(this.move);
        this.move.row = NaN;
        this.moveForm?.markAllAsTouched();
      }
    } else if (Object.keys(easterEggMoves).includes(this.nameParam)) {
      this.move = deepCopy(easterEggMoves[this.nameParam]);
    } else {
      this.move = this.dataManager.getMove(this.nameParam);
      if (this.move) {
        this.move.courseDates.forEach(this.addCourseDateForm);
        this.otherMovesNames.delete(this.move.name);
      }
    }
    this.valueChangesSubscription = this.moveForm.valueChanges.subscribe(value => {
      console.log(value);
      if (!this.move) {
        this.move = {} as MoveDto;
      }
      this.move.name = value.name;
      this.move.dance = value.dance;
      this.move.description = value.description;
      this.move.order = Number(value.order);
      this.move.count = value.count;
      this.move.nameVerified = value.nameVerified;
      this.move.type = value.type;
      this.move.startMove = value.startMove;
      this.move.endMove = value.endMove;
      this.move.containedMoves = value.containedMoves;
      this.move.relatedMoves = value.relatedMoves;
      this.move.relatedMovesOtherDances = value.relatedMovesOtherDances;
      this.move.videoname = value.videoname;
      this.move.links = value.links;
      this.move.toDo = value.toDo;
      this.move.courseDates = value.courseDates;
      this.danceMovesNames = this.dataManager.getMovesNamesOf(this.move?.dance);
      this.description = value.description;
      this.danceMovesNames.forEach(m => this.description = this.description.replace(m, `[${m}](move/${encodeURI(m)})`))
    });
    if (this.move) {
      this.moveForm.patchValue(this.move);
    }
    this.userModeSubscription = this.settings.userMode.subscribe(userMode => {
      if (userMode === UserMode.read) {
        this.moveForm.disable();
        this.readonly = true;
      }
    });
    this.move?.videos?.forEach(v => v.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(v.link));
  }

  private create_form(): FormGroup {
    return new FormGroup({
      name: new FormControl('', [Validators.required, nameExistsValidator(() => this.otherMovesNames)]),
      dance: new FormControl('', Validators.required),
      date: new FormControl(null),
      order: new FormControl(),
      count: new FormControl(''),
      nameVerified: new FormControl(''),
      type: new FormControl('Figur', Validators.required),
      startMove: new FormControl([]),
      endMove: new FormControl([]),
      containedMoves: new FormControl([]),
      relatedMoves: new FormControl([]),
      relatedMovesOtherDances: new FormControl([]),
      videoname: new FormControl(''),
      description: new FormControl(''),
      toDo: new FormControl(''),
      links: new FormControl(''),
      row: new FormControl(''),
      courseDates: new FormArray([])
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

  onSave() {
    if (this.moveForm.valid && this.move) {
      this.loaded = false;
      this.moveForm.disable();
      this.dataManager.saveOrCreate(this.move).subscribe(m => {
        this.moveForm.patchValue(m);
        const newName = m.name;
        if (this.nameParam != newName && this.nameParam != "new") {
          const dependentMoves = this.dataManager.findDependent(this.nameParam);
          if (dependentMoves && dependentMoves.length > 0) {
            dependentMoves.forEach(m => m.startMove = m.startMove.map(n => n == this.nameParam ? newName : n));
            dependentMoves.forEach(m => m.endMove = m.endMove.map(n => n == this.nameParam ? newName : n));
            dependentMoves.forEach(m => m.containedMoves = m.containedMoves.map(n => n == this.nameParam ? newName : n));
            dependentMoves.forEach(m => m.relatedMoves = m.relatedMoves.map(n => n == this.nameParam ? newName : n));
            dependentMoves.forEach(m => m.relatedMovesOtherDances = m.relatedMovesOtherDances.map(n => n == this.nameParam ? newName : n));
            dependentMoves.forEach(m => m.description = m.description.replace(this.nameParam, newName));
            this.dataManager.mulitSave(dependentMoves).subscribe(moves => {
              this.loaded = true;
              this.moveForm.enable();
              this.navService.navigate(["move", m.name]);
            });
          } else {
            this.loaded = true;
            this.moveForm.enable();
            this.navService.navigate(["move", m.name]);
          }

        } else {
          this.loaded = true;
          this.moveForm.enable();
          if (this.nameParam == "new") {
            this.navService.navigate(["move", m.name]);
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.valueChangesSubscription?.unsubscribe();
    this.userModeSubscription?.unsubscribe();
  }
}
