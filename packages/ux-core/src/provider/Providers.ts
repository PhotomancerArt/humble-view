// Vendored from ts-provide (https://github.com/PhotomancerArt/ts-provide); see README.
// This copy keeps the typed chain, async links, and disposal, and drops wrappers and
// ambient context: in the browser the Ux takes its context explicitly.

export type MaybePromise<T> = T | Promise<T>;
export type EmptyCtx = Record<never, never>;

/** A provider receives the context built so far and returns more context. */
export type ProviderFn<TIn, TOut extends object> = (ctx: TIn) => MaybePromise<TOut>;
export type AnyProvider = (ctx: never) => MaybePromise<object>;

/** The context a provider (or chain) yields, awaited. */
export type ProvidedCtx<T extends AnyProvider> = Awaited<ReturnType<T>>;

/** What a chain of providers yields: the intersection of every link's output. */
export type OutputOfChain<T extends readonly AnyProvider[]> = T extends readonly [
  infer First extends AnyProvider,
  ...infer Rest extends readonly AnyProvider[],
]
  ? Omit<ProvidedCtx<First>, typeof Symbol.dispose | typeof Symbol.asyncDispose> &
      OutputOfChain<Rest>
  : EmptyCtx;

export type ChainDisposable = { [Symbol.asyncDispose](): Promise<void> };
export type Chain<Out extends object> = () => Promise<Out & ChainDisposable>;

type Ctx = object;
type Link<In, Out extends Ctx> = (ctx: In) => MaybePromise<Out>;

export function Providers(): Chain<EmptyCtx>;
export function Providers<A extends Ctx>(a: Link<EmptyCtx, A>): Chain<A>;
export function Providers<A extends Ctx, B extends Ctx>(
  a: Link<EmptyCtx, A>,
  b: Link<A, B>,
): Chain<A & B>;
export function Providers<A extends Ctx, B extends Ctx, C extends Ctx>(
  a: Link<EmptyCtx, A>,
  b: Link<A, B>,
  c: Link<A & B, C>,
): Chain<A & B & C>;
export function Providers<A extends Ctx, B extends Ctx, C extends Ctx, D extends Ctx>(
  a: Link<EmptyCtx, A>,
  b: Link<A, B>,
  c: Link<A & B, C>,
  d: Link<A & B & C, D>,
): Chain<A & B & C & D>;
export function Providers<
  A extends Ctx,
  B extends Ctx,
  C extends Ctx,
  D extends Ctx,
  E extends Ctx,
>(
  a: Link<EmptyCtx, A>,
  b: Link<A, B>,
  c: Link<A & B, C>,
  d: Link<A & B & C, D>,
  e: Link<A & B & C & D, E>,
): Chain<A & B & C & D & E>;
export function Providers<
  A extends Ctx,
  B extends Ctx,
  C extends Ctx,
  D extends Ctx,
  E extends Ctx,
  F extends Ctx,
>(
  a: Link<EmptyCtx, A>,
  b: Link<A, B>,
  c: Link<A & B, C>,
  d: Link<A & B & C, D>,
  e: Link<A & B & C & D, E>,
  f: Link<A & B & C & D & E, F>,
): Chain<A & B & C & D & E & F>;
export function Providers<
  A extends Ctx,
  B extends Ctx,
  C extends Ctx,
  D extends Ctx,
  E extends Ctx,
  F extends Ctx,
  G extends Ctx,
>(
  a: Link<EmptyCtx, A>,
  b: Link<A, B>,
  c: Link<A & B, C>,
  d: Link<A & B & C, D>,
  e: Link<A & B & C & D, E>,
  f: Link<A & B & C & D & E, F>,
  g: Link<A & B & C & D & E & F, G>,
): Chain<A & B & C & D & E & F & G>;
export function Providers<
  A extends Ctx,
  B extends Ctx,
  C extends Ctx,
  D extends Ctx,
  E extends Ctx,
  F extends Ctx,
  G extends Ctx,
  H extends Ctx,
>(
  a: Link<EmptyCtx, A>,
  b: Link<A, B>,
  c: Link<A & B, C>,
  d: Link<A & B & C, D>,
  e: Link<A & B & C & D, E>,
  f: Link<A & B & C & D & E, F>,
  g: Link<A & B & C & D & E & F, G>,
  h: Link<A & B & C & D & E & F & G, H>,
): Chain<A & B & C & D & E & F & G & H>;
export function Providers(...providers: Array<Link<object, object>>): Chain<object> {
  return async () => {
    const disposers: Array<() => MaybePromise<void>> = [];
    let ctx: object = {};

    for (const provider of providers) {
      const { rest, dispose } = extractDispose(await provider(ctx));
      ctx = { ...ctx, ...rest };
      if (dispose) disposers.push(dispose);
    }

    return {
      ...ctx,
      [Symbol.asyncDispose]: async () => {
        for (const dispose of disposers.reverse()) await dispose();
      },
    };
  };
}

/** Runs the chain's disposers, if the context came from `Providers`. */
export async function disposeCtx(ctx: object): Promise<void> {
  const { dispose } = extractDispose(ctx);
  if (dispose) await dispose();
}

function extractDispose(out: object): { rest: object; dispose?: () => MaybePromise<void> } {
  const record = out as Record<symbol, unknown>;
  const sync = record[Symbol.dispose];
  const async = record[Symbol.asyncDispose];
  const rest = { ...out } as Record<symbol, unknown>;
  delete rest[Symbol.dispose];
  delete rest[Symbol.asyncDispose];

  if (typeof async === "function") {
    return { rest, dispose: () => (async as () => Promise<void>).call(out) };
  }
  if (typeof sync === "function") {
    return { rest, dispose: () => (sync as () => void).call(out) };
  }
  return { rest };
}
