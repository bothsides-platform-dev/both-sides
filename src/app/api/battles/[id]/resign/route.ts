import { handleApiError } from "@/lib/errors";
import { requireAuthStrict } from "@/lib/auth";
import { resignBattle } from "@/modules/battles/service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuthStrict();
    const { id } = await params;

    const battle = await resignBattle(id, user.id);
    return Response.json({ data: battle });
  } catch (error) {
    return handleApiError(error);
  }
}
