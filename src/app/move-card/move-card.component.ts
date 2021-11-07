import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-move-card',
  templateUrl: './move-card.component.html',
  styleUrls: ['./move-card.component.css']
})
export class MoveCardComponent implements OnInit {

  @Input("move-dto") moveDto: any

  constructor() { }

  ngOnInit(): void {
    console.log(this.moveDto);
  }

}
