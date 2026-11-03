# Catálogo de lints do Clippy — grupo `pedantic`

## assert_is_empty

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.99.0

### What it does

Checks assertions that only test whether a supported value is empty.

The lint handles `assert!` and `debug_assert!` calls on strings, slices, arrays, and `Vec`.

### Why is this bad?

A boolean assertion only reports that the emptiness check failed. It does not show what the
asserted value contained.

In CI or another remote test service, the failure output tells you that the value was
unexpectedly empty or non-empty, but not which values were present. The next step is often
to reproduce the failure locally, add temporary logging, or change the test so it exposes
the value. That extra investigation can be much slower than fixing the problem from the
original CI failure.

The emptiness check also commonly appears before a deeper contents assertion:

```rust
assert!(!items.is_empty());
assert_eq!(items[0], "bar");
```

If the first assertion fails, the second assertion never runs, so the failure can hide the
check that would have shown more useful context.

Instead, compare the value with an empty value using `assert_eq!`, `assert_ne!`,
`debug_assert_eq!`, or `debug_assert_ne!`. These macros print the asserted value on failure.

### Known problems

Printing the asserted value can be undesirable outside tests, especially when the value may
be very large or contain sensitive information. If the assertion failure should not reveal
the value, keep the boolean assertion and allow this lint at that assertion.

### Example

```rust
assert!(items.is_empty());
assert!(!items.is_empty());
```

Use instead:

```rust
assert_eq!(items, [] as [i32; 0]);
assert_ne!(items, [] as [i32; 0]);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/assert_is_empty.rs#L15

## assigning_clones

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.78.0

### What it does

Checks for code like `foo = bar.clone();`

### Why is this bad?

Custom `Clone::clone_from()` or `ToOwned::clone_into` implementations allow the objects
to share resources and therefore avoid allocations.

### Example

```rust
struct Thing;

impl Clone for Thing {
    fn clone(&self) -> Self { todo!() }
    fn clone_from(&mut self, other: &Self) { todo!() }
}

pub fn assign_to_ref(a: &mut Thing, b: Thing) {
    *a = b.clone();
}
```

Use instead:

```rust
struct Thing;

impl Clone for Thing {
    fn clone(&self) -> Self { todo!() }
    fn clone_from(&mut self, other: &Self) { todo!() }
}

pub fn assign_to_ref(a: &mut Thing, b: Thing) {
    a.clone_from(&b);
}
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/assigning_clones.rs#L15

## bool_to_int_with_if

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.65.0

### What it does

Instead of using an if statement to convert a bool to an int,
this lint suggests using a `from()` function or an `as` coercion.

### Why is this bad?

Coercion or `from()` is another way to convert bool to a number.
Both methods are guaranteed to return 1 for true, and 0 for false.

See https://doc.rust-lang.org/std/primitive.bool.html#impl-From%3Cbool%3E-for-u8

### Example

```rust
if condition {
    1_i64
} else {
    0
};
```

Use instead:

```rust
i64::from(condition);
```

or

```rust
condition as i64;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/bool_to_int_with_if.rs#L9

## borrow_as_ptr

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.60.0

### What it does

Checks for the usage of `&expr as *const T` or
`&mut expr as *mut T`, and suggest using `&raw const` or
`&raw mut` instead.

### Why is this bad?

This would improve readability and avoid creating a reference
that points to an uninitialized value or unaligned place.
Read the `&raw` explanation in the Reference for more information.

### Example

```rust
let val = 1;
let p = &val as *const i32;

let mut val_mut = 1;
let p_mut = &mut val_mut as *mut i32;
```

Use instead:

```rust
let val = 1;
let p = &raw const val;

let mut val_mut = 1;
let p_mut = &raw mut val_mut;
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L117

## bufreader_stdin

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.97.0

### What it does

Checks for usage of `BufReader::new` with `Stdin` or `StdinLock`.

### Why is this bad?

`Stdin` is already buffered. Re-buffering it only increases the memcpy calls.

### Example

```rust
let reader = std::io::BufReader::new(std::io::stdin());
```

Use instead:

