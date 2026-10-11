import { notFound } from "next/navigation";
import { Suspense } from "react";
import { deleteBundle, saveBundle } from "@/app/actions/admin";
import { ActionForm, Confirm } from "@/components/admin/Form";
import { Check, Color, danger, dollars, Field, input, skeleton } from "@/components/admin/ui";
import { allProducts, bundleById, bundleProductIds } from "@/lib/admin";
import { requireOwner } from "@/lib/auth";
import { money } from "@/lib/store";

async function Edit({ id }: { id: string }) {
  await requireOwner();
  const b = id === "new" ? null : bundleById(Number(id));
  if (id !== "new" && !b) notFound();
  const products = allProducts();
  const inside = b ? bundleProductIds(b.id) : [];

  return (
    <>
      <h1 className="mt-7 text-xl font-extrabold">{b ? b.name : "New bundle"}</h1>
      <ActionForm action={saveBundle} submit={b ? "Save" : "Create"} className="mt-5 space-y-4">
        <input type="hidden" name="id" value={b?.id ?? ""} />
        <Field label="Name"><input name="name" defaultValue={b?.name} required maxLength={80} className={input} /></Field>
        <Field label="Blurb"><input name="blurb" defaultValue={b?.blurb} maxLength={160} className={input} /></Field>
        <div className="flex items-end gap-3">
          <div className="grid flex-1 grid-cols-2 gap-3">
            <Field label="Price"><input name="price" defaultValue={dollars(b?.price_cents ?? 0)} inputMode="decimal" required className={input} /></Field>
            <Field label="Old price"><input name="compare" defaultValue={dollars(b?.compare_cents ?? null)} inputMode="decimal" className={input} /></Field>
          </div>
          <Field label="Colour"><Color name="color" value={b?.color ?? "#4f46e5"} /></Field>
        </div>
        <fieldset>
          <legend className="mb-2 text-[13px] font-semibold">Products</legend>
          <div className="space-y-2.5 rounded-2xl border border-line bg-card p-4">
            {products.map((p) => <Check key={p.id} name="products" value={p.id} label={`${p.name} · ${money(p.price_cents)}`} on={inside.includes(p.id)} />)}
          </div>
        </fieldset>
      </ActionForm>

      {b && (
        <form action={deleteBundle} className="mt-12 border-t border-line pt-6">
          <input type="hidden" name="id" value={b.id} />
          <Confirm ask={`Delete ${b.name}?`} className={danger}>Delete bundle</Confirm>
        </form>
      )}
    </>
  );
}

export default function Page({ params }: PageProps<"/admin/bundles/[id]">) {
  return <Suspense fallback={skeleton}>{params.then(({ id }) => <Edit id={id} />)}</Suspense>;
}
