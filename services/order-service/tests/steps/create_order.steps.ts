import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'expect'; // Usando expect do jest/expect standalone
import { Order } from '../../src/domain/entities/Order';
import { ShippingStrategyFactory } from '../../src/domain/factories/ShippingStrategyFactory';

let order: Order;
let cost: number;

Given('I have an order with weight {int} kg and distance {int} km', function (weight: number, distance: number) {
  order = new Order('1', 'customer', weight, distance, '', ['item1']);
});

When('I select {string} shipping', function (shippingType: string) {
  const strategy = ShippingStrategyFactory.create(shippingType);
  cost = strategy.calculate(order);
});

Then('the shipping cost should be {int}', function (expectedCost: number) {
  expect(cost).toBe(expectedCost);
});
