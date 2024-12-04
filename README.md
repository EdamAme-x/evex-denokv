# evex-denokv

Perfectly typed Deno KV by [Evex](https://evex.land) 🪄

## Installation

```bash
deno add jsr:@evex/denokv
```

## Usage

```ts
import { DenoKv } from "jsr:@evex/denokv";

const kv = new DenoKv<
    [{ key: ["users"], schema: { name: string }[] }],
    [{ key: ["user", number], schema: { name: string } }]
>();

await kv.set(["user", 123], { name: "Evex" }); // typed

await kv.get(["users"]); // typed

await kv.delete(["user", 123]); // typed

await kv.delete(["group"]) // type error cuz group is not in schema

// and more
```

Hint: 
    If you want to use this on other runtime.
    You should define `Deno.Kv`  on global scope.   

## License
MIT
