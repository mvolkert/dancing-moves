import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map, Observable, startWith } from 'rxjs';
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
  dances = new Set<string>();
  courseNames = new Set<string>();
  types = new Set<string>();
  movesGroup: MoveGroupDto[] = [];
  loading = true;

  movesGroupOptions: Observable<MoveGroupDto[]> | undefined;
  moveSearch = new FormControl("");
  searchForm = new FormGroup({
    dance: new FormControl(""),
    move: new FormControl(""),
    course: new FormControl(""),
    type: new FormControl(""),
  });

  constructor(private dataManagerService: DataManagerService, private changeDetectorRef: ChangeDetectorRef, private router: Router) {
  }

  ngOnInit(): void {
    this.searchForm.patchValue(this.dataManagerService.searchFilterObservable.value);
    this.searchForm!.valueChanges.subscribe(value => this.dataManagerService.searchFilterObservable.next(value));
    this.dataManagerService.movesObservable.subscribe((moves: MoveDto[]) => {
      this.moves = moves.sort(this.generateSortFn([{ name: 'dance' }, { name: 'order' }]));
      this.allMoves = JSON.parse(JSON.stringify(this.moves));
      this.changeDetectorRef.detectChanges();
      this.dances = this.dataManagerService.getDances();
      this.courseNames = this.dataManagerService.getCourseNames();
      this.types = this.dataManagerService.getTypes();
      if (moves?.length > 0) {
        this.loading = false;
      }
    });
    this.dataManagerService.getGroupedMoveNames().subscribe(groupedMoveNames => {
      this.movesGroup = groupedMoveNames;
      this.movesGroupOptions = this.dataManagerService.searchFilterObservable.pipe(
        map((value: SearchDto) => {
          this.moves = this.dataManagerService.selectMoves(this.allMoves, this.dances, value);
          return this.filterGroup(value);
        }),
      );
    });
    this.dataManagerService.searchFilterObservable.subscribe(searchFilter => {
      this.router.navigate([], {
        queryParams: searchFilter,
        queryParamsHandling: 'merge'
      })
      if (JSON.stringify(searchFilter) !== JSON.stringify(this.searchForm.value)) {
        this.searchForm.patchValue(searchFilter);
      }
    });

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

  private filterGroup(search: SearchDto): MoveGroupDto[] {
    if (search.move || search.dance) {
      return this.movesGroup
        .filter(group => !this.dances.has(search.dance) || group.dance == search.dance)
        .map(group => ({ dance: group.dance, names: group.names.filter(item => item?.toLowerCase()?.includes(search.move?.toLowerCase())) }))
        .filter(group => group.names.length > 0);
    }

    return this.movesGroup;
  }
}
