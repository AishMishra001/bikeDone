import { Client } from '@stomp/stompjs';
import { tokenStorage } from './tokenStorage';
import { SERVICE_URLS } from '../config/services';

// Polyfill for React Native to support TextEncoder used by stompjs
import 'text-encoding';

let stompClient: Client | null = null;
let connectionPromise: Promise<Client> | null = null;
let activeSubscriptions: { [key: string]: any } = {};

export const socketService = {
  init: () => {
    if (stompClient && stompClient.connected) {
      return Promise.resolve(stompClient);
    }

    if (connectionPromise) {
      return connectionPromise;
    }

    connectionPromise = (async () => {
      try {
        const token = await tokenStorage.getAccessToken();
        
        // Construct WebSocket URL from HTTP URL (e.g. http://localhost:8082 -> ws://localhost:8082/ws)
        const wsUrl = SERVICE_URLS.VMS.replace(/^http/, 'ws').replace(/\/api\/v1$/, '') + '/ws';

        if (stompClient) {
          stompClient.deactivate();
        }

        stompClient = new Client({
          brokerURL: wsUrl,
          connectHeaders: {
            Authorization: `Bearer ${token}`
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
          debug: (str) => {
            // console.log('[STOMP]:', str);
          },
        });

        return await new Promise<Client>((resolve, reject) => {
          stompClient!.onConnect = () => {
            resolve(stompClient!);
          };

          stompClient!.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
            reject(new Error(frame.headers['message']));
          };

          stompClient!.onWebSocketClose = () => {
            connectionPromise = null;
          };

          stompClient!.activate();
        });
      } catch (error) {
        connectionPromise = null;
        throw error;
      }
    })();

    return connectionPromise;
  },

  disconnect: () => {
    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
      activeSubscriptions = {};
    }
    connectionPromise = null;
  },

  // -- CHAT SYSTEM --
  listenForMessages: (jobId: string, callback: (message: any) => void) => {
    let subscription: any = null;
    
    // Connect and subscribe
    socketService.init().then((client) => {
      const topic = `/topic/job-${jobId}`;
      subscription = client.subscribe(topic, (message) => {
        if (message.body) {
          const parsedMessage = JSON.parse(message.body);
          callback(parsedMessage);
        }
      });
      activeSubscriptions[topic] = subscription;
    }).catch(console.error);

    // Return an unsubscribe function
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  },

  sendMessage: async (jobId: string, senderId: string, text: string) => {
    const { vmsApi } = require('./api');
    try {
      await vmsApi.post(`/service-requests/${jobId}/chat`, {
        senderId,
        text,
        timestamp: Date.now()
      });
    } catch (e) {
      console.error("Failed to send message via OMS API", e);
    }
  },

  fetchChatHistory: async (jobId: string) => {
    const { vmsApi } = require('./api');
    try {
      const response = await vmsApi.get(`/service-requests/${jobId}/chat`);
      return response || [];
    } catch (e) {
      console.error("Failed to fetch chat history", e);
      return [];
    }
  },

  // -- LOCATION SYSTEM --
  listenForLocation: (jobId: string, callback: (location: any) => void) => {
    let subscription: any = null;
    socketService.init().then((client) => {
      const topic = `/topic/location-${jobId}`;
      subscription = client.subscribe(topic, (message) => {
        if (message.body) {
          callback(JSON.parse(message.body));
        }
      });
      activeSubscriptions[topic] = subscription;
    }).catch(console.error);

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  },

  updateLocation: async (jobId: string, latitude: number, longitude: number) => {
    const { vmsApi } = require('./api');
    try {
      await vmsApi.post(`/service-requests/${jobId}/location`, {
        latitude,
        longitude
      });
    } catch (e) {
      console.error("Failed to send location via OMS API", e);
    }
  }
};