```rust
let stdin = std::io::stdin();
let reader = stdin.lock();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/bufreader_stdin.rs#L9

## case_sensitive_file_extension_comparisons

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.51.0

### What it does

Checks for calls to `ends_with` with possible file extensions
and suggests to use a case-insensitive approach instead.

### Why is this bad?

`ends_with` is case-sensitive and may not detect files with a valid extension.

### Example

```rust
fn is_rust_file(filename: &str) -> bool {
    filename.ends_with(".rs")
}
```

Use instead:

```rust
fn is_rust_file(filename: &str) -> bool {
    let filename = std::path::Path::new(filename);
    filename.extension()
        .map_or(false, |ext| ext.eq_ignore_ascii_case("rs"))
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L293

## cast_lossless

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for casts between numeric types that can be replaced by safe
conversion functions.

### Why is this bad?

Rust’s `as` keyword will perform many kinds of conversions, including
silently lossy conversions. Conversion functions such as `i32::from`
will only perform lossless conversions. Using the conversion functions
prevents conversions from becoming silently lossy if the input types
ever change, and makes it clear for people reading the code that the
conversion is lossless.

### Example

```rust
fn as_u64(x: u8) -> u64 {
    x as u64
}
```

Using `::from` would look like this:

```rust
fn as_u64(x: u8) -> u64 {
    u64::from(x)
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L210

## cast_possible_truncation

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for casts between numeric types that may
truncate large values. This is expected behavior, so the cast is `Allow` by
default. It suggests user either explicitly ignore the lint,
or use `try_from()` and handle the truncation, default, or panic explicitly.

### Why is this bad?

In some problem domains, it is good practice to avoid
truncation. This lint can be activated to help assess where additional
checks could be beneficial.

### Example

```rust
fn as_u8(x: u64) -> u8 {
    x as u8
}
```

Use instead:

```rust
fn as_u8(x: u64) -> u8 {
    if let Ok(x) = u8::try_from(x) {
        x
    } else {
        todo!();
    }
}
// Or
#[allow(clippy::cast_possible_truncation)]
fn as_u16(x: u64) -> u16 {
    x as u16
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L265

## cast_possible_wrap

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for casts from an unsigned type to a signed type of
the same size, or possibly smaller due to target-dependent integers.
Performing such a cast is a no-op for the compiler (that is, nothing is
changed at the bit level), and the binary representation of the value is
reinterpreted. This can cause wrapping if the value is too big
for the target signed type. However, the cast works as defined, so this lint
is `Allow` by default.

### Why is this bad?

While such a cast is not bad in itself, the results can
be surprising when this is not the intended behavior:

### Example

```rust
let _ = u32::MAX as i32; // will yield a value of `-1`
```

Use instead:

```rust
let _ = i32::try_from(u32::MAX).ok();
```

If the wrapping is intended, you can use:

```rust
let _ = u32::MAX.cast_signed();
let _ = (-1i32).cast_unsigned();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L304

## cast_precision_loss

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for casts from any numeric type to a float type where
the receiving type cannot store all values from the original type without
rounding errors. This possible rounding is to be expected, so this lint is
`Allow` by default.

Basically, this warns on casting any integer with 32 or more bits to `f32`
or any 64-bit integer to `f64`.

### Why is this bad?

It’s not bad at all. But in some applications it can be
helpful to know where precision loss can take place. This lint can help find
those places in the code.

### Example

```rust
let x = u64::MAX;
x as f64;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L340

## cast_ptr_alignment

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for casts, using `as` or `pointer::cast`, from a
less strictly aligned pointer to a more strictly aligned pointer.

### Why is this bad?

Dereferencing the resulting pointer may be undefined behavior.

### Known problems

Using `std::ptr::read_unaligned` and `std::ptr::write_unaligned` or
similar on the resulting pointer is fine. Is over-zealous: casts with
manual alignment checks or casts like `u64` -> `u8` -> `u16` can be
fine. Miri is able to do a more in-depth analysis.

### Example

```rust
let _ = (&1u8 as *const u8) as *const u16;
let _ = (&mut 1u8 as *mut u8) as *mut u16;

(&1u8 as *const u8).cast::<u16>();
(&mut 1u8 as *mut u8).cast::<u16>();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L366

## cast_sign_loss

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for casts from a signed to an unsigned numeric
type. In this case, negative values wrap around to large positive values,
which can be quite surprising in practice. However, since the cast works as
defined, this lint is `Allow` by default.

### Why is this bad?

Possibly surprising results. You can activate this lint
as a one-time check to see where numeric wrapping can arise.

### Example

```rust
let y: i8 = -1;
y as u64; // will return 18446744073709551615
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L394

## checked_conversions

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.37.0

### What it does

Checks for explicit bounds checking when casting.

### Why is this bad?

Reduces the readability of statements & is error prone.

### Example

```rust
foo <= i32::MAX as u32;
```

Use instead:

```rust
i32::try_from(foo).is_ok();
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/checked_conversions.rs#L11

## cloned_instead_of_copied

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.53.0

### What it does

Checks for usage of `cloned()` on an `Iterator` or `Option` where
`copied()` could be used instead.

### Why is this bad?

`copied()` is better because it guarantees that the type being cloned
implements `Copy`.

### Example

```rust
[1, 2, 3].iter().cloned();
```

Use instead:

```rust
[1, 2, 3].iter().copied();
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L473

## collapsible_else_if

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.51.0

### What it does

Checks for collapsible `else { if ... }` expressions
that can be collapsed to `else if ...`.

### Why is this bad?

Each `if`-statement adds one level of nesting, which
makes code look more complex than it really is.

### Example

```rust

if x {
    …
} else {
    if y {
        …
    }
}
```

Should be written:

```rust
if x {
    …
} else if y {
    …
}
```

### Configuration

- 

`lint-commented-code`:  Whether collapsible `if` and `else if` chains are linted if they contain comments inside the parts
that would be collapsed.

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/collapsible_if.rs#L15

## comparison_chain

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.40.0

### What it does

Checks comparison chains written with `if` that can be
rewritten with `match` and `cmp`.

### Why is this bad?

`if` is not guaranteed to be exhaustive and conditionals can get
repetitive

### Example

```rust
fn f(x: u8, y: u8) {
    if x > y {
        a()
    } else if x < y {
        b()
    } else {
        c()
    }
}
```

Use instead:

```rust
use std::cmp::Ordering;
fn f(x: u8, y: u8) {
     match x.cmp(&y) {
         Ordering::Greater => a(),
         Ordering::Less => b(),
         Ordering::Equal => c()
     }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/comparison_chain.rs#L10

## copy_iterator

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.30.0

### What it does

Checks for types that implement `Copy` as well as
`Iterator`.

### Why is this bad?

Implicit copies can be confusing when working with
iterator combinators.

### Example

```rust
#[derive(Copy, Clone)]
struct Countdown(u8);

impl Iterator for Countdown {
    // ...
}

let a: Vec<_> = my_iterator.take(1).collect();
let b: Vec<_> = my_iterator.collect();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/copy_iterator.rs#L7

## decimal_bitwise_operands

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.94.0

### What it does

Checks for decimal literals used as bit masks in bitwise operations.

### Why is this bad?

Using decimal literals for bit masks can make the code less readable and obscure the intended bit pattern.
Binary, hexadecimal, or octal literals make the bit pattern more explicit and easier to understand at a glance.

### Example

```rust
let a = 14 & 6; // Bit pattern is not immediately clear
```

Use instead:

```rust
let a = 0b1110 & 0b0110;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L209

## default_trait_access

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for literal calls to `Default::default()`.

### Why is this bad?

It’s easier for the reader if the name of the type is used, rather than the
generic `Default`.

### Example

```rust
let s: String = Default::default();
```

Use instead:

```rust
let s = String::default();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/default.rs#L14

## deprecated_attributes_without_since

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.100.0

### What it does

Checks for attributes that deprecate items without a `since` field.

### Why is this bad?

It can be difficult for users of your crate to know when an item was
deprecated if it was not documented. Knowing when an item was deprecated
helps users determine how long they have to migrate and act accordingly.

### Example

```rust
#[deprecated]
pub fn foo() { /* ... */ }
```

Use instead:

```rust
#[deprecated(since = "5.2.0")]
pub fn foo() { /* ... */ }
```

### Note

If you’re using `git` for version control and tagging releases, you may
be able to find the correct value for the `since` field fairly easily.

If the `deprecated` attribute missing the `since` field is in the file
`foo/bar/baz.rs` on line 42, then:

```rust
git blame -L 42 -- foo/bar/baz.rs
```

May help you find the commit that originally deprecated the item. From
there, if the commit that deprecated the item was commit
`d34dbe3fd34dbe3fd34dbe3fd34dbe3fd34dbe3f`, you can do:

```rust
git tag --contains d34dbe3fd34dbe3fd34dbe3fd34dbe3fd34dbe3f
```

To list the tags which contain that commit, the earliest of which
corresponds to a release would be the version the item was deprecated
in.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/attrs/mod.rs#L135

## doc_broken_link

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.90.0

### What it does

Checks the doc comments have unbroken links, mostly caused
by bad formatted links such as broken across multiple lines.

### Why is this bad?

Because documentation generated by rustdoc will be broken
since expected links won’t be links and just text.

### Examples

This link is broken:

```rust
/// [example of a bad link](https://
/// github.com/rust-lang/rust-clippy/)
pub fn do_something() {}
```

It shouldn’t be broken across multiple lines to work:

```rust
/// [example of a good link](https://github.com/rust-lang/rust-clippy/)
pub fn do_something() {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L43

## doc_comment_double_space_linebreaks

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.87.0

### What it does

Detects doc comments that use double spaces as hard line break, instead of backslash (`\`).

### Why is this bad?

Double spaces, when used as hard line break in doc comments, can be difficult to see, and may
accidentally be removed during automatic formatting or manual refactoring. The use of a backslash (`\`)
is clearer in this regard.

### Example

The two replacement dots (`··`) in this example represent a double space.

```rust
/// This function adds two numbers and returns the result··
/// Overflow can occur when the max value is exceeded.
fn add(l: i32, r: i32) -> i32 {
    l + r
}
```

Use instead:

```rust
/// This function adds two numbers and returns the result\
/// Overflow can occur when the max value is exceeded.
fn add(l: i32, r: i32) -> i32 {
    l + r
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L71

## doc_link_with_quotes

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.63.0

### What it does

Detects the syntax `['foo']` in documentation comments (notice quotes instead of backticks)
outside of code blocks

### Why is this bad?

It is likely a typo when defining an intra-doc link

### Example

```rust
/// See also: ['foo']
fn bar() {}
```

Use instead:

```rust
/// See also: [`foo`]
fn bar() {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L212

## doc_markdown

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for the presence of `_`, `::` or camel-case words
outside ticks in documentation.

### Why is this bad?

Rustdoc supports markdown formatting, `_`, `::` and
camel-case probably indicates some code which should be included between
ticks. `_` can also be used for emphasis in markdown, this lint tries to
consider that.

### Known problems

Lots of bad docs won’t be fixed, what the lint checks
for is limited, and there are still false positives. HTML elements and their
content are not linted.

In addition, when writing documentation comments, including `[]` brackets
inside a link text would trip the parser. Therefore, documenting link with
`[`SmallVec<[T; INLINE_CAPACITY]>`]` and then `[`SmallVec<[T; INLINE_CAPACITY]>`]: SmallVec`
would fail.

### Examples

```rust
/// Do something with the foo_bar parameter. See also
/// that::other::module::foo.
// ^ `foo_bar` and `that::other::module::foo` should be ticked.
fn doit(foo_bar: usize) {}
```

```rust
// Link text with `[]` brackets should be written as following:
/// Consume the array and return the inner
/// [`SmallVec<[T; INLINE_CAPACITY]>`][SmallVec].
/// [SmallVec]: SmallVec
fn foo() {}
```

### Configuration

- `doc-valid-idents`:  The list of words this lint should not consider as identifiers needing ticks. The value
`".."` can be used as part of the list to indicate that the configured values should be appended to the
default configuration of Clippy. By default, any configuration will replace the default value. For example:

- 

`doc-valid-idents = ["ClipPy"]` would replace the default list with `["ClipPy"]`.

- 

`doc-valid-idents = ["ClipPy", ".."]` would append `ClipPy` to the default list.

(default: `["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "MHz", "GHz", "THz", "AccessKit", "CoAP", "CoreFoundation", "CoreGraphics", "CoreText", "DevOps", "Direct2D", "Direct3D", "DirectWrite", "DirectX", "ECMAScript", "GPLv2", "GPLv3", "GitHub", "GitLab", "IPv4", "IPv6", "InfiniBand", "RoCE", "ClojureScript", "CoffeeScript", "JavaScript", "PostScript", "PureScript", "TypeScript", "PowerPC", "PowerShell", "WebAssembly", "NaN", "NaNs", "OAuth", "GraphQL", "SQLite", "MySQL", "PostgreSQL", "MariaDB", "MongoDB", "OCaml", "OpenAL", "OpenDNS", "OpenGL", "OpenMP", "OpenSSH", "OpenSSL", "OpenStreetMap", "OpenTelemetry", "OpenType", "WebAuthn", "WebGL", "WebGL2", "WebGPU", "WebRTC", "WebSocket", "WebTransport", "WebP", "OpenExr", "YCbCr", "sRGB", "TensorFlow", "TrueType", "iOS", "macOS", "FreeBSD", "NetBSD", "OpenBSD", "NixOS", "TeX", "LaTeX", "BibTeX", "BibLaTeX", "MinGW", "CamelCase", "x86_64", "CommonMark", "IntelliJ"]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L235

## duration_suboptimal_units

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.95.0

### What it does

Checks for instances where a `std::time::Duration` is constructed using a smaller time unit
when the value could be expressed more clearly using a larger unit.

For literal values that would convert to 10 or fewer of the larger unit,
this lint does not apply.

### Why is this bad?

Using a smaller unit for a duration that is evenly divisible by a larger unit reduces
readability. Readers have to mentally convert values, which can be error-prone and makes
the code less clear.

### Example

```rust
use std::time::Duration;

let dur = Duration::from_millis(50_000);
let dur = Duration::from_secs(1800);
let dur = Duration::from_mins(10 * 60);
```

Use instead:

```rust
use std::time::Duration;

let dur = Duration::from_secs(50);
let dur = Duration::from_mins(30);
let dur = Duration::from_hours(10);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/duration_suboptimal_units.rs#L16

## elidable_lifetime_names

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.87.0

### What it does

Checks for lifetime annotations which can be replaced with anonymous lifetimes (`'_`).

### Why is this bad?

The additional lifetimes can make the code look more complicated.

### Known problems

This lint ignores functions with `where` clauses that reference
lifetimes to prevent false positives.

### Example

```rust
fn f<'a>(x: &'a str) -> Chars<'a> {
    x.chars()
}
```

Use instead:

```rust
fn f(x: &str) -> Chars<'_> {
    x.chars()
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/lifetimes.rs#L30

## enum_glob_use

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for `use Enum::*`.

### Why is this bad?

It is usually better style to use the prefixed name of
an enumeration variant, rather than importing variants.

### Known problems

Old-style enumerations that prefix the variants are
still around.

### Example

```rust
use std::cmp::Ordering::*;

foo(Less);
```

Use instead:

```rust
use std::cmp::Ordering;

foo(Ordering::Less)
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/wildcard_imports.rs#L15

## expl_impl_clone_on_copy

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for explicit `Clone` implementations for `Copy`
types.

### Why is this bad?

To avoid surprising behavior, these traits should
agree and the behavior of `Copy` cannot be overridden. In almost all
situations a `Copy` type should have a `Clone` implementation that does
nothing more than copy the object, which is what `#[derive(Copy, Clone)]`
gets you.

### Example

```rust
#[derive(Copy)]
struct Foo;

impl Clone for Foo {
    // ..
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/derive/mod.rs#L125

## explicit_deref_methods

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.44.0

### What it does

Checks for explicit `deref()` or `deref_mut()` method calls.

Doesn’t lint inside the implementation of the `Deref` or `DerefMut` traits.

### Why is this bad?

Dereferencing by `&*x` or `&mut *x` is clearer and more concise,
when not part of a method chain.

### Example

```rust
use std::ops::Deref;
let a: &mut String = &mut String::from("foo");
let b: &str = a.deref();
```

Use instead:

```rust
let a: &mut String = &mut String::from("foo");
let b = &*a;
```

This lint excludes all of:

```rust
let _ = d.unwrap().deref();
let _ = Foo::deref(&foo);
let _ = <Foo as Deref>::deref(&foo);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/dereference.rs#L49

## explicit_into_iter_loop

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for loops on `y.into_iter()` where `y` will do, and
suggests the latter.

### Why is this bad?

Readability.

### Example

```rust
// with `y` a `Vec` or slice:
for x in y.into_iter() {
    // ..
}
```

can be rewritten to

```rust
for x in y {
    // ..
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L147

## explicit_iter_loop

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for loops on `x.iter()` where `&x` will do, and
suggests the latter.

### Why is this bad?

Readability.

### Known problems

False negatives. We currently only warn on some known
types.

### Example

```rust
// with `y` a `Vec` or slice:
for x in y.iter() {
    // ..
}
```

Use instead:

```rust
for x in &y {
    // ..
}
```

### Configuration

- `enforce-iter-loop-reborrow`:  Whether to recommend using implicit into iter for reborrowed values.

#### Example

```rust
let mut vec = vec![1, 2, 3];
let rmvec = &mut vec;
for _ in rmvec.iter() {}
for _ in rmvec.iter_mut() {}
```

Use instead:

```rust
let mut vec = vec![1, 2, 3];
let rmvec = &mut vec;
for _ in &*rmvec {}
for _ in &mut *rmvec {}
```

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L176

## filter_map_next

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.36.0

### What it does

Checks for usage of `_.filter_map(_).next()`.

### Why is this bad?

Readability, this can be written more concisely as
`_.find_map(_)`.

### Example

```rust
 (0..3).filter_map(|x| if x == 2 { Some(x) } else { None }).next();
```

Can be written as

```rust
 (0..3).find_map(|x| if x == 2 { Some(x) } else { None });
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L890

## flat_map_option

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.53.0

### What it does

Checks for usage of `Iterator::flat_map()` where `filter_map()` could be
used instead.

### Why is this bad?

`filter_map()` is known to always produce 0 or 1 output items per input item,
rather than however many the inner iterator type produces.
Therefore, it maintains the upper bound in `Iterator::size_hint()`,
and communicates to the reader that the input items are not being expanded into
multiple output items without their having to notice that the mapping function
returns an `Option`.

### Example

```rust
let nums: Vec<i32> = ["1", "2", "whee!"].iter().flat_map(|x| x.parse().ok()).collect();
```

Use instead:

```rust
let nums: Vec<i32> = ["1", "2", "whee!"].iter().filter_map(|x| x.parse().ok()).collect();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L961

## float_cmp

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for (in-)equality comparisons on floating-point
values (apart from zero), except in functions called `*eq*` (which probably
implement equality for a type involving floats).

### Why is this bad?

Floating point calculations are usually imprecise, so asking if two values are exactly
equal is asking for trouble because arriving at the same logical result via different
routes (e.g. calculation versus constant) may yield different values.

### Example

```rust
let a: f64 = 1000.1;
let b: f64 = 0.2;
let x = a + b;
let y = 1000.3; // Expected value.

// Actual value: 1000.3000000000001
println!("{x}");

let are_equal = x == y;
println!("{are_equal}"); // false
```

The correct way to compare floating point numbers is to define an allowed error margin. This
may be challenging if there is no “natural” error margin to permit. Broadly speaking, there
are two cases:

- If your values are in a known range and you can define a threshold for “close enough to
be equal”, it may be appropriate to define an absolute error margin. For example, if your
data is “length of vehicle in centimeters”, you may consider 0.1 cm to be “close enough”.

- If your code is more general and you do not know the range of values, you should use a
relative error margin, accepting e.g. 0.1% of error regardless of specific values.

For the scenario where you can define a meaningful absolute error margin, consider using:

```rust
let a: f64 = 1000.1;
let b: f64 = 0.2;
let x = a + b;
let y = 1000.3; // Expected value.

const ALLOWED_ERROR_VEHICLE_LENGTH_CM: f64 = 0.1;
let within_tolerance = (x - y).abs() < ALLOWED_ERROR_VEHICLE_LENGTH_CM;
println!("{within_tolerance}"); // true
```

NOTE: Do not use `f64::EPSILON` - while the error margin is often called “epsilon”, this is
a different use of the term that is not suitable for floating point equality comparison.
Indeed, for the example above using `f64::EPSILON` as the allowed error would return `false`.

For the scenario where no meaningful absolute error can be defined, refer to
the floating point guide
for a reference implementation of relative error based comparison of floating point values.
`MIN_NORMAL` in the reference implementation is equivalent to `MIN_POSITIVE` in Rust.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L362

## fn_params_excessive_bools

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.43.0

### What it does

Checks for excessive use of bools in function declarations.

### Why is this bad?

Boolean parameters obscure meaning at the call site. The reader has to
remember what each `true` or `false` means and which position each flag
belongs in, with no help from the type system.

The best replacement depends on what role the bool plays:

- Use a two-variant enum when one parameter selects a mode.

- Split one function into two named operations when the choices are
distinct actions.

- Group multiple related flags into a struct or options type when they
travel together.

- Move the setting onto `self` or an existing config/context parameter
when it is really part of the surrounding state.

This optimizes for readability of the calling code, which future readers
encounter more often than the function declaration.

The `max-fn-params-bools` configuration accepts `0`, which lints on any
function with a bool parameter.

### Example

```rust
fn render_document(show_hidden: bool, is_draft: bool) { ... }
```

Use instead:

```rust
enum Visibility {
    ShowHidden,
    HideHidden,
}

enum DocumentKind {
    Draft,
    Final,
}

fn render_document(visibility: Visibility, kind: DocumentKind) { ... }

// or split the operation when the choices are distinct
fn render_draft() { ... }
fn render_final() { ... }
```

### Configuration

- 

`max-fn-params-bools`:  The maximum number of bool parameters a function can have.
Use `0` to lint on any function with a bool parameter.

(default: `3`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/excessive_bools.rs#L11

## format_collect

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.73.0

### What it does

Checks for usage of `.map(|_| format!(..)).collect::<String>()`.

### Why is this bad?

This allocates a new string for every element in the iterator.
This can be done more efficiently by creating the `String` once and appending to it in `Iterator::fold`,
using either the `write!` macro which supports exactly the same syntax as the `format!` macro,
or concatenating with `+` in case the iterator yields `&str`/`String`.

Note also that `write!`-ing into a `String` can never fail, despite the return type of `write!` being `std::fmt::Result`,
so it can be safely ignored or unwrapped.

### Example

```rust
fn hex_encode(bytes: &[u8]) -> String {
    bytes.iter().map(|b| format!("{b:02X}")).collect()
}
```

Use instead:

```rust
use std::fmt::Write;
fn hex_encode(bytes: &[u8]) -> String {
    bytes.iter().fold(String::new(), |mut output, b| {
        let _ = write!(output, "{b:02X}");
        output
    })
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L988

## format_push_string

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.62.0

### What it does

Detects cases where the result of a `format!` call is
appended to an existing `String`.

### Why is this bad?

Introduces an extra, avoidable heap allocation.

### Known problems

`format!` returns a `String` but `write!` returns a `Result`.
Thus you are forced to ignore the `Err` variant to achieve the same API.

While using `write!` in the suggested way should never fail, this isn’t necessarily clear to the programmer.

### Example

```rust
let mut s = String::new();
s += &format!("0x{:X}", 1024);
s.push_str(&format!("0x{:X}", 1024));
```

Use instead:

```rust
use std::fmt::Write as _; // import without risk of name clashing

let mut s = String::new();
let _ = write!(s, "0x{:X}", 1024);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/format_push_string.rs#L12

## if_not_else

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `!` or `!=` in an if condition with an
else branch.

### Why is this bad?

Negations reduce the readability of statements.

### Example

```rust
if !v.is_empty() {
    a()
} else {
    b()
}
```

Could be written:

```rust
if v.is_empty() {
    b()
} else {
    a()
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/if_not_else.rs#L10

## ifs_as_logical_ops

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.101.0

### What it does

Warn about cases where `x && y` could be used in place of an if condition.

### Why is this bad?

`x && y` is more standard as a construction, and makes it clearer that this is just an and.
It is also less verbose.

### Example

```rust
fn b(b1: bool) -> bool {
    if b1 { a() } else { false }
}

```

Could be written

```rust
fn b(b1: bool) -> bool {
    b1 && a()
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/ifs_as_logical_ops.rs#L12

## ignore_without_reason

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.88.0

### What it does

Checks for ignored tests without messages.

### Why is this bad?

The reason for ignoring the test may not be obvious.

### Example

```rust
#[test]
#[ignore]
fn test() {}
```

Use instead:

```rust
#[test]
#[ignore = "Some good reason"]
fn test() {}
```

### Note

Clippy can only lint compiled code. For this lint to trigger, you must configure `cargo clippy`
to include test compilation, for instance, by using flags such as `--tests` or `--all-targets`.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/attrs/mod.rs#L287

## ignored_unit_patterns

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.73.0

### What it does

Checks for usage of `_` in patterns of type `()`.

### Why is this bad?

Matching with `()` explicitly instead of `_` outlines
the fact that the pattern contains no data. Also it
would detect a type change that `_` would ignore.

### Example

```rust
match std::fs::create_dir("tmp-work-dir") {
    Ok(_) => println!("Working directory created"),
    Err(s) => eprintln!("Could not create directory: {s}"),
}
```

Use instead:

```rust
match std::fs::create_dir("tmp-work-dir") {
    Ok(()) => println!("Working directory created"),
    Err(s) => eprintln!("Could not create directory: {s}"),
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/ignored_unit_patterns.rs#L7

## implicit_clone

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.52.0

### What it does

Checks for the usage of `_.to_owned()`, `vec.to_vec()`, or similar when calling `_.clone()` would be clearer.

### Why is this bad?

These methods do the same thing as `_.clone()` but may be confusing as
to why we are calling `to_vec` on something that is already a `Vec` or calling `to_owned` on something that is already owned.

### Example

```rust
let a = vec![1, 2, 3];
let b = a.to_vec();
let c = a.to_owned();
```

Use instead:

```rust
let a = vec![1, 2, 3];
let b = a.clone();
let c = a.clone();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1119

## implicit_hasher

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for public `impl` or `fn` missing generalization
over different hashers and implicitly defaulting to the default hashing
algorithm (`SipHash`).

### Why is this bad?

`HashMap` or `HashSet` with custom hashers cannot be
used with them.

### Known problems

Suggestions for replacing constructors can contain
false-positives. Also applying suggestions can require modification of other
pieces of code, possibly including external crates.

### Example

```rust
impl<K: Hash + Eq, V> Serialize for HashMap<K, V> { }

pub fn foo(map: &mut HashMap<i32, i32>) { }
```

could be rewritten as

```rust
impl<K: Hash + Eq, V, S: BuildHasher> Serialize for HashMap<K, V, S> { }

pub fn foo<S: BuildHasher>(map: &mut HashMap<i32, i32, S>) { }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/implicit_hasher.rs#L18

## inconsistent_struct_constructor

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.52.0

### What it does

Checks for struct constructors where the order of the field
init in the constructor is inconsistent with the order in the
struct definition.

### Why is this bad?

Since the order of fields in a constructor doesn’t affect the
resulted instance as the below example indicates,

```rust
#[derive(Debug, PartialEq, Eq)]
struct Foo {
    x: i32,
    y: i32,
}
let x = 1;
let y = 2;

// This assertion never fails:
assert_eq!(Foo { x, y }, Foo { y, x });
```

inconsistent order can be confusing and decreases readability and consistency.

### Example

```rust
struct Foo {
    x: i32,
    y: i32,
}
let x = 1;
let y = 2;

Foo { y, x };
```

Use instead:

```rust
Foo { x, y };
```

### Configuration

- `check-inconsistent-struct-field-initializers`:  Whether to suggest reordering constructor fields when initializers are present.

Warnings produced by this configuration aren’t necessarily fixed by just reordering the fields. Even if the
suggested code would compile, it can change semantics if the initializer expressions have side effects. The
following example from rust-clippy#11846 shows how the suggestion can run into borrow check errors:

```rust
struct MyStruct {
    vector: Vec<u32>,
    length: usize
}
fn main() {
    let vector = vec![1,2,3];
    MyStruct { length: vector.len(), vector};
}
```

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/inconsistent_struct_constructor.rs#L14

## index_refutable_slice

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.59.0

### What it does

The lint checks for slice bindings in patterns that are only used to
access individual slice values.

### Why is this bad?

Accessing slice values using indices can lead to panics. Using refutable
patterns can avoid these. Binding to individual values also improves the
readability as they can be named.

### Limitations

This lint currently only checks for immutable access inside `if let`
patterns.

### Example

```rust
let slice: Option<&[u32]> = Some(&[1, 2, 3]);

if let Some(slice) = slice {
    println!("{}", slice[0]);
}
```

Use instead:

```rust
let slice: Option<&[u32]> = Some(&[1, 2, 3]);

if let Some(&[first, ..]) = slice {
    println!("{}", first);
}
```

### Configuration

- 

`max-suggested-slice-pattern-length`:  When Clippy suggests using a slice pattern, this is the maximum number of elements allowed in
the slice pattern that is suggested. If more elements are necessary, the lint is suppressed.
For example, `[_, _, _, e, ..]` is a slice pattern with 4 elements.

(default: `3`)

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/index_refutable_slice.rs#L19

## inefficient_to_string

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.40.0

### What it does

Checks for usage of `.to_string()` on an `&&T` where
`T` implements `ToString` directly (like `&&str` or `&&String`).

### Why is this bad?

In versions of the compiler before Rust 1.82.0, this bypasses the specialized
implementation of `ToString` and instead goes through the more expensive string
formatting facilities.

### Example

```rust
// Generic implementation for `T: Display` is used (slow)
["foo", "bar"].iter().map(|s| s.to_string());

// OK, the specialized impl is used
["foo", "bar"].iter().map(|&s| s.to_string());
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1145

## inline_always

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for items annotated with `#[inline(always)]`,
unless the annotated function is empty or simply panics.

### Why is this bad?

While there are valid uses of this annotation (and once
you know when to use it, by all means `allow` this lint), it’s a common
newbie-mistake to pepper one’s code with it.

As a rule of thumb, before slapping `#[inline(always)]` on a function,
measure if that additional function call really affects your runtime profile
sufficiently to make up for the increase in compile time.

### Known problems

False positives, big time. This lint is meant to be
deactivated by everyone doing serious performance work. This means having
done the measurement.

### Example

```rust
#[inline(always)]
fn not_quite_hot_code(..) { ... }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/attrs/mod.rs#L316

## into_iter_without_iter

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.75.0

### What it does

This is the opposite of the `iter_without_into_iter` lint.
It looks for `IntoIterator for (&|&mut) Type` implementations without an inherent `iter` or `iter_mut` method
on the type or on any of the types in its `Deref` chain.

### Why is this bad?

It’s not bad, but having them is idiomatic and allows the type to be used in iterator chains
by just calling `.iter()`, instead of the more awkward `<&Type>::into_iter` or `(&val).into_iter()` syntax
in case of ambiguity with another `IntoIterator` impl.

### Limitations

This lint focuses on providing an idiomatic API. Therefore, it will only
lint on types which are accessible outside of the crate. For internal types,
these methods can be added on demand if they are actually needed. Otherwise,
it would trigger the `dead_code` lint for the unused method.

### Example

```rust
struct MySlice<'a>(&'a [u8]);
impl<'a> IntoIterator for &MySlice<'a> {
    type Item = &'a u8;
    type IntoIter = std::slice::Iter<'a, u8>;
    fn into_iter(self) -> Self::IntoIter {
        self.0.iter()
    }
}
```

Use instead:

```rust
struct MySlice<'a>(&'a [u8]);
impl<'a> MySlice<'a> {
    pub fn iter(&self) -> std::slice::Iter<'a, u8> {
        self.into_iter()
    }
}
impl<'a> IntoIterator for &MySlice<'a> {
    type Item = &'a u8;
    type IntoIter = std::slice::Iter<'a, u8>;
    fn into_iter(self) -> Self::IntoIter {
        self.0.iter()
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/iter_without_into_iter.rs#L11

## invalid_upcast_comparisons

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for comparisons where the relation is always either
true or false, but where one side has been upcast so that the comparison is
necessary. Only integer types are checked.

### Why is this bad?

An expression like `let x : u8 = ...; (x as u32) > 300`
will mistakenly imply that it is possible for `x` to be outside the range of
`u8`.

### Example

```rust
let x: u8 = 1;
(x as u32) > 300;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L648

## ip_constant

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.89.0

### What it does

Checks for IP addresses that could be replaced with predefined constants such as
`Ipv4Addr::new(127, 0, 0, 1)` instead of using the appropriate constants.

### Why is this bad?

Using specific IP addresses like `127.0.0.1` or `::1` is less clear and less maintainable than using the
predefined constants `Ipv4Addr::LOCALHOST` or `Ipv6Addr::LOCALHOST`. These constants improve code
readability, make the intent explicit, and are less error-prone.

### Example

```rust
use std::net::{Ipv4Addr, Ipv6Addr};

// IPv4 loopback
let addr_v4 = Ipv4Addr::new(127, 0, 0, 1);

// IPv6 loopback
let addr_v6 = Ipv6Addr::new(0, 0, 0, 0, 0, 0, 0, 1);
```

Use instead:

```rust
use std::net::{Ipv4Addr, Ipv6Addr};

// IPv4 loopback
let addr_v4 = Ipv4Addr::LOCALHOST;

// IPv6 loopback
let addr_v6 = Ipv6Addr::LOCALHOST;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1248

## items_after_statements

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for items declared after some statement in a block.

### Why is this bad?

Items live for the entire scope they are declared
in. But statements are processed in order. This might cause confusion as
it’s hard to figure out which item is meant in a statement.

### Example

```rust
fn foo() {
    println!("cake");
}

fn main() {
    foo(); // prints "foo"
    fn foo() {
        println!("foo");
    }
    foo(); // prints "foo"
}
```

Use instead:

```rust
fn foo() {
    println!("cake");
}

fn main() {
    fn foo() {
        println!("foo");
    }
    foo(); // prints "foo"
    foo(); // prints "foo"
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/items_after_statements.rs#L5

## iter_filter_is_ok

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.77.0

### What it does

Checks for usage of `.filter(Result::is_ok)` that may be replaced with a `.flatten()` call.
This lint will require additional changes to the follow-up calls as it affects the type.

### Why is this bad?

This pattern is often followed by manual unwrapping of `Result`. The simplification
results in more readable and succinct code without the need for manual unwrapping.

### Example

```rust
vec![Ok::<i32, String>(1)].into_iter().filter(Result::is_ok);

```

Use instead:

```rust
vec![Ok::<i32, String>(1)].into_iter().flatten();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1364

## iter_filter_is_some

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.77.0

### What it does

Checks for usage of `.filter(Option::is_some)` that may be replaced with a `.flatten()` call.
This lint will require additional changes to the follow-up calls as it affects the type.

### Why is this bad?

This pattern is often followed by manual unwrapping of the `Option`. The simplification
results in more readable and succinct code without the need for manual unwrapping.

### Example

```rust
vec![Some(1)].into_iter().filter(Option::is_some);

```

Use instead:

```rust
vec![Some(1)].into_iter().flatten();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1388

## iter_not_returning_iterator

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.57.0

### What it does

Detects methods named `iter` or `iter_mut` that do not have a return type that implements `Iterator`.

### Why is this bad?

Methods named `iter` or `iter_mut` conventionally return an `Iterator`.

### Example

```rust
// `String` does not implement `Iterator`
struct Data {}
impl Data {
    fn iter(&self) -> String {
        todo!()
    }
}
```

Use instead:

```rust
use std::str::Chars;
struct Data {}
impl Data {
    fn iter(&self) -> Chars<'static> {
        todo!()
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/iter_not_returning_iterator.rs#L9

## iter_without_into_iter

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.75.0

### What it does

Looks for `iter` and `iter_mut` methods without an associated `IntoIterator for (&|&mut) Type` implementation.

### Why is this bad?

It’s not bad, but having them is idiomatic and allows the type to be used in for loops directly
(`for val in &iter {}`), without having to first call `iter()` or `iter_mut()`.

### Limitations

This lint focuses on providing an idiomatic API. Therefore, it will only
lint on types which are accessible outside of the crate. For internal types,
the `IntoIterator` trait can be implemented on demand if it is actually needed.

### Example

```rust
struct MySlice<'a>(&'a [u8]);
impl<'a> MySlice<'a> {
    pub fn iter(&self) -> std::slice::Iter<'a, u8> {
        self.0.iter()
    }
}
```

Use instead:

```rust
struct MySlice<'a>(&'a [u8]);
impl<'a> MySlice<'a> {
    pub fn iter(&self) -> std::slice::Iter<'a, u8> {
        self.0.iter()
    }
}
impl<'a> IntoIterator for &MySlice<'a> {
    type Item = &'a u8;
    type IntoIter = std::slice::Iter<'a, u8>;
    fn into_iter(self) -> Self::IntoIter {
        self.iter()
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/iter_without_into_iter.rs#L63

## large_digit_groups

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Warns if the digits of an integral or floating-point
constant are grouped into groups that
are too large.

### Why is this bad?

Negatively impacts readability.

### Example

```rust
let x: u64 = 6186491_8973511;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/literal_representation.rs#L60

## large_futures

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.70.0

### What it does

It checks for the size of a `Future` created by `async fn` or `async {}`.

### Why is this bad?

Due to the current unideal implementation of `Coroutine`,
large size of a `Future` may cause stack overflows.

### Example

```rust
async fn large_future(_x: [u8; 16 * 1024]) {}

pub async fn trigger() {
    large_future([0u8; 16 * 1024]).await;
}
```

`Box::pin` the big future instead.

```rust
async fn large_future(_x: [u8; 16 * 1024]) {}

pub async fn trigger() {
    Box::pin(large_future([0u8; 16 * 1024])).await;
}
```

### Configuration

- 

`future-size-threshold`:  The maximum byte size a `Future` can have, before it triggers the `clippy::large_futures` lint

(default: `16384`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/large_futures.rs#L12

## large_stack_arrays

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.41.0

### What it does

Checks for local arrays that may be too large.

### Why is this bad?

Large local arrays may cause stack overflow.

### Example

```rust
let a = [0u32; 1_000_000];
```

### Configuration

- 

`array-size-threshold`:  The maximum allowed size for arrays on the stack

(default: `16384`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/large_stack_arrays.rs#L14

## large_types_passed_by_value

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.49.0

### What it does

Checks for functions taking arguments by value, where
the argument type is `Copy` and large enough to be worth considering
passing by reference. Does not trigger if the function is being exported,
because that might induce API breakage, if the parameter is declared as mutable,
or if the argument is a `self`.

### Why is this bad?

Arguments passed by value might result in an unnecessary
shallow copy, taking up more space in the stack and requiring a call to
`memcpy`, which can be expensive.

### Example

```rust
#[derive(Clone, Copy)]
struct TooLarge([u8; 2048]);

fn foo(v: TooLarge) {}
```

Use instead:

```rust
fn foo(v: &TooLarge) {}
```

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

- 

`pass-by-value-size-limit`:  The minimum size (in bytes) to consider a type for passing by reference instead of by value.

(default: `256`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/pass_by_ref_or_value.rs#L23

## linkedlist

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of any `LinkedList`, suggesting to use a
`Vec` or a `VecDeque` (formerly called `RingBuf`).

### Why is this bad?

Gankra says:

The TL;DR of `LinkedList` is that it’s built on a massive amount of
pointers and indirection.
It wastes memory, it has terrible cache locality, and is all-around slow.
`RingBuf`, while
“only” amortized for push/pop, should be faster in the general case for
almost every possible
workload, and isn’t even amortized at all if you can predict the capacity
you need.

`LinkedList`s are only really good if you’re doing a lot of merging or
splitting of lists.
This is because they can just mangle some pointers instead of actually
copying the data. Even
if you’re doing a lot of insertion in the middle of the list, `RingBuf`
can still be better
because of how expensive it is to seek to the middle of a `LinkedList`.

### Known problems

False positives – the instances where using a
`LinkedList` makes sense are few and far between, but they can still happen.

### Example

```rust
let x: LinkedList<usize> = LinkedList::new();
```

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/types/mod.rs#L80

## macro_use_imports

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.44.0

### What it does

Checks for `#[macro_use] use...`.

### Why is this bad?

Since the Rust 2018 edition you can import
macro’s directly, this is considered idiomatic.

### Example

```rust
#[macro_use]
extern crate some_crate;

fn main() {
    some_macro!();
}
```

Use instead:

```rust
use some_crate::some_macro;

fn main() {
    some_macro!();
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/macro_use.rs#L13

## manual_assert

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.57.0

### What it does

Detects `if`-then-`panic!` that can be replaced with `assert!`.

### Why is this bad?

`assert!` is simpler than `if`-then-`panic!`.

### Example

```rust
let sad_people: Vec<&str> = vec![];
if !sad_people.is_empty() {
    panic!("there are sad people: {:?}", sad_people);
}
```

Use instead:

```rust
let sad_people: Vec<&str> = vec![];
assert!(sad_people.is_empty(), "there are sad people: {:?}", sad_people);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_assert.rs#L9

## manual_assert_eq

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.97.0

### What it does

Checks for `assert!` and `debug_assert!` that consist of only an (in)equality check

### Why is this bad?

`assert_{eq,ne}!` and `debug_assert_{eq,ne}!` achieves the same goal, and provides some
additional debug information

### Known problems

This lint cannot determine how large the `Debug` output of the compared values will be.
To avoid producing excessively large assertion output, it ignores comparisons involving
byte-slice-like types. These include byte slices and types that dereference to a byte slice
or implement `AsRef<[u8]>` without also implementing `AsRef<str>`.

### Example

```rust
assert!(2 * 2 == 4);
assert!(2 * 2 != 5);
debug_assert!(2 * 2 == 4);
debug_assert!(2 * 2 != 5);
```

Use instead:

```rust
assert_eq!(2 * 2, 4);
assert_ne!(2 * 2, 5);
debug_assert_eq!(2 * 2, 4);
debug_assert_ne!(2 * 2, 5);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_assert_eq.rs#L12

## manual_bit_width

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.99.0

### What it does

Checks for usage of `T::BITS - x.leading_zeros()` when `x.bit_width()` is available.

### Why is this bad?

Manual reimplementations of `bit_width` increase code complexity for little benefit.

### Example

```rust
let x: u32 = 5;
let bit_width = u32::BITS - x.leading_zeros();
```

Use instead:

```rust
let x: u32 = 5;
let bit_width = x.bit_width();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/bit_width.rs#L11

## manual_ilog2

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.94.0

### What it does

Checks for expressions like `N - x.leading_zeros()` (where `N` is one less than bit width
of `x`) or `x.ilog(2)`, which are manual reimplementations of `x.ilog2()`

### Why is this bad?

Manual reimplementations of `ilog2` increase code complexity for little benefit.

### Example

```rust
let x: u32 = 5;
let log = 31 - x.leading_zeros();
let log = x.ilog(2);
```

Use instead:

```rust
let x: u32 = 5;
let log = x.ilog2();
let log = x.ilog2();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_ilog2.rs#L13

## manual_instant_elapsed

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.65.0

### What it does

Lints subtraction between `Instant::now()` and another `Instant`.

### Why is this bad?

It is easy to accidentally write `prev_instant - Instant::now()`, which will always be 0ns
as `Instant` subtraction saturates.

`prev_instant.elapsed()` also more clearly signals intention.

### Example

```rust
use std::time::Instant;
let prev_instant = Instant::now();
let duration = Instant::now() - prev_instant;
```

Use instead:

```rust
use std::time::Instant;
let prev_instant = Instant::now();
let duration = prev_instant.elapsed();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/time_subtraction.rs#L16

## manual_is_power_of_two

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.83.0

### What it does

Checks for expressions like `x.count_ones() == 1` or `x & (x - 1) == 0`, with x and unsigned integer, which may be manual
reimplementations of `x.is_power_of_two()`.

### Why is this bad?

Manual reimplementations of `is_power_of_two` increase code complexity for little benefit.

### Example

```rust
let a: u32 = 4;
let result = a.count_ones() == 1;
```

Use instead:

```rust
let a: u32 = 4;
let result = a.is_power_of_two();
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_is_power_of_two.rs#L13

## manual_is_variant_and

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.77.0

### What it does

Checks for usage of `option.map(f).unwrap_or_default()` and `result.map(f).unwrap_or_default()` where `f` is a function or closure that returns the `bool` type.

Also checks for equality comparisons like `option.map(f) == Some(true)` and `result.map(f) == Ok(true)`,
as well as `result.ok().is_some_and(f)`.

### Why is this bad?

Readability. These can be written more concisely as `option.is_some_and(f)` and `result.is_ok_and(f)`.

### Example

```rust
option.map(|a| a > 10).unwrap_or_default();
result.map(|a| a > 10).unwrap_or_default();

option.map(|a| a > 10) == Some(true);
result.map(|a| a > 10) == Ok(true);
option.map(|a| a > 10) != Some(true);
result.map(|a| a > 10) != Ok(true);

result.ok().is_some_and(|a| a > 10);
```

Use instead:

```rust
option.is_some_and(|a| a > 10);
result.is_ok_and(|a| a > 10);

option.is_some_and(|a| a > 10);
result.is_ok_and(|a| a > 10);
option.is_none_or(|a| a > 10);
!result.is_ok_and(|a| a > 10);

result.is_ok_and(|a| a > 10);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1985

## manual_let_else

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.67.0

### What it does

Warn of cases where `let...else` could be used

### Why is this bad?

`let...else` provides a standard construct for this pattern
that people can easily recognize. It’s also more compact.

### Example

```rust
let v = if let Some(v) = w { v } else { return };
```

Could be written:

```rust
let Some(v) = w else { return };
```

### Configuration

- 

`matches-for-let-else`:  Whether the matches should be considered by the lint, and whether there should
be filtering for common types.

(default: `"WellKnownTypes"`)

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_let_else.rs#L20

## manual_midpoint

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.87.0

### What it does

Checks for manual implementation of `midpoint`.

### Why is this bad?

Using `(x + y) / 2` or `(x + y) >> 1` on integer types might cause an overflow on the
intermediate addition result. The latter will only warn for unsigned integer types.
Similar for floating-point `(x + y) / 2.0` and `(x + y) * 0.5`.

### Example

```rust
let c = (a + 10) / 2;
let d = (a + 10) >> 1;
let b: f32 = 0.0;
let e = (b + 10.0) / 2.0;
let f = (b + 10.0) * 0.5;
```

Use instead:

```rust
let c = u32::midpoint(a, 10);
let d = u32::midpoint(a, 10);
let b: f32 = 0.0;
let e = f32::midpoint(b, 10.0);
let f = f32::midpoint(b, 10.0);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L750

## manual_string_new

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.65.0

### What it does

Checks for usage of `""` to create a `String`, such as `"".to_string()`, `"".to_owned()`,
`String::from("")` and others.

### Why is this bad?

Different ways of creating an empty string makes your code less standardized, which can
be confusing.

### Example

```rust
let a = "".to_string();
let b: String = "".into();
```

Use instead:

```rust
let a = String::new();
let b = String::new();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_string_new.rs#L10

## many_single_char_names

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for too many variables whose name consists of a
single character.

### Why is this bad?

It’s hard to memorize what a variable means without a
descriptive name.

### Example

```rust
let (a, b, c, d, e, f, g) = (...);
```

### Configuration

- 

`single-char-binding-names-threshold`:  The maximum number of single char bindings a scope may have

(default: `4`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/non_expressive_names.rs#L33

## map_unwrap_or

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.45.0

### What it does

Checks the usage of `map(_).unwrap_or(_)`, `map(_).unwrap_or_default()`
or `map(_).unwrap_or_else(_)` for `Option` and `Result` types.

### Why is this bad?

Readability, these can be written more concisely (resp.) as
`map_or(_, _)`, `map_or_default(_)` or `map_or_else(_, _)`.

### Known problems

The order of the arguments is not in execution order

### Examples

```rust
option.map(|a| a + 1).unwrap_or(0);
option.map(|a| a > 10).unwrap_or(false);
result.map(|a| vec![a]).unwrap_or_default();
result.map(|a| a + 1).unwrap_or_else(some_function);
```

Use instead:

```rust
option.map_or(0, |a| a + 1);
option.is_some_and(|a| a > 10);
result.map_or_default(|a| vec![a]);
result.map_or_else(some_function, |a| a + 1);
```

### Past names

- option_map_unwrap_or

- option_map_unwrap_or_else

- result_map_unwrap_or_else

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2504

## match_bool

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for matches where match expression is a `bool`. It
suggests to replace the expression with an `if...else` block.

### Why is this bad?

It makes the code less readable.

### Example

```rust
let condition: bool = true;
match condition {
    true => foo(),
    false => bar(),
}
```

Use if/else instead:

```rust
let condition: bool = true;
if condition {
    foo();
} else {
    bar();
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L292

## match_same_arms

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for `match` with identical arm bodies.

Note: Does not lint on wildcards if the `non_exhaustive_omitted_patterns_lint` feature is
enabled and disallowed.

### Why is this bad?

This is probably a copy & paste error. If arm bodies
are the same on purpose, you can factor them
using `|`.

### Example

```rust
match foo {
    Bar => bar(),
    Quz => quz(),
    Baz => bar(), // <= oops
}
```

This should probably be

```rust
match foo {
    Bar => bar(),
    Quz => quz(),
    Baz => baz(), // <= fixed
}
```

or if the original code was not a typo:

```rust
match foo {
    Bar | Baz => bar(), // <= shows the intent better
    Quz => quz(),
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L422

## match_wild_err_arm

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for arm which matches all errors with `Err(_)`
and take drastic actions like `panic!`.

### Why is this bad?

It is generally a bad practice, similar to
catching all exceptions in java with `catch(Exception)`

### Example

```rust
let x: Result<i32, &str> = Ok(3);
match x {
    Ok(_) => println!("ok"),
    Err(_) => panic!("err"),
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L530

## match_wildcard_for_single_variants

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.45.0

### What it does

Checks for wildcard enum matches for a single variant.

### Why is this bad?

New enum variants added by library updates can be missed.

### Known problems

Suggested replacements may not use correct path to enum
if it’s not present in the current scope.

### Example

```rust
match x {
    Foo::A => {},
    Foo::B => {},
    _ => {},
}
```

Use instead:

```rust
match x {
    Foo::A => {},
    Foo::B => {},
    Foo::C => {},
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L553

## maybe_infinite_iter

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for iteration that may be infinite.

### Why is this bad?

While there may be places where this is acceptable
(e.g., in event streams), in most cases this is simply an error.

### Known problems

The code may have a condition to stop iteration, but
this lint is not clever enough to analyze it.

### Example

```rust
let infinite_iter = 0..;
[0..].iter().zip(infinite_iter.take_while(|x| *x > 5));
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/infinite_iter.rs#L29

## mismatching_type_param_order

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.63.0

### What it does

Checks for type parameters which are positioned inconsistently between
a type definition and impl block. Specifically, a parameter in an impl
block which has the same name as a parameter in the type def, but is in
a different place.

### Why is this bad?

Type parameters are determined by their position rather than name.
Naming type parameters inconsistently may cause you to refer to the
wrong type parameter.

### Limitations

This lint only applies to impl blocks with simple generic params, e.g.
`A`. If there is anything more complicated, such as a tuple, it will be
ignored.

### Example

```rust
struct Foo<A, B> {
    x: A,
    y: B,
}
// inside the impl, B refers to Foo::A
impl<B, A> Foo<B, A> {}
```

Use instead:

```rust
struct Foo<A, B> {
    x: A,
    y: B,
}
impl<A, B> Foo<A, B> {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/mismatching_type_param_order.rs#L8

## missing_errors_doc

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.41.0

### What it does

Checks the doc comments of publicly visible functions that
return a `Result` type and warns if there is no `# Errors` section.

### Why is this bad?

Documenting the type of errors that can be returned from a
function can help callers write code to handle the errors appropriately.

### Examples

Since the following function returns a `Result` it has an `# Errors` section in
its doc comment:

```rust
/// # Errors
///
/// Will return `Err` if `filename` does not exist or the user does not have
/// permission to read it.
pub fn read(filename: String) -> io::Result<String> {
    unimplemented!();
}
```

### Configuration

- 

`check-private-items`:  Whether to also run the listed lints on private items.

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L426

## missing_fields_in_debug

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.70.0

### What it does

Checks for manual `core::fmt::Debug` implementations that do not use all fields.

### Why is this bad?

A common mistake is to forget to update manual `Debug` implementations when adding a new field
to a struct or a new variant to an enum.

At the same time, it also acts as a style lint to suggest using `core::fmt::DebugStruct::finish_non_exhaustive`
for the times when the user intentionally wants to leave out certain fields (e.g. to hide implementation details).

### Known problems

This lint works based on the `DebugStruct` helper types provided by the `Formatter`,
so this won’t detect `Debug` impls that use the `write!` macro.
Oftentimes there is more logic to a `Debug` impl if it uses `write!` macro, so it tries
to be on the conservative side and not lint in those cases in an attempt to prevent false positives.

This lint also does not look through function calls, so calling a function does not consider fields
used inside of that function as used by the `Debug` impl.

Lastly, it also ignores tuple structs as their `DebugTuple` formatter does not have a `finish_non_exhaustive`
method, as well as enums because their exhaustiveness is already checked by the compiler when matching on the enum,
making it much less likely to accidentally forget to update the `Debug` impl when adding a new variant.

### Example

```rust
use std::fmt;
struct Foo {
    data: String,
    // implementation detail
    hidden_data: i32
}
impl fmt::Debug for Foo {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter
            .debug_struct("Foo")
            .field("data", &self.data)
            .finish()
    }
}
```

Use instead:

```rust
use std::fmt;
struct Foo {
    data: String,
    // implementation detail
    hidden_data: i32
}
impl fmt::Debug for Foo {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        formatter
            .debug_struct("Foo")
            .field("data", &self.data)
            .finish_non_exhaustive()
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/missing_fields_in_debug.rs#L16

## missing_panics_doc

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.51.0

### What it does

Checks the doc comments of publicly visible functions that
may panic and warns if there is no `# Panics` section.

### Why is this bad?

Documenting the scenarios in which panicking occurs
can help callers who do not want to panic to avoid those situations.

### Examples

Since the following function may panic it has a `# Panics` section in
its doc comment:

```rust
/// # Panics
///
/// Will panic if y is 0
pub fn divide_by(x: i32, y: i32) -> i32 {
    if y == 0 {
        panic!("Cannot divide by 0")
    } else {
        x / y
    }
}
```

Individual panics within a function can be ignored with `#[expect]` or
`#[allow]`:

```rust
pub fn will_not_panic(x: usize) {
    #[expect(clippy::missing_panics_doc, reason = "infallible")]
    let y = NonZeroUsize::new(1).unwrap();

    // If any panics are added in the future the lint will still catch them
}
```

### Configuration

- 

`check-private-items`:  Whether to also run the listed lints on private items.

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L455

## must_use_candidate

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.40.0

### What it does

Checks for public functions that have no
`#[must_use]` attribute, but return something not already marked
must-use, have no mutable arg and mutate no statics.

### Why is this bad?

Not bad at all, this lint just shows places where
you could add the attribute.

### Known problems

The lint only checks the arguments for mutable
types without looking if they are actually changed. On the other hand,
it also ignores a broad range of potentially interesting side effects,
because we cannot decide whether the programmer intends the function to
be called for the side effect or the result. Expect many false
positives. At least we don’t lint if the result type is unit or already
`#[must_use]`.

### Examples

```rust
// this could be annotated with `#[must_use]`.
pub fn id<T>(t: T) -> T { t }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/functions/mod.rs#L146

## mut_mut

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for instances of `mut mut` references.

### Why is this bad?

This is usually just a typo or a misunderstanding of how references work.

### Example

```rust
let x = &mut &mut 1;

let mut x = &mut 1;
let y = &mut x;

fn foo(x: &mut &mut u32) {}
```

Use instead

```rust
let x = &mut 1;

let mut x = &mut 1;
let y = &mut *x; // reborrow

fn foo(x: &mut u32) {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/mut_mut.rs#L9

## naive_bytecount

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for naive byte counts

### Why is this bad?

The `bytecount`
crate has methods to count your bytes faster, especially for large slices.

### Known problems

If you have predominantly small slices, the
`bytecount::count(..)` method may actually be slower. However, if you can
ensure that less than 2³²-1 matches arise, the `naive_count_32(..)` can be
faster in those cases.

### Example

```rust
let count = vec.iter().filter(|x| **x == 0u8).count();
```

Use instead:

```rust
let count = bytecount::count(&vec, 0u8);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2613

## needless_bitwise_bool

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.54.0

### What it does

Checks for usage of bitwise and/or operators between booleans, where performance may be improved by using
a lazy and.

### Why is this bad?

The bitwise operators do not support short-circuiting, so it may hinder code performance.
Additionally, boolean logic “masked” as bitwise logic is not caught by lints like `unnecessary_fold`

### Known problems

This lint evaluates only when the right side is determined to have no side effects. At this time, that
determination is quite conservative.

### Example

```rust
let (x,y) = (true, false);
if x & !y {} // where both x and y are booleans
```

Use instead:

```rust
let (x,y) = (true, false);
if x && !y {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L856

## needless_continue

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

The lint checks for `if`-statements appearing in loops
that contain a `continue` statement in either their main blocks or their
`else`-blocks, when omitting the `else`-block possibly with some
rearrangement of code can make the code easier to understand.
The lint also checks if the last statement in the loop is a `continue`

### Why is this bad?

Having explicit `else` blocks for `if` statements
containing `continue` in their THEN branch adds unnecessary branching and
nesting to the code. Having an else block containing just `continue` can
also be better written by grouping the statements following the whole `if`
statement within the THEN block and omitting the else block completely.

### Example

```rust
while condition() {
    update_condition();
    if x {
        // ...
    } else {
        continue;
    }
    println!("Hello, world");
}
```

Could be rewritten as

```rust
while condition() {
    update_condition();
    if x {
        // ...
        println!("Hello, world");
    }
}
```

As another example, the following code

```rust
loop {
    if waiting() {
        continue;
    } else {
        // Do something useful
    }
    # break;
}
```

Could be rewritten as

```rust
loop {
    if waiting() {
        continue;
    }
    // Do something useful
    # break;
}
```

```rust

fn foo() -> ErrorKind { ErrorKind::NotFound }
for _ in 0..10 {
    match foo() {
        ErrorKind::NotFound => {
            eprintln!("not found");
            continue
        }
        ErrorKind::TimedOut => {
            eprintln!("timeout");
            continue
        }
        _ => {
            eprintln!("other error");
            continue
        }
    }
}
```

Could be rewritten as

```rust

fn foo() -> ErrorKind { ErrorKind::NotFound }
for _ in 0..10 {
    match foo() {
        ErrorKind::NotFound => {
            eprintln!("not found");
        }
        ErrorKind::TimedOut => {
            eprintln!("timeout");
        }
        _ => {
            eprintln!("other error");
        }
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/needless_continue.rs#L10

## needless_for_each

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.53.0

### What it does

Checks for usage of `for_each` that would be more simply written as a
`for` loop.

### Why is this bad?

`for_each` may be used after applying iterator transformers like
`filter` for better readability and performance. It may also be used to fit a simple
operation on one line.
But when none of these apply, a simple `for` loop is more idiomatic.

### Example

```rust
let v = vec![0, 1, 2];
v.iter().for_each(|elem| {
    println!("{elem}");
})
```

Use instead:

```rust
let v = vec![0, 1, 2];
for elem in &v {
    println!("{elem}");
}
```

### Known Problems

When doing things such as:

```rust
let v = vec![0, 1, 2];
v.iter().for_each(|elem| unsafe {
    libc::printf(c"%d\n".as_ptr(), elem);
});
```

This lint will not trigger.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/needless_for_each.rs#L13

## needless_pass_by_value

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for functions taking arguments by value, but not
consuming them in its
body.

### Why is this bad?

Taking arguments by reference is more flexible and can
sometimes avoid
unnecessary allocations.

### Known problems

- This lint suggests taking an argument by reference,
however sometimes it is better to let users decide the argument type
(by using `Borrow` trait, for example), depending on how the function is used.

### Example

```rust
fn foo(v: Vec<i32>) {
    assert_eq!(v.len(), 42);
}
```

should be

```rust
fn foo(v: &[i32]) {
    assert_eq!(v.len(), 42);
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/needless_pass_by_value.rs#L30

## needless_raw_string_hashes

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.72.0

### What it does

Checks for raw string literals with an unnecessary amount of hashes around them.

### Why is this bad?

It’s just unnecessary, and makes it look like there’s more escaping needed than is actually
necessary.

### Example

```rust
let r = r###"Hello, "world"!"###;
```

Use instead:

```rust
let r = r#"Hello, "world"!"#;
```

### Configuration

- 

`allow-one-hash-in-raw-strings`:  Whether to allow `r#""#` when `r""` can be used

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/raw_strings.rs#L12

## no_effect_underscore_binding

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.58.0

### What it does

Checks for binding to underscore prefixed variable without side-effects.

### Why is this bad?

Unlike dead code, these bindings are actually
executed. However, as they have no effect and shouldn’t be used further on, all they
do is make the code less readable.

### Example

```rust
let _i_serve_no_purpose = 1;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/no_effect.rs#L37

## no_mangle_with_rust_abi

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.69.0

### What it does

Checks for Rust ABI functions with the `#[no_mangle]` attribute.

### Why is this bad?

The Rust ABI is not stable, but in many simple cases matches
enough with the C ABI that it is possible to forget to add
`extern "C"` to a function called from C. Changes to the
Rust ABI can break this at any point.

### Example

```rust
 #[no_mangle]
 fn example(arg_one: u32, arg_two: usize) {}
```

Use instead:

```rust
 #[no_mangle]
 extern "C" fn example(arg_one: u32, arg_two: usize) {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/no_mangle_with_rust_abi.rs#L10

## non_std_lazy_statics

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.86.0

### What it does

Lints when `once_cell::sync::Lazy` or `lazy_static!` are used to define a static variable,
and suggests replacing such cases with `std::sync::LazyLock` instead.

Note: This lint will not trigger in crate with `no_std` context, or with MSRV < 1.80.0. It
also will not trigger on `once_cell::sync::Lazy` usage in crates which use other types
from `once_cell`, such as `once_cell::race::OnceBox`.

### Why restrict this?

- Reduces the need for an extra dependency

- Enforce convention of using standard library types when possible

### Example

```rust
lazy_static! {
    static ref FOO: String = "foo".to_uppercase();
}
static BAR: once_cell::sync::Lazy<String> = once_cell::sync::Lazy::new(|| "BAR".to_lowercase());
```

Use instead:

```rust
static FOO: std::sync::LazyLock<String> = std::sync::LazyLock::new(|| "FOO".to_lowercase());
static BAR: std::sync::LazyLock<String> = std::sync::LazyLock::new(|| "BAR".to_lowercase());
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/non_std_lazy_statics.rs#L16

## nonminimal_bool

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for boolean expressions that can be written more
concisely.

### Why is this bad?

Readability of boolean expressions suffers from
unnecessary duplication.

### Known problems

Ignores short circuiting behavior of `||` and
`&&`. Ignores `|`, `&` and `^`.

Creates a big toll on performance, only enable sporadically

### Example

```rust
if a && true {}
if !(a == b) {}
```

Use instead:

```rust
if a {}
if a != b {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/booleans.rs#L20

## option_as_ref_cloned

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.77.0

### What it does

Checks for usage of `.as_ref().cloned()` and `.as_mut().cloned()` on `Option`s

### Why is this bad?

This can be written more concisely by cloning the `Option` directly.

### Example

```rust
fn foo(bar: &Option<Vec<u8>>) -> Option<Vec<u8>> {
    bar.as_ref().cloned()
}
```

Use instead:

```rust
fn foo(bar: &Option<Vec<u8>>) -> Option<Vec<u8>> {
    bar.clone()
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2945

## option_option

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `Option<Option<_>>` in function signatures and type
definitions

### Why is this bad?

`Option<_>` represents an optional value. `Option<Option<_>>`
represents an optional value which itself wraps an optional. This is logically the
same thing as an optional value but has an unneeded extra level of wrapping.

If you have a case where `Some(Some(_))`, `Some(None)` and `None` are distinct cases,
consider a custom `enum` instead, with clear names for each case.

### Example

```rust
fn get_data() -> Option<Option<u32>> {
    None
}
```

Better:

```rust
pub enum Contents {
    Data(Vec<u8>), // Was Some(Some(Vec<u8>))
    NotYetFetched, // Was Some(None)
    None,          // Was None
}

fn get_data() -> Contents {
    Contents::None
}
```

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/types/mod.rs#L120

## overly_complex_bool_expr

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for boolean expressions that contain terminals that
can be eliminated.

### Why is this bad?

This is most likely a logic bug.

### Known problems

Ignores short circuiting behavior.
Creates a big toll on performance, only enable sporadically

### Example

```rust
// The `b` is unnecessary, the expression is equivalent to `if a`.
if a && b || a { ... }
```

Use instead:

```rust
if a {}
```

### Past names

- logic_bug

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/booleans.rs#L52

## ptr_as_ptr

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.51.0

### What it does

Checks for `as` casts between raw pointers that don’t change their
constness, namely `*const T` to `*const U` and `*mut T` to `*mut U`.

### Why is this bad?

Though `as` casts between raw pointers are not terrible,
`pointer::cast` is safer because it cannot accidentally change the
pointer’s mutability, nor cast the pointer to other types like `usize`.

### Example

```rust
let ptr: *const u32 = &42_u32;
let mut_ptr: *mut u32 = &mut 42_u32;
let _ = ptr as *const i32;
let _ = mut_ptr as *mut i32;
```

Use instead:

```rust
let ptr: *const u32 = &42_u32;
let mut_ptr: *mut u32 = &mut 42_u32;
let _ = ptr.cast::<i32>();
let _ = mut_ptr.cast::<i32>();
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L699

## ptr_cast_constness

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.72.0

### What it does

Checks for `as` casts between raw pointers that change their constness, namely `*const T` to
`*mut T` and `*mut T` to `*const T`.

### Why is this bad?

Though `as` casts between raw pointers are not terrible, `pointer::cast_mut` and
`pointer::cast_const` are safer because they cannot accidentally cast the pointer to another
type. Or, when null pointers are involved, `null()` and `null_mut()` can be used directly.

### Example

```rust
let ptr: *const u32 = &42_u32;
let mut_ptr = ptr as *mut u32;
let ptr = mut_ptr as *const u32;
let ptr1 = std::ptr::null::<u32>() as *mut u32;
let ptr2 = std::ptr::null_mut::<u32>() as *const u32;
let ptr3 = std::ptr::null::<u32>().cast_mut();
let ptr4 = std::ptr::null_mut::<u32>().cast_const();
```

Use instead:

```rust
let ptr: *const u32 = &42_u32;
let mut_ptr = ptr.cast_mut();
let ptr = mut_ptr.cast_const();
let ptr1 = std::ptr::null_mut::<u32>();
let ptr2 = std::ptr::null::<u32>();
let ptr3 = std::ptr::null_mut::<u32>();
let ptr4 = std::ptr::null::<u32>();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L729

## ptr_offset_by_literal

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.94.0

### What it does

Checks for usage of the `offset` pointer method with an integer
literal.

### Why is this bad?

The `add` and `sub` methods more accurately express the intent.

### Example

```rust
let vec = vec![b'a', b'b', b'c'];
let ptr = vec.as_ptr();

unsafe {
    ptr.offset(-8);
}
```

Could be written:

```rust
let vec = vec![b'a', b'b', b'c'];
let ptr = vec.as_ptr();

unsafe {
    ptr.sub(8);
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3211

## pub_underscore_fields

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.77.0

### What it does

Checks whether any field of the struct is prefixed with an `_` (underscore) and also marked
`pub` (public)

### Why is this bad?

Fields prefixed with an `_` are inferred as unused, which suggests it should not be marked
as `pub`, because marking it as `pub` infers it will be used.

### Example

```rust
struct FileHandle {
    pub _descriptor: usize,
}
```

Use instead:

```rust
struct FileHandle {
    _descriptor: usize,
}
```

OR

```rust
struct FileHandle {
    pub descriptor: usize,
}
```

### Configuration

- 

`pub-underscore-fields-behavior`:  Lint “public” fields in a struct that are prefixed with an underscore based on their
exported visibility, or whether they are marked as “pub”.

(default: `"PubliclyExported"`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/pub_underscore_fields.rs#L11

## range_minus_one

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for inclusive ranges where 1 is subtracted from
the upper bound, e.g., `x..=(y-1)`.

### Why is this bad?

The code is more readable with an exclusive range
like `x..y`.

### Limitations

The lint is conservative and will trigger only when switching
from an inclusive to an exclusive range is provably safe from
a typing point of view. This corresponds to situations where
the range is used as an iterator, or for indexing.

### Example

```rust
for i in x..=(y-1) {
    // ..
}
```

Use instead:

```rust
for i in x..y {
    // ..
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/ranges.rs#L55

## range_plus_one

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for exclusive ranges where 1 is added to the
upper bound, e.g., `x..(y+1)`.

### Why is this bad?

The code is more readable with an inclusive range
like `x..=y`.

### Limitations

The lint is conservative and will trigger only when switching
from an exclusive to an inclusive range is provably safe from
a typing point of view. This corresponds to situations where
the range is used as an iterator, or for indexing.

### Known problems

Will add unnecessary pair of parentheses when the
expression is not wrapped in a pair but starts with an opening parenthesis
and ends with a closing one.
I.e., `let _ = (f()+1)..(f()+1)` results in `let _ = ((f()+1)..=f())`.

Also in many cases, inclusive ranges are still slower to run than
exclusive ranges, because they essentially add an extra branch that
LLVM may fail to hoist out of the loop.

### Example

```rust
for i in x..(y+1) {
    // ..
}
```

Use instead:

```rust
for i in x..=y {
    // ..
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/ranges.rs#L93

## redundant_closure_for_method_calls

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.35.0

### What it does

Checks for closures which only invoke a method on the closure
argument and can be replaced by referencing the method directly.

### Why is this bad?

It’s unnecessary to create the closure.

### Example

```rust
Some('a').map(|s| s.to_uppercase());
```

may be rewritten as

```rust
Some('a').map(char::to_uppercase);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/eta_reduction.rs#L46

## redundant_else

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.50.0

### What it does

Checks for `else` blocks that can be removed without changing semantics.

### Why is this bad?

The `else` block adds unnecessary indentation and verbosity.

### Known problems

Some may prefer to keep the `else` block for clarity.

### Example

```rust
fn my_func(count: u32) {
    if count == 0 {
        print!("Nothing to do");
        return;
    } else {
        print!("Moving on...");
    }
}
```

Use instead:

```rust
fn my_func(count: u32) {
    if count == 0 {
        print!("Nothing to do");
        return;
    }
    print!("Moving on...");
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/redundant_else.rs#L10

## ref_as_ptr

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.78.0

### What it does

Checks for casts of references to pointer using `as`
and suggests `std::ptr::from_ref` and `std::ptr::from_mut` instead.

### Why is this bad?

Using `as` casts may result in silently changing mutability or type.

### Example

```rust
let a_ref = &1;
let a_ptr = a_ref as *const _;
```

Use instead:

```rust
let a_ref = &1;
let a_ptr = std::ptr::from_ref(a_ref);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L765

## ref_binding_to_reference

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.54.0

### What it does

Checks for `ref` bindings which create a reference to a reference.

### Why is this bad?

The address-of operator at the use site is clearer about the need for a reference.

### Example

```rust
let x = Some("");
if let Some(ref x) = x {
    // use `x` here
}
```

Use instead:

```rust
let x = Some("");
if let Some(x) = x {
    // use `&x` here
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/dereference.rs#L118

## ref_option

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.83.0

### What it does

Warns when a function signature uses `&Option<T>` instead of `Option<&T>`.

### Why is this bad?

More flexibility, better memory optimization, and more idiomatic Rust code.

`&Option<T>` in a function signature breaks encapsulation because the caller must own T
and move it into an Option to call with it. When returned, the owner must internally store
it as `Option<T>` in order to return it.
At a lower level, `&Option<T>` points to memory with the `presence` bit flag plus the `T` value,
whereas `Option<&T>` is usually optimized
to a single pointer, so it may be more optimal.

See this YouTube video by
Logan Smith for an in-depth explanation of why this is important.

### Known problems

This lint recommends changing the function signatures, but it cannot
automatically change the function calls or the function implementations.

### Example

```rust
// caller uses  foo(&opt)
fn foo(a: &Option<String>) {}
fn bar(&self) -> &Option<String> { &None }
```

Use instead:

```rust
// caller should use  `foo1(opt.as_ref())`
fn foo1(a: Option<&String>) {}
// better yet, use string slice  `foo2(opt.as_deref())`
fn foo2(a: Option<&str>) {}
fn bar(&self) -> Option<&String> { None }
```

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/functions/mod.rs#L280

## ref_option_ref

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.49.0

### What it does

Checks for usage of `&Option<&T>`.

### Why is this bad?

Since `&` is Copy, it’s useless to have a
reference on `Option<&T>`.

### Known problems

It may be irrelevant to use this lint on
public API code as it will make a breaking change to apply it.

### Example

```rust
let x: &Option<&u32> = &Some(&0u32);
```

Use instead:

```rust
let x: Option<&u32> = Some(&0u32);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/ref_option_ref.rs#L9

## return_self_not_must_use

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.59.0

### What it does

This lint warns when a method returning `Self` doesn’t have the `#[must_use]` attribute.

### Why is this bad?

Methods returning `Self` often create new values, having the `#[must_use]` attribute
prevents users from “forgetting” to use the newly created value.

The `#[must_use]` attribute can be added to the type itself to ensure that instances
are never forgotten. Functions returning a type marked with `#[must_use]` will not be
linted, as the usage is already enforced by the type attribute.

### Limitations

This lint is only applied on methods taking a `self` argument. It would be mostly noise
if it was added on constructors for example.

### Example

```rust
pub struct Bar;
impl Bar {
    // Missing attribute
    pub fn bar(&self) -> Self {
        Self
    }
}
```

Use instead:

```rust
// It's better to have the `#[must_use]` attribute on the method like this:
pub struct Bar;
impl Bar {
    #[must_use]
    pub fn bar(&self) -> Self {
        Self
    }
}

// Or on the type definition like this:
#[must_use]
pub struct Bar;
impl Bar {
    pub fn bar(&self) -> Self {
        Self
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/return_self_not_must_use.rs#L11

## same_functions_in_if_condition

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.41.0

### What it does

Checks for consecutive `if`s with the same function call.

### Why is this bad?

This is probably a copy & paste error.
Despite the fact that function can have side effects and `if` works as
intended, such an approach is implicit and can be considered a “code smell”.

### Example

```rust
if foo() == bar {
    …
} else if foo() == bar {
    …
}
```

This probably should be:

```rust
if foo() == bar {
    …
} else if foo() == baz {
    …
}
```

or if the original code was not a typo and called function mutates a state,
consider move the mutation out of the `if` condition to avoid similarity to
a copy & paste error:

```rust
let first = foo();
if first == bar {
    …
} else {
    let second = foo();
    if second == bar {
    …
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/ifs/mod.rs#L119

## same_length_and_capacity

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.94.0

### What it does

Checks for usages of `Vec::from_raw_parts` and `String::from_raw_parts`
where the same expression is used for the length and the capacity.

### Why is this bad?

If the same expression is being passed for the length and
capacity, it is most likely a semantic error. In the case of a
Vec, for example, the only way to end up with one that has
the same length and capacity is by going through a boxed slice,
e.g. `Box::from(some_vec)`, which shrinks the capacity to match
the length.

### Example

```rust
#![feature(vec_into_raw_parts)]
let mut original: Vec::<i32> = Vec::with_capacity(20);
original.extend([1, 2, 3, 4, 5]);

let (ptr, mut len, cap) = original.into_raw_parts();

// I will add three more integers:
unsafe {
   let ptr = ptr as *mut i32;

   for i in 6..9 {
       *ptr.add(i - 1) = i as i32;
       len += 1;
   }
}

// But I forgot the capacity was separate from the length:
let reconstructed = unsafe { Vec::from_raw_parts(ptr, len, len) };
```

Use instead:

```rust
#![feature(vec_into_raw_parts)]
let mut original: Vec::<i32> = Vec::with_capacity(20);
original.extend([1, 2, 3, 4, 5]);

let (ptr, mut len, cap) = original.into_raw_parts();

// I will add three more integers:
unsafe {
   let ptr = ptr as *mut i32;

   for i in 6..9 {
       *ptr.add(i - 1) = i as i32;
       len += 1;
   }
}

// This time, leverage the previously saved capacity:
let reconstructed = unsafe { Vec::from_raw_parts(ptr, len, cap) };
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/same_length_and_capacity.rs#L9

## self_only_used_in_recursion

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.92.0

### What it does

Checks for `self` receiver that is only used in recursion with no side-effects.

### Why is this bad?

It may be possible to remove the `self` argument, allowing the function to be
used without an object of type `Self`.

### Example

```rust
struct Foo;
impl Foo {
    fn f(&self, n: u32) -> u32 {
        if n == 0 {
            1
        } else {
            n * self.f(n - 1)
        }
    }
}
```

Use instead:

```rust
struct Foo;
impl Foo {
    fn f(n: u32) -> u32 {
        if n == 0 {
            1
        } else {
            n * Self::f(n - 1)
        }
    }
}
```

### Known problems

Too many code paths in the linting code are currently untested and prone to produce false
positives or are prone to have performance implications.

In some cases, this would not catch all useless arguments.

```rust
struct Foo;
impl Foo {
    fn foo(&self, a: usize) -> usize {
        let f = |x| x;

        if a == 0 {
            1
        } else {
            f(self).foo(a)
        }
    }
}
```

For example, here `self` is only used in recursion, but the lint would not catch it.

List of some examples that can not be caught:

- binary operation of non-primitive types

- closure usage

- some `break` relative operations

- struct pattern binding

Also, when you recurse the function name with path segments, it is not possible to detect.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/only_used_in_recursion.rs#L89

## semicolon_if_nothing_returned

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.52.0

### What it does

Looks for blocks of expressions and fires if the last expression returns
`()` but is not followed by a semicolon.

### Why is this bad?

The semicolon might be optional but when extending the block with new
code, it doesn’t require a change in previous last line.

### Example

```rust
println!("Hello world")
```

Use instead:

```rust
println!("Hello world");
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/semicolon_if_nothing_returned.rs#L9

## should_panic_without_expect

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.74.0

### What it does

Checks for `#[should_panic]` attributes without specifying the expected panic message.

### Why is this bad?

The expected panic message should be specified to ensure that the test is actually
panicking with the expected message, and not another unrelated panic.

### Example

```rust
fn random() -> i32 { 0 }

#[should_panic]
#[test]
fn my_test() {
    let _ = 1 / random();
}
```

Use instead:

```rust
fn random() -> i32 { 0 }

#[should_panic = "attempt to divide by zero"]
#[test]
fn my_test() {
    let _ = 1 / random();
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/attrs/mod.rs#L445

## similar_names

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for names that are very similar and thus confusing. In particular,
the lint checks for names with a single character change.

It does not warn about names that have a single additional character at
the beginning nor the end; only insertions in the middle are considered.

Note: this lint looks for similar names throughout each
scope. To allow it, you need to allow it on the scope
level, not on the name that is reported.

### Why is this bad?

It’s hard to distinguish between names that differ only
by a single character.

### Example

```rust
let checked_exp = something;
let checked_eap = something_else;
```

### Example 2

```rust
let orange = val;
let ornange = val2;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/non_expressive_names.rs#L52

## single_char_pattern

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for string methods that receive a single-character
`str` as an argument, e.g., `_.split("x")`.

### Why is this bad?

While this can make a perf difference on some systems,
benchmarks have proven inconclusive. But at least using a
char literal makes it clear that we are looking at a single
character.

### Known problems

Does not catch multi-byte unicode characters. This is by
design, on many machines, splitting by a non-ascii char is
actually slower. Please do your own measurements instead of
relying solely on the results of this lint.

### Example

```rust
_.split("x");
```

Use instead:

```rust
_.split('x');
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/string_patterns.rs#L42

## single_match_else

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for matches with two arms where an `if let else` will
usually suffice.

### Why is this bad?

Just readability – `if let` nests less than a `match`.

### Known problems

Personal style preferences may differ.

### Example

Using `match`:

```rust
match x {
    Some(ref foo) => bar(foo),
    _ => bar(&other_ref),
}
```

Using `if let` with `else`:

```rust
if let Some(ref foo) = x {
    bar(foo);
} else {
    bar(&other_ref);
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L865

## stable_sort_primitive

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.47.0

### What it does

When sorting primitive values (integers, bools, chars, as well
as arrays, slices, and tuples of such items), it is typically better to
use an unstable sort than a stable sort.

### Why is this bad?

Typically, using a stable sort consumes more memory and cpu cycles.
Because values which compare equal are identical, preserving their
relative order (the guarantee that a stable sort provides) means
nothing, while the extra costs still apply.

### Known problems

As pointed out in
issue #8241,
a stable sort can instead be significantly faster for certain scenarios
(eg. when a sorted vector is extended with new data and resorted).

For more information and benchmarking results, please refer to the
issue linked above.

### Example

```rust
let mut vec = vec![2, 1, 3];
vec.sort();
```

Use instead:

```rust
let mut vec = vec![2, 1, 3];
vec.sort_unstable();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3773

## str_split_at_newline

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.77.0

### What it does

Checks for usages of `str.trim().split("\n")` and `str.trim().split("\r\n")`.

### Why is this bad?

Hard-coding the line endings makes the code less compatible. `str.lines` should be used instead.

### Example

```rust
"some\ntext\nwith\nnewlines\n".trim().split('\n');
```

Use instead:

```rust
"some\ntext\nwith\nnewlines\n".lines();
```

### Known Problems

This lint cannot detect if the split is intentionally restricted to a single type of newline (`"\n"` or
`"\r\n"`), for example during the parsing of a specific file format in which precisely one newline type is
valid.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3811

## string_add_assign

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for string appends of the form `x = x + y` (without
`let`!).

### Why is this bad?

It’s not really bad, but some people think that the
`.push_str(_)` method is more readable.

### Example

```rust
let mut x = "Hello".to_owned();
x = x + ", World";

// More readable
x += ", World";
x.push_str(", World");
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/strings.rs#L69

## struct_excessive_bools

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.43.0

### What it does

Checks for excessive
use of bools in structs.

### Why is this bad?

Excessive bools in a struct is often a sign that
the type is being used to represent a state
machine, which is much better implemented as an
enum.

The reason an enum is better for state machines
over structs is that enums more easily forbid
invalid states.

Structs with too many booleans may benefit from refactoring
into multi variant enums for better readability and API.

### Example

```rust
struct S {
    is_pending: bool,
    is_processing: bool,
    is_finished: bool,
}
```

Use instead:

```rust
enum S {
    Pending,
    Processing,
    Finished,
}
```

### Configuration

- 

`max-struct-bools`:  The maximum number of bool fields a struct can have

(default: `3`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/excessive_bools.rs#L65

## struct_field_names

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.75.0

### What it does

Detects struct fields that are prefixed or suffixed
by the same characters or the name of the struct itself.

### Why is this bad?

Information common to all struct fields is better represented in the struct name.

### Limitations

Characters with no casing will be considered when comparing prefixes/suffixes
This applies to numbers and non-ascii characters without casing
e.g. `foo1` and `foo2` is considered to have different prefixes
(the prefixes are `foo1` and `foo2` respectively), as also `bar螃`, `bar蟹`

### Example

```rust
struct Cake {
    cake_sugar: u8,
    cake_flour: u8,
    cake_eggs: u8
}
```

Use instead:

```rust
struct Cake {
    sugar: u8,
    flour: u8,
    eggs: u8
}
```

### Configuration

- 

`struct-field-name-threshold`:  The minimum number of struct fields for the lints about field names to trigger

(default: `3`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/item_name_repetitions.rs#L122

## too_many_lines

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.34.0

### What it does

Checks for functions with a large amount of lines.

### Why is this bad?

Functions with a lot of lines are harder to understand
due to having to look at a larger amount of code to understand what the
function is doing. Consider splitting the body of the function into
multiple functions.

### Example

```rust
fn im_too_long() {
    println!("");
    // ... 100 more LoC
    println!("");
}
```

### Configuration

- 

`too-many-lines-threshold`:  The maximum number of lines a function or method can have

(default: `100`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/functions/mod.rs#L481

## transmute_ptr_to_ptr

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for transmutes from a pointer to a pointer, or
from a reference to a reference.

### Why is this bad?

Transmutes are dangerous, and these can instead be
written as casts.

### Example

```rust
let ptr = &1u32 as *const u32;
unsafe {
    // pointer-to-pointer transmute
    let _: *const f32 = std::mem::transmute(ptr);
    // ref-ref transmute
    let _: &f32 = std::mem::transmute(&1u32);
}
// These can be respectively written:
let _ = ptr as *const f32;
let _ = unsafe{ &*(&1u32 as *const u32 as *const f32) };
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/transmute/mod.rs#L265

## trivially_copy_pass_by_ref

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for functions taking arguments by reference, where
the argument type is `Copy` and small enough to be more efficient to always
pass by value.

### Why is this bad?

In many calling conventions instances of structs will
be passed through registers if they fit into two or less general purpose
registers.

### Known problems

This lint is target dependent, some cases will lint on 64-bit targets but
not 32-bit or lower targets.

The configuration option `trivial_copy_size_limit` can be set to override
this limit for a project.

This lint attempts to allow passing arguments by reference if a reference
to that argument is returned. This is implemented by comparing the lifetime
of the argument and return value for equality. However, this can cause
false positives in cases involving multiple lifetimes that are bounded by
each other.

Also, it does not take account of other similar cases where getting memory addresses
matters; namely, returning the pointer to the argument in question,
and passing the argument, as both references and pointers,
to a function that needs the memory address. For further details, refer to
this issue
that explains a real case in which this false positive
led to an undefined behavior introduced with unsafe code.

### Example

```rust
fn foo(v: &u32) {}
```

Use instead:

```rust
fn foo(v: u32) {}
```

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

- 

`trivial-copy-size-limit`:  The maximum size (in bytes) to consider a `Copy` type for passing by value instead of by
reference.

(default: `target_pointer_width`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/pass_by_ref_or_value.rs#L56

## unchecked_time_subtraction

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.67.0

### What it does

Lints subtraction between an `Instant` and a `Duration`, or between two `Duration` values.

### Why is this bad?

Unchecked subtraction could cause underflow on certain platforms, leading to
unintentional panics.

### Example

```rust
let time_passed = Instant::now() - Duration::from_secs(5);
let dur1 = Duration::from_secs(3);
let dur2 = Duration::from_secs(5);
let diff = dur1 - dur2;
```

Use instead:

```rust
let time_passed = Instant::now().checked_sub(Duration::from_secs(5));
let dur1 = Duration::from_secs(3);
let dur2 = Duration::from_secs(5);
let diff = dur1.checked_sub(dur2);
```

### Past names

- unchecked_duration_subtraction

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/time_subtraction.rs#L44

## unicode_not_nfc

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for string literals that contain Unicode in a form
that is not equal to its
NFC-recomposition.

### Why is this bad?

If such a string is compared to another, the results
may be surprising.

### Example

You may not see it, but “à”“ and “à”“ aren’t the same string. The
former when escaped is actually `"a\u{300}"` while the latter is `"\u{e0}"`.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unicode.rs#L55

## uninlined_format_args

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.66.0

### What it does

Detect when a variable is not inlined in a format string,
and suggests to inline it.

### Why is this bad?

Non-inlined code is slightly more difficult to read and understand,
as it requires arguments to be matched against the format string.
The inlined syntax, where allowed, is simpler.

### Example

```rust
format!("{}", var);
format!("{:?}", var);
format!("{v:?}", v = var);
format!("{0} {0}", var);
format!("{0:1$}", var, width);
format!("{:.*}", prec, var);
```

Use instead:

```rust
format!("{var}");
format!("{var:?}");
format!("{var:?}");
format!("{var} {var}");
format!("{var:width$}");
format!("{var:.prec$}");
```

If `allow-mixed-uninlined-format-args` is set to `false` in clippy.toml,
the following code will also trigger the lint:

```rust
format!("{} {}", var, 1+2);
```

Use instead:

```rust
format!("{var} {}", 1+2);
```

### Known Problems

If a format string contains a numbered argument that cannot be inlined
nothing will be suggested, e.g. `println!("{0}={1}", var, 1+2)`.

### Configuration

- 

`allow-mixed-uninlined-format-args`:  Whether to allow mixed uninlined format args, e.g. `format!("{} {}", a, foo.bar)`

(default: `true`)

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/format_args.rs#L115

## unnecessary_box_returns

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.70.0

### What it does

Checks for a return type containing a `Box<T>` where `T` implements `Sized`

The lint ignores `Box<T>` where `T` is larger than `unnecessary_box_size`,
as returning a large `T` directly may be detrimental to performance.

### Why is this bad?

It’s better to just return `T` in these cases. The caller may not need
the value to be boxed, and it’s expensive to free the memory once the
`Box<T>` been dropped.

### Example

```rust
fn foo() -> Box<String> {
    Box::new(String::from("Hello, world!"))
}
```

Use instead:

```rust
fn foo() -> String {
    String::from("Hello, world!")
}
```

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

- 

`unnecessary-box-size`:  The byte size a `T` in `Box<T>` can have, below which it triggers the `clippy::unnecessary_box` lint

(default: `128`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unnecessary_box_returns.rs#L10

## unnecessary_debug_formatting

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.87.0

### What it does

Checks for `Debug` formatting (`{:?}`) applied to an `OsStr` or `Path`.

This includes:

- Format specifiers on `format_args!()` (width, precision have no effect)

- Format width too small for the format trait (e.g. `{:#02x}` outputs “0x1”
so width 2 has no effect; minimum is 4 for alternate hex/octal/binary)

### Why is this bad?

Rust doesn’t guarantee what `Debug` formatting looks like, and it could
change in the future. `OsStr`s and `Path`s can be `Display` formatted
using their `display` methods.

Furthermore, with `Debug` formatting, certain characters are escaped.
Thus, a `Debug` formatted `Path` is less likely to be clickable.

### Example

```rust
let path = Path::new("...");
println!("The path is {:?}", path);
```

Use instead:

```rust
let path = Path::new("…");
println!("The path is {}", path.display());
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/format_args.rs#L172

## unnecessary_join

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.61.0

### What it does

Checks for usage of `.collect::<Vec<String>>().join("")` on iterators.

### Why is this bad?

`.collect::<String>()` is more concise and might be more performant

### Example

```rust
let vector = vec!["hello",  "world"];
let output = vector.iter().map(|item| item.to_uppercase()).collect::<Vec<String>>().join("");
println!("{}", output);
```

The correct use would be:

```rust
let vector = vec!["hello",  "world"];
let output = vector.iter().map(|item| item.to_uppercase()).collect::<String>();
println!("{}", output);
```

### Known problems

While `.collect::<String>()` is sometimes more performant, there are cases where
using `.collect::<String>()` over `.collect::<Vec<String>>().join("")`
will prevent loop unrolling and will result in a negative performance impact.

Additionally, differences have been observed between aarch64 and x86_64 assembly output,
with aarch64 tending to producing faster assembly in more cases when using `.collect::<String>()`

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4487

## unnecessary_literal_bound

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.84.0

### What it does

Detects functions that are written to return `&str` that could return `&'static str` but instead return a `&'a str`.

### Why is this bad?

This leaves the caller unable to use the `&str` as `&'static str`, causing unnecessary allocations or confusion.
This is also most likely what you meant to write.

### Example

```rust
impl MyType {
    fn returns_literal(&self) -> &str {
        "Literal"
    }
}
```

Use instead:

```rust
impl MyType {
    fn returns_literal(&self) -> &'static str {
        "Literal"
    }
}
```

Or, in case you may return a non-literal `str` in future:

```rust
impl MyType {
    fn returns_literal<'a>(&'a self) -> &'a str {
        "Literal"
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unnecessary_literal_bound.rs#L12

## unnecessary_semicolon

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.86.0

### What it does

Checks for the presence of a semicolon at the end of
a `match` or `if` statement evaluating to `()`.

### Why is this bad?

The semicolon is not needed, and may be removed to
avoid confusion and visual clutter.

### Example

```rust
if a > 10 {
    println!("a is greater than 10");
};
```

Use instead:

```rust
if a > 10 {
    println!("a is greater than 10");
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unnecessary_semicolon.rs#L8

## unnecessary_trailing_comma

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.95.0

### What it does

Suggests removing an unnecessary trailing comma before the closing parenthesis in
single-line macro invocations.

### Why is this bad?

The trailing comma is redundant and removing it is more consistent with how
`rustfmt` formats regular function calls.

### Known limitations

This lint currently only runs on format-like macros (e.g. `format!`, `println!`,
`write!`) because it relies on format-argument parsing; applying it to arbitrary
user macros could cause incorrect suggestions. It may be extended to other
macros in the future. Only single-line macro invocations are linted.

### Example

```rust
println!("Foo={}", 1,);
```

Use instead:

```rust
println!("Foo={}", 1);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/format_args.rs#L207

## unnecessary_wraps

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.50.0

### What it does

Checks for private functions that only return `Ok` or `Some`.

### Why is this bad?

It is not meaningful to wrap values when no `None` or `Err` is returned.

### Known problems

There can be false positives if the function signature is designed to
fit some external requirement.

### Example

```rust
fn get_cool_number(a: bool, b: bool) -> Option<i32> {
    if a && b {
        return Some(50);
    }
    if a {
        Some(0)
    } else {
        Some(10)
    }
}
```

Use instead:

```rust
fn get_cool_number(a: bool, b: bool) -> i32 {
    if a && b {
        return 50;
    }
    if a {
        0
    } else {
        10
    }
}
```

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unnecessary_wraps.rs#L19

## unnested_or_patterns

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.46.0

### What it does

Checks for unnested or-patterns, e.g., `Some(0) | Some(2)` and
suggests replacing the pattern with a nested one, `Some(0 | 2)`.

Another way to think of this is that it rewrites patterns in
disjunctive normal form (DNF) into conjunctive normal form (CNF).

### Why is this bad?

In the example above, `Some` is repeated, which unnecessarily complicates the pattern.

### Example

```rust
if let Some(0) | Some(2) = Some(0) {}
```

Use instead:

```rust
if let Some(0 | 2) = Some(0) {}
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unnested_or_patterns.rs#L21

## unreadable_literal

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Warns if a long integral or floating-point constant does
not contain underscores.

### Why is this bad?

Reading long numbers is difficult without separators.

### Example

```rust
61864918973511
```

Use instead:

```rust
61_864_918_973_511
```

### Configuration

- 

`unreadable-literal-lint-fractions`:  Should the fraction of a decimal be linted to include separators.

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/literal_representation.rs#L101

## unsafe_derive_deserialize

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.45.0

### What it does

Checks for deriving `serde::Deserialize` on a type that
has methods using `unsafe`.

### Why is this bad?

Deriving `serde::Deserialize` will create a constructor
that may violate invariants held by another constructor.

### Example

```rust
use serde::Deserialize;

#[derive(Deserialize)]
pub struct Foo {
    // ..
}

impl Foo {
    pub fn new() -> Self {
        // setup here ..
    }

    pub unsafe fn parts() -> (&str, &str) {
        // assumes invariants hold
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/derive/mod.rs#L152

## unused_async

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.54.0

### What it does

Checks for functions that are declared `async` but have no `.await`s inside of them.

### Why is this bad?

Async functions with no async code create overhead, both mentally and computationally.
Callers of async methods either need to be calling from an async function themselves or run it on an executor, both of which
causes runtime overhead and hassle for the caller.

### Example

```rust
async fn get_random_number() -> i64 {
    4 // Chosen by fair dice roll. Guaranteed to be random.
}
let number_future = get_random_number();
```

Use instead:

```rust
fn get_random_number_improved() -> i64 {
    4 // Chosen by fair dice roll. Guaranteed to be random.
}
let number_future = async { get_random_number_improved() };
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unused_async.rs#L17

## unused_async_trait_impl

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.98.0

### What it does

Checks for trait method implementations that are declared `async` but have no `.await`s inside of them.

### Why is this bad?

Async functions with no async code create computational overhead.
Even though the trait requires the method to return a future,
returning a `core::future::ready` with the result is more efficient
as it reduces the number of states in the Future state machine by at least one.

Note that the behaviour is slightly different when using `core::future::ready`,
as the value is computed immediately and stored in a future for later retrieval at the first (and only valid) call to `poll`.
An `async` block generates code that completely defers the computation of this value until the Future is polled.

### Example

```rust
trait AsyncTrait {
    async fn get_random_number() -> i64;
}

impl AsyncTrait for () {
    async fn get_random_number() -> i64 {
        4 // Chosen by fair dice roll. Guaranteed to be random.
    }
}
```

Use instead:

```rust
trait AsyncTrait {
    async fn get_random_number() -> i64;
}

impl AsyncTrait for () {
    fn get_random_number() -> impl Future<Output = i64> {
        core::future::ready(4) // Chosen by fair dice roll. Guaranteed to be random.
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unused_async.rs#L47

## unused_self

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.40.0

### What it does

Checks methods that contain a `self` argument but don’t use it

### Why is this bad?

It may be clearer to define the method as an associated function instead
of an instance method if it doesn’t require `self`.

### Example

```rust
struct A;
impl A {
    fn method(&self) {}
}
```

Could be written:

```rust
struct A;
impl A {
    fn method() {}
}
```

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unused_self.rs#L8

## used_underscore_binding

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for the use of bindings with a single leading
underscore.

### Why is this bad?

A single leading underscore is usually used to indicate
that a binding will not be used. Using such a binding breaks this
expectation.

### Known problems

The lint does not work properly with desugaring and
macro, it has been allowed in the meantime.

### Example

```rust
let _x = 0;
let y = _x + 1; // Here we are using `_x`, even though it has a leading
                // underscore. We should rename `_x` to `x`
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/misc.rs#L33

## used_underscore_items

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.83.0

### What it does

Checks for the use of item with a single leading
underscore.

### Why is this bad?

A single leading underscore is usually used to indicate
that a item will not be used. Using such a item breaks this
expectation.

### Example

```rust
fn _foo() {}

struct _FooStruct {}

fn main() {
    _foo();
    let _ = _FooStruct{};
}
```

Use instead:

```rust
fn foo() {}

struct FooStruct {}

fn main() {
    foo();
    let _ = FooStruct{};
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/misc.rs#L59

## verbose_bit_mask

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for bit masks that can be replaced by a call
to `trailing_zeros`

### Why is this bad?

`x.trailing_zeros() >= 4` is much clearer than `x & 15 == 0`

### Example

```rust
if x & 0b1111 == 0 { }
```

Use instead:

```rust
if x.trailing_zeros() >= 4 { }
```

### Configuration

- 

`verbose-bit-mask-threshold`:  The maximum allowed size of a bit mask before suggesting to use ‘trailing_zeros’

(default: `1`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L1000

## wildcard_imports

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.43.0

### What it does

Checks for wildcard imports `use _::*`.

### Why is this bad?

wildcard imports can pollute the namespace. This is especially bad if
you try to import something through a wildcard, that already has been imported by name from
a different source:

```rust
use crate1::foo; // Imports a function named foo
use crate2::*; // Has a function named foo

foo(); // Calls crate1::foo
```

This can lead to confusing error messages at best and to unexpected behavior at worst.

### Exceptions

Wildcard imports are allowed from modules that their name contains `prelude`. Many crates
(including the standard library) provide modules named “prelude” specifically designed
for wildcard import.

Wildcard imports reexported through `pub use` are also allowed.

`use super::*` is allowed in test modules. This is defined as any module with “test” in the name.

These exceptions can be disabled using the `warn-on-all-wildcard-imports` configuration flag.

### Known problems

If macros are imported through the wildcard, this macro is not included
by the suggestion and has to be added by hand.

Applying the suggestion when explicit imports of the things imported with a glob import
exist, may result in `unused_imports` warnings.

### Example

```rust
use crate1::*;

foo();
```

Use instead:

```rust
use crate1::foo;

foo();
```

### Configuration

- `allowed-wildcard-imports`:  List of path segments allowed to have wildcard imports.

#### Example

```rust
allowed-wildcard-imports = [ "utils", "common" ]
```

#### Noteworthy

- This configuration has no effects if used with `warn_on_all_wildcard_imports = true`.

- Paths with any segment that containing the word ‘prelude’
are already allowed by default.

(default: `[]`)

- 

`warn-on-all-wildcard-imports`:  Whether to emit warnings on all wildcard imports, including those from `prelude`, from `super` in tests,
or for `pub use` reexports.

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/wildcard_imports.rs#L48

## with_capacity_zero

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.98.0

### What it does

Checks for calls to `with_capacity(0)` on standard library collections and types.

### Why is this bad?

Calling `with_capacity(0)` does not allocate any initial capacity and behaves identically
to `new()`. Using `new()` is more idiomatic, concise, and is a `const fn` for these types.

### Example

```rust
let v: Vec<i32> = Vec::with_capacity(0);
let s = String::with_capacity(0);
```

Use instead:

```rust
let v: Vec<i32> = Vec::new();
let s = String::new();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/with_capacity_zero.rs#L10

## zero_sized_map_values

Grupo: `pedantic` · Nível padrão: `allow` · Adicionado em: 1.50.0

### What it does

Checks for maps with zero-sized value types anywhere in the code.

### Why is this bad?

Since there is only a single value for a zero-sized type, a map
containing zero sized values is effectively a set. Using a set in that case improves
readability and communicates intent more clearly.

### Known problems

- A zero-sized type cannot be recovered later if it contains private fields.

- This lints the signature of public items

### Example

```rust
fn unique_words(text: &str) -> HashMap<&str, ()> {
    todo!();
}
```

Use instead:

```rust
fn unique_words(text: &str) -> HashSet<&str> {
    todo!();
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/zero_sized_map_values.rs#L10
