import { Component, OnInit } from '@angular/core';
import { MoveDto } from '../movecard/move-dto';
@Component({
  selector: 'app-moves-content',
  templateUrl: './moves-content.component.html',
  styleUrls: ['./moves-content.component.css']
})
export class MovesContentComponent implements OnInit {

  moves: MoveDto[] = [];

  constructor() { 
    this.moves.push({name: "Basic", dance: "Salsa"})
    this.moves.push({name: "Timestep", dance: "ChaCha"})
  }

  ngOnInit(): void {
    console.log(this.moves);
  }

}
