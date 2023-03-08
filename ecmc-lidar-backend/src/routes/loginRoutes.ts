import { Router } from 'express';
import { loginController } from '../controllers/loginController';

class LoginRoutes {
    public router: Router = Router();
    constructor() {
        this.config();  
    }
    config(): void {
        let URI = '/ecmc_lidar';
        this.router.post(`${URI}/login`, loginController.login);
        this.router.get(`${URI}/user/`, loginController.verifyToken, loginController.list);
        this.router.get(`${URI}/user/:id`, loginController.verifyToken, loginController.get);
        this.router.post(`${URI}/user/`, loginController.verifyToken, loginController.add);
        this.router.put(`${URI}/user/:id`, loginController.verifyToken, loginController.upd);
        this.router.delete(`${URI}/user/:id`, loginController.verifyToken, loginController.del);
    }
}

const loginRoutes = new LoginRoutes();
export default loginRoutes.router;