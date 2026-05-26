import { redirect } from "next/navigation";

// /erschliessung redirects to its canonical page. The Erschließung
// site is single-purpose; /erschliessung/interpolation is the home.
export default function ErschliessungIndex() {
  redirect("/erschliessung/interpolation");
}
