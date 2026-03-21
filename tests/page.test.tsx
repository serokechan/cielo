import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import Home from "../app/page";

test("home page renders the Phase 1 MVP setup", () => {
  const html = renderToStaticMarkup(<Home />);

  expect(html).toContain("Cielo Payment Flow MVP");
  expect(html).toContain("Safe Stablecoin Payment Copilot on Celo");
  expect(html).toContain("Payment intent");
  expect(html).toContain("Generate preview");
  expect(html).toContain("Preview");
  expect(html).toContain("Result &amp; receipt");
});
