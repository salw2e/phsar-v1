import { Suspense } from "react";
import { deleteCategory, saveCategory } from "@/app/actions/admin";
import { ActionForm, Confirm } from "@/components/admin/Form";
import { input, skeleton } from "@/components/admin/ui";
import { allCategories } from "@/lib/admin";
import { requireOwner } from "@/lib/auth";

async function List() {
  await requireOwner();
  const categories = allCategories();
  return (
    <>
      <h1 className="mt-7 text-xl font-extrabold">Categories <span className="text-muted">{categories.length}</span></h1>
      <div className="mt-4 space-y-3">
        {categories.map((c) => (
          <div key={c.id} className="rounded-2xl border border-line bg-card p-3">
            <ActionForm action={saveCategory} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="id" value={c.id} />
              <input name="name" defaultValue={c.name} required maxLength={40} aria-label="Name" className={`${input} !w-auto min-w-0 flex-1 !bg-bg`} />
              <input name="position" type="number" defaultValue={c.position} aria-label="Order" className={`${input} !w-16 !bg-bg`} />
            </ActionForm>
            <form action={deleteCategory} className="mt-3 flex items-center justify-between text-xs text-muted">
              <input type="hidden" name="id" value={c.id} />
              {c.products} {c.products === 1 ? "product" : "products"}
              <Confirm ask={`Delete ${c.name}? Its products stay, without a category.`} className="font-semibold text-red-400">Delete</Confirm>
            </form>
          </div>
        ))}
      </div>
      <h2 className="mt-9 text-[15px] font-bold">Add one</h2>
      <ActionForm action={saveCategory} submit="Add" clear className="mt-3 space-y-3">
        <input name="name" placeholder="Name" required maxLength={40} className={input} />
      </ActionForm>
    </>
  );
}

export default function Page() {
  return <Suspense fallback={skeleton}><List /></Suspense>;
}
