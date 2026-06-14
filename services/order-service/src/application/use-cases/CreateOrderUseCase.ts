import { Order } from '../../domain/entities/Order';
import { IOrderRepository } from '../repositories/IOrderRepository';
import { ShippingStrategyFactory } from '../../domain/factories/ShippingStrategyFactory';

export class CreateOrderUseCase {
  // Dependency Inversion Principle (DIP): Depende de abstração, não de implementação
  constructor(private orderRepository: IOrderRepository) {}

  async execute(input: {
    id: string;
    customerId: string;
    weight: number;
    distance: number;
    shippingType: string;
    items: string[];
  }): Promise<{ orderId: string; shippingCost: number }> {
    
    // 1. Cria a entidade Order
    const order = new Order(
      input.id,
      input.customerId,
      input.weight,
      input.distance,
      input.shippingType,
      input.items
    );

    // 2. Calcula o frete usando Factory e Strategy
    const strategy = ShippingStrategyFactory.create(input.shippingType);
    const shippingCost = strategy.calculate(order);

    // 3. Salva no banco de dados via repositório
    await this.orderRepository.save(order);

    return {
      orderId: order.id,
      shippingCost,
    };
  }
}
