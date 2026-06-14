import { Request, Response } from 'express';
import { CreateOrderUseCase } from '../../application/use-cases/CreateOrderUseCase';
import { PostgresOrderRepository } from '../../infrastructure/database/PostgresOrderRepository';

export class OrderController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      // Idealmente, a injeção de dependência seria gerida por um container (ex: tsyringe)
      // Para manter simples sem mais dependências, instanciaremos manualmente (Poor Man's DI)
      const repository = new PostgresOrderRepository();
      const useCase = new CreateOrderUseCase(repository);

      const result = await useCase.execute(req.body);
      
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
