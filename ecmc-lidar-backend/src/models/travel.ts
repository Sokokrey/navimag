import mongoose from "../database";

const TravelSchema = new mongoose.Schema({
    num: { type: Number, requires: true },
    ferry: { type: String, requires: true },
    fecha: { type: Date, requires: true },
    terminal_embarque: { type: String, requires: true },
    terminal_destino: { type: String, requires: true },
    zarpe: { type: Date, requires:true },
    embarked: { type: Boolean, requires:true },
    arrived: { type: Date, requires:false }
},{
    versionKey: false
});

export default mongoose.model('travel', TravelSchema, 'travel');