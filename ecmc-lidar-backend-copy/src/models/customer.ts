import mongoose from "../database";

const CustomerSchema = new mongoose.Schema({
    name: { type: String, requires: true },
    RUT: { type: String, requires: true }
});

export default mongoose.model('customer', CustomerSchema, 'customer');