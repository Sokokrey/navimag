import mongoose from "../database";
import Ferry_Deck from "./ferry_deck";

const FerrySchema = new mongoose.Schema({
    name: { type: String, requires: true },
    max_height: { type: Number, requires: false },
    ferry_decks: { type: [Ferry_Deck.schema], requires: false },
    decks: { type: Array, requires: false }
});

export default mongoose.model('ferry', FerrySchema, 'ferry');