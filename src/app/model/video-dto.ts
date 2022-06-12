import { SafeResourceUrl } from "@angular/platform-browser";

export interface VideoDto {
    name: string,
    link: string,
    linkEncripted: string,
    courseName: string,
    safeUrl?: SafeResourceUrl,
    groupName: string,
    row: number
}