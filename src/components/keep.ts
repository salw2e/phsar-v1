import { startTransition, type FormEvent } from "react";

// react clears the whole form after an action, this submits without that
export const keep = (run: (form: FormData) => void) => (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  startTransition(() => run(form));
};
