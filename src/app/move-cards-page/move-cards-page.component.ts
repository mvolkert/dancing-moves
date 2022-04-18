import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MoveDto } from '../model/move-dto';
import { SearchDto } from '../model/search-dto';
import { DataManagerService } from '../services/data-manager.service';
import { NavService } from '../services/nav.service';
import { deepCopy, delay, generateSortFn } from '../util/util';
@Component({
  selector: 'app-move-cards-page',
  templateUrl: './move-cards-page.component.html',
  styleUrls: ['./move-cards-page.component.css']
})
export class MoveCardsPageComponent implements OnInit, AfterViewInit {

  moves: MoveDto[] = [];
  allMoves: MoveDto[] = [];
  loaded = false;

  constructor(private dataManagerService: DataManagerService, private navService: NavService) {
    this.navService.headlineObservable.next("Dancing Moves");
  }

  ngAfterViewInit(): void {
    this.scrollTo(this.navService.fragment);
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
      this.moves = moves.sort(generateSortFn([m => m.dance, m => m.order, m => m.name]));
      this.allMoves = deepCopy(this.moves);
    });
    this.dataManagerService.searchFilterObservable.subscribe(
      (value: SearchDto) => {
        this.moves = this.dataManagerService.selectMoves(this.allMoves, this.dataManagerService.getDanceNames(), value)
        if (value.courses && value.courses.length > 0) {
          this.moves.sort(generateSortFn([m => m.dance, m => m.courseDates.filter(c => value.courses.includes(c.course)).map(c => c.date).pop(), m => m.order, m => m.name]));
        } else {
          this.moves.sort(generateSortFn([m => m.dance, m => m.order, m => m.name]));
        }
      });
  }
  scrollTo(id?: string): void {
    if (id) {
      const elementList = document.querySelectorAll('#' + id);
      console.log(elementList);
      const element = elementList[0] as HTMLElement;
      element?.scrollIntoView({ block: "start", behavior: 'auto' });
    }
  }
}
