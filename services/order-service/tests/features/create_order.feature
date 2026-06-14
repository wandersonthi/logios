Feature: Create Order and Calculate Shipping
  As a customer
  I want to create an order and choose a shipping type
  So that I know how much the shipping will cost

  Scenario: Standard Shipping Calculation
    Given I have an order with weight 10 kg and distance 100 km
    When I select "standard" shipping
    Then the shipping cost should be 80

  Scenario: Express Shipping Calculation
    Given I have an order with weight 10 kg and distance 100 km
    When I select "express" shipping
    Then the shipping cost should be 170
