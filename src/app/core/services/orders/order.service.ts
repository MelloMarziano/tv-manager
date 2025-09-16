import { Injectable } from '@angular/core';
import { HttpInvokeService } from '../http-invoke.service'
import { Observable } from 'rxjs';
import { OrderModel } from '.';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {


    constructor(private http: HttpInvokeService) {
    }


    saveNewOrder(orderData: any): Observable<any> {
        const url = 'api/ordenservicio';
        return this.http.PostRequest<any, any>(url, orderData);
    }

    getOrders(): Observable<any> {
        return this.http.GetRequest('api/ordenservicio');
    }


    // getCompanyById(clienteId: number): Observable<any> {
    //     return this.http.GetRequest(`api/company/${clienteId}`);
    // }

    // deleteCompany(clienteId: number): Observable<any> {
    //     return this.http.DeleteRequest(`api/company/${clienteId}`, '');
    // }

    // updateCompany(clienteId: number, clienteData: ClientesDataModel): Observable<any> {
    //     return this.http.PutRequest(`api/cliente/${clienteId}`, clienteData);
    // }
}
