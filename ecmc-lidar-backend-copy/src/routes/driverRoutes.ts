import { Router } from 'express';
import { driverController } from '../controllers/driverController';

class DriverRoutes {
    public router: Router = Router();
    constructor() {
        this.config();  
    }
    config(): void {
        let URI = '/ecmc_lidar';
        this.router.get(`${URI}/driver`, driverController.list);
        this.router.get(`${URI}/driver/:RUT`,  driverController.get);
        this.router.post(`${URI}/driver/`,  driverController.add);
        this.router.put(`${URI}/driver/:RUT`,  driverController.upd);
        this.router.delete(`${URI}/driver/:RUT`,  driverController.del);
    }
}

const driverRoutes = new DriverRoutes();  
export default driverRoutes.router;