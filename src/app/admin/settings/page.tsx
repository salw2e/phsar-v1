import { Suspense } from "react";
import { saveSettings } from "@/app/actions/admin";
import { ActionForm } from "@/components/admin/Form";
import { area, Check, Color, Field, file, input, skeleton } from "@/components/admin/ui";
import { requireOwner } from "@/lib/auth";
import { getSettings } from "@/lib/store";

async function Form() {
  await requireOwner();
  const s = await getSettings();
  return (
    <>
      <h1 className="mt-7 text-xl font-extrabold">Settings</h1>
      <ActionForm action={saveSettings} className="mt-5 space-y-4">
        <Field label="Store name"><input name="name" defaultValue={s.name} required maxLength={40} className={input} /></Field>
        <Field label="Line under the name"><input name="byline" defaultValue={s.byline} maxLength={40} className={input} /></Field>
        <Field label="Headline"><input name="heroTitle" defaultValue={s.heroTitle} maxLength={80} className={input} /></Field>
        <Field label="Search box text"><input name="searchHint" defaultValue={s.searchHint} maxLength={40} className={input} /></Field>
        <Field label="Footer text"><textarea name="footerBlurb" defaultValue={s.footerBlurb} rows={3} maxLength={300} className={area} /></Field>
        <div className="flex items-end gap-3">
          {s.logo && <img src={s.logo} alt="" className="size-11 rounded-[10px] object-cover" />}
          <div className="min-w-0 flex-1">
            <Field label="Logo"><input name="logo" type="file" accept="image/png,image/jpeg,image/webp,image/gif" className={file} /></Field>
          </div>
          <Field label="Accent"><Color name="accent" value={s.accent} /></Field>
        </div>
        {s.logo && <Check name="removeLogo" label="Remove logo" on={false} />}
      </ActionForm>
    </>
  );
}

export default function Page() {
  return <Suspense fallback={skeleton}><Form /></Suspense>;
}
