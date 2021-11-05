import { Injectable } from '@angular/core';
import { MoveDto } from './movecard/move-dto';

@Injectable({
  providedIn: 'root'
})
export class ApiclientService {

  constructor() { }

  getMoves(): MoveDto[] {
    const moves = new Array<MoveDto>();

    return moves;
  }
}
