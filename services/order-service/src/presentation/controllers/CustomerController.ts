import { Request, Response } from 'express';
import { PostgresCustomerRepository } from '../../infrastructure/database/PostgresCustomerRepository';
import { CreateCustomerUseCase } from '../../application/use-cases/CreateCustomerUseCase';
import { GetAllCustomersUseCase } from '../../application/use-cases/GetAllCustomersUseCase';

export class CustomerController {
  private createUseCase: CreateCustomerUseCase;
  private getAllUseCase: GetAllCustomersUseCase;

  constructor() {
    const repository = new PostgresCustomerRepository();
    this.createUseCase = new CreateCustomerUseCase(repository);
    this.getAllUseCase = new GetAllCustomersUseCase(repository);
  }

  async create(req: Request, res: Response) {
    try {
      await this.createUseCase.execute(req.body);
      res.status(201).json({ message: 'Customer created successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const customers = await this.getAllUseCase.execute();
      res.status(200).json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
