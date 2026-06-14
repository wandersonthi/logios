export class Tracking {
  constructor(
    public readonly orderId: string,
    public status: string,
    public location: string,
    public readonly updatedAt: Date
  ) {}

  update(status: string, location: string) {
    this.status = status;
    this.location = location;
  }
}
