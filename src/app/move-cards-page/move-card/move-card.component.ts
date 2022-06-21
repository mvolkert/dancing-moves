import { Component, Input, OnInit } from '@angular/core';
import { CourseDateDto } from 'src/app/model/course-date-dto';
import { MoveDto } from 'src/app/model/move-dto';
import { DataManagerService } from 'src/app/services/data-manager.service';
import { NavService } from 'src/app/services/nav.service';

@Component({
  selector: 'app-move-card',
  templateUrl: './move-card.component.html',
  styleUrls: ['./move-card.component.css']
})
export class MoveCardComponent implements OnInit {

  @Input("move-dto") moveDto!: MoveDto
  nameUri = "";
  description!: string;

  constructor(private navService: NavService, private dataManager: DataManagerService) { }

  ngOnInit(): void {
    this.nameUri = this.moveDto.name.replace(/[^\w]/g, '');
  }

  openDetails(): Promise<boolean> {
    this.navService.fragment = this.moveDto.name.replace(/[^\w]/g, '');
    return this.navService.navigate(["move", encodeURI(this.moveDto.id)]);
  }

  isDateValid(courseDate: CourseDateDto) {
    return courseDate?.date && courseDate?.date?.toString() !== 'Invalid Date';
  }

  initDescription() {
    if (!this.description) {
      this.description = this.dataManager.enrichDescription(this.moveDto);
    }
  }
}
