import { getSession } from "@/lib/auth";
import { addClient, removeClient } from "@/lib/sse";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const userId = session.user.id;
  const channel = `user:${userId}`;
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
