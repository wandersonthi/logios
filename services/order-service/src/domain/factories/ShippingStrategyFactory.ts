import { ShippingStrategy, StandardShippingStrategy, ExpressShippingStrategy } from '../strategies/ShippingStrategy';

export class ShippingStrategyFactory {
  static create(type: string): ShippingStrategy {
    switch (type.toLowerCase()) {
      case 'standard':
        return new StandardShippingStrategy();
      case 'express':
        return new ExpressShippingStrategy();
      default:
        throw new Error(`Shipping type ${type} is not supported.`);
    }
  }
}
