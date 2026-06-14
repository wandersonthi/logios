export interface Observer {
  update(event: any): void;
}

export interface Subject {
  attach(observer: Observer): void;
  detach(observer: Observer): void;
  notify(event: any): void;
}

export class TrackingSubject implements Subject {
  private observers: Observer[] = [];

  attach(observer: Observer): void {
    const isExist = this.observers.includes(observer);
    if (!isExist) {
      this.observers.push(observer);
    }
  }

  detach(observer: Observer): void {
    const observerIndex = this.observers.indexOf(observer);
    if (observerIndex !== -1) {
      this.observers.splice(observerIndex, 1);
    }
  }

  notify(event: any): void {
    for (const observer of this.observers) {
      observer.update(event);
    }
  }
}

export class EmailNotificationObserver implements Observer {
  update(event: any): void {
    // Simulando envio de email (Evidência do padrão Observer)
    console.log(`[EmailObserver] Enviar email para cliente sobre pedido ${event.orderId}. Novo status: ${event.status}`);
  }
}
