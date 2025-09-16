export interface OrderModel {
    f_idservicio: number;
    f_rnc_principal: string;
    f_email_principal: string;
    f_fecha_creacion: Date;
    f_fecha: Date;
    f_monto: number;
    f_itbis: number;
    f_monto_base: number;
    f_monto_subtotal: number;
    f_monto_bruto: number;
    f_forma_pago: string;
    f_tipo_ncf: string;
    f_cliente: string;
    f_cliente_rnc: string;
    f_cliente_nombre: string;
    f_cliente_email: string;
    f_cliente_telefono: string;
    f_ticket_cantidad_pieza: number;
    f_ticket: string;
    f_fecha_entrega: string;
    f_hora_entrega: string;
    detalles: Array<{
        f_descripcion_producto: string;
        f_cantidad: number;
        f_precio_unitario: number;
        f_precio_total: number;
        f_cargos_adicionales: string;
        f_unidad?: string;
        f_color?: string;
        f_color_hex?: string;
    }>;
}
