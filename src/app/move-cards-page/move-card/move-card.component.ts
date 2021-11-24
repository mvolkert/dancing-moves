import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CourseDateDto } from 'src/app/model/course-date-dto';

@Component({
  selector: 'app-move-card',
  templateUrl: './move-card.component.html',
  styleUrls: ['./move-card.component.css']
})
export class MoveCardComponent implements OnInit {

  @Input("move-dto") moveDto: any

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  openDetails() {
    this.router.navigate(["move", encodeURI(this.moveDto.name)]);
  }

  isDateValid(courseDate: CourseDateDto) {
    return courseDate?.date && courseDate?.date?.toString() !== 'Invalid Date';
  }
}
