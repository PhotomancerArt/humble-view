# @humble/feat-orders

The orders feature, and the template for every feature: copy this directory to add one.

```text
src/
  service/   OrderService (interface) · HttpOrderService · FakeOrderService · provideOrderService,
             provideFakeOrderService · OrderService.contract.ts (the suite) · .contract.test.ts
             (runs it twice: Fake, and Http over the in-process routes)
  ux/        OrdersOp · OrdersState (+ OrderRow, OrdersAction) · OrdersUx · provideOrdersUx ·
             OrdersUx.test.ts (the cold-open test first, then one test per rule)
  view/      OrdersView (renders state, dispatches ops, decides nothing) · OrdersView.stories.tsx
             (hand-built states) · OrdersPage (useUx + load on mount) · OrdersPage.stories.tsx
             (boots the Ux on the same world as the Ux tests, with play tests)
  testing/   sampleStates for component stories · demoOrders for page stories and the demo
```

Rules the Ux owns: cancel only while pending (destructive, asks first); refund admins-only and only
after delivery or cancellation, otherwise not offered; in-flight ops are disabled with progress; the
backend's refusal becomes a notice and a refetch; `shipment.delivered` and `shipment.dispatched`
refetch the order; `session.changed` recomputes affordances.

- May import: `ui-app`, `app-core`, `backend`, `ux-core`. Never `feat-shipments` or apps.
- Test ids: `orders-row-<id>`, `orders-status-<id>`, `orders-cancel-<id>`, `orders-refund-<id>`,
  `orders-notice`.
