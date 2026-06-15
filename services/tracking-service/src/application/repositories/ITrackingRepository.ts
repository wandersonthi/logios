import { Tracking } from '../../domain/entities/Tracking';

export interface ITrackingRepository {
  save(tracking: Tracking): Promise<void>;
  findByOrderId(orderId: string): Promise<Tracking | null>;
  findAll(): Promise<Tracking[]>;
}
