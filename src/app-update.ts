import { Subject } from "rxjs";

export type UpdateType = "availableOffline" | "updated" | "dataUpdated";

export const appUpdateSubject$ = new Subject<UpdateType>();
