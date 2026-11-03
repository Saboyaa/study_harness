# Catálogo de lints do Clippy — grupo `nursery`

## as_ptr_cast_mut

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.66.0

### What it does

Checks for the result of a `&self`-taking `as_ptr` being cast to a mutable pointer.

### Why is this bad?

Since `as_ptr` takes a `&self`, the pointer won’t have write permissions unless interior
mutability is used, making it unlikely that having it as a mutable pointer is correct.

### Example

```rust
let mut vec = Vec::<u8>::with_capacity(1);
let ptr = vec.as_ptr() as *mut u8;
unsafe { ptr.write(4) }; // UNDEFINED BEHAVIOUR
```

Use instead:

```rust
let mut vec = Vec::<u8>::with_capacity(1);
let ptr = vec.as_mut_ptr();
unsafe { ptr.write(4) };
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L63

## branches_sharing_code

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.53.0

### What it does

Checks if the blocks of an `if`/`else`, or the arms of a `match`, contain shared code that
can be moved out of the branches.

### Why is this bad?

Duplicate code is less maintainable.

### Example

```rust
let foo = if … {
    println!("Hello World");
    13
} else {
    println!("Hello World");
    42
};
```

Use instead:

```rust
println!("Hello World");
let foo = if … {
    13
} else {
    42
};
```

For a `match`, when every arm ends with the same expression it can be moved after the
`match`:

```rust
match mode {
    Mode::A => { a(); Ok(()) }
    Mode::B => { b(); Ok(()) }
}
```

Use instead:

```rust
match mode {
    Mode::A => { a(); }
    Mode::B => { b(); }
}
Ok(())
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/ifs/mod.rs#L13

## clear_with_drain

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.70.0

### What it does

Checks for usage of `.drain(..)` for the sole purpose of clearing a container.

### Why is this bad?

This creates an unnecessary iterator that is dropped immediately.

Calling `.clear()` also makes the intent clearer.

### Example

```rust
let mut v = vec![1, 2, 3];
v.drain(..);
```

Use instead:

```rust
let mut v = vec![1, 2, 3];
v.clear();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L399

## coerce_container_to_any

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.89.0

### What it does

Protects against unintended coercion of references to container types to `&dyn Any` when the
container type dereferences to a `dyn Any` which could be directly referenced instead.

### Why is this bad?

The intention is usually to get a reference to the `dyn Any` the value dereferences to,
rather than coercing a reference to the container itself to `&dyn Any`.

### Example

Because `Box<dyn Any>` itself implements `Any`, `&Box<dyn Any>`
can be coerced to an `&dyn Any` which refers to the `Box` itself, rather than the
inner `dyn Any`.

```rust
let x: Box<dyn Any> = Box::new(0u32);
let dyn_any_of_box: &dyn Any = &x;

// Fails as we have a &dyn Any to the Box, not the u32
assert_eq!(dyn_any_of_box.downcast_ref::<u32>(), None);
```

Use instead:

```rust
let x: Box<dyn Any> = Box::new(0u32);
let dyn_any_of_u32: &dyn Any = &*x;

// Succeeds since we have a &dyn Any to the inner u32!
assert_eq!(dyn_any_of_u32.downcast_ref::<u32>(), Some(&0u32));
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/coerce_container_to_any.rs#L10

## collection_is_never_read

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.70.0

### What it does

Checks for collections that are never queried.

### Why is this bad?

Putting effort into constructing a collection but then never querying it might indicate that
the author forgot to do whatever they intended to do with the collection. Example: Clone
a vector, sort it for iteration, but then mistakenly iterate the original vector
instead.

### Example

```rust
let mut sorted_samples = samples.clone();
sorted_samples.sort();
for sample in &samples { // Oops, meant to use `sorted_samples`.
    println!("{sample}");
}
```

Use instead:

```rust
let mut sorted_samples = samples.clone();
sorted_samples.sort();
for sample in &sorted_samples {
    println!("{sample}");
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/collection_is_never_read.rs#L10

## debug_assert_with_mut_call

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.40.0

### What it does

Checks for function/method calls with a mutable
parameter in `debug_assert!`, `debug_assert_eq!` and `debug_assert_ne!` macros.

### Why is this bad?

In release builds `debug_assert!` macros are optimized out by the
compiler.
Therefore mutating something in a `debug_assert!` macro results in different behavior
between a release and debug build.

### Example

```rust
debug_assert_eq!(vec![3].pop(), Some(3));

// or

debug_assert!(takes_a_mut_parameter(&mut x));
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/mutable_debug_assertion.rs#L11

## derive_partial_eq_without_eq

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.63.0

### What it does

Checks for types that derive `PartialEq` and could implement `Eq`.

### Why is this bad?

If a type `T` derives `PartialEq` and all of its members implement `Eq`,
then `T` can always implement `Eq`. Implementing `Eq` allows `T` to be used
in APIs that require `Eq` types. It also allows structs containing `T` to derive
`Eq` themselves.

### Example

```rust
#[derive(PartialEq)]
struct Foo {
    i_am_eq: i32,
    i_am_eq_too: Vec<String>,
}
```

Use instead:

