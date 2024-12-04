type KvSchema = {
    key: Deno.KvKey,
    schema: unknown
}[]

type CompareKeys<k1 extends Deno.KvKey, k2 extends Deno.KvKey> = k1 extends k2 ? true : false;

type ExtractKeys<S extends KvSchema> = S[number]["key"];

type IsNever<T> = [T] extends [never] ? true : false;

// [{ key: ["user", 123], schema: { id: string, name: string } }] => { id: string, name: string }
type ExtractSchema<S extends KvSchema, K extends Deno.KvKey> = ({
    [Index in keyof S]: CompareKeys<S[Index]["key"], K> extends true ? S[Index]["schema"] : never
}[keyof S]) extends infer T ? IsNever<T> extends true ? never : T : never;

// ["user", 123] => ["user", number]
type AbstractKeys<Keys extends Deno.KvKey> = {
    [Index in keyof Keys]: Keys[Index] extends number ? number : Keys[Index];
};

/**
 * @see {@link https://github.com/EdamAme-x/evex-denokv}
 * 
 * @description Typed Deno Kv
 * 
 * @example
 * ```ts
 * import { DenoKv } from "jsr:@evex/denokv";
 * 
 * const kv = new DenoKv<[{ key: ["user"], schema: { id: string, name: string } }]>();
 * 
 * kv.set(["user"], { id: "123", name: "John Doe" }); // typed
 * 
 * // Dynamic Key
 * 
 * const kv = new DenoKv<[{ key: ["user", number], schema: { id: string, name: string } }]>();
 * 
 * kv.set(["user", 123], { id: "123", name: "John Doe" }); // typed
 * ```
 */
export class DenoKv<S extends KvSchema> extends Deno.Kv {
  // @ts-expect-error: TYPE HACK
  public override get<T = unknown, K extends ExtractKeys<S>>(
    key: K,
    options?: { consistency?: Deno.KvConsistencyLevel },
  ): Promise<Deno.KvEntryMaybe<
    T extends unknown ? ExtractSchema<S, AbstractKeys<K>> : T
  >> {
    return super.get(key, options);
  }

  public override set<K extends ExtractKeys<S>>(
    key: K,
    value: ExtractSchema<S, AbstractKeys<K>>,
    options?: { expireIn?: number },
  ): Promise<Deno.KvCommitResult> {
    return super.set(key, value, options);
  }

  public override delete(
    key: ExtractKeys<S>,
  ): Promise<void> {
    return super.delete(key);
  }

  // @ts-expect-error: TYPE HACK
  public override list<T = unknown, K extends ExtractKeys<S>>(
    selector: Deno.KvListSelector & {
        prefix?: K,
        start?: K,
        end?: K
    },
    options?: Deno.KvListOptions,
  ): Deno.KvListIterator<T extends unknown ? ExtractSchema<S, AbstractKeys<K>> : T> {
    return super.list(selector, options);
  }
}

const kv = new DenoKv<[{ key: ["user", number], schema: { id: string, name: string } }, { key: ["user", string], schema: { id: number, name: string } }]>();

(await kv.get(["user", 123])).value;