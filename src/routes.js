import { Router } from 'express';
import multer from 'multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import PackageController from './app/controllers/PackageController';

import Middleware from './app/middleware/auth';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);
routes.get('/packages/:id/deliveryman', PackageController.index);

routes.use(Middleware);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients', RecipientController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/deliverypeople', DeliverymanController.store);
routes.get('/deliverypeople', DeliverymanController.index);
routes.put('/deliverypeople/:id', DeliverymanController.update);
routes.delete('/deliverypeople/:id', DeliverymanController.delete);

routes.post('/packages', PackageController.store);

export default routes;
