import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, fn, screen, waitFor } from "storybook/test";

import { type Action, available, disabled, forbidden, unavailable } from "@humble/ux-core";

import { ActionButton } from "./ActionButton";

type Op = { kind: "cancel" } | { kind: "refund" } | { kind: "dispatch" };

const cancel: Action<Op> = {
  op: { kind: "cancel" },
  label: "Cancel",
  affordance: available(),
  destructive: true,
  confirm: {
    title: "Cancel order #1042?",
    body: "The customer will be notified. This cannot be undone.",
    confirmLabel: "Cancel order",
  },
};

const meta = {
  title: "app/ActionButton",
  component: ActionButton<Op>,
  args: { onDispatch: fn(), action: cancel, testId: "orders-cancel-1042" },
} satisfies Meta<typeof ActionButton<Op>>;
export default meta;

type Story = StoryObj<typeof meta>;

export const AllStates: Story = {
  render: (args) => (
    <div className="grid gap-4">
      {(
        [
          ["available", { op: { kind: "dispatch" }, label: "Dispatch", affordance: available() }],
          ["available · destructive", { ...cancel, confirm: undefined }],
          ["available · with confirm", cancel],
          [
            "disabled",
            {
              op: { kind: "cancel" },
              label: "Cancel",
              affordance: disabled("Only pending orders can be cancelled"),
            },
          ],
          [
            "disabled · in progress",
            {
              op: { kind: "dispatch" },
              label: "Dispatch",
              affordance: disabled("Dispatch in progress", { label: "Dispatching…" }),
            },
          ],
          [
            "forbidden",
            { op: { kind: "refund" }, label: "Refund", affordance: forbidden("Admins only") },
          ],
          [
            "unavailable (renders nothing)",
            { op: { kind: "refund" }, label: "Refund", affordance: unavailable() },
          ],
        ] as Array<[string, Action<Op>]>
      ).map(([name, action]) => (
        <div key={name} className="grid grid-cols-[16rem_1fr] items-center gap-4 text-sm">
          <span className="text-muted-foreground">{name}</span>
          <div className="flex h-8 items-center">
            <ActionButton {...args} action={action} />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const TestConfirmBeforeDispatch: Story = {
  name: "Test: confirm before dispatch",
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByTestId("orders-cancel-1042"));
    await expect(args.onDispatch).not.toHaveBeenCalled();

    await userEvent.click(await screen.findByTestId("orders-cancel-1042-confirm-confirm"));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(args.onDispatch).toHaveBeenCalledOnce();
    await expect(args.onDispatch).toHaveBeenCalledWith({ kind: "cancel" });
  },
};

export const TestForbiddenDoesNotDispatch: Story = {
  name: "Test: forbidden does not dispatch",
  args: {
    action: { op: { kind: "refund" }, label: "Refund", affordance: forbidden("Admins only") },
    testId: "orders-refund-1042",
  },
  play: async ({ args, canvas }) => {
    const button = canvas.getByTestId("orders-refund-1042");
    await expect(button).toHaveAttribute("data-affordance", "forbidden");
    await expect(button).toBeDisabled();
    await expect(button).toHaveAttribute("aria-description", "Admins only");

    await fireEvent.click(button);

    await expect(args.onDispatch).not.toHaveBeenCalled();
  },
};
