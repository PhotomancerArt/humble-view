import { useState } from "react";

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@humble/ui-base";

/** Where the rest of the project lives. One list, used by the About dialog, the footer, and Storybook. */
export const links = [
  {
    id: "post",
    label: "The post",
    href: "https://lab.photomancer.art/post/2026-09-humble-ui-stack/",
    description: "A Humble UI Stack: the architecture, explained through its tests.",
  },
  {
    id: "repo",
    label: "Source",
    href: "https://github.com/PhotomancerArt/humble-ui-stack",
    description: "The repo, its README, and AGENTS.md for coding agents.",
  },
  {
    id: "dashboard",
    label: "Dashboard",
    href: "https://photomancerart.github.io/humble-ui-stack/",
    description: "This app, running the real HTTP path in the browser with no server.",
  },
  {
    id: "storybook",
    label: "Storybook",
    href: "https://photomancerart.github.io/humble-ui-stack/storybook/",
    description: "Every component and page, with play tests.",
  },
] as const;

/** What Dispatch is, and where the rest of the project lives. */
export function About() {
  return (
    <div className="space-y-4 text-sm">
      <p>
        Dispatch is a demo of the <strong>humble UI stack</strong>: three layers per feature
        (Service, Ux, View), where a feature&apos;s logic gets plain unit tests, its components get
        stories, and both run on the same fake services.
      </p>
      <p className="text-muted-foreground">
        Everything here is simulated: no persistence, no login. The role is a switch.
      </p>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
              data-testid={`about-link-${link.id}`}
            >
              {link.label}
            </a>
            <span className="text-muted-foreground"> · {link.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The header button that opens About in a dialog. */
export function AboutButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="sm" data-testid="about-open" onClick={() => setOpen(true)}>
        About
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="about-dialog">
          <DialogHeader>
            <DialogTitle>About Dispatch</DialogTitle>
            <DialogDescription>Where the rest of the project lives.</DialogDescription>
          </DialogHeader>
          <About />
        </DialogContent>
      </Dialog>
    </>
  );
}

/** The footer row: the same links, small, visible without a click. */
export function AboutLinks() {
  return (
    <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <span>Dispatch, a humble-ui-stack demo.</span>
      {links.map((link) => (
        <a
          key={link.id}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4 hover:text-foreground"
          data-testid={`footer-link-${link.id}`}
        >
          {link.label}
        </a>
      ))}
    </p>
  );
}
