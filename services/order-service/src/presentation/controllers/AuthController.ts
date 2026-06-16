import { Request, Response } from 'express';
import { PostgresUserRepository } from '../../infrastructure/database/PostgresUserRepository';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      const repository = new PostgresUserRepository();
      
      const user = await repository.findByUsername(username);

      if (user && user.password === password) {
        res.status(200).json({ 
          token: `logios-mock-jwt-token-${user.id}`,
          user: { username: user.username, role: user.role } 
        });
        return;
      }

      res.status(401).json({ message: 'Credenciais inválidas' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
