import { Component, OnInit } from '@angular/core';
import { ApiclientService } from '../apiclient.service';
import { MoveDto } from '../movecard/move-dto';
@Component({
  selector: 'app-moves-content',
  templateUrl: './moves-content.component.html',
  styleUrls: ['./moves-content.component.css']
})
export class MovesContentComponent implements OnInit {

  moves: MoveDto[] = [];

  constructor(private apiclientService: ApiclientService) { 
   
    this.moves.push({name: "Basic", dance: "Salsa"})
    this.moves.push({name: "Timestep", dance: "ChaCha"})
  }

  ngOnInit(): void {
    console.log(this.moves);
    this.apiclientService.getMoves();
  }

}
