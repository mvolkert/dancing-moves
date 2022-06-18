import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable, of, switchMap, take, tap } from 'rxjs';
import { MoveDto } from '../model/move-dto';
import { delay, parseBoolean, parseDate, toGermanDate } from '../util/util';
import { SettingsService } from './settings.service';
import * as jwt from 'jwt-simple';
import { SecretWriteDto } from '../model/secret-write-dto';
import { CourseDateDto } from '../model/course-date-dto';
import { ResponseUpdate } from '../model/response-update';
import { ResponseCreate } from '../model/response-create';
import { ResponseGet } from '../model/response-get';
import { ApiToken } from '../model/api-token';
import { UserMode } from '../model/user-mode';
import { CourseDto } from '../model/course-dto';
import { DanceDto } from '../model/dance-dto';
import { VideoDto } from '../model/video-dto';
import { apiTestData } from '../util/data';
import { DataAccessDto } from '../model/data-access-dto';

@Injectable({
  providedIn: 'root'
})
export class ApiclientService {
  private lastUpdated!: number;
  private writeToken!: ApiToken;
  private userMode!: UserMode;
  private appendPossible = new BehaviorSubject(true);
  private appendNumber = 0;
  private appendNumberDue = 0;
  private putPossible = new BehaviorSubject(true);
  private putNumber = 0;
  private putNumberDue = 0;

  constructor(private settingsService: SettingsService, private http: HttpClient) {
    this.settingsService.userMode.subscribe(userMode => this.userMode = userMode);
  }

  getMoves(): Observable<Array<MoveDto>> {
    if (this.userMode === UserMode.test) {
      return of(apiTestData).pipe(map(response => this.mapRows<MoveDto>(response, this.createMoveDto)));;
    }
    return this.spreadsheetsGet(
      this.settingsService.sheetId as string,
      'Moves!A1:S1000'
    ).pipe(map(response => this.mapRows<MoveDto>(response, this.createMoveDto)));
  }

  getCourseDates(): Observable<Array<CourseDateDto>> {
    return this.spreadsheetsGet(
      this.settingsService.sheetId as string,
      'CourseDates!A1:C1000'
    ).pipe(map(response => this.mapRows<CourseDateDto>(response, this.createCourseDateDto)));
  }

  getCourses(): Observable<Array<CourseDto>> {
    return this.spreadsheetsGet(
      this.settingsService.sheetId as string,
      'Courses!A1:L1000'
    ).pipe(map(response => this.mapRows<CourseDto>(response, this.createCourseDto)));
  }

  getDances(): Observable<Array<DanceDto>> {
    return this.spreadsheetsGet(
      this.settingsService.sheetId as string,
      'Dances!A1:H100'
    ).pipe(map(response => this.mapRows<DanceDto>(response, this.createDanceDto)));
  }

  getVideos(): Observable<Array<VideoDto>> {
    return this.spreadsheetsGet(
      this.settingsService.sheetId as string,
      `CourseContents!A1:C1000`
    ).pipe(map(response => this.mapRows<VideoDto>(response, this.createVideoDto)));
  }


  private mapRows<T>(response: ResponseGet, mapfunc: (row: string[], i: number) => T): Array<T> {
    const result = new Array<T>();
    const values = response?.values;
    if (values?.length > 0) {
      for (let i = 1; i < values.length; i++) {
        var row = values[i];
        if (row[0] || row[1]) {
          result.push(mapfunc(row, i));
        }
      }
    }
    return result;
  }

  appendData(moveDto: MoveDto): Observable<ResponseCreate> {
    const sheetRange = 'Moves!A2:U2';
    const body = { values: [this.moveToLine(moveDto)] }
    return this.spreadsheetsPost(this.settingsService.sheetId as string, sheetRange, body, ':append');
  }

  patchData(moveDto: MoveDto): Observable<ResponseUpdate> {
    const sheetRange = `Moves!A${moveDto.row}:U${moveDto.row}`;
    const body = { values: [this.moveToLine(moveDto)] }
    return this.spreadsheetsPut(this.settingsService.sheetId as string, sheetRange, body);
  }

  appendDataCourse(courseDto: CourseDto): Observable<ResponseCreate> {
    const sheetRange = 'Courses!A2:J2';
    const body = { values: [this.courseToLine(courseDto)] }
    return this.spreadsheetsPost(this.settingsService.sheetId as string, sheetRange, body, ':append');
  }

