import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";

import { Button } from "./button";
import { Toaster } from "./sonner";

function Example() {
  return (
    <div className="flex gap-3">
      <Toaster />
      <Button variant="outline" onClick={() => toast.success("Order #1042 cancelled")}>
        Success toast
      </Button>
      <Button variant="outline" onClick={() => toast.error("Carrier rejected the shipment")}>
        Error toast
      </Button>
    </div>
  );
}

const meta = {
  title: "base/Toaster",
  component: Example,
} satisfies Meta<typeof Example>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
