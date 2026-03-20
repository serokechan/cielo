import { describe, expect, test } from "bun:test";

import { parsePaymentIntent } from "../lib/intent-parser";

const now = new Date("2026-03-19T20:14:00.000Z");

describe("Cielo intent parser", () => {
  test("parses a complete happy-path payment intent", () => {
    const intent = parsePaymentIntent(
      "send 5 cUSD to 0x1234567890abcdef1234567890abcdef12345678 for lunch",
      {
        id: "intent_happy",
        now,
      },
    );

    expect(intent.id).toBe("intent_happy");
    expect(intent.amount).toBe("5");
    expect(intent.token).toBe("cUSD");
    expect(intent.recipient).toBe("0x1234567890abcdef1234567890abcdef12345678");
    expect(intent.purpose).toBe("lunch");
    expect(intent.network).toBe("celo");
    expect(intent.status).toBe("parsed");
    expect(intent.missingFields).toEqual([]);
    expect(intent.confidence).toBe(1);
  });

  test("returns missing token when payment intent is ambiguous", () => {
    const intent = parsePaymentIntent(
      "send 5 to 0x1234567890abcdef1234567890abcdef12345678",
      {
        id: "intent_missing_token",
        now,
      },
    );

    expect(intent.amount).toBe("5");
    expect(intent.token).toBeNull();
    expect(intent.recipient).toBe("0x1234567890abcdef1234567890abcdef12345678");
    expect(intent.status).toBe("needs_clarification");
    expect(intent.missingFields).toEqual(["token"]);
    expect(intent.confidence).toBeLessThan(1);
  });

  test("parses token case-insensitively and allows purpose to be optional", () => {
    const intent = parsePaymentIntent(
      "Pay 12.5 usdc to 0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      {
        id: "intent_usdc",
        now,
      },
    );

    expect(intent.amount).toBe("12.5");
    expect(intent.token).toBe("USDC");
    expect(intent.purpose).toBeNull();
    expect(intent.status).toBe("parsed");
    expect(intent.missingFields).toEqual([]);
    expect(intent.confidence).toBe(0.9);
  });

  test("marks multiple missing fields when input is too incomplete", () => {
    const intent = parsePaymentIntent("send cUSD for lunch", {
      id: "intent_incomplete",
      now,
    });

    expect(intent.amount).toBeNull();
    expect(intent.token).toBe("cUSD");
    expect(intent.recipient).toBeNull();
    expect(intent.purpose).toBe("lunch");
    expect(intent.status).toBe("needs_clarification");
    expect(intent.missingFields).toEqual(["amount", "recipient"]);
  });
});
