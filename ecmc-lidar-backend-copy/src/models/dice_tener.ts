import mongoose from "../database";

const DiceTenerSchema = new mongoose.Schema({
    name: { type: String, requires: true }
});

export default mongoose.model('dice_tener', DiceTenerSchema, 'dice_tener');