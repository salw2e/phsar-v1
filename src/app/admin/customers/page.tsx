import { Suspense } from "react";
import { resetPassword } from "@/app/actions/admin";
import { ActionForm } from "@/components/admin/Form";
import { skeleton } from "@/components/admin/ui";
import { day } from "@/components/Status";
import { requireOwner } from "@/lib/auth";
import { allUsers } from "@/lib/admin";
import { money } from "@/lib/store";

async function List() {
  await requireOwner();
  const users = allUsers();
  return (
    <>
      <h1 className="mt-7 text-xl font-extrabold">Customers <span className="text-muted">{users.length}</span></h1>
      <div className="mt-4 space-y-2">
        {users.map((u) => (
          <div key={u.id} className="rounded-2xl border border-line bg-card p-3.5">
            <div className="truncate text-[15px] font-bold">{u.name || u.email}{u.role === "owner" && <span className="ml-2 text-xs font-semibold text-accent">owner</span>}</div>
            <div className="truncate text-xs text-muted">{u.email} · joined {day(u.created_at)} · {u.orders} paid · {money(u.spent)}{u.google === 1 && " · google"}</div>
            <ActionForm action={resetPassword} submit="Reset password" className="mt-3 space-y-2 [&_button]:h-9 [&_button]:border [&_button]:border-line [&_button]:bg-transparent [&_button]:px-4 [&_button]:text-[13px] [&_button]:font-semibold [&_[role=status]]:select-all [&_[role=status]]:font-mono">
              <input type="hidden" name="id" value={u.id} />
            </ActionForm>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Page() {
  return <Suspense fallback={skeleton}><List /></Suspense>;
}
