import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Subscription } from 'rxjs';
import { MoveDto } from '../model/move-dto';
import { MoveGroupDto } from '../model/move-group-dto';
import { UserMode } from '../model/user-mode';
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
  danceMoves: Array<MoveDto> = new Array<MoveDto>();
  loaded = false;
  idParam = "";
  nameOriginal = "";
  readonly = false;
  subscriptionsGlobal = new Array<Subscription>();
  subscriptions = new Array<Subscription>();
  description: string = "";

  constructor(private route: ActivatedRoute, private dataManager: DataManagerService,
    private settings: SettingsService, private navService: NavService, private sanitizer: DomSanitizer) {
    this.subscriptionsGlobal.push(this.route.paramMap.subscribe(params => {
      this.readParams(params);
    }));
  }

  async ngOnInit(): Promise<void> {
    this.subscriptionsGlobal.push(this.dataManager.getGroupedMoveNames().subscribe(groupedMoveNames => {
      this.movesGroup = groupedMoveNames;
    }));
    this.subscriptionsGlobal.push(this.dataManager.isStarting.subscribe(starting => {
      if (!starting) {
        this.start();
      }
      this.loaded = !starting;
    }));
  }

  private start() {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.moveForm = this.create_form();
    this.dances = Array.from(new Set(this.dataManager.getDances().map(dance => dance.name))).sort();
    this.types = this.dataManager.getTypes();
    this.otherMovesNames.add("new");

    if (this.idParam == "new") {
      if (this.move) {
        this.move = deepCopy(this.move);
        this.move.id = '';
        this.move.row = NaN;
        this.moveForm?.markAllAsTouched();
      }
      this.navService.headlineObservable.next(this.idParam);
    } else if (Object.keys(easterEggMoves).includes(this.idParam)) {
      this.move = deepCopy(easterEggMoves[this.idParam]);
      this.navService.headlineObservable.next(this.idParam);
    } else {
      this.move = this.dataManager.getMove(this.idParam);
      if (this.move) {
        this.move.courseDates.forEach(this.addCourseDateForm);
        this.dataManager.getMovesOf(this.move?.dance).map(m => m.name).filter(name => this.move?.name != name).forEach(name => this.otherMovesNames.add(name))
        this.nameOriginal = this.move.name;
      }
      this.navService.headlineObservable.next(this.move?.name ?? 'Not Found');
    }

    this.subscriptions.push(this.moveForm.valueChanges.subscribe(value => {
      console.log(value);
      if (!this.move) {
        this.move = {} as MoveDto;
      }
      this.move.name = value.name;
      this.move.dance = value.dance;
      this.courseNames = this.dataManager.getCourseNames(this.move?.dance);
      if (value.dance && value.order === null) {
        this.move.order = this.dataManager.getNextOrder(value.dance);
      } else {
        this.move.order = Number(value.order);
      }
      this.move.description = value.description;
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
      this.danceMoves = this.dataManager.getMovesOf(this.move?.dance);
      this.description = this.dataManager.enrichDescription(this.move);
    }));
    if (this.move) {
      this.moveForm.patchValue(this.move);
    }
    this.subscriptions.push(this.settings.userMode.subscribe(userMode => {
      if (userMode === UserMode.read) {
        this.moveForm.disable();
        this.readonly = true;
      }
    }));
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
    this.idParam = params.get('name') as string;
    this.idParam = decodeURI(this.idParam);
    this.nameOriginal = this.idParam;
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
        this.move?.videos?.forEach(v => v.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(v.link));
        if (this.nameOriginal != newName && this.nameOriginal != "new") {
          const dependentMoves = this.dataManager.findDependent(this.nameOriginal);
          if (dependentMoves && dependentMoves.length > 0) {
            dependentMoves.forEach(m => m.description = m.description.replace(this.nameOriginal, newName));
            this.dataManager.mulitSave(dependentMoves).subscribe(moves => {
              this.loaded = true;
              this.moveForm.enable();
              this.navService.navigate(["move", m.id]);
            });
          } else {
            this.loaded = true;
            this.moveForm.enable();
            this.navService.navigate(["move", m.id]);
          }

        } else {
          this.loaded = true;
          this.moveForm.enable();
          if (this.idParam == "new") {
            this.navService.navigate(["move", m.id]);
          }
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptionsGlobal.forEach(s => s.unsubscribe());
  }
}
