# Catálogo de lints do Clippy — grupo `suspicious`

## almost_complete_range

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.68.0

### What it does

Checks for ranges which almost include the entire range of letters from ‘a’ to ‘z’
or digits from ‘0’ to ‘9’, but don’t because they’re a half open range.

### Why is this bad?

This (`'a'..'z'`) is almost certainly a typo meant to include all letters.

### Example

```rust
let _ = 'a'..'z';
```

Use instead:

```rust
let _ = 'a'..='z';
```

### Past names

- almost_complete_letter_range

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/almost_complete_range.rs#L9

## arc_with_non_send_sync

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.72.0

### What it does.

This lint warns when you use `Arc` with a type that does not implement `Send` or `Sync`.

### Why is this bad?

`Arc<T>` is a thread-safe `Rc<T>` and guarantees that updates to the reference counter
use atomic operations. To send an `Arc<T>` across thread boundaries and
share ownership between multiple threads, `T` must be both `Send` and `Sync`,
so either `T` should be made `Send + Sync` or an `Rc` should be used instead of an `Arc`.

### Example

```rust

fn main() {
    // This is fine, as `i32` implements `Send` and `Sync`.
    let a = Arc::new(42);

    // `RefCell` is `!Sync`, so either the `Arc` should be replaced with an `Rc`
    // or the `RefCell` replaced with something like a `RwLock`
    let b = Arc::new(RefCell::new(42));
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/arc_with_non_send_sync.rs#L12

## await_holding_invalid_type

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.62.0

### What it does

Allows users to configure types which should not be held across await
suspension points.

### Why is this bad?

There are some types which are perfectly safe to use concurrently from
a memory access perspective, but that will cause bugs at runtime if
they are held in such a way.

### Example

```rust
await-holding-invalid-types = [
  # You can specify a type name
  "CustomLockType",
  # You can (optionally) specify a reason
  { path = "OtherCustomLockType", reason = "Relies on a thread local" }
]
```

```rust
struct CustomLockType;
struct OtherCustomLockType;
async fn foo() {
  let _x = CustomLockType;
  let _y = OtherCustomLockType;
  baz().await; // Lint violation
}
```

### Configuration

- 

`await-holding-invalid-types`:  The list of types which may not be held across an await point.

(default: `[]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/await_holding_invalid.rs#L14

## await_holding_lock

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.45.0

### What it does

Checks for calls to `await` while holding a non-async-aware
`MutexGuard`.

### Why is this bad?

The Mutex types found in `std::sync` and
`parking_lot` are
not designed to operate in an async context across await points.

There are two potential solutions. One is to use an async-aware `Mutex`
type. Many asynchronous foundation crates provide such a `Mutex` type.
The other solution is to ensure the mutex is unlocked before calling
`await`, either by introducing a scope or an explicit call to
`Drop::drop`.

### Known problems

