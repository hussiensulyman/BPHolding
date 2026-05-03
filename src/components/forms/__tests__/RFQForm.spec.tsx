import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RFQForm } from "@/components/forms/RFQForm";
import arMessages from "@/messages/ar.json";
import enMessages from "@/messages/en.json";

type Locale = "ar" | "en";

const { pushMock, localeState, createSignatureMock, submitRfqMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  localeState: { locale: "en" as Locale },
  createSignatureMock: vi.fn(
    async (input: { fileName: string }) =>
      ({
        success: true,
        data: {
          mode: "mock",
          mockPublicUrlBase: "https://ik.imagekit.io/demo/rfq/mock",
          fileName: input.fileName,
        },
      }) as const,
  ),
  submitRfqMock: vi.fn(async () => ({
    success: true,
    submissionId: "RFQ-2026-00001",
  })),
}));

function getByPath(source: unknown, key: string): string {
  const value = key
    .split(".")
    .reduce<unknown>(
      (current, segment) => (current as Record<string, unknown>)?.[segment],
      source,
    );

  return typeof value === "string" ? value : key;
}

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/app/actions/submit-rfq", () => ({
  createRfqUploadSignatureAction: createSignatureMock,
  submitRfqAction: submitRfqMock,
}));

vi.mock("@/lib/hooks/use-locale", () => ({
  useLocale: () => {
    const messages = localeState.locale === "ar" ? arMessages : enMessages;

    return {
      locale: localeState.locale,
      dir: localeState.locale === "ar" ? "rtl" : "ltr",
      t: (key: string) => getByPath(messages, key),
    };
  },
}));

async function moveToContactStep() {
  fireEvent.change(screen.getByLabelText("Project Location"), {
    target: { value: "Al Olaya" },
  });
  fireEvent.change(screen.getByLabelText(/^Project Description/), {
    target: {
      value:
        "Turnkey mixed-use project with MEP systems, fit-out, and phased handover planning.",
    },
  });

  fireEvent.click(screen.getByRole("button", { name: "Next" }));

  await waitFor(() => {
    expect(screen.getByText("Contact Information")).toBeInTheDocument();
  });
}

async function moveToFilesStep() {
  await moveToContactStep();

  fireEvent.change(screen.getByLabelText("Contact Name"), {
    target: { value: "Hussam Al-Qahtani" },
  });
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "hussam@example.com" },
  });
  fireEvent.change(screen.getByLabelText("Phone (+966)"), {
    target: { value: "+966512345678" },
  });

  fireEvent.click(screen.getByRole("button", { name: "Next" }));

  await waitFor(() => {
    expect(screen.getByText("Files and Review")).toBeInTheDocument();
  });
}

describe("RFQForm", () => {
  beforeEach(() => {
    localeState.locale = "en";
    createSignatureMock.mockClear();
    submitRfqMock.mockClear();
    pushMock.mockClear();
    window.localStorage.clear();
  });

  it("enforces per-step validation before moving forward", async () => {
    render(<RFQForm initialCategory="RESIDENTIAL" />);

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => {
      expect(
        screen.getByText("Location must be at least 2 characters."),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByRole("heading", { name: "Contact Information" }),
    ).not.toBeInTheDocument();
  });

  it("supports file preview and removal on step three", async () => {
    render(<RFQForm initialCategory="COMMERCIAL" />);

    await moveToFilesStep();

    const fileInput = screen.getByTestId("rfq-file-input");
    const imageFile = new File(["binary"], "site-plan.png", {
      type: "image/png",
    });

    fireEvent.change(fileInput, {
      target: {
        files: [imageFile],
      },
    });

    await waitFor(() => {
      expect(screen.getByText("site-plan.png")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "Remove" }));

    await waitFor(() => {
      expect(screen.queryByText("site-plan.png")).not.toBeInTheDocument();
    });
  });

  it("shows Arabic validation copy and RTL step alignment", async () => {
    localeState.locale = "ar";

    render(<RFQForm initialCategory="RESIDENTIAL" />);

    fireEvent.click(screen.getByRole("button", { name: "التالي" }));

    await waitFor(() => {
      expect(
        screen.getByText("يجب أن يتكون الموقع من حرفين على الأقل."),
      ).toBeInTheDocument();
    });

    const stepList = screen.getByTestId("rfq-step-indicator").querySelector("ol");
    expect(stepList).toHaveClass("text-right");
  });
});
