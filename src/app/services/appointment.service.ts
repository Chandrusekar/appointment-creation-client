import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AppointmentRequestModel } from '../models/appointmentRequestModal';
import { AppointmentResponseModel } from '../models/appointmentResponseModal';
import { InterceptorService } from '../services/interceptor.service';
import { Status } from '../models/status';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private baseUrl = environment.baseUrl;
  private header: any;

  constructor(private http: HttpClient,
    private injector: Injector,
    private interceptorService: InterceptorService,
    private authService: AuthService) {

    let service = this.injector.get(AuthService);
    this.header = (this.authService.isLoggedIn()) ? { Authorization: `Bearer ${service.getAccessToken()}` } : undefined;
  }

  getAllAppointmentList() {
    return this.http.get<AppointmentResponseModel>(this.baseUrl + '/event-list', { headers: this.header });
  }

  createNewAppointment(model:AppointmentRequestModel) {
    return this.http.post<AppointmentResponseModel>(this.baseUrl + '/events', model, { headers: this.header });
  }

  updateUserAppointment(model:AppointmentRequestModel) {
    return this.http.put<AppointmentResponseModel>(this.baseUrl + '/events', model, { headers: this.header });
  }
  
  deleteUserAppointment(userId: string) {
    return this.http.delete<AppointmentResponseModel>(this.baseUrl + '/event/' + userId, { headers: this.header });
  }

}
