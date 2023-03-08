import mongoose from "../database";

const LoadTypeSchema = new mongoose.Schema({
    name: { type: String, requires: true },
    loads: { type: Array, requires: true },
    category: { type: String, requires: true }
});

export default mongoose.model('load_type', LoadTypeSchema, 'load_type');