import { Component, OnInit } from '@angular/core';
import { MoveDto } from '../model/move-dto';
import { SearchDto } from '../model/search-dto';
import { DataManagerService } from '../services/data-manager.service';
import { NavService } from '../services/nav.service';
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
    await this.dataManagerService.loading();
    this.dataManagerService.movesObservable.subscribe((moves: MoveDto[]) => {
      this.moves = moves.sort(this.generateSortFn([m => m.dance, m => Number(m.order)]));
      this.allMoves = JSON.parse(JSON.stringify(this.moves));
    });
    this.dataManagerService.searchFilterObservable.subscribe(
      (value: SearchDto) => {
        this.moves = this.dataManagerService.selectMoves(this.allMoves, this.dataManagerService.getDanceNames(), value)
        if (value.course) {
          this.moves.sort(this.generateSortFn([m => m.dance, m => m.courseDates.filter(c => c.course === value.course).map(c => c.date).pop(), m => Number(m.order)]));
        } else {
          this.moves.sort(this.generateSortFn([m => m.dance, m => Number(m.order)]));
        }
      });
    this.loaded = true;
  }

  generateSortFn<T>(getters: Array<(x: T) => any>) {
    return (a: T, b: T) => {
      for (let getter of getters) {
        if (!getter(a) || !getter(b)) {
          continue;
        }
        if (getter(a) < getter(b))
          return -1;
        if (getter(a) > getter(b))
          return 1;
      }
      return 0;
    };
  };

}
