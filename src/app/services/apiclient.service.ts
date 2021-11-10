import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MoveDto } from '../model/move-dto';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class ApiclientService {
  constructor(private settingsService: SettingsService) { }

  getMoves(producer: (moves: Array<MoveDto>) => void): void {
    if (!this.settingsService.secret || !environment.sheetsApiActive) {
      return;
    }
    gapi.load('client:auth2', () => this.getData(producer));
  }

  private getData(producer: (moves: Array<MoveDto>) => void) {
    const moves = new Array<MoveDto>();
    //Google Sheets API

    let sheetRange = 'Tanzfiguren!A1:S500'
    gapi.client.init({
      apiKey: this.settingsService.secret?.apiKey,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(r => {
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.settingsService.secret?.sheetId as string,
        range: sheetRange
      }).then((response: any) => {
        var range: any = response.result;
        if (range.values.length > 0) {
          for (let i = 1; i < range.values.length; i++) {
            var row = range.values[i];
            if (row[0]) {
              moves.push(this.createMovesDto(row));
            }
          }
          producer(moves);
        } else {
          console.log('No data found.');
        }
      }, (response: any) => {
        console.log('Error: ' + response.result.error.message);
      });
    });
  }

  private createMovesDto(row: any): MoveDto {
    return {
      name: row[0],
      dance: row[1],
      date: row[2],
      order: row[3],
      count: row[4],
      nameVerified: row[5],
      type: row[6],
      relatedMoves: row[7]?.split(", "),
      videoname: row[8],
      description: row[9],
      sequence: row[10],
      sequenceLeader: row[11],
      sequenceFollower: row[12],
      mind: row[13],
      variations: row[14],
      date1: row[15],
      date2: row[16],
      toDo: row[17],
      links: row[18]
    };
  }
}
