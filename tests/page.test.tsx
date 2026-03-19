import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";

import Home from "../app/page";

test("home page renders the Phase 1 MVP setup", () => {
  const html = renderToStaticMarkup(<Home />);

  expect(html).toContain("Cielo · Phase 1 Setup");
  expect(html).toContain("Safe Stablecoin Payment Copilot on Celo");
  expect(html).toContain("Celo Mainnet");
  expect(html).toContain("cUSD");
  expect(html).toContain("USDC");
});
