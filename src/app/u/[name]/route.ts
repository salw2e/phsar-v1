import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { mimeOf, uploadDir, uploadName } from "@/lib/uploads";

export async function GET(_: Request, { params }: RouteContext<"/u/[name]">) {
  const { name } = await params;
  if (!uploadName.test(name)) return new Response("not found", { status: 404 });
  try {
    const body = await readFile(join(uploadDir, name));
    return new Response(new Uint8Array(body), {
      headers: { "content-type": mimeOf(name), "cache-control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("not found", { status: 404 });
  }
}
