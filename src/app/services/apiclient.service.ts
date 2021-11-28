import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, map, Observable, of, switchMap } from 'rxjs';
import { MoveDto } from '../model/move-dto';
import { parseBoolean, parseDate, toGermanDate } from '../util/util';
import { SettingsService } from './settings.service';
import * as jwt from 'jwt-simple';
import { SecretWriteDto } from '../model/secret-write-dto';
import { CourseDateDto } from '../model/course-date-dto';
import { ResponseUpdate } from '../model/response-update';
import { ResponseCreate } from '../model/response-create';
import { ResponseGet } from '../model/response-get';

@Injectable({
  providedIn: 'root'
})
export class ApiclientService {
  private movesKeys: string[] = new Array<string>();
  private courseDatesKeys: string[] = new Array<string>();
  constructor(private settingsService: SettingsService, private http: HttpClient) { }

  async getMoves(): Promise<MoveDto[]> {
    await this.settingsService.loading();
    const moves = new Array<MoveDto>();
    const sheetRange = 'Tanzfiguren!A1:S500'
    return firstValueFrom(this.spreadsheetsGet(
      this.settingsService.secret?.movesSheetId as string,
      sheetRange
    ).pipe(map((result: ResponseGet) => {
      const values = result?.values;
      if (values.length > 0) {
        this.movesKeys = values[0];
        for (let i = 1; i < values.length; i++) {
          var row = values[i];
          if (row[0]) {
            moves.push(this.createMovesDto(row, i));
          }
        }
      }
      return moves;
    })));
  }

  async getCourseDates(): Promise<Array<CourseDateDto>> {
    await this.settingsService.loading();
    const courseDates = new Array<CourseDateDto>();
    const sheetRange = 'Course Dates!A1:C1000'
    return firstValueFrom(this.spreadsheetsGet(
      this.settingsService.secret?.courseDatesSheetId as string,
      sheetRange
    ).pipe(map((result: ResponseGet) => {
      const values = result?.values;
      if (values.length > 0) {
        this.courseDatesKeys = values[0];
        for (let i = 1; i < values.length; i++) {
          var row = values[i];
          if (row[0]) {
            courseDates.push(this.createCourseDateDto(row, i));
          }
        }
      }
      return courseDates;
    })));
  }

  appendData(moveDto: MoveDto): Observable<ResponseCreate> {
    const sheetRange = 'Tanzfiguren!A400:U400';
    const body = { values: [this.moveToLine(moveDto)] }
    return this.spreadsheetsPost(this.settingsService.secret?.movesSheetId as string, sheetRange, body, ':append');
  }

  patchData(moveDto: MoveDto): Observable<ResponseUpdate> {
    const sheetRange = `Tanzfiguren!A${moveDto.row}:U${moveDto.row}`;
    const body = { values: [this.moveToLine(moveDto)] }
    return this.spreadsheetsPut(this.settingsService.secret?.movesSheetId as string, sheetRange, body);
  }
  private spreadsheetsGet(sheetId: string, sheetRange: string): Observable<ResponseGet> {
    return this.http.get<ResponseGet>(`https://content-sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURI(sheetRange)}`, { params: { key: this.settingsService.secret?.apiKey as string } });
  }
  private spreadsheetsPost(sheetId: string, sheetRange: string, body: any, type = ''): Observable<ResponseCreate> {
    return this.loginWrite().pipe(switchMap(r => {
      return this.http.post<ResponseCreate>(`https://content-sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURI(sheetRange)}${type}`, body, { headers: { Authorization: `Bearer ${r.access_token}` }, params: { valueInputOption: 'USER_ENTERED' } })
    }));
  }

  private spreadsheetsPut(sheetId: string, sheetRange: string, body: any, type = ''): Observable<ResponseUpdate> {
    return this.loginWrite().pipe(switchMap(r => {
      return this.http.put<ResponseUpdate>(`https://content-sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURI(sheetRange)}${type}`, body, { headers: { Authorization: `Bearer ${r.access_token}` }, params: { valueInputOption: 'USER_ENTERED' } })
    }));
  }

  private loginWrite(): Observable<any> {
    if (!this.settingsService.secretWrite) {
      return of({});
    }
    const token = this.createJwt();
    return this.http.post<any>('https://oauth2.googleapis.com/token', { grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: token });
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

  private createCourseDateDto(row: any, i: number): CourseDateDto {
    return {
      date: parseDate(row[0]),
      course: row[1],
      moveName: row[2],
      row: i + 1
    };
  }


  private createMovesDto(row: any, i: number): MoveDto {
    return {
      name: row[0],
      dance: row[1],
      description: row[2],
      date: parseDate(row[3]),
      order: row[4],
      count: row[5],
      nameVerified: parseBoolean(row[6]),
      type: row[7],
      startMove: row[8]?.split(",").map((e: string) => e.trim()),
      endMove: row[9]?.split(",").map((e: string) => e.trim()),
      relatedMoves: row[10]?.split(",").map((e: string) => e.trim()),
      relatedMovesOtherDances: row[11]?.split(",").map((e: string) => e.trim()),
      videoname: row[12],
      links: row[13],
      toDo: row[14],
      row: i + 1,
      courseDates: []
    };
  }



  private moveToLine(moveDto: MoveDto): string[] {
    return [moveDto.name, moveDto.dance, moveDto.description, toGermanDate(moveDto.date),
    moveDto.order, moveDto.count, String(moveDto.nameVerified),
    moveDto.type, moveDto.startMove?.join(","), moveDto.endMove?.join(","), moveDto.relatedMoves?.join(","), moveDto.relatedMovesOtherDances?.join(","),
    moveDto.videoname, moveDto.links, moveDto.toDo]
  }
}
