import { Tracking } from '../../domain/entities/Tracking';
import { ITrackingRepository } from '../repositories/ITrackingRepository';
import { TrackingSubject } from '../../domain/events/Observer';

export class UpdateTrackingUseCase {
  constructor(
    private trackingRepository: ITrackingRepository,
    private subject: TrackingSubject
  ) {}

  async execute(input: { orderId: string; status: string; location: string }): Promise<void> {
    let tracking = await this.trackingRepository.findByOrderId(input.orderId);

    if (!tracking) {
      tracking = new Tracking(input.orderId, input.status, input.location, new Date());
    } else {
      tracking.update(input.status, input.location);
    }

    await this.trackingRepository.save(tracking);
    
    // Notifica os observadores sobre a atualização (Observer Pattern)
    this.subject.notify({ orderId: tracking.orderId, status: tracking.status, location: tracking.location });
  }
}
