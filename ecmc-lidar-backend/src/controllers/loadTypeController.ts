import { Request, Response } from 'express';
import LoadType from '../models/load_type';

class LoadTypeController {

    public async list(req: Request, res: Response): Promise<void> {
        await LoadType.aggregate([{ $sort : { name : 1 } } ], function(err:any, data: JSON[]){
            res.json(data); 
        });  
    }

    public async get(req: Request, res: Response): Promise<void> {
        const { _id } = req.params;
        await LoadType.find( { _id: _id } , function(err: any, data: any) {
            if (data)
                res.json(data);
            else
                res.status(404).json({ res: 'not found' });  
        });
    }

    public async add(req: Request, res: Response): Promise<void> {
        await LoadType.create(req.body, function(err:any){
            if(err) throw err; 
            res.json({ res: 'ok' });
        });
    }

    public async upd(req: Request, res: Response): Promise<void> {
        const { _id } = req.params;
        await LoadType.updateOne( { _id: _id }, req.body, { upsert: true }, function(err: any){
            if(err) throw err;
            res.json({ res: 'ok' });
        });
    }

    public async del(req: Request, res: Response): Promise<void> {
        const { _id } = req.params;
        
        await LoadType.findOneAndRemove( { _id : _id }, function (err: any){
            if(err) throw err; 
            res.json({ res: 'ok' });
        });
    }

    public async addLoad(req: Request, res: Response): Promise<void> {
        const { load_type_id } = req.params;
        await LoadType.findByIdAndUpdate( load_type_id, { $addToSet : { loads : req.body} }, function(err:any){
            if(err) throw err; 
            res.json({ res: 'ok' });
        });
    }

    public async delLoad(req: Request, res: Response): Promise<void> {
        const { load_type_id } = req.params;
        await LoadType.updateOne( { _id : load_type_id },
                                  { $pull : { loads : { name : req.body.name } } }, { justOne : true }, function (err: any, data:any){
            if(err) { throw err; } 
            res.json({ res: 'ok' });    
        }); 
    }
}

export const loadTypeController = new LoadTypeController();