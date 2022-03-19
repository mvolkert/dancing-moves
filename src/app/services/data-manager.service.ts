import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, firstValueFrom, forkJoin, Observable, Subject } from 'rxjs';
import { defaultIfEmpty, filter, map, switchMap, tap } from 'rxjs/operators';
import { Connection } from '../model/connection';
import { CourseDateDto } from '../model/course-date-dto';
import { CourseDto } from '../model/course-dto';
import { DanceDto } from '../model/dance-dto';
import { MoveDto } from '../model/move-dto';
import { MoveGroupDto } from '../model/move-group-dto';
import { RelationDisplayType } from '../model/relation-display-type-enum';
import { RelationParams } from '../model/relation-params';
import { RelationType } from '../model/relation-type-enum';
import { SearchDto } from '../model/search-dto';
import { SpecialRight } from '../model/special-right';
import { VideoDto } from '../model/video-dto';
import { deepCopy, delay, getRow, olderThanADay } from '../util/util';
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
  moves!: Array<MoveDto>;
  courses!: Array<CourseDto>;
  isStarting = new BehaviorSubject<boolean>(true);

  constructor(private apiclientService: ApiclientService, private snackBar: MatSnackBar, private route: ActivatedRoute, private navService: NavService, private settingsService: SettingsService) {
    this.route.queryParams.subscribe((params: any) => {
      this.searchFilterObservable.next({ dance: params['dance'], move: params['move'], courses: this.readArrayParam(params, 'courses'), notcourse: params['notcourse'], type: params['type'], todo: params['todo'], script: params['script'] });
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


  private readArrayParam(params: any, key: string): Array<string> {
    if (!params[key]) {
      return []
    } else if (typeof params[key] === 'string') {
      return [params[key]];
    }
    return params[key];
  }

  async start() {
    await this.settingsService.loading();
    this.local_get();
    const date = new Date(localStorage.getItem("date") ?? "2022-03-04");
    if (this.moves.length == 0 || this.dances.length == 0 || this.courses.length == 0 || olderThanADay(date)) {
      this.api_get();
    }
  }

  api_get() {
    this.isStarting.next(true);
    forkJoin({ moves: this.apiclientService.getMoves(), courseDates: this.apiclientService.getCourseDates(), dances: this.apiclientService.getDances(), videos: this.getVideos(), courses: this.apiclientService.getCourses() }).subscribe(results => {
      this.setDances(results.dances);
      for (const course of results.courses) {
        course.contents = results.videos.filter(content => course.course == content.courseName);
      }
      this.setCourses(results.courses);
      for (const move of results.moves) {
        move.courseDates = results.courseDates.filter(c => c.moveName == move.name);
        if (move.videoname) {
          const videoNameDtos = move.videoname.split(',').flatMap(v => v.split('\n')).map(v => v.trim()).filter(v => v).map(v => { return { name: v.split('!')[0], options: this.getOptions(v) } });

          // deep copy for different options in each move
          move.videos = deepCopy(results.videos.filter(v => videoNameDtos.map(n => n.name).includes(v.name)));
          move.videos.forEach(videoDto => videoDto.link = videoDto.link + videoNameDtos.find(n => n.name === videoDto.name)?.options ?? '');
          videoNameDtos.filter(v => v.name.startsWith("http")).map(v => { return { name: v.name, link: v.name } as VideoDto }).forEach(v => move.videos.push(v));
        }
      }
      this.setMoves(results.moves);
      localStorage.setItem("date", JSON.stringify(new Date()));
      this.isStarting.next(false);
    })
  }

  private setCourses(courses: CourseDto[]) {
    this.courses = courses;
    localStorage.setItem("courses", JSON.stringify(this.courses));
  }

  private setDances(dances: DanceDto[]) {
    this.dances = dances;
    localStorage.setItem("dances", JSON.stringify(this.dances));
  }

  private setMoves(moves: MoveDto[]) {
    this.moves = moves;
    localStorage.setItem("moves", JSON.stringify(this.moves));
    this.movesSubject.next(this.moves);
  }

  local_get() {
    this.dances = JSON.parse(localStorage.getItem("dances") ?? "[]");
    this.moves = JSON.parse(localStorage.getItem("moves") ?? "[]");
    this.courses = JSON.parse(localStorage.getItem("courses") ?? "[]");
    this.movesSubject.next(this.moves);
    this.isStarting.next(false);
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
    if (this.settingsService.hasOneSpecialRight([SpecialRight.video_ssm, SpecialRight.video_ssm_sc, SpecialRight.admin])) {
      observables.push(this.apiclientService.getVideos("Videos SSM"));
    }
    if (this.settingsService.hasOneSpecialRight([SpecialRight.video_fau, SpecialRight.admin])) {
      observables.push(this.apiclientService.getVideos("Videos FAU"));
    }
    if (this.settingsService.hasOneSpecialRight([SpecialRight.video_tsm, SpecialRight.admin])) {
      observables.push(this.apiclientService.getVideos("Videos TSM"));
    }
    if (this.settingsService.hasOneSpecialRight([SpecialRight.video_tsc, SpecialRight.admin])) {
      observables.push(this.apiclientService.getVideos("Videos TSC"));
    }
    return forkJoin(observables).pipe(defaultIfEmpty([]), map(x => x.flatMap(y => y)));
  }

  async loading() {
    if (this.isStarting.getValue()) {
      await firstValueFrom(this.isStarting.pipe(filter(starting => !starting)));
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

  getCourses(): Array<CourseDto> {
    return this.courses;
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
        if (types.includes(RelationType.contained)) {
          move.containedMoves.filter(name => name).forEach(name => pairs.push({ from: move.name, to: name }));
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
      .filter(move => !search.courses || search.courses.length == 0 || move.courseDates.map(c => c.course).filter(c => search.courses.includes(c)).length > 0)
      .filter(move => !search.notcourse || !move.courseDates.map(c => c.course).includes(search.notcourse))
      .filter(move => !search.type || move.type.includes(search.type))
      .filter(move => !search.todo || move.toDo.includes(search.todo))
      .filter(move => !search.script || Boolean(eval(search.script)));
  }

  selectCourses(course: CourseDto[], search: SearchDto): CourseDto[] {
    return course
      .filter(course => !search.dance || course.dances.includes(search.dance))
      .filter(course => !search.move || this.moves.filter(move => move.name.includes(search.move)).flatMap(move => move.courseDates.map(c => c.course)).includes(course.course))
      .filter(course => !search.type || this.moves.filter(move => move.type.includes(search.type)).flatMap(move => move.courseDates.map(c => c.course)).includes(course.course))
      .filter(course => !search.courses || search.courses.length == 0 || search.courses.includes(course.course))
      .filter(course => !search.notcourse || course.course != search.notcourse)
      .filter(course => !search.script || Boolean(eval(search.script)));
  }

  private tapRequest = tap({
    next: (response: any) => {
      console.log(response);
    }, error: (response: any) => {
      console.log(response);
      this.snackBar.open(`error:${response?.result?.error?.message}`, "OK");
    }
  })

  findDependent(moveName: string): Array<MoveDto> {
    return this.moves.filter(m => m.startMove.includes(moveName)
      || m.endMove.includes(moveName)
      || m.containedMoves.includes(moveName)
      || m.relatedMoves.includes(moveName)
      || m.relatedMovesOtherDances.includes(moveName));
  }

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

  mulitSave(moveDtos: Array<MoveDto>): Observable<Array<MoveDto>> {
    return forkJoin<Array<MoveDto>>(moveDtos.filter(m => m.row).map(this.patchMove));
  }

  private patchMove = (moveDto: MoveDto) => {
    return this.apiclientService.patchData(moveDto).pipe(map(r => moveDto), this.tapRequest, map(this.updateMoveData))
  }

  private saveOrCreateCourseDates = (moveDto: MoveDto): Observable<MoveDto> => {
    return forkJoin(moveDto.courseDates.filter(c => c.course && c.date).map(c => { c.moveName = moveDto.name; return c; }).map(this.saveOrCreateCourseDate))
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

  private saveOrCreateCourseContents = (courseDto: CourseDto): Observable<CourseDto> => {
    return forkJoin(courseDto.contents.filter(c => c.name && c.link).map(c => { c.courseName = courseDto.course; c.groupName = courseDto.groupName; return c; }).map(this.saveOrCreateCourseContent))
      .pipe(defaultIfEmpty([]), map(contents => { courseDto.contents = contents; return courseDto; }));
  }
  private saveOrCreateCourseContent = (contentDto: VideoDto): Observable<VideoDto> => {
    if (contentDto.row) {
      return this.apiclientService.patchCourseContent(contentDto.groupName, contentDto).pipe(map(r => contentDto), this.tapRequest);
    } else {
      return this.apiclientService.appendCourseContent(contentDto.groupName, contentDto).pipe(map(r => {
        contentDto.row = getRow(r.updates.updatedRange);
        return contentDto;
      }), this.tapRequest)
    }
  }

  private updateMoveData = (moveDto: MoveDto): MoveDto => {
    const moves = deepCopy(this.movesSubject.value).filter(m => m.name != moveDto.name);
    moves.push(moveDto);
    this.setMoves(moves);
    return moveDto;
  }

  private updateCourseData = (courseDto: CourseDto): CourseDto => {
    const courses = deepCopy(this.courses).filter(m => m.course != courseDto.course);
    courses.push(courseDto);
    this.setCourses(courses);
    this.navService.navigate(["course", courseDto.course]);
    return courseDto;
  }

  async normalize() {
    console.log('normalize');
    for (const move of this.movesSubject.value) {
      if (move.description) {
        this.saveOrCreate(move);
        await delay(1000);
      }
    }
  }

  saveOrCreateCourse(courseDto: CourseDto): Observable<CourseDto> {
    if (courseDto.row) {
      return this.apiclientService.patchDataCourse(courseDto).pipe(map(r => courseDto), this.tapRequest, switchMap(this.saveOrCreateCourseContents), map(this.updateCourseData));
    } else {
      return this.apiclientService.appendDataCourse(courseDto).pipe(map(r => {
        courseDto.row = getRow(r.updates.updatedRange);
        return courseDto;
      }), this.tapRequest, switchMap(this.saveOrCreateCourseContents), map(this.updateCourseData))
    }
  }
}


