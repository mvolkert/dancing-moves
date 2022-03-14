import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { CourseDto } from '../model/course-dto';
import { UserMode } from '../model/user-mode';
import { DataManagerService } from '../services/data-manager.service';
import { NavService } from '../services/nav.service';
import { SettingsService } from '../services/settings.service';
import { deepCopy, nameExistsValidator } from '../util/util';

@Component({
  templateUrl: './course-page.component.html',
  styleUrls: ['./course-page.component.css']
})
export class CoursePageComponent implements OnInit, OnDestroy {
  course: CourseDto | undefined;
  otherNames: Set<string> = new Set<string>();
  dances = new Set<string>();
  schools = new Set<string>();
  levels = new Set<string>();
  loaded = false;
  nameParam = "";
  readonly = false;
  courseForm = this.create_form();
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
    this.courseForm = this.create_form();
    this.dances = new Set(this.dataManager.getDances().map(dance => dance.name));
    const courses = this.dataManager.getCourses();
    this.otherNames = new Set(courses.map(course => course.course));
    this.otherNames.add("new");

    if (this.nameParam == "new") {
      if (this.course) {
        this.course = deepCopy(this.course);
        this.course.row = NaN;
        this.courseForm?.markAllAsTouched();
      }
    } else {
      this.course = courses.find(course => course.course == this.nameParam);
      if (this.course) {
        this.course.contents?.forEach(this.addContentForm);
        this.otherNames.delete(this.course.course);
      }
    }
    this.valueChangesSubscription = this.courseForm.valueChanges.subscribe(value => {
      console.log(value);
      if (!this.course) {
        this.course = {} as CourseDto;
      }
      this.course.course = value.course;
      this.course.dances = value.dances;
      this.course.school = value.school;
      this.course.description = value.description;
      this.course.teacher = value.teacher;
      this.course.level = value.level;
      this.course.start = value.start;
      this.course.end = value.end;
      this.schools = new Set(courses.map(course => course.school));
      this.levels = new Set(courses.map(course => course.level));
    });
    if (this.course) {
      this.courseForm.patchValue(this.course);
    }
    this.userModeSubscription = this.settings.userMode.subscribe(userMode => {
      if (userMode === UserMode.read) {
        this.courseForm.disable();
        this.readonly = true;
      }
    });
  }

  private create_form() {
    return new FormGroup({
      course: new FormControl('', [Validators.required, nameExistsValidator(() => this.otherNames)]),
      dances: new FormControl([]),
      school: new FormControl(''),
      description: new FormControl(''),
      teacher: new FormControl(''),
      level: new FormControl(''),
      start: new FormControl(null),
      end: new FormControl(null),
      time: new FormControl(''),
      groupName: new FormControl(''),
      contents: new FormArray([]),
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
    const formArray = this.courseForm.get("contents") as FormArray;
    formArray.push(this.createContentForm());
  }

  getContentControls() {
    return (this.courseForm.get('contents') as FormArray).controls;
  }

  onSubmit() {
    if (this.courseForm.valid && this.course) {
      this.loaded = false;
      this.courseForm.disable();
      this.dataManager.saveOrCreateCourse(this.course).subscribe(m => {
        console.log(m);
        this.courseForm.patchValue(m);
        this.loaded = true;
        this.courseForm.enable();
      });
    }
  }

  ngOnDestroy(): void {
    this.valueChangesSubscription?.unsubscribe();
    this.userModeSubscription?.unsubscribe();
  }
}
