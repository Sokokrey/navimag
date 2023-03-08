import mongoose from "../database";

const LoadCategorySchema = new mongoose.Schema({
    name: { type: String, requires: true }
});

export default mongoose.model('load_category', LoadCategorySchema, 'load_category');