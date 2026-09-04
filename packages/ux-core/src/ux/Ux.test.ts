import { describe, expect, test } from "vitest";

import type { Action } from "./Action";
import { available, disabled } from "./Affordance";
import type { DispatchResult, Ux } from "./Ux";
import { UxStore } from "./UxStore";

type CounterOp = { kind: "increment" } | { kind: "reset" };
type CounterState = { count: number; actions: Action<CounterOp>[] };

function CounterUx(): Ux<CounterState, CounterOp> {
  const store = UxStore<CounterState>(project(0));

  function project(count: number): CounterState {
    return {
      count,
      actions: [
        { op: { kind: "increment" }, label: "Increment", affordance: available() },
        {
          op: { kind: "reset" },
          label: "Reset",
          affordance: count === 0 ? disabled("Already zero") : available(),
        },
      ],
    };
  }

  function dispatch(op: CounterOp): Promise<DispatchResult> {
    const action = store.getState().actions.find((a) => a.op.kind === op.kind);
    const affordance = action?.affordance ?? { status: "unavailable" };
    if (affordance.status !== "available") {
      const message = "reason" in affordance ? affordance.reason : "Not applicable";
      return Promise.resolve({ ok: false, reason: affordance.status, message });
    }
    store.setState(project(op.kind === "increment" ? store.getState().count + 1 : 0));
    return Promise.resolve({ ok: true });
  }

  return { ...store, dispatch, dispose: () => undefined };
}

describe("Ux", () => {
  test("subscribers are notified when state changes", async () => {
    const ux = CounterUx();
    const seen: number[] = [];
    const unsubscribe = ux.subscribe(() => seen.push(ux.getState().count));

    await ux.dispatch({ kind: "increment" });
    await ux.dispatch({ kind: "increment" });
    unsubscribe();
    await ux.dispatch({ kind: "increment" });

    expect(seen).toEqual([1, 2]);
    expect(ux.getState().count).toBe(3);
  });

  test("dispatch re-validates the affordance", async () => {
    const ux = CounterUx();

    expect(await ux.dispatch({ kind: "reset" })).toEqual({
      ok: false,
      reason: "disabled",
      message: "Already zero",
    });
    await ux.dispatch({ kind: "increment" });
    expect(await ux.dispatch({ kind: "reset" })).toEqual({ ok: true });
    expect(ux.getState().count).toBe(0);
  });

  test("state is data: it survives a JSON round trip", async () => {
    const ux = CounterUx();
    await ux.dispatch({ kind: "increment" });

    expect(JSON.parse(JSON.stringify(ux.getState()))).toEqual(ux.getState());
  });
});
