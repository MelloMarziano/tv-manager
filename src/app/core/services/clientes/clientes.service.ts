import { Injectable } from '@angular/core';
import { HttpInvokeService } from '../http-invoke.service'
import { Observable } from 'rxjs';
import { ClientesDataModel } from '.';

@Injectable({
    providedIn: 'root'
})
export class ClienteService {


    constructor(private http: HttpInvokeService) {
    }


    saveNewCliente(clienteData: ClientesDataModel): Observable<any> {
        const url = 'api/clientes';
        return this.http.PostRequest<any, any>(url, clienteData);
    }

    getClientes(): Observable<any> {
        return this.http.GetRequest('api/clientes');
    }


    getCompanyById(clienteId: number): Observable<any> {
        return this.http.GetRequest(`api/company/${clienteId}`);
    }

    deleteCompany(clienteId: number): Observable<any> {
        return this.http.DeleteRequest(`api/company/${clienteId}`, '');
    }

    updateCompany(clienteId: number, clienteData: ClientesDataModel): Observable<any> {
        return this.http.PutRequest(`api/cliente/${clienteId}`, clienteData);
    }
}
