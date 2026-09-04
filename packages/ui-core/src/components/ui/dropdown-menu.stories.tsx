import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

function Example() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Role: admin</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuLabel>Switch role</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Admin</DropdownMenuItem>
        <DropdownMenuItem>Agent</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const meta = {
  title: "core/DropdownMenu",
  component: Example,
} satisfies Meta<typeof Example>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
