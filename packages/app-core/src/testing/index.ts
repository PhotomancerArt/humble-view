// The fake world for Ux tests and page stories. Builders and data providers come from
// `@humble/backend/testing` and are re-exported here so a test needs one import.
export * from "@humble/backend/testing";
export { FakeScript } from "./FakeScript";
export { provideFakeBackend } from "./provideFakeBackend";
