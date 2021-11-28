import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, firstValueFrom, Observable, of, Subject } from 'rxjs';
import { MoveDto } from '../model/move-dto';
import { ApiclientService } from './apiclient.service';
import { reduce, map } from 'rxjs/operators';
import { MoveGroupDto } from '../model/move-group-dto';
import { environment } from 'src/environments/environment';
import { delay, parseBoolean, parseDate } from '../util/util';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SearchDto } from '../model/search-dto';

@Injectable({
  providedIn: 'root'
})
export class DataManagerService {

  private movesSubject = new BehaviorSubject<MoveDto[]>(new Array<MoveDto>());
  movesObservable = this.movesSubject.asObservable();
  searchFilterObservable = new BehaviorSubject<SearchDto>({} as SearchDto);
  isStarted = false;
  isStarting = new Subject<boolean>();

  constructor(private apiclientService: ApiclientService, private cookies: CookieService, private snackBar: MatSnackBar) { }

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

  getRelationPairs(): Observable<Array<Array<string>>> {
    return this.searchFilterObservable.pipe(map(searchFilter => {
      const pairs = new Array<Array<string>>();
      const moves = this.selectMoves(this.movesSubject.value, this.getDances(), searchFilter);
      for (const move of moves) {
        move.startMove.filter(name => name).forEach(name => pairs.push([move.name, name]));
        move.endMove.filter(name => name).forEach(name => pairs.push([move.name, name]));
        move.relatedMoves.filter(name => name).forEach(name => pairs.push([move.name, name]));
        move.relatedMovesOtherDances.filter(name => name).forEach(name => pairs.push([move.name, name]));
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


  save(moveDto: MoveDto) {
    this.apiclientService.patchData(moveDto).subscribe({
      next: (response: any) => {
        console.log(response);
        this.snackBar.open("saved", "OK");
      }, error: (response: any) => {
        console.log(response);
        this.snackBar.open(`error:${response?.result?.error?.message}`, "OK");
      }
    });
  }

  create(moveDto: MoveDto) {
    this.apiclientService.appendData(moveDto).subscribe({
      next: (response: any) => {
        console.log(response);
        this.snackBar.open("created", "OK");
      }, error: (response: any) => {
        console.log('Error: ' + response.result.error.message);
        this.snackBar.open(`error:${response?.result?.error?.message}`, "OK");
      }
    });
  }

  async normalize() {
    console.log('normalize');
    for (const move of this.movesSubject.value) {
      if (move.description) {
        console.log(move);
        this.save(move);
        await delay(1000);
      }
    }
  }
}

