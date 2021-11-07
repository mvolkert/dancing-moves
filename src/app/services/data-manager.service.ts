import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
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

  constructor(private apiclientService: ApiclientService) { }

  refresh() {
    this.apiclientService.getMoves(moves => this.movesSubject.next(moves))
  }

  getMove(name: string): MoveDto | undefined {
    console.log(name);
    const moves = this.movesSubject.value.filter(m => m.name == name);
    if (moves.length > 0) {
      return moves[0];
    }
    return
  }

  getDances(): Set<string> {
    return new Set(this.movesSubject.value.map(move => move.dance));
  }

  getTypes(): Set<string> {
    return new Set(this.movesSubject.value.map(move => move.type).sort());
  }

}