  patchDataCourse(courseDto: CourseDto): Observable<ResponseUpdate> {
    const sheetRange = `Courses!A${courseDto.row}:L${courseDto.row}`;
    const body = { values: [this.courseToLine(courseDto)] }
    return this.spreadsheetsPut(this.settingsService.sheetId as string, sheetRange, body);
  }

  appendCourseDate(courseDateDto: CourseDateDto): Observable<ResponseCreate> {
    const sheetRange = 'CourseDates!A2:C2';
    const body = { values: [this.courseDateToLine(courseDateDto)] }
    return this.spreadsheetsPost(this.settingsService.sheetId as string, sheetRange, body, ':append');
  }

  patchCourseDate(courseDateDto: CourseDateDto): Observable<ResponseUpdate> {
    const sheetRange = `CourseDates!A${courseDateDto.row}:C${courseDateDto.row}`;
    const body = { values: [this.courseDateToLine(courseDateDto)] }
    return this.spreadsheetsPut(this.settingsService.sheetId as string, sheetRange, body);
  }

  appendCourseContent(content: VideoDto): Observable<ResponseCreate> {
    const sheetRange = `CourseContents!A2:C2`;
    const body = { values: [this.courseContentToLine(content)] }
    return this.spreadsheetsPost(this.settingsService.sheetId as string, sheetRange, body, ':append');
  }

  patchCourseContent(content: VideoDto): Observable<ResponseUpdate> {
    const sheetRange = `CourseContents!A${content.row}:C${content.row}`;
    const body = { values: [this.courseContentToLine(content)] }
    return this.spreadsheetsPut(this.settingsService.sheetId as string, sheetRange, body);
  }

  appendDance(danceDto: DanceDto): Observable<ResponseCreate> {
    const sheetRange = 'Dances!A2:H2';
    const body = { values: [this.danceToLine(danceDto)] }
    return this.spreadsheetsPost(this.settingsService.sheetId as string, sheetRange, body, ':append');
  }

  patchDance(danceDto: DanceDto): Observable<ResponseUpdate> {
    const sheetRange = `Dances!A${danceDto.row}:J${danceDto.row}`;
    const body = { values: [this.danceToLine(danceDto)] }
    return this.spreadsheetsPut(this.settingsService.sheetId as string, sheetRange, body);
  }

  private spreadsheetsGet(sheetId: string, sheetRange: string): Observable<ResponseGet> {
    if (this.userMode === UserMode.test) {
      return of({ range: '', majorDimension: '', values: [] } as ResponseGet);
    }
    return this.http.get<ResponseGet>(`https://content-sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURI(sheetRange)}`, { params: { key: this.settingsService.secret?.apiKey as string } });
  }
  private spreadsheetsPost(sheetId: string, sheetRange: string, body: any, type = ''): Observable<ResponseCreate> {
    if (this.userMode !== UserMode.write) {
      return of({ updates: { updatedRange: 'T!A42:S42' } } as ResponseCreate);
    }
    const localAppendNummer = this.appendNumber++;
    return this.appendPossible.pipe(filter(p => p && localAppendNummer == this.appendNumberDue), take(1), switchMap(p => this.loginWrite()), switchMap(r => {
      this.appendPossible.next(false);
      return this.http.post<ResponseCreate>(`https://content-sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURI(sheetRange)}${type}`, body, { headers: { Authorization: `Bearer ${r.access_token}` }, params: { valueInputOption: 'USER_ENTERED' } }).pipe(tap(r => {
        this.appendNumberDue++;
        this.appendPossible.next(true);
      }))
    }));
  }

  private spreadsheetsPut(sheetId: string, sheetRange: string, body: any, type = ''): Observable<ResponseUpdate> {
    if (this.userMode !== UserMode.write) {
      return of({} as ResponseUpdate);
    }
    const localPutNummer = this.putNumber++;
    const doWait = localPutNummer !== 0 && (localPutNummer % 50) === 0;
    return this.putPossible.pipe(filter(p => p && localPutNummer == this.putNumberDue), take(1), switchMap(p => this.loginWrite()), switchMap(r => {
      return this.http.put<ResponseUpdate>(`https://content-sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURI(sheetRange)}${type}`, body, { headers: { Authorization: `Bearer ${r.access_token}` }, params: { valueInputOption: 'USER_ENTERED' } }).pipe(tap(async (r) => {
        if (doWait) {
          console.log('wait a minute', localPutNummer);
          this.putPossible.next(false);
          await delay(60000);
        }
        this.putNumberDue++;
        this.putPossible.next(true);
      }))
    }));
  }

