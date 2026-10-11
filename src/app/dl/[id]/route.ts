import { createReadStream } from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { fileOf, ownedIds } from "@/lib/orders";
import { fileDir } from "@/lib/uploads";

export async function GET(_: Request, { params }: RouteContext<"/dl/[id]">) {
  const user = await currentUser();
  if (!user) redirect("/login?next=/library");
  const id = Number((await params).id);
  if (user.role !== "owner" && !ownedIds(user.id).includes(id)) return new Response("not yours", { status: 403 });
  const file = fileOf(id);
  if (!file) return new Response("not found", { status: 404 });
  return new Response(Readable.toWeb(createReadStream(join(fileDir, file.path))) as ReadableStream, {
    headers: {
      "content-type": "application/octet-stream",
      "content-length": String(file.size),
      "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "cache-control": "private, no-store",
    },
  });
}
