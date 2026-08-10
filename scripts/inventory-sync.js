/**
 * Mock GraphQL Subscription Client for Real-Time Inventory
 * Simulates connecting to a GraphQL WebSocket endpoint for inventory updates.
 */

export class InventorySubscriptionClient {
  constructor(endpoint, onUpdateCallback) {
    this.endpoint = endpoint;
    this.onUpdateCallback = onUpdateCallback;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect() {
    console.log(`[GraphQL Sub] Connecting to ${this.endpoint}...`);
    // Mocking WebSocket connection for demonstration purposes
    this.socket = {
      readyState: 1, // OPEN
      close: () => console.log('Connection closed.')
    };

    // Simulate receiving an inventory update event from the server
    this.mockSubscriptionTimer = setInterval(() => {
      this.simulateInventoryUpdate();
    }, 45000); // 45 seconds
  }

  simulateInventoryUpdate() {
    const mockEvent = {
      data: JSON.stringify({
        type: 'data',
        payload: {
          data: {
            inventoryStatusChanged: {
              productId: Math.floor(Math.random() * 10) + 1,
              inStock: Math.random() > 0.5,
              stockCount: Math.floor(Math.random() * 50)
            }
          }
        }
      })
    };
    this.handleMessage(mockEvent);
  }

  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      if (message.type === 'data' && message.payload.data.inventoryStatusChanged) {
        this.onUpdateCallback(message.payload.data.inventoryStatusChanged);
      }
    } catch (e) {
      console.error('Failed to parse subscription message', e);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      clearInterval(this.mockSubscriptionTimer);
    }
  }
}

// Usage Example integration with UI (To be connected to cart.js / products.js)
// const inventoryClient = new InventorySubscriptionClient('wss://api.cara.com/graphql', (update) => {
//   console.log(`Product ${update.productId} stock updated: ${update.stockCount} left.`);
//   // Logic to update DOM (e.g. disabling Add to Cart button if inStock is false)
// });
// inventoryClient.connect();
