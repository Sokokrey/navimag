import { Request, Response } from 'express';
import Login from '../models/login';
import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

class LoginController {

    public async list(req: Request, res: Response): Promise<void> {
        await Login.find({}, function(err: any, data: JSON[]) {
            res.json(data); 
        });
    }
    public async get(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        await Login.find( { _id: id } , function(err: any, data: any) {
            if (data)
                res.json(data);
            else
                res.status(404).json({ res: 'not found' });  
        });
    }
    public async add(req: Request, res: Response): Promise<void> {
        req.body.password = bcrypt.hashSync(req.body.password, 10);
        try{
            await Login.create(req.body, function(err:any){
                if(err) throw err; 
                res.json({ res: 'ok' });
            });
        } catch(e){
            res.json({ res: 'ok' });
        }
    }
    public async upd(req: Request, res: Response): Promise<void> {
        const { id } = req.params;

        delete req.body._id
        req.body.password = bcrypt.hashSync(req.body.password, 10);
        await Login.updateOne( { _id: id }, req.body, { upsert: true }, function(err: any){
            if(err) throw err;
            res.json({ res: 'ok' });
        });
    }
    public async del(req: Request, res: Response): Promise<void> {
        const {  id } = req.params;
        await Login.findOneAndRemove( { _id : id }, function (err: any){
            if(err) throw err; 
            res.json({ res: 'ok' });
        });
    }
    public verifyToken(req:any, res:any, next:any) {
        if (!req.headers.autorization) 
            res.status(401).send('Unauthorized request');

        let token = req.headers.autorization.split(' ')[1]
        if (token === 'null') 
            res.status(401).send('Unauthorized request');

        let payload = jwt.verify(token, 'secretKey');
        if (!payload)
            res.status(401).send('Unauthorized request');
    
        req.userID = payload.toString;
        next();
    }
    public async login(req: Request, res: Response) {
        let userData = req.body;
        Login.find( { user: userData.user } , async function(err: any, data: any){
            if (data.length){
                bcrypt.compare(userData.password, data[0].password, function(err: any, resp:boolean) {
                    if(resp) {
                        let payload = { subject: userData.user };
                        let token = jwt.sign(payload, 'secretKey');
                        let LoginData = {
                            user:data[0].user,
                            password:data[0].password,
                            name:data[0].name,
                            category:data[0].category,
                            token:token
                        };
                        res.json(LoginData);
                    } else
                        res.status(401).send('401 contraseña inválida');
                });
                return;  
            } else 
                res.status(404).send('404 user not found');  
        }); 
    }
}

export const loginController = new LoginController();