type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
};

type SSEEvent = {
  type: string;
  data: unknown;
};

const globalForSSE = globalThis as unknown as {
  sseChannels: Map<string, Set<SSEClient>> | undefined;
};

function getChannels(): Map<string, Set<SSEClient>> {
  if (!globalForSSE.sseChannels) {
    globalForSSE.sseChannels = new Map();
  }
  return globalForSSE.sseChannels;
}

export function addClient(
  channel: string,
  controller: ReadableStreamDefaultController
): string {
  const channels = getChannels();
  const clientId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  if (!channels.has(channel)) {
    channels.set(channel, new Set());
  }

  channels.get(channel)!.add({ id: clientId, controller });
  return clientId;
}

export function removeClient(channel: string, clientId: string) {
  const channels = getChannels();
  const clients = channels.get(channel);
  if (!clients) return;

  for (const client of clients) {
    if (client.id === clientId) {
      clients.delete(client);
      break;
    }
  }

  if (clients.size === 0) {
    channels.delete(channel);
  }
}

export function broadcast(channel: string, event: SSEEvent) {
  const channels = getChannels();
  const clients = channels.get(channel);
  if (!clients || clients.size === 0) return;

  const data = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);

  const deadClients: SSEClient[] = [];

  for (const client of clients) {
    try {
      client.controller.enqueue(encoded);
    } catch {
      deadClients.push(client);
    }
  }

  for (const dead of deadClients) {
    clients.delete(dead);
  }

  if (clients.size === 0) {
    channels.delete(channel);
  }
}

export function getClientCount(channel: string): number {
  const channels = getChannels();
  return channels.get(channel)?.size ?? 0;
}
