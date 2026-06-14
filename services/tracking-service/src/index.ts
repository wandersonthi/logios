import express from 'express';
import { TrackingController } from './presentation/controllers/TrackingController';

const app = express();
app.use(express.json());

const trackingController = new TrackingController();

app.post('/tracking', (req, res) => trackingController.update(req, res));
app.get('/tracking/:orderId', (req, res) => trackingController.get(req, res));

const PORT = process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`Tracking Service is running on port ${PORT}`);
});
