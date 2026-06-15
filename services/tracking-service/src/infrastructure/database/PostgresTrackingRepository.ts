import { Pool } from 'pg';
import { ITrackingRepository } from '../../application/repositories/ITrackingRepository';
import { Tracking } from '../../domain/entities/Tracking';

export class PostgresTrackingRepository implements ITrackingRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgres://logios_user:logios_password@localhost:5432/logios_db',
    });
    this.initializeTable();
  }

  private async initializeTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS tracking (
        order_id VARCHAR(255) PRIMARY KEY,
        status VARCHAR(50) NOT NULL,
        location VARCHAR(255) NOT NULL,
        updated_at TIMESTAMP NOT NULL
      );
    `;
    await this.pool.query(query);
  }

  async save(tracking: Tracking): Promise<void> {
    const query = `
      INSERT INTO tracking (order_id, status, location, updated_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (order_id)
      DO UPDATE SET status = EXCLUDED.status, location = EXCLUDED.location, updated_at = EXCLUDED.updated_at
    `;
    await this.pool.query(query, [tracking.orderId, tracking.status, tracking.location, tracking.updatedAt]);
  }

  async findByOrderId(orderId: string): Promise<Tracking | null> {
    const query = 'SELECT * FROM tracking WHERE order_id = $1';
    const result = await this.pool.query(query, [orderId]);

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return new Tracking(row.order_id, row.status, row.location, new Date(row.updated_at));
  }

  async findAll(): Promise<Tracking[]> {
    const query = 'SELECT * FROM trackings';
    const result = await this.pool.query(query);

    return result.rows.map(row => new Tracking(
      row.order_id,
      row.status,
      row.location,
      row.updated_at
    ));
  }
}
