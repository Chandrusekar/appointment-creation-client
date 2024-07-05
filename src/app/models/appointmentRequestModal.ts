import { CalendarEventAction } from "angular-calendar";

export interface AppointmentRequestModel {
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