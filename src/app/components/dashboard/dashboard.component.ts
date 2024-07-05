import { Component, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { formatDate } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from 'src/app/services/appointment.service';
import { startOfDay, subDays, addDays, isSameDay, isSameMonth } from 'date-fns';
import { CalendarEvent, CalendarEventAction, CalendarEventTimesChangedEvent, CalendarView } from 'angular-calendar';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  @ViewChild('createUpdateModalContent', { static: true }) // Create and update modal
  createUpdateModalContent!: TemplateRef<any>;

  @ViewChild('deletModalContent', { static: true }) // Delete events modal
  deletModalContent!: TemplateRef<any>;

  // calender default variables
  public CalendarView = CalendarView;
  public viewDate: Date = new Date();
  public refresh = new Subject<void>();
  public activeDayIsOpen: boolean = true;
  public events: CalendarEvent[] = [];
  public actions: CalendarEventAction[] = [];
  public view: CalendarView = CalendarView.Month; // Default month view

  // Form inputs and events
  public addAppointmentForm!: FormGroup;
  public submitted = false;
  public deleteUserEvent: any;
  public content?: string;

  // Button actions
  public modalTitleTxt: string = 'Create';
  public modalButtonTxt: string = 'Save';

  constructor(
    private formBuilder: FormBuilder,
    private appointmentService: AppointmentService,
    private modal: NgbModal
  ) { }

  /**
   * convenience getter for easy access to form fields
   */
  get f() { return this.addAppointmentForm.controls; }

  ngOnInit(): void {
    this.addAppointmentForm = this.formBuilder.group({
      title: ['', Validators.required],
      id: ['', Validators.required],
      created_date: [new Date(), [Validators.required,
      Validators.pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)]], // validates date format yyyy-mm-dd
      start: ['', [Validators.required,
      Validators.pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)]], // validates date format yyyy-mm-dd
      end: ['', [Validators.required,
      Validators.pattern(/^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/)]], // validates date format yyyy-mm-dd
      userId: ['', [Validators.required]],
      status: ['', [Validators.required]],
      allDay: ['', Validators.required],
      actions: this.actions
    });
    this.showAppointmentList();
  }

  /**
   * Show list of appointments based on the component call
   */
  private showAppointmentList(): void {
    let eventListArr: any = [];
    this.appointmentService.getAllAppointmentList().subscribe({
      next: async data => {
        this.events = await data.map((eventObj: any) => {
          return eventListArr.push({
            "allDay": eventObj.allDay,
            "created_date": eventObj.created_date,
            "id": eventObj.id,
            "status": eventObj.status,
            "title": eventObj.title,
            "userId": eventObj.userId,
            "_id": eventObj._id,
            "start": subDays(startOfDay(new Date(eventObj.start)), 1),
            "end": addDays(new Date(eventObj.end), 1),
            "actions": [{
              label: '<i class="fas fa-fw fa-pencil-alt"></i>',
              a11yLabel: 'Edit',
              onClick: ({ event }: { event: CalendarEvent }): void => {
                this.handleEvent('Edited', event);
              }
            },
            {
              label: '<i class="fas fa-fw fa-trash-alt"></i>',
              a11yLabel: 'Delete',
              onClick: ({ event }: { event: CalendarEvent }): void => {
                this.events = this.events.filter((iEvent) => iEvent !== event);
                this.handleEvent('Deleted', event);
              }
            }]
          })
        });
        this.events = eventListArr;
        return this.events;
      },
      error: err => {
        if (err.error) {
          try {
            const res = JSON.parse(err.error);
            this.content = res.message;
          } catch {
            this.content = `Error with status: ${err.status} - ${err.statusText}`;
          }
        } else {
          this.content = `Error with status: ${err.status}`;
        }
      }
    });
  }

  /**
   * Event show based on clicked date
   * @param { date, events }: { date: Date; events: CalendarEvent[] }: CalendarEvent[] - events based on particular date 
   */
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      if ((isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) || events.length === 0)
        this.activeDayIsOpen = false;
      else
        this.activeDayIsOpen = true;
      this.viewDate = date;
    }
  }

  /**
   * Change the events in the calendar
   * @param { event, newStart, newEnd }: CalendarEventTimesChangedEvent - change the event time in calendar
   */
  eventTimesChanged({ event, newStart, newEnd }: CalendarEventTimesChangedEvent): void {
    this.events = this.events.map((iEvent) => {
      if (iEvent === event) {
        return {
          ...event,
          start: newStart,
          end: newEnd,
        };
      }
      return iEvent;
    });
    this.handleEvent('Dropped or resized', event);
  }

  /**
   * Action for edit the event and update delete
   * @param action : string - Find action type edit or delete
   * @param event: CalendarEvent - get clicked event details
   */
  handleEvent(action: string, event: any): void {
    if (action == 'Edited') {
      this.modalTitleTxt = 'Update';
      this.modalButtonTxt = 'Update';
      console.log("event", event);
      this.addAppointmentForm.patchValue({
        title: event?.title,
        userId: event?.userId,
        status: event?.status,
        id: event?.id,
        created_date: event?.created_date,
        start: formatDate(event?.start, 'dd-MM-yyyy', 'en'),
        end: event?.end
      })
      this.modal.open(this.createUpdateModalContent, { size: 'lg' });
    } else if (action == 'Deleted') {
      this.deleteUserEvent = event?.id;
      this.modal.open(this.deletModalContent, { size: 'lg' });
    }
  }

  /**
   * Open the new event creation modal
   */
  addNewAppointment() {
    this.modalTitleTxt = 'Create';
    this.modalButtonTxt = 'Save';
    this.modal.open(this.createUpdateModalContent, { size: 'lg' });
  }

  /**
   * Default calendar view EX: [Month || Date || day ]
   * @param view : calendarView - Default calendar view type
   */
  setView(view: CalendarView) {
    this.view = view;
  }

  /**
   * Change the month | Date | day like next and Previous
   */
  closeOpenMonthViewDay() {
    this.activeDayIsOpen = false;
  }

  /**
   * create new appointment and update the appointment
   */
  onSubmit() {
    this.submitted = true;
    if (this.modalButtonTxt == 'Save') {
      this.appointmentService.createNewAppointment(this.addAppointmentForm.value).subscribe({
        next: async data => {
          this.close();
          this.content = data.userId;
        },
        error: err => {
          if (err.error) {
            try {
              const res = JSON.parse(err.error);
              this.content = res.message;
            } catch {
              this.content = `Error with status: ${err.status} - ${err.statusText}`;
            }
          } else {
            this.content = `Error with status: ${err.status}`;
          }
        }
      });
    }
    else if (this.modalButtonTxt == 'Update') {
      this.addAppointmentForm.patchValue({
        title: this.addAppointmentForm.get('title')?.value,
        userId: this.addAppointmentForm.get('userId')?.value,
        status: this.addAppointmentForm.get('status')?.value,
        appId: this.addAppointmentForm.get('id')?.value,
        date: this.addAppointmentForm.get('created_date')?.value,
        start_time: this.addAppointmentForm.get('start')?.value,
        end_time: this.addAppointmentForm.get('end')?.value,
      })
      this.appointmentService.updateUserAppointment(
        this.addAppointmentForm.value).subscribe(
          {
            next: async data => {
              this.close();
              this.content = data.userId;
            },
            error: err => {
              if (err.error) {
                try {
                  const res = JSON.parse(err.error);
                  this.content = res.message;
                } catch {
                  this.content = `Error with status: ${err.status} - ${err.statusText}`;
                }
              } else {
                this.content = `Error with status: ${err.status}`;
              }
            }
          });
    }
  }

  /**
   * Delete the appointment based on the userId
   */
  deleteAppointment(): void {
    if (this.deleteUserEvent) {
      this.appointmentService.deleteUserAppointment(this.deleteUserEvent).subscribe({
        next: async data => {
          this.close();
          this.content = data.userId;
        },
        error: err => {
          if (err.error) {
            try {
              const res = JSON.parse(err.error);
              this.content = res.message;
            } catch {
              this.content = `Error with status: ${err.status} - ${err.statusText}`;
            }
          } else {
            this.content = `Error with status: ${err.status}`;
          }
        }
      })
    }
  }

  /**
   * Close the modal popup and reset the reactive form values
   */
  close() {
    this.deleteUserEvent = '';
    this.submitted = false;
    this.addAppointmentForm.reset();
  }

}
