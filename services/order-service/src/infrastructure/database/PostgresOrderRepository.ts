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
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address VARCHAR(255);
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS cep VARCHAR(20);
    `;
    await this.pool.query(query);
  }

  async save(order: Order): Promise<void> {
    const query = `
      INSERT INTO orders (id, customer_id, weight, distance, shipping_type, items, customer_name, customer_phone, customer_email, delivery_address, cep)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    `;
    await this.pool.query(query, [
      order.id,
      order.customerId,
      order.weight,
      order.distance,
      order.shippingType,
      JSON.stringify(order.items),
      order.customerName,
      order.customerPhone,
      order.customerEmail,
      order.deliveryAddress,
      order.cep
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
      row.items,
      row.customer_name,
      row.customer_phone,
      row.customer_email,
      row.delivery_address,
      row.cep
    );
  }

  async findAll(): Promise<Order[]> {
    const query = 'SELECT * FROM orders ORDER BY id DESC';
    const result = await this.pool.query(query);

    return result.rows.map(row => new Order(
      row.id,
      row.customer_id,
      parseFloat(row.weight),
      parseFloat(row.distance),
      row.shipping_type,
      row.items,
      row.customer_name,
      row.customer_phone,
      row.customer_email,
      row.delivery_address,
      row.cep
    ));
  }
}
