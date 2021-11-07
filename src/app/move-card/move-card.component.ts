import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-move-card',
  templateUrl: './move-card.component.html',
  styleUrls: ['./move-card.component.css']
})
export class MoveCardComponent implements OnInit {

  @Input("move-dto") moveDto: any

  constructor(private router: Router) { }

  ngOnInit(): void {
    console.log(this.moveDto);
  }

  edit() {
    this.router.navigate(["move", encodeURI(this.moveDto.name)]);
  }
}
