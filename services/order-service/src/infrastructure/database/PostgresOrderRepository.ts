import { Pool } from 'pg';
import { IOrderRepository } from '../../application/repositories/IOrderRepository';
import { Order } from '../../domain/entities/Order';

export class PostgresOrderRepository implements IOrderRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgres://logios_user:logios_password@localhost:5432/logios_db',
    });
    this.initializeTable();
  }

  private async initializeTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(255) PRIMARY KEY,
        customer_id VARCHAR(255) NOT NULL,
        weight DECIMAL NOT NULL,
        distance DECIMAL NOT NULL,
        shipping_type VARCHAR(50) NOT NULL,
        items JSONB NOT NULL
      );
    `;
    await this.pool.query(query);
  }

  async save(order: Order): Promise<void> {
    const query = `
      INSERT INTO orders (id, customer_id, weight, distance, shipping_type, items)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await this.pool.query(query, [
      order.id,
      order.customerId,
      order.weight,
      order.distance,
      order.shippingType,
      JSON.stringify(order.items),
    ]);
  }

  async findById(id: string): Promise<Order | null> {
    const query = 'SELECT * FROM orders WHERE id = $1';
    const result = await this.pool.query(query, [id]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return new Order(
      row.id,
      row.customer_id,
      parseFloat(row.weight),
      parseFloat(row.distance),
      row.shipping_type,
      row.items
    );
  }
}
