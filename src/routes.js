import { Router } from 'express';
import multer from 'multer';

import SessionController from './app/controllers/SessionController';
import RecipientController from './app/controllers/RecipientController';
import FileController from './app/controllers/FileController';
import DeliverymanController from './app/controllers/DeliverymanController';
import PackageController from './app/controllers/PackageController';
import DispatchController from './app/controllers/DispatchController';
import DeliveryController from './app/controllers/DeliveryController';
import WithdrawalController from './app/controllers/WithdrawalController';
import DeliveryProblemController from './app/controllers/DeliveryProblemController';
import ProblemPackageController from './app/controllers/ProblemPackageController';

import Middleware from './app/middleware/auth';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

// rotas que não precisam de autenticação
routes.post('/sessions', SessionController.store);

routes.get('/deliveryman/:id/dispatches', DispatchController.index);

routes.post('/package/:pack_id/delivered', DeliveryController.store);
routes.get('/deliveryman/:id/deliveries', DeliveryController.index);

routes.post('/withdrawals/:pack_id', WithdrawalController.store);

routes.post('/delivery/:pack_id/problems', DeliveryProblemController.store);

// rotas que precisam de autenticação
routes.use(Middleware);

routes.post('/recipients', RecipientController.store);
routes.put('/recipients', RecipientController.update);

routes.post('/files', upload.single('file'), FileController.store);

routes.post('/deliverypeople', DeliverymanController.store);
routes.get('/deliverypeople', DeliverymanController.index);
routes.put('/deliverypeople/:id', DeliverymanController.update);
routes.delete('/deliverypeople/:id', DeliverymanController.delete);

routes.post('/packages', PackageController.store);
routes.get('/packages', PackageController.index);
routes.put('/packages/:id', PackageController.update);
routes.delete('/packages/:id', PackageController.delete);

routes.get('/delivery/:pack_id/problems', DeliveryProblemController.index);

routes.delete('/problems/:pack_id/delivery-cancel', DispatchController.delete);

routes.get('/problems/packages', ProblemPackageController.index);

export default routes;
