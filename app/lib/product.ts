// Central identity for the Coherent Constructs code-review product.
//
// Name chosen 2026-08-19 (Eric): "Prehend" — going with it for now; the stronger
// single-word candidates had no available domain and the coined options read as
// too risky/controversial. Not yet trademark-cleared. Every product page reads
// the name from here, so renaming the whole product — display name, CLI command,
// page titles — is a one-line change to PRODUCT_NAME (and PRODUCT_CLI).
export const PRODUCT_NAME = 'Prehend';

/** The command shown in CLI examples — lowercase of the product name. */
export const PRODUCT_CLI = 'prehend';

/** The parent brand. Never call the team or the service "engineer/engineering"
 *  — the word is protected in Canada (P.Eng.) and CC holds no P.Eng. licence. */
export const PRODUCT_PARENT = 'Coherent Constructs';

/**
 * Release flag for the Prehend product section. While false the 'prehend' tab is
 * filtered out of navigation and reachability (see releasable() in website.ts),
 * so the whole section is dark — nav link hidden, /prehend/* routes 404, absent
 * from the sitemap — even though the code ships. Flip to true at launch; no
 * per-brand Sanity change is needed.
 */
export const PREHEND_ENABLED = false;
