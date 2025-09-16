export interface ClientesModel {
    status: string;
    code: number;
    message: string;
    data: ClientesDataModel[];
}

export interface ClientesDataModel {
    f_idcliente: number;
    f_idinterno: number;
    f_rnc_principal: string;
    f_email_principal: string;
    f_fecha_creacion: Date;
    f_app: number;
    f_usuario: number;
    f_sucursal: number;
    f_tipo_cliente: number;
    f_rnc_cliente: string;
    f_nombre_cliente: string;
    f_telefono: string;
    f_email_secundario: string;
    f_seguimiento_piezas: string;
}
