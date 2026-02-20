import { handleApiError } from "@/lib/errors";
import { getBattle } from "@/modules/battles/service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const battle = await getBattle(id);
    return Response.json({ data: battle });
  } catch (error) {
    return handleApiError(error);
  }
}
