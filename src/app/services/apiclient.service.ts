import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, map, Observable, of, switchMap, tap } from 'rxjs';
import { MoveDto } from '../model/move-dto';
import { parseBoolean, parseDate, toGermanDate } from '../util/util';
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

@Injectable({
  providedIn: 'root'
})
export class ApiclientService {
  private lastUpdated!: number;
  private writeToken!: ApiToken;
  private userMode!: UserMode;

  constructor(private settingsService: SettingsService, private http: HttpClient) {
    this.settingsService.userMode.subscribe(userMode => this.userMode = userMode);
  }

  getMoves(): Observable<Array<MoveDto>> {
    return this.spreadsheetsGet(
      this.settingsService.secret?.movesSheetId as string,
      'Tanzfiguren!A1:S500'
    ).pipe(map(response => this.mapRows<MoveDto>(response, this.createMoveDto)));
  }

  getCourseDates(): Observable<Array<CourseDateDto>> {
    return this.spreadsheetsGet(
      this.settingsService.secret?.courseDatesSheetId as string,
      'Course Dates!A1:C1000'
    ).pipe(map(response => this.mapRows<CourseDateDto>(response, this.createCourseDateDto)));
  }

  getCourses(): Observable<Array<CourseDto>> {
    return this.spreadsheetsGet(
      this.settingsService.secret?.movesSheetId as string,
      'Courses!A1:J1000'
    ).pipe(map(response => this.mapRows<CourseDto>(response, this.createCourseDto)));
  }

  getDances(): Observable<Array<DanceDto>> {
    return this.spreadsheetsGet(
      this.settingsService.secret?.movesSheetId as string,
      'Tänze!A1:H100'
    ).pipe(map(response => this.mapRows<DanceDto>(response, this.createDanceDto)));
  }

  getVideos(name: string): Observable<Array<VideoDto>> {
    return this.spreadsheetsGet(
      this.settingsService.secret?.courseDatesSheetId as string,
      `${name}!A1:C1000`
    ).pipe(map(response => this.mapRows<VideoDto>(response, this.createVideoDtoFunc(name))));
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
    const sheetRange = 'Tanzfiguren!A400:U400';
    const body = { values: [this.moveToLine(moveDto)] }
    return this.spreadsheetsPost(this.settingsService.secret?.movesSheetId as string, sheetRange, body, ':append');
  }

  patchData(moveDto: MoveDto): Observable<ResponseUpdate> {
    const sheetRange = `Tanzfiguren!A${moveDto.row}:U${moveDto.row}`;
    const body = { values: [this.moveToLine(moveDto)] }
    return this.spreadsheetsPut(this.settingsService.secret?.movesSheetId as string, sheetRange, body);
  }

  appendDataCourse(courseDto: CourseDto): Observable<ResponseCreate> {
    const sheetRange = 'Courses!A26:J26';
    const body = { values: [this.courseToLine(courseDto)] }
    return this.spreadsheetsPost(this.settingsService.secret?.movesSheetId as string, sheetRange, body, ':append');
  }

  patchDataCourse(courseDto: CourseDto): Observable<ResponseUpdate> {
    const sheetRange = `Courses!A${courseDto.row}:J${courseDto.row}`;
    const body = { values: [this.courseToLine(courseDto)] }
    return this.spreadsheetsPut(this.settingsService.secret?.movesSheetId as string, sheetRange, body);
  }

  appendCourseDate(courseDateDto: CourseDateDto): Observable<ResponseCreate> {
    const sheetRange = 'Course Dates!A400:C400';
    const body = { values: [this.courseDateToLine(courseDateDto)] }
    return this.spreadsheetsPost(this.settingsService.secret?.courseDatesSheetId as string, sheetRange, body, ':append');
  }

  patchCourseDate(courseDateDto: CourseDateDto): Observable<ResponseUpdate> {
    const sheetRange = `Course Dates!A${courseDateDto.row}:C${courseDateDto.row}`;
    const body = { values: [this.courseDateToLine(courseDateDto)] }
    return this.spreadsheetsPut(this.settingsService.secret?.courseDatesSheetId as string, sheetRange, body);
  }

  appendCourseContent(name: string, content: VideoDto): Observable<ResponseCreate> {
    const sheetRange = `${name}!A1:C2`;
    const body = { values: [this.courseContentToLine(content)] }
    return this.spreadsheetsPost(this.settingsService.secret?.courseDatesSheetId as string, sheetRange, body, ':append');
  }

