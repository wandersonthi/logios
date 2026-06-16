import { Request, Response } from 'express';

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    // Hardcoded credentials para fins de demonstração
    if (username === 'admin' && password === 'admin') {
      res.status(200).json({ 
        token: 'logios-mock-jwt-token-12345',
        user: { username: 'admin', role: 'operator' } 
      });
      return;
    }

    res.status(401).json({ message: 'Credenciais inválidas' });
  }
}