  private loginWrite(): Observable<ApiToken> {
    if (!this.settingsService.secretWrite && !this.settingsService.googleJwtString) {
      return of({} as ApiToken);
    }
    if (this.writeToken && this.lastUpdated && (this.nowInSec() - this.lastUpdated) < (this.writeToken.expires_in - 100)) {
      return of(this.writeToken);
    }
    let token;
    if (token = this.settingsService.secretWrite) {
      token = this.createJwt();
    } else if (this.settingsService.googleJwtString) {
      token = this.settingsService.googleJwtString
    }
    console.log(token);
    this.lastUpdated = this.nowInSec();
    return this.http.post<ApiToken>('https://oauth2.googleapis.com/token', { grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: token }).pipe(tap(r => this.writeToken = r));
  }

  private nowInSec(): number {
    return Date.now() / 1000;
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

  private createCourseDateDto = (row: any, i: number): CourseDateDto => {
    return {
      date: parseDate(row[0]),
      course: row[1],
      moveId: row[2],
      description: row[3],
      row: i + 1
    };
  }


  private createMoveDto = (row: any, i: number): MoveDto => {
    return {
      name: row[0],
      dance: row[1],
      description: row[2],
      descriptionEng: row[3],
      order: Number(row[4]),
      count: row[5],
      nameVerified: parseBoolean(row[6]),
      type: row[7],
      startMove: this.stringToArray(row[8]),
      endMove: this.stringToArray(row[9]),
      containedMoves: this.stringToArray(row[10]),
      relatedMoves: this.stringToArray(row[11]),
      relatedMovesOtherDances: this.stringToArray(row[12]),
      videoname: row[13],
      media: row[14],
      links: row[15],
      toDo: row[16],
      id: row[17],
      row: i + 1,
      courseDates: [],
      videos: []
    };
  }

  private createCourseDto = (row: any, i: number): CourseDto => {
    return {
      name: row[0],
      dances: this.stringToArray(row[1]),
      school: row[2],
      description: row[3],
      teacher: row[4],
      level: row[5],
      start: parseDate(row[6]),
      end: parseDate(row[7]),
      time: row[8],
      groupName: row[9],
      hash: row[10],
      salt: row[11],
      contents: [],
      row: i + 1
    };
  }

  private createDanceDto = (row: any, i: number): DanceDto => {
    return {
      name: row[0],
      type: row[1],
      music: row[2],
      rhythm: row[3],
      description: row[4],
      links: row[5],
      row: i + 1
    };
  }

  private createVideoDto = (row: any, i: number): VideoDto => {
    return {
      name: row[0],
      link: row[1],
      linkEncripted: row[1],
      courseName: row[2],
      changed: false,
      row: i + 1
    };
  }

  private createDataAccessDto = (row: any, i: number): DataAccessDto => {
    return {
      hash: row[0],
      sheetName: row[1],
      name: row[2],
      description: row[3],
      salt: row[4],
      row: i + 1
    };
  }

  private stringToArray(str: string) {
    str = str?.trim();
    if (str) {
      return Array.from(new Set(str.split(",").map((e: string) => e.trim()).filter(e => Boolean(e))).values());
    } else {
      return []
    }
  }


  private moveToLine(moveDto: MoveDto): string[] {
    return [moveDto.name, moveDto.dance, moveDto.description, moveDto.descriptionEng,
    String(moveDto.order), moveDto.count, String(moveDto.nameVerified),
    moveDto.type, moveDto.startMove?.join(","), moveDto.endMove?.join(","), moveDto.containedMoves?.join(","), moveDto.relatedMoves?.join(","), moveDto.relatedMovesOtherDances?.join(","),
    moveDto.videoname, moveDto.media, moveDto.links, moveDto.toDo, moveDto.id]
  }

  private courseDateToLine(courseDateDto: CourseDateDto): string[] {
    return [toGermanDate(courseDateDto.date), courseDateDto.course, courseDateDto.moveId, courseDateDto.description]
  }

  private courseToLine(courseDto: CourseDto): string[] {
    return [courseDto.name, courseDto.dances?.join(","), courseDto.school, courseDto.description, courseDto.teacher, courseDto.level, toGermanDate(courseDto.start), toGermanDate(courseDto.end), courseDto.time, courseDto.groupName, courseDto.hash, courseDto.salt]
  }

  private courseContentToLine(courseDataDto: VideoDto): string[] {
    return [courseDataDto.name, courseDataDto.linkEncripted, courseDataDto.courseName]
  }

  private danceToLine(danceDto: DanceDto): string[] {
    return [danceDto.name, danceDto.type, danceDto.music, danceDto.rhythm, danceDto.description, danceDto.links]
  }
}
