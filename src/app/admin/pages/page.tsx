import { Suspense } from "react";
import { savePages } from "@/app/actions/admin";
import { ActionForm } from "@/components/admin/Form";
import { area, Field, skeleton } from "@/components/admin/ui";
import { textPages } from "@/components/TextPage";
import { requireOwner } from "@/lib/auth";
import { getSettings } from "@/lib/store";

async function Form() {
  await requireOwner();
  const s = await getSettings();
  return (
    <>
      <h1 className="mt-7 text-xl font-extrabold">Pages</h1>
      <p className="mt-1 text-sm text-muted">Blank line for a new paragraph, # for a heading, {"{name}"} for the store name.</p>
      <ActionForm action={savePages} className="mt-5 space-y-4">
        {Object.entries(textPages).map(([slug, [title, key]]) => (
          <Field key={key} label={title} hint={`/${slug}`}>
            <textarea name={key} defaultValue={s[key]} rows={slug === "support" ? 5 : 12} maxLength={20000} className={area} />
          </Field>
        ))}
      </ActionForm>
    </>
  );
}

export default function Page() {
  return <Suspense fallback={skeleton}><Form /></Suspense>;
}
