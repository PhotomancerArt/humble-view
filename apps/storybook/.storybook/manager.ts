import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

// The sidebar header names the project and links to the repo.
addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "Dispatch · humble-view",
    brandUrl: "https://github.com/PhotomancerArt/humble-view",
    brandTarget: "_blank",
  }),
});
