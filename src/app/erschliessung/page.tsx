import { redirect } from "next/navigation";

// Legacy route. "Erschließung" was renamed to "Model Evals" (/model-evals)
// for a clearer, US-memorable name describing the pipeline-evaluation pages.
export default function ErschliessungLegacyRedirect() {
  redirect("/model-evals");
}
