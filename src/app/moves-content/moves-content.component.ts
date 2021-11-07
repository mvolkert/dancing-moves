import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiclientService } from '../apiclient.service';
import { MoveDto } from '../movecard/move-dto';
@Component({
  selector: 'app-moves-content',
  templateUrl: './moves-content.component.html',
  styleUrls: ['./moves-content.component.css']
})
export class MovesContentComponent implements OnInit {

  moves: MoveDto[] = [];
  allMoves: MoveDto[] = [];
  dances = new Set<string>()

  constructor(private apiclientService: ApiclientService, private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {

    this.apiclientService.getMoves((moves: MoveDto[]) => {

      this.moves = moves.sort(this.generateSortFn([{ name: 'dance' }, { name: 'order' }]));
      this.allMoves = JSON.parse(JSON.stringify(this.moves));
      this.changeDetectorRef.detectChanges();
      this.dances = new Set(this.moves.map(move => move.dance));
    });
  }

  selectDance(event: any) {
    console.log(event);
    if (this.dances.has(event)) {
      this.moves = this.allMoves.filter(move => move.dance == event);
    } else {
      this.moves = JSON.parse(JSON.stringify(this.allMoves));
    }
  }

  generateSortFn(props: any) {
    return (a: any, b: any) => {
      for (var i = 0; i < props.length; i++) {
        var prop = props[i];
        var name = prop.name;
        var reverse = prop.reverse;
        if (a[name] < b[name])
          return reverse ? 1 : -1;
        if (a[name] > b[name])
          return reverse ? -1 : 1;
      }
      return 0;
    };
  };

}
