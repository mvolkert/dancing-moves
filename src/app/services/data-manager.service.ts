import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, firstValueFrom, forkJoin, from, Observable, of, Subject } from 'rxjs';
import { concatAll, map, switchMap, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { MoveDto } from '../model/move-dto';
import { MoveGroupDto } from '../model/move-group-dto';
import { SearchDto } from '../model/search-dto';
import { delay, getRow, parseBoolean, parseDate } from '../util/util';
import { ApiclientService } from './apiclient.service';
import { RelationType } from '../model/relation-type-enum';
import { CourseDateDto } from '../model/course-date-dto';
import { Connection } from '../model/connection';
import { RelationParams } from '../model/relation-params';
import { RelationDisplayType } from '../model/relation-display-type-enum';

@Injectable({
  providedIn: 'root'
})
export class DataManagerService {

  private movesSubject = new BehaviorSubject<MoveDto[]>(new Array<MoveDto>());
  movesObservable = this.movesSubject.asObservable();
  searchFilterObservable = new BehaviorSubject<SearchDto>({} as SearchDto);
  relationsSelectionObservable = new BehaviorSubject<RelationParams>({} as RelationParams);
  isStarted = false;
  isStarting = new Subject<boolean>();

  constructor(private apiclientService: ApiclientService, private snackBar: MatSnackBar, private route: ActivatedRoute, private router: Router) {
    this.route.queryParams.subscribe(params => {
      if (params["dance"] || params["move"] || params["course"] || params["type"]) {
        this.searchFilterObservable.next({ dance: params["dance"], move: params["move"], course: params["course"], type: params["type"] });
      }
      let relationTypeParams = params["relationTypes"];
      if (!relationTypeParams) {
        relationTypeParams = [RelationType.start, RelationType.end]
      } else if (typeof relationTypeParams === 'string') {
        relationTypeParams = [relationTypeParams];
      }
      let displayTypeParam = params["displayType"]?.trim();
      if (!displayTypeParam) {
        displayTypeParam = RelationDisplayType.cytoscape
      }
      this.relationsSelectionObservable.next({ relationTypes: relationTypeParams, displayType: displayTypeParam });
    })

  }

  start() {
    if (!environment.sheetsApiActive) {
      this.movesSubject.next([{
        name: "Basico (B)",
        dance: "Bachata",
        date: parseDate("04.11.2021"),
        order: "0",
        count: "8",
        nameVerified: parseBoolean("FALSE"),
        type: "Figur"
      } as MoveDto])
    }
    this.refresh();
  }

  async refresh() {
    const moves = await this.apiclientService.getMoves();
    const courseDates = await this.apiclientService.getCourseDates();

    for (const move of moves) {
      move.courseDates = courseDates.filter(c => c.moveName == move.name);
    }
    this.movesSubject.next(moves);
    this.isStarting.next(false);
    this.isStarted = true;
  }

  async loading() {
    if (!this.isStarted && environment.sheetsApiActive) {
      await firstValueFrom(this.isStarting);
    }
  }


  getMove(name: string): MoveDto | undefined {
    const moves = this.movesSubject.value.filter(m => m.name == name);
    if (moves.length > 0) {
      return moves[0];
    }
    return
  }

  getGroupedMoveNames(): Observable<MoveGroupDto[]> {
    return this.movesSubject.asObservable()
      .pipe(map(moves =>
        Object.entries(this.groupByDance(moves))
          .map(([key, value]) => { return { dance: key, names: value } as MoveGroupDto; })
      ))
  }

  getMovesNamesOf(dance: string | undefined): Set<string> {
    return new Set(this.movesSubject.value.filter(move => !dance || move.dance == dance).map(move => move.name));
  }

  getMovesNames(): Set<string> {
    return new Set(this.movesSubject.value.map(move => move.name));
  }

  getDances(): Set<string> {
    return new Set(this.movesSubject.value.map(move => move.dance));
  }

  getCourseNames(): Set<string> {
    return new Set(this.movesSubject.value.flatMap(move => move.courseDates.map(c => c.course)));
  }

  getTypes(): Set<string> {
    return new Set(this.movesSubject.value.map(move => move.type).sort());
  }
  private groupByDance = (xs: MoveDto[]): [string, string[]] => {
    return xs.reduce((rv: any, x: MoveDto) => {
      if (!rv[x.dance]) {
        rv[x.dance] = []
      }
      rv[x.dance].push(x.name);
      return rv;
    }, {});
  };

  getRelationPairs(types: Array<string>): Observable<Array<Connection>> {
    return this.searchFilterObservable.pipe(map(searchFilter => {
      const pairs = new Array<Connection>();
      const moves = this.selectMoves(this.movesSubject.value, this.getDances(), searchFilter);
      for (const move of moves) {
        if (types.includes(RelationType.start)) {
          move.startMove.filter(name => name).forEach(name => pairs.push({ to: move.name, from: name }));
        }
        if (types.includes(RelationType.end)) {
          move.endMove.filter(name => name).forEach(name => pairs.push({ from: move.name, to: name }));
        }
        if (types.includes(RelationType.related)) {
          move.relatedMoves.filter(name => name).forEach(name => pairs.push({ from: move.name, to: name }));
        }
        if (types.includes(RelationType.otherDance)) {
          move.relatedMovesOtherDances.filter(name => name).forEach(name => pairs.push({ from: move.name, to: name }));
        }
      }
      return pairs;
    }))

  }

  selectMoves(moves: MoveDto[], dances: Set<string>, search: SearchDto): MoveDto[] {
    return moves
      .filter(move => !dances.has(search.dance) || move.dance == search.dance)
      .filter(move => !search.move || move.name.includes(search.move))
      .filter(move => !search.course || move.courseDates.map(c => c.course).includes(search.course))
      .filter(move => !search.type || move.type.includes(search.type));
  }

  private tapRequest = tap({
    next: (response: any) => {
      console.log(response);
    }, error: (response: any) => {
      console.log(response);
      this.snackBar.open(`error:${response?.result?.error?.message}`, "OK");
    }
  })

  saveOrCreate(moveDto: MoveDto): Observable<MoveDto> {
    if (moveDto.row) {
      return this.apiclientService.patchData(moveDto).pipe(map(r => moveDto), this.tapRequest, switchMap(this.saveOrCreateCourseDates), map(this.updateMoveData));
    } else {
      return this.apiclientService.appendData(moveDto).pipe(map(r => {
        moveDto.row = getRow(r.updates.updatedRange);
        return moveDto;
      }), this.tapRequest, switchMap(this.saveOrCreateCourseDates), map(this.updateMoveData))
    }
  }
  private saveOrCreateCourseDates = (moveDto: MoveDto): Observable<MoveDto> => {
    return forkJoin(moveDto.courseDates.filter(c => c.course || c.date).map(c => { c.moveName = moveDto.name; return c; }).map(this.saveOrCreateCourseDate))
      .pipe(map(courseDates => { moveDto.courseDates = courseDates; return moveDto; }));
  }
  private saveOrCreateCourseDate = (courseDateDto: CourseDateDto): Observable<CourseDateDto> => {
    if (courseDateDto.row) {
      return this.apiclientService.patchCourseDate(courseDateDto).pipe(map(r => courseDateDto), this.tapRequest);
    } else {
      return this.apiclientService.appendCourseDate(courseDateDto).pipe(map(r => {
        courseDateDto.row = getRow(r.updates.updatedRange);
        return courseDateDto;
      }), this.tapRequest)
    }
  }

  private updateMoveData = (moveDto: MoveDto): MoveDto => {
    let moves = JSON.parse(JSON.stringify(this.movesSubject.value)) as Array<MoveDto>;
    moves = moves.filter(m => m.name != moveDto.name);
    moves.push(moveDto)
    this.movesSubject.next(moves);
    this.router.navigate(["move", moveDto.name], { queryParamsHandling: 'merge' });
    return moveDto;
  }

  async normalize() {
    console.log('normalize');
    for (const move of this.movesSubject.value) {
      if (move.description) {
        console.log(move);
        this.saveOrCreate(move);
        await delay(1000);
      }
    }
  }
}


