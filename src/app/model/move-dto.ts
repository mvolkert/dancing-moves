import { CourseDateDto } from "./course-date-dto";
import { VideoDto } from "./video-dto";

export interface MoveDto {
    name: string,
    dance: string,
    order: number,
    count: string,
    nameVerified: boolean,
    type: string,
    startMove: string[],
    endMove: string[],
    containedMoves: string[],
    relatedMoves: string[],
    relatedMovesOtherDances: string[],
    videoname: string,
    media: string,
    description: string,
    descriptionEng: string,
    toDo: string,
    id: string,
    links: string,
    row: number,
    courseDates: CourseDateDto[]
    videos: VideoDto[]
}