import { afterEach, describe, expect, it } from "vitest";
import {
  canAutoConfirmBookingStatus,
  expectedDepositMinor,
  paystackAmountMatches,
  paystackCurrencyMatches,
} from "./paystack-match";

describe("expectedDepositMinor", () => {
  it("converts GHS major to pesewas", () => {
    expect(expectedDepositMinor(50)).toBe(5000);
    expect(expectedDepositMinor(99.5)).toBe(9950);
  });
});

describe("paystackAmountMatches", () => {
  it("allows null amount (webhook without amount)", () => {
    expect(paystackAmountMatches(50, null)).toBe(true);
  });

  it("allows zero deposit", () => {
    expect(paystackAmountMatches(0, 100)).toBe(true);
  });

  it("requires exact minor match for paid deposits", () => {
    expect(paystackAmountMatches(50, 5000)).toBe(true);
    expect(paystackAmountMatches(50, 4999)).toBe(false);
  });
});

describe("paystackCurrencyMatches", () => {
  const prev = process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY;

  afterEach(() => {
    if (prev === undefined) delete process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY;
    else process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY = prev;
  });

  it("allows missing currency", () => {
    expect(paystackCurrencyMatches(null)).toBe(true);
    expect(paystackCurrencyMatches(undefined)).toBe(true);
  });

  it("defaults to GHS", () => {
    delete process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY;
    expect(paystackCurrencyMatches("GHS")).toBe(true);
    expect(paystackCurrencyMatches("ghs")).toBe(true);
    expect(paystackCurrencyMatches("USD")).toBe(false);
  });

  it("respects configured currency", () => {
    process.env.NEXT_PUBLIC_PAYSTACK_CURRENCY = "ngn";
    expect(paystackCurrencyMatches("NGN")).toBe(true);
    expect(paystackCurrencyMatches("GHS")).toBe(false);
  });
});

describe("canAutoConfirmBookingStatus", () => {
  it("confirms pending and awaiting_approval only", () => {
    expect(canAutoConfirmBookingStatus("pending")).toBe(true);
    expect(canAutoConfirmBookingStatus("awaiting_approval")).toBe(true);
    expect(canAutoConfirmBookingStatus("confirmed")).toBe(false);
    expect(canAutoConfirmBookingStatus("cancelled")).toBe(false);
    expect(canAutoConfirmBookingStatus("completed")).toBe(false);
  });
});
