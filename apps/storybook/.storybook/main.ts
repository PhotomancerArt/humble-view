import path from "node:path";

import type { StorybookConfig } from "@storybook/react-vite";

const packagesDir = path.resolve(import.meta.dirname, "../../../packages");

const config: StorybookConfig = {
  stories: ["../../../packages/*/src/**/*.stories.@(ts|tsx)", "../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
    "@storybook/addon-themes",
    "@storybook/addon-vitest",
  ],
  framework: { name: "@storybook/react-vite", options: {} },
  viteFinal: (config) => {
    config.server ??= {};
    config.server.fs = {
      ...config.server.fs,
      allow: [...(config.server.fs?.allow ?? []), packagesDir],
    };
    return config;
  },
};

export default config;
