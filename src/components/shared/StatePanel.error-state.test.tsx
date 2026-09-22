import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ErrorState } from "./StatePanel";

describe("Finance error state", () => {
  it("uses an authorization-specific title", () => {
    render(<ErrorState kind="forbidden" message="Forbidden" />);
    expect(screen.getByRole("heading", { name: "You do not have access to this page" })).toBeInTheDocument();
  });

  it("uses an unavailable title for an unsupported endpoint", () => {
    render(<ErrorState kind="unsupported" message="Not found" />);
    expect(screen.getByRole("heading", { name: "This capability is unavailable" })).toBeInTheDocument();
  });
});
