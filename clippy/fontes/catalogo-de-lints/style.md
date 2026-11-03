# Catálogo de lints do Clippy — grupo `style`

## assertions_on_constants

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.34.0

### What it does

Checks for `assert!(true)` and `assert!(false)` calls.

### Why is this bad?

Will be optimized out by the compiler or should probably be replaced by a
`panic!()` or `unreachable!()`

### Example

```rust
assert!(false)
assert!(true)
const B: bool = false;
assert!(B)
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/assertions_on_constants.rs#L13

## assign_op_pattern

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for `a = a op b` or `a = b commutative_op a`
patterns.

### Why is this bad?

These can be written as the shorter `a op= b`.

### Known problems

While forbidden by the spec, `OpAssign` traits may have
implementations that differ from the regular `Op` impl.

### Example

```rust
let mut a = 5;
let b = 0;
// ...

a = a + b;
```

Use instead:

```rust
let mut a = 5;
let b = 0;
// ...

a += b;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L107

## blocks_in_conditions

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.45.0

### What it does

Checks for `if` and `match` conditions that use blocks containing an
expression, statements or conditions that use closures with blocks.

### Why is this bad?

Style, using blocks in the condition makes it hard to read.

### Examples

```rust
if { true } { /* ... */ }

if { let x = somefunc(); x } { /* ... */ }

match { let e = somefunc(); e } {
    // ...
}
```

Use instead:

```rust
if true { /* ... */ }

let res = { let x = somefunc(); x };
if res { /* ... */ }

let res = { let e = somefunc(); e };
match res {
    // ...
}
```

### Past names

- block_in_if_condition_expr

- block_in_if_condition_stmt

- blocks_in_if_conditions

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/blocks_in_conditions.rs#L8

## bool_assert_comparison

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.53.0

### What it does

This lint warns about boolean comparisons in assert-like macros.

### Why is this bad?

It is shorter to use the equivalent.

### Example

```rust
assert_eq!("a".is_empty(), false);
assert_ne!("a".is_empty(), true);
```

Use instead:

```rust
assert!(!"a".is_empty());
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/bool_assert_comparison.rs#L14

## borrow_interior_mutable_const

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for a borrow of a named constant with interior mutability.

### Why is this bad?

Named constants are copied at every use site which means any change to their value
will be lost after the newly created value is dropped. e.g.

```rust
use core::sync::atomic::{AtomicUsize, Ordering};
const ATOMIC: AtomicUsize = AtomicUsize::new(0);
fn add_one() -> usize {
    // This will always return `0` since `ATOMIC` is copied before it's borrowed
    // for use by `fetch_add`.
    ATOMIC.fetch_add(1, Ordering::AcqRel)
}
```

### Known problems

This lint does not, and cannot in general, determine if the borrow of the constant
is used in a way which causes a mutation. e.g.

```rust
use core::cell::Cell;
const CELL: Cell<usize> = Cell::new(0);
fn get_cell() -> Cell<usize> {
    // This is fine. It borrows a copy of `CELL`, but never mutates it through the
    // borrow.
    CELL.clone()
}
```

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
use std::sync::atomic::{AtomicUsize, Ordering::SeqCst};
const CONST_ATOM: AtomicUsize = AtomicUsize::new(12);

static STATIC_ATOM: AtomicUsize = CONST_ATOM;
STATIC_ATOM.store(9, SeqCst);
assert_eq!(STATIC_ATOM.load(SeqCst), 9); // use a `static` item to refer to the same instance
```

### Configuration

- 

`ignore-interior-mutability`:  A list of paths to types that should be treated as if they do not contain interior mutability

