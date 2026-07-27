/**
 * Rendering rules for the pricing options authored in Sanity (`pricingOption`).
 *
 * The pricing model is intentionally not baked in here: a service may carry no
 * options at all (renders as "Contact for a quote"), one, or several, and the
 * page-level `showPrices` flag hides every number without touching the content.
 */

export type PricingModel =
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'retainer'
  | 'fixed'
  | 'per-unit'
  | 'value'
  | 'alternative'
  | 'free'
  | 'quote';

export type PricingOption = {
  model: PricingModel | null;
  label: string | null;
  amount: number | null;
  amountMax: number | null;
  currency: string | null;
  unit: string | null;
  minimum: string | null;
  note: string | null;
  featured: boolean | null;
};

export const MODEL_LABELS: Record<PricingModel, string> = {
  hourly: 'Hourly',
  daily: 'Day rate',
  weekly: 'Weekly sprint',
  retainer: 'Monthly retainer',
  fixed: 'Fixed price',
  'per-unit': 'Per deliverable',
  value: 'Value-based',
  alternative: 'Equity / trade',
  free: 'Free',
  quote: 'Custom quote',
};

const DEFAULT_UNITS: Partial<Record<PricingModel, string>> = {
  hourly: 'hour',
  daily: 'day',
  weekly: 'week',
  retainer: 'month',
  fixed: 'project',
  'per-unit': 'deliverable',
};

export const QUOTE_TEXT = 'Contact for a quote';

function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export type FormattedPrice = {
  /** "Hourly", "Fixed price" — or an author-supplied label. */
  label: string;
  /** "$120 / hour", "Free", "Contact for a quote". */
  price: string;
  /** True when no number is shown, so the card can style it more quietly. */
  isQuote: boolean;
};

/**
 * Turn one authored option into display strings. `showPrices` is the page-level
 * master switch — when it is off, every option collapses to "contact for a
 * quote" while the authored numbers stay in the CMS.
 */
export function formatPricingOption(
  option: PricingOption,
  showPrices: boolean
): FormattedPrice {
  const model = (option.model ?? 'quote') as PricingModel;
  const label = option.label?.trim() || MODEL_LABELS[model] || MODEL_LABELS.quote;

  if (model === 'free') {
    return { label, price: 'Free', isQuote: false };
  }

  const hasAmount = typeof option.amount === 'number';
  if (!showPrices || model === 'quote' || !hasAmount) {
    // Value-based and equity work still read better with their own wording.
    const price =
      showPrices && model === 'value'
        ? 'Scoped to the outcome'
        : showPrices && model === 'alternative'
          ? 'Open to equity or trade'
          : QUOTE_TEXT;
    return { label, price, isQuote: true };
  }

  const currency = option.currency || 'CAD';
  const amount = formatAmount(option.amount as number, currency);
  const range =
    typeof option.amountMax === 'number'
      ? `${amount}–${formatAmount(option.amountMax, currency)}`
      : amount;
  const unit = option.unit?.trim() || DEFAULT_UNITS[model];

  return { label, price: unit ? `${range} / ${unit}` : range, isQuote: false };
}

/**
 * A service with no authored options is not a mistake — it means "we'll talk".
 */
export function pricingOptionsFor(
  options: PricingOption[] | null,
  showPrices: boolean
): FormattedPrice[] {
  if (!options || options.length === 0) {
    return [{ label: MODEL_LABELS.quote, price: QUOTE_TEXT, isQuote: true }];
  }
  return options.map((option) => formatPricingOption(option, showPrices));
}
