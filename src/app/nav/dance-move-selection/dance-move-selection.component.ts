import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { map, Observable, tap } from 'rxjs';
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
  initalCodeSnippets = new Array<string>("move.name", "move.dance", "move.date", "move.order", "move.count", "move.nameVerified", "move.type", "move.startMove", "move.endMove", "move.relatedMoves", "move.relatedMovesOtherDances", "move.videoname", "move.description", "move.toDo", "move.links", "move.row", "move.courseDates", "move.videos", "move.courseDates.filter(c=>c.date).length==0", "move.courseDates.filter(c=>c.date&&c.date>'2021-01-01').length>0");

  movesGroupOptions: Observable<MoveGroupDto[]> | undefined;
  moveSearch = new FormControl("");
  searchForm = new FormGroup({
    dance: new FormControl(""),
    move: new FormControl(""),
    course: new FormControl(""),
    notcourse: new FormControl(""),
    type: new FormControl(""),
    todo: new FormControl(""),
    video: new FormControl(""),
    script: new FormControl("")
  });

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
    });
    this.codeSnippets = this.dataManagerService.searchFilterObservable.pipe(map(this.filterCodeSnippets));
    this.dataManagerService.searchFilterObservable.subscribe(searchFilter => {
      if (JSON.stringify(searchFilter) !== JSON.stringify(this.searchForm.value)) {
        this.searchForm.patchValue(searchFilter);
      }
      // map empty to undefined for clean url paths
      const params = Object.entries(searchFilter).reduce((a: any, x) => { a[x[0]] = (x[1]?.length > 0) ? x[1] : undefined; return a }, {});
      this.navService.navigate([], params);
    });
    this.searchForm!.valueChanges.subscribe((value: SearchDto) => {
      this.navService.openWebsiteIfEasterEggFound(value.move);
      this.dataManagerService.searchFilterObservable.next(value);
    });
    this.isAdmin = this.settingsService.hasSpecialRight(SpecialRight.admin);
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

  private filterCodeSnippets = (search: SearchDto): string[] => {
    return this.initalCodeSnippets.filter(snip => snip.includes(search.script));
  }
}
