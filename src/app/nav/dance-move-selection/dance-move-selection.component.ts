import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { MoveDto } from 'src/app/model/move-dto';
import { MoveGroupDto } from 'src/app/model/move-group-dto';
import { SearchDto } from 'src/app/model/search-dto';
import { DataManagerService } from 'src/app/services/data-manager.service';

@Component({
  selector: 'app-dance-move-selection',
  templateUrl: './dance-move-selection.component.html',
  styleUrls: ['./dance-move-selection.component.css']
})
export class DanceMoveSelectionComponent implements OnInit {

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

  constructor(private dataManagerService: DataManagerService, private router: Router) {
  }

  ngOnInit(): void {
    this.searchForm.patchValue(this.dataManagerService.searchFilterObservable.value);
    this.searchForm!.valueChanges.subscribe(value => this.dataManagerService.searchFilterObservable.next(value));
    this.dataManagerService.movesObservable.subscribe((moves: MoveDto[]) => {
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
        map((value: SearchDto) => this.filterGroup(value)),
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
