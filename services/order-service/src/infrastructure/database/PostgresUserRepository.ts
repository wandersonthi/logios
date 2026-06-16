import { Pool } from 'pg';

export class PostgresUserRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgres://logios_user:logios_password@localhost:5432/logios_db',
    });
    this.initializeTable();
  }

  private async initializeTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL
      );
    `;
    await this.pool.query(query);

    // Inserir usuários padrão caso não existam
    await this.pool.query(`
      INSERT INTO users (username, password, role) 
      VALUES ('admin', 'admin041045', 'admin') 
      ON CONFLICT (username) DO NOTHING;
    `);

    await this.pool.query(`
      INSERT INTO users (username, password, role) 
      VALUES ('operador', '123', 'operator') 
      ON CONFLICT (username) DO NOTHING;
    `);
  }

  async save(user: { username: string; password: string; role: string }): Promise<void> {
    const query = `
      INSERT INTO users (username, password, role)
      VALUES ($1, $2, $3)
      ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role
    `;
    await this.pool.query(query, [user.username, user.password, user.role]);
  }

  async findByUsername(username: string): Promise<any | null> {
    const query = 'SELECT * FROM users WHERE username = $1';
    const result = await this.pool.query(query, [username]);
    if (result.rows.length === 0) return null;
    return result.rows[0];
  }

  async findAll(): Promise<any[]> {
    const query = 'SELECT id, username, role FROM users ORDER BY id ASC';
    const result = await this.pool.query(query);
    return result.rows;
  }
}
