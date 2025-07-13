const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiService {
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Public endpoints
  static async subscribe(email: string, semester: number) {
    return this.request('/api/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email, semester }),
    });
  }

  static async unsubscribe(email: string) {
    return this.request('/api/unsubscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  static async getStatus() {
    return this.request('/api/status');
  }

  static async getSubscriberCount() {
    return this.request('/api/subscriber-count');
  }

  // Admin endpoints
  static async testEmail(email: string) {
    return this.request('/api/test-email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  static async getAllEmails() {
    return this.request('/api/emails');
  }

  static async notifyAll() {
    return this.request('/api/notify-all', {
      method: 'POST',
    });
  }

  static async resetNotification() {
    return this.request('/api/reset-notification', {
      method: 'POST',
    });
  }

  static async startMonitoring() {
    return this.request('/api/start-monitoring', {
      method: 'POST',
    });
  }

  static async stopMonitoring() {
    return this.request('/api/stop-monitoring', {
      method: 'POST',
    });
  }
}