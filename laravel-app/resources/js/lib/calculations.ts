/**
 * Server-side quotation total calculations.
 *
 * The reference UI shows a "Quotation summary" panel with, in this order:
 *   Subtotal / Discount / Tax / ------- / Total
 * and the note "Totals are calculated by the server using the selected
 * store, customer discount, and current tax rules." The exact formula was
 * never observed (no product was added in the recorded session), so the
 * formula below is a documented, standard-POS assumption — see
 * QUOTATION_AUDIT.md "Business Logic" / "Unknown Behavior".
 *
 * Per line:
 *   lineGross     = quantity * unitPrice
 *   lineDiscount  = discountType === PERCENT ? lineGross * discountValue/100 : discountValue
 *   lineTaxable   = lineGross - lineDiscount
 *   lineTax       = lineTaxable * (taxRate / 100)
 *   lineTotal     = lineTaxable + lineTax
 *
 * Quotation:
 *   subtotal        = sum(lineGross)                       // pre-discount, pre-tax
 *   quotationDiscount = header-level discount (PERCENT of subtotal, or FIXED)
 *   discountTotal    = sum(lineDiscount) + quotationDiscount
 *   taxTotal         = sum(lineTax)                         // computed on line-level discount only
 *   total            = subtotal - discountTotal + taxTotal
 */

export type DiscountType = "PERCENT" | "FIXED";

export interface CalcLineInput {
  quantity: number;
  unitPrice: number;
  discountType: DiscountType;
  discountValue: number;
  taxRate: number; // percent, e.g. 15 = 15%
}

export interface CalcLineResult extends CalcLineInput {
  lineGross: number;
  lineDiscount: number;
  taxableAmount: number;
  taxAmount: number;
  lineTotal: number;
}

export interface CalcQuotationInput {
  lines: CalcLineInput[];
  discountType: DiscountType;
  discountValue: number;
}

export interface CalcQuotationResult {
  lines: CalcLineResult[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
}

function round3(value: number) {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

function computeLineDiscount(gross: number, type: DiscountType, value: number) {
  const discount = type === "PERCENT" ? (gross * value) / 100 : value;
  return Math.min(Math.max(discount, 0), gross);
}

export function calculateQuotationTotals(
  input: CalcQuotationInput,
): CalcQuotationResult {
  let subtotal = 0;
  let lineDiscountTotal = 0;
  let taxTotal = 0;

  const lines: CalcLineResult[] = input.lines.map((line) => {
    const lineGross = round3(line.quantity * line.unitPrice);
    const lineDiscount = round3(
      computeLineDiscount(lineGross, line.discountType, line.discountValue),
    );
    const taxableAmount = round3(lineGross - lineDiscount);
    const taxAmount = round3((taxableAmount * line.taxRate) / 100);
    const lineTotal = round3(taxableAmount + taxAmount);

    subtotal += lineGross;
    lineDiscountTotal += lineDiscount;
    taxTotal += taxAmount;

    return { ...line, lineGross, lineDiscount, taxableAmount, taxAmount, lineTotal };
  });

  subtotal = round3(subtotal);
  lineDiscountTotal = round3(lineDiscountTotal);
  taxTotal = round3(taxTotal);

  const quotationDiscount = round3(
    input.discountType === "PERCENT"
      ? (subtotal * input.discountValue) / 100
      : Math.min(input.discountValue, Math.max(subtotal - lineDiscountTotal, 0)),
  );

  const discountTotal = round3(lineDiscountTotal + quotationDiscount);
  const total = round3(subtotal - discountTotal + taxTotal);

  return { lines, subtotal, discountTotal, taxTotal, total };
}
