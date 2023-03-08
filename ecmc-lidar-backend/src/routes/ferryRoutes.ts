import { Router } from 'express';
import { ferryController } from '../controllers/ferryController';

class FerryRoutes {
    public router: Router = Router();
    constructor() {
        this.config();  
    }
    config(): void {
        let URI = '/ecmc_lidar';
        this.router.get(`${URI}/ferry`, ferryController.list);
    }
}

const ferryRoutes = new FerryRoutes();  
export default ferryRoutes.router;