import { Router } from 'express';
import { diceTenerController } from '../controllers/diceTenerController';

class DiceTenerRoutes {
    public router: Router = Router();
    constructor() {
        this.config();  
    }
    config(): void {
        let URI = '/ecmc_lidar';
        this.router.get(`${URI}/dice_tener`, diceTenerController.list);
        this.router.get(`${URI}/dice_tener/:id`,  diceTenerController.get);
        this.router.post(`${URI}/dice_tener/`,  diceTenerController.add);
        this.router.put(`${URI}/dice_tener/:id`,  diceTenerController.upd);
        this.router.delete(`${URI}/dice_tener/:id`,  diceTenerController.del);
    }
}

const diceTenerRoutes = new DiceTenerRoutes();  
export default diceTenerRoutes.router;