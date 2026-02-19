// src/api/websocket.js
// import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(symbol = 'ALL') {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/api/v1/ws';
    this.socket = new WebSocket(`${wsUrl}/realtime/${symbol}`);
    
    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.emit('connect', { connected: true });
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.emit('message', data);
        
        if (data.type === 'ANOMALY_DETECTED') {
          this.emit('anomaly', data);
        }
      } catch (error) {
        console.error('WebSocket message parse error:', error);
      }
    };

    this.socket.onclose = () => {
      console.log('WebSocket disconnected');
      this.emit('disconnect', { connected: false });
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => this.connect(symbol), 3000);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    };
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => callback(data));
    }
  }

  isConnected() {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export default new WebSocketService();