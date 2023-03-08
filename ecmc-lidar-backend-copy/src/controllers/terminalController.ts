import { Request, Response } from 'express';
import Terminal from '../models/terminal';

class TerminalController {
    
    public async list(req: Request, res: Response): Promise<void> {
        await Terminal.find({}, function(err: any, data: JSON[]) {
            res.json(data); 
        });
    }
}

export const terminalController = new TerminalController();