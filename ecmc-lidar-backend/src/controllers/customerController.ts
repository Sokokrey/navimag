import { Request, Response } from 'express';
import Customer from '../models/customer';

class CustomerController {

    public async list(req: Request, res: Response): Promise<void> {
        await Customer.find({}, function(err: any, data: JSON[]) {
            res.json(data); 
        });
    }
    public async get(req: Request, res: Response): Promise<void> {  
        const { id } = req.params;
        await Customer.find( { _id: id } , function(err: any, data: any) {
            if (data)
                res.json(data);
            else
                res.status(404).json({ res: 'not found' });  
        });
    }
    public async add(req: Request, res: Response): Promise<void> {
        await Customer.create(req.body, function(err:any){
            if(err) throw err; 
            res.json({ res: 'ok' });
        });
    }
    public async upd(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        delete req.body._id
        await Customer.updateOne( { _id: id }, req.body, { upsert: true }, function(err: any){
            if(err) throw err;
            res.json({ res: 'ok' });
        });
    }
    public async del(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        await Customer.findOneAndRemove( { _id : id }, function (err: any){
            if(err) throw err; 
            res.json({ res: 'ok' });
        });
    }
}

export const customerController = new CustomerController();