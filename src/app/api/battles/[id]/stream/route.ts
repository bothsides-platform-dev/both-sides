import { addClient, removeClient } from "@/modules/battles/sse";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: battleId } = await params;

  let clientId: string;

  const stream = new ReadableStream({
    start(controller) {
      clientId = addClient(battleId, controller);

      // Send initial connection event
      const encoder = new TextEncoder();
      controller.enqueue(
        encoder.encode(`event: heartbeat\ndata: ${JSON.stringify({ connected: true })}\n\n`)
      );

      // Heartbeat every 15 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`event: heartbeat\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`)
          );
        } catch {
          clearInterval(heartbeat);
        }
      }, 15000);

      // Clean up on close
      _request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        removeClient(battleId, clientId);
      });
    },
    cancel() {
      removeClient(battleId, clientId);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
