import { Request, Response } from 'express';
import { CreateOrderUseCase } from '../../application/use-cases/CreateOrderUseCase';
import { PostgresOrderRepository } from '../../infrastructure/database/PostgresOrderRepository';
import { AuditLogger } from '../../domain/events/AuditLogger';

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
      const logger = AuditLogger.getInstance();
      res.status(200).json(logger.getLogs());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async addAuditLog(req: Request, res: Response): Promise<void> {
    try {
      const { message } = req.body;
      if (message) {
        const logger = AuditLogger.getInstance();
        logger.log(message);
      }
      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
