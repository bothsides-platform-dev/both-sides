import type { SSEEvent } from "./types";

type SSEClient = {
  id: string;
  controller: ReadableStreamDefaultController;
};

const globalForSSE = globalThis as unknown as {
  battleClients: Map<string, Set<SSEClient>> | undefined;
};

function getClients(): Map<string, Set<SSEClient>> {
  if (!globalForSSE.battleClients) {
    globalForSSE.battleClients = new Map();
  }
  return globalForSSE.battleClients;
}

export function addClient(
  battleId: string,
  controller: ReadableStreamDefaultController
): string {
  const clients = getClients();
  const clientId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  if (!clients.has(battleId)) {
    clients.set(battleId, new Set());
  }

  clients.get(battleId)!.add({ id: clientId, controller });
  return clientId;
}

export function removeClient(battleId: string, clientId: string) {
  const clients = getClients();
  const battleClients = clients.get(battleId);
  if (!battleClients) return;

  for (const client of battleClients) {
    if (client.id === clientId) {
      battleClients.delete(client);
      break;
    }
  }

  if (battleClients.size === 0) {
    clients.delete(battleId);
  }
}

export function broadcastToBattle(battleId: string, event: SSEEvent) {
  const clients = getClients();
  const battleClients = clients.get(battleId);
  if (!battleClients || battleClients.size === 0) return;

  const data = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
  const encoder = new TextEncoder();
  const encoded = encoder.encode(data);

  const deadClients: SSEClient[] = [];

  for (const client of battleClients) {
    try {
      client.controller.enqueue(encoded);
    } catch {
      deadClients.push(client);
    }
  }

  // Clean up dead clients
  for (const dead of deadClients) {
    battleClients.delete(dead);
  }

  if (battleClients.size === 0) {
    clients.delete(battleId);
  }
}

export function getClientCount(battleId: string): number {
  const clients = getClients();
  return clients.get(battleId)?.size ?? 0;
}
