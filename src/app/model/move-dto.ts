import { CourseDateDto } from "./course-date-dto";

export interface MoveDto {
    name: string,
    dance: string,
    date: Date,
    order: string,
    count: string,
    nameVerified: boolean,
    type: string,
    startMove: string[],
    endMove: string[],
    relatedMoves: string[],
    videoname: string,
    description: string,
    toDo: string,
    links:string,
    row: number,
    courseDates: CourseDateDto[]
}