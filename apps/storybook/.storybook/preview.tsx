import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";

import { TooltipProvider } from "@humble/ui-core";

import "@humble/ui-design/theme.css";

const preview: Preview = {
  decorators: [
    withThemeByClassName({
      themes: { light: "", dark: "dark" },
      defaultTheme: "light",
    }),
    // The app root provides tooltips once; stories get the same root.
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /date$/i } },
    // "todo": show a11y findings in the test UI without failing CI.
    a11y: { test: "todo" },
  },
};

export default preview;
