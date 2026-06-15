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

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const repository = new PostgresOrderRepository();
      const orders = await repository.findAll();
      res.status(200).json(orders);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      // Usando o padrão Singleton para pegar a mesma instância de log
      const { AuditLogger } = await import('../../domain/events/AuditLogger');
      const logger = AuditLogger.getInstance();
      res.status(200).json(logger.getLogs());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