```rust
#[derive(PartialEq, Eq)]
struct Foo {
    i_am_eq: i32,
    i_am_eq_too: Vec<String>,
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/derive/mod.rs#L63

## doc_link_code

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.87.0

### What it does

Checks for links with code directly adjacent to code text:
`[`MyItem`]`<`[`u32`]`>``.

### Why is this bad?

It can be written more simply using HTML-style `<code>` tags.

### Example

```rust
//! [`first`](x)`second`
```

Use instead:

```rust
//! <code>[first](x)second</code>
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L190

## empty_enums

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for `enum`s with no variants, which therefore are uninhabited types
(cannot be instantiated).

### Why is this bad?

- 

If you only want a type which can’t be instantiated, you should use `!`
(the primitive type “never”), because `!` has more extensive compiler support
(type inference, etc.) and implementations of common traits.

- 

If you need to introduce a distinct type, consider using a newtype `struct`
containing `!` instead (`struct MyType(pub !)`), because it is more idiomatic
to use a `struct` rather than an `enum` when an `enum` is unnecessary.

If you do this, note that the visibility of the `!` field determines whether
the uninhabitedness is visible in documentation, and whether it can be pattern
matched to mark code unreachable. If the field is not visible, then the struct
acts like any other struct with private fields.

For further information, visit
the never type’s documentation.

### Example

```rust
enum CannotExist {}
```

Use instead:

```rust
/// Use the `!` type directly...
type CannotExist = !;

/// ...or define a newtype which is distinct.
struct CannotExist2(pub !);
```

### Past names

- empty_enum

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/empty_enums.rs#L6

## equatable_if_let

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.57.0

### What it does

Checks for pattern matchings that can be expressed using equality.

### Why is this bad?

- It reads better and has less cognitive load because equality won’t cause binding.

- It is a Yoda condition. Yoda conditions are widely
criticized for increasing the cognitive load of reading the code.

- Equality is a simple bool expression and can be merged with `&&` and `||` and
reuse if blocks

### Example

```rust
if let Some(2) = x {
    do_thing();
}
```

Use instead:

```rust
if x == Some(2) {
    do_thing();
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/equatable_if_let.rs#L10

## fallible_impl_from

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for impls of `From<..>` that contain `panic!()` or `unwrap()`

### Why is this bad?

`TryFrom` should be used if there’s a possibility of failure.

### Example

```rust
struct Foo(i32);

impl From<String> for Foo {
    fn from(s: String) -> Self {
        Foo(s.parse().unwrap())
    }
}
```

Use instead:

```rust
struct Foo(i32);

