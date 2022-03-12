export interface CourseDto {
    course: string,
    dances: string[],
    school: string,
    description: string,
    teacher: string,
    level: string,
    start: Date | null,
    end: Date | null,
    row: number
}