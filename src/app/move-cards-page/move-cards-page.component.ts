import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MoveDto } from '../model/move-dto';
import { ApiclientService } from '../services/apiclient.service';
import { DataManagerService } from '../services/data-manager.service';
@Component({
  selector: 'app-move-cards-page',
  templateUrl: './move-cards-page.component.html',
  styleUrls: ['./move-cards-page.component.css']
})
export class MoveCardsPageComponent implements OnInit {

  moves: MoveDto[] = [];
  allMoves: MoveDto[] = [];
  dances = new Set<string>();

  constructor(private dataManagerService: DataManagerService, private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {

    this.dataManagerService.movesObservable.subscribe((moves: MoveDto[]) => {

      this.moves = moves.sort(this.generateSortFn([{ name: 'dance' }, { name: 'order' }]));
      this.allMoves = JSON.parse(JSON.stringify(this.moves));
      this.changeDetectorRef.detectChanges();
      this.dances = this.dataManagerService.getDances();
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
