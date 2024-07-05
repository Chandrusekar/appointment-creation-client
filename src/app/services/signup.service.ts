import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { LoginResponseModel } from '../models/login-response';
import { LoginRequestModel } from '../models/loginRequestModel';
import { SignupRequestModel } from '../models/signupReqModel';
import { Status } from '../models/status';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  private baseUrl = environment.baseUrl;
  constructor(private http:HttpClient) { 

  }

  login(model:LoginRequestModel){
  return this.http.post<LoginResponseModel>(this.baseUrl+'/login',model);
  }

  signup(model:SignupRequestModel){
     return this.http.post<Status>(this.baseUrl+'/signup',model);
  }

}
