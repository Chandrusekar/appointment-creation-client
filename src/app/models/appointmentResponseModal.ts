import { CalendarEventAction } from "angular-calendar";
import { Status } from "./status";

export interface AppointmentResponseModel extends Status{
    map(arg0: (eventObj: any) => void): import("calendar-utils").CalendarEvent<any>[] | PromiseLike<import("calendar-utils").CalendarEvent<any>[]>;
    title:string,
    id:string,
    created_date: string,
    start: string,
    end: string,
    userId: string,
    status: string,
    allDay: boolean,
    actions: CalendarEventAction[],
    appId: string,
    date: string,
    start_time: string,
    end_time: string
}