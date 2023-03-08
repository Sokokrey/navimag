import { Request, Response } from 'express';
import Driver from '../models/driver';


class DriverController {

    public async list(req: Request, res: Response): Promise<void> {
        await Driver.find({}, function(err: any, data: JSON[]) {
            res.json(data); 
        });
    }
    public async get(req: Request, res: Response): Promise<void> {
        const { RUT } = req.params;
        await Driver.find( { RUT: RUT } , function(err: any, data: any) {
            if (data)
                res.json(data);
            else
                res.status(404).json({ res: 'not found' });  
        });
    }
    public async add(req: Request, res: Response): Promise<void> {
        await Driver.create(req.body, function(err:any){
            if(err) throw err; 
            res.json({ res: 'ok' });
        });
    }
    public async upd(req: Request, res: Response): Promise<void> {
        const { RUT } = req.params;
        await Driver.update( { RUT: RUT }, req.body, { upsert: true }, function(err: any){
            if(err) throw err;
            res.json({ res: 'ok' });
        });
    }
    public async del(req: Request, res: Response): Promise<void> {
        const { RUT } = req.params;
        await Driver.findOneAndRemove( { RUT : RUT }, function (err: any){
            if(err) throw err; 
            res.json({ res: 'ok' });
        });
    }
}

export const driverController = new DriverController();