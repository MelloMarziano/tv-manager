import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class FirmaService {
    constructor(private http: HttpClient) { }

    firmarXML(file: File, rnc: string) {
        const formData = new FormData();
        formData.append('xml', file, file.name);
        formData.append('rnc', rnc);

        return this.http.post('https://ecfrecepcion.starsoftdominicana.com/ecf/api/firmar-xml', formData, {
            responseType: 'blob',
        });
    }
}
