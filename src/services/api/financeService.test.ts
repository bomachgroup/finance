import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequest } from "./apiClient";
import { financeService } from "./financeService";

vi.mock("./apiClient", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./apiClient")>()),
  apiRequest: vi.fn(),
}));

const mockedApiRequest = vi.mocked(apiRequest);

describe("financeService command center", () => {
  beforeEach(() => vi.resetAllMocks());

  it("does not replace a Finance forbidden response with Revenue Execution data", async () => {
    mockedApiRequest.mockResolvedValueOnce({ status: 403, error: "Forbidden" });

    const result = await financeService.getCommandCenter();

    expect(result).toEqual({ status: 403, error: "Forbidden" });
    expect(mockedApiRequest).toHaveBeenCalledTimes(1);
    expect(mockedApiRequest).toHaveBeenCalledWith("/api/v1/finance/command-center");
  });

  it("does not replace a Finance cash-flow failure with Revenue Execution forecast data", async () => {
    mockedApiRequest.mockResolvedValueOnce({ status: 404, error: "Not found" });

    const result = await financeService.getCashFlowForecast({ forecast_months: 3 });

    expect(result).toEqual({ status: 404, error: "Not found" });
    expect(mockedApiRequest).toHaveBeenCalledTimes(1);
    expect(mockedApiRequest.mock.calls[0]?.[0]).toContain("/api/v1/finance/cash-flow/forecast");
  });

  it("does not replace a client authorization failure with an unrelated client endpoint", async () => {
    mockedApiRequest.mockResolvedValueOnce({ status: 403, error: "Forbidden" });

    const result = await financeService.listClients();

    expect(result).toEqual({ status: 403, error: "Forbidden" });
    expect(mockedApiRequest).toHaveBeenCalledTimes(1);
  });
});
