# Dispatch — a humble-view demo

**Under construction.**

Dispatch is a small shipping dashboard that demonstrates a three-layer frontend architecture —
Service / Ux / View — with two proofs that share one set of fakes: plain unit tests of the Ux layer
(no DOM) and Storybook stories of the View layer (no backend). It is the leading example of the post
"The Humble View", and builds on
[Providers: Dependency Injection for Test-Driven TypeScript](https://lab.photomancer.art/post/2026-08-04-providers/)
and the companion post on fixture builders.
