import mongoose from "../database";

const LoginSchema = new mongoose.Schema({
    user: {type: String, requires:false},
    email: {type: String, requires:false},
    password: {type: String, requires:true},
    name: {type: String, requires:true},
    category: {type: Number, requires:true},
    token: {type: String, requires:true}
});

export default mongoose.model('login', LoginSchema, 'login');