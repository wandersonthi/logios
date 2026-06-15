import { Order } from '../entities/Order';
import { AuditLogger } from './AuditLogger';

export interface IObserver {
  update(order: Order, event: string): void;
}

export class OrderAuditObserver implements IObserver {
  update(order: Order, event: string): void {
    const logger = AuditLogger.getInstance();
    logger.log(`[Observer] Notificação enviada ao cliente ${order.customerId}: seu pedido #${order.id} está agora "${event}"`);
  }
}

export class OrderSubject {
  private observers: IObserver[] = [];

  public attach(observer: IObserver) {
    this.observers.push(observer);
  }

  public notify(order: Order, event: string) {
    for (const observer of this.observers) {
      observer.update(order, event);
    }
  }
}
