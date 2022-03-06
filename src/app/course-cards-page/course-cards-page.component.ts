import { Component, OnInit } from '@angular/core';
import { CourseDto } from '../model/course-dto';
import { DataManagerService } from '../services/data-manager.service';
import { NavService } from '../services/nav.service';

@Component({
  templateUrl: './course-cards-page.component.html',
  styleUrls: ['./course-cards-page.component.css']
})
export class CourseCardsPageComponent implements OnInit {

  courses: CourseDto[] = [];
  loaded = false;
  constructor(private dataManagerService: DataManagerService, private navService: NavService) {
    this.navService.headlineObservable.next("Courses");
  }

  async ngOnInit(): Promise<void> {
    this.dataManagerService.isStarting.subscribe(starting => {
      if (!starting) {
        this.start();
      }
      this.loaded = !starting;
    });
  }

  private start() {
    this.courses = this.dataManagerService.getCourses();
  }
}
