export const dynamic = "force-dynamic";

export async function GET() {
  const wsUrl =
    process.env.WS_URL ?? "ws://localhost:8080/ws";

  return Response.json(
    { wsUrl },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}