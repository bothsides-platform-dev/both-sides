import { handleApiError } from "@/lib/errors";
import { getBattleMessages } from "@/modules/battles/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const messages = await getBattleMessages(id);
    return Response.json({ data: messages });
  } catch (error) {
    return handleApiError(error);
  }
}
