import { CourseDateDto } from "./course-date-dto";
import { VideoDto } from "./video-dto";

export interface MoveDto {
    name: string,
    dance: string,
    date: Date | null,
    order: number,
    count: string,
    nameVerified: boolean,
    type: string,
    startMove: string[],
    endMove: string[],
    relatedMoves: string[],
    relatedMovesOtherDances: string[],
    videoname: string,
    description: string,
    toDo: string,
    links: string,
    row: number,
    courseDates: CourseDateDto[]
    videos: VideoDto[]
}