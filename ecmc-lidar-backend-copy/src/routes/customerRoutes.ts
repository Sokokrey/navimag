import { Router } from 'express';
import { customerController } from '../controllers/customerController';

class CustomerRoutes {
    public router: Router = Router();
    constructor() {
        this.config();  
    }
    config(): void {
        let URI = '/ecmc_lidar';
        this.router.get(`${URI}/customer`, customerController.list);
        this.router.get(`${URI}/customer/:id`,  customerController.get);
        this.router.post(`${URI}/customer/`,  customerController.add);
        this.router.put(`${URI}/customer/:id`,  customerController.upd);
        this.router.delete(`${URI}/customer/:id`,  customerController.del);
    }
}

const customerRoutes = new CustomerRoutes();  
export default customerRoutes.router;