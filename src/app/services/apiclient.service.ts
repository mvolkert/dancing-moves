import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MoveDto } from '../model/move-dto';
import { parseBoolean, parseDate, toGermanDate } from '../util/util';
import { SettingsService } from './settings.service';
import * as jwt from 'jwt-simple';
import { SecretWriteDto } from '../model/secret-write-dto';

@Injectable({
  providedIn: 'root'
})
export class ApiclientService {
  private keys: string[] = new Array<string>();
  constructor(private settingsService: SettingsService, private http: HttpClient) { }

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

  async getMoves(producer: (moves: Array<MoveDto>) => void): Promise<void> {
    await this.settingsService.loading();
    this.initClient(() => {
      const moves = new Array<MoveDto>();
      const sheetRange = 'Tanzfiguren!A1:S500'
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: this.settingsService.secret?.movesSheetId as string,
        range: sheetRange
      }).then((response: any) => {
        var range: any = response.result;
        if (range.values.length > 0) {
          this.keys = range.values[0];
          for (let i = 1; i < range.values.length; i++) {
            var row = range.values[i];
            if (row[0]) {
              moves.push(this.createMovesDto(row, i));
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

  appendData(moveDto: MoveDto): Observable<any> {
    const sheetRange = 'Tanzfiguren!A400:U400';
    const body = { values: [this.moveToLine(moveDto)] }
    return this.spreadsheetsPost(sheetRange, body, ':append');
  }

  patchData(moveDto: MoveDto): Observable<any> {
    const sheetRange = `Tanzfiguren!A${moveDto.row}:U${moveDto.row}`;
    const body = { values: [this.moveToLine(moveDto)] }
    return this.spreadsheetsPut(sheetRange, body);
  }

  private spreadsheetsPost(sheetRange: string, body: any, type = ''): Observable<any> {
    if (!this.settingsService.secretWrite) {
      return of({});
    }
    const token = this.createJwt();
    return this.http.post<any>('https://oauth2.googleapis.com/token', { grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: token }).pipe(switchMap(r => {
      return this.http.post<any>(`https://content-sheets.googleapis.com/v4/spreadsheets/${this.settingsService.secret?.movesSheetId as string}/values/${encodeURI(sheetRange)}${type}`, body, { headers: { Authorization: `Bearer ${r.access_token}` }, params: { valueInputOption: 'USER_ENTERED' } })
    }));
  }

  private spreadsheetsPut(sheetRange: string, body: any, type = ''): Observable<any> {
    if (!this.settingsService.secretWrite) {
      return of({});
    }
    const token = this.createJwt();
    return this.http.post<any>('https://oauth2.googleapis.com/token', { grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: token }).pipe(switchMap(r => {
      return this.http.put<any>(`https://content-sheets.googleapis.com/v4/spreadsheets/${this.settingsService.secret?.movesSheetId as string}/values/${encodeURI(sheetRange)}${type}`, body, { headers: { Authorization: `Bearer ${r.access_token}` }, params: { valueInputOption: 'USER_ENTERED' } })
    }));
  }

  private createJwt() {
    const secretWrite = this.settingsService.secretWrite as SecretWriteDto;
    const iat = Date.now() / 1000;
    const token = jwt.encode({
      'iss': secretWrite.client_email,
      'sub': secretWrite.client_email,
      'scope': 'https://www.googleapis.com/auth/spreadsheets',
      'aud': secretWrite.token_uri,
      'iat': iat,
      'exp': iat + 3600
    }, secretWrite.private_key, 'RS256', { header: { kid: secretWrite.private_key_id } });
    return token;
  }

  private createMovesDto(row: any, i: number): MoveDto {
    return {
      name: row[0],
      dance: row[1],
      date: parseDate(row[2]),
      order: row[3],
      count: row[4],
      nameVerified: parseBoolean(row[5]),
      type: row[6],
      startMove: row[7]?.split(", "),
      endMove: row[8]?.split(", "),
      relatedMoves: row[9]?.split(", "),
      videoname: row[10],
      description: row[11],
      toDo: row[12],
      links: row[13],
      row: i + 1
    };
  }



  private moveToLine(moveDto: MoveDto): string[] {
    return [moveDto.name, moveDto.dance, toGermanDate(moveDto.date),
    moveDto.order, moveDto.count, String(moveDto.nameVerified),
    moveDto.type, moveDto.startMove?.join(", "), moveDto.endMove?.join(", "), moveDto.relatedMoves?.join(", "), moveDto.videoname,
    moveDto.description, moveDto.toDo, moveDto.links]
  }
}
