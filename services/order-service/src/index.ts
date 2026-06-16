import express from 'express';
import cors from 'cors';
import { OrderController } from './presentation/controllers/OrderController';
import { AuthController } from './presentation/controllers/AuthController';
import { UserController } from './presentation/controllers/UserController';

const app = express();
app.use(cors());
app.use(express.json());

const orderController = new OrderController();
const authController = new AuthController();
const userController = new UserController();

app.post('/orders', (req, res) => orderController.create(req, res));
app.get('/orders', (req, res) => orderController.getAll(req, res));
app.get('/orders/export', (req, res) => orderController.exportBackup(req, res));
app.delete('/orders/clear', (req, res) => orderController.clearDatabase(req, res));
app.get('/audit', (req, res) => orderController.getAuditLogs(req, res));
app.post('/audit', (req, res) => orderController.addAuditLog(req, res));
app.post('/login', (req, res) => authController.login(req, res));
app.get('/users', (req, res) => userController.getAll(req, res));
app.post('/users', (req, res) => userController.create(req, res));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Order Service is running on port ${PORT}`);
});
