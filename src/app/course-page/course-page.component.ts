import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CourseDto } from '../model/course-dto';
import { UserMode } from '../model/user-mode';
import { DataManagerService } from '../services/data-manager.service';
import { NavService } from '../services/nav.service';
import { SettingsService } from '../services/settings.service';

@Component({
  templateUrl: './course-page.component.html',
  styleUrls: ['./course-page.component.css']
})
export class CoursePageComponent implements OnInit {
  loaded = false;
  nameParam = "";
  readonly = false;
  course: CourseDto | undefined;
  courseForm = this.create_form();

  constructor(private route: ActivatedRoute, private dataManager: DataManagerService,
    private settings: SettingsService, private navService: NavService) {
    this.route.paramMap.subscribe(params => {
      this.readParams(params);
    });
  }

  ngOnInit(): void {
    this.dataManager.isStarting.subscribe(starting => {
      if (!starting) {
        this.courseForm = this.create_form();
        this.start();
      }
      this.loaded = !starting;
    });
  }

  private start() {
    const courses = this.dataManager.getCourses();
    this.course = courses.find(course => course.course == this.nameParam);
    if(this.course){
      this.courseForm.patchValue(this.course);
    }
    
    this.courseForm.updateValueAndValidity();
    this.settings.userMode.subscribe(userMode => {
      if (userMode === UserMode.read) {
        this.courseForm.disable();
        this.readonly = true;
      }
    });
  }

  private create_form() {
    return new FormGroup({
      course: new FormControl('', [Validators.required]),
      dances: new FormControl([]),
      school: new FormControl(''),
      description: new FormControl(''),
      teacher: new FormControl(''),
      level: new FormControl(''),
      start: new FormControl(''),
      end: new FormControl(''),
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
  }

  onSubmit() {
    if (this.courseForm.valid && this.course) {
      this.loaded = false;
      this.readonly = true;
      this.courseForm.disable();
      this.dataManager.saveOrCreateCourse(this.course).subscribe(m => {
        console.log(m);
        this.courseForm.patchValue(m);
        this.loaded = true;
        this.readonly = false;
        this.courseForm.enable();
      });
    }
  }
}