  patchCourseContent(name: string, content: VideoDto): Observable<ResponseUpdate> {
    const sheetRange = `${name}!A${content.row}:C${content.row}`;
    const body = { values: [this.courseContentToLine(content)] }
    return this.spreadsheetsPut(this.settingsService.secret?.courseDatesSheetId as string, sheetRange, body);
  }
  private spreadsheetsGet(sheetId: string, sheetRange: string): Observable<ResponseGet> {
    if (this.userMode === UserMode.test) {
      return of(apiTestData);
    }
    return this.http.get<ResponseGet>(`https://content-sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURI(sheetRange)}`, { params: { key: this.settingsService.secret?.apiKey as string } });
  }
  private spreadsheetsPost(sheetId: string, sheetRange: string, body: any, type = ''): Observable<ResponseCreate> {
    if (this.userMode !== UserMode.write) {
      return of({ updates: { updatedRange: 'T!A42:S42' } } as ResponseCreate);
    }
    return this.loginWrite().pipe(switchMap(r => {
      return this.http.post<ResponseCreate>(`https://content-sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURI(sheetRange)}${type}`, body, { headers: { Authorization: `Bearer ${r.access_token}` }, params: { valueInputOption: 'USER_ENTERED' } })
    }));
  }

  private spreadsheetsPut(sheetId: string, sheetRange: string, body: any, type = ''): Observable<ResponseUpdate> {
    if (this.userMode !== UserMode.write) {
      return of({} as ResponseUpdate);
    }
    return this.loginWrite().pipe(switchMap(r => {
      return this.http.put<ResponseUpdate>(`https://content-sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURI(sheetRange)}${type}`, body, { headers: { Authorization: `Bearer ${r.access_token}` }, params: { valueInputOption: 'USER_ENTERED' } })
    }));
  }

  private loginWrite(): Observable<ApiToken> {
    if (!this.settingsService.secretWrite) {
      return of({} as ApiToken);
    }
    if (this.writeToken && this.lastUpdated && (this.nowInSec() - this.lastUpdated) < (this.writeToken.expires_in - 100)) {
      return of(this.writeToken);
    }
    const token = this.createJwt();
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
      moveName: row[2],
      row: i + 1
    };
  }


  private createMoveDto = (row: any, i: number): MoveDto => {
    return {
      name: row[0],
      dance: row[1],
      description: row[2],
      date: parseDate(row[3]),
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
      links: row[14],
      toDo: row[15],
      row: i + 1,
      courseDates: [],
      videos: []
    };
  }

  private createCourseDto = (row: any, i: number): CourseDto => {
    return {
      course: row[0],
      dances: this.stringToArray(row[1]),
      school: row[2],
      description: row[3],
      teacher: row[4],
      level: row[5],
      start: parseDate(row[6]),
      end: parseDate(row[7]),
      time: row[8],
      groupName: row[9],
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
      school: row[4],
      level: row[5],
      description: row[6],
      links: row[7],
      row: i + 1
    };
  }

  private createVideoDtoFunc = (groupName: string): (row: any, i: number) => VideoDto => {
    return (row, i) => this.createVideoDto(row, i, groupName);
  }

  private createVideoDto = (row: any, i: number, groupName: string): VideoDto => {
    return {
      name: row[0],
      link: row[1],
      courseName: row[2],
      groupName: groupName,
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
    return [moveDto.name, moveDto.dance, moveDto.description, toGermanDate(moveDto.date),
    String(moveDto.order), moveDto.count, String(moveDto.nameVerified),
    moveDto.type, moveDto.startMove?.join(","), moveDto.endMove?.join(","), moveDto.containedMoves?.join(","), moveDto.relatedMoves?.join(","), moveDto.relatedMovesOtherDances?.join(","),
    moveDto.videoname, moveDto.links, moveDto.toDo]
  }

  private courseDateToLine(courseDateDto: CourseDateDto): string[] {
    return [toGermanDate(courseDateDto.date), courseDateDto.course, courseDateDto.moveName]
  }

  private courseToLine(courseDto: CourseDto): string[] {
    return [courseDto.course, courseDto.dances?.join(","), courseDto.school, courseDto.description, courseDto.teacher, courseDto.level, toGermanDate(courseDto.start), toGermanDate(courseDto.end)]
  }

  private courseContentToLine(courseDataDto: VideoDto): string[] {
    return [courseDataDto.name, courseDataDto.link]
  }
}
