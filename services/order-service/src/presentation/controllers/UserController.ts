import { Request, Response } from 'express';
import { PostgresUserRepository } from '../../infrastructure/database/PostgresUserRepository';

export class UserController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, role } = req.body;
      const repository = new PostgresUserRepository();
      await repository.save({ username, password, role });
      res.status(201).json({ message: 'User created successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const repository = new PostgresUserRepository();
      const users = await repository.findAll();
      res.status(200).json(users);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
