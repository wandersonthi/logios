import { Order } from '../../domain/entities/Order';

// Interface Segregation Principle (ISP): Podemos ter IOrderWriter e IOrderReader, mas para simplificar:
export interface IOrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
}
