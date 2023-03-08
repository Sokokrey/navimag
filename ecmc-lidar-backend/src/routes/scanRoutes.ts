import { Router } from 'express';
import { scanController } from '../controllers/scanController';

class ScanRoutes {
    public router: Router = Router();
    constructor() {
        this.config();  
    }
    config(): void {
        let URI = '/ecmc_lidar';
        this.router.get(`${URI}/scan/dimension/:dimension`, scanController.scan);
        this.router.get(`${URI}/scan/historic`, scanController.getHistoric);
        this.router.get(`${URI}/scan/historic/:scan_id`, scanController.getOneHistoric);
        this.router.get(`${URI}/scan/historic_range/:fecha_ini/:fecha_fin`, scanController.getHistoricbyrange);
        this.router.get(`${URI}/scan/historic_travel/:travel`, scanController.getHistoricbytravel);
        this.router.get(`${URI}/scan/sensor_status`, scanController.getSensorStatus);
        this.router.get(`${URI}/scan/last_scan/`, scanController.getLastScanInfo);
        this.router.post(`${URI}/scan`, scanController.save);
        this.router.put(`${URI}/scan/assign_deck/:id`, scanController.assignDeck);
        this.router.delete(`${URI}/scan/:id`,  scanController.del);
        this.router.put(`${URI}/scan/change_travel/:id`,  scanController.changeScanTravel);
        

        this.router.get(`${URI}/scan_camera/:scan_id`, scanController.scanCamera);
        this.router.get(`${URI}/sensor/status/`, scanController.getsensorflag);
        this.router.put(`${URI}/sensor/change_status/:name`, scanController.putsensorflag);
    }
}

const scanRoutes = new ScanRoutes();  
export default scanRoutes.router;