import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, firstValueFrom, forkJoin, Observable, Subject } from 'rxjs';
import { defaultIfEmpty, map, switchMap, tap } from 'rxjs/operators';
import { Connection } from '../model/connection';
import { CourseDateDto } from '../model/course-date-dto';
import { DanceDto } from '../model/dance-dto';
import { MoveDto } from '../model/move-dto';
import { MoveGroupDto } from '../model/move-group-dto';
import { RelationDisplayType } from '../model/relation-display-type-enum';
import { RelationParams } from '../model/relation-params';
import { RelationType } from '../model/relation-type-enum';
import { SearchDto } from '../model/search-dto';
import { SpecialRight } from '../model/special-right';
import { VideoDto } from '../model/video-dto';
import { delay, getRow } from '../util/util';
import { ApiclientService } from './apiclient.service';
import { NavService } from './nav.service';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class DataManagerService {

  private movesSubject = new BehaviorSubject<MoveDto[]>(new Array<MoveDto>());
  movesObservable = this.movesSubject.asObservable();
  searchFilterObservable = new BehaviorSubject<SearchDto>({} as SearchDto);
  relationsSelectionObservable = new BehaviorSubject<RelationParams>({} as RelationParams);
  dances!: Array<DanceDto>;
  isStarted = false;
  isStarting = new Subject<boolean>();

  constructor(private apiclientService: ApiclientService, private snackBar: MatSnackBar, private route: ActivatedRoute, private navService: NavService, private settingsService: SettingsService) {
    this.route.queryParams.subscribe(params => {
      if (params["dance"] || params["move"] || params["course"] || params["type"] || params["notcourse"] || params["todo"] || params["video"] || params["script"]) {
        this.searchFilterObservable.next({ dance: params["dance"], move: params["move"], course: params["course"], notcourse: params["notcourse"], type: params["type"], todo: params["todo"], video: params["video"], script: params["script"] });
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

  async start() {
    await this.settingsService.loading();
    forkJoin({ moves: this.apiclientService.getMoves(), courseDates: this.apiclientService.getCourseDates(), dances: this.apiclientService.getDances(), videos: this.getVideos() }).subscribe(results => {
      this.dances = results.dances;
      for (const move of results.moves) {
        move.courseDates = results.courseDates.filter(c => c.moveName == move.name);
        if (move.videoname) {
          const videoNameDtos = move.videoname.split(',').flatMap(v => v.split('\n')).map(v => v.trim()).filter(v => v).map(v => { return { name: v.split('!')[0], options: this.getOptions(v) } });

          // deep copy for different options in each move
          move.videos = JSON.parse(JSON.stringify(results.videos.filter(v => videoNameDtos.map(n => n.name).includes(v.name))));
          move.videos.forEach(videoDto => videoDto.link = videoDto.link + videoNameDtos.find(n => n.name === videoDto.name)?.options ?? '');
        }
      }
      this.movesSubject.next(results.moves);
      this.isStarting.next(false);
      this.isStarted = true;
    })
  }

  private getOptions(videoname: string) {

    if (videoname.includes('!')) {
      console.log('getOptions')
      return '!' + videoname.split('!')[1];
    }
    return '';
  }


  private getVideos(): Observable<VideoDto[]> {
    const observables = new Array<Observable<VideoDto[]>>()
    if (this.settingsService.hasSpecialRight(SpecialRight.video_ssm) || this.settingsService.hasSpecialRight(SpecialRight.admin)) {
      observables.push(this.apiclientService.getVideos("SSM"));
    }
    if (this.settingsService.hasSpecialRight(SpecialRight.video_fau) || this.settingsService.hasSpecialRight(SpecialRight.admin)) {
      observables.push(this.apiclientService.getVideos("FAU"));
    }
    if (this.settingsService.hasSpecialRight(SpecialRight.video_tsm) || this.settingsService.hasSpecialRight(SpecialRight.admin)) {
      observables.push(this.apiclientService.getVideos("TSM"));
    }
    if (this.settingsService.hasSpecialRight(SpecialRight.video_tsc) || this.settingsService.hasSpecialRight(SpecialRight.admin)) {
      observables.push(this.apiclientService.getVideos("TSC"));
    }
    return forkJoin(observables).pipe(defaultIfEmpty([]), map(x => x.flatMap(y => y)));
  }

  async loading() {
    if (!this.isStarted) {
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

  getDanceNames(): Set<string> {
    return new Set(this.movesSubject.value.map(move => move.dance));
  }

  getDances(): Array<DanceDto> {
    return this.dances;
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
      const moves = this.selectMoves(this.movesSubject.value, this.getDanceNames(), searchFilter);
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
      .filter(move => !search.notcourse || !move.courseDates.map(c => c.course).includes(search.notcourse))
      .filter(move => !search.type || move.type.includes(search.type))
      .filter(move => !search.todo || move.toDo.includes(search.todo))
      .filter(move => !search.video || move.toDo.includes(search.video))
      .filter(move => !search.script || eval(search.script));
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
      .pipe(defaultIfEmpty([]), map(courseDates => { moveDto.courseDates = courseDates; return moveDto; }));
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
    moves.push(moveDto);
    this.movesSubject.next(moves);
    this.navService.navigate(["move", moveDto.name]);
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


