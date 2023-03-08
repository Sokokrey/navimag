import { Router } from 'express';
import { travelController } from '../controllers/travelController';

class TravelRoutes {
    public router: Router = Router();
    constructor() {
        this.config();  
    }
    config(): void {
        let URI = '/ecmc_lidar';
        this.router.get(`${URI}/travel`,  travelController.list);
        this.router.get(`${URI}/travel/:num`,  travelController.get);
        this.router.get(`${URI}/travel/scans/:travel`,  travelController.getTravelScans);
        this.router.get(`${URI}/travels/pendings/`,  travelController.getPendingTravels);
        this.router.get(`${URI}/travels/embarkeds/`,  travelController.getEmbarkedTravels);
        this.router.get(`${URI}/travel/ship_layout/:travel`,  travelController.getShipLayout);
        this.router.post(`${URI}/travel/`,  travelController.add);
        this.router.put(`${URI}/travel/:id`,  travelController.upd);
        this.router.delete(`${URI}/travel/:id`,  travelController.del);
        this.router.post(`${URI}/travel/embarcar/:num`,  travelController.embarcarCargas);
        this.router.post(`${URI}/travel/finish/:num`,  travelController.finishTravel);
    }
}

const travelRoutes = new TravelRoutes();  
export default travelRoutes.router;