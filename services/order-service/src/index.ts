import express from 'express';
import cors from 'cors';
import { OrderController } from './presentation/controllers/OrderController';

const app = express();
app.use(cors());
app.use(express.json());

const orderController = new OrderController();

app.post('/orders', (req, res) => orderController.create(req, res));
app.get('/orders', (req, res) => orderController.getAll(req, res));
app.get('/audit', (req, res) => orderController.getAuditLogs(req, res));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Order Service is running on port ${PORT}`);
});
