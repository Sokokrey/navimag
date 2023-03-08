import { Request, Response } from 'express';
import Dice_tener from '../models/dice_tener';

class DiceTenerController {

    public async list(req: Request, res: Response): Promise<void> {
        await Dice_tener.find({}).sort({ name: 1}).exec(function(err: any, data: JSON[]) {
            res.json(data); 
        });
    }
    public async get(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        await Dice_tener.find( { id: id } , function(err: any, data: any) {
            if (data)
                res.json(data);
            else
                res.status(404).json({ res: 'not found' });  
        });
    }
    public async add(req: Request, res: Response): Promise<void> {
        await Dice_tener.create(req.body, function(err:any){
            if(err) throw err; 
            res.json({ res: 'ok' });
        });
    }
    public async upd(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        await Dice_tener.update( { _id: id }, req.body, { upsert: true }, function(err: any){
            if(err) throw err;
            res.json({ res: 'ok' });
        });
    }
    public async del(req: Request, res: Response): Promise<void> {
        const { id } = req.params;
        await Dice_tener.findOneAndRemove( { _id : id }, function (err: any){
            if(err) throw err; 
            res.json({ res: 'ok' });
        });
    }
}

export const diceTenerController = new DiceTenerController();