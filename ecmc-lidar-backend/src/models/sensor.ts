import mongoose from "../database";

const SensorSchema = new mongoose.Schema({
    flag: {type: Number, requires:true},
    name: {type: String, requires:true}
},{
    versionKey: false
});

export default mongoose.model('sensor', SensorSchema, 'sensor');