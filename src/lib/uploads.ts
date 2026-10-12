import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const data = dirname(process.env.DATABASE_PATH ?? "data/phsar.db");
export const uploadDir = join(data, "uploads");
export const fileDir = join(data, "files");

const types: Record<string, string> = {
  png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", mp4: "video/mp4", webm: "video/webm",
};
export const uploadName = /^[a-f0-9]{24}\.(png|jpe?g|webp|gif|mp4|webm)$/;
export const mimeOf = (name: string) => types[name.split(".").pop() ?? ""] ?? "application/octet-stream";
export const isVideo = (url: string) => /\.(mp4|webm)$/.test(url);

export async function saveUpload(file: FormDataEntryValue | null, video = false): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!types[ext] || types[ext] !== file.type || (!video && isVideo(file.name.toLowerCase()))) {
    throw new Error(video ? "Use png, jpg, webp, gif, mp4 or webm" : "Use png, jpg, webp or gif");
  }
  if (file.size > 20 * 1024 * 1024) throw new Error("Max file size is 20 MB");
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, name), Buffer.from(await file.arrayBuffer()));
  return `/u/${name}`;
}

export async function removeUpload(url: string | null | undefined) {
  const name = url?.startsWith("/u/") ? url.slice(3) : "";
  if (uploadName.test(name)) await unlink(join(uploadDir, name)).catch(() => {});
}

export const removeFile = (path: string) => (/^[a-f0-9]{32}$/.test(path) ? unlink(join(fileDir, path)).catch(() => {}) : undefined);
