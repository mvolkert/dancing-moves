import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';
import { MoveDto } from '../model/move-dto';
import { MoveGroupDto } from '../model/move-group-dto';
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
  movesGroup: MoveGroupDto[] = [];

  movesGroupOptions: Observable<MoveGroupDto[]> | undefined;
  moveSearch = new FormControl("");

  constructor(private dataManagerService: DataManagerService, private changeDetectorRef: ChangeDetectorRef) {
  }

  ngOnInit(): void {

    this.dataManagerService.movesObservable.subscribe((moves: MoveDto[]) => {

      this.moves = moves.sort(this.generateSortFn([{ name: 'dance' }, { name: 'order' }]));
      this.allMoves = JSON.parse(JSON.stringify(this.moves));
      this.changeDetectorRef.detectChanges();
      this.dances = this.dataManagerService.getDances();
    });
    this.dataManagerService.getGroupedMoveNames().subscribe(groupedMoveNames => {
      this.movesGroup = groupedMoveNames;
      this.movesGroupOptions = this.moveSearch!.valueChanges.pipe(
        startWith(''),
        map(value => {
          this.selectMoveName(value)
          return this._filterGroup(value)
        }),
      );
    });

  }

  selectDance(event: any) {
    if (this.dances.has(event)) {
      this.moves = this.allMoves.filter(move => move.dance == event);
    } else {
      this.moves = JSON.parse(JSON.stringify(this.allMoves));
    }
  }

  selectMoveName(event: any) {
    if (event) {
      this.moves = this.allMoves.filter(move => move.name.includes(event));
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
  private _filter = (opt: string[], value: string): string[] => {
    const filterValue = value.toLowerCase();

    return opt.filter(item => item.toLowerCase().includes(filterValue));
  };

  private _filterGroup(value: string): MoveGroupDto[] {
    if (value) {
      return this.movesGroup
        .map(group => ({ dance: group.dance, names: this._filter(group.names, value) }))
        .filter(group => group.names.length > 0);
    }

    return this.movesGroup;
  }
}
