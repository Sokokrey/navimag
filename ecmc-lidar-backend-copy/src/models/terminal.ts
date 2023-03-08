import mongoose from "../database";

const TerminalSchema = new mongoose.Schema({
    name: {type: String, requires:true}
});

export default mongoose.model('terminal', TerminalSchema, 'terminal');