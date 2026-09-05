# @humble/feat-shipments

The shipments feature, in the exact shape of [`feat-orders`](../feat-orders/README.md) — read that
README for the layout. What is different here:

- **An async op with progress.** `dispatch` hands the shipment to the carrier; the backend sleeps
  on the injected clock, so the Ux test advances a `FakeClock` and asserts the `disabled` +
  `progress` affordance in between. Page stories keep the carrier latency at 0.
- **Scripted carrier failure.** A `carrier.fail(shipment)` predicate on the fake backend refuses a
  dispatch with `carrier_error`; the row becomes `failed`, a notice appears, and the action becomes
  "Retry dispatch".
- **Publishing, not importing.** After a successful `dispatch` or `markDelivered` the Ux publishes
  `shipment.dispatched` / `shipment.delivered` with the order id. `feat-orders` subscribes; neither
  package imports the other.
- No role rule: shipments have no forbidden action.

Test ids: `shipments-row-<id>`, `shipments-status-<id>`, `shipments-dispatch-<id>`,
`shipments-markDelivered-<id>`, `shipments-notice`.
