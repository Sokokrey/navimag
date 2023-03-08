import mongoose from "../database";

const DriverSchema = new mongoose.Schema({
    name: { type: String, requires: true },
    RUT: { type: String, requires: true }
},{
    versionKey: false
});

export default mongoose.model('driver', DriverSchema, 'driver');