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
import { deepCopy, nameExistsValidator } from '../util/util';

@Component({
  selector: 'app-move-page',
  templateUrl: './move-page.component.html',
  styleUrls: ['./move-page.component.css']
})
export class MovePageComponent implements OnInit, OnDestroy {
  move: MoveDto | undefined;
  dances = new Set<string>();
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


  konami = {
    dance: "Westcoast Swing",
    name: "Konami",
    count: "10",
    startMove: [] as string[],
    endMove: [] as string[],
    containedMoves: [] as string[],
    relatedMoves: [] as string[],
    relatedMovesOtherDances: [] as string[],
    courseDates: [] as CourseDateDto[],
    videos: [] as VideoDto[],
    description: "# Ablauf \n## Leader\n- 1 links vor\n- 2 rechts vor\n- 3 links zurück\n- 4 rechts zurück\n- 5 links Gewichtsverlagerung\n- 6 rechts Gewichtsverlagerung\n- 7 links Gewichtsverlagerung\n- 8 rechts Gewichtsverlagerung\n- 9 Bauch raus\n- 10 Anker\n\n## Follower\ngespiegelt\n# Bemerkung\nSchalted extra Power beim Follower frei"
  } as MoveDto;

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
    this.dances = new Set(this.dataManager.getDances().map(dance => dance.name));
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
    } else if (this.nameParam == this.konami.name) {
      this.move = deepCopy(this.konami);
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
      this.move.relatedMoves = value.relatedMoves;
      this.move.relatedMovesOtherDances = value.relatedMovesOtherDances;
      this.move.videoname = value.videoname;
      this.move.links = value.links;
      this.move.toDo = value.toDo;
      this.move.courseDates = value.courseDates;
      this.danceMovesNames = this.dataManager.getMovesNamesOf(this.move?.dance);
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

  ngOnDestroy(): void {
    this.valueChangesSubscription?.unsubscribe();
    this.userModeSubscription?.unsubscribe();
  }
}
