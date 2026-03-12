import { NextRequest } from "next/server";
import { requireAuthStrict } from "@/lib/auth";
import { handleApiError } from "@/lib/errors";
import { validateRequest } from "@/lib/validation";
import { createPostSchema, getPostsSchema } from "@/modules/posts/schema";
import { createPost, getPosts } from "@/modules/posts/service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const input = await validateRequest(getPostsSchema, {
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      category: searchParams.get("category") || undefined,
      sort: searchParams.get("sort") || undefined,
    });

    const result = await getPosts(input);
    return Response.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthStrict();
    const body = await request.json();
    const input = await validateRequest(createPostSchema, body);
    const post = await createPost(user.id, input);
    return Response.json({ data: post }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
