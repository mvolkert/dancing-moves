import { Injectable, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MoveDto } from './movecard/move-dto';

@Injectable({
  providedIn: 'root'
})
export class ApiclientService {
  spreadsheetId: string = "";
  apiKey: string = "";

  constructor(private route: ActivatedRoute) { }

  getMoves(producer: any, spreadsheetId: string, apiKey: string): void {
    this.spreadsheetId = spreadsheetId;
    this.apiKey = apiKey;
    gapi.load('client:auth2', () => this.newMethod(producer));
  }

  private newMethod(producer: any) {
    const moves = new Array<MoveDto>();
    //Google Sheets API

    let sheetRange = 'Tanzfiguren!A1:B400'
    gapi.client.init({
      'apiKey': this.apiKey,
      'discoveryDocs': ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(r => {
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: sheetRange
      }).then(function (response: any) {
        var range: any = response.result;
        if (range.values.length > 0) {
          for (let i = 1; i < range.values.length; i++) {
            var row = range.values[i];
            moves.push({ name: row[0], dance: row[1] });
          }
          producer(moves);
        } else {
          console.log('No data found.');
        }
      }, function (response: any) {
        console.log('Error: ' + response.result.error.message);
      });
    });
  }
}
