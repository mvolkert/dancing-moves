import { Component, Input, OnInit } from '@angular/core';
import { MoveDto } from './move-dto';

@Component({
  selector: 'app-movecard',
  templateUrl: './movecard.component.html',
  styleUrls: ['./movecard.component.css']
})
export class MovecardComponent implements OnInit {

  @Input("move-dto") moveDto: any

  constructor() { }

  ngOnInit(): void {
    console.log(this.moveDto);
  }

}
