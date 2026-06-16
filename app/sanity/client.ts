import { createClient } from "@sanity/client";

export const client = createClient({
  projectId: "d6ez6jwn",
  dataset: "production",
  apiVersion: "2026-05-15",
  useCdn: false,
});
