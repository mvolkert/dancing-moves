import { Component, Input, OnInit } from '@angular/core';
import { CourseDateDto } from 'src/app/model/course-date-dto';
import { MoveDto } from 'src/app/model/move-dto';
import { NavService } from 'src/app/services/nav.service';

@Component({
  selector: 'app-move-card',
  templateUrl: './move-card.component.html',
  styleUrls: ['./move-card.component.css']
})
export class MoveCardComponent implements OnInit {

  @Input("move-dto") moveDto!: MoveDto
  nameUri = "";

  constructor(private navService: NavService) { }

  ngOnInit(): void {
    this.nameUri = this.moveDto.name.replace(/[^\w]/g, '');
  }

  openDetails(): Promise<boolean> {
    this.navService.fragment = this.moveDto.name.replace(/[^\w]/g, '');
    return this.navService.navigate(["move", encodeURI(this.moveDto.name)]);
  }

  isDateValid(courseDate: CourseDateDto) {
    return courseDate?.date && courseDate?.date?.toString() !== 'Invalid Date';
  }
}
