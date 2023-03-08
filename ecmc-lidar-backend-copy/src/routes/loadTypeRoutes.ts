import { Router } from 'express';
import { loadTypeController } from '../controllers/loadTypeController';

class LoadTypeRoutes {
    public router: Router = Router();
    constructor() {
        this.config();  
    }
    
    config(): void {
        let URI = '/ecmc_lidar';
        this.router.get(`${URI}/load_type`, loadTypeController.list);
        this.router.get(`${URI}/load_type/:_id`,  loadTypeController.get);
        this.router.post(`${URI}/load_type/`,  loadTypeController.add);
        this.router.put(`${URI}/load_type/:_id`,  loadTypeController.upd);
        this.router.delete(`${URI}/load_type/:_id`,  loadTypeController.del);
        this.router.post(`${URI}/load_type/load/:load_type_id`,  loadTypeController.addLoad);
        this.router.put(`${URI}/load_type/load/:load_type_id`,  loadTypeController.delLoad);
    }
}

const loadTypeRoutes = new LoadTypeRoutes();  
export default loadTypeRoutes.router;