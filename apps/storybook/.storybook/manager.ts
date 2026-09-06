import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

// The sidebar header names the project and links to the repo.
addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "Dispatch · humble-ui-stack",
    brandUrl: "https://github.com/PhotomancerArt/humble-ui-stack",
    brandTarget: "_blank",
  }),
});
