import { redirect } from "next/navigation";

// /model-evals redirects to its canonical page. The Model Evals
// site is single-purpose; /model-evals/interpolation is the home.
export default function ModelEvalsIndex() {
  redirect("/model-evals/interpolation");
}
