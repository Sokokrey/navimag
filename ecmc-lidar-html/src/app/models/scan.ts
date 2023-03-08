export interface Scan {
    _id?: string;
    patente?: string;
    patente2?: string;
    nro_reserva?: Number;
    nro_recepcion?: string;
    alto?: Number;
    largo?: Number;
    ancho?: Number;
    peso?: Number;
    volumen?: Number;
    fecha?: Date;
    hora?: string;
    travel?: Object;
    deck_assign?: Object;
    condicionales?: Array<string>;
    driver?: Object;
    tipo_carga? : string;
    carga? : string;
    categoria_carga? : string;
    dice_tener?: string;
    carga_peligrosa?: boolean;
    repuesto_neumatico?: Object;
    customer?: Object;
    observaciones?: Object;
    medidas?: Object;
    configuracion: Object;
    user : string;
 }