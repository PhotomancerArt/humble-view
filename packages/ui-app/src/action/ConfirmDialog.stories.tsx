import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, waitFor } from "storybook/test";

import { Button } from "@humble/ui-base";

import { ConfirmDialog } from "./ConfirmDialog";

function Example(props: { onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        Cancel order
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Cancel order #1042?"
        body="The customer will be notified. This cannot be undone."
        confirmLabel="Cancel order"
        destructive
        onConfirm={props.onConfirm}
        testId="confirm"
      />
    </>
  );
}

const meta = {
  title: "app/ConfirmDialog",
  component: Example,
  args: { onConfirm: fn() },
} satisfies Meta<typeof Example>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TestConfirms: Story = {
  name: "Test: confirming fires once and closes",
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Cancel order" }));
    await userEvent.click(await screen.findByTestId("confirm-confirm"));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await expect(args.onConfirm).toHaveBeenCalledOnce();
  },
};