(default: `["bytes::Bytes"]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/non_copy_const.rs#L43

## box_default

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.66.0

### What it does

checks for `Box::new(Default::default())`, which can be written as
`Box::default()`.

### Why is this bad?

`Box::default()` is equivalent and more concise.

### Example

```rust
let x: Box<String> = Box::new(Default::default());
```

Use instead:

```rust
let x: Box<String> = Box::default();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/box_default.rs#L14

## builtin_type_shadow

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Warns if a generic shadows a built-in type.

### Why is this bad?

This gives surprising type errors.

### Example

```rust
impl<u32> Foo<u32> {
    fn impl_func(&self) -> u32 {
        42
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/misc_early/mod.rs#L16

## byte_char_slices

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.81.0

### What it does

Checks for hard to read slices of byte characters, that could be more easily expressed as a
byte string.

### Why is this bad?

Potentially makes the string harder to read.

### Example

```rust
&[b'H', b'e', b'l', b'l', b'o'];
```

Use instead:

```rust
b"Hello"
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/byte_char_slices.rs#L13

## bytes_nth

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.52.0

### What it does

Checks for the use of `.bytes().nth()`.

### Why is this bad?

`.as_bytes().get()` is more efficient and more
readable.

### Example

```rust
"Hello".bytes().nth(3);
```

Use instead:

```rust
"Hello".as_bytes().get(3);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L270

## chars_last_cmp

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `_.chars().last()` or
`_.chars().next_back()` on a `str` to check if it ends with a given char.

### Why is this bad?

Readability, this can be written more concisely as
`_.ends_with(_)`.

### Example

```rust
name.chars().last() == Some('_') || name.chars().next_back() == Some('-');
```

Use instead:

```rust
name.ends_with('_') || name.ends_with('-');
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L321

## chars_next_cmp

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `.chars().next()` on a `str` to check
if it starts with a given char.

### Why is this bad?

Readability, this can be written more concisely as
`_.starts_with(_)`.

### Example

```rust
let name = "foo";
if name.chars().next() == Some('_') {};
```

Use instead:

```rust
let name = "foo";
if name.starts_with('_') {};
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L347

## chunks_exact_to_as_chunks

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.98.0

### What it does

Checks for usage of `chunks_exact` or `chunks_exact_mut` with a constant chunk size.

### Why is this bad?

`as_chunks` provides better ergonomics and type safety by returning arrays instead of slices.
It was stabilized in Rust 1.88.

### Example

```rust
let slice = [1, 2, 3, 4, 5, 6];
let mut it = slice.chunks_exact(2);
for chunk in it {}
```

Use instead:

```rust
let slice = [1, 2, 3, 4, 5, 6];
let (chunks, remainder) = slice.as_chunks::<2>();
for chunk in chunks {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L373

## cmp_null

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

This lint checks for equality comparisons with `ptr::null` or `ptr::null_mut`

### Why is this bad?

It’s easier and more readable to use the inherent
`.is_null()`
method instead

### Example

```rust
use std::ptr;

if x == ptr::null() {
    // ..
}
```

Use instead:

```rust
if x.is_null() {
    // ..
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/ptr/mod.rs#L9

## collapsible_if

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for nested `if` statements which can be collapsed
by `&&`-combining their conditions.

### Why is this bad?

Each `if`-statement adds one level of nesting, which
makes code look more complex than it really is.

### Example

```rust
if x {
    if y {
        // …
    }
}
```

Use instead:

```rust
if x && y {
    // …
}
```

### Configuration

- 

`lint-commented-code`:  Whether collapsible `if` and `else if` chains are linted if they contain comments inside the parts
that would be collapsed.

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/collapsible_if.rs#L51

## collapsible_match

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.50.0

### What it does

Finds nested `match` or `if let` expressions where the patterns may be “collapsed” together
without adding any branches.

Note that this lint is not intended to find all cases where nested match patterns can be merged, but only
cases where merging would most likely make the code more readable.

### Why is this bad?

It is unnecessarily verbose and complex.

### Example

```rust
fn func(opt: Option<Result<u64, String>>) {
    let n = match opt {
        Some(n) => match n {
            Ok(n) => n,
            _ => return,
        }
        None => return,
    };
}
```

Use instead:

```rust
fn func(opt: Option<Result<u64, String>>) {
    let n = match opt {
        Some(Ok(n)) => n,
        _ => return,
    };
}
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L38

## comparison_to_empty

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.49.0

### What it does

Checks for comparing to an empty slice such as `""` or `[]`,
and suggests using `.is_empty()` where applicable.

### Why is this bad?

Some structures can answer `.is_empty()` much faster
than checking for equality. So it is good to get into the habit of using
`.is_empty()`, and having it is cheap.
Besides, it makes the intent clearer than a manual comparison in some contexts.

### Example

```rust
if s == "" {
    ..
}

if arr == [] {
    ..
}
```

Use instead:

```rust
if s.is_empty() {
    ..
}

if arr.is_empty() {
    ..
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/len_zero.rs#L17

## default_instead_of_iter_empty

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.64.0

### What it does

It checks for `std::iter::Empty::default()` and suggests replacing it with
`std::iter::empty()`.

### Why is this bad?

`std::iter::empty()` is the more idiomatic way.

### Example

```rust
let _ = std::iter::Empty::<usize>::default();
let iter: std::iter::Empty<usize> = std::iter::Empty::default();
```

Use instead:

```rust
let _ = std::iter::empty::<usize>();
let iter: std::iter::Empty<usize> = std::iter::empty();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/default_instead_of_iter_empty.rs#L9

## disallowed_fields

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.95.0

### What it does

Denies the configured fields in clippy.toml

Note: Even though this lint is warn-by-default, it will only trigger if
fields are defined in the clippy.toml file.

### Why is this bad?

Some fields are undesirable in certain contexts, and it’s beneficial to
lint for them as needed.

### Example

An example clippy.toml configuration:

```rust
disallowed-fields = [
    # Can use a string as the path of the disallowed field.
    "std::ops::Range::start",
    # Can also use an inline table with a `path` key.
    { path = "std::ops::Range::start" },
    # When using an inline table, can add a `reason` for why the field
    # is disallowed.
    { path = "std::ops::Range::start", reason = "The start of the range is not used" },
]
```

```rust
use std::ops::Range;

let range = Range { start: 0, end: 1 };
println!("{}", range.start); // `start` is disallowed in the config.
```

Use instead:

```rust
use std::ops::Range;

let range = Range { start: 0, end: 1 };
println!("{}", range.end); // `end` is _not_ disallowed in the config.
```

### Configuration

- `disallowed-fields`:  The list of disallowed fields, written as fully qualified paths.

Fields:

- 

`path` (required): the fully qualified path to the field that should be disallowed

- 

`reason` (optional): explanation why this field is disallowed

- 

`replacement` (optional): suggested alternative method

- 

`allow-invalid` (optional, `false` by default): when set to `true`, it will ignore this entry
if the path doesn’t exist, instead of emitting an error

(default: `[]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/disallowed_items.rs#L16

## disallowed_macros

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.66.0

### What it does

Denies the configured macros in clippy.toml

Note: Even though this lint is warn-by-default, it will only trigger if
macros are defined in the clippy.toml file.

### Why is this bad?

Some macros are undesirable in certain contexts, and it’s beneficial to
lint for them as needed.

### Example

An example clippy.toml configuration:

```rust
disallowed-macros = [
    # Can use a string as the path of the disallowed macro.
    "std::print",
    # Can also use an inline table with a `path` key.
    { path = "std::println" },
    # When using an inline table, can add a `reason` for why the macro
    # is disallowed.
    { path = "serde::Serialize", reason = "no serializing" },
    # This would normally error if the path is incorrect, but with `allow-invalid` = `true`,
    # it will be silently ignored
    { path = "std::invalid_macro", reason = "use alternative instead", allow-invalid = true }
]
```

```rust
use serde::Serialize;

println!("warns");

// The diagnostic will contain the message "no serializing"
#[derive(Serialize)]
struct Data {
    name: String,
    value: usize,
}
```

### Configuration

- `disallowed-macros`:  The list of disallowed macros, written as fully qualified paths.

Fields:

- 

`path` (required): the fully qualified path to the macro that should be disallowed

- 

`reason` (optional): explanation why this macro is disallowed

- 

`replacement` (optional): suggested alternative macro

- 

`allow-invalid` (optional, `false` by default): when set to `true`, it will ignore this entry
if the path doesn’t exist, instead of emitting an error

(default: `[]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/disallowed_macros.rs#L19

## disallowed_methods

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.49.0

### What it does

Denies the configured methods and functions in clippy.toml

Note: Even though this lint is warn-by-default, it will only trigger if
methods are defined in the clippy.toml file.

### Why is this bad?

Some methods are undesirable in certain contexts, and it’s beneficial to
lint for them as needed.

### Example

An example clippy.toml configuration:

```rust
disallowed-methods = [
    # Can use a string as the path of the disallowed method.
    "std::boxed::Box::new",
    # Can also use an inline table with a `path` key.
    { path = "std::time::Instant::now" },
    # When using an inline table, can add a `reason` for why the method
    # is disallowed.
    { path = "std::vec::Vec::leak", reason = "no leaking memory" },
    # Can also add a `replacement` that will be offered as a suggestion.
    { path = "std::sync::Mutex::new", reason = "prefer faster & simpler non-poisonable mutex", replacement = "parking_lot::Mutex::new" },
    # This would normally error if the path is incorrect, but with `allow-invalid` = `true`,
    # it will be silently ignored
    { path = "std::fs::InvalidPath", reason = "use alternative instead", allow-invalid = true },
]
```

```rust
let xs = vec![1, 2, 3, 4];
xs.leak(); // Vec::leak is disallowed in the config.
// The diagnostic contains the message "no leaking memory".

let _now = Instant::now(); // Instant::now is disallowed in the config.

let _box = Box::new(3); // Box::new is disallowed in the config.
```

Use instead:

```rust
let mut xs = Vec::new(); // Vec::new is _not_ disallowed in the config.
xs.push(123); // Vec::push is _not_ disallowed in the config.
```

### Past names

- disallowed_method

### Configuration

- `disallowed-methods`:  The list of disallowed methods, written as fully qualified paths.

Fields:

- 

`path` (required): the fully qualified path to the method that should be disallowed

- 

`reason` (optional): explanation why this method is disallowed

- 

`replacement` (optional): suggested alternative method

- 

`allow-invalid` (optional, `false` by default): when set to `true`, it will ignore this entry
if the path doesn’t exist, instead of emitting an error

(default: `[]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/disallowed_items.rs#L62

## disallowed_names

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of disallowed names for variables, such
as `foo`.

### Why is this bad?

These names are usually placeholder names and should be
avoided.

### Example

```rust
let foo = 3.14;
```

### Past names

- blacklisted_name

### Configuration

- 

`disallowed-names`:  The list of disallowed names to lint about. NB: `bar` is not here since it has legitimate uses. The value
`".."` can be used as part of the list to indicate that the configured values should be appended to the
default configuration of Clippy. By default, any configuration will replace the default value.

(default: `["foo", "baz", "quux"]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/disallowed_names.rs#L9

## disallowed_types

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.55.0

### What it does

Denies the configured types in clippy.toml.

Note: Even though this lint is warn-by-default, it will only trigger if
types are defined in the clippy.toml file.

### Why is this bad?

Some types are undesirable in certain contexts.

### Example:

An example clippy.toml configuration:

```rust
disallowed-types = [
    # Can use a string as the path of the disallowed type.
    "std::collections::BTreeMap",
    # Can also use an inline table with a `path` key.
    { path = "std::net::TcpListener" },
    # When using an inline table, can add a `reason` for why the type
    # is disallowed.
    { path = "std::net::Ipv4Addr", reason = "no IPv4 allowed" },
    # Can also add a `replacement` that will be offered as a suggestion.
    { path = "std::sync::Mutex", reason = "prefer faster & simpler non-poisonable mutex", replacement = "parking_lot::Mutex" },
    # This would normally error if the path is incorrect, but with `allow-invalid` = `true`,
    # it will be silently ignored
    { path = "std::invalid::Type", reason = "use alternative instead", allow-invalid = true }
]
```

```rust
use std::collections::BTreeMap;
// or its use
let x = std::collections::BTreeMap::new();
```

Use instead:

```rust
// A similar type that is allowed by the config
use std::collections::HashMap;
```

### Past names

- disallowed_type

### Configuration

- `disallowed-types`:  The list of disallowed types, written as fully qualified paths.

Fields:

- 

`path` (required): the fully qualified path to the type that should be disallowed

- 

`reason` (optional): explanation why this type is disallowed

- 

`replacement` (optional): suggested alternative type

- 

`allow-invalid` (optional, `false` by default): when set to `true`, it will ignore this entry
if the path doesn’t exist, instead of emitting an error

(default: `[]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/disallowed_items.rs#L114

## doc_lazy_continuation

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.80.0

### What it does

In CommonMark Markdown, the language used to write doc comments, a
paragraph nested within a list or block quote does not need any line
after the first one to be indented or marked. The specification calls
this a “lazy paragraph continuation.”

### Why is this bad?

This is easy to write but hard to read. Lazy continuations makes
unintended markers hard to see, and make it harder to deduce the
document’s intended structure.

### Example

This table is probably intended to have two rows,
but it does not. It has zero rows, and is followed by
a block quote.

```rust
/// Range | Description
/// ----- | -----------
/// >= 1  | fully opaque
/// < 1   | partially see-through
fn set_opacity(opacity: f32) {}
```

Fix it by escaping the marker:

```rust
/// Range | Description
/// ----- | -----------
/// \>= 1 | fully opaque
/// < 1   | partially see-through
fn set_opacity(opacity: f32) {}
```

This example is actually intended to be a list:

```rust
/// * Do nothing.
/// * Then do something. Whatever it is needs done,
/// it should be done right now.
```

Fix it by indenting the list contents:

```rust
/// * Do nothing.
/// * Then do something. Whatever it is needs done,
///   it should be done right now.
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L133

## doc_overindented_list_items

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.86.0

### What it does

Detects overindented list items in doc comments where the continuation
lines are indented more than necessary.

### Why is this bad?

Overindented list items in doc comments can lead to inconsistent and
poorly formatted documentation when rendered. Excessive indentation may
cause the text to be misinterpreted as a nested list item or code block,
affecting readability and the overall structure of the documentation.

### Example

```rust
/// - This is the first item in a list
///      and this line is overindented.
```

Fixes this into:

```rust
/// - This is the first item in a list
///   and this line is overindented.
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L303

## double_must_use

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.40.0

### What it does

Checks for a `#[must_use]` attribute without
further information on functions and methods that return a type already
considered as `#[must_use]`.

### Why is this bad?

The attribute isn’t needed. Not using the result
will already be reported. Alternatively, one can add some text to the
attribute to improve the lint message.

### Examples

```rust
#[must_use]
fn double_must_use() -> Result<(), ()> {
    unimplemented!();
}
```

### Note

The compiler may consider a type as being indirectly `#[must_use]`. For
example, although `Box<_>` itself is not `#[must_use]`, `Box<T>` will be
considered `#[must_use]` if `T` is.

```rust
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/functions/mod.rs#L23

## duplicate_underscore_argument

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for function arguments having the similar names
differing by an underscore.

### Why is this bad?

It affects code readability.

### Example

```rust
fn foo(a: i32, _a: i32) {}
```

Use instead:

```rust
fn bar(a: i32, _b: i32) {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/functions/mod.rs#L53

## enum_variant_names

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Detects enumeration variants that are prefixed or suffixed
by the same characters.

### Why is this bad?

Enumeration variant names should specify their variant,
not repeat the enumeration name.

### Limitations

Characters with no casing will be considered when comparing prefixes/suffixes
This applies to numbers and non-ascii characters without casing
e.g. `Foo1` and `Foo2` is considered to have different prefixes
(the prefixes are `Foo1` and `Foo2` respectively), as also `Bar螃`, `Bar蟹`

### Example

```rust
enum Cake {
    BlackForestCake,
    HummingbirdCake,
    BattenbergCake,
}
```

Use instead:

```rust
enum Cake {
    BlackForest,
    Hummingbird,
    Battenberg,
}
```

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

- 

`enum-variant-name-threshold`:  The minimum number of enum variants for the lints about variant names to trigger

(default: `3`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/item_name_repetitions.rs#L10

## err_expect

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.62.0

### What it does

Checks for `.err().expect()` calls on the `Result` type.

### Why is this bad?

`.expect_err()` can be called directly to avoid the extra type conversion from `err()`.

### Example

```rust
let x: Result<u32, &str> = Ok(10);
x.err().expect("Testing err().expect()");
```

Use instead:

```rust
let x: Result<u32, &str> = Ok(10);
x.expect_err("Testing expect_err");
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L616

## excessive_precision

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for float literals with a precision greater
than that supported by the underlying type.

The lint is suppressed for literals with over `const_literal_digits_threshold` digits.

### Why is this bad?

Rust will truncate the literal silently.

### Example

```rust
let v: f32 = 0.123_456_789_9;
println!("{}", v); //  0.123_456_789
```

Use instead:

```rust
let v: f64 = 0.123_456_789_9;
println!("{}", v); //  0.123_456_789_9
```

### Configuration

- 

`const-literal-digits-threshold`:  The minimum digits a const float literal must have to suppress the `excessive_precision` lint

(default: `30`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/float_literal.rs#L11

## field_reassign_with_default

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.49.0

### What it does

Checks for immediate reassignment of fields initialized
with `Default::default()`.

### Why is this bad?

It’s more idiomatic to use the functional update syntax.

### Known problems

Assignments to patterns that are of tuple type are not linted.

### Example

```rust
let mut a: A = Default::default();
a.i = 42;
```

Use instead:

```rust
let a = A {
    i: 42,
    .. Default::default()
};
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/default.rs#L37

## filter_map_bool_then

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.73.0

### What it does

Checks for usage of `bool::then` in `Iterator::filter_map`.

### Why is this bad?

This can be written with `filter` then `map` instead, which would reduce nesting and
separates the filtering from the transformation phase. This comes with no cost to
performance and is just cleaner.

### Limitations

Does not lint `bool::then_some`, as it eagerly evaluates its arguments rather than lazily.
This can create differing behavior, so better safe than sorry.

### Example

```rust
_ = v.into_iter().filter_map(|i| (i % 2 == 0).then(|| really_expensive_fn(i)));
```

Use instead:

```rust
_ = v.into_iter().filter(|i| i % 2 == 0).map(|i| really_expensive_fn(i));
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L836

## fn_to_numeric_cast

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for casts of function pointers to something other than `usize`.

### Why is this bad?

Casting a function pointer to anything other than `usize`/`isize` is
not portable across architectures. If the target type is too small the
address would be truncated, and target types larger than `usize` are
unnecessary.

Casting to `isize` also doesn’t make sense, since addresses are never
signed.

### Example

```rust
fn fun() -> i32 { 1 }
let _ = fun as i64;
```

Use instead:

```rust
let _ = fun as usize;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L542

## fn_to_numeric_cast_with_truncation

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for casts of a function pointer to a numeric type not wide enough to
store an address.

### Why is this bad?

Such a cast discards some bits of the function’s address. If this is intended, it would be more
clearly expressed by casting to `usize` first, then casting the `usize` to the intended type (with
a comment) to perform the truncation.

### Example

```rust
fn fn1() -> i16 {
    1
};
let _ = fn1 as i32;
```

Use instead:

```rust
// Cast to usize first, then comment with the reason for the truncation
fn fn1() -> i16 {
    1
};
let fn_ptr = fn1 as usize;
let fn_ptr_truncated = fn_ptr as i32;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L614

## for_kv_map

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for iterating a map (`HashMap` or `BTreeMap`) and
ignoring either the keys or values.

### Why is this bad?

Readability. There are `keys` and `values` methods that
can be used to express that don’t need the values or keys.

### Example

```rust
for (k, _) in &map {
    ..
}
```

could be replaced by

```rust
for k in map.keys() {
    ..
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L210

## from_over_into

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.51.0

### What it does

Searches for implementations of the `Into<..>` trait and suggests to implement `From<..>` instead.

### Why is this bad?

According the std docs implementing `From<..>` is preferred since it gives you `Into<..>` for free where the reverse isn’t true.

### Example

```rust
struct StringWrapper(String);

impl Into<StringWrapper> for String {
    fn into(self) -> StringWrapper {
        StringWrapper(self)
    }
}
```

Use instead:

```rust
struct StringWrapper(String);

impl From<String> for StringWrapper {
    fn from(s: String) -> StringWrapper {
        StringWrapper(s)
    }
}
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/from_over_into.rs#L21

## from_str_radix_10

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.52.0

### What it does

Checks for function invocations of the form `integer::from_str_radix(s, 10)`

This also applies to `NonZero` integer types on Rust 1.98 and later.

### Why is this bad?

This specific common use case can be rewritten as `s.parse::<integer>()`
(and in most cases, the turbofish can be removed), which reduces code length
and complexity.

### Known problems

This lint may suggest using `(&<expression>).parse()` instead of `<expression>.parse()`
directly in some cases, which is correct but adds unnecessary complexity to the code.

### Example

```rust
let input: &str = get_input();
let num = u16::from_str_radix(input, 10)?;
```

Use instead:

```rust
let input: &str = get_input();
let num: u16 = input.parse()?;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/from_str_radix_10.rs#L14

## get_first

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.63.0

### What it does

Checks for usage of `x.get(0)` instead of
`x.first()` or `x.front()`.

### Why is this bad?

Using `x.first()` for `Vec`s and slices or `x.front()`
for `VecDeque`s is easier to read and has the same result.

### Example

```rust
let x = vec![2, 3, 5];
let first_element = x.get(0);
```

Use instead:

```rust
let x = vec![2, 3, 5];
let first_element = x.first();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1023

## if_same_then_else

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for `if/else` with the same body as the then part
and the else part.

### Why is this bad?

This is probably a copy & paste error.

### Example

```rust
let foo = if … {
    42
} else {
    42
};
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/ifs/mod.rs#L65

## implicit_saturating_add

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.66.0

### What it does

Checks for implicit saturating addition.

### Why is this bad?

The built-in function is more readable and may be faster.

### Example

```rust
let mut u:u32 = 7000;

if u != u32::MAX {
    u += 1;
}
```

Use instead:

```rust
let mut u:u32 = 7000;

u = u.saturating_add(1);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/implicit_saturating_add.rs#L12

## implicit_saturating_sub

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.44.0

### What it does

Checks for implicit saturating subtraction.

### Why is this bad?

Simplicity and readability. Instead we can easily use an builtin function.

### Example

```rust
let mut i: u32 = end - start;

if i != 0 {
    i -= 1;
}
```

Use instead:

```rust
let mut i: u32 = end - start;

i = i.saturating_sub(1);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/implicit_saturating_sub.rs#L19

## inconsistent_digit_grouping

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Warns if an integral or floating-point constant is
grouped inconsistently with underscores.

### Why is this bad?

Readers may incorrectly interpret inconsistently
grouped digits.

### Example

```rust
618_64_9189_73_511
```

Use instead:

```rust
61_864_918_973_511
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/literal_representation.rs#L32

## infallible_destructuring_match

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for matches being used to destructure a single-variant enum
or tuple struct where a `let` will suffice.

### Why is this bad?

Just readability – `let` doesn’t nest, whereas a `match` does.

### Example

```rust
enum Wrapper {
    Data(i32),
}

let wrapper = Wrapper::Data(42);

let data = match wrapper {
    Wrapper::Data(i) => i,
};
```

The correct use would be:

```rust
enum Wrapper {
    Data(i32),
}

let wrapper = Wrapper::Data(42);
let Wrapper::Data(data) = wrapper;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L76

## inherent_to_string

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.38.0

### What it does

Checks for the definition of inherent methods with a signature of `to_string(&self) -> String`.

### Why is this bad?

This method is also implicitly defined if a type implements the `Display` trait. As the functionality of `Display` is much more versatile, it should be preferred.

### Example

```rust
pub struct A;

impl A {
    pub fn to_string(&self) -> String {
        "I am A".to_string()
    }
}
```

Use instead:

```rust
use std::fmt;

pub struct A;

impl fmt::Display for A {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "I am A")
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/inherent_to_string.rs#L11

## init_numbered_fields

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.59.0

### What it does

Checks for tuple structs initialized with field syntax.
It will however not lint if a base initializer is present.
The lint will also ignore code in macros.

### Why is this bad?

This may be confusing to the uninitiated and adds no
benefit as opposed to tuple initializers

### Example

```rust
struct TupleStruct(u8, u16);

let _ = TupleStruct {
    0: 1,
    1: 23,
};

// should be written as
let base = TupleStruct(1, 23);

// This is OK however
let _ = TupleStruct { 0: 42, ..base };
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/init_numbered_fields.rs#L10

## into_iter_on_ref

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.32.0

### What it does

Checks for `into_iter` calls on references which should be replaced by `iter`
or `iter_mut`.

### Why is this bad?

Readability. Calling `into_iter` on a reference will not move out its
content into the resulting iterator, which is confusing. It is better just call `iter` or
`iter_mut` directly.

### Example

```rust
(&vec).into_iter();
```

Use instead:

```rust
(&vec).iter();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1199

## io_other_error

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.87.0

This lint warns on calling `io::Error::new(..)` with a kind of
`io::ErrorKind::Other`.

### Why is this bad?

Since Rust 1.74, there’s the `io::Error::other(_)` shortcut.

### Example

```rust
use std::io;
let _ = io::Error::new(io::ErrorKind::Other, "bad".to_string());
```

Use instead:

```rust
let _ = std::io::Error::other("bad".to_string());
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1226

## is_digit_ascii_radix

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.62.0

### What it does

Finds usages of `char::is_digit` that
can be replaced with `is_ascii_digit` or
`is_ascii_hexdigit`.

### Why is this bad?

`is_digit(..)` is slower and requires specifying the radix.

### Example

```rust
let c: char = '6';
c.is_digit(10);
c.is_digit(16);
```

Use instead:

```rust
let c: char = '6';
c.is_ascii_digit();
c.is_ascii_hexdigit();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1284

## items_after_test_module

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.71.0

### What it does

Triggers if an item is declared after the testing module marked with `#[cfg(test)]`.

### Why is this bad?

Having items declared after the testing module is confusing and may lead to bad test coverage.

### Example

```rust
#[cfg(test)]
mod tests {
    // [...]
}

fn my_function() {
    // [...]
}
```

Use instead:

```rust
fn my_function() {
    // [...]
}

#[cfg(test)]
mod tests {
    // [...]
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/items_after_test_module.rs#L11

## iter_cloned_collect

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for the use of `.cloned().collect()` on slice to
create a `Vec`.

### Why is this bad?

`.to_vec()` is clearer

### Example

```rust
let s = [1, 2, 3, 4, 5];
let s2: Vec<isize> = s[..].iter().cloned().collect();
```

The better use would be:

```rust
let s = [1, 2, 3, 4, 5];
let s2: Vec<isize> = s.to_vec();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1311

## iter_next_slice

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.46.0

### What it does

Checks for usage of `iter().next()` or `iter_mut().next()` on a Slice or an Array

### Why is this bad?

These can be shortened into `.first()` or `.first_mut()`

### Example

```rust
a[2..].iter().next();
b.iter().next();
c.iter_mut().next();
```

should be written as:

```rust
a.get(2);
b.first();
c.first_mut();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1443

## iter_nth

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `.iter().nth()`/`.iter_mut().nth()` on standard library types that have
equivalent `.get()`/`.get_mut()` methods.

### Why is this bad?

`.get()` and `.get_mut()` are equivalent but more concise.

### Example

```rust
let some_vec = vec![0, 1, 2, 3];
let bad_vec = some_vec.iter().nth(3);
let bad_slice = &some_vec[..].iter().nth(3);
```

The correct use would be:

```rust
let some_vec = vec![0, 1, 2, 3];
let bad_vec = some_vec.get(3);
let bad_slice = &some_vec[..].get(3);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1474

## iter_nth_zero

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.42.0

### What it does

Checks for the use of `iter.nth(0)`.

### Why is this bad?

`iter.next()` is equivalent to
`iter.nth(0)`, as they both consume the next element,
but is more readable.

### Example

```rust
let x = s.iter().nth(0);
```

Use instead:

```rust
let x = s.iter().next();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1500

## iter_skip_next

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `.skip(x).next()` on iterators.

### Why is this bad?

`.nth(x)` is cleaner

### Example

```rust
let some_vec = vec![0, 1, 2, 3];
let bad_vec = some_vec.iter().skip(3).next();
let bad_slice = &some_vec[..].iter().skip(3).next();
```

The correct use would be:

```rust
let some_vec = vec![0, 1, 2, 3];
let bad_vec = some_vec.iter().nth(3);
let bad_slice = &some_vec[..].iter().nth(3);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1648

## just_underscores_and_digits

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks if you have variables whose name consists of just
underscores and digits.

### Why is this bad?

It’s hard to memorize what a variable means without a
descriptive name.

### Example

```rust
let _1 = 1;
let ___1 = 1;
let __1___2 = 11;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/non_expressive_names.rs#L12

## legacy_numeric_constants

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.79.0

### What it does

Checks for usage of `<integer>::max_value()`, `std::<integer>::MAX`,
`std::<float>::EPSILON`, etc.

### Why is this bad?

All of these have been superseded by the associated constants on their respective types,
such as `i128::MAX`. These legacy items may be deprecated in a future version of rust.

### Example

```rust
let eps = std::f32::EPSILON;
```

Use instead:

```rust
let eps = f32::EPSILON;
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/legacy_numeric_constants.rs#L13

## len_without_is_empty

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for items that implement `.len()` but not
`.is_empty()`.

### Why is this bad?

It is good custom to have both methods, because for
some data structures, asking about the length will be a costly operation,
whereas `.is_empty()` can usually answer in constant time. Also it used to
lead to false positives on the `len_zero` lint – currently that
lint will ignore such entities.

### Example

```rust
impl X {
    pub fn len(&self) -> usize {
        ..
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/len_without_is_empty.rs#L17

## len_zero

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for getting the length of something via `.len()`
just to compare to zero, and suggests using `.is_empty()` where applicable.

### Why is this bad?

Some structures can answer `.is_empty()` much faster
than calculating their length. So it is good to get into the habit of using
`.is_empty()`, and having it is cheap.
Besides, it makes the intent clearer than a manual comparison in some contexts.

### Example

```rust
if x.len() == 0 {
    ..
}
if y.len() != 0 {
    ..
}
```

instead use

```rust
if x.is_empty() {
    ..
}
if !y.is_empty() {
    ..
}
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/len_zero.rs#L55

## let_and_return

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for `let`-bindings, which are subsequently
returned.

### Why is this bad?

It is just extraneous code. Remove it to make your code
more rusty.

### Known problems

In the case of some temporaries, e.g. locks, eliding the variable binding could lead
to deadlocks. See this issue.
This could become relevant if the code is later changed to use the code that would have been
bound without first assigning it to a let-binding.

### Example

```rust
fn foo() -> String {
    let x = String::new();
    x
}
```

instead, use

```rust
fn foo() -> String {
    String::new()
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/returns/mod.rs#L11

## let_unit_value

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for binding a unit value.

### Why is this bad?

A unit value cannot usefully be used anywhere. So
binding one is kind of pointless.

### Example

```rust
let x = {
    1;
};
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unit_types/mod.rs#L10

## main_recursion

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.38.0

### What it does

Checks for recursion using the entrypoint.

### Why is this bad?

Apart from special setups (which we could detect following attributes like `#![no_std]`),
recursing into `main()` seems like an unintuitive anti-pattern we should be able to detect.

### Example

```rust
fn main() {
    main();
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/main_recursion.rs#L9

## manual_async_fn

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.45.0

### What it does

It checks for manual implementations of `async` functions.

### Why is this bad?

It’s more idiomatic to use the dedicated syntax.

### Example

```rust
use std::future::Future;

fn foo() -> impl Future<Output = i32> { async { 42 } }
```

Use instead:

```rust
async fn foo() -> i32 { 42 }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_async_fn.rs#L15

## manual_bits

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.60.0

### What it does

Checks for usage of `size_of::<T>() * 8` when
`T::BITS` is available.

### Why is this bad?

Can be written as the shorter `T::BITS`.

### Example

```rust
size_of::<usize>() * 8;
```

Use instead:

```rust
usize::BITS as usize;
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_bits.rs#L14

## manual_dangling_ptr

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.88.0

### What it does

Checks for casts of small constant literals or `mem::align_of` results to raw pointers.

### Why is this bad?

This creates a dangling pointer and is better expressed as
{`std`, `core`}`::ptr::`{`dangling`, `dangling_mut`}.

### Example

```rust
let ptr = 4 as *const u32;
let aligned = std::mem::align_of::<u32>() as *const u32;
let mut_ptr: *mut i64 = 8 as *mut _;
```

Use instead:

```rust
let ptr = std::ptr::dangling::<u32>();
let aligned = std::ptr::dangling::<u32>();
let mut_ptr: *mut i64 = std::ptr::dangling_mut();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L647

## manual_is_ascii_check

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.67.0

### What it does

Suggests to use dedicated built-in methods,
`is_ascii_(lowercase|uppercase|digit|hexdigit)` for checking on corresponding
ascii range

### Why is this bad?

Using the built-in functions is more readable and makes it
clear that it’s not a specific subset of characters, but all
ASCII (lowercase|uppercase|digit|hexdigit) characters.

### Example

```rust
assert!(matches!('x', 'a'..='z'));
assert!(matches!(b'X', b'A'..=b'Z'));
assert!(matches!('2', '0'..='9'));
assert!(matches!('x', 'A'..='Z' | 'a'..='z'));
assert!(matches!('C', '0'..='9' | 'a'..='f' | 'A'..='F'));

('0'..='9').contains(&'0');
('a'..='z').contains(&'a');
('A'..='Z').contains(&'A');
```

Use instead:

```rust
assert!('x'.is_ascii_lowercase());
assert!(b'X'.is_ascii_uppercase());
assert!('2'.is_ascii_digit());
assert!('x'.is_ascii_alphabetic());
assert!('C'.is_ascii_hexdigit());

'0'.is_ascii_digit();
'a'.is_ascii_lowercase();
'A'.is_ascii_uppercase();
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_is_ascii_check.rs#L16

## manual_is_finite

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.73.0

### What it does

Checks for manual `is_finite` reimplementations
(i.e., `x != <float>::INFINITY && x != <float>::NEG_INFINITY`).

### Why is this bad?

The method `is_finite` is shorter and more readable.

### Example

```rust
if x != f32::INFINITY && x != f32::NEG_INFINITY {}
if x.abs() < f32::INFINITY {}
```

Use instead:

```rust
if x.is_finite() {}
if x.is_finite() {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_float_methods.rs#L15

## manual_is_infinite

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.73.0

### What it does

Checks for manual `is_infinite` reimplementations
(i.e., `x == <float>::INFINITY || x == <float>::NEG_INFINITY`).

### Why is this bad?

The method `is_infinite` is shorter and more readable.

### Example

```rust
if x == f32::INFINITY || x == f32::NEG_INFINITY {}
```

Use instead:

```rust
if x.is_infinite() {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_float_methods.rs#L41

## manual_map

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.52.0

### What it does

Checks for usage of `match` which could be implemented using `map`

### Why is this bad?

Using the `map` method is clearer and more concise.

### Example

```rust
match Some(0) {
    Some(x) => Some(x + 1),
    None => None,
};
```

Use instead:

```rust
Some(0).map(|x| x + 1);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L140

## manual_next_back

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.71.0

### What it does

Checks for `.rev().next()` on a `DoubleEndedIterator`

### Why is this bad?

`.next_back()` is cleaner.

### Example

```rust
foo.iter().rev().next();
```

Use instead:

```rust
foo.iter().next_back();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2029

## manual_non_exhaustive

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.45.0

### What it does

Checks for manual implementations of the non-exhaustive pattern.

### Why is this bad?

Using the `#[non_exhaustive]` attribute expresses better the intent
and allows possible optimizations when applied to enums.

### Example

```rust
struct S {
    pub a: i32,
    pub b: i32,
    _c: (),
}

enum E {
    A,
    B,
    #[doc(hidden)]
    _C,
}

struct T(pub i32, pub i32, ());
```

Use instead:

```rust
#[non_exhaustive]
struct S {
    pub a: i32,
    pub b: i32,
}

#[non_exhaustive]
enum E {
    A,
    B,
}

#[non_exhaustive]
struct T(pub i32, pub i32);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_non_exhaustive.rs#L16

## manual_ok_or

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.49.0

### What it does

Finds patterns that reimplement `Option::ok_or`.

### Why is this bad?

Concise code helps focusing on behavior instead of boilerplate.

### Examples

```rust
let foo: Option<i32> = None;
foo.map_or(Err("error"), |v| Ok(v));
```

Use instead:

```rust
let foo: Option<i32> = None;
foo.ok_or("error");
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2052

## manual_pattern_char_comparison

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.81.0

### What it does

Checks for manual `char` comparison in string patterns

### Why is this bad?

This can be written more concisely using a `char` or an array of `char`.
This is more readable and more optimized when comparing to only one `char`.

### Example

```rust
"Hello World!".trim_end_matches(|c| c == '.' || c == ',' || c == '!' || c == '?');
```

Use instead:

```rust
"Hello World!".trim_end_matches(['.', ',', '!', '?']);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/string_patterns.rs#L20

## manual_range_contains

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.49.0

### What it does

Checks for expressions like `x >= 3 && x < 8` that could
be more readably expressed as `(3..8).contains(&x)`.

### Why is this bad?

`contains` expresses the intent better and has less
failure modes (such as fencepost errors or using `||` instead of `&&`).

### Example

```rust
// given
let x = 6;

assert!(x >= 3 && x < 8);
```

Use instead:

```rust
assert!((3..8).contains(&x));
```

### Limitations

Out-of-range checks on floating-point types, such as `q < 0.0 || q > 1.0`,
are not linted. For `NaN`, that expression is `false`, but
`!(0.0..=1.0).contains(&q)` is `true`, so the suggested rewrite would
change control flow.

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/ranges.rs#L22

## manual_repeat_n

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.86.0

### What it does

Checks for `repeat().take()` that can be replaced with `repeat_n()`.

### Why is this bad?

Using `repeat_n()` is more concise and clearer. Also, `repeat_n()` is sometimes faster than `repeat().take()` when the type of the element is non-trivial to clone because the original value can be reused for the last `.next()` call rather than always cloning.

### Example

```rust
let _ = std::iter::repeat(10).take(3);
```

Use instead:

```rust
let _ = std::iter::repeat_n(10, 3);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2106

## manual_rotate

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.81.0

### What it does

It detects manual bit rotations that could be rewritten using standard
functions `rotate_left` or `rotate_right`.

### Why is this bad?

Calling the function better conveys the intent.

### Known issues

Currently, the lint only catches shifts by constant amount.

### Example

```rust
let x = 12345678_u32;
let _ = (x >> 8) | (x << 24);
```

Use instead:

```rust
let x = 12345678_u32;
let _ = x.rotate_right(8);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_rotate.rs#L11

## manual_saturating_arithmetic

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.39.0

### What it does

Checks for `.checked_add/sub(x).unwrap_or(MAX/MIN)`.

### Why is this bad?

These can be written simply with `saturating_add/sub` methods.

### Example

```rust
let add = x.checked_add(y).unwrap_or(u32::MAX);
let sub = x.checked_sub(y).unwrap_or(u32::MIN);
```

can be written using dedicated methods for saturating addition/subtraction as:

```rust
let add = x.saturating_add(y);
let sub = x.saturating_sub(y);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2129

## manual_slice_fill

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.86.0

### What it does

Checks for manually filling a slice with a value.

### Why is this bad?

Using the `fill` method is more idiomatic and concise.

### Example

```rust
let mut some_slice = [1, 2, 3, 4, 5];
for i in 0..some_slice.len() {
    some_slice[i] = 0;
}
```

Use instead:

```rust
let mut some_slice = [1, 2, 3, 4, 5];
some_slice.fill(0);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L426

## manual_while_let_some

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.71.0

### What it does

Looks for loops that check for emptiness of a `Vec` in the condition and pop an element
in the body as a separate operation.

### Why is this bad?

Such loops can be written in a more idiomatic way by using a while-let loop and directly
pattern matching on the return value of `Vec::pop()`.

### Example

```rust
let mut numbers = vec![1, 2, 3, 4, 5];
while !numbers.is_empty() {
    let number = numbers.pop().unwrap();
    // use `number`
}
```

Use instead:

```rust
let mut numbers = vec![1, 2, 3, 4, 5];
while let Some(number) = numbers.pop() {
    // use `number`
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L451

## map_clone

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `map(|x| x.clone())` or
dereferencing closures for `Copy` types, on `Iterator` or `Option`,
and suggests `cloned()` or `copied()` instead

### Why is this bad?

Readability, this can be written more concisely

### Example

```rust
let x = vec![42, 43];
let y = x.iter();
let z = y.map(|i| *i);
```

The correct use would be:

```rust
let x = vec![42, 43];
let y = x.iter();
let z = y.cloned();
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2270

## map_collect_result_unit

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.49.0

### What it does

Checks for usage of `_.map(_).collect::<Result<(), _>()`.

### Why is this bad?

Using `try_for_each` instead is more readable and idiomatic.

### Example

```rust
(0..3).map(|t| Err(t)).collect::<Result<(), _>>();
```

Use instead:

```rust
(0..3).try_for_each(|t| Err(t));
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2299

## match_like_matches_macro

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.47.0

### What it does

Checks for `match`  or `if let` expressions producing a
`bool` that could be written using `matches!`

### Why is this bad?

Readability and needless complexity.

### Known problems

This lint falsely triggers, if there are arms with
`cfg` attributes that remove an arm evaluating to `false`.

### Example

```rust
let x = Some(5);

let a = match x {
    Some(0) => true,
    _ => false,
};

let a = if let Some(0) = x {
    true
} else {
    false
};
```

Use instead:

```rust
let x = Some(5);
let a = matches!(x, Some(0));
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L327

## match_overlapping_arm

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for overlapping match arms.

### Why is this bad?

It is likely to be an error and if not, makes the code
less obvious.

### Example

```rust
let x = 5;
match x {
    1..=10 => println!("1 ... 10"),
    5..=15 => println!("5 ... 15"),
    _ => (),
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L366

## match_ref_pats

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for matches where all arms match a reference,
suggesting to remove the reference and deref the matched expression
instead. It also checks for `if let &foo = bar` blocks.

### Why is this bad?

It just makes the code less readable. That reference
destructuring adds nothing to the code.

### Example

```rust
match x {
    &A(ref y) => foo(y),
    &B => bar(),
    _ => frob(&x),
}
```

Use instead:

```rust
match *x {
    A(ref y) => foo(y),
    B => bar(),
    _ => frob(x),
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L389

## match_result_ok

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.57.0

### What it does

Checks for unnecessary `ok()` in `while let`.

### Why is this bad?

Calling `ok()` in `while let` is unnecessary, instead match
on `Ok(pat)`

### Example

```rust
while let Some(value) = iter.next().ok() {
    vec.push(value)
}

if let Some(value) = iter.next().ok() {
    vec.push(value)
}
```

Use instead:

```rust
while let Ok(value) = iter.next() {
    vec.push(value)
}

if let Ok(value) = iter.next() {
       vec.push(value)
}
```

### Past names

- if_let_some_result

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/match_result_ok.rs#L9

## mem_replace_option_with_none

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.31.0

### What it does

Checks for `mem::replace()` on an `Option` with
`None`.

### Why is this bad?

`Option` already has the method `take()` for
taking its current value (Some(..) or None) and replacing it with
`None`.

### Example

```rust
use std::mem;

let mut an_option = Some(0);
let replaced = mem::replace(&mut an_option, None);
```

Is better expressed with:

```rust
let mut an_option = Some(0);
let taken = an_option.take();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/mem_replace.rs#L16

## mem_replace_option_with_some

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.87.0

### What it does

Checks for `mem::replace()` on an `Option` with `Some(…)`.

### Why is this bad?

`Option` already has the method `replace()` for
taking its current value (Some(…) or None) and replacing it with
`Some(…)`.

### Example

```rust
let mut an_option = Some(0);
let replaced = std::mem::replace(&mut an_option, Some(1));
```

Is better expressed with:

```rust
let mut an_option = Some(0);
let taken = an_option.replace(1);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/mem_replace.rs#L44

## mem_replace_with_default

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.42.0

### What it does

Checks for `std::mem::replace` on a value of type
`T` with `T::default()`.

### Why is this bad?

`std::mem` module already has the method `take` to
take the current value and replace it with the default value of that type.

### Example

```rust
let mut text = String::from("foo");
let replaced = std::mem::replace(&mut text, String::default());
```

Is better expressed with:

```rust
let mut text = String::from("foo");
let taken = std::mem::take(&mut text);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/mem_replace.rs#L69

## missing_enforced_import_renames

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.55.0

### What it does

Checks for imports that do not rename the item as specified
in the `enforced-import-renames` config option.

Note: Even though this lint is warn-by-default, it will only trigger if
import renames are defined in the `clippy.toml` file.

### Why is this bad?

Consistency is important; if a project has defined import renames, then they should be
followed. More practically, some item names are too vague outside of their defining scope,
in which case this can enforce a more meaningful naming.

### Example

An example clippy.toml configuration:

```rust
enforced-import-renames = [
    { path = "serde_json::Value", rename = "JsonValue" },
]
```

```rust
use serde_json::Value;
```

Use instead:

```rust
use serde_json::Value as JsonValue;
```

### Configuration

- 

`enforced-import-renames`:  The list of imports to always rename, a fully qualified path followed by the rename.

(default: `[]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/missing_enforced_import_rename.rs#L13

## missing_safety_doc

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.39.0

### What it does

Checks for the doc comments of publicly visible
unsafe functions and warns if there is no `# Safety` section.

### Why is this bad?

Unsafe functions should document their safety
preconditions, so that users can be sure they are using them safely.

### Examples

```rust
/// This function should really be documented
pub unsafe fn start_apocalypse(u: &mut Universe) {
    unimplemented!();
}
```

At least write a line about safety:

```rust
/// # Safety
///
/// This function should not be called before the horsemen are ready.
pub unsafe fn start_apocalypse(u: &mut Universe) {
    unimplemented!();
}
```

### Notes

- This lint doesn’t trigger for functions attributed with `#[target_feature(enable = "...")]`,
even if your MSRV is lower than 1.86, where these functions would be unconditionally unsafe.

### Configuration

- 

`check-private-items`:  Whether to also run the listed lints on private items.

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L499

## mixed_attributes_style

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.78.0

### What it does

Checks for items that have the same kind of attributes with mixed styles (inner/outer).

### Why is this bad?

Having both style of said attributes makes it more complicated to read code.

### Known problems

This lint currently has false-negatives when mixing same attributes
but they have different path symbols, for example:

```rust
#[custom_attribute]
pub fn foo() {
    #![my_crate::custom_attribute]
}
```

### Example

```rust
#[cfg(linux)]
pub fn foo() {
    #![cfg(windows)]
}
```

Use instead:

```rust
#[cfg(linux)]
#[cfg(windows)]
pub fn foo() {
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/attrs/mod.rs#L346

## mixed_case_hex_literals

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Warns on hexadecimal literals with mixed-case letter
digits.

### Why is this bad?

It looks confusing.

### Example

```rust
0x1a9BAcD
```

Use instead:

```rust
0x1A9BACD
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/misc_early/mod.rs#L38

## module_inception

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for modules that have the same name as their
parent module

### Why is this bad?

A typical beginner mistake is to have `mod foo;` and
again `mod foo { .. }` in `foo.rs`.
The expectation is that items inside the inner `mod foo { .. }` are then
available
through `foo::x`, but they are only available through
`foo::foo::x`.
If this is done on purpose, it would be better to choose a more
representative module name.

### Example

```rust
// lib.rs
mod foo;
// foo.rs
mod foo {
    ...
}
```

### Configuration

- 

`allow-private-module-inception`:  Whether to allow module inception if it’s not public.

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/item_name_repetitions.rs#L47

## multiple_bound_locations

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.78.0

### What it does

Check if a generic is defined both in the bound predicate and in the `where` clause.

### Why is this bad?

It can be confusing for developers when seeing bounds for a generic in multiple places.

### Example

```rust
fn ty<F: std::fmt::Debug>(a: F)
where
    F: Sized,
{}
```

Use instead:

```rust
fn ty<F>(a: F)
where
    F: Sized + std::fmt::Debug,
{}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/multiple_bound_locations.rs#L10

## must_use_unit

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.40.0

### What it does

Checks for a `#[must_use]` attribute on
unit-returning functions and methods.

### Why is this bad?

Unit values are useless. The attribute is likely
a remnant of a refactoring that removed the return type.

### Examples

```rust
#[must_use]
fn useless() { }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/functions/mod.rs#L176

## mut_mutex_lock

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.49.0

### What it does

Checks for `&mut Mutex::lock` calls

### Why is this bad?

`Mutex::lock` is less efficient than
calling `Mutex::get_mut`. In addition you also have a statically
guarantee that the mutex isn’t locked, instead of just a runtime
guarantee.

### Example

```rust
use std::sync::{Arc, Mutex};

let mut value_rc = Arc::new(Mutex::new(42_u8));
let value_mutex = Arc::get_mut(&mut value_rc).unwrap();

let mut value = value_mutex.lock().unwrap();
*value += 1;
```

Use instead:

```rust
use std::sync::{Arc, Mutex};

let mut value_rc = Arc::new(Mutex::new(42_u8));
let value_mutex = Arc::get_mut(&mut value_rc).unwrap();

let value = value_mutex.get_mut().unwrap();
*value += 1;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2577

## needless_borrow

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for address of operations (`&`) that are going to
be dereferenced immediately by the compiler.

### Why is this bad?

Suggests that the receiver of the expression borrows
the expression.

### Known problems

The lint cannot tell when the implementation of a trait
for `&T` and `T` do different things. Removing a borrow
in such a case can change the semantics of the code.

### Example

```rust
fn fun(_a: &i32) {}

let x: &i32 = &&&&&&5;
fun(&x);
```

Use instead:

```rust
let x: &i32 = &5;
fun(x);
```

### Past names

- ref_in_deref

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/dereference.rs#L84

## needless_borrows_for_generic_args

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.74.0

### What it does

Checks for borrow operations (`&`) that are used as a generic argument to a
function when the borrowed value could be used.

### Why is this bad?

Suggests that the receiver of the expression borrows
the expression.

### Known problems

The lint cannot tell when the implementation of a trait
for `&T` and `T` do different things. Removing a borrow
in such a case can change the semantics of the code.

### Example

```rust
fn f(_: impl AsRef<str>) {}

let x = "foo";
f(&x);
```

Use instead:

```rust
fn f(_: impl AsRef<str>) {}

let x = "foo";
f(x);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/needless_borrows_for_generic_args.rs#L24

## needless_doctest_main

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.40.0

### What it does

Checks for `fn main() { .. }` in doctests

### Why is this bad?

The test can be shorter (and likely more readable)
if the `fn main()` is left implicit.

### Examples

```rust
/// An example of a doctest with a `main()` function
///
/// # Examples
///
/// ```
/// fn main() {
///     // this needs not be in an `fn`
/// }
/// ```
fn needless_main() {
    unimplemented!();
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L539

## needless_else

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.72.0

### What it does

Checks for empty `else` branches.

### Why is this bad?

An empty else branch does nothing and can be removed.

### Example

```rust
if check() {
    println!("Check successful!");
} else {
}
```

Use instead:

```rust
if check() {
    println!("Check successful!");
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/needless_else.rs#L7

## needless_late_init

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.59.0

### What it does

Checks for late initializations that can be replaced by a `let` statement
with an initializer.

### Why is this bad?

Assigning in the `let` statement is less repetitive.

### Example

```rust
let a;
a = 1;

let b;
match 3 {
    0 => b = "zero",
    1 => b = "one",
    _ => b = "many",
}

let c;
if true {
    c = 1;
} else {
    c = -1;
}
```

Use instead:

```rust
let a = 1;

let b = match 3 {
    0 => "zero",
    1 => "one",
    _ => "many",
};

let c = if true {
    1
} else {
    -1
};
```

### Configuration

- `check-grouped-late-init`:  Whether to check for grouped late initializations from multiple `let` statements.

#### Example

```rust
let a;
let b;
if true {
    a = 1;
    b = 2;
} else {
    a = 3;
    b = 4;
}
```

Use instead:

```rust
let (a, b) = if true {
    (1, 2)
} else {
    (3, 4)
};
```

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/needless_late_init.rs#L17

## needless_parens_on_range_literals

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.63.0

### What it does

The lint checks for parenthesis on literals in range statements that are
superfluous.

### Why is this bad?

Having superfluous parenthesis makes the code less readable
overhead when reading.

### Example

```rust
for i in (0)..10 {
  println!("{i}");
}
```

Use instead:

```rust
for i in 0..10 {
  println!("{i}");
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/needless_parens_on_range_literals.rs#L10

## needless_pub_self

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.72.0

### What it does

Checks for usage of `pub(self)` and `pub(in self)`.

### Why is this bad?

It’s unnecessary, omitting the `pub` entirely will give the same results.

### Example

```rust
pub(self) type OptBox<T> = Option<Box<T>>;
```

Use instead:

```rust
type OptBox<T> = Option<Box<T>>;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/visibility.rs#L9

## needless_range_loop

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for looping over the range of `0..len` of some
collection just to get the values by index.

### Why is this bad?

Just iterating the collection itself makes the intent
more clear and is probably faster because it eliminates
the bounds check that is done when indexing.

### Example

```rust
let vec = vec!['a', 'b', 'c'];
for i in 0..vec.len() {
    println!("{}", vec[i]);
}
```

Use instead:

```rust
let vec = vec!['a', 'b', 'c'];
for i in vec {
    println!("{}", i);
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L553

## needless_return

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for return statements at the end of a block.

### Why is this bad?

Removing the `return` and semicolon will make the code
more rusty.

### Example

```rust
fn foo(x: usize) -> usize {
    return x;
}
```

simplify to

```rust
fn foo(x: usize) -> usize {
    x
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/returns/mod.rs#L45

## needless_return_with_question_mark

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.73.0

### What it does

Checks for return statements on `Err` paired with the `?` operator.

### Why is this bad?

The `return` is unnecessary.

Returns may be used to add attributes to the return expression. Return
statements with attributes are therefore be accepted by this lint.

### Example

```rust
fn foo(x: usize) -> Result<(), Box<dyn Error>> {
    if x == 0 {
        return Err(...)?;
    }
    Ok(())
}
```

simplify to

```rust
fn foo(x: usize) -> Result<(), Box<dyn Error>> {
    if x == 0 {
        Err(...)?;
    }
    Ok(())
}
```

if paired with `try_err`, use instead:

```rust
fn foo(x: usize) -> Result<(), Box<dyn Error>> {
    if x == 0 {
        return Err(...);
    }
    Ok(())
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/returns/mod.rs#L74

## neg_multiply

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for multiplication by -1 as a form of negation.

### Why is this bad?

It’s more readable to just negate.

### Example

```rust
let a = x * -1;
```

Use instead:

```rust
let a = -x;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/neg_multiply.rs#L11

## new_ret_no_self

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for `new` not returning a type that contains `Self`.

### Why is this bad?

As a convention, `new` methods are used to make a new
instance of a type.

### Example

In an impl block:

```rust
impl Foo {
    fn new() -> NotAFoo {
    }
}
```

```rust
struct Bar(Foo);
impl Foo {
    // Bad. The type name must contain `Self`
    fn new() -> Bar {
    }
}
```

```rust
impl Foo {
    // Good. Return type contains `Self`
    fn new() -> Result<Foo, FooError> {
    }
}
```

Or in a trait definition:

```rust
pub trait Trait {
    // Bad. The type name must contain `Self`
    fn new();
}
```

```rust
pub trait Trait {
    // Good. Return type contains `Self`
    fn new() -> Self;
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2787

## new_without_default

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for public types with a `pub fn new() -> Self` method and no
implementation of
`Default`.

### Why is this bad?

The user might expect to be able to use
`Default` as the
type can be constructed without arguments.

### Example

```rust
pub struct Foo(Bar);

impl Foo {
    pub fn new() -> Self {
        Foo(Bar::new())
    }
}
```

To fix the lint, add a `Default` implementation that delegates to `new`:

```rust
pub struct Foo(Bar);

impl Default for Foo {
    fn default() -> Self {
        Foo::new()
    }
}
```

### Past names

- new_without_default_derive

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/new_without_default.rs#L13

## non_minimal_cfg

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.71.0

### What it does

Checks for `any` and `all` combinators in `cfg` with only one condition.

### Why is this bad?

If there is only one condition, no need to wrap it into `any` or `all` combinators.

### Example

```rust
#[cfg(any(unix))]
pub struct Bar;
```

Use instead:

```rust
#[cfg(unix)]
pub struct Bar;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/attrs/mod.rs#L383

## nonstandard_macro_braces

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.55.0

### What it does

Checks that common macros are used with consistent bracing.

### Why is this bad?

Having non-conventional braces on well-stablished macros can be confusing
when debugging, and they bring incosistencies with the rest of the ecosystem.

### Example

```rust
vec!{1, 2, 3};
```

Use instead:

```rust
vec![1, 2, 3];
```

### Configuration

- `standard-macro-braces`:  Enforce the named macros always use the braces specified.

A `MacroMatcher` can be added like so `{ name = "macro_name", brace = "(" }`. If the macro
could be used with a full path two `MacroMatcher`s have to be added one with the full path
`crate_name::macro_name` and one with just the macro name.

(default: `[]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/nonstandard_macro_braces.rs#L16

## obfuscated_if_else

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.64.0

### What it does

Checks for unnecessary method chains that can be simplified into `if .. else ..`.

### Why is this bad?

This can be written more clearly with `if .. else ..`

### Limitations

This lint currently only looks for usages of
`.{then, then_some}(..).{unwrap_or, unwrap_or_else, unwrap_or_default}(..)`, but will be expanded
to account for similar patterns.

### Example

```rust
let x = true;
x.then_some("a").unwrap_or("b");
```

Use instead:

```rust
let x = true;
if x { "a" } else { "b" };
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2888

## ok_expect

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `ok().expect(..)`.

Note: This lint only triggers for code marked compatible
with versions of the compiler older than Rust 1.82.0.

### Why is this bad?

Because you usually call `expect()` on the `Result`
directly to get a better error message.

### Example

```rust
x.ok().expect("why did I do this again?");
```

Use instead:

```rust
x.expect("why did I do this again?");
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2917

## op_ref

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for arguments to `==` which have their address
taken to satisfy a bound
and suggests to dereference the other argument instead

### Why is this bad?

It is more idiomatic to dereference the other argument.

### Example

```rust
&x == y
```

Use instead:

```rust
x == *y
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L917

## option_map_or_none

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `_.map_or(None, _)`.

### Why is this bad?

Readability, this can be written more concisely as
`_.and_then(_)`.

### Known problems

The order of the arguments is not in execution order.

### Example

```rust
opt.map_or(None, |a| Some(a + 1));
```

Use instead:

```rust
opt.and_then(|a| Some(a + 1));
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3019

## owned_cow

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.87.0

### What it does

Detects needlessly owned `Cow` types.

### Why is this bad?

The borrowed types are usually more flexible, in that e.g. a
`Cow<'_, str>` can accept both `&str` and `String` while
`Cow<'_, String>` can only accept `&String` and `String`. In
particular, `&str` is more general, because it allows for string
literals while `&String` can only be borrowed from a heap-owned
`String`).

### Known Problems

The lint does not check for usage of the type. There may be external
interfaces that require the use of an owned type.

At least the `CString` type also has a different API than `CStr`: The
former has an `as_bytes` method which the latter calls `to_bytes`.
There is no guarantee that other types won’t gain additional methods
leading to a similar mismatch.

In addition, the lint only checks for the known problematic types
`String`, `Vec<_>`, `CString`, `OsString` and `PathBuf`. Custom types
that implement `ToOwned` will not be detected.

### Example

```rust
let wrogn: std::borrow::Cow<'_, Vec<u8>>;
```

Use instead:

```rust
let right: std::borrow::Cow<'_, [u8]>;
```

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/types/mod.rs#L159

## partialeq_to_none

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.65.0

### What it does

Checks for binary comparisons to a literal `Option::None`.

### Why is this bad?

A programmer checking if some `foo` is `None` via a comparison `foo == None`
is usually inspired from other programming languages (e.g. `foo is None`
in Python).
Checking if a value of type `Option<T>` is (not) equal to `None` in that
way relies on `T: PartialEq` to do the comparison, which is unneeded.

### Example

```rust
fn foo(f: Option<u32>) -> &'static str {
    if f != None { "yay" } else { "nay" }
}
```

Use instead:

```rust
fn foo(f: Option<u32>) -> &'static str {
    if f.is_some() { "yay" } else { "nay" }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/partialeq_to_none.rs#L9

## print_literal

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

This lint warns about the use of literals as `print!`/`println!` args.

### Why is this bad?

Using literals as `println!` args is inefficient and unnecessary
(i.e., just put the literal in the format string)

### Example

```rust
println!("{}", "foo");
```

use the literal without formatting:

```rust
println!("foo");
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/write/mod.rs#L13

## print_with_newline

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

This lint warns when you use `print!()` with a format
string that ends in a newline.

### Why is this bad?

You should use `println!()` instead, which appends the
newline.

### Example

```rust
print!("Hello {}!\n", name);
```

use println!() instead

```rust
println!("Hello {}!", name);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/write/mod.rs#L81

## println_empty_string

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

This lint warns when you use `println!("")` to
print a newline.

### Why is this bad?

You should use `println!()`, which is simpler.

### Example

```rust
println!("");
```

Use instead:

```rust
println!();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/write/mod.rs#L106

## ptr_arg

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

This lint checks for function arguments of type `&String`, `&Vec`,
`&PathBuf`, and `Cow<_>`. It will also suggest you replace `.clone()` calls
with the appropriate `.to_owned()`/`to_string()` calls.

### Why is this bad?

Requiring the argument to be of the specific type
makes the function less useful for no benefit; slices in the form of `&[T]`
or `&str` usually suffice and can be obtained from other types, too.

### Known problems

There may be `fn(&Vec)`-typed references pointing to your function.
If you have them, you will get a compiler error after applying this lint’s
suggestions. You then have the choice to undo your changes or change the
type of the reference.

Note that if the function is part of your public interface, there may be
other crates referencing it, of which you may not be aware. Carefully
deprecate the function before applying the lint suggestions in this case.

### Example

```rust
fn foo(&Vec<u32>) { .. }
```

Use instead:

```rust
fn foo(&[u32]) { .. }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/ptr/mod.rs#L72

## ptr_eq

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.49.0

### What it does

Use `std::ptr::eq` when applicable

### Why is this bad?

`ptr::eq` can be used to compare `&T` references
(which coerce to `*const T` implicitly) by their address rather than
comparing the values they point to.

### Example

```rust
let a = &[1, 2, 3];
let b = &[1, 2, 3];

assert!(a as *const _ as usize == b as *const _ as usize);
```

Use instead:

```rust
let a = &[1, 2, 3];
let b = &[1, 2, 3];

assert!(std::ptr::eq(a, b));
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/ptr/mod.rs#L108

## question_mark

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for expressions that could be replaced by the `?` operator.

### Why is this bad?

Using the `?` operator is shorter and more idiomatic.

### Example

```rust
if option.is_none() {
    return None;
}
```

Could be written:

```rust
option?;
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/question_mark.rs#L29

## redundant_closure

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for closures which just call another function where
the function can be called directly. `unsafe` functions, calls where types
get adjusted or where the callee is marked `#[track_caller]` are ignored.

### Why is this bad?

Needlessly creating a closure adds code for no benefit
and gives the optimizer more work.

### Example

```rust
xs.map(|x| foo(x))
```

Use instead:

```rust
// where `foo(_)` is a plain function that takes the exact argument type of `x`.
xs.map(foo)
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/eta_reduction.rs#L20

## redundant_field_names

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for fields in struct literals where shorthands
could be used.

### Why is this bad?

If the field and variable names are the same,
the field name is redundant.

### Example

```rust
let bar: u8 = 123;

struct Foo {
    bar: u8,
}

let foo = Foo { bar: bar };
```

the last line can be simplified to

```rust
let foo = Foo { bar };
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/redundant_field_names.rs#L8

## redundant_pattern

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for patterns in the form `name @ _`.

### Why is this bad?

It’s almost always more readable to just use direct
bindings.

### Example

```rust
match v {
    Some(x) => (),
    y @ _ => (),
}
```

Use instead:

```rust
match v {
    Some(x) => (),
    y => (),
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/misc_early/mod.rs#L95

## redundant_pattern_matching

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.31.0

### What it does

Lint for redundant pattern matching over `Result`, `Option`,
`std::task::Poll`, `std::net::IpAddr` or `bool`s

### Why is this bad?

It’s more concise and clear to just use the proper
utility function or using the condition directly

### Known problems

For suggestions involving bindings in patterns, this will change the drop order for the matched type.
Both `if let` and `while let` will drop the value at the end of the block, both `if` and `while` will drop the
value before entering the block. For most types this change will not matter, but for a few
types this will not be an acceptable change (e.g. locks). See the
reference for more about
drop order.

### Example

```rust
if let Ok(_) = Ok::<i32, i32>(42) {}
if let Err(_) = Err::<i32, i32>(42) {}
if let None = None::<()> {}
if let Some(_) = Some(42) {}
if let Poll::Pending = Poll::Pending::<()> {}
if let Poll::Ready(_) = Poll::Ready(42) {}
if let IpAddr::V4(_) = IpAddr::V4(Ipv4Addr::LOCALHOST) {}
if let IpAddr::V6(_) = IpAddr::V6(Ipv6Addr::LOCALHOST) {}
match Ok::<i32, i32>(42) {
    Ok(_) => true,
    Err(_) => false,
};

let cond = true;
if let true = cond {}
matches!(cond, true);
```

The more idiomatic use would be:

```rust
if Ok::<i32, i32>(42).is_ok() {}
if Err::<i32, i32>(42).is_err() {}
if None::<()>.is_none() {}
if Some(42).is_some() {}
if Poll::Pending::<()>.is_pending() {}
if Poll::Ready(42).is_ready() {}
if IpAddr::V4(Ipv4Addr::LOCALHOST).is_ipv4() {}
if IpAddr::V6(Ipv6Addr::LOCALHOST).is_ipv6() {}
Ok::<i32, i32>(42).is_ok();

let cond = true;
if cond {}
cond;
```

### Past names

- if_let_redundant_pattern_matching

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L664

## redundant_static_lifetimes

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.37.0

### What it does

Checks for constants and statics with an explicit `'static` lifetime.

### Why is this bad?

Adding `'static` to every reference can create very
complicated types.

### Example

```rust
const FOO: &'static [(&'static str, &'static str, fn(&Bar) -> bool)] =
&[...]
static FOO: &'static [(&'static str, &'static str, fn(&Bar) -> bool)] =
&[...]
```

This code can be rewritten as

```rust
 const FOO: &[(&str, &str, fn(&Bar) -> bool)] = &[...]
 static FOO: &[(&str, &str, fn(&Bar) -> bool)] = &[...]
```

### Past names

- const_static_lifetime

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/redundant_static_lifetimes.rs#L10

## result_map_or_into_option

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.44.0

### What it does

Checks for usage of `_.map_or(None, Some)`.

### Why is this bad?

Readability, this can be written more concisely as
`_.ok()`.

### Example

```rust
assert_eq!(Some(1), r.map_or(None, Some));
```

Use instead:

```rust
assert_eq!(Some(1), r.ok());
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3471

## result_unit_err

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.49.0

### What it does

Checks for public functions that return a `Result`
with an `Err` type of `()`. It suggests using a custom type that
implements `std::error::Error`.

### Why is this bad?

Unit does not implement `Error` and carries no
further information about what went wrong.

### Known problems

Of course, this lint assumes that `Result` is used
for a fallible operation (which is after all the intended use). However
code may opt to (mis)use it as a basic two-variant-enum. In that case,
the suggestion is misguided, and the code should use a custom enum
instead.

### Examples

```rust
pub fn read_u8() -> Result<u8, ()> { Err(()) }
```

should become

```rust
use std::fmt;

#[derive(Debug)]
pub struct EndOfStream;

impl fmt::Display for EndOfStream {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "End of Stream")
    }
}

impl std::error::Error for EndOfStream { }

pub fn read_u8() -> Result<u8, EndOfStream> { Err(EndOfStream) }
```

Note that there are crates that simplify creating the error type, e.g.
`thiserror`.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/functions/mod.rs#L409

## same_item_push

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.47.0

### What it does

Checks whether a for loop is being used to push a constant
value into a Vec.

### Why is this bad?

This kind of operation can be expressed more succinctly with
`vec![item; SIZE]` or `vec.resize(NEW_SIZE, item)` and using these alternatives may also
have better performance.

### Example

```rust
let item1 = 2;
let item2 = 3;
let mut vec: Vec<u8> = Vec::new();
for _ in 0..20 {
    vec.push(item1);
}
for _ in 0..30 {
    vec.push(item2);
}
```

Use instead:

```rust
let item1 = 2;
let item2 = 3;
let mut vec: Vec<u8> = vec![item1; 20];
vec.resize(20 + 30, item2);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L606

## self_named_constructors

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.55.0

### What it does

Warns when constructors have the same name as their types.

### Why is this bad?

Repeating the name of the type is redundant.

### Example

```rust
struct Foo {}

impl Foo {
    pub fn foo() -> Foo {
        Foo {}
    }
}
```

Use instead:

```rust
struct Foo {}

impl Foo {
    pub fn new() -> Foo {
        Foo {}
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/self_named_constructors.rs#L7

## should_implement_trait

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for methods that should live in a trait
implementation of a `std` trait (see llogiq’s blog
post for further
information) instead of an inherent implementation.

### Why is this bad?

Implementing the traits improve ergonomics for users of
the code, often with very little cost. Also people seeing a `mul(...)`
method
may expect `*` to work equally, so you should have good reason to disappoint
them.

### Example

```rust
struct X;
impl X {
    fn add(&self, other: &X) -> X {
        // ..
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3640

## single_char_add_str

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.49.0

### What it does

Warns when using `push_str`/`insert_str` with a single-character string literal
where `push`/`insert` with a `char` would work fine.

### Why is this bad?

It’s less clear that we are pushing a single character.

### Example

```rust
string.insert_str(0, "R");
string.push_str("R");
```

Use instead:

```rust
string.insert(0, 'R');
string.push('R');
```

### Past names

- single_char_push_str

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3670

## single_component_path_imports

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.43.0

### What it does

Checking for imports with single component use path.

### Why is this bad?

Import with single component use path such as `use cratename;`
is not necessary, and thus should be removed.

### Example

```rust
use regex;

fn main() {
    regex::Regex::new(r"^\d{4}-\d{2}-\d{2}$").unwrap();
}
```

Better as

```rust
fn main() {
    regex::Regex::new(r"^\d{4}-\d{2}-\d{2}$").unwrap();
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/single_component_path_imports.rs#L11

## single_match

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for matches with a single arm where an `if let`
will usually suffice.

This intentionally does not lint if there are comments
inside of the other arm, so as to allow the user to document
why having another explicit pattern with an empty body is necessary,
or because the comments need to be preserved for other reasons.

### Why is this bad?

Just readability – `if let` nests less than a `match`.

### Example

```rust
match x {
    Some(ref foo) => bar(foo),
    _ => (),
}
```

Use instead:

```rust
if let Some(ref foo) = x {
    bar(foo);
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L828

## string_extend_chars

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for the use of `.extend(s.chars())` where s is a
`&str` or `String`.

### Why is this bad?

`.push_str(s)` is clearer

### Example

```rust
let abc = "abc";
let def = String::from("def");
let mut s = String::new();
s.extend(abc.chars());
s.extend(def.chars());
```

The correct use would be:

```rust
let abc = "abc";
let def = String::from("def");
let mut s = String::new();
s.push_str(abc);
s.push_str(&def);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3840

## tabs_in_doc_comments

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.41.0

### What it does

Checks doc comments for usage of tab characters.

### Why is this bad?

The rust style-guide promotes spaces instead of tabs for indentation.
To keep a consistent view on the source, also doc comments should not have tabs.
Also, explaining ascii-diagrams containing tabs can get displayed incorrectly when the
display settings of the author and reader differ.

### Example

```rust
///
/// Struct to hold two strings:
/// 	- first		one
/// 	- second	one
pub struct DoubleString {
   ///
   /// 	- First String:
   /// 		- needs to be inside here
   first_string: String,
   ///
   /// 	- Second String:
   /// 		- needs to be inside here
   second_string: String,
}
```

Will be converted to:

```rust
///
/// Struct to hold two strings:
///     - first        one
///     - second    one
pub struct DoubleString {
   ///
   ///     - First String:
   ///         - needs to be inside here
   first_string: String,
   ///
   ///     - Second String:
   ///         - needs to be inside here
   second_string: String,
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/tabs_in_doc_comments.rs#L9

## to_digit_is_some

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.41.0

### What it does

Checks for `.to_digit(..).is_some()` on `char`s.

### Why is this bad?

This is a convoluted way of checking if a `char` is a digit. It’s
more straight forward to use the dedicated `is_digit` method.

### Example

```rust
let is_digit = c.to_digit(radix).is_some();
```

can be written as:

```rust
let is_digit = c.is_digit(radix);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/to_digit_is_some.rs#L11

## to_string_trait_impl

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.78.0

### What it does

Checks for direct implementations of `ToString`.

### Why is this bad?

This trait is automatically implemented for any type which implements the `Display` trait.
As such, `ToString` shouldn’t be implemented directly: `Display` should be implemented instead,
and you get the `ToString` implementation for free.

### Example

```rust
struct Point {
  x: usize,
  y: usize,
}

impl ToString for Point {
  fn to_string(&self) -> String {
    format!("({}, {})", self.x, self.y)
  }
}
```

Use instead:

```rust
struct Point {
  x: usize,
  y: usize,
}

impl std::fmt::Display for Point {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    write!(f, "({}, {})", self.x, self.y)
  }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/to_string_trait_impl.rs#L6

## toplevel_ref_arg

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for function arguments and let bindings denoted as
`ref`.

### Why is this bad?

The `ref` declaration makes the function take an owned
value, but turns the argument into a reference (which means that the value
is destroyed when exiting the function). This adds not much value: either
take a reference type, or take an owned value and create references in the
body.

For let bindings, `let x = &foo;` is preferred over `let ref x = foo`. The
type of `x` is more obvious with the former.

### Known problems

If the argument is dereferenced within the function,
removing the `ref` will lead to errors. This can be fixed by removing the
dereferences, e.g., changing `*x` to `x` within the function.

### Example

```rust
fn foo(ref _x: u8) {}
```

Use instead:

```rust
fn foo(_x: &u8) {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/toplevel_ref_arg.rs#L14

## trim_split_whitespace

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.62.0

### What it does

Warns about calling `str::trim` (or variants) before `str::split_whitespace`.

### Why is this bad?

`split_whitespace` already ignores leading and trailing whitespace.

### Example

```rust
" A B C ".trim().split_whitespace();
```

Use instead:

```rust
" A B C ".split_whitespace();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4129

## try_from_instead_of_from_str

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.100.0

### What it does

Checks for implementations of `TryFrom<&str>` which could be implementations of `FromStr`.

### Why is this bad?

`FromStr` is the idiomatic trait for parsing a string and should be preferred over `TryFrom`
when doing so. Implementing `FromStr` allows the the use of `str::parse` to make the intent
of the conversion clearer at the conversion site.

### Known problems

It’s not always possible to convert a `TryFrom<&str>` implementation into a `FromStr` one.
For example:

```rust
// Cannot be converted into a `FromStr` impl because the `Error`
// associated type has a lifetime, which cannot be constrained in
// `FromStr`.
impl<'a> TryFrom<&'a str> for T {
    type Error = &'a str;

    fn try_from(_value: &str) -> Result<Self, Self::Error> {
        Ok(T)
    }
}
```

### Example

```rust
impl TryFrom<&str> for MyType {
    type Error = MyError;
    fn try_from(value: &str) -> Result<Self, Self::Error> {
    }
}
```

Use instead:

```rust
impl FromStr for MyType {
    type Err = MyError;
    fn from_str(value: &str) -> Result<Self, Self::Err> {
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/try_from_instead_of_from_str.rs#L15

## unnecessary_fallible_conversions

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.75.0

### What it does

Checks for calls to `TryInto::try_into` and `TryFrom::try_from` when their infallible counterparts
could be used.

### Why is this bad?

In those cases, the `TryInto` and `TryFrom` trait implementation is a blanket impl that forwards
to `Into` or `From`, which always succeeds.
The returned `Result<_, !>` requires error handling to get the contained value
even though the conversion can never fail.

### Example

```rust
let _: Result<i64, _> = 1i32.try_into();
let _: Result<i64, _> = <_>::try_from(1i32);
```

Use `from`/`into` instead:

```rust
let _: i64 = 1i32.into();
let _: i64 = <_>::from(1i32);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4314

## unnecessary_fold

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `fold` when a more succinct alternative exists.
Specifically, this checks for `fold`s which could be replaced by `any`, `all`,
`sum` or `product`, and for folds over an `Option`’s iterator which could be
replaced by `map_or`.

### Why is this bad?

Readability.

### Example

```rust
(0..3).fold(false, |acc, x| acc || x > 2);
opt.iter().fold(0, |acc, x| acc | x);
```

Use instead:

```rust
(0..3).any(|x| x > 2);
opt.as_ref().map_or(0, |x| 0 | x);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4429

## unnecessary_lazy_evaluations

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.48.0

### What it does

As the counterpart to `or_fun_call`, this lint looks for unnecessary
lazily evaluated closures on `Option` and `Result`.

This lint suggests changing the following functions, when eager evaluation results in
simpler code:

- `unwrap_or_else` to `unwrap_or`

- `and_then` to `and`

- `or_else` to `or`

- `get_or_insert_with` to `get_or_insert`

- `ok_or_else` to `ok_or`

- `map_or_else` to `map_or`

- `then` to `then_some` (for msrv >= 1.62.0)

### Why is this bad?

Using eager evaluation is shorter and simpler in some cases.

### Known problems

It is possible, but not recommended for `Deref` and `Index` to have
side effects. Eagerly evaluating them can change the semantics of the program.

### Example

```rust
let opt: Option<u32> = None;

opt.unwrap_or_else(|| 42);
```

Use instead:

```rust
let opt: Option<u32> = None;

opt.unwrap_or(42);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4519

## unnecessary_map_or

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.84.0

### What it does

Converts some constructs mapping an enum value for equality or variant checks.

### Why is this bad?

Calls such as `opt.map_or(false, |val| val == 5)` are needlessly long and cumbersome,
and can be reduced to, for example, `opt == Some(5)` assuming `opt` implements `PartialEq`.
Also, calls such as `opt.map_or(true, |val| val == 5)` can be reduced to
`opt.is_none_or(|val| val == 5)`.
Calls that map the two variants of a `Result` to opposite boolean constants can be
reduced to `is_ok()` or `is_err()`.
This lint offers readability and conciseness improvements.

### Example

```rust
pub fn a(x: Option<i32>, result: Result<i32, i32>) -> (bool, bool, bool) {
    (
        x.map_or(false, |n| n == 5),
        x.map_or(true, |n| n > 5),
        result.map_or_else(|_| false, |_| true),
    )
}
```

Use instead:

```rust
pub fn a(x: Option<i32>, result: Result<i32, i32>) -> (bool, bool, bool) {
    (
        x == Some(5),
        x.is_none_or(|n| n > 5),
        result.is_ok(),
    )
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4585

## unnecessary_mut_passed

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Detects passing a mutable reference to a function that only
requires an immutable reference.

### Why is this bad?

The mutable reference rules out all other references to
the value. Also the code misleads about the intent of the call site.

### Example

```rust
vec.push(&mut value);
```

Use instead:

```rust
vec.push(&value);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unnecessary_mut_passed.rs#L10

## unnecessary_owned_empty_strings

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.62.0

### What it does

Detects cases of owned empty strings being passed as an argument to a function expecting `&str`

### Why is this bad?

This results in longer and less readable code

### Example

```rust
vec!["1", "2", "3"].join(&String::new());
```

Use instead:

```rust
vec!["1", "2", "3"].join("");
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unnecessary_owned_empty_strings.rs#L11

## unneeded_struct_pattern

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.86.0

### What it does

Checks for struct patterns that match against unit variant.

### Why is this bad?

Struct pattern `{ }` or `{ .. }` is not needed for unit variant.

### Example

```rust
match Some(42) {
    Some(v) => v,
    None { .. } => 0,
};
// Or
match Some(42) {
    Some(v) => v,
    None { } => 0,
};
```

Use instead:

```rust
match Some(42) {
    Some(v) => v,
    None => 0,
};
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unneeded_struct_pattern.rs#L8

## unsafe_removed_from_name

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for imports that remove “unsafe” from an item’s
name.

### Why is this bad?

Renaming makes it less clear which traits and
structures are unsafe.

### Example

```rust
use std::cell::{UnsafeCell as TotallySafeCell};

extern crate crossbeam;
use crossbeam::{spawn_unsafe as spawn};
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unsafe_removed_from_name.rs#L7

## unused_enumerate_index

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.75.0

### What it does

Checks for uses of the `enumerate` method where the index is unused (`_`)

### Why is this bad?

The index from `.enumerate()` is immediately dropped.

### Example

```rust
let v = vec![1, 2, 3, 4];
for (_, x) in v.iter().enumerate() {
    println!("{x}");
}
```

Use instead:

```rust
let v = vec![1, 2, 3, 4];
for x in v.iter() {
    println!("{x}");
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L670

## unused_unit

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.31.0

### What it does

Checks for unit (`()`) expressions that can be removed.

### Why is this bad?

Such expressions add no value, but can make the code
less readable. Depending on formatting they can make a `break` or `return`
statement look like a function call.

### Example

```rust
fn return_unit() -> () {
    ()
}
```

is equivalent to

```rust
fn return_unit() {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unused_unit.rs#L16

## unusual_byte_groupings

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.49.0

### What it does

Warns if hexadecimal or binary literals are not grouped
by nibble or byte.

### Why is this bad?

Negatively impacts readability.

### Example

```rust
let x: u32 = 0xFFF_FFF;
let y: u8 = 0b01_011_101;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/literal_representation.rs#L128

## unwrap_or_default

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.56.0

### What it does

Checks for usages of the following functions with an argument that constructs a default value
(e.g., `Default::default` or `String::new`):

- `unwrap_or`

- `unwrap_or_else`

- `or_insert`

- `or_insert_with`

### Why is this bad?

Readability. Using `unwrap_or_default` in place of `unwrap_or`/`unwrap_or_else`, or `or_default`
in place of `or_insert`/`or_insert_with`, is simpler and more concise.

### Known problems

In some cases, the argument of `unwrap_or`, etc. is needed for type inference. The lint uses a
heuristic to try to identify such cases. However, the heuristic can produce false negatives.

### Examples

```rust
x.unwrap_or(Default::default());
map.entry(42).or_insert_with(String::new);
```

Use instead:

```rust
x.unwrap_or_default();
map.entry(42).or_default();
```

### Past names

- unwrap_or_else_default

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4792

## upper_case_acronyms

Grupo: `style` · Nível padrão: `warn` · Adicionado em: 1.51.0

### What it does

Checks for fully capitalized names and optionally names containing a capitalized acronym.

### Why is this bad?

In CamelCase, acronyms count as one word.
See naming conventions
for more.

By default, the lint only triggers on fully-capitalized names.
You can use the `upper-case-acronyms-aggressive: true` config option to enable linting
on all camel case names

### Known problems

When two acronyms are contiguous, the lint can’t tell where
the first acronym ends and the second starts, so it suggests to lowercase all of
the letters in the second acronym.

### Example

```rust
struct HTTPResponse;
```

Use instead:

```rust
struct HttpResponse;
```

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

- 

`upper-case-acronyms-aggressive`:  Enables verbose mode. Triggers if there is more than one uppercase char next to each other

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/upper_case_acronyms.rs#L9

## while_let_on_iterator

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for `while let` expressions on iterators.

### Why is this bad?

Readability. A simple `for` loop is shorter and conveys
the intent better.

### Example

```rust
while let Some(val) = iter.next() {
    ..
}
```

Use instead:

```rust
for val in &mut iter {
    ..
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L790

## write_literal

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

This lint warns about the use of literals as `write!`/`writeln!` args.

### Why is this bad?

Using literals as `writeln!` args is inefficient and unnecessary
(i.e., just put the literal in the format string)

### Example

```rust
writeln!(buf, "{}", "foo");
```

Use instead:

```rust
writeln!(buf, "foo");
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/write/mod.rs#L152

## write_with_newline

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

This lint warns when you use `write!()` with a format
string that
ends in a newline.

### Why is this bad?

You should use `writeln!()` instead, which appends the
newline.

### Example

```rust
write!(buf, "Hello {}!\n", name);
```

Use instead:

```rust
writeln!(buf, "Hello {}!", name);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/write/mod.rs#L181

## writeln_empty_string

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

This lint warns when you use `writeln!(buf, "")` to
print a newline.

### Why is this bad?

You should use `writeln!(buf)`, which is simpler.

### Example

```rust
writeln!(buf, "");
```

Use instead:

```rust
writeln!(buf);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/write/mod.rs#L212

## wrong_self_convention

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for methods with certain name prefixes or suffixes, and which
do not adhere to standard conventions regarding how `self` is taken.
The actual rules are:
PrefixPostfix`self` taken`self` type
`as_`none`&self` or `&mut self`any
`from_`nonenoneany
`into_`none`self`any
`is_`none`&mut self` or `&self` or noneany
`to_``_mut``&mut self`any
`to_`not `_mut``self``Copy`
`to_`not `_mut``&self`not `Copy`

Note: Clippy doesn’t trigger methods with `to_` prefix in:

- Traits definition.
Clippy can not tell if a type that implements a trait is `Copy` or not.

- Traits implementation, when `&self` is taken.
The method signature is controlled by the trait and often `&self` is required for all types that implement the trait
(see e.g. the `std::string::ToString` trait).

Clippy allows `Pin<&Self>` and `Pin<&mut Self>` if `&self` and `&mut self` is required.

Please find more info here:
https://rust-lang.github.io/api-guidelines/naming.html#ad-hoc-conversions-follow-as_-to_-into_-conventions-c-conv

### Why is this bad?

Consistency breeds readability. If you follow the
conventions, your users won’t be surprised that they, e.g., need to supply a
mutable reference to a `as_..` function.

### Example

```rust
impl X {
    fn as_str(self) -> &'static str {
        // ..
    }
}
```

Use instead:

```rust
impl X {
    fn as_str(&self) -> &'static str {
        // ..
    }
}
```

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L5004

## zero_ptr

Grupo: `style` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Catch casts from `0` to some pointer type

### Why is this bad?

This generally means `null` and is better expressed as
{`std`, `core`}`::ptr::`{`null`, `null_mut`}.

### Example

```rust
let a = 0 as *const u32;
```

Use instead:

```rust
let a = std::ptr::null::<u32>();
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L825
