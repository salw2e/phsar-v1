import { Suspense } from "react";
import { saveLogin, savePayments, saveSettings } from "@/app/actions/admin";
import { ActionForm } from "@/components/admin/Form";
import { area, Check, Color, Field, file, input, skeleton } from "@/components/admin/ui";
import { requireOwner } from "@/lib/auth";
import { origin } from "@/lib/limit";
import { secret } from "@/lib/pay";
import { getSettings } from "@/lib/store";

async function Form() {
  await requireOwner();
  const s = await getSettings();
  const stripe = secret("stripeKey");
  const googleSecret = secret("googleSecret");
  return (
    <>
      <h1 className="mt-7 text-xl font-extrabold">Settings</h1>
      <ActionForm action={saveSettings} className="mt-5 space-y-4">
        <Field label="Store name"><input name="name" defaultValue={s.name} required maxLength={40} className={input} /></Field>
        <Field label="Tagline"><input name="byline" defaultValue={s.byline} maxLength={40} className={input} /></Field>
        <Field label="Headline"><input name="heroTitle" defaultValue={s.heroTitle} maxLength={80} className={input} /></Field>
        <Field label="Search placeholder"><input name="searchHint" defaultValue={s.searchHint} maxLength={40} className={input} /></Field>
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

      <h2 className="mt-12 text-xl font-extrabold">Payments</h2>
      <ActionForm action={savePayments} className="mt-5 space-y-4">
        <Field label="Stripe secret key" hint={stripe ? `saved (...${stripe.slice(-4)})` : "sk_live_... or sk_test_..."}>
          <input name="stripeKey" type="password" autoComplete="off" placeholder={stripe ? "••••••••" : ""} className={input} />
        </Field>
        {stripe && <Check name="removeStripe" label="Remove key" on={false} />}
        <Field label="Crypto wallets" hint="one per line, like USDT (TRC20): address. USDT on Tron confirms by itself, anything else you confirm under Orders">
          <textarea name="wallets" defaultValue={secret("wallets")} rows={3} className={`${area} font-mono`} />
        </Field>
      </ActionForm>

      <h2 className="mt-12 text-xl font-extrabold">Google sign in</h2>
      <ActionForm action={saveLogin} className="mt-5 space-y-4">
        <Field label="Client ID" hint={`redirect URI to add in Google Cloud: ${await origin()}/auth/google/callback`}>
          <input name="googleId" defaultValue={secret("googleId")} autoComplete="off" className={input} />
        </Field>
        <Field label="Client secret" hint={googleSecret ? `saved (...${googleSecret.slice(-4)})` : undefined}>
          <input name="googleSecret" type="password" autoComplete="off" placeholder={googleSecret ? "••••••••" : ""} className={input} />
        </Field>
      </ActionForm>
    </>
  );
}

export default function Page() {
  return <Suspense fallback={skeleton}><Form /></Suspense>;
}
