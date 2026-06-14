import { Tracking } from '../../domain/entities/Tracking';
import { ITrackingRepository } from '../repositories/ITrackingRepository';

export class GetTrackingUseCase {
  constructor(private trackingRepository: ITrackingRepository) {}

  async execute(orderId: string): Promise<Tracking | null> {
    return this.trackingRepository.findByOrderId(orderId);
  }
}
