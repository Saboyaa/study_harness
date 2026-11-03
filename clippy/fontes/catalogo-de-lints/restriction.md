# Catálogo de lints do Clippy — grupo `restriction`

## absolute_paths

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.73.0

### What it does

Checks for usage of items through absolute paths, like `std::f64::consts::PI`.

### Why restrict this?

Many codebases have their own style when it comes to importing, but one that is seldom used
is using absolute paths everywhere. This is generally considered unidiomatic, and you
should add a `use` statement.

The default maximum segments (2) is pretty strict, you may want to increase this in
`clippy.toml`.

Note: One exception to this is code from macro expansion - this does not lint such cases, as
using absolute paths is the proper way of referencing items in one.

### Known issues

There are currently a few cases which are not caught by this lint:

- Macro calls. e.g. `path::to::macro!()`

- Derive macros. e.g. `#[derive(path::to::macro)]`

- Attribute macros. e.g. `#[path::to::macro]`

### Example

```rust
let x = std::f64::consts::PI;
```

Use any of the below instead, or anything else:

```rust
use std::f64;
use std::f64::consts;
use std::f64::consts::PI;
let x = f64::consts::PI;
let x = consts::PI;
let x = PI;
use std::f64::consts as f64_consts;
let x = f64_consts::PI;
```

### Configuration

- 

`absolute-paths-allowed-crates`:  Which crates to allow absolute paths from

(default: `[]`)

- 

`absolute-paths-max-segments`:  The maximum number of segments a path can have before being linted, anything above this will
be linted.

