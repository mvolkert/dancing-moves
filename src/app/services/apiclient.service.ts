import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { MoveDto } from '../model/move-dto';
import { parseBoolean, parseDate, toGermanDate } from '../util/util';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class ApiclientService {
  private keys: string[] = new Array<string>();
  constructor(private settingsService: SettingsService) { }

  private initClient(callback: () => void) {
    if (!this.settingsService.secret || !environment.sheetsApiActive) {
      return;
    }
    gapi.load('client:auth2', () => gapi.client.init({
      apiKey: this.settingsService.secret?.apiKey,
      discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
    }).then(() => {
      callback();
    }));
  }

  getMoves(producer: (moves: Array<MoveDto>) => void): void {
    this.initClient(() => {
      const moves = new Array<MoveDto>();
      const sheetRange = 'Tanzfiguren!A1:S500'
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.settingsService.secret?.sheetId as string,
        range: sheetRange
      }).then((response: any) => {
        var range: any = response.result;
        if (range.values.length > 0) {
          this.keys = range.values[0];
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

  appendData(moveDto: MoveDto) {
    this.initClient(() => {
      gapi.auth.authorize({
        response_type: 'permission',
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        client_id: ""
      }, () => {
        const sheetRange = 'Tanzfiguren!A500:S500'
        gapi.client.sheets.spreadsheets.values.append({
          spreadsheetId: this.settingsService.secret?.sheetId as string,
          range: sheetRange,
          valueInputOption: "USER_ENTERED",
          resource: { values: [this.moveToLine(moveDto)] }
        }).then((response: any) => {
          console.log(response);
        }, (response: any) => {
          console.log('Error: ' + response.result.error.message);
        });
      });
    });
  }

  private createMovesDto(row: any): MoveDto {
    return {
      name: row[0],
      dance: row[1],
      date: parseDate(row[2]),
      order: row[3],
      count: row[4],
      nameVerified: parseBoolean(row[5]),
      type: row[6],
      relatedMoves: row[7]?.split(", "),
      videoname: row[8],
      description: row[9],
      sequence: row[10],
      sequenceLeader: row[11],
      sequenceFollower: row[12],
      mind: row[13],
      variations: row[14],
      date1: parseDate(row[15]),
      date2: parseDate(row[16]),
      toDo: row[17],
      links: row[18]
    };
  }

  private moveToLine(moveDto: MoveDto): string[] {
    return [moveDto.name, moveDto.dance, toGermanDate(moveDto.date),
    moveDto.order, moveDto.count, String(moveDto.nameVerified),
    moveDto.type, moveDto.relatedMoves?.join(", "), moveDto.videoname,
    moveDto.description, moveDto.sequence, moveDto.sequenceLeader,
    moveDto.sequenceFollower, moveDto.mind, moveDto.variations,
    toGermanDate(moveDto.date1), toGermanDate(moveDto.date2), moveDto.toDo, moveDto.links]
  }
}
