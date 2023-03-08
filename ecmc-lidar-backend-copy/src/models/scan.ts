import mongoose from "../database";

const ScanSchema = new mongoose.Schema({
    nro_reserva: { type: Number, requires:false },
    condicionales: { type: Array, requires: true },
    nro_recepcion: { type: String, requires: true },
    driver: {
        name: { type: String, requires:false },
        RUT: { type: String, requires:false }
    },
    patente: { type: String, requires:true },
    patente2: { type: String, requires:false },
    tipo_carga: { type: String, requires:true },
    carga: { type: String, requires:true },
    categoria_carga: { type: String, requires:true },
    dice_tener: { type: String, requires: true },
    carga_peligrosa: { type: Boolean, requires: true },
    repuesto_neumatico: { 
        lleva: { type: Boolean, requires:true },
        cuantos: { type: Number, requires:false }
    },
    customer: {
        name: { type: String, requires:false },
        RUT: { type: String, requires:false }
    },
    travel: {
        num: { type: Number, requires:false },
        ferry: { type: String, requires:false },
        terminal_embarque: { type: String, requires:false },
        terminal_destino: { type: String, requires:false },
        zarpe: { type: Date, requires:false }
    },
    observaciones: {
        recepcion: { type: String, requires:false },
        destino: { type: String, requires:false }
    },
    medidas:{
        alto: { type: Number, requires:true },
        largo: { type: Number, requires:true },
        ancho: { type: Number, requires:true },
        volumen: { type: Number, requires:true },
        peso: { type: Number, requires:true }
    },
    fecha: { type: Date, requires:true },
    deck_assign: { type: Object, requires: false },
    configuracion: { type: {
            frecuencia : { type: Number, default: 0, requires:true },
            resolucion_angular : { type: Number, default: 0, requires:true},
            angulo_inicial : { type: Number, default: 0, requires:true },
            angulo_final : { type : Number, default: 0, requires:true },
            numero_serial : { type : Number, default: 0, requires:true },
            cantidad_datos : { type : Number, default: 0, requires:true }
        } , requires : true
    },
    arrived: { type: Date, requires:false },
    user : { type: String, requires: true }
},{
    versionKey: false
});

export default mongoose.model('scan', ScanSchema, 'scan');