(default: `2`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/absolute_paths.rs#L12

## alloc_instead_of_core

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.64.0

### What it does

Finds items imported through `alloc` when available through `core`.

### Why restrict this?

Crates which have `no_std` compatibility and may optionally require alloc may wish to ensure types are
imported from core to ensure disabling `alloc` does not cause the crate to fail to compile. This lint
is also useful for crates migrating to become `no_std` compatible.

### Known problems

The lint is only partially aware of the required MSRV for items that were originally in `std` but moved
to `core`.

### Example

```rust
use alloc::slice::from_ref;
```

Use instead:

```rust
use core::slice::from_ref;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/std_instead_of_core.rs#L15

## allow_attributes

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.70.0

### What it does

Checks for usage of the `#[allow]` attribute and suggests replacing it with
the `#[expect]` attribute (See RFC 2383)

This lint only warns outer attributes (`#[allow]`), as inner attributes
(`#![allow]`) are usually used to enable or disable lints on a global scale.

`#[allow]` written inside a macro is ignored because `#[expect]` has to be
completed in every expansion

### Why is this bad?

`#[expect]` attributes suppress the lint emission, but emit a warning, if
the expectation is unfulfilled. This can be useful to be notified when the
lint is no longer triggered.

### Example

```rust
#[allow(unused_mut)]
fn foo() -> usize {
    let mut a = Vec::new();
    a.len()
}
```

Use instead:

```rust
#[expect(unused_mut)]
fn foo() -> usize {
    let mut a = Vec::new();
    a.len()
}
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/attrs/mod.rs#L27

## allow_attributes_without_reason

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.61.0

### What it does

Checks for attributes that allow lints without a reason.

### Why restrict this?

Justifying each `allow` helps readers understand the reasoning,
and may allow removing `allow` attributes if their purpose is obsolete.

### Example

```rust
#![allow(clippy::some_lint)]
```

Use instead:

```rust
#![allow(clippy::some_lint, reason = "False positive rust-lang/rust-clippy#1002020")]
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/attrs/mod.rs#L65

## arbitrary_source_item_ordering

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.84.0

### What it does

Confirms that items are sorted in source files as per configuration.

### Why restrict this?

Keeping a consistent ordering throughout the codebase helps with working
as a team, and possibly improves maintainability of the codebase. The
idea is that by defining a consistent and enforceable rule for how
source files are structured, less time will be wasted during reviews on
a topic that is (under most circumstances) not relevant to the logic
implemented in the code. Sometimes this will be referred to as
“bikeshedding”.

The content of items with a representation clause attribute, such as
`#[repr(C)]` will not be checked, as the order of their fields or
variants might be dictated by an external API (application binary
interface).

### Default Ordering and Configuration

As there is no generally applicable rule, and each project may have
different requirements, the lint can be configured with high
granularity. The configuration is split into two stages:

- Which item kinds that should have an internal order enforced.

- Individual ordering rules per item kind.

The item kinds that can be linted are:

- Module (with customized groupings, alphabetical within - configurable)

- Trait (with customized order of associated items, alphabetical within)

- Enum, Impl, Struct (purely alphabetical)

#### Module Item Order

Due to the large variation of items within modules, the ordering can be
configured on a very granular level. Item kinds can be grouped together
arbitrarily, items within groups will be ordered alphabetically. The
following table shows the default groupings:
GroupItem Kinds
`modules``mod`, `foreign_mod`
`use``use`
`macros``macro`
`global_asm``global_asm`
`UPPER_SNAKE_CASE``static`, `const`
`PascalCase``ty_alias`, `opaque_ty`, `enum`, `struct`, `union`, `trait`, `trait_alias`, `impl`
`lower_snake_case``fn`

The groups’ names are arbitrary and can be changed to suit the
conventions that should be enforced for a specific project.

All item kinds must be accounted for to create an enforceable linting
rule set. Following are some example configurations that may be useful.

Example: module inclusions and use statements to be at the top

```rust
module-item-order-groupings = [
    [ "modules", [ "extern_crate", "mod", "foreign_mod" ], ],
    [ "use", [ "use", ], ],
    [ "everything_else", [ "macro", "global_asm", "static", "const", "ty_alias", "enum", "struct", "union", "trait", "trait_alias", "impl", "fn", ], ],
]
```

Example: only consts and statics should be alphabetically ordered

It is also possible to configure a selection of module item groups that
should be ordered alphabetically. This may be useful if for example
statics and consts should be ordered, but the rest should be left open.

```rust
module-items-ordered-within-groupings = ["UPPER_SNAKE_CASE"]
```

### Known Problems

#### Performance Impact

Keep in mind, that ordering source code alphabetically can lead to
reduced performance in cases where the most commonly used enum variant
isn’t the first entry anymore, and similar optimizations that can reduce
branch misses, cache locality and such. Either don’t use this lint if
that’s relevant, or disable the lint in modules or items specifically
where it matters. Other solutions can be to use profile guided
optimization (PGO), post-link optimization (e.g. using BOLT for LLVM),
or other advanced optimization methods. A good starting point to dig
into optimization is cargo-pgo.

#### Lints on a Contains basis

The lint can be disabled only on a “contains” basis, but not per element
within a “container”, e.g. the lint works per-module, per-struct,
per-enum, etc. but not for “don’t order this particular enum variant”.

#### Module documentation

Module level rustdoc comments are not part of the resulting syntax tree
and as such cannot be linted from within `check_mod`. Instead, the
`rustdoc::missing_documentation` lint may be used.

#### Module Tests

This lint does not implement detection of module tests (or other feature
dependent elements for that matter). To lint the location of mod tests,
the lint `items_after_test_module` can be used instead.

### Example

```rust
trait TraitUnordered {
    const A: bool;
    const C: bool;
    const B: bool;

    type SomeType;

    fn a();
    fn c();
    fn b();
}
```

Use instead:

```rust
trait TraitOrdered {
    const A: bool;
    const B: bool;
    const C: bool;

    type SomeType;

    fn a();
    fn b();
    fn c();
}
```

### Configuration

- 

`module-item-order-groupings`:  The named groupings of different source item kinds within modules.

(default: `[["modules", ["extern_crate", "mod", "foreign_mod"]], ["use", ["use"]], ["macros", ["macro"]], ["global_asm", ["global_asm"]], ["UPPER_SNAKE_CASE", ["static", "const"]], ["PascalCase", ["ty_alias", "enum", "struct", "union", "trait", "trait_alias", "impl", "test_binder_constraints"]], ["lower_snake_case", ["fn"]]]`)

- 

`module-items-ordered-within-groupings`:  Whether the items within module groups should be ordered alphabetically or not.

This option can be configured to “all”, “none”, or a list of specific grouping names that should be checked
(e.g. only “enums”).

(default: `"none"`)

- 

`source-item-ordering`:  Which kind of elements should be ordered internally, possible values being `enum`, `impl`, `module`, `struct`, `trait`.

(default: `["enum", "impl", "module", "struct", "trait"]`)

- 

`trait-assoc-item-kinds-order`:  The order of associated items in traits.

(default: `["const", "type", "fn"]`)

- 

`trait-impl-item-order`:  The required ordering of associated items in trait impls: purely alphabetical,
following the trait definition order, or accepting either.

Note that the trait definition order may change between versions of the
crate defining the trait without being considered a breaking change.

Examples:
When using trait definition item ordering:

```rust
trait-impl-item-order = "trait_item_ordering"
```

When using trait definition item ordering and alphabetical for fallbacks:

```rust
trait-impl-item-order = "alphabetical_or_trait_item_ordering"
```

(default: `"alphabetical"`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/arbitrary_source_item_ordering.rs#L18

## arithmetic_side_effects

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.64.0

### What it does

Checks any kind of arithmetic operation of any type.

Operators like `+`, `-`, `*` or `<<` are usually capable of overflowing according to the Rust
Reference,
or can panic (`/`, `%`).

Known safe built-in types like `Wrapping` or `Saturating`, floats, operations in constant
environments, allowed types and non-constant operations that won’t overflow are ignored.

### Why restrict this?

For integers, overflow will trigger a panic in debug builds or wrap the result in
release mode; division by zero will cause a panic in either mode. As a result, it is
desirable to explicitly call checked, wrapping or saturating arithmetic methods.

#### Example

```rust
// `n` can be any number, including `i32::MAX`.
fn foo(n: i32) -> i32 {
    n + 1
}
```

Third-party types can also overflow or present unwanted side-effects.

#### Example

```rust
use rust_decimal::Decimal;
let _n = Decimal::MAX + Decimal::MAX;
```

### Past names

- integer_arithmetic

### Configuration

- `arithmetic-side-effects-allowed`:  Suppress checking of the passed type names in all types of operations.

If a specific operation is desired, consider using `arithmetic_side_effects_allowed_binary` or `arithmetic_side_effects_allowed_unary` instead.

#### Example

```rust
arithmetic-side-effects-allowed = ["SomeType", "AnotherType"]
```

#### Noteworthy

A type, say `SomeType`, listed in this configuration has the same behavior of
`["SomeType" , "*"], ["*", "SomeType"]` in `arithmetic_side_effects_allowed_binary`.

(default: `[]`)

- `arithmetic-side-effects-allowed-binary`:  Suppress checking of the passed type pair names in binary operations like addition or
multiplication.

Supports the “*” wildcard to indicate that a certain type won’t trigger the lint regardless
of the involved counterpart. For example, `["SomeType", "*"]` or `["*", "AnotherType"]`.

Pairs are asymmetric, which means that `["SomeType", "AnotherType"]` is not the same as
`["AnotherType", "SomeType"]`.

#### Example

```rust
arithmetic-side-effects-allowed-binary = [["SomeType" , "f32"], ["AnotherType", "*"]]
```

(default: `[]`)

- `arithmetic-side-effects-allowed-unary`:  Suppress checking of the passed type names in unary operations like “negation” (`-`).

#### Example

```rust
arithmetic-side-effects-allowed-unary = ["SomeType", "AnotherType"]
```

(default: `[]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L70

## as_conversions

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.41.0

### What it does

Checks for usage of `as` conversions.

Note that this lint is specialized in linting every single use of `as`
regardless of whether good alternatives exist or not. If you want more
precise lints for `as`, please consider using these separate lints:

- `clippy::cast_lossless`

- `clippy::cast_possible_truncation`

- `clippy::cast_possible_wrap`

- `clippy::cast_precision_loss`

- `clippy::cast_sign_loss`

- `clippy::char_lit_as_u8`

- `clippy::fn_to_numeric_cast`

- `clippy::fn_to_numeric_cast_with_truncation`

- `clippy::ptr_as_ptr`

- `clippy::unnecessary_cast`

- `invalid_reference_casting`

There is a good explanation the reason why this lint should work in this
way and how it is useful in this
issue.

### Why restrict this?

`as` conversions will perform many kinds of
conversions, including silently lossy conversions and dangerous coercions.
There are cases when it makes sense to use `as`, so the lint is
Allow by default.

### Example

```rust
let a: u32;
...
f(a as u16);
```

Use instead:

```rust
f(a.try_into()?);

// or

f(a.try_into().expect("Unexpected u16 overflow in f"));
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/as_conversions.rs#L6

## as_pointer_underscore

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.85.0

### What it does

Checks for the usage of `as *const _` or `as *mut _` conversion using inferred type.

### Why restrict this?

The conversion might include a dangerous cast that might go undetected due to the type being inferred.

### Example

```rust
fn as_usize<T>(t: &T) -> usize {
    // BUG: `t` is already a reference, so we will here
    // return a dangling pointer to a temporary value instead
    &t as *const _ as usize
}
```

Use instead:

```rust
fn as_usize<T>(t: &T) -> usize {
    t as *const T as usize
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L36

## as_underscore

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.63.0

### What it does

Checks for the usage of `as _` conversion using inferred type.

### Why restrict this?

The conversion might include lossy conversion or a dangerous cast that might go
undetected due to the type being inferred.

The lint is allowed by default as using `_` is less wordy than always specifying the type.

### Example

```rust
fn foo(n: usize) {}
let n: u16 = 256;
foo(n as _);
```

Use instead:

```rust
fn foo(n: usize) {}
let n: u16 = 256;
foo(n as usize);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L89

## assertions_on_result_states

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.64.0

### What it does

Checks for `assert!(r.is_ok())` or `assert!(r.is_err())` calls.

### Why restrict this?

This form of assertion does not show any of the information present in the `Result`
other than which variant it isn’t.

### Known problems

The suggested replacement decreases the readability of code and log output.

### Example

```rust
assert!(r.is_ok());
assert!(r.is_err());
```

Use instead:

```rust
r.unwrap();
r.unwrap_err();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/assertions_on_result_states.rs#L14

## big_endian_bytes

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.72.0

### What it does

Checks for the usage of the `to_be_bytes` method and/or the function `from_be_bytes`.

### Why restrict this?

To ensure use of little-endian or the target’s endianness rather than big-endian.

### Example

```rust
let _x = 2i32.to_be_bytes();
let _y = 2i64.to_be_bytes();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/endian_bytes.rs#L10

## cfg_not_test

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.81.0

### What it does

Checks for usage of `cfg` that excludes code from `test` builds. (i.e., `#[cfg(not(test))]`)

### Why is this bad?

This may give the false impression that a codebase has 100% coverage, yet actually has untested code.
Enabling this also guards against excessive mockery as well, which is an anti-pattern.

### Example

```rust
#[cfg(not(test))]
important_check(); // I'm not actually tested, but not including me will falsely increase coverage!
```

Use instead:

```rust
important_check();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/cfg_not_test.rs#L7

## clone_on_ref_ptr

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `.clone()` on a ref-counted pointer,
(`Rc`, `Arc`, `rc::Weak`, or `sync::Weak`), and suggests calling Clone via unified
function syntax instead (e.g., `Rc::clone(foo)`).

### Why restrict this?

Calling `.clone()` on an `Rc`, `Arc`, or `Weak`
can obscure the fact that only the pointer is being cloned, not the underlying
data.

### Example

```rust
let x = Rc::new(1);

x.clone();
```

Use instead:

```rust
Rc::clone(&x);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L442

## cognitive_complexity

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.35.0

### What it does

We used to think it measured how hard a method is to understand.

### Why is this bad?

Ideally, we would like to be able to measure how hard a function is
to understand given its context (what we call its Cognitive Complexity).
But that’s not what this lint does. See “Known problems”

### Known problems

The true Cognitive Complexity of a method is not something we can
calculate using modern technology. This lint has been left in
`restriction` so as to not mislead users into using this lint as a
measurement tool.

For more detailed information, see rust-clippy#3793

### Lints to consider instead of this

- `excessive_nesting`

- `too_many_lines`

### Past names

- cyclomatic_complexity

### Configuration

- 

`cognitive-complexity-threshold`:  The maximum cognitive complexity a function can have

(default: `25`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/cognitive_complexity.rs#L15

## create_dir

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.48.0

### What it does

Checks usage of `std::fs::create_dir` and suggest using `std::fs::create_dir_all` instead.

### Why restrict this?

Sometimes `std::fs::create_dir` is mistakenly chosen over `std::fs::create_dir_all`,
resulting in failure when more than one directory needs to be created or when the directory already exists.
Crates which never need to specifically create a single directory may wish to prevent this mistake.

### Example

```rust
std::fs::create_dir("foo");
```

Use instead:

```rust
std::fs::create_dir_all("foo");
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/create_dir.rs#L7

## dbg_macro

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.34.0

### What it does

Checks for usage of the `dbg!` macro.

### Why restrict this?

The `dbg!` macro is intended as a debugging tool. It should not be present in released
software or committed to a version control system.

### Example

```rust
dbg!(true)
```

Use instead:

```rust
true
```

### Configuration

- 

`allow-dbg-in-tests`:  Whether `dbg!` should be allowed in test functions or `#[cfg(test)]`

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/dbg_macro.rs#L12

## decimal_literal_representation

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Warns if there is a better representation for a numeric literal.

### Why restrict this?

Especially for big powers of 2, a hexadecimal representation is usually more
readable than a decimal representation.

### Example

```rust
`255` => `0xFF`
`65_535` => `0xFFFF`
`4_042_322_160` => `0xF0F0_F0F0`
```

### Configuration

- 

`literal-representation-threshold`:  The lower bound for linting decimal literals

(default: `16384`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/literal_representation.rs#L12

## default_numeric_fallback

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.52.0

### What it does

Checks for usage of unconstrained numeric literals which may cause default numeric fallback in type
inference.

Default numeric fallback means that if numeric types have not yet been bound to concrete
types at the end of type inference, then integer type is bound to `i32`, and similarly
floating type is bound to `f64`.

See RFC0212 for more information about the fallback.

### Why restrict this?

To ensure that every numeric type is chosen explicitly rather than implicitly.

### Known problems

This lint is implemented using a custom algorithm independent of rustc’s inference,
which results in many false positives and false negatives.

### Example

```rust
let i = 10;
let f = 1.23;
```

Use instead:

```rust
let i = 10_i32;
let f = 1.23_f64;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/default_numeric_fallback.rs#L15

## default_union_representation

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.60.0

### What it does

Displays a warning when a union is declared with the default representation (without a `#[repr(C)]` attribute).

### Why restrict this?

Unions in Rust have unspecified layout by default, despite many people thinking that they
lay out each field at the start of the union (like C does). That is, there are no guarantees
about the offset of the fields for unions with multiple non-ZST fields without an explicitly
specified layout. These cases may lead to undefined behavior in unsafe blocks.

### Example

```rust
union Foo {
    a: i32,
    b: u32,
}

fn main() {
    let _x: u32 = unsafe {
        Foo { a: 0_i32 }.b // Undefined behavior: `b` is allowed to be padding
    };
}
```

Use instead:

```rust
#[repr(C)]
union Foo {
    a: i32,
    b: u32,
}

fn main() {
    let _x: u32 = unsafe {
        Foo { a: 0_i32 }.b // Now defined behavior, this is just an i32 -> u32 transmute
    };
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/default_union_representation.rs#L8

## definition_in_module_root

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.99.0

### What it does

Checks for definitions (structs, functions, traits, etc.) in `mod.rs`
files. `lib.rs` and `main.rs` are not checked.

### Why restrict this?

`mod.rs` is well-suited to acting as a table of contents — listing
submodules and re-exports while leaving definitions to named files.
Naming each file after its primary definition keeps filenames
descriptive and unique, makes editor tabs and search results easier
to scan, and makes the filesystem tree mirror the module tree, so
the file layout is uniquely determined by the module structure.

### Example

```rust
// stuff/mod.rs
mod bar;
pub struct Foo { /* ... */ }
impl Foo { /* ... */ }
```

Use instead:

```rust
// stuff/mod.rs
mod bar;
mod foo;
pub use foo::Foo;

// stuff/foo.rs
pub struct Foo { /* ... */ }
impl Foo { /* ... */ }
```

### Notes

This lint is most useful alongside `self_named_module_files`, which
requires `mod.rs` files; together they constrain `mod.rs` to
declarations only. Under `mod_module_files` (which forbids `mod.rs`
entirely) this lint has nothing to fire on.

If a definition’s name matches its parent module’s name, moving it
produces `foo/foo.rs`, which `module_inception` flags — projects
in that situation typically also `allow(module_inception)`.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/definition_in_module_root.rs#L6

## deprecated_attributes_without_note

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.100.0

### What it does

Checks for attributes that deprecate items without a `note` field.

### Why restrict this?

This is typically used to provide an explanation about the deprecation
and preferred alternatives.

### Example

```rust
#[deprecated]
pub fn foo() { /* ... */ }
```

Use instead:

```rust
#[deprecated(note = "foo was rarely used. Users should instead use bar")]
pub fn foo() { /* ... */ }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/attrs/mod.rs#L111

## deref_by_slicing

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.61.0

### What it does

Checks for slicing expressions which are equivalent to dereferencing the
value.

### Why restrict this?

Some people may prefer to dereference rather than slice.

### Example

```rust
let vec = vec![1, 2, 3];
let slice = &vec[..];
```

Use instead:

```rust
let vec = vec![1, 2, 3];
let slice = &*vec;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/redundant_slicing.rs#L14

## disallowed_script_idents

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.55.0

### What it does

Checks for usage of unicode scripts other than those explicitly allowed
by the lint config.

This lint doesn’t take into account non-text scripts such as `Unknown` and `Linear_A`.
It also ignores the `Common` script type.
While configuring, be sure to use official script name aliases from
the list of supported scripts.

See also: `non_ascii_idents`.

### Why restrict this?

It may be not desired to have many different scripts for
identifiers in the codebase.

Note that if you only want to allow typical English, you might want to use
built-in `non_ascii_idents` lint instead.

### Example

```rust
// Assuming that `clippy.toml` contains the following line:
// allowed-scripts = ["Latin", "Cyrillic"]
let counter = 10; // OK, latin is allowed.
let счётчик = 10; // OK, cyrillic is allowed.
let zähler = 10; // OK, it's still latin.
let カウンタ = 10; // Will spawn the lint.
```

### Configuration

- 

`allowed-scripts`:  The list of unicode scripts allowed to be used in the scope.

(default: `["Latin"]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/disallowed_script_idents.rs#L8

## doc_include_without_cfg

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.85.0

### What it does

Checks if included files in doc comments are included only for `cfg(doc)`.

### Why restrict this?

These files are not useful for compilation but will still be included.
Also, if any of these non-source code file is updated, it will trigger a
recompilation.

### Known problems

Excluding this will currently result in the file being left out if
the item’s docs are inlined from another crate. This may be fixed in a
future version of rustdoc.

### Example

```rust
#![doc = include_str!("some_file.md")]
```

Use instead:

```rust
#![cfg_attr(doc, doc = include_str!("some_file.md"))]
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L104

## doc_paragraphs_missing_punctuation

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.93.0

### What it does

Checks for doc comments whose paragraphs do not end with a period or another punctuation mark.
Various Markdowns constructs are taken into account to avoid false positives.

### Why is this bad?

A project may wish to enforce consistent doc comments by making sure paragraphs end with a
punctuation mark.

### Example

```rust
/// Returns a random number
///
/// It was chosen by a fair dice roll
```

Use instead:

```rust
/// Returns a random number.
///
/// It was chosen by a fair dice roll.
```

### Terminal punctuation marks

This lint treats these characters as end markers: ‘.’, ‘?’, ‘!’, ‘…’ and ‘:’.

The colon is not exactly a terminal punctuation mark, but this is required for paragraphs that
introduce a table or a list for example.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L336

## else_if_without_else

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of if expressions with an `else if` branch,
but without a final `else` branch.

### Why restrict this?

Some coding guidelines require this (e.g., MISRA-C:2004 Rule 14.10).

### Example

```rust
if x.is_positive() {
    a();
} else if x.is_negative() {
    b();
}
```

Use instead:

```rust
if x.is_positive() {
    a();
} else if x.is_negative() {
    b();
} else {
    // We don't care about zero.
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/else_if_without_else.rs#L5

## empty_drop

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.62.0

### What it does

Checks for empty `Drop` implementations.

### Why restrict this?

Empty `Drop` implementations have no effect when dropping an instance of the type. They are
most likely useless. However, an empty `Drop` implementation prevents a type from being
destructured, which might be the intention behind adding the implementation as a marker.

### Example

```rust
struct S;

impl Drop for S {
    fn drop(&mut self) {}
}
```

Use instead:

```rust
struct S;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/empty_drop.rs#L7

## empty_enum_variants_with_brackets

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.77.0

### What it does

Finds enum variants without fields that are declared with empty brackets.

### Why restrict this?

Empty brackets after a enum variant declaration are redundant and can be omitted,
and it may be desirable to do so consistently for style.

However, removing the brackets also introduces a public constant named after the variant,
so this is not just a syntactic simplification but an API change, and adding them back
is a breaking API change.

### Example

```rust
enum MyEnum {
    HasData(u8),
    HasNoData(),       // redundant parentheses
    NoneHereEither {}, // redundant braces
}
```

Use instead:

```rust
enum MyEnum {
    HasData(u8),
    HasNoData,
    NoneHereEither,
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/empty_with_brackets.rs#L16

## empty_structs_with_brackets

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.62.0

### What it does

Finds structs without fields (a so-called “empty struct”) that are declared with brackets.

### Why restrict this?

Empty brackets after a struct declaration can be omitted,
and it may be desirable to do so consistently for style.

However, removing the brackets also introduces a public constant named after the struct,
so this is not just a syntactic simplification but an API change, and adding them back
is a breaking API change.

### Example

```rust
struct Cookie {}
struct Biscuit();
```

Use instead:

```rust
struct Cookie;
struct Biscuit;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/empty_with_brackets.rs#L51

## error_impl_error

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.73.0

### What it does

Checks for types named `Error` that implement `Error`.

### Why restrict this?

It can become confusing when a codebase has 20 types all named `Error`, requiring either
aliasing them in the `use` statement or qualifying them like `my_module::Error`. This
hinders comprehension, as it requires you to memorize every variation of importing `Error`
used across a codebase.

### Example

```rust
#[derive(Debug)]
pub enum Error { ... }

impl std::fmt::Display for Error { ... }

impl std::error::Error for Error { ... }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/error_impl_error.rs#L10

## exhaustive_enums

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.51.0

### What it does

Warns on any exported `enum`s that are not tagged `#[non_exhaustive]`

### Why restrict this?

Making an `enum` exhaustive is a stability commitment: adding a variant is a breaking change.
A project may wish to ensure that there are no exhaustive enums or that every exhaustive
`enum` is explicitly `#[allow]`ed.

### Example

```rust
enum Foo {
    Bar,
    Baz
}
```

Use instead:

```rust
#[non_exhaustive]
enum Foo {
    Bar,
    Baz
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/exhaustive_items.rs#L8

## exhaustive_structs

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.51.0

### What it does

Warns on any exported `struct`s that are not tagged `#[non_exhaustive]`

### Why restrict this?

Making a `struct` exhaustive is a stability commitment: adding a field is a breaking change.
A project may wish to ensure that there are no exhaustive structs or that every exhaustive
`struct` is explicitly `#[allow]`ed.

### Example

```rust
struct Foo {
    bar: u8,
    baz: String,
}
```

Use instead:

```rust
#[non_exhaustive]
struct Foo {
    bar: u8,
    baz: String,
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/exhaustive_items.rs#L38

## exit

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.41.0

### What it does

Detects calls to the `exit()` function that are not in the `main` function. Calls to `exit()`
immediately terminate the program.

### Why restrict this?

`exit()` immediately terminates the program with no information other than an exit code.
This provides no means to troubleshoot a problem, and may be an unexpected side effect.

Codebases may use this lint to require that all exits are performed either by panicking
(which produces a message, a code location, and optionally a backtrace)
or by calling `exit()` from `main()` (which is a single place to look).

### Good example

```rust
use std::process;

fn main() {
    process::exit(0);
}
```

### Bad example

```rust
fn main() {
    other_function();
}

fn other_function() {
    std::process::exit(0);
}
```

Use instead:

```rust
// To provide a stacktrace and additional information
panic!("message");

// or a main method with a return
fn main() -> Result<(), i32> {
    Ok(())
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L639

## expect_used

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.45.0

### What it does

Checks for `.expect()` or `.expect_err()` calls on `Result`s and `.expect()` call on `Option`s.

### Why restrict this?

Usually it is better to handle the `None` or `Err` case.
Still, for a lot of quick-and-dirty code, `expect` is a good choice, which is why
this lint is `Allow` by default.

`result.expect()` will let the thread panic on `Err`
values. Normally, you want to implement more sophisticated error handling,
and propagate errors upwards with `?` operator.

### Examples

```rust
option.expect("one");
result.expect("one");
```

Use instead:

```rust
option?;

// or

result?;
```

### Past names

- option_expect_used

- result_expect_used

### Configuration

- 

`allow-expect-in-consts`:  Whether `expect` should be allowed in code always evaluated at compile time

(default: `true`)

- 

`allow-expect-in-tests`:  Whether `expect` should be allowed in test functions or `#[cfg(test)]`

(default: `false`)

- 

`allow-unwrap-types`:  List of types to allow `unwrap()` and `expect()` on.

#### Example

```rust
allow-unwrap-types = [ "std::sync::LockResult" ]
```

(default: `[]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L727

## field_scoped_visibility_modifiers

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.81.0

### What it does

Checks for usage of scoped visibility modifiers, like `pub(crate)`, on fields. These
make a field visible within a scope between public and private.

### Why restrict this?

Scoped visibility modifiers cause a field to be accessible within some scope between
public and private, potentially within an entire crate. This allows for fields to be
non-private while upholding internal invariants, but can be a code smell. Scoped visibility
requires checking a greater area, potentially an entire crate, to verify that an invariant
is upheld, and global analysis requires a lot of effort.

### Example

```rust
pub mod public_module {
    struct MyStruct {
        pub(crate) first_field: bool,
        pub(super) second_field: bool
    }
}
```

Use instead:

```rust
pub mod public_module {
    struct MyStruct {
        first_field: bool,
        second_field: bool
    }
    impl MyStruct {
        pub(crate) fn get_first_field(&self) -> bool {
            self.first_field
        }
        pub(super) fn get_second_field(&self) -> bool {
            self.second_field
        }
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/field_scoped_visibility_modifiers.rs#L5

## filetype_is_file

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.42.0

### What it does

Checks for `FileType::is_file()`.

### Why restrict this?

When people testing a file type with `FileType::is_file`
they are testing whether a path is something they can get bytes from. But
`is_file` doesn’t cover special file types in unix-like systems, and doesn’t cover
symlink in windows. Using `!FileType::is_dir()` is a better way to that intention.

### Example

```rust
let metadata = std::fs::metadata("foo.txt")?;
let filetype = metadata.file_type();

if filetype.is_file() {
    // read file
}
```

should be written as:

```rust
let metadata = std::fs::metadata("foo.txt")?;
let filetype = metadata.file_type();

if !filetype.is_dir() {
    // read file
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L794

## float_arithmetic

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for float arithmetic.

### Why restrict this?

For some embedded systems or kernel development, it
can be useful to rule out floating-point numbers.

### Example

```rust
a + 1.0;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L343

## float_cmp_const

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for (in-)equality comparisons on constant floating-point
values (apart from zero), except in functions called `*eq*` (which probably
implement equality for a type involving floats).

### Why restrict this?

Floating point calculations are usually imprecise, so asking if two values are exactly
equal is asking for trouble because arriving at the same logical result via different
routes (e.g. calculation versus constant) may yield different values.

### Example

```rust
let a: f64 = 1000.1;
let b: f64 = 0.2;
let x = a + b;
const Y: f64 = 1000.3; // Expected value.

// Actual value: 1000.3000000000001
println!("{x}");

let are_equal = x == Y;
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
const Y: f64 = 1000.3; // Expected value.

const ALLOWED_ERROR_VEHICLE_LENGTH_CM: f64 = 0.1;
let within_tolerance = (x - Y).abs() < ALLOWED_ERROR_VEHICLE_LENGTH_CM;
println!("{within_tolerance}"); // true
```

NOTE: Do not use `f64::EPSILON` - while the error margin is often called “epsilon”, this is
a different use of the term that is not suitable for floating point equality comparison.
Indeed, for the example above using `f64::EPSILON` as the allowed error would return `false`.

For the scenario where no meaningful absolute error can be defined, refer to
the floating point guide
for a reference implementation of relative error based comparison of floating point values.
`MIN_NORMAL` in the reference implementation is equivalent to `MIN_POSITIVE` in Rust.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L425

## fn_to_numeric_cast_any

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.58.0

### What it does

Checks for casts of a function pointer to any integer type.

### Why restrict this?

Casting a function pointer to an integer can have surprising results and can occur
accidentally if parentheses are omitted from a function call. If you aren’t doing anything
low-level with function pointers then you can opt out of casting functions to integers in
order to avoid mistakes. Alternatively, you can use this lint to audit all uses of function
pointer casts in your code.

### Example

```rust
// fn1 is cast as `usize`
fn fn1() -> u16 {
    1
};
let _ = fn1 as usize;
```

Use instead:

```rust
// maybe you intended to call the function?
fn fn2() -> u16 {
    1
};
let _ = fn2() as usize;

// or

// maybe you intended to cast it to a function type?
fn fn3() -> u16 {
    1
}
let _ = fn3 as fn() -> u16;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L572

## get_unwrap

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `.get().unwrap()` (or
`.get_mut().unwrap`) on a standard library type which implements `Index`

### Why restrict this?

Using the Index trait (`[]`) is more clear and more
concise.

### Known problems

Not a replacement for error handling: Using either
`.unwrap()` or the Index trait (`[]`) carries the risk of causing a `panic`
if the value being accessed is `None`. If the use of `.get().unwrap()` is a
temporary placeholder for dealing with the `Option` type, then this does
not mitigate the need for error handling. If there is a chance that `.get()`
will be `None` in your program, then it is advisable that the `None` case
is handled in a future refactor instead of using `.unwrap()` or the Index
trait.

### Example

```rust
let mut some_vec = vec![0, 1, 2, 3];
let last = some_vec.get(3).unwrap();
*some_vec.get_mut(0).unwrap() = 1;
```

The correct use would be:

```rust
let mut some_vec = vec![0, 1, 2, 3];
let last = some_vec[3];
some_vec[0] = 1;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1082

## host_endian_bytes

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.72.0

### What it does

Checks for the usage of the `to_ne_bytes` method and/or the function `from_ne_bytes`.

### Why restrict this?

To ensure use of explicitly chosen endianness rather than the target’s endianness,
such as when implementing network protocols or file formats rather than FFI.

### Example

```rust
let _x = 2i32.to_ne_bytes();
let _y = 2i64.to_ne_bytes();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/endian_bytes.rs#L28

## if_then_some_else_none

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.53.0

### What it does

Checks for if-else that could be written using either `bool::then` or `bool::then_some`.

### Why restrict this?

Looks a little redundant. Using `bool::then` is more concise and incurs no loss of clarity.
For simple calculations and known values, use `bool::then_some`, which is eagerly evaluated
in comparison to `bool::then`.

### Example

```rust
let a = if v.is_empty() {
    println!("true!");
    Some(42)
} else {
    None
};
```

Could be written:

```rust
let a = v.is_empty().then(|| {
    println!("true!");
    42
});
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/if_then_some_else_none.rs#L17

## impl_trait_in_params

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.69.0

### What it does

Lints when `impl Trait` is being used in a function’s parameters.

### Why restrict this?

Turbofish syntax (`::<>`) cannot be used to specify the type of an `impl Trait` parameter,
making `impl Trait` less powerful. Readability may also be a factor.

### Example

```rust
trait MyTrait {}
fn foo(a: impl MyTrait) {
	// [...]
}
```

Use instead:

```rust
trait MyTrait {}
fn foo<T: MyTrait>(a: T) {
	// [...]
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/functions/mod.rs#L76

## implicit_return

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.33.0

### What it does

Checks for missing return statements at the end of a block.

### Why restrict this?

Omitting the return keyword whenever possible is idiomatic Rust code, but:

- Programmers coming from other languages might prefer the expressiveness of `return`.

- It’s possible to miss the last returning statement because the only difference is a missing `;`.

- Especially in bigger code with multiple return paths, having a `return` keyword makes it easier to find the
corresponding statements.

### Example

```rust
fn foo(x: usize) -> usize {
    x
}
```

add return

```rust
fn foo(x: usize) -> usize {
    return x;
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/implicit_return.rs#L13

## indexing_slicing

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of indexing or slicing that may panic at runtime.

This lint does not report on indexing or slicing operations
that always panic, out_of_bounds_indexing already
handles those cases.

### Why restrict this?

To avoid implicit panics from indexing and slicing.

There are “checked” alternatives which do not panic, and can be used with `unwrap()` to make
an explicit panic when it is desired.

### Limitations

This lint does not check for the usage of indexing or slicing on strings. These are covered
by the more specific `string_slice` lint.

### Example

```rust
// Vector
let x = vec![0, 1, 2, 3];

x[2];
x[100];
&x[2..100];

// Array
let y = [0, 1, 2, 3];

let i = 10; // Could be a runtime value
let j = 20;
&y[i..j];
```

Use instead:

```rust
x.get(2);
x.get(100);
x.get(2..100);

let i = 10;
let j = 20;
y.get(i..j);
```

### Configuration

- 

`allow-indexing-slicing-in-tests`:  Whether `indexing_slicing` should be allowed in test functions or `#[cfg(test)]`

(default: `false`)

- 

`suppress-restriction-lint-in-const`:  Whether to suppress a restriction lint in constant code. In same
cases the restructured operation might not be unavoidable, as the
suggested counterparts are unavailable in constant code. This
configuration will cause restriction lints to trigger even
if no suggestion can be made.

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/indexing_slicing.rs#L11

## infinite_loop

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.76.0

### What it does

Checks for infinite loops in a function where the return type is not `!`
and lint accordingly.

### Why restrict this?

Making the return type `!` serves as documentation that the function does not return.
If the function is not intended to loop infinitely, then this lint may detect a bug.

### Example

```rust
fn run_forever() {
    loop {
        // do something
    }
}
```

If infinite loops are as intended:

```rust
fn run_forever() -> ! {
    loop {
        // do something
    }
}
```

Otherwise add a `break` or `return` condition:

```rust
fn run_forever() {
    loop {
        // do something
        if condition {
            break;
        }
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L268

## inline_asm_x86_att_syntax

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.49.0

### What it does

Checks for usage of AT&T x86 assembly syntax.

### Why restrict this?

To enforce consistent use of Intel x86 assembly syntax.

### Example

```rust
asm!("lea ({}), {}", in(reg) ptr, lateout(reg) _, options(att_syntax));
```

Use instead:

```rust
asm!("lea {}, [{}]", lateout(reg) _, in(reg) ptr);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/asm_syntax.rs#L59

## inline_asm_x86_intel_syntax

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.49.0

### What it does

Checks for usage of Intel x86 assembly syntax.

### Why restrict this?

To enforce consistent use of AT&T x86 assembly syntax.

### Example

```rust
asm!("lea {}, [{}]", lateout(reg) _, in(reg) ptr);
```

Use instead:

```rust
asm!("lea ({}), {}", in(reg) ptr, lateout(reg) _, options(att_syntax));
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/asm_syntax.rs#L91

## inline_modules

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.97.0

### What it does

Checks that module layout does not use inline modules.
Inline test modules (anything annotated with `#[cfg(test)]`) are not linted.

### Why restrict this?

Having multiple module layout styles in a project can be confusing.

### Known problems

The lint currently doesn’t lint inline modules whose parent module is annotated
with the `#[path]` attribute.

### Example

```rust
// in `src/lib.rs`
mod foo {
   /* module contents */
}
```

Use instead:

```rust
// in `src/lib.rs`
mod foo;
// in `src/foo.rs` (or `src/foo/mod.rs`)
/* module contents */
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/module_style.rs#L11

## inline_trait_bounds

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.97.0

### What it does

Enforce that `where` bounds are used for all trait bounds.

### Why restrict this?

Enforce a single style throughout a codebase.
Avoid uncertainty about whether a bound should be inline
or out-of-line (i.e. a where bound).
Avoid complex inline bounds, which could make a function declaration more difficult to read.

### Known limitations

Only lints functions and method declarations. Bounds on structs, enums,
and impl blocks are not yet covered.

### Example

```rust
fn foo<T: Clone>() {}
```

Use instead:

```rust
fn foo<T>() where T: Clone {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/inline_trait_bounds.rs#L11

## integer_division

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.37.0

### What it does

Checks for division of integers

### Why restrict this?

When outside of some very specific algorithms,
integer division is very often a mistake because it discards the
remainder.

### Example

```rust
let x = 3 / 2;
println!("{}", x);
```

Use instead:

```rust
let x = 3f32 / 2f32;
println!("{}", x);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L599

## integer_division_remainder_used

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.79.0

### What it does

Checks for the usage of division (`/`) and remainder (`%`) operations
when performed on any integer types using the default `Div` and `Rem` trait implementations.

### Why restrict this?

In cryptographic contexts, division can result in timing sidechannel vulnerabilities,
and needs to be replaced with constant-time code instead (e.g. Barrett reduction).

### Example

```rust
let my_div = 10 / 2;
```

Use instead:

```rust
let my_div = 10 >> 1;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L625

## iter_over_hash_type

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.76.0

### What it does

This is a restriction lint which prevents the use of hash types (i.e., `HashSet` and `HashMap`) in for loops.

### Why restrict this?

Because hash types are unordered, when iterated through such as in a `for` loop, the values are returned in
an undefined order. As a result, on redundant systems this may cause inconsistencies and anomalies.
In addition, the unknown order of the elements may reduce readability or introduce other undesired
side effects.

### Example

```rust
    let my_map = std::collections::HashMap::<i32, String>::new();
    for (key, value) in my_map { /* ... */ }
```

Use instead:

```rust
    let my_map = std::collections::HashMap::<i32, String>::new();
    let mut keys = my_map.keys().clone().collect::<Vec<_>>();
    keys.sort();
    for key in keys {
        let value = &my_map[key];
    }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/iter_over_hash_type.rs#L7

## large_include_file

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.62.0

### What it does

Checks for the inclusion of large files via `include_bytes!()`
or `include_str!()`.

### Why restrict this?

Including large files can undesirably increase the size of the binary produced by the compiler.
This lint may be used to catch mistakes where an unexpectedly large file is included, or
temporarily to obtain a list of all large files.

### Example

```rust
let included_str = include_str!("very_large_file.txt");
let included_bytes = include_bytes!("very_large_file.txt");
```

Use instead:

```rust
use std::fs;

// You can load the file at runtime
let string = fs::read_to_string("very_large_file.txt")?;
let bytes = fs::read("very_large_file.txt")?;
```

### Configuration

- 

`max-include-file-size`:  The maximum size of a file included via `include_bytes!()` or `include_str!()`, in bytes

(default: `1000000`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/large_include_file.rs#L10

## let_underscore_must_use

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.42.0

### What it does

Checks for `let _ = <expr>` where expr is `#[must_use]`

### Why restrict this?

To ensure that all `#[must_use]` types are used rather than ignored.

### Example

```rust
fn f() -> Result<u32, u32> {
    Ok(0)
}

let _ = f();
// is_ok() is marked #[must_use]
let _ = f().is_ok();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/let_underscore.rs#L68

## let_underscore_untyped

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.69.0

### What it does

Checks for `let _ = <expr>` without a type annotation, and suggests to either provide one,
or remove the `let` keyword altogether.

### Why restrict this?

The `let _ = <expr>` expression ignores the value of `<expr>`, but will continue to do so even
if the type were to change, thus potentially introducing subtle bugs. By supplying a type
annotation, one will be forced to re-visit the decision to ignore the value in such cases.

### Known problems

The `_ = <expr>` is not properly supported by some tools (e.g. IntelliJ) and may seem odd
to many developers. This lint also partially overlaps with the other `let_underscore_*`
lints.

### Example

```rust
fn foo() -> Result<u32, ()> {
    Ok(123)
}
let _ = foo();
```

Use instead:

```rust
fn foo() -> Result<u32, ()> {
    Ok(123)
}
// Either provide a type annotation:
let _: Result<u32, ()> = foo();
// …or drop the let keyword:
_ = foo();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/let_underscore.rs#L91

## little_endian_bytes

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.72.0

### What it does

Checks for the usage of the `to_le_bytes` method and/or the function `from_le_bytes`.

### Why restrict this?

To ensure use of big-endian or the target’s endianness rather than little-endian.

### Example

```rust
let _x = 2i32.to_le_bytes();
let _y = 2i64.to_le_bytes();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/endian_bytes.rs#L47

## lossy_float_literal

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.43.0

### What it does

Checks for whole number float literals that
cannot be represented as the underlying type without loss.

### Why restrict this?

If the value was intended to be exact, it will not be.
This may be especially surprising when the lost precision is to the left of the decimal point.

### Example

```rust
let _: f32 = 16_777_217.0; // 16_777_216.0
```

Use instead:

```rust
let _: f32 = 16_777_216.0;
let _: f64 = 16_777_217.0;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/float_literal.rs#L38

## map_err_ignore

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.48.0

### What it does

Checks for instances of `map_err(|_| Some::Enum)`

### Why restrict this?

This `map_err` throws away the original error rather than allowing the enum to
contain and report the cause of the error.

### Example

Before:

```rust
use std::fmt;

#[derive(Debug)]
enum Error {
    Indivisible,
    Remainder(u8),
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::Indivisible => write!(f, "could not divide input by three"),
            Error::Remainder(remainder) => write!(
                f,
                "input is not divisible by three, remainder = {}",
                remainder
            ),
        }
    }
}

impl std::error::Error for Error {}

fn divisible_by_3(input: &str) -> Result<(), Error> {
    input
        .parse::<i32>()
        .map_err(|_| Error::Indivisible)
        .map(|v| v % 3)
        .and_then(|remainder| {
            if remainder == 0 {
                Ok(())
            } else {
                Err(Error::Remainder(remainder as u8))
            }
        })
}
```

After:

```rust
use std::{fmt, num::ParseIntError};

#[derive(Debug)]
enum Error {
    Indivisible(ParseIntError),
    Remainder(u8),
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Error::Indivisible(_) => write!(f, "could not divide input by three"),
            Error::Remainder(remainder) => write!(
                f,
                "input is not divisible by three, remainder = {}",
                remainder
            ),
        }
    }
}

impl std::error::Error for Error {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Error::Indivisible(source) => Some(source),
            _ => None,
        }
    }
}

fn divisible_by_3(input: &str) -> Result<(), Error> {
    input
        .parse::<i32>()
        .map_err(Error::Indivisible)
        .map(|v| v % 3)
        .and_then(|remainder| {
            if remainder == 0 {
                Ok(())
            } else {
                Err(Error::Remainder(remainder as u8))
            }
        })
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2320

## map_with_unused_argument_over_ranges

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.84.0

### What it does

Checks for `Iterator::map` over ranges without using the parameter which
could be more clearly expressed using `std::iter::repeat(...).take(...)`
or `std::iter::repeat_n`.

### Why is this bad?

It expresses the intent more clearly to `take` the correct number of times
from a generating function than to apply a closure to each number in a
range only to discard them.

### Example

```rust
let random_numbers : Vec<_> = (0..10).map(|_| { 3 + 1 }).collect();
```

Use instead:

```rust
let f : Vec<_> = std::iter::repeat( 3 + 1 ).take(10).collect();
```

### Known Issues

This lint may suggest replacing a `Map<Range>` with a `Take<RepeatWith>`.
The former implements some traits that the latter does not, such as
`DoubleEndedIterator`.

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2543

## mem_forget

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `std::mem::forget(t)` where `t` is
`Drop` or has a field that implements `Drop`.

### Why restrict this?

`std::mem::forget(t)` prevents `t` from running its destructor, possibly causing leaks.
It is not possible to detect all means of creating leaks, but it may be desirable to
prohibit the simple ones.

### Example

```rust
mem::forget(Rc::new(55))
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/drop_forget_ref.rs#L51

## min_ident_chars

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.72.0

### What it does

Checks for identifiers which consist of a single character (or fewer than the configured threshold).

Note: This lint can be very noisy when enabled; it may be desirable to only enable it
temporarily.

### Why restrict this?

To improve readability by requiring that every variable has a name more specific than a single letter can be.

### Example

```rust
for m in movies {
    let title = m.t;
}
```

Use instead:

```rust
for movie in movies {
    let title = movie.title;
}
```

### Limitations

Trait implementations which use the same function or parameter name as the trait declaration will
not be warned about, even if the name is below the configured limit.

### Configuration

- 

`allowed-idents-below-min-chars`:  Allowed names below the minimum allowed characters. The value `".."` can be used as part of
the list to indicate that the configured values should be appended to the default
configuration of Clippy. By default, any configuration will replace the default value.

(default: `["i", "j", "x", "y", "z", "w", "n"]`)

- 

`min-ident-chars-lint-trait-impl`:  Whether to lint idents that have too few chars even when following trait declaration.

(default: `false`)

- 

`min-ident-chars-threshold`:  Minimum chars an ident can have, anything below or equal to this will be linted.

(default: `1`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/min_ident_chars.rs#L16

## missing_assert_message

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.70.0

### What it does

Checks assertions without a custom panic message.

### Why restrict this?

Without a good custom message, it’d be hard to understand what went wrong when the assertion fails.
A good custom message should be more about why the failure of the assertion is problematic
and not what is failed because the assertion already conveys that.

Although the same reasoning applies to testing functions, this lint ignores them as they would be too noisy.
Also, in most cases understanding the test failure would be easier
compared to understanding a complex invariant distributed around the codebase.

### Known problems

This lint cannot check the quality of the custom panic messages.
Hence, you can suppress this lint simply by adding placeholder messages
like “assertion failed”. However, we recommend coming up with good messages
that provide useful information instead of placeholder messages that
don’t provide any extra information.

### Example

```rust
fn call(service: Service) {
    assert!(service.ready);
}
```

Use instead:

```rust
fn call(service: Service) {
    assert!(service.ready, "`service.poll_ready()` must be called first to ensure that service is ready to receive requests");
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/missing_assert_message.rs#L8

## missing_asserts_for_indexing

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.74.0

### What it does

Checks for repeated slice indexing without asserting beforehand that the length
is greater than the largest index used to index into the slice.

### Why restrict this?

In the general case where the compiler does not have a lot of information
about the length of a slice, indexing it repeatedly will generate a bounds check
for every single index.

Asserting that the length of the slice is at least as large as the largest value
to index beforehand gives the compiler enough information to elide the bounds checks,
effectively reducing the number of bounds checks from however many times
the slice was indexed to just one (the assert).

### Drawbacks

False positives. It is, in general, very difficult to predict how well
the optimizer will be able to elide bounds checks and it very much depends on
the surrounding code. For example, indexing into the slice yielded by the
`slice::chunks_exact`
iterator will likely have all of the bounds checks elided even without an assert
if the `chunk_size` is a constant.

Asserts are not tracked across function calls. Asserting the length of a slice
in a different function likely gives the optimizer enough information
about the length of a slice, but this lint will not detect that.

### Example

```rust
fn sum(v: &[u8]) -> u8 {
    // 4 bounds checks
    v[0] + v[1] + v[2] + v[3]
}
```

Use instead:

```rust
fn sum(v: &[u8]) -> u8 {
    assert!(v.len() > 3);
    // no bounds checks
    v[0] + v[1] + v[2] + v[3]
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/missing_asserts_for_indexing.rs#L19

## missing_docs_in_private_items

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Warns if there is missing documentation for any private documentable item.

### Why restrict this?

Doc is good. rustc has a `MISSING_DOCS`
allowed-by-default lint for
public members, but has no way to enforce documentation of private items.
This lint fixes that.

### Configuration

- 

`missing-docs-allow-unused`:  Whether to allow fields starting with an underscore to skip documentation requirements

(default: `false`)

- 

`missing-docs-in-crate-items`:  Whether to only check for missing documentation in items visible within the current
crate. For example, `pub(crate)` items.

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/missing_doc.rs#L14

## missing_inline_in_public_items

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

It lints if an exported function, method, trait method with default impl,
or trait method impl is not `#[inline]`.

### Why restrict this?

When a function is not marked `#[inline]`, it is not
a “small” candidate for automatic inlining, and LTO is not in use, then it is not
possible for the function to be inlined into the code of any crate other than the one in
which it is defined.  Depending on the role of the function and the relationship of the crates,
this could significantly reduce performance.

Certain types of crates might intend for most of the methods in their public API to be able
to be inlined across crates even when LTO is disabled.
This lint allows those crates to require all exported methods to be `#[inline]` by default, and
then opt out for specific methods where this might not make sense.

### Example

```rust
pub fn foo() {} // missing #[inline]
fn ok() {} // ok
#[inline] pub fn bar() {} // ok
#[inline(always)] pub fn baz() {} // ok

pub trait Bar {
  fn bar(); // ok
  fn def_bar() {} // missing #[inline]
}

struct Baz;
impl Baz {
    fn private() {} // ok
}

impl Bar for Baz {
  fn bar() {} // ok - Baz is not exported
}

pub struct PubBaz;
impl PubBaz {
    fn private() {} // ok
    pub fn not_private() {} // missing #[inline]
}

impl Bar for PubBaz {
    fn bar() {} // missing #[inline]
    fn def_bar() {} // missing #[inline]
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/missing_inline.rs#L8

## missing_trait_methods

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.66.0

### What it does

Checks if a provided method is used implicitly by a trait
implementation.

### Why restrict this?

To ensure that a certain implementation implements every method; for example,
a wrapper type where every method should delegate to the corresponding method of
the inner type’s implementation.

This lint should typically be enabled on a specific trait `impl` item
rather than globally.

### Example

```rust
trait Trait {
    fn required();

    fn provided() {}
}

#[warn(clippy::missing_trait_methods)]
impl Trait for Type {
    fn required() { /* ... */ }
}
```

Use instead:

```rust
trait Trait {
    fn required();

    fn provided() {}
}

#[warn(clippy::missing_trait_methods)]
impl Trait for Type {
    fn required() { /* ... */ }

    fn provided() { /* ... */ }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/missing_trait_methods.rs#L11

## mixed_read_write_in_expression

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for a read and a write to the same variable where
whether the read occurs before or after the write depends on the evaluation
order of sub-expressions.

### Why restrict this?

While the evaluation order of sub-expressions is fully specified in Rust,
it still may be confusing to read an expression where the evaluation order
affects its behavior.

### Known problems

Code which intentionally depends on the evaluation
order, or which is correct for any evaluation order.

### Example

```rust
let mut x = 0;

let a = {
    x = 1;
    1
} + x;
// Unclear whether a is 1 or 2.
```

Use instead:

```rust
let tmp = {
    x = 1;
    1
};
let a = tmp + x;
```

### Past names

- eval_order_dependence

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/mixed_read_write_in_expression.rs#L38

## mod_module_files

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.57.0

### What it does

Checks that module layout uses only self named module files; bans `mod.rs` files.

### Why restrict this?

Having multiple module layout styles in a project can be confusing.

### Example

```rust
src/
  stuff/
    stuff_files.rs
    mod.rs
  lib.rs
```

Use instead:

```rust
src/
  stuff/
    stuff_files.rs
  stuff.rs
  lib.rs
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/module_style.rs#L43

## module_name_repetitions

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.33.0

### What it does

Detects public item names that are prefixed or suffixed by the
containing public module’s name.

### Why is this bad?

It requires the user to type the module name twice in each usage,
especially if they choose to import the module rather than its contents.

Lack of such repetition is also the style used in the Rust standard library;
e.g. `io::Error` and `fmt::Error` rather than `io::IoError` and `fmt::FmtError`;
and `array::from_ref` rather than `array::array_from_ref`.

### Known issues

Glob re-exports are ignored; e.g. this will not warn even though it should:

```rust
pub mod foo {
    mod iteration {
        pub struct FooIter {}
    }
    pub use iteration::*; // creates the path `foo::FooIter`
}
```

### Example

```rust
mod cake {
    struct BlackForestCake;
}
```

Use instead:

```rust
mod cake {
    struct BlackForest;
}
```

### Past names

- stutter

### Configuration

- 

`allow-exact-repetitions`:  Whether an item should be allowed to have the same name as its containing module

(default: `true`)

- 

`allowed-prefixes`:  List of prefixes to allow when determining whether an item’s name ends with the module’s name.
If the rest of an item’s name is an allowed prefix (e.g. item `ToFoo` or `to_foo` in module `foo`),
then don’t emit a warning.

#### Example

```rust
allowed-prefixes = [ "to", "from" ]
```

#### Noteworthy

- 

By default, the following prefixes are allowed: `to`, `as`, `into`, `from`, `try_into` and `try_from`

- 

PascalCase variant is included automatically for each snake_case variant (e.g. if `try_into` is included,
`TryInto` will also be included)

- 

Use `".."` as part of the list to indicate that the configured values should be appended to the
default configuration of Clippy. By default, any configuration will replace the default value

(default: `["to", "as", "into", "from", "try_into", "try_from"]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/item_name_repetitions.rs#L78

## modulo_arithmetic

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.42.0

### What it does

Checks for modulo arithmetic.

### Why restrict this?

The results of modulo (`%`) operation might differ
depending on the language, when negative numbers are involved.
If you interop with different languages it might be beneficial
to double check all places that use modulo arithmetic.

For example, in Rust `17 % -3 = 2`, but in Python `17 % -3 = -1`.

### Example

```rust
let x = -17 % 3;
```

### Configuration

- 

`allow-comparison-to-zero`:  Don’t lint when comparing the result of a modulo operation to zero.

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L810

## multiple_inherent_impl

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for multiple inherent implementations of a struct

The config option controls the scope in which multiple inherent `impl` blocks for the same
struct are linted, allowing values of `module` (only within the same module), `file`
(within the same file), or `crate` (anywhere in the crate, default).

### Why restrict this?

Splitting the implementation of a type makes the code harder to navigate.

### Example

```rust
struct X;
impl X {
    fn one() {}
}
impl X {
    fn other() {}
}
```

Could be written:

```rust
struct X;
impl X {
    fn one() {}
    fn other() {}
}
```

### Configuration

- 

`inherent-impl-lint-scope`:  Sets the scope (“crate”, “file”, or “module”) in which duplicate inherent `impl` blocks for the same type are linted.

(default: `"crate"`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/inherent_impl.rs#L12

## multiple_unsafe_ops_per_block

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.69.0

### What it does

Checks for `unsafe` blocks that contain more than one unsafe operation.

### Why restrict this?

Combined with `undocumented_unsafe_blocks`,
this lint ensures that each unsafe operation must be independently justified.
Combined with `unused_unsafe`, this lint also ensures
elimination of unnecessary unsafe blocks through refactoring.

### Example

```rust
/// Reads a `char` from the given pointer.
///
/// # Safety
///
/// `ptr` must point to four consecutive, initialized bytes which
/// form a valid `char` when interpreted in the native byte order.
fn read_char(ptr: *const u8) -> char {
    // SAFETY: The caller has guaranteed that the value pointed
    // to by `bytes` is a valid `char`.
    unsafe { char::from_u32_unchecked(*ptr.cast::<u32>()) }
}
```

Use instead:

```rust
/// Reads a `char` from the given pointer.
///
/// # Safety
///
/// - `ptr` must be 4-byte aligned, point to four consecutive
///   initialized bytes, and be valid for reads of 4 bytes.
/// - The bytes pointed to by `ptr` must represent a valid
///   `char` when interpreted in the native byte order.
fn read_char(ptr: *const u8) -> char {
    // SAFETY: `ptr` is 4-byte aligned, points to four consecutive
    // initialized bytes, and is valid for reads of 4 bytes.
    let int_value = unsafe { *ptr.cast::<u32>() };

    // SAFETY: The caller has guaranteed that the four bytes
    // pointed to by `bytes` represent a valid `char`.
    unsafe { char::from_u32_unchecked(int_value) }
}
```

### Notes

- Unsafe operations only count towards the total for the innermost
enclosing `unsafe` block.

- Each call to a macro expanding to unsafe operations count for one
unsafe operation.

- Taking a raw pointer to a union field is always safe and will
not be considered unsafe by this lint, even when linting code written
with a specified Rust version of 1.91 or earlier (which required
using an `unsafe` block).

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/multiple_unsafe_ops_per_block.rs#L14

## must_use_without_reason

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.99.0

### What it does

Checks for `#[must_use]` attributes without a reason.

### Why restrict this?

A reason explains why the return value must be used. Without it,
users only see a generic “unused must-use value” message which is less helpful.

### Example

```rust
#[must_use]
fn compute() -> i32 { 42 }
```

Use instead:

```rust
#[must_use = "computation is expensive"]
fn compute() -> i32 { 42 }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/functions/mod.rs#L196

## mutex_atomic

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `Mutex<X>` where an atomic will do.

### Why restrict this?

Using a mutex just to make access to a plain bool or
reference sequential is shooting flies with cannons.
`std::sync::atomic::AtomicBool` and `std::sync::atomic::AtomicPtr` are leaner and
faster.

On the other hand, `Mutex`es are, in general, easier to
verify correctness. An atomic does not behave the same as
an equivalent mutex. See this issue’s
commentary for more details.

### Known problems

- This lint cannot detect if the mutex is actually used
for waiting before a critical section.

- This lint has a false positive that warns without considering the case
where `Mutex` is used together with `Condvar`.

### Example

```rust
let x = Mutex::new(&y);
```

Use instead:

```rust
let x = AtomicBool::new(y);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/mutex_atomic.rs#L13

## mutex_integer

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `Mutex<X>` where `X` is an integral
type.

### Why restrict this?

Using a mutex just to make access to a plain integer
sequential is
shooting flies with cannons. `std::sync::atomic::AtomicUsize` is leaner and faster.

On the other hand, `Mutex`es are, in general, easier to
verify correctness. An atomic does not behave the same as
an equivalent mutex. See this issue’s
commentary for more details.

### Known problems

- This lint cannot detect if the mutex is actually used
for waiting before a critical section.

- This lint has a false positive that warns without considering the case
where `Mutex` is used together with `Condvar`.

- This lint suggest using `AtomicU64` instead of `Mutex<u64>`, but
`AtomicU64` is not available on some 32-bit platforms.

### Example

```rust
let x = Mutex::new(0usize);
```

Use instead:

```rust
let x = AtomicUsize::new(0usize);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/mutex_atomic.rs#L53

## needless_raw_strings

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.72.0

### What it does

Checks for raw string literals where a string literal can be used instead.

### Why restrict this?

For consistent style by using simpler string literals whenever possible.

However, there are many cases where using a raw string literal is more
idiomatic than a string literal, so it’s opt-in.

### Example

```rust
let r = r"Hello, world!";
```

Use instead:

```rust
let r = "Hello, world!";
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/raw_strings.rs#L34

## non_ascii_literal

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for non-ASCII characters in string and char literals.

### Why restrict this?

Yeah, we know, the 90’s called and wanted their charset
back. Even so, there still are editors and other programs out there that
don’t work well with Unicode. So if the code is meant to be used
internationally, on multiple operating systems, or has other portability
requirements, activating this lint could be useful.

### Example

```rust
let x = String::from("€");
```

Use instead:

```rust
let x = String::from("\u{20ac}");
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unicode.rs#L29

## non_zero_suggestions

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.83.0

### What it does

Checks for conversions from `NonZero` types to regular integer types,
and suggests using `NonZero` types for the target as well.

### Why is this bad?

Converting from `NonZero` types to regular integer types and then back to `NonZero`
types is less efficient and loses the type-safety guarantees provided by `NonZero` types.
Using `NonZero` types consistently can lead to more optimized code and prevent
certain classes of errors related to zero values.

### Example

```rust
use std::num::{NonZeroU32, NonZeroU64};

fn example(x: u64, y: NonZeroU32) {
    // Bad: Converting NonZeroU32 to u64 unnecessarily
    let r1 = x / u64::from(y.get());
    let r2 = x % u64::from(y.get());
}
```

Use instead:

```rust
use std::num::{NonZeroU32, NonZeroU64};

fn example(x: u64, y: NonZeroU32) {
    // Good: Preserving the NonZero property
    let r1 = x / NonZeroU64::from(y);
    let r2 = x % NonZeroU64::from(y);
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/non_zero_suggestions.rs#L10

## panic

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.40.0

### What it does

Checks for usage of `panic!`.

### Why restrict this?

This macro, or panics in general, may be unwanted in production code.

### Example

```rust
panic!("even with a good reason");
```

### Configuration

- 

`allow-panic-in-tests`:  Whether `panic` should be allowed in test functions or `#[cfg(test)]`

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/panic_unimplemented.rs#L14

## panic_in_result_fn

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.48.0

### What it does

Checks for usage of `panic!` or assertions in a function whose return type is `Result`.

### Why restrict this?

For some codebases, it is desirable for functions of type result to return an error instead of crashing. Hence panicking macros should be avoided.

### Known problems

Functions called from a function returning a `Result` may invoke a panicking macro. This is not checked.

### Example

```rust
fn result_with_panic() -> Result<bool, String>
{
    panic!("error");
}
```

Use instead:

```rust
fn result_without_panic() -> Result<bool, String> {
    Err(String::from("error"))
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/panic_in_result_fn.rs#L13

## partial_pub_fields

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.66.0

### What it does

Checks whether some but not all fields of a `struct` are public.

Either make all fields of a type public, or make none of them public

### Why restrict this?

Most types should either be:

- Abstract data types: complex objects with opaque implementation which guard
interior invariants and expose intentionally limited API to the outside world.

- Data: relatively simple objects which group a bunch of related attributes together,
but have no invariants.

### Example

```rust
pub struct Color {
    pub r: u8,
    pub g: u8,
    b: u8,
}
```

Use instead:

```rust
pub struct Color {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/partial_pub_fields.rs#L5

## pathbuf_init_then_push

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.82.0

### What it does

Checks for calls to `push` immediately after creating a new `PathBuf`.

### Why is this bad?

Multiple `.join()` calls are usually easier to read than multiple `.push`
calls across multiple statements. It might also be possible to use
`PathBuf::from` instead.

### Known problems

`.join()` introduces an implicit `clone()`. `PathBuf::from` can alternatively be
used when the `PathBuf` is newly constructed. This will avoid the implicit clone.

### Example

```rust
let mut path_buf = PathBuf::new();
path_buf.push("foo");
```

Use instead:

```rust
let path_buf = PathBuf::from("foo");
// or
let path_buf = PathBuf::new().join("foo");
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/pathbuf_init_then_push.rs#L12

## pattern_type_mismatch

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.47.0

### What it does

Checks for patterns that aren’t exact representations of the types
they are applied to.

To satisfy this lint, you will have to adjust either the expression that is matched
against or the pattern itself, as well as the bindings that are introduced by the
adjusted patterns. For matching you will have to either dereference the expression
with the `*` operator, or amend the patterns to explicitly match against `&<pattern>`
or `&mut <pattern>` depending on the reference mutability. For the bindings you need
to use the inverse. You can leave them as plain bindings if you wish for the value
to be copied, but you must use `ref mut <variable>` or `ref <variable>` to construct
a reference into the matched structure.

If you are looking for a way to learn about ownership semantics in more detail, it
is recommended to look at IDE options available to you to highlight types, lifetimes
and reference semantics in your code. The available tooling would expose these things
in a general way even outside of the various pattern matching mechanics. Of course
this lint can still be used to highlight areas of interest and ensure a good understanding
of ownership semantics.

### Why restrict this?

It increases ownership hints in the code, and will guard against some changes
in ownership.

### Example

This example shows the basic adjustments necessary to satisfy the lint. Note how
the matched expression is explicitly dereferenced with `*` and the `inner` variable
is bound to a shared borrow via `ref inner`.

```rust
// Bad
let value = &Some(Box::new(23));
match value {
    Some(inner) => println!("{}", inner),
    None => println!("none"),
}

// Good
let value = &Some(Box::new(23));
match *value {
    Some(ref inner) => println!("{}", inner),
    None => println!("none"),
}
```

The following example demonstrates one of the advantages of the more verbose style.
Note how the second version uses `ref mut a` to explicitly declare `a` a shared mutable
borrow, while `b` is simply taken by value. This ensures that the loop body cannot
accidentally modify the wrong part of the structure.

```rust
// Bad
let mut values = vec![(2, 3), (3, 4)];
for (a, b) in &mut values {
    *a += *b;
}

// Good
let mut values = vec![(2, 3), (3, 4)];
for &mut (ref mut a, b) in &mut values {
    *a += b;
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/pattern_type_mismatch.rs#L10

## pointer_format

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.89.0

### What it does

Detects pointer format as well as `Debug` formatting of raw pointers or function pointers
or any types that have a derived `Debug` impl that recursively contains them.

### Why restrict this?

The addresses are only useful in very specific contexts, and certain projects may want to keep addresses of
certain data structures or functions from prying hacker eyes as an additional line of security.

### Known problems

The lint currently only looks through derived `Debug` implementations. Checking whether a manual
implementation prints an address is left as an exercise to the next lint implementer.

### Example

```rust
let foo = &0_u32;
fn bar() {}
println!("{:p}", foo);
let _ = format!("{:?}", &(bar as fn()));
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/format_args.rs#L61

## precedence_bits

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.86.0

### What it does

Checks for bit shifting operations combined with bit masking/combining operators
and suggest using parentheses.

### Why restrict this?

Not everyone knows the precedence of those operators by
heart, so expressions like these may trip others trying to reason about the
code.

### Example

`0x2345 & 0xF000 >> 12` equals 5, while `(0x2345 & 0xF000) >> 12` equals 2

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/precedence.rs#L28

## print_stderr

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.50.0

### What it does

Checks for printing on stderr. The purpose of this lint
is to catch debugging remnants.

### Why restrict this?

People often print on stderr while debugging an
application and might forget to remove those prints afterward.

### Known problems

Only catches `eprint!` and `eprintln!` calls.

### Example

```rust
eprintln!("Hello world!");
```

### Configuration

- 

`allow-print-in-tests`:  Whether print macros (ex. `println!`) should be allowed in test functions or `#[cfg(test)]`

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/write/mod.rs#L37

## print_stdout

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for printing on stdout. The purpose of this lint
is to catch debugging remnants.

### Why restrict this?

People often print on stdout while debugging an
application and might forget to remove those prints afterward.

### Known problems

Only catches `print!` and `println!` calls.

### Example

```rust
println!("Hello world!");
```

### Configuration

- 

`allow-print-in-tests`:  Whether print macros (ex. `println!`) should be allowed in test functions or `#[cfg(test)]`

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/write/mod.rs#L59

## pub_use

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.62.0

### What it does

Restricts the usage of `pub use ...`

### Why restrict this?

A project may wish to limit `pub use` instances to prevent
unintentional exports, or to encourage placing exported items directly in public modules.

### Example

```rust
pub mod outer {
    mod inner {
        pub struct Test {}
    }
    pub use inner::Test;
}

use outer::Test;
```

Use instead:

```rust
pub mod outer {
    pub struct Test {}
}

use outer::Test;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/pub_use.rs#L5

## pub_with_shorthand

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.72.0

### What it does

Checks for usage of `pub(<loc>)` with `in`.

### Why restrict this?

Consistency. Use it or don’t, just be consistent about it.

Also see the `pub_without_shorthand` lint for an alternative.

### Example

```rust
pub(super) type OptBox<T> = Option<Box<T>>;
```

Use instead:

```rust
pub(in super) type OptBox<T> = Option<Box<T>>;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/visibility.rs#L30

## pub_without_shorthand

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.72.0

### What it does

Checks for usage of `pub(<loc>)` without `in`.

Note: As you cannot write a module’s path in `pub(<loc>)`, this will only trigger on
`pub(super)` and the like.

### Why restrict this?

Consistency. Use it or don’t, just be consistent about it.

Also see the `pub_with_shorthand` lint for an alternative.

### Example

```rust
pub(in super) type OptBox<T> = Option<Box<T>>;
```

Use instead:

```rust
pub(super) type OptBox<T> = Option<Box<T>>;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/visibility.rs#L53

## question_mark_used

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.69.0

### What it does

Checks for expressions that use the `?` operator and rejects them.

### Why restrict this?

Sometimes code wants to avoid the `?` operator because for instance a local
block requires a macro to re-throw errors to attach additional information to the
error.

### Example

```rust
let result = expr?;
```

Could be written:

```rust
utility_macro!(expr);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/question_mark_used.rs#L6

## rc_buffer

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.48.0

### What it does

Checks for `Rc<T>` and `Arc<T>` when `T` is a mutable buffer type such as `String` or `Vec`.

### Why restrict this?

Expressions such as `Rc<String>` usually have no advantage over `Rc<str>`, since
it is larger and involves an extra level of indirection, and doesn’t implement `Borrow<str>`.

While mutating a buffer type would still be possible with `Rc::get_mut()`, it only
works if there are no additional references yet, which usually defeats the purpose of
enclosing it in a shared ownership type. Instead, additionally wrapping the inner
type with an interior mutable container (such as `RefCell` or `Mutex`) would normally
be used.

### Known problems

This pattern can be desirable to avoid the overhead of a `RefCell` or `Mutex` for
cases where mutation only happens before there are any additional references.

### Example

```rust
fn foo(interned: Rc<String>) { ... }
```

Better:

```rust
fn foo(interned: Rc<str>) { ... }
```

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/types/mod.rs#L198

## rc_mutex

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.55.0

### What it does

Checks for `Rc<Mutex<T>>`.

### Why restrict this?

`Rc` is used in single thread and `Mutex` is used in multi thread.
Consider using `Rc<RefCell<T>>` in single thread or `Arc<Mutex<T>>` in multi thread.

### Known problems

Sometimes combining generic types can lead to the requirement that a
type use Rc in conjunction with Mutex. We must consider those cases false positives, but
alas they are quite hard to rule out. Luckily they are also rare.

### Example

```rust
use std::rc::Rc;
use std::sync::Mutex;
fn foo(interned: Rc<Mutex<i32>>) { ... }
```

Better:

```rust
use std::rc::Rc;
use std::cell::RefCell
fn foo(interned: Rc<RefCell<i32>>) { ... }
```

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/types/mod.rs#L233

## redundant_test_prefix

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.88.0

### What it does

Checks for test functions (functions annotated with `#[test]`) that are prefixed
with `test_` which is redundant.

### Why is this bad?

This is redundant because test functions are already annotated with `#[test]`.
Moreover, it clutters the output of `cargo test` since test functions are expanded as
`module::tests::test_use_case` in the output. Without the redundant prefix, the output
becomes `module::tests::use_case`, which is more readable.

### Example

```rust
#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn test_use_case() {
      // test code
  }
}
```

Use instead:

```rust
#[cfg(test)]
mod tests {
  use super::*;

  #[test]
  fn use_case() {
      // test code
  }
}
```

### Note

Clippy can only lint compiled code. For this lint to trigger, you must configure `cargo clippy`
to include test compilation, for instance, by using flags such as `--tests` or `--all-targets`.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/redundant_test_prefix.rs#L14

## redundant_type_annotations

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.72.0

### What it does

Warns about needless / redundant type annotations.

### Why restrict this?

Code without type annotations is shorter and in most cases
more idiomatic and easier to modify.

### Limitations

This lint doesn’t support:

- Generics

- Refs returned from anything else than a `MethodCall`

- Complex types (tuples, arrays, etc…)

- `Path` to anything else than a primitive type.

### Example

```rust
let foo: String = String::new();
```

Use instead:

```rust
let foo = String::new();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/redundant_type_annotations.rs#L9

## ref_patterns

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.71.0

### What it does

Checks for usages of the `ref` keyword.

### Why restrict this?

The `ref` keyword can be confusing for people unfamiliar with it, and often
it is more concise to use `&` instead.

### Example

```rust
let opt = Some(5);
if let Some(ref foo) = opt {}
```

Use instead:

```rust
let opt = Some(5);
if let Some(foo) = &opt {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/ref_patterns.rs#L6

## renamed_function_params

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.80.0

### What it does

Lints when the name of function parameters from trait impl is
different than its default implementation.

### Why restrict this?

Using the default name for parameters of a trait method is more consistent.

### Example

```rust
struct A(u32);

impl PartialEq for A {
    fn eq(&self, b: &Self) -> bool {
        self.0 == b.0
    }
}
```

Use instead:

```rust
struct A(u32);

impl PartialEq for A {
    fn eq(&self, other: &Self) -> bool {
        self.0 == other.0
    }
}
```

### Configuration

- `allow-renamed-params-for`:  List of trait paths to ignore when checking renamed function parameters.

#### Example

```rust
allow-renamed-params-for = [ "std::convert::From" ]
```

#### Noteworthy

- 

By default, the following traits are ignored: `From`, `TryFrom`, `FromStr`

- 

`".."` can be used as part of the list to indicate that the configured values should be appended to the
default configuration of Clippy. By default, any configuration will replace the default value.

(default: `["core::convert::From", "core::convert::TryFrom", "core::str::FromStr"]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/functions/mod.rs#L327

## rest_pat_in_fully_bound_structs

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.43.0

### What it does

Checks for unnecessary ‘..’ pattern binding on struct when all fields are explicitly matched.

### Why restrict this?

Correctness and readability. It’s like having a wildcard pattern after
matching all enum variants explicitly.

### Example

```rust
let a = A { a: 5 };

match a {
    A { a: 5, .. } => {},
    _ => {},
}
```

Use instead:

```rust
match a {
    A { a: 5 } => {},
    _ => {},
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L728

## rest_pattern_accessible_field

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.99.0

### What it does

Disallow the use of rest patterns for accessible fields

### Why restrict this?

It might lead to unhandled fields when the struct changes.

### Example

```rust
struct S {
    a: u8,
    b: u8,
    c: u8,
}

let s = S { a: 1, b: 2, c: 3 };

let S { a, b, .. } = s;
```

Use instead:

```rust
struct S {
    a: u8,
    b: u8,
    c: u8,
}

let s = S { a: 1, b: 2, c: 3 };

let S { a, b, c: _ } = s;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/rest_when_destructuring_struct.rs#L9

## return_and_then

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.86.0

### What it does

Detect functions that end with `Option::and_then` or `Result::and_then`, and suggest using
the `?` operator instead.

### Why is this bad?

The `and_then` method is used to chain a computation that returns an `Option` or a `Result`.
This can be replaced with the `?` operator, which is more concise and idiomatic.

### Example

```rust
fn test(opt: Option<i32>) -> Option<i32> {
    opt.and_then(|n| {
        if n > 1 {
            Some(n + 1)
        } else {
            None
       }
    })
}
```

Use instead:

```rust
fn test(opt: Option<i32>) -> Option<i32> {
    let n = opt?;
    if n > 1 {
        Some(n + 1)
    } else {
        None
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3496

## same_name_method

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.57.0

### What it does

It lints if a struct has two methods with the same name:
one from a trait, another not from a trait.

### Why restrict this?

Confusing.

### Example

```rust
trait T {
    fn foo(&self) {}
}

struct S;

impl T for S {
    fn foo(&self) {}
}

impl S {
    fn foo(&self) {}
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/same_name_method.rs#L11

## self_named_module_files

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.57.0

### What it does

Checks that module layout uses only `mod.rs` files.

### Why restrict this?

Having multiple module layout styles in a project can be confusing.

### Example

```rust
src/
  stuff/
    stuff_files.rs
  stuff.rs
  lib.rs
```

Use instead:

```rust
src/
  stuff/
    stuff_files.rs
    mod.rs
  lib.rs
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/module_style.rs#L72

## semicolon_inside_block

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.68.0

### What it does

Suggests moving the semicolon after a block to the inside of the block, after its last
expression.

### Why restrict this?

For consistency it’s best to have the semicolon inside/outside the block. Either way is fine
and this lint suggests inside the block.
Take a look at `semicolon_outside_block` for the other alternative.

### Example

```rust
unsafe { f(x) };
```

Use instead:

```rust
unsafe { f(x); }
```

### Configuration

- 

`semicolon-inside-block-ignore-singleline`:  Whether to lint only if it’s multiline.

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/semicolon_block.rs#L9

## semicolon_outside_block

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.68.0

### What it does

Suggests moving the semicolon from a block’s final expression outside of the block.

### Why restrict this?

For consistency it’s best to have the semicolon inside/outside the block. Either way is fine
and this lint suggests outside the block.
Take a look at `semicolon_inside_block` for the other alternative.

### Example

```rust
unsafe { f(x); }
```

Use instead:

```rust
unsafe { f(x) };
```

### Configuration

- 

`semicolon-outside-block-ignore-multiline`:  Whether to lint only if it’s singleline.

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/semicolon_block.rs#L39

## separated_literal_suffix

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.58.0

### What it does

Warns if literal suffixes are separated by an underscore.
To enforce separated literal suffix style,
see the `unseparated_literal_suffix` lint.

### Why restrict this?

Suffix style should be consistent.

### Example

```rust
123832_i32
```

Use instead:

```rust
123832i32
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/misc_early/mod.rs#L126

## shadow_reuse

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for bindings that shadow other bindings already in
scope, while reusing the original value.

### Why restrict this?

Some argue that name shadowing like this hurts readability,
because a value may be bound to different things depending on position in
the code.

See also `shadow_same` and `shadow_unrelated` for other restrictions on shadowing.

### Example

```rust
let x = 2;
let x = x + 1;
```

use different variable name:

```rust
let x = 2;
let y = x + 1;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/shadow.rs#L17

## shadow_same

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for bindings that shadow other bindings already in
scope, while just changing reference level or mutability.

### Why restrict this?

To require that what are formally distinct variables be given distinct names.

See also `shadow_reuse` and `shadow_unrelated` for other restrictions on shadowing.

### Example

```rust
let x = &x;
```

Use instead:

```rust
let y = &x; // use different variable name
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/shadow.rs#L45

## shadow_unrelated

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for bindings that shadow other bindings already in
scope, either without an initialization or with one that does not even use
the original value.

### Why restrict this?

Shadowing a binding with a closely related one is part of idiomatic Rust,
but shadowing a binding by accident with an unrelated one may indicate a mistake.

Additionally, name shadowing in general can hurt readability, especially in
large code bases, because it is easy to lose track of the active binding at
any place in the code. If linting against all shadowing is desired, you may wish
to use the `shadow_same` and `shadow_reuse` lints as well.

### Example

```rust
let x = y;
let x = z; // shadows the earlier binding
```

Use instead:

```rust
let x = y;
let w = z; // use different variable name
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/shadow.rs#L72

## single_call_fn

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.72.0

### What it does

Checks for functions that are only used once. Does not lint tests.

### Why restrict this?

If a function is only used once (perhaps because it used to be used more widely),
then the code could be simplified by moving that function’s code into its caller.

However, there are reasons not to do this everywhere:

- Splitting a large function into multiple parts often improves readability
by giving names to its parts.

- A function’s signature might serve a necessary purpose, such as constraining
the type of a closure passed to it.

- Generic functions might call non-generic functions to reduce duplication
in the produced machine code.

If this lint is used, prepare to `#[allow]` it a lot.

### Example

```rust
pub fn a<T>(t: &T)
where
    T: AsRef<str>,
{
    a_inner(t.as_ref())
}

fn a_inner(t: &str) {
    /* snip */
}

```

Use instead:

```rust
pub fn a<T>(t: &T)
where
    T: AsRef<str>,
{
    let t = t.as_ref();
    /* snip */
}

```

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/single_call_fn.rs#L11

## single_char_lifetime_names

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.60.0

### What it does

Checks for lifetimes with names which are one character
long.

### Why restrict this?

A single character is likely not enough to express the
purpose of a lifetime. Using a longer name can make code
easier to understand.

### Known problems

Rust programmers and learning resources tend to use single
character lifetimes, so this lint is at odds with the
ecosystem at large. In addition, the lifetime’s purpose may
be obvious or, rarely, expressible in one character.

### Example

```rust
struct DiagnosticCtx<'a> {
    source: &'a str,
}
```

Use instead:

```rust
struct DiagnosticCtx<'src> {
    source: &'src str,
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/single_char_lifetime_names.rs#L5

## std_instead_of_alloc

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.64.0

### What it does

Finds items imported through `std` when available through `alloc`.

### Why restrict this?

Crates which have `no_std` compatibility and require alloc may wish to ensure types are imported from
alloc to ensure disabling `std` does not cause the crate to fail to compile. This lint is also useful
for crates migrating to become `no_std` compatible.

### Example

```rust
use std::vec::Vec;
```

Use instead:

```rust
use alloc::vec::Vec;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/std_instead_of_core.rs#L43

## std_instead_of_core

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.64.0

### What it does

Finds items imported through `std` when available through `core`.

### Why restrict this?

Crates which have `no_std` compatibility may wish to ensure types are imported from core to ensure
disabling `std` does not cause the crate to fail to compile. This lint is also useful for crates
migrating to become `no_std` compatible.

### Example

```rust
use std::hash::Hasher;
```

Use instead:

```rust
use core::hash::Hasher;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/std_instead_of_core.rs#L67

## str_to_string

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

This lint checks for `.to_string()` method calls on values of type `&str`.

### Why restrict this?

The `to_string` method is also used on other types to convert them to a string.
When called on a `&str` it turns the `&str` into the owned variant `String`, which can be
more specifically expressed with `.to_owned()`.

### Example

```rust
let _ = "str".to_string();
```

Use instead:

```rust
let _ = "str".to_owned();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/strings.rs#L12

## string_add

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for all instances of `x + _` where `x` is of type
`String`, but only if `string_add_assign` does not
match.

### Why restrict this?

This particular
`Add` implementation is asymmetric (the other operand need not be `String`,
but `x` does), while addition as mathematically defined is symmetric, and
the `String::push_str(_)` function is a perfectly good replacement.
Therefore, some dislike it and wish not to have it in their code.

That said, other people think that string addition, having a long tradition
in other languages is actually fine, which is why we decided to make this
particular lint `allow` by default.

### Example

```rust
let x = "Hello".to_owned();
x + ", World";
```

Use instead:

```rust
let mut x = "Hello".to_owned();
x.push_str(", World");
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/strings.rs#L35

## string_lit_chars_any

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.73.0

### What it does

Checks for `<string_lit>.chars().any(|i| i == c)`.

### Why is this bad?

It’s significantly slower than using a pattern instead, like
`matches!(c, '\\' | '.' | '+')`.

Despite this being faster, this is not `perf` as this is pretty common, and is a rather nice
way to check if a `char` is any in a set. In any case, this `restriction` lint is available
for situations where that additional performance is absolutely necessary.

### Example

```rust
"\\.+*?()|[]{}^$#&-~".chars().any(|x| x == c);
```

Use instead:

```rust
matches!(c, '\\' | '.' | '+' | '*' | '(' | ')' | '|' | '[' | ']' | '{' | '}' | '^' | '$' | '#' | '&' | '-' | '~');
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3892

## string_slice

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.58.0

### What it does

Checks for slice operations on strings

### Why restrict this?

UTF-8 characters span multiple bytes, and it is easy to inadvertently confuse character
counts and string indices. This may lead to panics, and should warrant some test cases
containing wide UTF-8 characters. This lint is most useful in code that should avoid
panics at all costs.

### Known problems

Probably lots of false positives. If an index comes from a known valid position (e.g.
obtained via `char_indices` over the same string), it is totally OK.

### Example

```rust
&"Ölkanne"[1..];
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/strings.rs#L139

## suspicious_xor_used_as_pow

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.67.0

### What it does

Warns for a Bitwise XOR (`^`) operator being probably confused as a powering. It will not trigger if any of the numbers are not in decimal.

### Why restrict this?

It’s most probably a typo and may lead to unexpected behaviours.

### Example

```rust
let x = 3_i32 ^ 4_i32;
```

Use instead:

```rust
let x = 3_i32.pow(4);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/suspicious_xor_used_as_pow.rs#L9

## tests_outside_test_module

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.70.0

### What it does

Triggers when a testing function (marked with the `#[test]` attribute) isn’t inside a testing module
(marked with `#[cfg(test)]`).

### Why restrict this?

The idiomatic (and more performant) way of writing tests is inside a testing module (flagged with `#[cfg(test)]`),
having test functions outside of this module is confusing and may lead to them being “hidden”.

### Example

```rust
#[test]
fn my_cool_test() {
    // [...]
}

#[cfg(test)]
mod tests {
    // [...]
}

```

Use instead:

```rust
#[cfg(test)]
mod tests {
    #[test]
    fn my_cool_test() {
        // [...]
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/tests_outside_test_module.rs#L9

## todo

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.40.0

### What it does

Checks for usage of `todo!`.

### Why restrict this?

The `todo!` macro indicates the presence of unfinished code,
so it should not be present in production code.

### Example

```rust
todo!();
```

Finish the implementation, or consider marking it as explicitly unimplemented.

```rust
unimplemented!();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/panic_unimplemented.rs#L31

## try_err

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.38.0

### What it does

Checks for usage of `Err(x)?`.

### Why restrict this?

The `?` operator is designed to allow calls that
can fail to be easily chained. For example, `foo()?.bar()` or
`foo(bar()?)`. Because `Err(x)?` can’t be used that way (it will
always return), it is more clear to write `return Err(x)`.

### Example

```rust
fn foo(fail: bool) -> Result<i32, String> {
    if fail {
      Err("failed")?;
    }
    Ok(0)
}
```

Could be written:

```rust
fn foo(fail: bool) -> Result<i32, String> {
    if fail {
      return Err("failed".into());
    }
    Ok(0)
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L907

## undocumented_unsafe_blocks

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.58.0

### What it does

Checks for `unsafe` blocks and impls without a `// SAFETY: ` comment
explaining why the unsafe operations performed inside
the block are safe.

Note the comment must appear on the line(s) preceding the unsafe block
with nothing appearing in between. The following is ok:

```rust
foo(
    // SAFETY:
    // This is a valid safety comment
    unsafe { *x }
)
```

But neither of these are:

```rust
// SAFETY:
// This is not a valid safety comment
foo(
    /* SAFETY: Neither is this */ unsafe { *x },
);
```

### Why restrict this?

Undocumented unsafe blocks and impls can make it difficult to read and maintain code.
Writing out the safety justification may help in discovering unsoundness or bugs.

### Example

```rust
use std::ptr::NonNull;
let a = &mut 42;

let ptr = unsafe { NonNull::new_unchecked(a) };
```

Use instead:

```rust
use std::ptr::NonNull;
let a = &mut 42;

// SAFETY: references are guaranteed to be non-null.
let ptr = unsafe { NonNull::new_unchecked(a) };
```

### Configuration

- 

`accept-comment-above-attributes`:  Whether to accept a safety comment to be placed above the attributes for the `unsafe` block

(default: `true`)

- 

`accept-comment-above-statement`:  Whether to accept a safety comment to be placed above the statement containing the `unsafe` block

(default: `true`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/undocumented_unsafe_blocks.rs#L17

## unimplemented

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `unimplemented!`.

### Why restrict this?

This macro, or panics in general, may be unwanted in production code.

### Example

```rust
unimplemented!();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/panic_unimplemented.rs#L53

## unnecessary_rest_pattern

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.99.0

### What it does

Disallow the use of rest patterns that don’t capture any fields.

### Why restrict this?

It might lead to unhandled fields when the struct changes.

### Example

```rust
struct S {
    a: u8,
    b: u8,
    c: u8,
}

let s = S { a: 1, b: 2, c: 3 };

let S { a, b, c, .. } = s;
```

Use instead:

```rust
struct S {
    a: u8,
    b: u8,
    c: u8,
}

let s = S { a: 1, b: 2, c: 3 };

let S { a, b, c } = s;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/rest_when_destructuring_struct.rs#L46

## unnecessary_safety_comment

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.67.0

### What it does

Checks for `// SAFETY: ` comments on safe code.

### Why restrict this?

Safe code has no safety requirements, so there is no need to
describe safety invariants.

### Example

```rust
use std::ptr::NonNull;
let a = &mut 42;

// SAFETY: references are guaranteed to be non-null.
let ptr = NonNull::new(a).unwrap();
```

Use instead:

```rust
use std::ptr::NonNull;
let a = &mut 42;

let ptr = NonNull::new(a).unwrap();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/undocumented_unsafe_blocks.rs#L66

## unnecessary_safety_doc

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.67.0

### What it does

Checks for the doc comments of publicly visible
safe functions and traits and warns if there is a `# Safety` section.

### Why restrict this?

Safe functions and traits are safe to implement and therefore do not
need to describe safety preconditions that users are required to uphold.

### Examples

```rust
/// # Safety
///
/// This function should not be called before the horsemen are ready.
pub fn start_apocalypse_but_safely(u: &mut Universe) {
    unimplemented!();
}
```

The function is safe, so there shouldn’t be any preconditions
that have to be explained for safety reasons.

```rust
/// This function should really be documented
pub fn start_apocalypse(u: &mut Universe) {
    unimplemented!();
}
```

### Configuration

- 

`check-private-items`:  Whether to also run the listed lints on private items.

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/doc/mod.rs#L679

## unnecessary_self_imports

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.53.0

### What it does

Checks for imports ending in `::{self}`.

### Why restrict this?

In most cases, this can be written much more cleanly by omitting `::{self}`.

### Known problems

Removing `::{self}` will cause any non-module items at the same path to also be imported.
This might cause a naming conflict (rust-lang/rustfmt#3568). This lint makes no attempt
to detect this scenario and that is why it is a restriction lint.

### Example

```rust
use std::io::{self};
```

Use instead:

```rust
use std::io;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unnecessary_self_imports.rs#L7

## unneeded_field_pattern

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for structure field patterns bound to wildcards.

### Why restrict this?

Using `..` instead is shorter and leaves the focus on
the fields that are actually bound.

### Example

```rust
let f = Foo { a: 0, b: 0, c: 0 };

match f {
    Foo { a: _, b: 0, .. } => {},
    Foo { a: _, b: _, c: _ } => {},
}
```

Use instead:

```rust
let f = Foo { a: 0, b: 0, c: 0 };

match f {
    Foo { b: 0, .. } => {},
    Foo { .. } => {},
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/misc_early/mod.rs#L154

## unreachable

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.40.0

### What it does

Checks for usage of `unreachable!`.

### Why restrict this?

This macro, or panics in general, may be unwanted in production code.

### Example

```rust
unreachable!();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/panic_unimplemented.rs#L70

## unseparated_literal_suffix

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Warns if literal suffixes are not separated by an
underscore.
To enforce unseparated literal suffix style,
see the `separated_literal_suffix` lint.

### Why restrict this?

Suffix style should be consistent.

### Example

```rust
123832i32
```

Use instead:

```rust
123832_i32
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/misc_early/mod.rs#L236

## unused_result_ok

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.82.0

### What it does

Checks for calls to `Result::ok()` without using the returned `Option`.

### Why is this bad?

Using `Result::ok()` may look like the result is checked like `unwrap` or `expect` would do
but it only silences the warning caused by `#[must_use]` on the `Result`.

### Example

```rust
some_function().ok();
```

Use instead:

```rust
let _ = some_function();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unused_result_ok.rs#L9

## unused_trait_names

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.83.0

### What it does

Checks for `use Trait` where the Trait is only used for its methods and not referenced by a path directly.

### Why is this bad?

Traits imported that aren’t used directly can be imported anonymously with `use Trait as _`.
It is more explicit, avoids polluting the current scope with unused names and can be useful to show which imports are required for traits.

### Example

```rust
use std::fmt::Write;

fn main() {
    let mut s = String::new();
    let _ = write!(s, "hello, world!");
    println!("{s}");
}
```

Use instead:

```rust
use std::fmt::Write as _;

fn main() {
    let mut s = String::new();
    let _ = write!(s, "hello, world!");
    println!("{s}");
}
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unused_trait_names.rs#L13

## unwrap_in_result

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.48.0

### What it does

Checks for functions of type `Result` that contain `expect()` or `unwrap()`

### Why restrict this?

These functions promote recoverable errors to non-recoverable errors,
which may be undesirable in code bases which wish to avoid panics,
or be a bug in the specific function.

### Known problems

This can cause false positives in functions that handle both recoverable and non recoverable errors.

### Example

Before:

```rust
fn divisible_by_3(i_str: String) -> Result<(), String> {
    let i = i_str
        .parse::<i32>()
        .expect("cannot divide the input by three");

    if i % 3 != 0 {
        Err("Number is not divisible by 3")?
    }

    Ok(())
}
```

After:

```rust
fn divisible_by_3(i_str: String) -> Result<(), String> {
    let i = i_str
        .parse::<i32>()
        .map_err(|e| format!("cannot divide the input by three: {}", e))?;

    if i % 3 != 0 {
        Err("Number is not divisible by 3")?
    }

    Ok(())
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unwrap_in_result.rs#L10

## unwrap_used

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.45.0

### What it does

Checks for `.unwrap()` or `.unwrap_err()` calls on `Result`s and `.unwrap()` call on `Option`s.

### Why restrict this?

It is better to handle the `None` or `Err` case,
or at least call `.expect(_)` with a more helpful message. Still, for a lot of
quick-and-dirty code, `unwrap` is a good choice, which is why this lint is
`Allow` by default.

`result.unwrap()` will let the thread panic on `Err` values.
Normally, you want to implement more sophisticated error handling,
and propagate errors upwards with `?` operator.

Even if you want to panic on errors, not all `Error`s implement good
messages on display. Therefore, it may be beneficial to look at the places
where they may get displayed. Activate this lint to do just that.

### Examples

```rust
option.unwrap();
result.unwrap();
```

Use instead:

```rust
option.expect("more helpful message");
result.expect("more helpful message");
```

If expect_used is enabled, instead:

```rust
option?;

// or

result?;
```

### Past names

- option_unwrap_used

- result_unwrap_used

### Configuration

- 

`allow-unwrap-in-consts`:  Whether `unwrap` should be allowed in code always evaluated at compile time

(default: `true`)

- 

`allow-unwrap-in-tests`:  Whether `unwrap` should be allowed in test functions or `#[cfg(test)]`

(default: `false`)

- 

`allow-unwrap-types`:  List of types to allow `unwrap()` and `expect()` on.

#### Example

```rust
allow-unwrap-types = [ "std::sync::LockResult" ]
```

(default: `[]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4830

## use_debug

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `Debug` formatting. The purpose of this
lint is to catch debugging remnants.

### Why restrict this?

The purpose of the `Debug` trait is to facilitate debugging Rust code,
and no guarantees are made about its output.
It should not be used in user-facing output.

### Example

```rust
println!("{:?}", foo);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/write/mod.rs#L129

## verbose_file_reads

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.44.0

### What it does

Checks for usage of `File::read_to_end` and `File::read_to_string`.

### Why restrict this?

`fs::{read, read_to_string}` provide the same functionality when `buf` is empty with fewer imports and no intermediate values.
See also: fs::read docs, fs::read_to_string docs

### Example

```rust
let mut f = File::open("foo.txt").unwrap();
let mut bytes = Vec::new();
f.read_to_end(&mut bytes).unwrap();
```

Can be written more concisely as

```rust
let mut bytes = fs::read("foo.txt").unwrap();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4955

## wildcard_enum_match_arm

Grupo: `restriction` · Nível padrão: `allow` · Adicionado em: 1.34.0

### What it does

Checks for wildcard enum matches using `_`.

### Why restrict this?

New enum variants added by library updates can be missed.

### Known problems

Suggested replacements may be incorrect if guards exhaustively cover some
variants, and also may not use correct path to enum if it’s not present in the current scope.

### Example

```rust
match x {
    Foo::A(_) => {},
    _ => {},
}
```

Use instead:

```rust
match x {
    Foo::A(_) => {},
    Foo::B(_) => {},
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L942
