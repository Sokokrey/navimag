import mongoose from "../database";

const Ferry_DeckSchema = new mongoose.Schema({
    name: { type: String, requires: true },
    max_height: { type: Number, requires: true }
});

export default mongoose.model('ferry_deck', Ferry_DeckSchema);