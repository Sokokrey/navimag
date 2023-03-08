import { Router } from 'express';
import { terminalController } from '../controllers/terminalController';

class TerminalRoutes {
    public router: Router = Router();
    constructor() {
        this.config();  
    }
    config(): void {
        let URI = '/ecmc_lidar';
        this.router.get(`${URI}/terminal`, terminalController.list);
    }
}

const terminalRoutes = new TerminalRoutes();  
export default terminalRoutes.router;