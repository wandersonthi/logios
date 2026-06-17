import { Customer } from '../entities/Customer';

export interface ICustomerRepository {
  save(customer: Customer): Promise<void>;
  findById(id: string): Promise<Customer | null>;
  findAll(): Promise<Customer[]>;
}
