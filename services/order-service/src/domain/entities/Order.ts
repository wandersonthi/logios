export class Order {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly weight: number,
    public readonly distance: number,
    public readonly shippingType: string,
    public readonly items: string[]
  ) {}

  // Entidade de domínio pura (sem regras complexas aqui por enquanto, cálculo de frete vai em Use Case ou Strategy separado)
}
