import { ResponseUpdate } from "./response-update";

export interface ResponseCreate {
    spreadsheetId: string,
    tableRange: string,
    updates: ResponseUpdate
}