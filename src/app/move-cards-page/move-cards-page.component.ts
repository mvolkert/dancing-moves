import { Component, OnInit } from '@angular/core';
import { MoveDto } from '../model/move-dto';
import { SearchDto } from '../model/search-dto';
import { DataManagerService } from '../services/data-manager.service';
import { NavService } from '../services/nav.service';
import { deepCopy } from '../util/util';
@Component({
  selector: 'app-move-cards-page',
  templateUrl: './move-cards-page.component.html',
  styleUrls: ['./move-cards-page.component.css']
})
export class MoveCardsPageComponent implements OnInit {

  moves: MoveDto[] = [];
  allMoves: MoveDto[] = [];
  loaded = false;

  constructor(private dataManagerService: DataManagerService, private navService: NavService) {
    this.navService.headlineObservable.next("Dancing Moves");
  }

  async ngOnInit(): Promise<void> {
    this.dataManagerService.isStarting.subscribe(starting => {
      if (!starting) {
        this.start();
      }
      this.loaded = !starting;
    });
  }

  private start() {
    this.dataManagerService.movesObservable.subscribe((moves: MoveDto[]) => {
      this.moves = moves.sort(this.generateSortFn([m => m.dance, m => m.order, m => m.name]));
      this.allMoves = deepCopy(this.moves);
    });
    this.dataManagerService.searchFilterObservable.subscribe(
      (value: SearchDto) => {
        this.moves = this.dataManagerService.selectMoves(this.allMoves, this.dataManagerService.getDanceNames(), value)
        if (value.course) {
          this.moves.sort(this.generateSortFn([m => m.dance, m => m.courseDates.filter(c => c.course === value.course).map(c => c.date).pop(), m => m.order, m => m.name]));
        } else {
          this.moves.sort(this.generateSortFn([m => m.dance, m => m.order, m => m.name]));
        }
      });
  }

  generateSortFn<T>(getters: Array<(x: T) => any>) {
    return (a: T, b: T) => {
      for (let getter of getters) {
        if (getter(a) < getter(b))
          return -1;
        if (getter(a) > getter(b))
          return 1;
      }
      return 0;
    };
  };

}
