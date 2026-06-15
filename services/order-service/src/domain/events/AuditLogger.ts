export class AuditLogger {
  private static instance: AuditLogger;
  private logs: Array<{ message: string; timestamp: Date }> = [];

  private constructor() {}

  public static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  public log(message: string) {
    this.logs.unshift({ message, timestamp: new Date() });
    // Keep only last 50 logs to avoid memory leak
    if (this.logs.length > 50) this.logs.pop();
  }

  public getLogs() {
    return this.logs;
  }
}
