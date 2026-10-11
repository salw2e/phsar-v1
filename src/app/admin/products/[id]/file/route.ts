import { randomBytes } from "node:crypto";
import { createWriteStream } from "node:fs";
import { mkdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { productById } from "@/lib/admin";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { fileOf } from "@/lib/orders";
import { fileDir, removeFile } from "@/lib/uploads";

type Ctx = RouteContext<"/admin/products/[id]/file">;

async function product({ params }: Ctx) {
  const user = await currentUser();
  const id = Number((await params).id);
  return user?.role === "owner" && productById(id) ? id : null;
}

function cleanName(header: string | null) {
  try {
    return decodeURIComponent(header ?? "").replace(/[/\\"\x00-\x1f]/g, "").slice(0, 120) || "download";
  } catch {
    return "download";
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  const id = await product(ctx);
  if (!id || !req.body) return new Response("no", { status: 403 });
  const path = randomBytes(16).toString("hex");
  await mkdir(fileDir, { recursive: true });
  try {
    await pipeline(Readable.fromWeb(req.body as never), createWriteStream(join(fileDir, path)));
  } catch {
    await removeFile(path);
    return new Response("upload broke", { status: 500 });
  }
  const { size } = await stat(join(fileDir, path));
  const old = fileOf(id);
  db.prepare(`
    insert into files (product_id, path, name, size) values (?, ?, ?, ?)
    on conflict(product_id) do update set path = excluded.path, name = excluded.name, size = excluded.size
  `).run(id, path, cleanName(req.headers.get("x-file-name")), size);
  if (old) await removeFile(old.path);
  return Response.json({ size });
}

export async function DELETE(_: Request, ctx: Ctx) {
  const id = await product(ctx);
  if (!id) return new Response("no", { status: 403 });
  const old = fileOf(id);
  db.prepare("delete from files where product_id = ?").run(id);
  if (old) await removeFile(old.path);
  return Response.json({});
}
