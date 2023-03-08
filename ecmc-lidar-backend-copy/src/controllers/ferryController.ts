import { Request, Response } from 'express';
import Ferry from '../models/ferry';

class FerryController {
    
    public async list(req: Request, res: Response): Promise<void> {
        await Ferry.find({}, function(err: any, data: JSON[]) {
            res.json(data); 
        });
    }
}

export const ferryController = new FerryController();