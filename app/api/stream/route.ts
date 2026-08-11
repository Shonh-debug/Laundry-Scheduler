import { sseClients } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();

  let clientFn: (data: string) => void;

  const stream = new ReadableStream({
    start(controller) {
      clientFn = (data: string) => {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      };
      sseClients.add(clientFn);

      // Heartbeat
      controller.enqueue(encoder.encode(`data: {"type":"CONNECTED"}\n\n`));
    },
    cancel() {
      if (clientFn) {
        sseClients.delete(clientFn);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
