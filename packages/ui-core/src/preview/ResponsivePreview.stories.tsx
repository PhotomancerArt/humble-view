import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../components/ui/button";
import { ResponsivePreview } from "./ResponsivePreview";

function Example() {
  return (
    <ResponsivePreview>
      {(breakpoint) => (
        <div className="flex flex-col gap-2 p-4 @md:flex-row @md:items-center">
          <span className="text-sm">
            At <code className="font-mono">{breakpoint}</code> the buttons{" "}
            <span className="@md:hidden">stack</span>
            <span className="hidden @md:inline">sit in a row</span>.
          </span>
          <Button size="sm">Primary</Button>
          <Button size="sm" variant="outline">
            Secondary
          </Button>
        </div>
      )}
    </ResponsivePreview>
  );
}

const meta = {
  title: "core/ResponsivePreview",
  component: Example,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Example>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
