import { addClient, removeClient } from "@/lib/sse";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: topicId } = await params;
  const channel = `topic:${topicId}`;
  let clientId: string;

  const stream = new ReadableStream({
    start(controller) {
      clientId = addClient(channel, controller);

      const encoder = new TextEncoder();
      controller.enqueue(
        encoder.encode(`event: heartbeat\ndata: ${JSON.stringify({ connected: true })}\n\n`)
      );

      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(
            encoder.encode(`event: heartbeat\ndata: ${JSON.stringify({ ts: Date.now() })}\n\n`)
          );
        } catch {
          clearInterval(heartbeat);
        }
      }, 15000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        removeClient(channel, clientId);
      });
    },
    cancel() {
      removeClient(channel, clientId);
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
