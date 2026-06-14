import { Order } from '../entities/Order';

export interface ShippingStrategy {
  calculate(order: Order): number;
}

export class StandardShippingStrategy implements ShippingStrategy {
  calculate(order: Order): number {
    // R$ 10 fixo + 0.5 por km + 2 por kg
    return 10 + (order.distance * 0.5) + (order.weight * 2);
  }
}

export class ExpressShippingStrategy implements ShippingStrategy {
  calculate(order: Order): number {
    // R$ 20 fixo + 1.0 por km + 5 por kg
    return 20 + (order.distance * 1.0) + (order.weight * 5);
  }
}
