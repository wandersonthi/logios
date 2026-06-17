export class Customer {
  constructor(
    public readonly id: string,
    public name: string,
    public phone: string,
    public email: string,
    public address: string,
    public cep: string,
    public readonly createdAt: Date
  ) {}
}
