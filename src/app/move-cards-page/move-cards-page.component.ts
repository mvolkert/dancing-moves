import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, startWith, switchMap, tap } from 'rxjs';
import { MoveDto } from '../model/move-dto';
import { MoveGroupDto } from '../model/move-group-dto';
import { SearchDto } from '../model/search-dto';
import { DataManagerService } from '../services/data-manager.service';
@Component({
  selector: 'app-move-cards-page',
  templateUrl: './move-cards-page.component.html',
  styleUrls: ['./move-cards-page.component.css']
})
export class MoveCardsPageComponent implements OnInit {

  moves: MoveDto[] = [];
  allMoves: MoveDto[] = [];
  loaded = false;

  constructor(private dataManagerService: DataManagerService) {
  }

  ngOnInit(): void {
    this.dataManagerService.movesObservable.subscribe((moves: MoveDto[]) => {
      this.moves = moves.sort(this.generateSortFn([{ name: 'dance' }, { name: 'order' }]));
      this.allMoves = JSON.parse(JSON.stringify(this.moves));
      if (moves?.length > 0) {
        this.loaded = true;
      }
    });
    this.dataManagerService.searchFilterObservable.subscribe(
      (value: SearchDto) => this.moves = this.dataManagerService.selectMoves(this.allMoves, this.dataManagerService.getDances(), value));
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
