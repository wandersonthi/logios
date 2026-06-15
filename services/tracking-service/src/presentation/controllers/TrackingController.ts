import { Request, Response } from 'express';
import { UpdateTrackingUseCase } from '../../application/use-cases/UpdateTrackingUseCase';
import { GetTrackingUseCase } from '../../application/use-cases/GetTrackingUseCase';
import { PostgresTrackingRepository } from '../../infrastructure/database/PostgresTrackingRepository';
import { TrackingSubject, EmailNotificationObserver } from '../../domain/events/Observer';

export class TrackingController {
  private repository: PostgresTrackingRepository;
  private subject: TrackingSubject;
  private updateUseCase: UpdateTrackingUseCase;
  private getUseCase: GetTrackingUseCase;

  constructor() {
    this.repository = new PostgresTrackingRepository();
    this.subject = new TrackingSubject();
    this.subject.attach(new EmailNotificationObserver());
    
    this.updateUseCase = new UpdateTrackingUseCase(this.repository, this.subject);
    this.getUseCase = new GetTrackingUseCase(this.repository);
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      await this.updateUseCase.execute(req.body);
      res.status(200).json({ message: 'Tracking updated successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getByOrderId(req: Request, res: Response): Promise<void> {
    try {
      const repository = new PostgresTrackingRepository();
      const tracking = await repository.findByOrderId(req.params.orderId);
      if (!tracking) {
        res.status(404).json({ message: 'Tracking not found' });
        return;
      }
      res.status(200).json(tracking);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const repository = new PostgresTrackingRepository();
      const trackings = await repository.findAll();
      res.status(200).json(trackings);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
