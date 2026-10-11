import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { addMedia, deleteMedia, deleteProduct, saveProduct } from "@/app/actions/admin";
import { FileUpload } from "@/components/admin/FileUpload";
import { ActionForm, Confirm } from "@/components/admin/Form";
import { area, Check, Color, danger, dollars, Field, file, input, skeleton } from "@/components/admin/ui";
import { Icon } from "@/components/Icon";
import { Shot } from "@/components/ProductCard";
import { allCategories, mediaOf, productById } from "@/lib/admin";
import { requireOwner } from "@/lib/auth";
import { fileOf } from "@/lib/orders";
import { size } from "@/lib/store";

async function Edit({ id }: { id: string }) {
  await requireOwner();
  const p = id === "new" ? null : productById(Number(id));
  if (id !== "new" && !p) notFound();
  const categories = allCategories();
  const media = p ? mediaOf(p.id) : [];
  const download = p ? fileOf(p.id) : undefined;

  return (
    <>
      <div className="mt-7 flex items-center justify-between">
        <h1 className="text-xl font-extrabold">{p ? p.name : "New product"}</h1>
        {p && <Link href={`/p/${p.slug}`} className="text-sm font-semibold text-muted">View ›</Link>}
      </div>

      <ActionForm action={saveProduct} submit={p ? "Save" : "Create"} className="mt-5 space-y-4">
        <input type="hidden" name="id" value={p?.id ?? ""} />
        <Field label="Name"><input name="name" defaultValue={p?.name} required maxLength={80} className={input} /></Field>
        <Field label="Tagline"><input name="tagline" defaultValue={p?.tagline} maxLength={120} className={input} /></Field>
        <Field label="Description"><textarea name="description" defaultValue={p?.description} rows={6} className={area} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Price"><input name="price" defaultValue={dollars(p?.price_cents ?? 0)} inputMode="decimal" required className={input} /></Field>
          <Field label="Old price" hint="Shown crossed out"><input name="compare" defaultValue={dollars(p?.compare_cents ?? null)} inputMode="decimal" className={input} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select name="category" defaultValue={p?.category_id ?? ""} className={input}>
              <option value="">None</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Order" hint="Lower shows first"><input name="position" type="number" defaultValue={p?.position ?? 0} className={input} /></Field>
        </div>
        <Field label="Tags" hint="Comma separated, like iOS, Desktop">
          <input name="platforms" defaultValue={p?.platforms} className={input} />
        </Field>
        {p && <Field label="Link" hint={`/p/${p.slug}`}><input name="slug" defaultValue={p.slug} className={input} /></Field>}
        <div className="flex items-end gap-3">
          <Icon name={p?.name ?? "?"} color={p?.color ?? "#3b82f6"} src={p?.icon} size={44} />
          <div className="min-w-0 flex-1"><Field label="Icon"><input name="icon" type="file" accept="image/png,image/jpeg,image/webp,image/gif" className={file} /></Field></div>
          <Field label="Colour"><Color name="color" value={p?.color ?? "#3b82f6"} /></Field>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-3 py-1">
          <Check name="published" label="Visible in the store" on={p ? p.published === 1 : true} />
          <Check name="featured" label="Featured" on={p?.featured === 1} />
          <Check name="is_new" label="New badge" on={p?.is_new === 1} />
          {p?.icon && <Check name="removeIcon" label="Remove icon" on={false} />}
        </div>
      </ActionForm>

      {p && (
        <>
          <h2 className="mt-10 text-[15px] font-bold">Download</h2>
          <FileUpload productId={p.id} current={download ? `${download.name} · ${size(download.size)}` : null} />

          <h2 className="mt-10 text-[15px] font-bold">Screenshots</h2>
          {media.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
              {media.map((m) => (
                <form key={m.id} action={deleteMedia} className="[&>div]:w-full">
                  <input type="hidden" name="id" value={m.id} />
                  <Shot caption={m.caption} color={m.color} url={m.url} kind={m.kind} />
                  <button className="mt-1.5 w-full text-xs font-semibold text-red-400">Remove</button>
                </form>
              ))}
            </div>
          )}
          <ActionForm action={addMedia} submit="Upload" clear className="mt-4 space-y-3">
            <input type="hidden" name="id" value={p.id} />
            <input name="files" type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm" className={file} />
          </ActionForm>

          <form action={deleteProduct} className="mt-12 border-t border-line pt-6">
            <input type="hidden" name="id" value={p.id} />
            <Confirm ask={`Delete ${p.name}?`} className={danger}>Delete product</Confirm>
          </form>
        </>
      )}
    </>
  );
}

export default function Page({ params }: PageProps<"/admin/products/[id]">) {
  return <Suspense fallback={skeleton}>{params.then(({ id }) => <Edit id={id} />)}</Suspense>;
}
