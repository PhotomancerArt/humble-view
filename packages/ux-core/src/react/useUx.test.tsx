// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";

afterEach(cleanup);

import { Providers } from "../provider/Providers";
import { available } from "../ux/Affordance";
import type { DispatchResult, Ux } from "../ux/Ux";
import { UxStore } from "../ux/UxStore";
import { useUx } from "./useUx";
import { World } from "./World";

type Op = { kind: "increment" };
type State = { count: number };

function CounterUx(): Ux<State, Op> {
  const store = UxStore<State>({ count: 0 });
  return {
    ...store,
    async dispatch(): Promise<DispatchResult> {
      store.setState((s) => ({ count: s.count + 1 }));
      return await Promise.resolve({ ok: true });
    },
    dispose: () => undefined,
  };
}

function Counter({ ux }: { ux: Ux<State, Op> }) {
  const { state, dispatch } = useUx(ux);
  return (
    <button data-testid="count" onClick={() => void dispatch({ kind: "increment" })}>
      {state.count}
    </button>
  );
}

describe("useUx", () => {
  test("renders the Ux state and re-renders on change", async () => {
    const ux = CounterUx();
    render(<Counter ux={ux} />);
    expect(screen.getByTestId("count").textContent).toBe("0");

    await act(() => ux.dispatch({ kind: "increment" }));

    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(available().status).toBe("available");
  });
});

describe("World", () => {
  const world = Providers(() => ({ ux: CounterUx() }));

  test("boots the chain and renders children with the context", async () => {
    render(
      <World provider={world} fallback={<span>booting</span>}>
        {({ ux }) => <Counter ux={ux} />}
      </World>,
    );
    expect(screen.getByText("booting")).toBeTruthy();

    expect((await screen.findByTestId("count")).textContent).toBe("0");
  });
});
