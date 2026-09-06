import { withThemeByClassName } from "@storybook/addon-themes";
import type { Preview } from "@storybook/react-vite";

import { ResponsivePreview, TooltipProvider } from "@humble/ui-core";

import "@humble/ui-design/theme.css";

const preview: Preview = {
  globalTypes: {
    preview: {
      description: "Render the story once, or at every breakpoint side by side",
      toolbar: {
        title: "Preview",
        icon: "grid",
        items: [
          { value: "single", title: "Single" },
          { value: "responsive", title: "Responsive (sm · md · lg, light + dark)" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { preview: "single" },
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
    (Story, { globals }) =>
      globals.preview === "responsive" ? (
        <ResponsivePreview>
          <Story />
        </ResponsivePreview>
      ) : (
        <Story />
      ),
  ],
  parameters: {
    // About first, then the whole app, then the features, then the UI layers.
    options: {
      storySort: {
        order: ["dispatch", ["About", "Dispatch"], "orders", "shipments", "app", "core", "design"],
      },
    },
    controls: { matchers: { color: /(background|color)$/i, date: /date$/i } },
    // "todo": show a11y findings in the test UI without failing CI.
    a11y: { test: "todo" },
  },
};

export default preview;
