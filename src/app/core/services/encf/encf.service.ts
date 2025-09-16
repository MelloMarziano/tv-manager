import {
    Firestore,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    where,
    writeBatch
} from '@angular/fire/firestore';
import { Injectable } from '@angular/core';
import { deleteField } from 'firebase/firestore';

@Injectable({ providedIn: 'root' })
export class EncfSimpleService {
    constructor(private firestore: Firestore) { }

    async guardarJsonSimple1(json: any[], rncPersonalizado: string) {
        const secuencias: Record<string, number> = {}; // contador por TipoeCF

        for (const item of json) {
            item.RNCEmisor = rncPersonalizado;
            const tipo = item.TipoeCF;

            if (!secuencias[tipo]) {
                secuencias[tipo] = 1;
            } else {
                secuencias[tipo]++;
            }

            const numero = String(secuencias[tipo]).padStart(10, '0');
            item.ENCF = `E${tipo}${numero}`;

            const newDoc = doc(collection(this.firestore, 'encfFacturas'));
            await setDoc(newDoc, item);
        }

        console.log('Facturas subidas correctamente');
    }

    async guardarJsonSimple(json: any[]) {
        for (const item of json) {
            const newDoc = doc(collection(this.firestore, 'encfFacturas'));
            await setDoc(newDoc, item);
        }
        console.log('Facturas guardadas en Firebase');
    }

    async resetearENCFs(empresaId: string, razonSocial: string) {
        const ref = collection(this.firestore, 'encfFacturas');
        const q = query(ref, where('RNCEmisor', '==', empresaId));
        const snapshot = await getDocs(q);

        const batch = writeBatch(this.firestore);
        const contadorPorTipo: Record<string, number> = {};

        // 🔁 Mapeo para buscar tipo 46 y asignarlo luego a 34
        const nuevoENCFs: Record<string, string> = {};
        const fechasPorTipo: Record<string, string> = {};
        const docsPorId: Record<string, any> = {};

        // FASE 1: generar ENCFs y almacenar en memoria
        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const tipo = data['TipoeCF']?.toString();
            const docId = docSnap.id;

            if (!contadorPorTipo[tipo]) {
                const counterRef = doc(this.firestore, `encf_counters/${tipo}_${empresaId}`);
                const counterSnap = await getDoc(counterRef);
                const lastUsed = counterSnap.exists() ? counterSnap.data()['lastUsed'] : 199;
                contadorPorTipo[tipo] = lastUsed + 1;
            }

            const nuevo = contadorPorTipo[tipo];
            const nuevoENCF = `E${tipo}${String(nuevo).padStart(10, '0')}`;
            contadorPorTipo[tipo] = nuevo + 1;

            // Guardar para uso posterior
            nuevoENCFs[docId] = nuevoENCF;
            fechasPorTipo[tipo] = data['FechaEmision'] || '01-01-2020';
            docsPorId[docId] = { ref: docSnap.ref, tipo, data };

            // Guardar contador
            const contadorRef = doc(this.firestore, `encf_counters/${tipo}_${empresaId}`);
            batch.set(contadorRef, {
                tipo,
                empresaId,
                lastUsed: contadorPorTipo[tipo] - 1
            });
        }

        // FASE 2: aplicar updates reales (ya teniendo los ENCFs generados)
        for (const docId in docsPorId) {
            const { ref, tipo, data } = docsPorId[docId];
            const nuevoENCF = nuevoENCFs[docId];

            const updateData: any = {
                ENCF: nuevoENCF,
                RazonSocialEmisor: razonSocial,
                estatus: deleteField(),
                trackId: deleteField(),
                xmlPublicUrl: deleteField(),
                CasoPrueba: `${empresaId}${nuevoENCF}`
            };

            // Si es tipo 34, vincular a nueva tipo 46
            if (tipo === '34') {
                const factura46 = Object.entries(docsPorId).find(([_, val]) => val.tipo === '46');
                if (factura46) {
                    const [id46] = factura46;
                    updateData.NCFModificado = nuevoENCFs[id46];
                    updateData.FechaNCFModificado = fechasPorTipo['46'] || '01-01-2020';
                    updateData.CodigoModificacion = data['CodigoModificacion'] || '2';
                    updateData.RazonModificacion = data['RazonModificacion'] || 'Error en datos';
                }
            }

            batch.update(ref, updateData);
        }

        await batch.commit();
        console.log('✅ Reset completo. ENCFs actualizados y referencias tipo 34 corregidas.');
    }


}
