import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, firstValueFrom, Observable, Subject } from 'rxjs';
import { MoveDto } from '../model/move-dto';
import { ApiclientService } from './apiclient.service';

@Injectable({
  providedIn: 'root'
})
export class DataManagerService {

  private movesSubject = new BehaviorSubject<MoveDto[]>(new Array<MoveDto>({
    name: "Basico (B)",
    dance: "Bachata",
    date: "04.11.2021",
    order: "0",
    count: "8",
    nameVerified: true,
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
    console.log(name);
    if (!this.isStarted) {
      await firstValueFrom(this.isStarting);
    }
    const moves = this.movesSubject.value.filter(m => m.name == name);
    if (moves.length > 0) {
      return moves[0];
    }
    return
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

}