Will report false positive for explicitly dropped guards
(#6446). A
workaround for this is to wrap the `.lock()` call in a block instead of
explicitly dropping the guard.

### Example

```rust
async fn foo(x: &Mutex<u32>) {
  let mut guard = x.lock().unwrap();
  *guard += 1;
  baz().await;
}

async fn bar(x: &Mutex<u32>) {
  let mut guard = x.lock().unwrap();
  *guard += 1;
  drop(guard); // explicit drop
  baz().await;
}
```

Use instead:

```rust
async fn foo(x: &Mutex<u32>) {
  {
    let mut guard = x.lock().unwrap();
    *guard += 1;
  }
  baz().await;
}

async fn bar(x: &Mutex<u32>) {
  {
    let mut guard = x.lock().unwrap();
    *guard += 1;
  } // guard dropped here at end of scope
  baz().await;
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/await_holding_invalid.rs#L51

## await_holding_refcell_ref

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.49.0

### What it does

Checks for calls to `await` while holding a `RefCell`, `Ref`, or `RefMut`.

### Why is this bad?

`RefCell` refs only check for exclusive mutable access
at runtime. Holding a `RefCell` ref across an await suspension point
risks panics from a mutable ref shared while other refs are outstanding.

### Known problems

Will report false positive for explicitly dropped refs
(#6353). A workaround for this is
to wrap the `.borrow[_mut]()` call in a block instead of explicitly dropping the ref.

### Example

```rust
async fn foo(x: &RefCell<u32>) {
  let mut y = x.borrow_mut();
  *y += 1;
  baz().await;
}

async fn bar(x: &RefCell<u32>) {
  let mut y = x.borrow_mut();
  *y += 1;
  drop(y); // explicit drop
  baz().await;
}
```

Use instead:

```rust
async fn foo(x: &RefCell<u32>) {
  {
     let mut y = x.borrow_mut();
     *y += 1;
  }
  baz().await;
}

async fn bar(x: &RefCell<u32>) {
  {
    let mut y = x.borrow_mut();
    *y += 1;
  } // y dropped here at end of scope
  baz().await;
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/await_holding_invalid.rs#L117

## blanket_clippy_restriction_lints

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.47.0

### What it does

Checks for `warn`/`deny`/`forbid` attributes targeting the whole `clippy::restriction` category.

### Why is this bad?

Restriction lints sometimes are in contrast with other lints or even go against idiomatic rust.
These lints should only be enabled on a lint-by-lint basis and with careful consideration.

### Example

```rust
#![deny(clippy::restriction)]
```

Use instead:

```rust
#![deny(clippy::as_conversions)]
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/attrs/mod.rs#L88

## block_scrutinee

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.99.0

### What it does

Warns when a match, if let, or while let scrutinee is wrapped in a block.
This lint only triggers on the 2021 edition and older.

### Why is this bad?

It is unusual to write `{ expr }` when you could just have written
`expr`, and it is unlikely that anyone would write that for any reason
other than wanting temporaries in `expr` to be dropped before executing
the body of the `match`/`if let`/`while` statement. However, prior to
the 2024 edition, wrapping the scrutinee in a block did not drop
temporaries before the body executes.

### Example

```rust
if let Some(x) = { my_function() } { .. }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/block_scrutinee.rs#L8

## by_ref_peekable_peek

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.98.0

### What it does

Checks for usages of `Iterator::by_ref().peekable().peek()`.

### Why is this bad?

While it might look like this will allow peeking on the first
element of an iterator without consuming it and without consuming
the iterator itself, it will in practice consume the first element.

The implementation of `Peekable::peek()` produces the first element
of the underlying iterator, and stores it internally so that it can
be later produced. As a consequence, it advances the underlying
iterator, whose `.next()` method will now produce its second element.

### Example

```rust
let mut iter = [1, 2, 3].into_iter();
let x = iter.by_ref().peekable().peek();  // 1
let y = iter.by_ref().peekable().peek();  // 2
```

If this does what you intended, use the following instead, which is
shorter and clearer:

```rust
let mut iter = [1, 2, 3].into_iter();
let x = iter.next().as_ref();  // 1
let y = iter.next().as_ref();  // 2
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L212

## cast_abs_to_unsigned

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.62.0

### What it does

Checks for usage of the `abs()` method that cast the result to unsigned.

### Why is this bad?

The `unsigned_abs()` method avoids panic when called on the MIN value.

### Example

```rust
let x: i32 = -42;
let y: u32 = x.abs() as u32;
```

Use instead:

```rust
let x: i32 = -42;
let y: u32 = x.unsigned_abs();
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L150

## cast_enum_constructor

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.61.0

### What it does

Checks for casts from an enum tuple constructor to an integer.

### Why is this bad?

The cast is easily confused with casting a c-like enum value to an integer.

### Example

```rust
enum E { X(i32) };
let _ = E::X as usize;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L173

## cast_enum_truncation

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.61.0

### What it does

Checks for casts from an enum type to an integral type that will definitely truncate the
value.

### Why is this bad?

The resulting integral value will not match the value of the variant it came from.

### Example

```rust
enum E { X = 256 };
let _ = E::X as u8;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L191

## cast_nan_to_int

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.66.0

### What it does

Checks for a known NaN float being cast to an integer

### Why is this bad?

NaNs are cast into zero, so one could simply use this and make the
code more readable. The lint could also hint at a programmer error.

### Example

```rust
let _ = (0.0_f32 / 0.0) as u64;
```

Use instead:

```rust
let _ = 0_u64;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L243

## cast_slice_from_raw_parts

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.65.0

### What it does

Checks for a raw slice being cast to a slice pointer

### Why is this bad?

This can result in multiple `&mut` references to the same location when only a pointer is
required.
`ptr::slice_from_raw_parts` is a safe alternative that doesn’t require
the same safety requirements to be upheld.

### Example

```rust
let _: *const [u8] = std::slice::from_raw_parts(ptr, len) as *const _;
let _: *mut [u8] = std::slice::from_raw_parts_mut(ptr, len) as *mut _;
```

Use instead:

```rust
let _: *const [u8] = std::ptr::slice_from_raw_parts(ptr, len);
let _: *mut [u8] = std::ptr::slice_from_raw_parts_mut(ptr, len);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L461

## confusing_method_to_numeric_cast

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.89.0

### What it does

Checks for casts of a primitive method pointer like `max`/`min` to any integer type.

### Why restrict this?

Casting a function pointer to an integer can have surprising results and can occur
accidentally if parentheses are omitted from a function call. If you aren’t doing anything
low-level with function pointers then you can opt out of casting functions to integers in
order to avoid mistakes. Alternatively, you can use this lint to audit all uses of function
pointer casts in your code.

### Example

```rust
let _ = u16::max as usize;
```

Use instead:

```rust
let _ = u16::MAX as usize;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L516

## const_is_empty

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.79.0

### What it does

It identifies calls to `.is_empty()` on constant values.

### Why is this bad?

String literals and constant values are known at compile time. Checking if they
are empty will always return the same value. This might not be the intention of
the expression.

### Example

```rust
let value = "";
if value.is_empty() {
    println!("the string is empty");
}
```

Use instead:

```rust
println!("the string is empty");
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L522

## crate_in_macro_def

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.62.0

### What it does

Checks for usage of `crate` as opposed to `$crate` in a macro definition.

### Why is this bad?

`crate` refers to the macro call’s crate, whereas `$crate` refers to the macro definition’s
crate. Rarely is the former intended. See:
https://doc.rust-lang.org/reference/macros-by-example.html#hygiene

### Example

```rust
#[macro_export]
macro_rules! print_message {
    () => {
        println!("{}", crate::MESSAGE);
    };
}
pub const MESSAGE: &str = "Hello!";
```

Use instead:

```rust
#[macro_export]
macro_rules! print_message {
    () => {
        println!("{}", $crate::MESSAGE);
    };
}
pub const MESSAGE: &str = "Hello!";
```

Note that if the use of `crate` is intentional, an `allow` attribute can be applied to the
macro definition, e.g.:

```rust
#[allow(clippy::crate_in_macro_def)]
macro_rules! ok { ... crate::foo ... }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/crate_in_macro_def.rs#L10

## crosspointer_transmute

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for transmutes between a type `T` and `*T`.

### Why is this bad?

It’s easy to mistakenly transmute between a type and a
pointer to that type.

### Example

```rust
core::intrinsics::transmute(t) // where the result type is the same as
                               // `*t` or `&t`'s
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/transmute/mod.rs#L28

## declare_interior_mutable_const

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for the declaration of named constant which contain interior mutability.

### Why is this bad?

Named constants are copied at every use site which means any change to their value
will be lost after the newly created value is dropped. e.g.

```rust
use core::sync::atomic::{AtomicUsize, Ordering};
const ATOMIC: AtomicUsize = AtomicUsize::new(0);
fn add_one() -> usize {
    // This will always return `0` since `ATOMIC` is copied before it's used.
    ATOMIC.fetch_add(1, Ordering::AcqRel)
}
```

If shared modification of the value is desired, a `static` item is needed instead.
If that is not desired, a `const fn` constructor should be used to make it obvious
at the use site that a new value is created.

### Known problems

Prior to `const fn` stabilization this was the only way to provide a value which
could initialize a `static` item (e.g. the `std::sync::ONCE_INIT` constant). In
this case the use of `const` is required and this lint should be suppressed.

There also exists types which contain private fields with interior mutability, but
no way to both create a value as a constant and modify any mutable field using the
type’s public interface (e.g. `bytes::Bytes`). As there is no reasonable way to
scan a crate’s interface to see if this is the case, all such types will be linted.
If this happens use the `ignore-interior-mutability` configuration option to allow
the type.

### Example

```rust
use std::sync::atomic::{AtomicUsize, Ordering::SeqCst};

const CONST_ATOM: AtomicUsize = AtomicUsize::new(12);
CONST_ATOM.store(6, SeqCst); // the content of the atomic is unchanged
assert_eq!(CONST_ATOM.load(SeqCst), 12); // because the CONST_ATOM in these lines are distinct
```

Use instead:

```rust
static STATIC_ATOM: AtomicUsize = AtomicUsize::new(15);
STATIC_ATOM.store(9, SeqCst);
assert_eq!(STATIC_ATOM.load(SeqCst), 9); // use a `static` item to refer to the same instance
```

### Configuration

- 

`ignore-interior-mutability`:  A list of paths to types that should be treated as if they do not contain interior mutability

(default: `["bytes::Bytes"]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/non_copy_const.rs#L106

## deprecated_clippy_cfg_attr

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.78.0

### What it does

Checks for `#[cfg_attr(feature = "cargo-clippy", ...)]` and for
`#[cfg(feature = "cargo-clippy")]` and suggests to replace it with
`#[cfg_attr(clippy, ...)]` or `#[cfg(clippy)]`.

### Why is this bad?

This feature has been deprecated for years and shouldn’t be used anymore.

### Example

```rust
#[cfg(feature = "cargo-clippy")]
struct Bar;
```

Use instead:

```rust
#[cfg(clippy)]
struct Bar;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/attrs/mod.rs#L214

## doc_nested_refdefs

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.85.0

### What it does

Warns if a link reference definition appears at the start of a
list item or quote.

### Why is this bad?

This is probably intended as an intra-doc link. If it is really
supposed to be a reference definition, it can be written outside
of the list item or quote.

### Example

```rust
//! - [link]: description
```

Use instead:

```rust
//! - [link][]: description (for intra-doc link)
//!
//! [link]: destination (for link reference definition)
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L277

## doc_suspicious_footnotes

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.89.0

### What it does

Detects syntax that looks like a footnote reference.

Rustdoc footnotes are compatible with GitHub-Flavored Markdown (GFM).
GFM does not parse a footnote reference unless its definition also
exists. This lint checks for footnote references with missing
definitions, unless it thinks you’re writing a regex.

### Why is this bad?

This probably means that a footnote was meant to exist,
but was not written.

### Example

```rust
/// This is not a footnote[^1], because no definition exists.
fn my_fn() {}
```

Use instead:

```rust
/// This is a footnote[^1].
///
/// [^1]: defined here
fn my_fn() {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L371

## drop_non_drop

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.62.0

### What it does

Checks for calls to `std::mem::drop` with a value that does not implement `Drop`.

### Why is this bad?

Calling `std::mem::drop` is no different than dropping such a type. A different value may
have been intended.

### Example

```rust
struct Foo;
let x = Foo;
std::mem::drop(x);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/drop_forget_ref.rs#L11

## duplicate_mod

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.63.0

### What it does

Checks for files that are included as modules multiple times.

### Why is this bad?

Loading a file as a module more than once causes it to be compiled
multiple times, taking longer and putting duplicate content into the
module tree.

### Example

```rust
// lib.rs
mod a;
mod b;
```

```rust
// a.rs
#[path = "./b.rs"]
mod b;
```

Use instead:

```rust
// lib.rs
mod a;
mod b;
```

```rust
// a.rs
use crate::b;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/duplicate_mod.rs#L10

## duplicated_attributes

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.79.0

### What it does

Checks for attributes that appear two or more times.

### Why is this bad?

Repeating an attribute on the same item (or globally on the same crate)
is unnecessary and doesn’t have an effect.

### Example

```rust
#[allow(dead_code)]
#[allow(dead_code)]
fn foo() {}
```

Use instead:

```rust
#[allow(dead_code)]
fn foo() {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/attrs/mod.rs#L261

## empty_docs

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.78.0

### What it does

Detects documentation that is empty.

### Why is this bad?

Empty docs clutter code without adding value, reducing readability and maintainability.

### Example

```rust
///
fn returns_true() -> bool {
    true
}
```

Use instead:

```rust
fn returns_true() -> bool {
    true
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L402

## empty_line_after_doc_comments

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.70.0

### What it does

Checks for empty lines after doc comments.

### Why is this bad?

The doc comment may have meant to be an inner doc comment, regular
comment or applied to some old code that is now commented out. If it was
intended to be a doc comment, then the empty line should be removed.

### Example

```rust
/// Some doc comment with a blank line after it.

fn f() {}

/// Docs for `old_code`
// fn old_code() {}

fn new_code() {}
```

Use instead:

```rust
//! Convert it to an inner doc comment

// Or a regular comment

/// Or remove the empty line
fn f() {}

// /// Docs for `old_code`
// fn old_code() {}

fn new_code() {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/empty_line_after.rs#L14

## empty_line_after_outer_attr

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for empty lines after outer attributes

### Why is this bad?

The attribute may have meant to be an inner attribute (`#![attr]`). If
it was meant to be an outer attribute (`#[attr]`) then the empty line
should be removed

### Example

```rust
#[allow(dead_code)]

fn not_quite_good_code() {}
```

Use instead:

```rust
// Good (as inner attribute)
#![allow(dead_code)]

fn this_is_fine() {}

// or

// Good (as outer attribute)
#[allow(dead_code)]
fn this_is_fine_too() {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/empty_line_after.rs#L55

## empty_loop

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for empty `loop` expressions.

### Why is this bad?

These busy loops burn CPU cycles without doing
anything. It is almost always a better idea to `panic!` than to have
a busy loop.

If panicking isn’t possible, think of the environment and either:

- block on something

- sleep the thread for some microseconds

- yield or pause the thread

For `std` targets, this can be done with
`std::thread::sleep`
or `std::thread::yield_now`.

For `no_std` targets, doing this is more complicated, especially because
`#[panic_handler]`s can’t panic. To stop/pause the thread, you will
probably need to invoke some target-specific intrinsic. Examples include:

- `x86_64::instructions::hlt`

- `cortex_m::asm::wfi`

### Example

```rust
loop {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L81

## float_equality_without_abs

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.48.0

### What it does

Checks for statements of the form `(a - b) < f32::EPSILON` or
`(a - b) < f64::EPSILON`. Note the missing `.abs()`.

### Why is this bad?

The code without `.abs()` is more likely to have a bug.

### Known problems

If the user can ensure that b is larger than a, the `.abs()` is
technically unnecessary. However, it will make the code more robust and doesn’t have any
large performance implications. If the abs call was deliberately left out for performance
reasons, it is probably better to state this explicitly in the code, which then can be done
with an allow.

### Example

```rust
pub fn is_roughly_equal(a: f32, b: f32) -> bool {
    (a - b) < f32::EPSILON
}
```

Use instead:

```rust
pub fn is_roughly_equal(a: f32, b: f32) -> bool {
    (a - b).abs() < f32::EPSILON
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L488

## for_unbounded_range

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.98.0

### What it does

Checks for unbounded for loops over char or integers.

### Why is this bad?

Using a unbounded range over char and integers will unexpectedly not handle overflows so it will lead to panics
or infinite loops.

Instead there should be a max value set, usually the `MAX` constant for a given type such as `'\0'..char::MAX`
or `250..u8::MAX`.

### Example

```rust
for i in 250u8.. {
  println!("{i}");
}
```

Use instead:

```rust
for i in 250u8..=u8::MAX {
  println!("{i}");
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L239

## forget_non_drop

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.62.0

### What it does

Checks for calls to `std::mem::forget` with a value that does not implement `Drop`.

### Why is this bad?

Calling `std::mem::forget` is no different than dropping such a type. A different value may
have been intended.

### Example

```rust
struct Foo;
let x = Foo;
std::mem::forget(x);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/drop_forget_ref.rs#L31

## four_forward_slashes

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.73.0

### What it does

Checks for outer doc comments written with 4 forward slashes (`////`).

### Why is this bad?

This is (probably) a typo, and results in it not being a doc comment; just a regular
comment.

### Example

```rust
//// My amazing data structure
pub struct Foo {
    // ...
}
```

Use instead:

```rust
/// My amazing data structure
pub struct Foo {
    // ...
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/four_forward_slashes.rs#L11

## from_raw_with_void_ptr

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.67.0

### What it does

Checks if we’re passing a `c_void` raw pointer to `{Box,Rc,Arc,Weak}::from_raw(_)`

### Why is this bad?

When dealing with `c_void` raw pointers in FFI, it is easy to run into the pitfall of calling `from_raw` with the `c_void` pointer.
The type signature of `Box::from_raw` is `fn from_raw(raw: *mut T) -> Box<T>`, so if you pass a `*mut c_void` you will get a `Box<c_void>` (and similarly for `Rc`, `Arc` and `Weak`).
For this to be safe, `c_void` would need to have the same memory layout as the original type, which is often not the case.

### Example

```rust
let ptr = Box::into_raw(Box::new(42usize)) as *mut c_void;
let _ = unsafe { Box::from_raw(ptr) };
```

Use instead:

```rust
let _ = unsafe { Box::from_raw(ptr as *mut usize) };
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/from_raw_with_void_ptr.rs#L10

## incompatible_msrv

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.78.0

### What it does

This lint checks that no function newer than the defined MSRV (minimum
supported rust version) is used in the crate.

### Why is this bad?

It would prevent the crate to be actually used with the specified MSRV.

### Example

```rust
// MSRV of 1.3.0
use std::thread::sleep;
use std::time::Duration;

// Sleep was defined in `1.4.0`.
sleep(Duration::new(1, 0));
```

To fix this problem, either increase your MSRV or use another item
available in your current MSRV.

You can also locally change the MSRV that should be checked by Clippy,
for example if a feature in your crate (e.g., `modern_compiler`) should
allow you to use an item:

```rust
//! This crate has a MSRV of 1.3.0, but we also have an optional feature
//! `sleep_well` which requires at least Rust 1.4.0.

// When the `sleep_well` feature is set, do not warn for functions available
// in Rust 1.4.0 and below.
#![cfg_attr(feature = "sleep_well", clippy::msrv = "1.4.0")]

use std::time::Duration;

#[cfg(feature = "sleep_well")]
fn sleep_for_some_time() {
    std::thread::sleep(Duration::new(1, 0)); // Will not trigger the lint
}
```

You can also increase the MSRV in tests, by using:

```rust
// Use a much higher MSRV for tests while keeping the main one low
#![cfg_attr(test, clippy::msrv = "1.85.0")]

#[test]
fn my_test() {
    // The tests can use items introduced in Rust 1.85.0 and lower
    // without triggering the `incompatible_msrv` lint.
}
```

### Configuration

- 

`check-incompatible-msrv-in-tests`:  Whether to check MSRV compatibility in `#[test]` and `#[cfg(test)]` code.

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/incompatible_msrv.rs#L13

## ineffective_open_options

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.76.0

### What it does

Checks if both `.write(true)` and `.append(true)` methods are called
on a same `OpenOptions`.

### Why is this bad?

`.append(true)` already enables `write(true)`, making this one
superfluous.

### Example

```rust
let _ = OpenOptions::new()
           .write(true)
           .append(true)
           .create(true)
           .open("file.json");
```

Use instead:

```rust
let _ = OpenOptions::new()
           .append(true)
           .create(true)
           .open("file.json");
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/ineffective_open_options.rs#L10

## infallible_try_from

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.89.0

### What it does

Finds manual impls of `TryFrom` with infallible error types.

### Why is this bad?

Infallible conversions should be implemented via `From` with the blanket conversion.

### Example

```rust
use std::convert::Infallible;
struct MyStruct(i16);
impl TryFrom<i16> for MyStruct {
    type Error = Infallible;
    fn try_from(other: i16) -> Result<Self, Infallible> {
        Ok(Self(other.into()))
    }
}
```

Use instead:

```rust
struct MyStruct(i16);
impl From<i16> for MyStruct {
    fn from(other: i16) -> Self {
        Self(other)
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/infallible_try_from.rs#L8

## iter_out_of_bounds

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.74.0

### What it does

Looks for iterator combinator calls such as `.take(x)` or `.skip(x)`
where `x` is greater than the amount of items that an iterator will produce.

### Why is this bad?

Taking or skipping more items than there are in an iterator either creates an iterator
with all items from the original iterator or an iterator with no items at all.
This is most likely not what the user intended to do.

### Example

```rust
for _ in [1, 2, 3].iter().take(4) {}
```

Use instead:

```rust
for _ in [1, 2, 3].iter() {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1593

## join_absolute_paths

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.76.0

### What it does

Checks for calls to `Path::join` that start with a path separator (`\\` or `/`).

### Why is this bad?

If the argument to `Path::join` starts with a separator, it will overwrite
the original path. If this is intentional, prefer using `Path::new` instead.

Note the behavior is platform dependent. A leading `\\` will be accepted
on unix systems as part of the file name

See `Path::join`

### Example

```rust
let path = Path::new("/bin");
let joined_path = path.join("/sh");
assert_eq!(joined_path, PathBuf::from("/sh"));
```

Use instead;

```rust
let path = Path::new("/bin");

// If this was unintentional, remove the leading separator
let joined_path = path.join("sh");
assert_eq!(joined_path, PathBuf::from("/bin/sh"));

// If this was intentional, create a new path instead
let new = Path::new("/sh");
assert_eq!(new, PathBuf::from("/sh"));
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1739

## let_underscore_future

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.67.0

### What it does

Checks for `let _ = <expr>` where the resulting type of expr implements `Future`

### Why is this bad?

Futures must be polled for work to be done. The original intention was most likely to await the future
and ignore the resulting value.

### Example

```rust
async fn foo() -> Result<(), ()> {
    Ok(())
}
let _ = foo();
```

Use instead:

```rust
async fn foo() -> Result<(), ()> {
    Ok(())
}
let _ = foo().await;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/let_underscore.rs#L9

## lines_filter_map_ok

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.70.0

### What it does

Checks for usage of `lines.filter_map(Result::ok)` or `lines.flat_map(Result::ok)`
when `lines` has type `std::io::Lines`.

### Why is this bad?

`Lines` instances might produce a never-ending stream of `Err`, in which case
`filter_map(Result::ok)` will enter an infinite loop while waiting for an
`Ok` variant. Calling `next()` once is sufficient to enter the infinite loop,
even in the absence of explicit loops in the user code.

This situation can arise when working with user-provided paths. On some platforms,
`std::fs::File::open(path)` might return `Ok(fs)` even when `path` is a directory,
but any later attempt to read from `fs` will return an error.

### Known problems

This lint suggests replacing `filter_map()` or `flat_map()` applied to a `Lines`
instance in all cases. There are two cases where the suggestion might not be
appropriate or necessary:

- If the `Lines` instance can never produce any error, or if an error is produced
only once just before terminating the iterator, using `map_while()` is not
necessary but will not do any harm.

- If the `Lines` instance can produce intermittent errors then recover and produce
successful results, using `map_while()` would stop at the first error.

### Example

```rust
let mut lines = BufReader::new(File::open("some-path")?).lines().filter_map(Result::ok);
// If "some-path" points to a directory, the next statement never terminates:
let first_line: Option<String> = lines.next();
```

Use instead:

```rust
let mut lines = BufReader::new(File::open("some-path")?).lines().map_while(Result::ok);
let first_line: Option<String> = lines.next();
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1779

## macro_metavars_in_unsafe

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.80.0

### What it does

Looks for macros that expand metavariables in an unsafe block.

### Why is this bad?

This hides an unsafe block and allows the user of the macro to write unsafe code without an explicit
unsafe block at callsite, making it possible to perform unsafe operations in seemingly safe code.

The macro should be restructured so that these metavariables are referenced outside of unsafe blocks
and that the usual unsafety checks apply to the macro argument.

This is usually done by binding it to a variable outside of the unsafe block
and then using that variable inside of the block as shown in the example, or by referencing it a second time
in a safe context, e.g. `if false { $expr }`.

### Known limitations

Due to how macros are represented in the compiler at the time Clippy runs its lints,
it’s not possible to look for metavariables in macro definitions directly.

Instead, this lint looks at expansions of macros.
This leads to false negatives for macros that are never actually invoked.

By default, this lint is rather conservative and will only emit warnings on publicly-exported
macros from the same crate, because oftentimes private internal macros are one-off macros where
this lint would just be noise (e.g. macros that generate `impl` blocks).
The default behavior should help with preventing a high number of such false positives,
however it can be configured to also emit warnings in private macros if desired.

### Example

```rust
/// Gets the first element of a slice
macro_rules! first {
    ($slice:expr) => {
        unsafe {
            let slice = $slice; // ⚠️ expansion inside of `unsafe {}`

            assert!(!slice.is_empty());
            // SAFETY: slice is checked to have at least one element
            slice.first().unwrap_unchecked()
        }
    }
}

assert_eq!(*first!(&[1i32]), 1);

// This will compile as a consequence (note the lack of `unsafe {}`)
assert_eq!(*first!(std::hint::unreachable_unchecked() as &[i32]), 1);
```

Use instead:

```rust
macro_rules! first {
    ($slice:expr) => {{
        let slice = $slice; // ✅ outside of `unsafe {}`
        unsafe {
            assert!(!slice.is_empty());
            // SAFETY: slice is checked to have at least one element
            slice.first().unwrap_unchecked()
        }
    }}
}

assert_eq!(*first!(&[1]), 1);

// This won't compile:
assert_eq!(*first!(std::hint::unreachable_unchecked() as &[i32]), 1);
```

### Configuration

- 

`warn-unsafe-macro-metavars-in-private-macros`:  Whether to also emit warnings for unsafe blocks with metavariable expansions in private macros.

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/macro_metavars_in_unsafe.rs#L14

## manual_unwrap_or_default

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.79.0

### What it does

Checks if a `match` or `if let` expression can be simplified using
`.unwrap_or_default()`.

### Why is this bad?

It can be done in one call with `.unwrap_or_default()`.

### Example

```rust
let x: Option<String> = Some(String::new());
let y: String = match x {
    Some(v) => v,
    None => String::new(),
};

let x: Option<Vec<String>> = Some(Vec::new());
let y: Vec<String> = if let Some(v) = x {
    v
} else {
    Vec::new()
};
```

Use instead:

```rust
let x: Option<String> = Some(String::new());
let y: String = x.unwrap_or_default();

let x: Option<Vec<String>> = Some(Vec::new());
let y: Vec<String> = x.unwrap_or_default();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L225

## mismatched_bit_width_type

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.99.0

### What it does

Checks for usage of `T::BITS - x.leading_zeros()` where T and x are of different types.

### Why is this bad?

Substracting `leading_zeros` from the number of bits of another type might be
a buggy implementation of the `bit_width` method.

### Example

```rust
let x: u64 = 5;
let bit_width = u32::BITS - x.leading_zeros();
```

Use instead:

```rust
let x: u64 = 5;
let bit_width = x.bit_width();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/bit_width.rs#L34

## misnamed_getters

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.67.0

### What it does

Checks for getter methods that return a field that doesn’t correspond
to the name of the method, when there is a field’s whose name matches that of the method.

### Why is this bad?

It is most likely that such a method is a bug caused by a typo or by copy-pasting.

### Example

```rust
struct A {
    a: String,
    b: String,
}

impl A {
    fn a(&self) -> &str{
        &self.b
    }
}
```

Use instead:

```rust
struct A {
    a: String,
    b: String,
}

impl A {
    fn a(&self) -> &str{
        &self.a
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/functions/mod.rs#L104

## misrefactored_assign_op

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for `a op= a op b` or `a op= b op a` patterns.

### Why is this bad?

Most likely these are bugs where one meant to write `a op= b`.

### Known problems

Clippy cannot know for sure if `a op= a op b` should have
been `a = a op a op b` or `a = a op b`/`a op= b`. Therefore, it suggests both.
If `a op= a op b` is really the correct behavior it should be
written as `a = a op a op b` as it’s less confusing.

### Example

```rust
let mut a = 5;
let b = 2;
// ...
a += a + b;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L783

## missing_transmute_annotations

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.79.0

### What it does

Checks if transmute calls have all generics specified.

### Why is this bad?

If not, one or more unexpected types could be used during `transmute()`, potentially leading
to Undefined Behavior or other problems.

This is particularly dangerous in case a seemingly innocent/unrelated change causes type
inference to result in a different type. For example, if `transmute()` is the tail
expression of an `if`-branch, and the `else`-branch type changes, the compiler may silently
infer a different type to be returned by `transmute()`. That is because the compiler is
free to change the inference of a type as long as that inference is technically correct,
regardless of the programmer’s unknown expectation.

Both type-parameters, the input- and the output-type, to any `transmute()` should
be given explicitly: Setting the input-type explicitly avoids confusion about what the
argument’s type actually is. Setting the output-type explicitly avoids type-inference
to infer a technically correct yet unexpected type.

### Example

```rust
let mut x: i32 = 0;
// Avoid "naked" calls to `transmute()`!
x = std::mem::transmute([1u16, 2u16]);

// `first_answers` is intended to transmute a slice of bool to a slice of u8.
// But the programmer forgot to index the first element of the outer slice,
// so we are actually transmuting from "pointers to slices" instead of
// transmuting from "a slice of bool", causing a nonsensical result.
let the_answers: &[&[bool]] = &[&[true, false, true]];
let first_answers: &[u8] = std::mem::transmute(the_answers);
```

Use instead:

```rust
let x = std::mem::transmute::<[u16; 2], i32>([1u16, 2u16]);

// The explicit type parameters on `transmute()` makes the intention clear,
// and cause a type-error if the actual types don't match our expectation.
let the_answers: &[&[bool]] = &[&[true, false, true]];
let first_answers: &[u8] = std::mem::transmute::<&[bool], &[u8]>(the_answers[0]);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/transmute/mod.rs#L103

## multi_assignments

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.65.0

### What it does

Checks for nested assignments.

### Why is this bad?

While this is in most cases already a type mismatch,
the result of an assignment being `()` can throw off people coming from languages like python or C,
where such assignments return a copy of the assigned value.

### Example

```rust
a = b = 42;
```

Use instead:

```rust
b = 42;
a = b;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/multi_assignments.rs#L5

## mut_range_bound

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for loops with a range bound that is a mutable variable.

### Why is this bad?

One might think that modifying the mutable variable changes the loop bounds. It doesn’t.

### Known problems

False positive when mutation is followed by a `break`, but the `break` is not immediately
after the mutation:

```rust
let mut x = 5;
for _ in 0..x {
    x += 1; // x is a range bound that is mutated
    ..; // some other expression
    break; // leaves the loop, so mutation is not an issue
}
```

False positive on nested loops (#6072)

### Example

```rust
let mut foo = 42;
for i in 0..foo {
    foo -= 1;
    println!("{i}"); // prints numbers from 0 to 41, not 0 to 21
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L517

## mutable_key_type

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.42.0

### What it does

Checks for sets/maps with mutable key types.

### Why is this bad?

All of `HashMap`, `HashSet`, `BTreeMap` and
`BtreeSet` rely on either the hash or the order of keys be unchanging,
so having types with interior mutability is a bad idea.

### Known problems

#### False Positives

It’s correct to use a struct that contains interior mutability as a key when its
implementation of `Hash` or `Ord` doesn’t access any of the interior mutable types.
However, this lint is unable to recognize this, so it will often cause false positives in
these cases.

#### False Negatives

This lint does not follow raw pointers (`*const T` or `*mut T`) as `Hash` and `Ord`
apply only to the address of the contained value. This can cause false negatives for
custom collections that use raw pointers internally.

### Example

```rust
use std::cmp::{PartialEq, Eq};
use std::collections::HashSet;
use std::hash::{Hash, Hasher};
use std::sync::atomic::AtomicUsize;

struct Bad(AtomicUsize);
impl PartialEq for Bad {
    fn eq(&self, rhs: &Self) -> bool {
         ..
    }
}

impl Eq for Bad {}

impl Hash for Bad {
    fn hash<H: Hasher>(&self, h: &mut H) {
        ..
    }
}

fn main() {
    let _: HashSet<Bad> = HashSet::new();
}
```

### Configuration

- 

`ignore-interior-mutability`:  A list of paths to types that should be treated as if they do not contain interior mutability

(default: `["bytes::Bytes"]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/mut_key.rs#L13

## needless_character_iteration

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.81.0

### What it does

Checks if an iterator is used to check if a string is ascii.

### Why is this bad?

The `str` type already implements the `is_ascii` method.

### Example

```rust
"foo".chars().all(|c| c.is_ascii());
```

Use instead:

```rust
"foo".is_ascii();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2669

## needless_maybe_sized

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.81.0

### What it does

Lints `?Sized` bounds applied to type parameters that cannot be unsized

### Why is this bad?

The `?Sized` bound is misleading because it cannot be satisfied by an
unsized type

### Example

```rust
// `T` cannot be unsized because `Clone` requires it to be `Sized`
fn f<T: Clone + ?Sized>(t: &T) {}
```

Use instead:

```rust
fn f<T: Clone>(t: &T) {}

// or choose alternative bounds for `T` so that it can be unsized
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/needless_maybe_sized.rs#L10

## no_effect_replace

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.63.0

### What it does

Checks for `replace` statements which have no effect.

### Why is this bad?

It’s either a mistake or confusing.

### Example

```rust
"1234".replace("12", "12");
"1234".replacen("12", "12", 1);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2849

## non_canonical_clone_impl

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.72.0

### What it does

Checks for non-canonical implementations of `Clone` when `Copy` is already implemented.

### Why is this bad?

If both `Clone` and `Copy` are implemented, they must agree. This can done by dereferencing
`self` in `Clone`’s implementation, which will avoid any possibility of the implementations
becoming out of sync.

### Example

```rust
#[derive(Eq, PartialEq)]
struct A(u32);

impl Clone for A {
    fn clone(&self) -> Self {
        Self(self.0)
    }
}

impl Copy for A {}
```

Use instead:

```rust
#[derive(Eq, PartialEq)]
struct A(u32);

impl Clone for A {
    fn clone(&self) -> Self {
        *self
    }
}

impl Copy for A {}
```

### Past names

- incorrect_clone_impl_on_copy_type

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/non_canonical_impls.rs#L15

## non_canonical_partial_ord_impl

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.73.0

### What it does

Checks for non-canonical implementations of `PartialOrd` when `Ord` is already implemented.

### Why is this bad?

If both `PartialOrd` and `Ord` are implemented, they must agree. This is commonly done by
wrapping the result of `cmp` in `Some` for `partial_cmp`. Not doing this may silently
introduce an error upon refactoring.

### Known issues

Code that calls the `.into()` method instead will be flagged, despite `.into()` wrapping it
in `Some`.

### Example

```rust
#[derive(Eq, PartialEq)]
struct A(u32);

impl Ord for A {
    fn cmp(&self, other: &Self) -> Ordering {
        // ...
    }
}

impl PartialOrd for A {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        // ...
    }
}
```

Use instead:

```rust
#[derive(Eq, PartialEq)]
struct A(u32);

impl Ord for A {
    fn cmp(&self, other: &Self) -> Ordering {
        // ...
    }
}

impl PartialOrd for A {
    fn partial_cmp(&self, other: &Self) -> Option<Ordering> {
        Some(self.cmp(other))   // or self.cmp(other).into()
    }
}
```

### Past names

- incorrect_partial_ord_impl_on_ord_type

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/non_canonical_impls.rs#L56

## octal_escapes

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.59.0

### What it does

Checks for `\0` escapes in string and byte literals that look like octal
character escapes in C.

### Why is this bad?

C and other languages support octal character escapes in strings, where
a backslash is followed by up to three octal digits. For example, `\033`
stands for the ASCII character 27 (ESC). Rust does not support this
notation, but has the escape code `\0` which stands for a null
byte/character, and any following digits do not form part of the escape
sequence. Therefore, `\033` is not a compiler error but the result may
be surprising.

### Known problems

The actual meaning can be the intended one. `\x00` can be used in these
cases to be unambiguous.

The lint does not trigger for format strings in `print!()`, `write!()`
and friends since the string is already preprocessed when Clippy lints
can see it.

### Example

```rust
let one = "\033[1m Bold? \033[0m";  // \033 intended as escape
let two = "\033\0";                 // \033 intended as null-3-3
```

Use instead:

```rust
let one = "\x1b[1mWill this be bold?\x1b[0m";
let two = "\x0033\x00";
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/octal_escapes.rs#L9

## option_zip_none

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.99.0

### What it does

Checks for calls of the form `Option::zip(_, None)` or `Option::zip(None, _)`.

### Why is this bad?

`Option::zip` with `None` always returns `None`.

### Example

```rust
let foo = Some(5);
foo.zip(None);
```

Use instead:

```rust
None
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3047

## path_ends_with_ext

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.74.0

### What it does

Looks for calls to `Path::ends_with` calls where the argument looks like a file extension.

By default, Clippy has a short list of known filenames that start with a dot
but aren’t necessarily file extensions (e.g. the `.git` folder), which are allowed by default.
The `allowed-dotfiles` configuration can be used to allow additional
file extensions that Clippy should not lint.

### Why is this bad?

This doesn’t actually compare file extensions. Rather, `ends_with` compares the given argument
to the last component of the path and checks if it matches exactly.

### Known issues

File extensions are often at most three characters long, so this only lints in those cases
in an attempt to avoid false positives.
Any extension names longer than that are assumed to likely be real path components and are
therefore ignored.

### Example

```rust
fn is_markdown(path: &Path) -> bool {
    path.ends_with(".md")
}
```

Use instead:

```rust
fn is_markdown(path: &Path) -> bool {
    path.extension().is_some_and(|ext| ext == "md")
}
```

### Configuration

- 

`allowed-dotfiles`:  Additional dotfiles (files or directories starting with a dot) to allow

(default: `[]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3172

## permissions_set_readonly_false

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.68.0

### What it does

Checks for calls to `std::fs::Permissions.set_readonly` with argument `false`.

### Why is this bad?

On Unix platforms this results in the file being world writable,
equivalent to `chmod a+w <file>`.

### Example

```rust
use std::fs::File;
let f = File::create("foo.txt").unwrap();
let metadata = f.metadata().unwrap();
let mut permissions = metadata.permissions();
permissions.set_readonly(false);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/permissions_set_readonly_false.rs#L8

## pointers_in_nomem_asm_block

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.81.0

### What it does

Checks if any pointer is being passed to an asm! block with `nomem` option.

### Why is this bad?

`nomem` forbids any reads or writes to memory and passing a pointer suggests
that either of those will happen.

### Example

```rust
fn f(p: *mut u32) {
    unsafe { core::arch::asm!("mov [{p}], 42", p = in(reg) p, options(nomem, nostack)); }
}
```

Use instead:

```rust
fn f(p: *mut u32) {
    unsafe { core::arch::asm!("mov [{p}], 42", p = in(reg) p, options(nostack)); }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/pointers_in_nomem_asm_block.rs#L7

## possible_missing_else

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.91.0

### What it does

Checks for an `if` expression followed by either a block or another `if` that
looks like it should have an `else` between them.

### Why is this bad?

This is probably some refactoring remnant, even if the code is correct, it
might look confusing.

### Example

```rust
if foo {
} { // looks like an `else` is missing here
}

if foo {
} if bar { // looks like an `else` is missing here
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/formatting.rs#L29

## print_in_format_impl

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.61.0

### What it does

Checks for usage of `println`, `print`, `eprintln` or `eprint` in an
implementation of a formatting trait.

### Why is this bad?

Using a print macro is likely unintentional since formatting traits
should write to the `Formatter`, not stdout/stderr.

### Example

```rust
use std::fmt::{Display, Error, Formatter};

struct S;
impl Display for S {
    fn fmt(&self, f: &mut Formatter) -> Result<(), Error> {
        println!("S");

        Ok(())
    }
}
```

Use instead:

```rust
use std::fmt::{Display, Error, Formatter};

struct S;
impl Display for S {
    fn fmt(&self, f: &mut Formatter) -> Result<(), Error> {
        writeln!(f, "S");

        Ok(())
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/format_impl.rs#L12

## rc_clone_in_vec_init

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.63.0

### What it does

Checks for reference-counted pointers (`Arc`, `Rc`, `rc::Weak`, and `sync::Weak`)
in `vec![elem; len]`

### Why is this bad?

This will create `elem` once and clone it `len` times - doing so with `Arc`/`Rc`/`Weak`
is a bit misleading, as it will create references to the same pointer, rather
than different instances.

### Example

```rust
let v = vec![std::sync::Arc::new("some data".to_string()); 100];
// or
let v = vec![std::rc::Rc::new("some data".to_string()); 100];
```

Use instead:

```rust
// Initialize each value separately:
let mut data = Vec::with_capacity(100);
for _ in 0..100 {
    data.push(std::rc::Rc::new("some data".to_string()));
}

// Or if you want clones of the same reference,
// Create the reference beforehand to clarify that
// it should be cloned for each value
let data = std::rc::Rc::new("some data".to_string());
let v = vec![data; 100];
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/rc_clone_in_vec_init.rs#L12

## redundant_locals

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.73.0

### What it does

Checks for redundant redefinitions of local bindings.

### Why is this bad?

Redundant redefinitions of local bindings do not change behavior other than variable’s lifetimes and are likely to be unintended.

These rebindings can be intentional to shorten the lifetimes of variables because they affect when the `Drop` implementation is called. Other than that, they do not affect your code’s meaning but they may affect `rustc`’s stack allocation.

### Example

```rust
let a = 0;
let a = a;

fn foo(b: i32) {
    let b = b;
}
```

Use instead:

```rust
let a = 0;
// no redefinition with the same name

fn foo(b: i32) {
  // no redefinition with the same name
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/redundant_locals.rs#L13

## repeat_vec_with_capacity

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.76.0

### What it does

Looks for patterns such as `vec![Vec::with_capacity(x); n]` or `iter::repeat(Vec::with_capacity(x))`.

### Why is this bad?

These constructs work by cloning the element, but cloning a `Vec<_>` does not
respect the old vector’s capacity and effectively discards it.

This makes `iter::repeat(Vec::with_capacity(x))` especially suspicious because the user most certainly
expected that the yielded `Vec<_>` will have the requested capacity, otherwise one can simply write
`iter::repeat(Vec::new())` instead and it will have the same effect.

Similarly for `vec![x; n]`, the element `x` is cloned to fill the vec.
Unlike `iter::repeat` however, the vec repeat macro does not have to clone the value `n` times
but just `n - 1` times, because it can reuse the passed value for the last slot.
That means that the last `Vec<_>` gets the requested capacity but all other ones do not.

### Example

```rust

let _: Vec<Vec<u8>> = vec![Vec::with_capacity(42); 123];
let _: Vec<Vec<u8>> = iter::repeat(Vec::with_capacity(42)).take(123).collect();
```

Use instead:

```rust

let _: Vec<Vec<u8>> = iter::repeat_with(|| Vec::with_capacity(42)).take(123).collect();
//                                      ^^^ this closure executes 123 times
//                                          and the vecs will have the expected capacity
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/repeat_vec_with_capacity.rs#L24

## repr_packed_without_abi

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.85.0

### What it does

Checks for items with `#[repr(packed)]`-attribute without ABI qualification

### Why is this bad?

Without qualification, `repr(packed)` implies `repr(Rust)`. The Rust-ABI is inherently unstable.
While this is fine as long as the type is accessed correctly within Rust-code, most uses
of `#[repr(packed)]` involve FFI and/or data structures specified by network-protocols or
other external specifications. In such situations, the unstable Rust-ABI implied in
`#[repr(packed)]` may lead to future bugs should the Rust-ABI change.

In case you are relying on a well defined and stable memory layout, qualify the type’s
representation using the `C`-ABI. Otherwise, if the type in question is only ever
accessed from Rust-code according to Rust’s rules, use the `Rust`-ABI explicitly.

### Example

```rust
#[repr(packed)]
struct NetworkPacketHeader {
    header_length: u8,
    header_version: u16
}
```

Use instead:

```rust
#[repr(C, packed)]
struct NetworkPacketHeader {
    header_length: u8,
    header_version: u16
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/attrs/mod.rs#L407

## single_range_in_vec_init

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.72.0

### What it does

Checks for `Vec` or array initializations that contain only one range.

### Why is this bad?

This is almost always incorrect, as it will result in a `Vec` that has only one element.
Almost always, the programmer intended for it to include all elements in the range or for
the end of the range to be the length instead.

### Example

```rust
let x = [0..200];
```

Use instead:

```rust
// If it was intended to include every element in the range...
let x = (0..200).collect::<Vec<i32>>();
// ...Or if 200 was meant to be the len
let x = [0; 200];
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/single_range_in_vec_init.rs#L13

## size_of_ref

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.68.0

### What it does

Checks for calls to `size_of_val()` where the argument is
a reference to a reference.

### Why is this bad?

Calling `size_of_val()` with a reference to a reference as the argument
yields the size of the reference-type, not the size of the value behind
the reference.

### Example

```rust
struct Foo {
    buffer: [u8],
}

impl Foo {
    fn size(&self) -> usize {
        // Note that `&self` as an argument is a `&&Foo`: Because `self`
        // is already a reference, `&self` is a double-reference.
        // The return value of `size_of_val()` therefore is the
        // size of the reference-type, not the size of `self`.
        size_of_val(&self)
    }
}
```

Use instead:

```rust
struct Foo {
    buffer: [u8],
}

impl Foo {
    fn size(&self) -> usize {
        // Correct
        size_of_val(self)
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/size_of_ref.rs#L8

## suspicious_arithmetic_impl

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Lints for suspicious operations in impls of arithmetic operators, e.g.
subtracting elements in an Add impl.

### Why is this bad?

This is probably a typo or copy-and-paste error and not intended.

### Example

```rust
impl Add for Foo {
    type Output = Foo;

    fn add(self, other: Foo) -> Foo {
        Foo(self.0 - other.0)
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/suspicious_trait_impl.rs#L9

## suspicious_assignment_formatting

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of the non-existent `=*`, `=!` and `=-`
operators.

### Why is this bad?

This is either a typo of `*=`, `!=` or `-=` or
confusing.

### Example

```rust
a =- 42; // confusing, should it be `a -= 42` or `a = -42`?
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/formatting.rs#L54

## suspicious_command_arg_space

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.69.0

### What it does

Checks for `Command::arg()` invocations that look like they
should be multiple arguments instead, such as `arg("-t ext2")`.

### Why is this bad?

`Command::arg()` does not split arguments by space. An argument like `arg("-t ext2")`
will be passed as a single argument to the command,
which is likely not what was intended.

### Example

```rust
std::process::Command::new("echo").arg("-n hello").spawn().unwrap();
```

Use instead:

```rust
std::process::Command::new("echo").args(["-n", "hello"]).spawn().unwrap();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3920

## suspicious_doc_comments

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.70.0

### What it does

Detects the use of outer doc comments (`///`, `/**`) followed by a bang (`!`): `///!`

### Why is this bad?

Triple-slash comments (known as “outer doc comments”) apply to items that follow it.
An outer doc comment followed by a bang (i.e. `///!`) has no specific meaning.

The user most likely meant to write an inner doc comment (`//!`, `/*!`), which
applies to the parent item (i.e. the item that the comment is contained in,
usually a module or crate).

### Known problems

Inner doc comments can only appear before items, so there are certain cases where the suggestion
made by this lint is not valid code. For example:

```rust
fn foo() {}
///!
fn bar() {}
```

This lint detects the doc comment and suggests changing it to `//!`, but an inner doc comment
is not valid at that position.

### Example

In this example, the doc comment is attached to the function, rather than the module.

```rust
pub mod util {
    ///! This module contains utility functions.

    pub fn dummy() {}
}
```

Use instead:

```rust
pub mod util {
    //! This module contains utility functions.

    pub fn dummy() {}
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L568

## suspicious_else_formatting

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for formatting of `else`. It lints if the `else`
is followed immediately by a newline or the `else` seems to be missing.

### Why is this bad?

This is probably some refactoring remnant, even if the
code is correct, it might look confusing.

### Example

```rust
if foo {
} { // looks like an `else` is missing here
}

if foo {
} if bar { // looks like an `else` is missing here
}

if foo {
} else

{ // this is the `else` block of the previous `if`, but should it be?
}

if foo {
} else

if bar { // this is the `else` block of the previous `if`, but should it be?
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/formatting.rs#L73

## suspicious_map

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.39.0

### What it does

Checks for calls to `map` followed by a `count`.

### Why is this bad?

It looks suspicious. Maybe `map` was confused with `filter`.
If the `map` call is intentional, this should be rewritten
using `inspect`. Or, if you intend to drive the iterator to
completion, you can just use `for_each` instead.

### Example

```rust
let _ = (0..3).map(|x| x + 2).count();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3946

## suspicious_op_assign_impl

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Lints for suspicious operations in impls of `OpAssign`, e.g.
subtracting elements in an `AddAssign` impl.

### Why is this bad?

This is probably a typo or copy-and-paste error and not intended.

### Example

```rust
impl AddAssign for Foo {
    fn add_assign(&mut self, other: Foo) {
        *self = *self - other;
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/suspicious_trait_impl.rs#L33

## suspicious_open_options

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.77.0

### What it does

Checks for the suspicious use of `OpenOptions::create()`
without an explicit `OpenOptions::truncate()`.

### Why is this bad?

`create()` alone will either create a new file or open an
existing file. If the file already exists, it will be
overwritten when written to, but the file will not be
truncated by default.
If less data is written to the file
than it already contains, the remainder of the file will
remain unchanged, and the end of the file will contain old
data.
In most cases, one should either use `create_new` to ensure
the file is created from scratch, or ensure `truncate` is
called so that the truncation behaviour is explicit. `truncate(true)`
will ensure the file is entirely overwritten with new data, whereas
`truncate(false)` will explicitly keep the default behavior.

### Example

```rust
use std::fs::OpenOptions;

OpenOptions::new().create(true);
```

Use instead:

```rust
use std::fs::OpenOptions;

OpenOptions::new().create(true).truncate(true);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3966

## suspicious_to_owned

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.65.0

### What it does

Checks for the usage of `_.to_owned()`, on a `Cow<'_, _>`.

### Why is this bad?

Calling `to_owned()` on a `Cow` creates a clone of the `Cow`
itself, without taking ownership of the `Cow` contents (i.e.
it’s equivalent to calling `Cow::clone`).
The similarly named `into_owned` method, on the other hand,
clones the `Cow` contents, effectively turning any `Cow::Borrowed`
into a `Cow::Owned`.

Given the potential ambiguity, consider replacing `to_owned`
with `clone` for better readability or, if getting a `Cow::Owned`
was the original intent, using `into_owned` instead.

### Example

```rust
let s = "Hello world!";
let cow = Cow::Borrowed(s);

let data = cow.to_owned();
assert!(matches!(data, Cow::Borrowed(_)))
```

Use instead:

```rust
let s = "Hello world!";
let cow = Cow::Borrowed(s);

let data = cow.clone();
assert!(matches!(data, Cow::Borrowed(_)))
```

or

```rust
let s = "Hello world!";
let cow = Cow::Borrowed(s);

let _data: String = cow.into_owned();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4034

## suspicious_unary_op_formatting

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.40.0

### What it does

Checks the formatting of a unary operator on the right hand side
of a binary operator. It lints if there is no space between the binary and unary operators,
but there is a space between the unary and its operand.

### Why is this bad?

This is either a typo in the binary operator or confusing.

### Example

```rust
// &&! looks like a different operator
if foo &&! bar {}
```

Use instead:

```rust
if foo && !bar {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/formatting.rs#L110

## swap_ptr_to_ref

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.63.0

### What it does

Checks for calls to `core::mem::swap` where either parameter is derived from a pointer

### Why is this bad?

When at least one parameter to `swap` is derived from a pointer it may overlap with the
other. This would then lead to undefined behavior.

### Example

```rust
unsafe fn swap(x: &[*mut u32], y: &[*mut u32]) {
    for (&x, &y) in x.iter().zip(y) {
        core::mem::swap(&mut *x, &mut *y);
    }
}
```

Use instead:

```rust
unsafe fn swap(x: &[*mut u32], y: &[*mut u32]) {
    for (&x, &y) in x.iter().zip(y) {
        core::ptr::swap(x, y);
    }
}
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/swap_ptr_to_ref.rs#L12

## test_attr_in_doctest

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.76.0

### What it does

Checks for `#[test]` in doctests unless they are marked with
either `ignore`, `no_run` or `compile_fail`.

### Why is this bad?

Code in examples marked as `#[test]` will somewhat
surprisingly not be run by `cargo test`. If you really want
to show how to test stuff in an example, mark it `no_run` to
make the intent clear.

### Examples

```rust
/// An example of a doctest with a `main()` function
///
/// # Examples
///
/// ```
/// #[test]
/// fn equality_works() {
///     assert_eq!(1_u8, 1);
/// }
/// ```
fn test_attr_in_doctest() {
    unimplemented!();
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L615

## type_id_on_box

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.73.0

### What it does

Looks for calls to `.type_id()` on a `Box<dyn _>`.

### Why is this bad?

This almost certainly does not do what the user expects and can lead to subtle bugs.
Calling `.type_id()` on a `Box<dyn Trait>` returns a fixed `TypeId` of the `Box` itself,
rather than returning the `TypeId` of the underlying type behind the trait object.

For `Box<dyn Any>` specifically (and trait objects that have `Any` as its supertrait),
this lint will provide a suggestion, which is to dereference the receiver explicitly
to go from `Box<dyn Any>` to `dyn Any`.
This makes sure that `.type_id()` resolves to a dynamic call on the trait object
and not on the box.

If the fixed `TypeId` of the `Box` is the intended behavior, it’s better to be explicit about it
and write `TypeId::of::<Box<dyn Trait>>()`:
this makes it clear that a fixed `TypeId` is returned and not the `TypeId` of the implementor.

### Example

```rust
use std::any::{Any, TypeId};

let any_box: Box<dyn Any> = Box::new(42_i32);
assert_eq!(any_box.type_id(), TypeId::of::<i32>()); // ⚠️ this fails!
```

Use instead:

```rust
use std::any::{Any, TypeId};

let any_box: Box<dyn Any> = Box::new(42_i32);
assert_eq!((*any_box).type_id(), TypeId::of::<i32>());
//          ^ dereference first, to call `type_id` on `dyn Any`
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4150

## unconditional_recursion

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.77.0

### What it does

Checks that there isn’t an infinite recursion in trait
implementations.

### Why is this bad?

Infinite recursion in trait implementation will either cause crashes
or result in an infinite loop, and it is hard to detect.

### Example

```rust
enum Foo {
    A,
    B,
}

impl PartialEq for Foo {
    fn eq(&self, other: &Self) -> bool {
        self == other // bad!
    }
}
```

Use instead:

```rust
#[derive(PartialEq)]
enum Foo {
    A,
    B,
}
```

As an alternative, rewrite the logic without recursion:

```rust
enum Foo {
    A,
    B,
}

impl PartialEq for Foo {
    fn eq(&self, other: &Self) -> bool {
        matches!((self, other), (Foo::A, Foo::A) | (Foo::B, Foo::B))
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unconditional_recursion.rs#L20

## unnecessary_clippy_cfg

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.78.0

### What it does

Checks for `#[cfg_attr(clippy, allow(clippy::lint))]`
and suggests to replace it with `#[allow(clippy::lint)]`.

### Why is this bad?

There is no reason to put clippy attributes behind a clippy `cfg` as they are not
run by anything else than clippy.

### Example

```rust
#![cfg_attr(clippy, allow(clippy::deprecated_cfg_attr))]
```

Use instead:

```rust
#![allow(clippy::deprecated_cfg_attr)]
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/attrs/mod.rs#L480

## unnecessary_option_map_or_else

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.92.0

### What it does

Checks for usage of `.map_or_else()` “map closure” for `Option` type.

### Why is this bad?

This can be written more concisely by using `unwrap_or_else()`.

### Example

```rust
let k = 10;
let x: Option<u32> = Some(4);
let y = x.map_or_else(|| 2 * k, |n| n);
```

Use instead:

```rust
let k = 10;
let x: Option<u32> = Some(4);
let y = x.unwrap_or_else(|| 2 * k);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4649

## unnecessary_result_map_or_else

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.78.0

### What it does

Checks for usage of `.map_or_else()` “map closure” for `Result` type.

### Why is this bad?

This can be written more concisely by using `unwrap_or_else()`.

### Example

```rust
let x: Result<u32, ()> = Ok(0);
let y = x.map_or_else(|err| handle_error(err), |n| n);
```

Use instead:

```rust
let x: Result<u32, ()> = Ok(0);
let y = x.unwrap_or_else(|err| handle_error(err));
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4674

## zero_repeat_side_effects

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.79.0

### What it does

Checks for array or vec initializations which contain an expression with side effects,
but which have a repeat count of zero.

### Why is this bad?

Such an initialization, despite having a repeat length of 0, will still call the inner function.
This may not be obvious and as such there may be unintended side effects in code.

### Example

```rust
fn side_effect() -> i32 {
    println!("side effect");
    10
}
let a = [side_effect(); 0];
```

Use instead:

```rust
fn side_effect() -> i32 {
    println!("side effect");
    10
}
side_effect();
let a: [i32; 0] = [];
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/zero_repeat_side_effects.rs#L12

## zombie_processes

Grupo: `suspicious` · Nível padrão: `warn` · Adicionado em: 1.83.0

### What it does

Looks for code that spawns a process but never calls `wait()` on the child.

### Why is this bad?

As explained in the standard library documentation,
calling `wait()` is necessary on Unix platforms to properly release all OS resources associated with the process.
Not doing so will effectively leak process IDs and/or other limited global resources,
which can eventually lead to resource exhaustion, so it’s recommended to call `wait()` in long-running applications.
Such processes are called “zombie processes”.

To reduce the rate of false positives, if the spawned process is assigned to a binding, the lint actually works the other way around; it
conservatively checks that all uses of a variable definitely don’t call `wait()` and only then emits a warning.
For that reason, a seemingly unrelated use can get called out as calling `wait()` in help messages.

### Control flow

If a `wait()` call exists in an if/then block but not in the else block (or there is no else block),
then this still gets linted as not calling `wait()` in all code paths.
Likewise, when early-returning from the function, `wait()` calls that appear after the return expression
are also not accepted.
In other words, the `wait()` call must be unconditionally reachable after the spawn expression.

### Example

```rust
use std::process::Command;

let _child = Command::new("ls").spawn().expect("failed to execute child");
```

Use instead:

```rust
use std::process::Command;

let mut child = Command::new("ls").spawn().expect("failed to execute child");
child.wait().expect("failed to wait on child");
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/zombie_processes.rs#L16
