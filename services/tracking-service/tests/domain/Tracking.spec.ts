import { Tracking } from '../../src/domain/entities/Tracking';
import { TrackingSubject, EmailNotificationObserver } from '../../src/domain/events/Observer';

describe('Tracking and Observer (TDD)', () => {
  it('should update tracking status and notify observers', () => {
    const tracking = new Tracking('order-123', 'PENDING', 'Warehouse A', new Date());
    tracking.update('SHIPPED', 'In Transit');
    
    expect(tracking.status).toBe('SHIPPED');
    expect(tracking.location).toBe('In Transit');

    // Testando o Observer
    const subject = new TrackingSubject();
    const observer = new EmailNotificationObserver();
    const spy = jest.spyOn(observer, 'update');

    subject.attach(observer);
    subject.notify({ orderId: tracking.orderId, status: tracking.status });

    expect(spy).toHaveBeenCalledWith({ orderId: 'order-123', status: 'SHIPPED' });
  });
});
