import { Order } from '../../src/domain/entities/Order';
import { ShippingStrategyFactory } from '../../src/domain/factories/ShippingStrategyFactory';

describe('Shipping Strategy and Factory (TDD)', () => {
  it('should calculate standard shipping correctly', () => {
    const order = new Order('1', 'cust1', 10, 100, 'standard', ['item1']);
    const strategy = ShippingStrategyFactory.create('standard');
    // R$ 10 + (100 * 0.5) + (10 * 2) = 10 + 50 + 20 = 80
    expect(strategy.calculate(order)).toBe(80);
  });

  it('should calculate express shipping correctly', () => {
    const order = new Order('2', 'cust2', 10, 100, 'express', ['item2']);
    const strategy = ShippingStrategyFactory.create('express');
    // R$ 20 + (100 * 1.0) + (10 * 5) = 20 + 100 + 50 = 170
    expect(strategy.calculate(order)).toBe(170);
  });

  it('should throw an error for unsupported shipping type', () => {
    expect(() => {
      ShippingStrategyFactory.create('drone');
    }).toThrow('Shipping type drone is not supported.');
  });
});
