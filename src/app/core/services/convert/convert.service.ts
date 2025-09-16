import { Injectable } from '@angular/core';
import { HttpInvokeService } from '../http-invoke.service'
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
// import { OrderModel } from '.';

@Injectable({
    providedIn: 'root'
})
export class ConvertService {


    constructor(private http: HttpInvokeService, private httpClient: HttpClient) {
    }


    convertCert(file: File, password: string): Observable<any> {
        const url = 'api/convertir-cert';
        const formData = new FormData();

        formData.append('certificado', file);
        formData.append('password', password);

        return this.http.PostRequest<any, any>(url, formData);
    }





}
