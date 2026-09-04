import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";

function Example() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <TooltipContent>Only pending orders can be cancelled</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const meta = {
  title: "core/Tooltip",
  component: Example,
} satisfies Meta<typeof Example>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
