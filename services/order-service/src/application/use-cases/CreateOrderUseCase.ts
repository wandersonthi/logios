import { Order } from '../../domain/entities/Order';
import { IOrderRepository } from '../repositories/IOrderRepository';
import { ShippingStrategyFactory } from '../../domain/factories/ShippingStrategyFactory';
import { OrderSubject, OrderAuditObserver } from '../../domain/events/OrderObserver';

export class CreateOrderUseCase {
  private subject: OrderSubject;

  constructor(private orderRepository: IOrderRepository) {
    this.subject = new OrderSubject();
    this.subject.attach(new OrderAuditObserver());
  }

  async execute(input: {
    id: string;
    customerId: string;
    weight: number;
    distance: number;
    shippingType: string;
    items: string[];
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    deliveryAddress?: string;
    cep?: string;
  }): Promise<{ orderId: string; shippingCost: number }> {
    
    const order = new Order(
      input.id,
      input.customerId,
      input.weight,
      input.distance,
      input.shippingType,
      input.items,
      input.customerName || '',
      input.customerPhone || '',
      input.customerEmail || '',
      input.deliveryAddress || '',
      input.cep || ''
    );

    const strategy = ShippingStrategyFactory.create(input.shippingType);
    const shippingCost = strategy.calculate(order);

    await this.orderRepository.save(order);

    // Observer: Notifica sobre a criação do pedido (Processando)
    this.subject.notify(order, 'Processando');

    return {
      orderId: order.id,
      shippingCost,
    };
  }
}
