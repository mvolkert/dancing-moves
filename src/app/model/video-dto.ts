import { SafeResourceUrl } from "@angular/platform-browser";

export interface VideoDto {
    name: string,
    link: string,
    safeUrl?: SafeResourceUrl,
    row: number
}