import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { BehaviorSubject, map, Observable, of, tap } from 'rxjs';
import { MoveDto } from 'src/app/model/move-dto';
import { MoveGroupDto } from 'src/app/model/move-group-dto';
import { SearchDto } from 'src/app/model/search-dto';
import { SpecialRight } from 'src/app/model/special-right';
import { DataManagerService } from 'src/app/services/data-manager.service';
import { NavService } from 'src/app/services/nav.service';
import { SettingsService } from 'src/app/services/settings.service';

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
  isAdmin = false;
  codeSnippets!: Observable<Array<string>>;
  initalCodeSnippets = new Array<string>("move.name", "move.dance", "move.order", "move.count", "move.nameVerified", "move.type", "move.startMove", "move.endMove", "move.relatedMoves", "move.relatedMovesOtherDances", "move.videoname", "move.description", "move.toDo", "move.links", "move.row", "move.courseDates", "move.videos", "move.courseDates.filter(c=>c.date).length==0", "move.courseDates.filter(c=>c.date&&c.date>'2021-01-01').length>0", "course.school", "course.teacher", "course.level", "course.description", "course.groupName", "course.start", "course.end");
  sortKeysAll = new Array<string>("dance", "courseDate", "order", "name");

  @ViewChild('sortInput') sortInput!: ElementRef<HTMLInputElement>;

  movesGroupOptions: Observable<MoveGroupDto[]> | undefined;
  movesGroupOptions2: Observable<MoveGroupDto[]> | undefined;
  moveSearch = new UntypedFormControl("");
  searchForm = new UntypedFormGroup({
    dance: new UntypedFormControl(""),
    move: new UntypedFormControl(""),
    courses: new UntypedFormControl([]),
    notcourse: new UntypedFormControl(""),
    type: new UntypedFormControl(""),
    related: new UntypedFormControl(""),
    todo: new UntypedFormControl(""),
    video: new UntypedFormControl(""),
    script: new UntypedFormControl(""),
    sort: new UntypedFormControl([])
  });
  sortControl = new UntypedFormControl("");

  constructor(private dataManagerService: DataManagerService, private navService: NavService, private settingsService: SettingsService) {
  }

  async ngOnInit(): Promise<void> {
    await this.dataManagerService.loading();

    this.dataManagerService.movesObservable.subscribe((moves: MoveDto[]) => {
      this.dances = this.dataManagerService.getDanceNames();
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
      this.movesGroupOptions2 = this.dataManagerService.searchFilterObservable.pipe(
        map((value: SearchDto) => this.filterGroup(value, v => v.related)),
      );
    });
    this.codeSnippets = this.dataManagerService.searchFilterObservable.pipe(map(this.filterCodeSnippets));
    this.dataManagerService.searchFilterObservable.subscribe(searchFilter => {
      if (JSON.stringify(searchFilter) !== JSON.stringify(this.searchForm.value)) {
        this.searchForm.patchValue(searchFilter);
      }
      // map empty to undefined for clean url paths
      const params = Object.entries(searchFilter).reduce((a: any, x) => { a[x[0]] = (x[1]?.length > 0) ? x[1] : undefined; return a }, {});
      this.navService.navigate([], params);
      this.handleEasterEggs(searchFilter);
    });
    this.searchForm!.valueChanges.subscribe((value: SearchDto) => {
      this.dataManagerService.searchFilterObservable.next(value);
    });
  }

  private filterGroup(search: SearchDto, moveGetter = (search: SearchDto) => search.move): MoveGroupDto[] {
    if (moveGetter(search) || search.dance) {
      return this.movesGroup
        .filter(group => !this.dances.has(search.dance) || group.dance == search.dance)
        .map(group => ({ dance: group.dance, moves: group.moves.filter(item => item.name?.toLowerCase()?.includes(moveGetter(search)?.toLowerCase())) }))
        .filter(group => group.moves.length > 0);
    }

    return this.movesGroup;
  }

  private filterCodeSnippets = (search: SearchDto): string[] => {
    if (search.script) {
      return this.initalCodeSnippets.filter(snip => snip.includes(search.script));
    }
    return this.initalCodeSnippets;
  }

  private handleEasterEggs(value: SearchDto) {
    if (value.move?.toLowerCase() === "konami" || value.move?.toLowerCase() === "++--<><>ab") {
      this.navService.navigate(["move", "Konami"]);
    }
    this.navService.openWebsiteIfEasterEggFound(value.move);
  }


  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      const sortKeys = this.searchForm.get("sort")?.value;
      sortKeys.push(value);
      this.searchForm.get("sort")?.setValue(sortKeys);
    }
    event.chipInput!.clear();
    this.sortControl.setValue(null);
  }

  remove(fruit: string): void {
    const sortKeys = this.searchForm.get("sort")?.value;
    const index = sortKeys.indexOf(fruit);

    if (index >= 0) {
      sortKeys.splice(index, 1);
      this.searchForm.get("sort")?.setValue(sortKeys);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const sortKeys = this.searchForm.get("sort")?.value;
    sortKeys.push(event.option.viewValue);
    this.searchForm.get("sort")?.setValue(sortKeys);
    this.sortInput.nativeElement.value = '';
    this.sortControl.setValue(null);
  }
}
