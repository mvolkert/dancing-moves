import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, firstValueFrom, Observable, Subject } from 'rxjs';
import { MoveDto } from '../model/move-dto';
import { ApiclientService } from './apiclient.service';
import { reduce, map } from 'rxjs/operators';
import { MoveGroupDto } from '../model/move-group-dto';
import { environment } from 'src/environments/environment';
import { parseBoolean, parseDate } from '../util/util';

@Injectable({
  providedIn: 'root'
})
export class DataManagerService {

  private movesSubject = new BehaviorSubject<MoveDto[]>(new Array<MoveDto>({
    name: "Basico (B)",
    dance: "Bachata",
    date: parseDate("04.11.2021"),
    order: "0",
    count: "8",
    nameVerified: parseBoolean("FALSE"),
    type: "Figur"
  } as MoveDto));
  movesObservable = this.movesSubject.asObservable();
  isStarted = false;
  isStarting = new Subject<boolean>();

  constructor(private apiclientService: ApiclientService, private cookies: CookieService) { }

  start() {
    this.refresh();
  }

  refresh() {
    this.apiclientService.getMoves(moves => {
      this.movesSubject.next(moves);
      this.isStarting.next(false);
      this.isStarted = true;
    });
  }


  async getMove(name: string): Promise<MoveDto | undefined> {
    if (!this.isStarted && environment.sheetsApiActive) {
      await firstValueFrom(this.isStarting);
    }
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


  save(moveDto: MoveDto){
    this.apiclientService.appendData(moveDto);
  }
}

