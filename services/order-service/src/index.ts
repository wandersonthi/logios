import express from 'express';
import cors from 'cors';
import { OrderController } from './presentation/controllers/OrderController';

const app = express();
app.use(cors());
app.use(express.json());

const orderController = new OrderController();

app.post('/orders', (req, res) => orderController.create(req, res));

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Order Service is running on port ${PORT}`);
});
