import express, { Application } from 'express';
import request from 'request';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';

import loginRoutes from './routes/loginRoutes';
import scanRoutes from './routes/scanRoutes';
import ferryRoutes from './routes/ferryRoutes';
import terminalRoutes from './routes/terminalRoutes';
import driverRoutes from './routes/driverRoutes';
import customerRoutes from './routes/customerRoutes';
import loadTypeRoutes from './routes/loadTypeRoutes';
import loadCategoryRoutes from './routes/loadCategoryRoutes';
import diceTenerRoutes from './routes/diceTenerRoutes';
import travelRoutes from './routes/travelRoutes';


import Sensor from './models/sensor';
 
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import './broker'

class Server{

    app: Application;
    privateKey: any;
    certificate: any;
    credentials: any;
    use_https: boolean = false;

    constructor() {
        this.app = express();
        this.config();
        this.routes();
    }

    config() : void{
        this.app.use(morgan('dev'));
        this.app.use(helmet());
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
       
        
        let crtPath='../data'; // '/etc/letsencrypt/live/apps.saut.cl';
        let keyFile='privkey.pem';
        let crtFile='cert.crt';
        let key=path.resolve(__dirname, `${crtPath}/${keyFile}`);
        let crt=path.resolve(__dirname, `${crtPath}/${crtFile}`);
        if (this.use_https) {  
            this.privateKey = fs.readFileSync(key, 'utf8').toString();
            this.certificate = fs.readFileSync(crt, 'utf8').toString();
            this.credentials = { key: this.privateKey, cert: this.certificate };
        }
    }

    routes() : void{
        this.app.use(loginRoutes);
        this.app.use(scanRoutes);
        this.app.use(ferryRoutes);
        this.app.use(terminalRoutes);
        this.app.use(driverRoutes);
        this.app.use(customerRoutes);
        this.app.use(loadTypeRoutes);
        this.app.use(loadCategoryRoutes);
        this.app.use(diceTenerRoutes);
        this.app.use(travelRoutes);
    }

    async start() : Promise<void>{
        if (this.use_https) {
            var httpsServer = https.createServer(this.credentials, this.app);
            httpsServer.listen(8443);
        }
        var httpServer = http.createServer(this.app);
        httpServer.listen(8000); 

        //Para ocaciones en que se apague la luz por ejemplo//
        let flag:any= await Sensor.find({})
        await Sensor.updateOne({name:flag[0].name}, {flag:0},{ upsert: true })
    }
}

const server = new Server();
server.start();