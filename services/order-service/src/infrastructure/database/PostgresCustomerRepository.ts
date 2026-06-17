import { Pool } from 'pg';
import { Customer } from '../../domain/entities/Customer';
import { ICustomerRepository } from '../../domain/repositories/ICustomerRepository';

export class PostgresCustomerRepository implements ICustomerRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@db:5432/logios'
    });
    this.init();
  }

  private async init() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        cep VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  async save(customer: Customer): Promise<void> {
    await this.pool.query(
      \`INSERT INTO customers (id, name, phone, email, address, cep, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         email = EXCLUDED.email,
         address = EXCLUDED.address,
         cep = EXCLUDED.cep\`,
      [customer.id, customer.name, customer.phone, customer.email, customer.address, customer.cep, customer.createdAt]
    );
  }

  async findById(id: string): Promise<Customer | null> {
    const res = await this.pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return new Customer(row.id, row.name, row.phone, row.email, row.address, row.cep, row.created_at);
  }

  async findAll(): Promise<Customer[]> {
    const res = await this.pool.query('SELECT * FROM customers ORDER BY created_at DESC');
    return res.rows.map(row => new Customer(row.id, row.name, row.phone, row.email, row.address, row.cep, row.created_at));
  }
}