impl TryFrom<String> for Foo {
    type Error = ();
    fn try_from(s: String) -> Result<Self, Self::Error> {
        if let Ok(parsed) = s.parse() {
            Ok(Foo(parsed))
        } else {
            Err(())
        }
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/fallible_impl_from.rs#L10

## future_not_send

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.44.0

### What it does

This lint requires Future implementations returned from
functions and methods to implement the `Send` marker trait,
ignoring type parameters.

If a function is generic and its Future conditionally implements `Send`
based on a generic parameter then it is considered `Send` and no warning is emitted.

This can be used by library authors (public and internal) to ensure
their functions are compatible with both multi-threaded runtimes that require `Send` futures,
as well as single-threaded runtimes where callers may choose `!Send` types
for generic parameters.

### Why is this bad?

A Future implementation captures some state that it
needs to eventually produce its final value. When targeting a multithreaded
executor (which is the norm on non-embedded devices) this means that this
state may need to be transported to other threads, in other words the
whole Future needs to implement the `Send` marker trait. If it does not,
then the resulting Future cannot be submitted to a thread pool in the
end user’s code.

Especially for generic functions it can be confusing to leave the
discovery of this problem to the end user: the reported error location
will be far from its cause and can in many cases not even be fixed without
modifying the library where the offending Future implementation is
produced.

### Example

```rust
async fn not_send(bytes: std::rc::Rc<[u8]>) {}
```

Use instead:

```rust
async fn is_send(bytes: std::sync::Arc<[u8]>) {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/future_not_send.rs#L19

## imprecise_flops

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.43.0

### What it does

Looks for floating-point expressions that
can be expressed using built-in methods to improve accuracy
at the cost of performance.

### Why is this bad?

Negatively impacts accuracy.

### Example

```rust
let a = 3f32;
let _ = a.powf(1.0 / 3.0);
let _ = (1.0 + a).ln();
let _ = a.exp() - 1.0;
```

Use instead:

```rust
let a = 3f32;
let _ = a.cbrt();
let _ = a.ln_1p();
let _ = a.exp_m1();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/floating_point_arithmetic/mod.rs#L20

## iter_on_empty_collections

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.65.0

### What it does

Checks for calls to `iter`, `iter_mut` or `into_iter` on empty collections

### Why is this bad?

It is simpler to use the empty function from the standard library:

### Example

```rust
use std::{slice, option};
let a: slice::Iter<i32> = [].iter();
let f: option::IntoIter<i32> = None.into_iter();
```

Use instead:

```rust
use std::iter;
let a: iter::Empty<i32> = iter::empty();
let b: iter::Empty<i32> = iter::empty();
```

### Known problems

The type of the resulting iterator might become incompatible with its usage

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1530

## iter_on_single_items

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.65.0

### What it does

Checks for calls to `iter`, `iter_mut` or `into_iter` on collections containing a single item

### Why is this bad?

It is simpler to use the once function from the standard library:

### Example

```rust
let a = [123].iter();
let b = Some(123).into_iter();
```

Use instead:

```rust
use std::iter;
let a = iter::once(&123);
let b = iter::once(123);
```

### Known problems

The type of the resulting iterator might become incompatible with its usage

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1562

## iter_with_drain

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.61.0

### What it does

Checks for usage of `.drain(..)` on `Vec` and `VecDeque` for iteration.

### Why is this bad?

`.into_iter()` is simpler with better performance.

### Example

```rust
let mut foo = vec![0, 1, 2, 3];
let bar: HashSet<usize> = foo.drain(..).collect();
```

Use instead:

```rust
let foo = vec![0, 1, 2, 3];
let bar: HashSet<usize> = foo.into_iter().collect();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1694

## large_stack_frames

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.72.0

### What it does

Checks for functions that use a lot of stack space.

This often happens when constructing a large type, such as an array with a lot of elements,
or constructing many smaller-but-still-large structs, or copying around a lot of large types.

This lint is a more general version of `large_stack_arrays`
that is intended to look at functions as a whole instead of only individual array expressions inside of a function.

### Why is this bad?

The stack region of memory is very limited in size (usually much smaller than the heap) and attempting to
use too much will result in a stack overflow and crash the program.
To avoid this, you should consider allocating large types on the heap instead (e.g. by boxing them).

Keep in mind that the code path to construction of large types does not even need to be reachable;
it purely needs to exist inside of the function to contribute to the stack size.
For example, this causes a stack overflow even though the branch is unreachable:

```rust
fn main() {
    if false {
        let x = [0u8; 10000000]; // 10 MB stack array
        black_box(&x);
    }
}
```

### Known issues

False positives. The stack size that clippy sees is an estimated value and can be vastly different
from the actual stack usage after optimizations passes have run (especially true in release mode).
Modern compilers are very smart and are able to optimize away a lot of unnecessary stack allocations.
In debug mode however, it is usually more accurate.

This lint works by summing up the size of all variables that the user typed, variables that were
implicitly introduced by the compiler for temporaries, function arguments and the return value,
and comparing them against a (configurable, but high-by-default).

### Example

This function creates four 500 KB arrays on the stack. Quite big but just small enough to not trigger `large_stack_arrays`.
However, looking at the function as a whole, it’s clear that this uses a lot of stack space.

```rust
struct QuiteLargeType([u8; 500_000]);
fn foo() {
    // ... some function that uses a lot of stack space ...
    let _x1 = QuiteLargeType([0; 500_000]);
    let _x2 = QuiteLargeType([0; 500_000]);
    let _x3 = QuiteLargeType([0; 500_000]);
    let _x4 = QuiteLargeType([0; 500_000]);
}
```

Instead of doing this, allocate the arrays on the heap.
This currently requires going through a `Vec` first and then converting it to a `Box`:

```rust
struct NotSoLargeType(Box<[u8]>);

fn foo() {
    let _x1 = NotSoLargeType(vec![0; 500_000].into_boxed_slice());
//                           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^  Now heap allocated.
//                                                                The size of `NotSoLargeType` is 16 bytes.
//  ...
}
```

### Configuration

- 

`allow-large-stack-frames-in-tests`:  Whether functions inside `#[cfg(test)]` modules or test functions should be checked.

(default: `true`)

- 

`stack-size-threshold`:  The maximum allowed stack size for functions in bytes

(default: `512000`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/large_stack_frames.rs#L15

## literal_string_with_formatting_args

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.85.0

### What it does

Checks if string literals have formatting arguments outside of macros
using them (like `format!`).

### Why is this bad?

It will likely not generate the expected content.

### Example

```rust
let x: Option<usize> = None;
let y = "hello";
x.expect("{y:?}");
```

Use instead:

```rust
let x: Option<usize> = None;
let y = "hello";
x.expect(&format!("{y:?}"));
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/literal_string_with_formatting_args.rs#L12

## missing_const_for_fn

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.34.0

### What it does

Suggests the use of `const` in functions and methods where possible.

### Why is this bad?

Not having the function const prevents callers of the function from being const as well.

### Known problems

Const functions are currently still being worked on, with some features only being available
on nightly. This lint does not consider all edge cases currently and the suggestions may be
incorrect if you are using this lint on stable.

Also, the lint only runs one pass over the code. Consider these two non-const functions:

```rust
fn a() -> i32 {
    0
}
fn b() -> i32 {
    a()
}
```

When running Clippy, the lint will only suggest to make `a` const, because `b` at this time
can’t be const as it calls a non-const function. Making `a` const and running Clippy again,
will suggest to make `b` const, too.

If you are marking a public function with `const`, removing it again will break API compatibility.

### Example

```rust
fn new() -> Self {
    Self { random_number: 42 }
}
```

Could be a const fn:

```rust
const fn new() -> Self {
    Self { random_number: 42 }
}
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/missing_const_for_fn.rs#L18

## needless_collect

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.30.0

### What it does

Checks for functions collecting an iterator when collect
is not needed.

### Why is this bad?

`collect` causes the allocation of a new data structure,
when this allocation may not be needed.

### Example

```rust
let len = iterator.collect::<Vec<_>>().len();
```

Use instead:

```rust
let len = iterator.count();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2690

## needless_pass_by_ref_mut

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.73.0

### What it does

Check if a `&mut` function argument is actually used mutably.

Be careful if the function is publicly reexported as it would break compatibility with
users of this function, when the users pass this function as an argument.

### Why is this bad?

Less `mut` means less fights with the borrow checker. It can also lead to more
opportunities for parallelization.

### Example

```rust
fn foo(y: &mut i32) -> i32 {
    12 + *y
}
```

Use instead:

```rust
fn foo(y: &i32) -> i32 {
    12 + *y
}
```

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/needless_pass_by_ref_mut.rs#L22

## needless_type_cast

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.94.0

### What it does

Checks for bindings (constants, statics, or let bindings) that are defined
with one numeric type but are consistently cast to a different type in all usages.

### Why is this bad?

If a binding is always cast to a different type when used, it would be clearer
and more efficient to define it with the target type from the start.

### Example

```rust
const SIZE: u16 = 15;
let arr: [u8; SIZE as usize] = [0; SIZE as usize];
```

Use instead:

```rust
const SIZE: usize = 15;
let arr: [u8; SIZE] = [0; SIZE];
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L673

## non_send_fields_in_send_ty

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.57.0

### What it does

This lint warns about a `Send` implementation for a type that
contains fields that are not safe to be sent across threads.
It tries to detect fields that can cause a soundness issue
when sent to another thread (e.g., `Rc`) while allowing `!Send` fields
that are expected to exist in a `Send` type, such as raw pointers.

### Why is this bad?

Sending the struct to another thread effectively sends all of its fields,
and the fields that do not implement `Send` can lead to soundness bugs
such as data races when accessed in a thread
that is different from the thread that created it.

See:

- The Rustonomicon about Send and Sync

- The documentation of `Send`

### Known Problems

This lint relies on heuristics to distinguish types that are actually
unsafe to be sent across threads and `!Send` types that are expected to
exist in  `Send` type. Its rule can filter out basic cases such as
`Vec<*const T>`, but it’s not perfect. Feel free to create an issue if
you have a suggestion on how this heuristic can be improved.

### Example

```rust
struct ExampleStruct<T> {
    rc_is_not_send: Rc<String>,
    unbounded_generic_field: T,
}

// This impl is unsound because it allows sending `!Send` types through `ExampleStruct`
unsafe impl<T> Send for ExampleStruct<T> {}
```

Use thread-safe types like `std::sync::Arc`
or specify correct bounds on generic type parameters (`T: Send`).

### Configuration

- 

`enable-raw-pointer-heuristic-for-send`:  Whether to apply the raw pointer heuristic to determine if a type is `Send`.

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/non_send_fields_in_send_ty.rs#L14

## option_if_let_else

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.47.0

### What it does

Lints usage of `if let Some(v) = ... { y } else { x }` and
`match .. { Some(v) => y, None/_ => x }` which are more
idiomatically done with `Option::map_or` (if the else bit is a pure
expression) or `Option::map_or_else` (if the else bit is an impure
expression).

### Why is this bad?

Using the dedicated functions of the `Option` type is clearer and
more concise than an `if let` expression.

### Notes

This lint uses a deliberately conservative metric for checking if the
inside of either body contains loop control expressions `break` or
`continue` (which cannot be used within closures). If these are found,
this lint will not be raised.

### Example

```rust
let _ = if let Some(foo) = optional {
    foo
} else {
    5
};
let _ = match optional {
    Some(val) => val + 1,
    None => 5
};
let _ = if let Some(foo) = optional {
    foo
} else {
    let y = do_complicated_function();
    y*y
};
```

should be

```rust
let _ = optional.map_or(5, |foo| foo);
let _ = optional.map_or(5, |val| val + 1);
let _ = optional.map_or_else(||{
    let y = do_complicated_function();
    y*y
}, |foo| foo);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/option_if_let_else.rs#L23

## or_fun_call

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for calls to `.or(foo(..))`, `.unwrap_or(foo(..))`,
`.or_insert(foo(..))` etc., and suggests to use `.or_else(|| foo(..))`,
`.unwrap_or_else(|| foo(..))`, `.unwrap_or_default()` or `.or_default()`
etc. instead.

### Why is this bad?

The function will always be called. This is only bad if it allocates or
does some non-trivial amount of work.

### Known problems

If the function has side-effects, not calling it will change the
semantic of the program, but you shouldn’t rely on that.

The lint also cannot figure out whether the function you call is
actually expensive to call or not.

### Example

```rust
foo.unwrap_or(String::from("empty"));
```

Use instead:

```rust
foo.unwrap_or_else(|| String::from("empty"));
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3069

## path_buf_push_overwrite

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.36.0

### What it does

- Checks for push
calls on `PathBuf` that can cause overwrites.

### Why is this bad?

Calling `push` with a root path at the start can overwrite the
previous defined path.

### Example

```rust
use std::path::PathBuf;

let mut x = PathBuf::from("/foo");
x.push("/bar");
assert_eq!(x, PathBuf::from("/bar"));
```

Could be written:

```rust
use std::path::PathBuf;

let mut x = PathBuf::from("/foo");
x.push("bar");
assert_eq!(x, PathBuf::from("/foo/bar"));
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3140

## read_zero_byte_vec

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.63.0

### What it does

This lint catches reads into a zero-length `Vec`.
Especially in the case of a call to `with_capacity`, this lint warns that read
gets the number of bytes from the `Vec`’s length, not its capacity.

### Why is this bad?

Reading zero bytes is almost certainly not the intended behavior.

### Known problems

In theory, a very unusual read implementation could assign some semantic meaning
to zero-byte reads. But it seems exceptionally unlikely that code intending to do
a zero-byte read would allocate a `Vec` for it.

### Example

```rust
use std::io;
fn foo<F: io::Read>(mut f: F) {
    let mut data = Vec::with_capacity(100);
    f.read(&mut data).unwrap();
}
```

Use instead:

```rust
use std::io;
fn foo<F: io::Read>(mut f: F) {
    let mut data = Vec::with_capacity(100);
    data.resize(100, 0);
    f.read(&mut data).unwrap();
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/read_zero_byte_vec.rs#L12

## redundant_clone

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.32.0

### What it does

Checks for a redundant `clone()` (and its relatives) which clones an owned
value that is going to be dropped without further use.

### Why is this bad?

It is not always possible for the compiler to eliminate useless
allocations and deallocations generated by redundant `clone()`s.

### Known problems

False-negatives: analysis performed by this lint is conservative and limited.

### Example

```rust
{
    let x = Foo::new();
    call(x.clone());
    call(x.clone()); // this can just pass `x`
}

["lorem", "ipsum"].join(" ").to_string();

Path::new("/a/b").join("c").to_path_buf();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/redundant_clone.rs#L19

## redundant_pub_crate

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.44.0

### What it does

Checks for items declared `pub(crate)` that are not crate visible because they
are inside a private module.

### Why is this bad?

Writing `pub(crate)` is misleading when it’s redundant due to the parent
module’s visibility.

### Example

```rust
mod internal {
    pub(crate) fn internal_fn() { }
}
```

This function is not visible outside the module and it can be declared with `pub` or
private visibility

```rust
mod internal {
    pub fn internal_fn() { }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/redundant_pub_crate.rs#L9

## search_is_some

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for an iterator or string search (such as `find()`,
`position()`, or `rposition()`) followed by a call to `is_some()` or `is_none()`.

### Why is this bad?

Readability, this can be written more concisely as:

- `_.any(_)`, or `_.contains(_)` for `is_some()`,

- `!_.any(_)`, or `!_.contains(_)` for `is_none()`.

### Example

```rust
let vec = vec![1];
vec.iter().find(|x| **x == 0).is_some();

"hello world".find("world").is_none();
```

Use instead:

```rust
let vec = vec![1];
vec.iter().any(|x| *x == 0);

!"hello world".contains("world");
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3535

## set_contains_or_insert

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.81.0

### What it does

Checks for usage of `contains` to see if a value is not present
in a set like `HashSet` or `BTreeSet`, followed by an `insert`.

### Why is this bad?

Using just `insert` and checking the returned `bool` is more efficient.

### Known problems

In case the value that wants to be inserted is borrowed and also expensive or impossible
to clone. In such a scenario, the developer might want to check with `contains` before inserting,
to avoid the clone. In this case, it will report a false positive.

### Example

```rust
use std::collections::HashSet;
let mut set = HashSet::new();
let value = 5;
if !set.contains(&value) {
    set.insert(value);
    println!("inserted {value:?}");
}
```

Use instead:

```rust
use std::collections::HashSet;
let mut set = HashSet::new();
let value = 5;
if set.insert(&value) {
    println!("inserted {value:?}");
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/set_contains_or_insert.rs#L12

## significant_drop_in_scrutinee

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.60.0

### What it does

Checks for temporaries returned from function calls in a match scrutinee that have the
`clippy::has_significant_drop` attribute.

### Why is this bad?

The `clippy::has_significant_drop` attribute can be added to types whose Drop impls have
an important side-effect, such as unlocking a mutex, making it important for users to be
able to accurately understand their lifetimes. When a temporary is returned in a function
call in a match scrutinee, its lifetime lasts until the end of the match block, which may
be surprising.

For `Mutex`es this can lead to a deadlock. This happens when the match scrutinee uses a
function call that returns a `MutexGuard` and then tries to lock again in one of the match
arms. In that case the `MutexGuard` in the scrutinee will not be dropped until the end of
the match block and thus will not unlock.

### Example

```rust
let mutex = Mutex::new(State {});

match mutex.lock().unwrap().foo() {
    true => {
        mutex.lock().unwrap().bar(); // Deadlock!
    }
    false => {}
};

println!("All done!");
```

Use instead:

```rust
let mutex = Mutex::new(State {});

let is_foo = mutex.lock().unwrap().foo();
match is_foo {
    true => {
        mutex.lock().unwrap().bar();
    }
    false => {}
};

println!("All done!");
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L762

## significant_drop_tightening

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.69.0

### What it does

Searches for elements marked with `#[clippy::has_significant_drop]` that could be early
dropped but are in fact dropped at the end of their scopes. In other words, enforces the
“tightening” of their possible lifetimes.

### Why is this bad?

Elements marked with `#[clippy::has_significant_drop]` are generally synchronizing
primitives that manage shared resources, as such, it is desired to release them as soon as
possible to avoid unnecessary resource contention.

### Example

```rust
fn main() {
  let lock = some_sync_resource.lock();
  let owned_rslt = lock.do_stuff_with_resource();
  // Only `owned_rslt` is needed but `lock` is still held.
  do_heavy_computation_that_takes_time(owned_rslt);
}
```

Use instead:

```rust
fn main() {
    let owned_rslt = some_sync_resource.lock().do_stuff_with_resource();
    do_heavy_computation_that_takes_time(owned_rslt);
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/significant_drop_tightening.rs#L18

## single_option_map

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.87.0

### What it does

Checks for functions with method calls to `.map(_)` on an arg
of type `Option` as the outermost expression.

### Why is this bad?

Taking and returning an `Option<T>` may require additional
`Some(_)` and `unwrap` if all you have is a `T`.

### Example

```rust
fn double(param: Option<u32>) -> Option<u32> {
    param.map(|x| x * 2)
}
```

Use instead:

```rust
fn double(param: u32) -> u32 {
    param * 2
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/single_option_map.rs#L11

## string_lit_as_bytes

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for the `as_bytes` method called on string literals
that contain only ASCII characters.

### Why is this bad?

Byte string literals (e.g., `b"foo"`) can be used
instead. They are shorter but less discoverable than `as_bytes()`.

### Known problems

`"str".as_bytes()` and the suggested replacement of `b"str"` are not
equivalent because they have different types. The former is `&[u8]`
while the latter is `&[u8; 3]`. That means in general they will have a
different set of methods and different trait implementations.

```rust
fn f(v: Vec<u8>) {}

f("...".as_bytes().to_owned()); // works
f(b"...".to_owned()); // does not work, because arg is [u8; 3] not Vec<u8>

fn g(r: impl std::io::Read) {}

g("...".as_bytes()); // works
g(b"..."); // does not work
```

The actual equivalent of `"str".as_bytes()` with the same type is not
`b"str"` but `&b"str"[..]`, which is a great deal of punctuation and not
more readable than a function call.

### Example

```rust
let bstr = "a byte string".as_bytes();
```

Use instead:

```rust
let bstr = b"a byte string";
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/strings.rs#L93

## suboptimal_flops

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.43.0

### What it does

Looks for floating-point expressions that
can be expressed using built-in methods to improve both
accuracy and performance.

### Why is this bad?

Negatively impacts accuracy and performance.

### Example

```rust
use std::f32::consts::E;

let a = 3f32;
let _ = (2f32).powf(a);
let _ = E.powf(a);
let _ = a.powf(1.0 / 2.0);
let _ = a.log(2.0);
let _ = a.log(10.0);
let _ = a.log(E);
let _ = a.powf(2.0);
let _ = a * 2.0 + 4.0;
let _ = if a < 0.0 {
    -a
} else {
    a
};
let _ = if a < 0.0 {
    a
} else {
    -a
};
```

is better expressed as

```rust
use std::f32::consts::E;

let a = 3f32;
let _ = a.exp2();
let _ = a.exp();
let _ = a.sqrt();
let _ = a.log2();
let _ = a.log10();
let _ = a.ln();
let _ = a.powi(2);
let _ = a.mul_add(2.0, 4.0);
let _ = a.abs();
let _ = -a.abs();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/floating_point_arithmetic/mod.rs#L50

## suspicious_operation_groupings

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.50.0

### What it does

Checks for unlikely usages of binary operators that are almost
certainly typos and/or copy/paste errors, given the other usages
of binary operators nearby.

### Why is this bad?

They are probably bugs and if they aren’t then they look like bugs
and you should add a comment explaining why you are doing such an
odd set of operations.

### Known problems

There may be some false positives if you are trying to do something
unusual that happens to look like a typo.

### Example

```rust
struct Vec3 {
    x: f64,
    y: f64,
    z: f64,
}

impl Eq for Vec3 {}

impl PartialEq for Vec3 {
    fn eq(&self, other: &Self) -> bool {
        // This should trigger the lint because `self.x` is compared to `other.y`
        self.x == other.y && self.y == other.y && self.z == other.z
    }
}
```

Use instead:

```rust
// same as above except:
impl PartialEq for Vec3 {
    fn eq(&self, other: &Self) -> bool {
        // Note we now compare other.x to self.x
        self.x == other.x && self.y == other.y && self.z == other.z
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/suspicious_operation_groupings.rs#L12

## too_long_first_doc_paragraph

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.82.0

### What it does

Checks if the first paragraph in the documentation of items listed in the module page is too long.

### Why is this bad?

Documentation will show the first paragraph of the docstring in the summary page of a
module. Having a nice, short summary in the first paragraph is part of writing good docs.

### Example

```rust
/// A very short summary.
/// A much longer explanation that goes into a lot more detail about
/// how the thing works, possibly with doclinks and so one,
/// and probably spanning a many rows.
struct Foo {}
```

Use instead:

```rust
/// A very short summary.
///
/// A much longer explanation that goes into a lot more detail about
/// how the thing works, possibly with doclinks and so one,
/// and probably spanning a many rows.
struct Foo {}
```

### Configuration

- 

`check-private-items`:  Whether to also run the listed lints on private items.

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L648

## trailing_empty_array

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.58.0

### What it does

Displays a warning when a struct with a trailing zero-sized array is declared without a `repr` attribute.

### Why is this bad?

Zero-sized arrays aren’t very useful in Rust itself, so such a struct is likely being created to pass to C code or in some other situation where control over memory layout matters (for example, in conjunction with manual allocation to make it easy to compute the offset of the array). Either way, `#[repr(C)]` (or another `repr` attribute) is needed.

### Example

```rust
struct RarelyUseful {
    some_field: u32,
    last: [u32; 0],
}
```

Use instead:

```rust
#[repr(C)]
struct MoreOftenUseful {
    some_field: usize,
    last: [u32; 0],
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/trailing_empty_array.rs#L7

## trait_duplication_in_bounds

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.47.0

### What it does

Checks for cases where generics or trait objects are being used and multiple
syntax specifications for trait bounds are used simultaneously.

### Why is this bad?

Duplicate bounds makes the code
less readable than specifying them only once.

### Example

```rust
fn func<T: Clone + Default>(arg: T) where T: Clone + Default {}
```

Use instead:

```rust
fn func<T: Clone + Default>(arg: T) {}

// or

fn func<T>(arg: T) where T: Clone + Default {}
```

```rust
fn foo<T: Default + Default>(bar: T) {}
```

Use instead:

```rust
fn foo<T: Default>(bar: T) {}
```

```rust
fn foo<T>(bar: T) where T: Default + Default {}
```

Use instead:

```rust
fn foo<T>(bar: T) where T: Default {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/trait_bounds.rs#L20

## transmute_undefined_repr

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.60.0

### What it does

Checks for transmutes between types which do not have a representation defined relative to
each other.

### Why is this bad?

The results of such a transmute are not defined.

### Known problems

This lint has had multiple problems in the past and was moved to `nursery`. See issue
#8496 for more details.

### Example

```rust
struct Foo<T>(u32, T);
let _ = unsafe { core::mem::transmute::<Foo<u32>, Foo<i32>>(Foo(0u32, 0u32)) };
```

Use instead:

```rust
#[repr(C)]
struct Foo<T>(u32, T);
let _ = unsafe { core::mem::transmute::<Foo<u32>, Foo<i32>>(Foo(0u32, 0u32)) };
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/transmute/mod.rs#L321

## trivial_regex

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for trivial regex
creation (with `Regex::new`, `RegexBuilder::new`, or `RegexSet::new`).

### Why is this bad?

Matching the regex can likely be replaced by `==` or
`str::starts_with`, `str::ends_with` or `std::contains` or other `str`
methods.

### Known problems

If the same regex is going to be applied to multiple
inputs, the precomputations done by `Regex` construction can give
significantly better performance than any of the `str`-based methods.

### Example

```rust
Regex::new("^foobar")
```

Use instead:

```rust
str::starts_with("foobar")
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/regex.rs#L78

## tuple_array_conversions

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.72.0

### What it does

Checks for tuple<=>array conversions that are not done with `.into()`.

### Why is this bad?

It may be unnecessary complexity. `.into()` works for converting tuples<=> arrays of up to
12 elements and conveys the intent more clearly, while also leaving less room for hard to
spot bugs!

### Known issues

The suggested code may hide potential asymmetry in some cases. See
#11085 for more info.

### Example

```rust
let t1 = &[(1, 2), (3, 4)];
let v1: Vec<[u32; 2]> = t1.iter().map(|&(a, b)| [a, b]).collect();
```

Use instead:

```rust
let t1 = &[(1, 2), (3, 4)];
let v1: Vec<[u32; 2]> = t1.iter().map(|&t| t.into()).collect();
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/tuple_array_conversions.rs#L19

## type_repetition_in_bounds

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.38.0

### What it does

This lint warns about unnecessary type repetitions in trait bounds

### Why is this bad?

Repeating the type for every bound makes the code
less readable than combining the bounds

### Example

```rust
pub fn foo<T>(t: T) where T: Copy, T: Clone {}
```

Use instead:

```rust
pub fn foo<T>(t: T) where T: Copy + Clone {}
```

### Configuration

- 

`max-trait-bounds`:  The maximum number of bounds a trait can have to be linted

(default: `3`)

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/trait_bounds.rs#L66

## uninhabited_references

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.76.0

### What it does

It detects references to uninhabited types, such as `!` and
warns when those are either dereferenced or returned from a function.

### Why is this bad?

Dereferencing a reference to an uninhabited type would create
an instance of such a type, which cannot exist. This constitutes
undefined behaviour. Such a reference could have been created
by `unsafe` code.

### Example

The following function can return a reference to an uninhabited type
(`Infallible`) because it uses `unsafe` code to create it. However,
the user of such a function could dereference the return value and
trigger an undefined behavior from safe code.

```rust
fn create_ref() -> &'static std::convert::Infallible {
    unsafe { std::mem::transmute(&()) }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/uninhabited_references.rs#L9

## unnecessary_struct_initialization

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.70.0

### What it does

Checks for initialization of an identical `struct` from another instance
of the type, either by copying a base without setting any field or by
moving all fields individually.

### Why is this bad?

Readability suffers from unnecessary struct building.

### Example

```rust
struct S { s: String }

let a = S { s: String::from("Hello, world!") };
let b = S { ..a };
```

Use instead:

```rust
struct S { s: String }

let a = S { s: String::from("Hello, world!") };
let b = a;
```

The struct literal `S { ..a }` in the assignment to `b` could be replaced
with just `a`.

### Known Problems

Has false positives when the base is a place expression that cannot be
moved out of, see #10547.

Empty structs are ignored by the lint.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unnecessary_struct_initialization.rs#L10

## unused_peekable

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.65.0

### What it does

Checks for the creation of a `peekable` iterator that is never `.peek()`ed

### Why is this bad?

Creating a peekable iterator without using any of its methods is likely a mistake,
or just a leftover after a refactor.

### Example

```rust
let collection = vec![1, 2, 3];
let iter = collection.iter().peekable();

for item in iter {
    // ...
}
```

Use instead:

```rust
let collection = vec![1, 2, 3];
let iter = collection.iter();

for item in iter {
    // ...
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unused_peekable.rs#L12

## unused_rounding

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.63.0

### What it does

Detects cases where a whole-number literal float is being rounded, using
the `floor`, `ceil`, or `round` methods.

### Why is this bad?

This is unnecessary and confusing to the reader. Doing this is probably a mistake.

### Example

```rust
let x = 1f32.ceil();
```

Use instead:

```rust
let x = 1f32;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unused_rounding.rs#L9

## use_self

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for unnecessary repetition of structure name when a
replacement with `Self` is applicable.

### Why is this bad?

Unnecessary repetition. Mixed use of `Self` and struct
name
feels inconsistent.

### Known problems

- Unaddressed false negative in fn bodies of trait implementations

### Example

```rust
struct Foo;
impl Foo {
    fn new() -> Foo {
        Foo {}
    }
}
```

could be

```rust
struct Foo;
impl Foo {
    fn new() -> Self {
        Self {}
    }
}
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

- 

`recursive-self-in-type-definitions`:  Whether the type itself in a struct or enum should be replaced with `Self` when encountering recursive types.

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/use_self.rs#L21

## useless_let_if_seq

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for variable declarations immediately followed by a
conditional affectation.

### Why is this bad?

This is not idiomatic Rust.

### Example

```rust
let foo;

if bar() {
    foo = 42;
} else {
    foo = 0;
}

let mut baz = None;

if bar() {
    baz = Some(42);
}
```

should be written

```rust
let foo = if bar() {
    42
} else {
    0
};

let baz = if bar() {
    Some(42)
} else {
    None
};
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/let_if_seq.rs#L10

## volatile_composites

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.92.0

### What it does

This lint warns when volatile load/store operations
(`write_volatile`/`read_volatile`) are applied to composite types.

### Why is this bad?

Volatile operations are typically used with memory mapped IO devices,
where the precise number and ordering of load and store instructions is
important because they can have side effects. This is well defined for
primitive types like `u32`, but less well defined for structures and
other composite types. In practice it’s implementation defined, and the
behavior can be rustc-version dependent.

As a result, code should only apply `write_volatile`/`read_volatile` to
primitive types to be fully well-defined.

### Example

```rust
struct MyDevice {
    addr: usize,
    count: usize
}

fn start_device(device: *mut MyDevice, addr: usize, count: usize) {
    unsafe {
        device.write_volatile(MyDevice { addr, count });
    }
}
```

Instead, operate on each primtive field individually:

```rust
struct MyDevice {
    addr: usize,
    count: usize
}

fn start_device(device: *mut MyDevice, addr: usize, count: usize) {
    unsafe {
        (&raw mut (*device).addr).write_volatile(addr);
        (&raw mut (*device).count).write_volatile(count);
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/volatile_composites.rs#L10

## while_float

Grupo: `nursery` · Nível padrão: `allow` · Adicionado em: 1.80.0

### What it does

Checks for while loops comparing floating point values.

### Why is this bad?

If you increment floating point values, errors can compound,
so, use integers instead if possible.

### Known problems

The lint will catch all while loops comparing floating point
values without regarding the increment.

### Example

```rust
let mut x = 0.0;
while x < 42.0 {
    x += 1.0;
}
```

Use instead:

```rust
let mut x = 0;
while x < 42 {
    x += 1;
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L697
