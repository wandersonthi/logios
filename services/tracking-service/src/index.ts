import express from 'express';
import cors from 'cors';
import { TrackingController } from './presentation/controllers/TrackingController';

const app = express();
app.use(cors());
app.use(express.json());

const trackingController = new TrackingController();

app.post('/tracking', (req, res) => trackingController.update(req, res));
app.get('/tracking/:orderId', (req, res) => trackingController.getByOrderId(req, res));
app.get('/tracking', (req, res) => trackingController.getAll(req, res));

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Tracking Service is running on port ${PORT}`);
});
