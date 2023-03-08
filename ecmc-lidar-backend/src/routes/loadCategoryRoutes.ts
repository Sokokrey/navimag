import { Router } from 'express';
import { loadCategoryController } from '../controllers/loadCategoryController';

class LoadCategoryRoutes {
    public router: Router = Router();
    constructor() {
        this.config();  
    }
    config(): void {
        let URI = '/ecmc_lidar';
        this.router.get(`${URI}/load_category`, loadCategoryController.list);
        this.router.get(`${URI}/load_category/:_id`,  loadCategoryController.get);
        this.router.post(`${URI}/load_category/`,  loadCategoryController.add);
        this.router.put(`${URI}/load_category/:_id`,  loadCategoryController.upd);
        this.router.delete(`${URI}/load_category/:_id`,   loadCategoryController.del);
    }
}

const loadCategoryRoutes = new LoadCategoryRoutes();  
export default loadCategoryRoutes.router;