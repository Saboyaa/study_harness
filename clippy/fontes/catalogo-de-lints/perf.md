# Catálogo de lints do Clippy — grupo `perf`

## box_collection

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.57.0

### What it does

Checks for usage of `Box<T>` where T is a collection such as Vec anywhere in the code.
Check the Box documentation for more information.

### Why is this bad?

Collections already keeps their contents in a separate area on
the heap. So if you `Box` them, you just add another level of indirection
without any benefit whatsoever.

### Example

```rust
struct X {
    values: Box<Vec<Foo>>,
}
```

Better:

```rust
struct X {
    values: Vec<Foo>,
}
```

### Past names

- box_vec

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/types/mod.rs#L50

## boxed_local

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `Box<T>` where an unboxed `T` would
work fine.

### Why is this bad?

This is an unnecessary allocation, and bad for
performance. It is only necessary to allocate if you wish to move the box
into something.

### Example

```rust
fn foo(x: Box<u32>) {}
```

Use instead:

```rust
fn foo(x: u32) {}
```

### Configuration

- 

`too-large-for-stack`:  The maximum size of objects (in bytes) that will be linted. Larger objects are ok on the heap

(default: `200`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/escape.rs#L27

## cloned_ref_to_slice_refs

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.89.0

### What it does

Checks for slice references with cloned references such as `&[f.clone()]`.

### Why is this bad

A reference does not need to be owned in order to be used as a slice.

### Known problems

This lint does not know whether or not a clone implementation has side effects.

### Example

```rust
let data = 10;
let data_ref = &data;
take_slice(&[data_ref.clone()]);
```

Use instead:

```rust
use std::slice;
let data = 10;
let data_ref = &data;
take_slice(slice::from_ref(data_ref));
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/cloned_ref_to_slice_refs.rs#L21

## cmp_owned

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for conversions to owned values just for the sake
of a comparison.

### Why is this bad?

The comparison can operate on a reference, so creating
an owned value effectively throws it away directly afterwards, which is
needlessly consuming code and heap space.

### Example

```rust
if x.to_owned() == y {}
```

Use instead:

```rust
if x == y {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L180

## collapsible_str_replace

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.65.0

### What it does

Checks for consecutive calls to `str::replace` (2 or more)
that can be collapsed into a single call.

### Why is this bad?

Consecutive `str::replace` calls scan the string multiple times
with repetitive code.

### Example

```rust
let hello = "hesuo worpd"
    .replace('s', "l")
    .replace("u", "l")
    .replace('p', "l");
```

Use instead:

```rust
let hello = "hesuo worpd".replace(['s', 'u', 'p'], "l");
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L496

## double_ended_iterator_last

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.86.0

### What it does

Checks for `Iterator::last` being called on a `DoubleEndedIterator`, which can be replaced
with `DoubleEndedIterator::next_back`.

### Why is this bad?

`Iterator::last` is implemented by consuming the iterator, which is unnecessary if
the iterator is a `DoubleEndedIterator`. Since Rust traits do not allow specialization,
`Iterator::last` cannot be optimized for `DoubleEndedIterator`.

### Known issues

The suggestion may change code behavior when an iterator adapter has side effects. For example,
a `move` closure passed to `filter` may mutate captured state. Replacing `last()` with `next_back()`
changes the order in which the closure is evaluated, which could change the final result.

### Example

```rust
let last_arg = "echo hello world".split(' ').last();
```

Use instead:

```rust
let last_arg = "echo hello world".split(' ').next_back();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L548

## drain_collect

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.72.0

### What it does

Checks for calls to `.drain()` that clear the collection, immediately followed by a call to `.collect()`.

“Collection” in this context refers to any type with a `drain` method:
`Vec`, `VecDeque`, `BinaryHeap`, `HashSet`,`HashMap`, `String`

### Why is this bad?

Using `mem::take` is faster as it avoids the allocation.
When using `mem::take`, the old collection is replaced with an empty one and ownership of
the old collection is returned.

### Known issues

`mem::take(&mut vec)` is almost equivalent to `vec.drain(..).collect()`, except that
it also moves the capacity. The user might have explicitly written it this way
to keep the capacity on the original `Vec`.

### Example

```rust
fn remove_all(v: &mut Vec<i32>) -> Vec<i32> {
    v.drain(..).collect()
}
```

Use instead:

```rust
use std::mem;
fn remove_all(v: &mut Vec<i32>) -> Vec<i32> {
    mem::take(v)
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L580

## expect_fun_call

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for calls to `.expect(&format!(...))`, `.expect(foo(..))`,
etc., and suggests to use `unwrap_or_else` instead

### Why is this bad?

The function will always be called.

### Known problems

If the function has side-effects, not calling it will
change the semantics of the program, but you shouldn’t rely on that anyway.

### Example

```rust
foo.expect(&format!("Err {}: {}", err_code, err_msg));

// or

foo.expect(format!("Err {}: {}", err_code, err_msg).as_str());
```

Use instead:

```rust
foo.unwrap_or_else(|| panic!("Err {}: {}", err_code, err_msg));
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L689

## extend_with_drain

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.55.0

### What it does

Checks for use of `extend()` and `drain()` methods to transfer items from one `Vec`,
`VecDeque`, or `BinaryHeap` to another.

### Why is this bad?

Using `append()` instead of `extend()` is more concise, and faster because the
`append()` method can take advantage of knowledge of the collection’s structure.

### Example

```rust
let mut a = vec![1, 2, 3];
let mut b = vec![4, 5, 6];

a.extend(b.drain(..));
```

Use instead:

```rust
let mut a = vec![1, 2, 3];
let mut b = vec![4, 5, 6];

a.append(&mut b);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L764

## format_in_format_args

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.58.0

### What it does

Detects `format!` within the arguments of another macro that does
formatting such as `format!` itself, `write!` or `println!`. Suggests
inlining the `format!` call.

### Why is this bad?

The recommended code is both shorter and avoids a temporary allocation.

### Example

```rust
println!("error: {}", format!("something failed at {}", Location::caller()));
```

Use instead:

```rust
println!("error: something failed at {}", Location::caller());
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/format_args.rs#L36

## iter_overeager_cloned

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.60.0

### What it does

Checks for usage of `_.cloned().<func>()` where call to `.cloned()` can be postponed.

### Why is this bad?

It’s often inefficient to clone all elements of an iterator, when eventually, only some
of them will be consumed.

### Known Problems

This `lint` removes the side of effect of cloning items in the iterator.
A code that relies on that side-effect could fail.

### Examples

```rust
vec.iter().cloned().take(10);
vec.iter().cloned().last();
```

Use instead:

```rust
vec.iter().take(10).cloned();
vec.iter().last().cloned();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1617

## large_const_arrays

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.44.0

### What it does

Checks for large `const` arrays that should
be defined as `static` instead.

### Why is this bad?

Performance: const variables are inlined upon use.
Static items result in only one instance and has a fixed location in memory.

### Example

```rust
pub const a = [0u32; 1_000_000];
```

Use instead:

```rust
pub static a = [0u32; 1_000_000];
```

### Configuration

- 

`array-size-threshold`:  The maximum allowed size for arrays on the stack

(default: `16384`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/large_const_arrays.rs#L10

## large_enum_variant

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for large size differences between variants on
`enum`s.

### Why is this bad?

Enum size is bounded by the largest variant. Having one
large variant can penalize the memory layout of that enum.

### Known problems

This lint obviously cannot take the distribution of
variants in your running program into account. It is possible that the
smaller variants make up less than 1% of all instances, in which case
the overhead is negligible and the boxing is counter-productive. Always
measure the change this lint suggests.

For types that implement `Copy`, the suggestion to `Box` a variant’s
data would require removing the trait impl. The types can of course
still be `Clone`, but that is worse ergonomically. Depending on the
use case it may be possible to store the large data in an auxiliary
structure (e.g. Arena or ECS).

The lint will ignore the impact of generic types to the type layout by
assuming every type parameter is zero-sized. Depending on your use case,
this may lead to a false positive.

### Example

```rust
enum Test {
    A(i32),
    B([i32; 8000]),
}
```

Use instead:

```rust
// Possibly better
enum Test2 {
    A(i32),
    B(Box<[i32; 8000]>),
}
```

### Configuration

- 

`enum-variant-size-threshold`:  The maximum size of an enum’s variant to avoid box suggestion

(default: `200`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/large_enum_variant.rs#L12

## manual_clear

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.97.0

### What it does

Checks for `.truncate(0)` calls on standard library types where it can be replaced with `.clear()`.

Currently this includes `Vec`, `VecDeque`, `String`, and `OsString`.

### Why is this bad?

`clear()` expresses the intent better and is likely to be more efficient than `truncate(0)`.

### Example

```rust
let mut v = vec![1, 2, 3];
v.truncate(0);
```

Use instead:

```rust
let mut v = vec![1, 2, 3];
v.clear();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1862

## manual_contains

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.87.0

### What it does

Checks for usage of `iter().any()` on slices when it can be replaced with `contains()` and suggests doing so.

### Why is this bad?

`contains()` is more concise and idiomatic, while also being faster in some cases.

### Example

```rust
fn foo(values: &[u8]) -> bool {
    values.iter().any(|&v| v == 10)
}
```

Use instead:

```rust
fn foo(values: &[u8]) -> bool {
    values.contains(&10)
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1887

## manual_ignore_case_cmp

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.84.0

### What it does

Checks for manual case-insensitive ASCII comparison.

### Why is this bad?

The `eq_ignore_ascii_case` method is faster because it does not allocate
memory for the new strings, and it is more readable.

### Example

```rust
fn compare(a: &str, b: &str) -> bool {
    a.to_ascii_lowercase() == b.to_ascii_lowercase() || a.to_ascii_lowercase() == "abc"
}
```

Use instead:

```rust
fn compare(a: &str, b: &str) -> bool {
    a.eq_ignore_ascii_case(b) || a.eq_ignore_ascii_case("abc")
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_ignore_case_cmp.rs#L16

## manual_memcpy

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for for-loops that manually copy items between
slices that could be optimized by having a memcpy.

### Why is this bad?

It is not as fast as a memcpy.

### Example

```rust
for i in 0..src.len() {
    dst[i + 64] = src[i];
}
```

Use instead:

```rust
dst[64..(src.len() + 64)].clone_from_slice(&src[..]);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L397

## manual_retain

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.64.0

### What it does

Checks for code to be replaced by `.retain()`.

### Why is this bad?

`.retain()` is simpler and avoids needless allocation.

### Example

```rust
let mut vec = vec![0, 1, 2];
vec = vec.iter().filter(|&x| x % 2 == 0).copied().collect();
vec = vec.into_iter().filter(|x| x % 2 == 0).collect();
```

Use instead:

```rust
let mut vec = vec![0, 1, 2];
vec.retain(|x| x % 2 == 0);
vec.retain(|x| x % 2 == 0);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_retain.rs#L24

## manual_str_repeat

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.54.0

### What it does

Checks for manual implementations of `str::repeat`

### Why is this bad?

These are both harder to read, as well as less performant.

### Example

```rust
let x: String = std::iter::repeat('x').take(10).collect();
```

Use instead:

```rust
let x: String = "x".repeat(10);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2194

## manual_try_fold

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.72.0

### What it does

Checks for usage of `Iterator::fold` with a type that implements `Try`.

### Why is this bad?

The code should use `try_fold` instead, which short-circuits on failure, thus opening the
door for additional optimizations not possible with `fold` as rustc can guarantee the
function is never called on `None`, `Err`, etc., alleviating otherwise necessary checks. It’s
also slightly more idiomatic.

### Known issues

This lint doesn’t take into account whether a function does something on the failure case,
i.e., whether short-circuiting will affect behavior. Refactoring to `try_fold` is not
desirable in those cases.

### Example

```rust
vec![1, 2, 3].iter().fold(Some(0i32), |sum, i| sum?.checked_add(*i));
```

Use instead:

```rust
vec![1, 2, 3].iter().try_fold(0i32, |sum, i| sum.checked_add(*i));
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2216

## map_entry

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `contains_key` + `insert` on `HashMap`
or `BTreeMap`.

### Why is this bad?

Using `entry` is more efficient.

### Known problems

The suggestion may have type inference errors in some cases. e.g.

```rust
let mut map = std::collections::HashMap::new();
let _ = if !map.contains_key(&0) {
    map.insert(0, 0)
} else {
    None
};
```

### Example

```rust
if !map.contains_key(&k) {
    map.insert(k, v);
}
```

Use instead:

```rust
map.entry(k).or_insert(v);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/entry.rs#L18

## missing_const_for_thread_local

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.77.0

### What it does

Suggests to use `const` in `thread_local!` macro if possible.

### Why is this bad?

The `thread_local!` macro wraps static declarations and makes them thread-local.
It supports using a `const` keyword that may be used for declarations that can
be evaluated as a constant expression. This can enable a more efficient thread
local implementation that can avoid lazy initialization. For types that do not
need to be dropped, this can enable an even more efficient implementation that
does not need to track any additional state.

https://doc.rust-lang.org/std/macro.thread_local.html

### Example

```rust
thread_local! {
    static BUF: String = String::new();
}
```

Use instead:

```rust
thread_local! {
    static BUF: String = const { String::new() };
}
```

### Past names

- thread_local_initializer_can_be_made_const

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/missing_const_for_thread_local.rs#L12

## missing_spin_loop

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.61.0

### What it does

Checks for empty spin loops

### Why is this bad?

The loop body should have something like `thread::park()` or at least
`std::hint::spin_loop()` to avoid needlessly burning cycles and conserve
energy. Perhaps even better use an actual lock, if possible.

### Known problems

This lint doesn’t currently trigger on `while let` or
`loop { match .. { .. } }` loops, which would be considered idiomatic in
combination with e.g. `AtomicBool::compare_exchange_weak`.

### Example

```rust
use core::sync::atomic::{AtomicBool, Ordering};
let b = AtomicBool::new(true);
// give a ref to `b` to another thread,wait for it to become false
while b.load(Ordering::Acquire) {};
```

Use instead:

```rust
while b.load(Ordering::Acquire) {
    std::hint::spin_loop()
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L481

## new_instead_of_clear

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.101.0

### What it does

Checks for assignments of `Collection::new()` or `vec![]` to a collection
variable that was already initialized.

### Why is this bad?

The existing allocation is thrown away. `.clear()` empties the collection
without freeing the memory, so the next push/insert won’t need to allocate.

### Example

```rust
let mut v = Vec::new();
v.push(1);
f(&v);
v = Vec::new();
```

Use instead:

```rust
let mut v = Vec::new();
v.push(1);
f(&v);
v.clear();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L885

## readonly_write_lock

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.73.0

### What it does

Looks for calls to `RwLock::write` where the lock is only used for reading.

### Why is this bad?

The write portion of `RwLock` is exclusive, meaning that no other thread
can access the lock while this writer is active.

### Example

```rust
use std::sync::RwLock;
fn assert_is_zero(lock: &RwLock<i32>) {
    let num = lock.write().unwrap();
    assert_eq!(*num, 0);
}
```

Use instead:

```rust
use std::sync::RwLock;
fn assert_is_zero(lock: &RwLock<i32>) {
    let num = lock.read().unwrap();
    assert_eq!(*num, 0);
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3338

## redundant_allocation

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.44.0

### What it does

Checks for usage of redundant allocations anywhere in the code.

### Why is this bad?

Expressions such as `Rc<&T>`, `Rc<Rc<T>>`, `Rc<Arc<T>>`, `Rc<Box<T>>`, `Arc<&T>`, `Arc<Rc<T>>`,
`Arc<Arc<T>>`, `Arc<Box<T>>`, `Box<&T>`, `Box<Rc<T>>`, `Box<Arc<T>>`, `Box<Box<T>>`, add an unnecessary level of indirection.

### Example

```rust
fn foo(bar: Rc<&usize>) {}
```

Better:

```rust
fn foo(bar: &usize) {}
```

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/types/mod.rs#L266

## redundant_iter_cloned

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.92.0

### What it does

Checks for calls to `Iterator::cloned` where the original value could be used
instead.

### Why is this bad?

It is not always possible for the compiler to eliminate useless allocations and
deallocations generated by redundant `clone()`s.

### Example

```rust
let x = vec![String::new()];
let _ = x.iter().cloned().map(|x| x.len());
```

Use instead:

```rust
let x = vec![String::new()];
let _ = x.iter().map(|x| x.len());
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3395

## regex_creation_in_loops

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.84.0

### What it does

Checks for regex compilation inside a loop with a literal.

### Why is this bad?

Compiling a regex is a much more expensive operation than using one, and a compiled regex can be used multiple times.
This is documented as an antipattern on the regex documentation

### Example

```rust
for haystack in haystacks {
    let regex = regex::Regex::new(MY_REGEX).unwrap();
    if regex.is_match(haystack) {
        // Perform operation
    }
}
```

can be replaced with

```rust
let regex = regex::Regex::new(MY_REGEX).unwrap();
for haystack in haystacks {
    if regex.is_match(haystack) {
        // Perform operation
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/regex.rs#L40

## replace_box

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.92.0

### What it does

Detects assignments of `Default::default()` or `Box::new(value)`
to a place of type `Box<T>`.

### Why is this bad?

This incurs an extra heap allocation compared to assigning the boxed
storage.

### Example

```rust
let mut b = Box::new(1u32);
b = Default::default();
```

Use instead:

```rust
let mut b = Box::new(1u32);
*b = Default::default();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/replace_box.rs#L18

## result_large_err

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.65.0

### What it does

Checks for functions that return `Result` with an unusually large
`Err`-variant.

### Why is this bad?

A `Result` is at least as large as the `Err`-variant. While we
expect that variant to be seldom used, the compiler needs to reserve
and move that much memory every single time.
Furthermore, errors are often simply passed up the call-stack, making
use of the `?`-operator and its type-conversion mechanics. If the
`Err`-variant further up the call-stack stores the `Err`-variant in
question (as library code often does), it itself needs to be at least
as large, propagating the problem.

### Known problems

The size determined by Clippy is platform-dependent.

### Examples

```rust
pub enum ParseError {
    UnparsedBytes([u8; 512]),
    UnexpectedEof,
}

// The `Result` has at least 512 bytes, even in the `Ok`-case
pub fn parse() -> Result<(), ParseError> {
    Ok(())
}
```

should be

```rust
pub enum ParseError {
    UnparsedBytes(Box<[u8; 512]>),
    UnexpectedEof,
}

// The `Result` is slightly larger than a pointer
pub fn parse() -> Result<(), ParseError> {
    Ok(())
}
```

### Configuration

- 

`large-error-ignored`:  A list of paths to types that should be ignored as overly large `Err`-variants in a
`Result` returned from a function

(default: `[]`)

- 

`large-error-threshold`:  The maximum size of the `Err`-variant in a `Result` returned from a function

(default: `128`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/functions/mod.rs#L361

## sliced_string_as_bytes

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.86.0

### What it does

Checks for string slices immediately followed by `as_bytes`.

### Why is this bad?

It involves doing an unnecessary UTF-8 alignment check which is less efficient, and can cause a panic.

### Known problems

In some cases, the UTF-8 validation and potential panic from string slicing may be required for
the code’s correctness. If you need to ensure the slice boundaries fall on valid UTF-8 character
boundaries, the original form (`s[1..5].as_bytes()`) should be preferred.

### Example

```rust
let s = "Lorem ipsum";
s[1..5].as_bytes();
```

Use instead:

```rust
let s = "Lorem ipsum";
&s.as_bytes()[1..5];
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3722

## slow_vector_initialization

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.32.0

### What it does

Checks slow zero-filled vector initialization

### Why is this bad?

These structures are non-idiomatic and less efficient than simply using
`vec![0; len]`.

Specifically, for `vec![0; len]`, the compiler can use a specialized type of allocation
that also zero-initializes the allocated memory in the same call
(see: alloc_zeroed).

Writing `Vec::new()` followed by `vec.resize(len, 0)` is suboptimal because,
while it does do the same number of allocations,
it involves two operations for allocating and initializing.
The `resize` call first allocates memory (since `Vec::new()` did not), and only then zero-initializes it.

### Example

```rust
let mut vec1 = Vec::new();
vec1.resize(len, 0);

let mut vec2 = Vec::with_capacity(len);
vec2.resize(len, 0);

let mut vec3 = Vec::with_capacity(len);
vec3.extend(repeat(0).take(len));
```

Use instead:

```rust
let mut vec1 = vec![0; len];
let mut vec2 = vec![0; len];
let mut vec3 = vec![0; len];
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/slow_vector_initialization.rs#L12

## to_string_in_format_args

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.58.0

### What it does

Checks for `ToString::to_string`
applied to a type that implements `Display`
in a macro that does formatting.

### Why is this bad?

Since the type implements `Display`, the use of `to_string` is
unnecessary.

### Example

```rust
println!("error: something failed at {}", Location::caller().to_string());
```

Use instead:

```rust
println!("error: something failed at {}", Location::caller());
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/format_args.rs#L89

## unbuffered_bytes

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.87.0

### What it does

Checks for calls to `Read::bytes` on types which don’t implement `BufRead`.

### Why is this bad?

The default implementation calls `read` for each byte, which can be very inefficient for data that’s not in memory, such as `File`.

### Example

```rust
use std::io::Read;
use std::fs::File;
let file = File::open("./bytes.txt").unwrap();
file.bytes();
```

Use instead:

```rust
use std::io::{BufReader, Read};
use std::fs::File;
let file = BufReader::new(File::open("./bytes.txt").unwrap());
file.bytes();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4190

## unnecessary_box_pin

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.84.0

### What it does

Checks for calls to `Box::pin` with the `Pin<Box<_>>` not moved and only used in places where a `Pin<&mut _>`
suffices, in which case the `pin!` macro can be used.

### Why is this bad?

`Box::pin` creates an extra heap allocation for the pointee, while `pin!` creates a local `Pin<&mut T>`,
so this saves an extra heap allocation.

See the documentation for `pin!`
for a more detailed explanation on how these two differ.

### Known issues

Currently the lint is fairly limited and only emits a warning if the pinned box is used through `.as_mut()`
to prevent false positives w.r.t. lifetimes
(`Pin<Box<_>>` returned by `Box::pin` is `'static`, `Pin<&mut _>` returned by `pin!` is not).

The following works with `Box::pin` but not with `pin!`:

```rust
fn assert_static<T: 'static>(_: T) {}
assert_static(Box::pin(async {}));
```

Restricting to only lint `.as_mut()` means that we end up with a temporary in both cases,
so if it compiled with `.as_mut()`, then it ought to work with `pin!` as well.

### Example

```rust

fn now_or_never<F: Future>(fut: F) -> Option<F::Output> {
    let mut fut = Box::pin(fut);

    match fut.as_mut().poll(&mut Context::from_waker(Waker::noop())) {
        Poll::Ready(val) => Some(val),
        Poll::Pending => None
    }
}
```

Use instead:

```rust

fn now_or_never<F: Future>(fut: F) -> Option<F::Output> {
    let mut fut = std::pin::pin!(fut);

    match fut.as_mut().poll(&mut Context::from_waker(Waker::noop())) {
        Poll::Ready(val) => Some(val),
        Poll::Pending => None
    }
}
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unnecessary_box_pin.rs#L14

## unnecessary_to_owned

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.59.0

### What it does

Checks for unnecessary calls to `ToOwned::to_owned`
and other `to_owned`-like functions.

### Why is this bad?

The unnecessary calls result in useless allocations.

### Known problems

`unnecessary_to_owned` can falsely trigger if `IntoIterator::into_iter` is applied to an
owned copy of a resource and the resource is later used mutably. See
#8148.

### Example

```rust
let path = std::path::Path::new("x");
foo(&path.to_string_lossy().to_string());
fn foo(s: &str) {}
```

Use instead:

```rust
let path = std::path::Path::new("x");
foo(&path.to_string_lossy());
fn foo(s: &str) {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4733

## useless_borrows_in_formatting

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.97.0

### What it does

Detects format!-style macros (e.g. `format!`, `println!`, `write!`) where an argument
is passed with an explicit `&` but the value is already a reference, resulting in a
double reference (e.g. `&&T`).

### Why is this bad?

The extra `&` is redundant and can make the code less clear. Format macros take
references to the arguments internally, so passing `&x` when `x` is already a
reference produces a double reference. The compiler is currently unable to
optimize double references, which results in about 6% degradation per call.

### Example

```rust
let s: &str = "hello";
println!("{}", &s);
```

Use instead:

```rust
let s: &str = "hello";
println!("{}", s);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/format_args.rs#L277

## useless_vec

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `vec![..]` when using `[..]` would
be possible.

### Why is this bad?

This is less efficient.

### Example

```rust
fn foo(_x: &[u8]) {}

foo(&vec![1, 2]);
```

Use instead:

```rust
foo(&[1, 2]);
```

### Configuration

- 

`allow-useless-vec-in-tests`:  Whether `useless_vec` should ignore test functions or `#[cfg(test)]`

(default: `false`)

- 

`too-large-for-stack`:  The maximum size of objects (in bytes) that will be linted. Larger objects are ok on the heap

(default: `200`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/useless_vec.rs#L59

## vec_init_then_push

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.51.0

### What it does

Checks for calls to `push` immediately after creating a new `Vec`.

If the `Vec` is created using `with_capacity` this will only lint if the capacity is a
constant and the number of pushes is greater than or equal to the initial capacity.

If the `Vec` is extended after the initial sequence of pushes and it was default initialized
then this will only lint after there were at least four pushes. This number may change in
the future.

### Why is this bad?

The `vec![]` macro is both more performant and easier to read than
multiple `push` calls.

### Example

```rust
let mut v = Vec::new();
v.push(0);
v.push(1);
v.push(2);
```

Use instead:

```rust
let v = vec![0, 1, 2];
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/vec_init_then_push.rs#L14

## waker_clone_wake

Grupo: `perf` · Nível padrão: `warn` · Adicionado em: 1.75.0

### What it does

Checks for usage of `waker.clone().wake()`

### Why is this bad?

Cloning the waker is not necessary, `wake_by_ref()` enables the same operation
without extra cloning/dropping.

### Example

```rust
waker.clone().wake();
```

Should be written

```rust
waker.wake_by_ref();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4982
