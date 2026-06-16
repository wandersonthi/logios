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
  async update(trackingData: { orderId: string; status: string; location: string }): Promise<void> {
    const msg = `[Observer] Status atualizado via SMS/Email: Pedido #${trackingData.orderId} está agora "${trackingData.status}" em ${trackingData.location}`;
    console.log(msg);
    
    // Envia o log para o serviço de pedidos centralizar a auditoria
    try {
      await fetch('http://logios-order-service-1:3001/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
    } catch (err) {
      console.error('Falha ao enviar log de auditoria', err);
    }
  }
}
