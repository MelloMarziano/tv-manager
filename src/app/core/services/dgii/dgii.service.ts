import { Injectable } from '@angular/core';
import { HttpInvokeService } from '../http-invoke.service'
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
// import { OrderModel } from '.';

@Injectable({
    providedIn: 'root'
})
export class DgiiService {


    constructor(private http: HttpInvokeService, private httpClient: HttpClient) {
    }


    sentToDgii(dataToSend: any): Observable<any> {
        const url = 'api/test-scenarios-json';
        return this.http.PostRequest<any, any>(url, dataToSend);
    }

    sentToDgiiAceecf(dataToSend: any): Observable<any> {
        const url = 'api/aprobacion-acfe-json';
        return this.http.PostRequest<any, any>(url, dataToSend);
    }


    getXmlContent(url: string): Observable<string> {
        return this.httpClient.get(url, { responseType: 'text' as 'text' });
    }

    getStatusByTrackID(trackId: string, rnc: string): Observable<any> {
        return this.http.GetRequest(`api/trackid?trackId=${trackId}&rnc=${rnc}`);
    }

}
