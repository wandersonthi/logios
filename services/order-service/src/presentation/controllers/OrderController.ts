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

  async clearDatabase(req: Request, res: Response): Promise<void> {
    try {
      const repository = new PostgresOrderRepository();
      // Executa TRUNCATE diretamente na conexão (apenas para ambiente de dev/demo)
      await (repository as any).pool.query('TRUNCATE TABLE orders CASCADE; TRUNCATE TABLE tracking CASCADE;');
      
      const logger = AuditLogger.getInstance();
      logger.log('[SISTEMA] O administrador limpou o banco de dados (TRUNCATE).');
      
      res.status(200).json({ message: 'Banco de dados limpo com sucesso' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async exportBackup(req: Request, res: Response): Promise<void> {
    try {
      const repository = new PostgresOrderRepository();
      const query = `
        SELECT o.id, o.customer_id, o.weight, o.distance, o.shipping_type, o.items,
               t.status, t.location, t.updated_at 
        FROM orders o 
        LEFT JOIN tracking t ON o.id = t.order_id
        ORDER BY o.id ASC
      `;
      const result = await (repository as any).pool.query(query);

      // Gerar CSV
      let csvData = 'ID do Pedido,ID do Cliente,Peso (kg),Distancia (km),Tipo Frete,Itens,Status Rastreio,Localizacao Atual,Ultima Atualizacao\n';
      
      for (const row of result.rows) {
        const id = row.id;
        const customerId = row.customer_id;
        const weight = row.weight;
        const distance = row.distance;
        const shippingType = row.shipping_type;
        // Escapar vírgulas nos itens
        const items = `"${(row.items || []).join(', ')}"`;
        const status = row.status || 'SEM RASTREIO';
        const location = row.location || '-';
        const updatedAt = row.updated_at ? new Date(row.updated_at).toLocaleString('pt-BR') : '-';

        csvData += `${id},${customerId},${weight},${distance},${shippingType},${items},${status},${location},${updatedAt}\n`;
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="backup_pedidos.csv"');
      res.status(200).send(csvData);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
