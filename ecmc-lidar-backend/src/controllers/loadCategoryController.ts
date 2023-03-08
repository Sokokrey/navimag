import { Request, Response } from 'express';
import LoadCategory from '../models/load_category';

class LoadCategoryController {

    public async list(req: Request, res: Response): Promise<void> {
        await LoadCategory.find({}, function(err: any, data: JSON[]) {
            res.json(data); 
        });
    }
    public async get(req: Request, res: Response): Promise<void> {
        const { RUT } = req.params;
        await LoadCategory.find( { name: name } , function(err: any, data: any) {
            if (data)
                res.json(data);
            else
                res.status(404).json({ res: 'not found' });  
        });
    }
    public async add(req: Request, res: Response): Promise<void> {
        await LoadCategory.create(req.body, function(err:any){
            if(err) throw err; 
            res.json({ res: 'ok' });
        });
    }
    public async upd(req: Request, res: Response): Promise<void> {
        const { _id } = req.params;
        await LoadCategory.update( { _id : _id }, req.body, { upsert: true }, function(err: any){
            if(err) throw err;
            res.json({ res: 'ok' });
        });
    }
    public async del(req: Request, res: Response): Promise<void> {
        const { _id } = req.params;
        await LoadCategory.findOneAndRemove( { _id : _id }, function (err: any){
            if(err) throw err; 
            res.json({ res: 'ok' });
        });
    }
}

export const loadCategoryController = new LoadCategoryController();