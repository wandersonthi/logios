import { Customer } from '../../domain/entities/Customer';
import { ICustomerRepository } from '../../domain/repositories/ICustomerRepository';

interface CreateCustomerInput {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  cep: string;
}

export class CreateCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(input: CreateCustomerInput): Promise<void> {
    const customer = new Customer(
      input.id,
      input.name,
      input.phone,
      input.email,
      input.address,
      input.cep,
      new Date()
    );
    await this.customerRepository.save(customer);
  }
}
