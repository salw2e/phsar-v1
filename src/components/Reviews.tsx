import { io } from "next/cache";
import { saveReview } from "@/app/actions/orders";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ownedIds } from "@/lib/orders";
import { getReviews } from "@/lib/store";
import { ActionForm } from "./admin/Form";
import { area, input } from "./admin/ui";
import { Stars } from "./Icon";
import { day } from "./Status";

export async function Reviews({ productId, rating, count }: { productId: number; rating: number; count: number }) {
  const reviews = await getReviews(productId);
  if (count === 0) return <p className="mt-2.5 text-[15px] text-muted">No reviews yet</p>;
  return (
    <>
      <div className="mt-3 flex items-center gap-3">
        <span className="font-head text-4xl font-extrabold">{rating.toFixed(1)}</span>
        <div><Stars rating={rating} size={16} /><div className="mt-1 text-xs text-muted">{count} {count === 1 ? "review" : "reviews"}</div></div>
      </div>
      <div className="mt-4 space-y-2.5">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-[18px] border-[1.5px] border-line bg-card/85 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate text-sm font-semibold">{r.author}</span>
              <Stars rating={r.rating} size={12} />
            </div>
            {r.body && <p className="mt-1.5 whitespace-pre-line break-words text-sm leading-relaxed text-muted">{r.body}</p>}
            <div className="mt-2 text-[11px] text-muted/70">{day(r.created_at)}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export async function ReviewForm({ productId }: { productId: number }) {
  const user = await currentUser();
  await io();
  if (!user || !ownedIds(user.id).includes(productId)) return null;
  const mine = db.prepare("select rating, body from reviews where product_id = ? and user_id = ?").get(productId, user.id) as { rating: number; body: string } | undefined;
  return (
    <ActionForm action={saveReview} submit={mine ? "Update review" : "Post review"} className="mt-4 space-y-2.5">
      <input type="hidden" name="product" value={productId} />
      <select name="rating" defaultValue={mine?.rating ?? 5} aria-label="Rating" className={input}>
        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5 - n)}</option>)}
      </select>
      <textarea name="body" defaultValue={mine?.body} rows={3} maxLength={1000} placeholder="What do you think of it?" className={area} />
    </ActionForm>
  );
}
