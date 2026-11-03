# Catálogo de lints do Clippy — grupo `complexity`

## bind_instead_of_map

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.45.0

### What it does

Checks for usage of `_.and_then(|x| Some(y))`, `_.and_then(|x| Ok(y))`
or `_.or_else(|x| Err(y))`.

### Why is this bad?

This can be written more concisely as `_.map(|x| y)` or `_.map_err(|x| y)`.

### Example

```rust
let _ = opt().and_then(|s| Some(s.len()));
let _ = res().and_then(|s| if s.len() == 42 { Ok(10) } else { Ok(20) });
let _ = res().or_else(|s| if s.len() == 42 { Err(10) } else { Err(20) });
```

The correct use would be:

```rust
let _ = opt().map(|s| s.len());
let _ = res().map(|s| if s.len() == 42 { 10 } else { 20 });
let _ = res().map_err(|s| if s.len() == 42 { 10 } else { 20 });
```

### Past names

- option_and_then_some

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L180

## bool_comparison

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for expressions of the form `x == true`,
`x != true` and order comparisons such as `x < true` (or vice versa) and
suggest using the variable directly.

### Why is this bad?

Unnecessary code.

### Example

```rust
if x == true {}
if y == false {}
```

use `x` directly:

```rust
if x {}
if !y {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/bool_comparison.rs#L10

## borrow_deref_ref

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.63.0

### What it does

Checks for `&*(&T)`.

### Why is this bad?

Dereferencing and then borrowing a reference value has no effect in most cases.

### Known problems

False negative on such code:

```rust
let x = &12;
let addr_x = &x as *const _ as usize;
let addr_y = &&*x as *const _ as usize; // assert ok now, and lint triggered.
                                        // But if we fix it, assert will fail.
assert_ne!(addr_x, addr_y);
```

### Example

```rust
let s = &String::new();

let a: &String = &* s;
```

Use instead:

```rust
let a: &String = s;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/borrow_deref_ref.rs#L15

## borrowed_box

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `&Box<T>` anywhere in the code.
Check the Box documentation for more information.

### Why is this bad?

A `&Box<T>` parameter requires the function caller to box `T` first before passing it to a function.
Using `&T` defines a concrete type for the parameter and generalizes the function, this would also
auto-deref to `&T` at the function call site if passed a `&Box<T>`.

### Example

```rust
fn foo(bar: &Box<T>) { ... }
```

Better:

```rust
fn foo(bar: &T) { ... }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/types/mod.rs#L24

## bytes_count_to_len

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.62.0

### What it does

It checks for `str::bytes().count()` and suggests replacing it with
`str::len()`.

### Why is this bad?

`str::bytes().count()` is longer and may not be as performant as using
`str::len()`.

### Example

```rust
"hello".bytes().count();
String::from("hello").bytes().count();
```

Use instead:

```rust
"hello".len();
String::from("hello").len();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L245

## char_lit_as_u8

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for expressions where a character literal is cast
to `u8` and suggests using a byte literal instead.

### Why is this bad?

In general, casting values to smaller types is
error-prone and should be avoided where possible. In the particular case of
converting a character literal to `u8`, it is easy to avoid by just using a
byte literal instead. As an added bonus, `b'a'` is also slightly shorter
than `'a' as u8`.

### Example

```rust
'x' as u8
```

A better version, using the byte literal:

```rust
b'x'
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L488

## clone_on_copy

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `.clone()` on a `Copy` type.

### Why is this bad?

The only reason `Copy` types implement `Clone` is for
generics, not for using the `clone` method on a concrete type.

### Example

```rust
42u64.clone();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L424

## default_constructed_unit_structs

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.71.0

### What it does

Checks for construction on unit struct using `default`.

### Why is this bad?

This adds code complexity and an unnecessary function call.

### Example

```rust
#[derive(Default)]
struct S<T> {
    _marker: PhantomData<T>
}

let _: S<i32> = S {
    _marker: PhantomData::default()
};
```

Use instead:

```rust
struct S<T> {
    _marker: PhantomData<T>
}

let _: S<i32> = S {
    _marker: PhantomData
};
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/default_constructed_unit_structs.rs#L12

## deprecated_cfg_attr

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.32.0

### What it does

Checks for `#[cfg_attr(rustfmt, rustfmt_skip)]` and suggests to replace it
with `#[rustfmt::skip]`.

### Why is this bad?

Since `tool_attributes` (rust-lang/rust#44690)
are stable now, they should be used instead of the old `cfg_attr(rustfmt)` attributes.

### Known problems

This lint doesn’t detect crate level inner attributes, because they get
processed before the pre-expansion pass lints get executed. See
#3123

### Example

```rust
#[cfg_attr(rustfmt, rustfmt_skip)]
fn main() { }
```

Use instead:

```rust
#[rustfmt::skip]
fn main() { }
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/attrs/mod.rs#L183

## deref_addrof

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `*&` and `*&mut` in expressions.

### Why is this bad?

Immediately dereferencing a reference is no-op and
makes the code less clear.

### Known problems

Multiple dereference/addrof pairs are not handled so
the suggested fix for `x = **&&y` is `x = *&y`, which is still incorrect.

### Example

```rust
let a = f(*&mut b);
let c = *&d;
```

Use instead:

```rust
let a = f(b);
let c = d;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/reference.rs#L9

## derivable_impls

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.57.0

### What it does

Detects manual `std::default::Default` implementations that are identical to a derived implementation.

### Why is this bad?

It is less concise.

### Example

```rust
struct Foo {
    bar: bool
}

impl Default for Foo {
    fn default() -> Self {
        Self {
            bar: false
        }
    }
}
```

Use instead:

```rust
#[derive(Default)]
struct Foo {
    bar: bool
}
```

### Known problems

Derive macros sometimes use incorrect bounds
in generic types and the user defined `impl` may be more generalized or
specialized than what derive will produce. This lint can’t detect the manual `impl`
has exactly equal bounds, and therefore this lint is disabled for types with
generic parameters.

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/derivable_impls.rs#L17

## diverging_sub_expression

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for diverging calls that are not match arms or
statements.

### Why is this bad?

It is often confusing to read. In addition, the
sub-expression evaluation order for Rust is not well documented.

### Known problems

Someone might want to use `some_bool || panic!()` as a
shorthand.

### Example

```rust
let a = b() || panic!() || c();
// `c()` is dead, `panic!()` is only called if `b()` returns `false`
let x = (a, b, c, panic!());
// can simply be replaced by `panic!()`
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/mixed_read_write_in_expression.rs#L10

## double_comparisons

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for double comparisons that could be simplified to a single expression.

### Why is this bad?

Readability.

### Example

```rust
if x == y || x < y {}
```

Use instead:

```rust
if x <= y {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L231

## double_parens

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for unnecessary double parentheses.

### Why is this bad?

This makes code harder to read and might indicate a
mistake.

### Example

```rust
fn simple_double_parens() -> i32 {
    ((0))
}

foo((0));
```

Use instead:

```rust
fn simple_no_parens() -> i32 {
    (0)
}

foo(0);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/double_parens.rs#L7

## duration_subsec

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for calculation of subsecond microseconds or milliseconds
from other `Duration` methods.

### Why is this bad?

It’s more concise to call `Duration::subsec_micros()` or
`Duration::subsec_millis()` than to calculate them.

### Example

```rust
let micros = duration.subsec_nanos() / 1_000;
let millis = duration.subsec_nanos() / 1_000_000;
```

Use instead:

```rust
let micros = duration.subsec_micros();
let millis = duration.subsec_millis();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L259

## excessive_nesting

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.72.0

### What it does

Checks for blocks which are nested beyond a certain threshold.

Note: Even though this lint is warn-by-default, it will only trigger if a maximum nesting level is defined in the clippy.toml file.

### Why is this bad?

It can severely hinder readability.

### Example

An example clippy.toml configuration:

```rust
excessive-nesting-threshold = 3
```

```rust
// lib.rs
pub mod a {
    pub struct X;
    impl X {
        pub fn run(&self) {
            if true {
                // etc...
            }
        }
    }
}
```

Use instead:

```rust
// a.rs
fn private_run(x: &X) {
    if true {
        // etc...
    }
}

pub struct X;
impl X {
    pub fn run(&self) {
        private_run(self);
    }
}
```

```rust
// lib.rs
pub mod a;
```

### Configuration

- 

`excessive-nesting-threshold`:  The maximum amount of nesting a block can reside in

(default: `0`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/excessive_nesting.rs#L10

## explicit_auto_deref

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.64.0

### What it does

Checks for dereferencing expressions which would be covered by auto-deref.

### Why is this bad?

This unnecessarily complicates the code.

### Example

```rust
let x = String::new();
let y: &str = &*x;
```

Use instead:

```rust
let x = String::new();
let y: &str = &x;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/dereference.rs#L26

## explicit_counter_loop

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks `for` loops over slices with an explicit counter
and suggests the use of `.enumerate()`.

### Why is this bad?

Using `.enumerate()` makes the intent more clear,
declutters the code and may be faster in some instances.

### Example

```rust
let mut i = 0;
for item in &v {
    bar(i, *item);
    i += 1;
}
```

Use instead:

```rust
for (i, item) in v.iter().enumerate() { bar(i, *item); }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L115

## explicit_write

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `write!()` / `writeln()!` which can be
replaced with `(e)print!()` / `(e)println!()`

### Why is this bad?

Using `(e)println!` is clearer and more concise

### Example

```rust
writeln!(&mut std::io::stderr(), "foo: {:?}", bar).unwrap();
writeln!(&mut std::io::stdout(), "foo: {:?}", bar).unwrap();
```

Use instead:

```rust
eprintln!("foo: {:?}", bar);
println!("foo: {:?}", bar);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/explicit_write.rs#L12

## extra_unused_lifetimes

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for lifetimes in generics that are never used
anywhere else.

### Why is this bad?

The additional lifetimes make the code look more
complicated, while there is nothing out of the ordinary going on. Removing
them leads to more readable code.

### Example

```rust
// unnecessary lifetimes
fn unused_lifetime<'a>(x: u8) {
    // ..
}
```

Use instead:

```rust
fn no_lifetime(x: u8) {
    // ...
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/lifetimes.rs#L62

## extra_unused_type_parameters

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.69.0

### What it does

Checks for type parameters in generics that are never used anywhere else.

### Why is this bad?

Functions cannot infer the value of unused type parameters; therefore, calling them
requires using a turbofish, which serves no purpose but to satisfy the compiler.

### Example

```rust
fn unused_ty<T>(x: u8) {
    // ..
}
```

Use instead:

```rust
fn no_unused_ty(x: u8) {
    // ..
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/extra_unused_type_parameters.rs#L16

## filter_map_identity

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.52.0

### What it does

Checks for usage of `filter_map(|x| x)`.

### Why is this bad?

Readability, this can be written more concisely by using `flatten`.

### Example

```rust
iter.filter_map(|x| x);
```

Use instead:

```rust
iter.flatten();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L867

## filter_next

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `_.filter(_).next()`.

### Why is this bad?

Readability, this can be written more concisely as
`_.find(_)`.

### Example

```rust
vec.iter().filter(|x| **x == 0).next();
```

Use instead:

```rust
vec.iter().find(|x| **x == 0);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L913

## flat_map_identity

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.39.0

### What it does

Checks for usage of `flat_map(|x| x)`.

### Why is this bad?

Readability, this can be written more concisely by using `flatten`.

### Example

```rust
iter.flat_map(|x| x);
```

Can be written as

```rust
iter.flatten();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L938

## get_last_with_len

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.37.0

### What it does

Checks for usage of `x.get(x.len() - 1)` instead of
`x.last()`.

### Why is this bad?

Using `x.last()` is easier to read and has the same
result.

Note that using `x[x.len() - 1]` is semantically different from
`x.last()`.  Indexing into the array will panic on out-of-bounds
accesses, while `x.get()` and `x.last()` will return `None`.

There is another lint (`get_unwrap`) that covers the case of using
`x.get(index).unwrap()` instead of `x[index]`.

### Example

```rust
let x = vec![2, 3, 5];
let last_element = x.get(x.len() - 1);
```

Use instead:

```rust
let x = vec![2, 3, 5];
let last_element = x.last();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1049

## identity_op

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for identity operations, e.g., `x + 0`.

### Why is this bad?

This code can be removed without changing the
meaning. So it just obscures what’s going on. Delete it mercilessly.

### Example

```rust
x / 1 + 0 * 1 - 0 | 0;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L521

## implied_bounds_in_impls

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.74.0

### What it does

Looks for bounds in `impl Trait` in return position that are implied by other bounds.
This can happen when a trait is specified that another trait already has as a supertrait
(e.g. `fn() -> impl Deref + DerefMut<Target = i32>` has an unnecessary `Deref` bound,
because `Deref` is a supertrait of `DerefMut`)

### Why is this bad?

Specifying more bounds than necessary adds needless complexity for the reader.

### Limitations

This lint does not check for implied bounds transitively. Meaning that
it doesn’t check for implied bounds from supertraits of supertraits
(e.g. `trait A {} trait B: A {} trait C: B {}`, then having an `fn() -> impl A + C`)

### Example

```rust
fn f() -> impl Deref<Target = i32> + DerefMut<Target = i32> {
//             ^^^^^^^^^^^^^^^^^^^ unnecessary bound, already implied by the `DerefMut` trait bound
    Box::new(123)
}
```

Use instead:

```rust
fn f() -> impl DerefMut<Target = i32> {
    Box::new(123)
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/implied_bounds_in_impls.rs#L16

## inspect_for_each

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.51.0

### What it does

Checks for usage of `inspect().for_each()`.

### Why is this bad?

It is the same as performing the computation
inside `inspect` at the beginning of the closure in `for_each`.

### Example

```rust
[1,2,3,4,5].iter()
.inspect(|&x| println!("inspect the number: {}", x))
.for_each(|&x| {
    assert!(x >= 0);
});
```

Can be written as

```rust
[1,2,3,4,5].iter()
.for_each(|&x| {
    println!("inspect the number: {}", x);
    assert!(x >= 0);
});
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1169

## int_plus_one

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `x >= y + 1` or `x - 1 >= y` (and `<=`) in a block

### Why is this bad?

Readability – better to use `> y` instead of `>= y + 1`.

### Example

```rust
if x >= y + 1 {}
```

Use instead:

```rust
if x > y {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/int_plus_one.rs#L9

## iter_count

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.52.0

### What it does

Checks for the use of `.iter().count()`.

### Why is this bad?

`.len()` is more efficient and more
readable.

### Example

```rust
let some_vec = vec![0, 1, 2, 3];

some_vec.iter().count();
&some_vec[..].iter().count();
```

Use instead:

```rust
let some_vec = vec![0, 1, 2, 3];

some_vec.len();
&some_vec[..].len();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1335

## iter_kv_map

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.66.0

### What it does

Checks for iterating a map (`HashMap` or `BTreeMap`) and
ignoring either the keys or values.

### Why is this bad?

Readability. There are `keys` and `values` methods that
can be used to express that we only need the keys or the values.

### Example

```rust
let map: HashMap<u32, u32> = HashMap::new();
let values = map.iter().map(|(_, value)| value).collect::<Vec<_>>();
```

Use instead:

```rust
let map: HashMap<u32, u32> = HashMap::new();
let values = map.values().collect::<Vec<_>>();
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1412

## let_with_type_underscore

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.70.0

### What it does

Detects when a variable is declared with an explicit type of `_`.

### Why is this bad?

It adds noise, `: _` provides zero clarity or utility.

### Example

```rust
let my_number: _ = 1;
```

Use instead:

```rust
let my_number = 1;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/let_with_type_underscore.rs#L8

## manual_abs_diff

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.88.0

### What it does

Detects patterns like `if a > b { a - b } else { b - a }` and suggests using `a.abs_diff(b)`.

### Why is this bad?

Using `abs_diff` is shorter, more readable, and avoids control flow.

### Examples

```rust
if a > b {
    a - b
} else {
    b - a
}
```

Use instead:

```rust
a.abs_diff(b)
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_abs_diff.rs#L14

## manual_c_str_literals

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.78.0

### What it does

Checks for the manual creation of C strings (a string with a `NUL` byte at the end), either
through one of the `CStr` constructor functions, or more plainly by calling `.as_ptr()`
on a (byte) string literal with a hardcoded `\0` byte at the end.

### Why is this bad?

This can be written more concisely using `c"str"` literals and is also less error-prone,
because the compiler checks for interior `NUL` bytes and the terminating `NUL` byte is inserted automatically.

### Example

```rust
fn needs_cstr(_: &CStr) {}

needs_cstr(CStr::from_bytes_with_nul(b"Hello\0").unwrap());
unsafe { libc::puts("World\0".as_ptr().cast()) }
```

Use instead:

```rust
fn needs_cstr(_: &CStr) {}

needs_cstr(c"Hello");
unsafe { libc::puts(c"World".as_ptr()) }
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1828

## manual_checked_ops

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.95.0

### What it does

Detects manual zero checks before dividing integers, such as `if x != 0 { y / x }`.

### Why is this bad?

`checked_div` already handles the zero case and makes the intent clearer while avoiding a
panic from a manual division.

### Example

```rust
if b != 0 {
    let result = a / b;
    println!("{result}");
}
```

Use instead:

```rust
if let Some(result) = a.checked_div(b) {
    println!("{result}");
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_checked_ops.rs#L10

## manual_clamp

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.66.0

### What it does

Identifies good opportunities for a clamp function from std or core, and suggests using it.

### Why is this bad?

clamp is much shorter, easier to read, and doesn’t use any control flow.

### Limitations

This lint will only trigger if max and min are known at compile time, and max is
greater than min.

### Known issue(s)

If the clamped variable is NaN this suggestion will cause the code to propagate NaN
rather than returning either `max` or `min`.

`clamp` functions will panic if `max < min`, `max.is_nan()`, or `min.is_nan()`.
Some may consider panicking in these situations to be desirable, but it also may
introduce panicking where there wasn’t any before.

See also the discussion in the
PR.

### Examples

```rust
if input > max {
    max
} else if input < min {
    min
} else {
    input
}
```

```rust
input.max(min).min(max)
```

```rust
match input {
    x if x > max => max,
    x if x < min => min,
    x => x,
}
```

```rust
let mut x = input;
if x < min { x = min; }
if x > max { x = max; }
```

Use instead:

```rust
input.clamp(min, max)
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_clamp.rs#L21

## manual_div_ceil

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.83.0

### What it does

Checks for an expression like `(x + (y - 1)) / y` which is a common manual reimplementation
of `x.div_ceil(y)`.

### Why is this bad?

It’s simpler, clearer and more readable.

### Example

```rust
let x: i32 = 7;
let y: i32 = 4;
let div = (x + (y - 1)) / y;
```

Use instead:

```rust
#![feature(int_roundings)]
let x: i32 = 7;
let y: i32 = 4;
let div = x.div_ceil(y);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L670

## manual_filter

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.66.0

### What it does

Checks for usage of `match` which could be implemented using `filter`

### Why is this bad?

Using the `filter` method is clearer and more concise.

### Example

```rust
match Some(0) {
    Some(x) => if x % 2 == 0 {
                    Some(x)
               } else {
                    None
                },
    None => None,
};
```

Use instead:

```rust
Some(0).filter(|&x| x % 2 == 0);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L112

## manual_filter_map

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.51.0

### What it does

Checks for usage of `_.filter(_).map(_)` that can be written more simply
as `filter_map(_)`.

### Why is this bad?

Redundant code in the `filter` and `map` operations is poor style and
less performant.

### Example

```rust
(0_i32..10)
    .filter(|n| n.checked_add(1).is_some())
    .map(|n| n.checked_add(1).unwrap());
```

Use instead:

```rust
(0_i32..10).filter_map(|n| n.checked_add(1));
```

### Past names

- filter_map

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1912

## manual_find

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.64.0

### What it does

Checks for manual implementations of `Iterator::find`

### Why is this bad?

It doesn’t affect performance, but using `find` is shorter and easier to read.

### Example

```rust
fn example(arr: Vec<i32>) -> Option<i32> {
    for el in arr {
        if el == 1 {
            return Some(el);
        }
    }
    None
}
```

Use instead:

```rust
fn example(arr: Vec<i32>) -> Option<i32> {
    arr.into_iter().find(|&el| el == 1)
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L334

## manual_find_map

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.51.0

### What it does

Checks for usage of `_.find(_).map(_)` that can be written more simply
as `find_map(_)`.

### Why is this bad?

Redundant code in the `find` and `map` operations is poor style and
less performant.

### Example

```rust
(0_i32..10)
    .find(|n| n.checked_add(1).is_some())
    .map(|n| n.checked_add(1).unwrap());
```

Use instead:

```rust
(0_i32..10).find_map(|n| n.checked_add(1));
```

### Past names

- find_map

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1938

## manual_flatten

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.52.0

### What it does

Checks for unnecessary `if let` usage in a for loop
where only the `Some` or `Ok` variant of the iterator element is used.

### Why is this bad?

It is verbose and can be simplified
by first calling the `flatten` method on the `Iterator`.

### Example

```rust
let x = vec![Some(1), Some(2), Some(3)];
for n in x {
    if let Some(n) = n {
        println!("{}", n);
    }
}
```

Use instead:

```rust
let x = vec![Some(1), Some(2), Some(3)];
for n in x.into_iter().flatten() {
    println!("{}", n);
}
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L365

## manual_hash_one

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.75.0

### What it does

Checks for cases where `BuildHasher::hash_one` can be used.

### Why is this bad?

It is more concise to use the `hash_one` method.

### Example

```rust
use std::hash::{BuildHasher, Hash, Hasher};
use std::collections::hash_map::RandomState;

let s = RandomState::new();
let value = vec![1, 2, 3];

let mut hasher = s.build_hasher();
value.hash(&mut hasher);
let hash = hasher.finish();
```

Use instead:

```rust
use std::hash::BuildHasher;
use std::collections::hash_map::RandomState;

let s = RandomState::new();
let value = vec![1, 2, 3];

let hash = s.hash_one(&value);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_hash_one.rs#L12

## manual_inspect

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.81.0

### What it does

Checks for uses of `map` which return the original item.

### Why is this bad?

`inspect` is both clearer in intent and shorter.

### Example

```rust
let x = Some(0).map(|x| { println!("{x}"); x });
```

Use instead:

```rust
let x = Some(0).inspect(|x| println!("{x}"));
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1964

## manual_is_multiple_of

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.90.0

### What it does

Checks for manual implementation of `.is_multiple_of()` on
unsigned integer types.

### Why is this bad?

`a.is_multiple_of(b)` is a clearer way to check for divisibility
of `a` by `b`. This expression can never panic.

### Example

```rust
if a % b == 0 {
    println!("{a} is divisible by {b}");
}
```

Use instead:

```rust
if a.is_multiple_of(b) {
    println!("{a} is divisible by {b}");
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L697

## manual_isolate_lowest_one

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.98.0

### What it does

Checks for manual implementations of isolating the lowest set bit.

### Why is this bad?

The manual bit-twiddling forms are harder to read than the standard library method.
Using `-x` can also overflow for signed minimum values.

### Example

```rust
let x: u32 = 5;
let lsb = x & x.wrapping_neg();
```

Use instead:

```rust
let x: u32 = 5;
let lsb = x.isolate_lowest_one();
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L726

## manual_main_separator_str

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.70.0

### What it does

Checks for references on `std::path::MAIN_SEPARATOR.to_string()` used
to build a `&str`.

### Why is this bad?

There exists a `std::path::MAIN_SEPARATOR_STR` which does not require
an extra memory allocation.

### Example

```rust
let s: &str = &std::path::MAIN_SEPARATOR.to_string();
```

Use instead:

```rust
let s: &str = std::path::MAIN_SEPARATOR_STR;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_main_separator_str.rs#L12

## manual_noop_waker

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.96.0

### What it does

Checks for manual implementations of `std::task::Wake` that are empty.

### Why is this bad?

`Waker::noop()` provides a more performant and cleaner way to create a
waker that does nothing, avoiding unnecessary `Arc` allocations and
reference count increments.

### Example

```rust
struct MyWaker;
impl Wake for MyWaker {
    fn wake(self: Arc<Self>) {}
    fn wake_by_ref(self: &Arc<Self>) {}
}
```

Use instead:

```rust
use std::task::Waker;
let waker = Waker::noop();
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_noop_waker.rs#L8

## manual_ok_err

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.86.0

### What it does

Checks for manual implementation of `.ok()` or `.err()`
on `Result` values.

### Why is this bad?

Using `.ok()` or `.err()` rather than a `match` or
`if let` is less complex and more readable.

### Example

```rust
let a = match func() {
    Ok(v) => Some(v),
    Err(_) => None,
};
let b = if let Err(v) = func() {
    Some(v)
} else {
    None
};
```

Use instead:

```rust
let a = func().ok();
let b = func().err();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L164

## manual_option_as_slice

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.86.0

### What it does

This detects various manual reimplementations of `Option::as_slice`.

### Why is this bad?

Those implementations are both more complex than calling `as_slice`
and unlike that incur a branch, pessimizing performance and leading
to more generated code.

### Example

```rust
_ = opt.as_ref().map_or(&[][..], std::slice::from_ref);
_ = match opt.as_ref() {
    Some(f) => std::slice::from_ref(f),
    None => &[],
};
```

Use instead:

```rust
_ = opt.as_slice();
_ = opt.as_slice();
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_option_as_slice.rs#L12

## manual_option_zip

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.96.0

### What it does

Checks for usage of `a.and_then(|a| b.map(|b| (a, b)))` which can be
more concisely expressed as `a.zip(b)`.

### Why is this bad?

`Option::zip` is more concise and directly expresses the intent of
combining two `Option` values into a tuple.

### Example

```rust
let a: Option<i32> = Some(1);
let b: Option<i32> = Some(2);
let _ = a.and_then(|x| b.map(|y| (x, y)));
```

Use instead:

```rust
let a: Option<i32> = Some(1);
let b: Option<i32> = Some(2);
let _ = a.zip(b);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2078

## manual_pop_if

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.96.0

### What it does

Checks for code to be replaced by `pop_if` methods.

### Why is this bad?

Using `pop_if` is more concise and idiomatic.

### Known issues

When the popped value is assigned or used in an expression,
or when the `if` condition is part of an `else if` branch, the
lint will trigger but will not provide an automatic suggestion.

### Examples

```rust
if vec.last().is_some_and(|x| *x > 5) {
    vec.pop().unwrap();
}
if deque.back().is_some_and(|x| *x > 5) {
    deque.pop_back().unwrap();
}
if deque.front().is_some_and(|x| *x > 5) {
    deque.pop_front().unwrap();
}
```

Use instead:

```rust
vec.pop_if(|x| *x > 5);
deque.pop_back_if(|x| *x > 5);
deque.pop_front_if(|x| *x > 5);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_pop_if.rs#L18

## manual_range_patterns

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.72.0

### What it does

Looks for combined OR patterns that are all contained in a specific range,
e.g. `6 | 4 | 5 | 9 | 7 | 8` can be rewritten as `4..=9`.

### Why is this bad?

Using an explicit range is more concise and easier to read.

### Known issues

This lint intentionally does not handle numbers greater than `i128::MAX` for `u128` literals
in order to support negative numbers.

For char and byte literal, only `a-zA-Z0-9` is linted, as ranges like `'<'..='>'` is not intuitive.

### Example

```rust
let x = 6;
let foo = matches!(x, 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10);
```

Use instead:

```rust
let x = 6;
let foo = matches!(x, 1..=10);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_range_patterns.rs#L10

## manual_rem_euclid

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.64.0

### What it does

Checks for an expression like `((x % 4) + 4) % 4` which is a common manual reimplementation
of `x.rem_euclid(4)`.

### Why is this bad?

It’s simpler and more readable.

### Example

```rust
let x: i32 = 24;
let rem = ((x % 4) + 4) % 4;
```

Use instead:

```rust
let x: i32 = 24;
let rem = x.rem_euclid(4);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_rem_euclid.rs#L13

## manual_slice_size_calculation

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.70.0

### What it does

When `a` is `&[T]`, detect `a.len() * size_of::<T>()` and suggest `size_of_val(a)`
instead.

### Why is this better?

- Shorter to write

- Removes the need for the human and the compiler to worry about overflow in the
multiplication

- Potentially faster at runtime as rust emits special no-wrapping flags when it
calculates the byte length

- Less turbofishing

### Example

```rust
let newlen = data.len() * size_of::<i32>();
```

Use instead:

```rust
let newlen = size_of_val(data);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_slice_size_calculation.rs#L12

## manual_split_once

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.57.0

### What it does

Checks for usage of `str::splitn(2, _)`

### Why is this bad?

`split_once` is both clearer in intent and slightly more efficient.

### Example

```rust
let s = "key=value=add";
let (key, value) = s.splitn(2, '=').next_tuple()?;
let value = s.splitn(2, '=').nth(1)?;

let mut parts = s.splitn(2, '=');
let key = parts.next()?;
let value = parts.next()?;
```

Use instead:

```rust
let s = "key=value=add";
let (key, value) = s.split_once('=')?;
let value = s.split_once('=')?.1;

let (key, value) = s.split_once('=')?;
```

### Limitations

The multiple statement variant currently only detects `iter.next()?`/`iter.next().unwrap()`
in two separate `let` statements that immediately follow the `splitn()`

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2158

## manual_strip

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.48.0

### What it does

Suggests using `strip_{prefix,suffix}` over `str::{starts,ends}_with` and slicing using
the pattern’s length.

### Why is this bad?

Using `str:strip_{prefix,suffix}` is safer and may have better performance as there is no
slicing which may panic and the compiler does not need to insert this panic code. It is
also sometimes more readable as it removes the need for duplicating or storing the pattern
used by `str::{starts,ends}_with` and in the slicing.

### Example

```rust
let s = "hello, world!";
if s.starts_with("hello, ") {
    assert_eq!(s["hello, ".len()..].to_uppercase(), "WORLD!");
}
```

Use instead:

```rust
let s = "hello, world!";
if let Some(end) = s.strip_prefix("hello, ") {
    assert_eq!(end.to_uppercase(), "WORLD!");
}
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_strip.rs#L20

## manual_swap

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for manual swapping.

Note that the lint will not be emitted in const blocks, as the suggestion would not be applicable.

### Why is this bad?

The `std::mem::swap` function exposes the intent better
without deinitializing or copying either variable.

### Example

```rust
let mut a = 42;
let mut b = 1337;

let t = b;
b = a;
a = t;
```

Use `std::mem::swap()`:

```rust
let mut a = 1;
let mut b = 2;
std::mem::swap(&mut a, &mut b);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/swap.rs#L47

## manual_take

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.95.0

### What it does

Detects manual re-implementations of `std::mem::take`.

### Why is this bad?

Because the function call is shorter and easier to read.

### Known issues

Currently the lint only detects cases involving `bool`s.

### Example

```rust
let mut x = true;
let _ = if x {
    x = false;
    true
} else {
    false
};
```

Use instead:

```rust
let mut x = true;
let _ = std::mem::take(&mut x);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/manual_take.rs#L11

## manual_unwrap_or

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.49.0

### What it does

Finds patterns that reimplement `Option::unwrap_or` or `Result::unwrap_or`.

### Why is this bad?

Concise code helps focusing on behavior instead of boilerplate.

### Example

```rust
let foo: Option<i32> = None;
match foo {
    Some(v) => v,
    None => 1,
};
```

Use instead:

```rust
let foo: Option<i32> = None;
foo.unwrap_or(1);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L198

## map_all_any_identity

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.84.0

### What it does

Checks for usage of `.map(…)`, followed by `.all(identity)` or `.any(identity)`.

### Why is this bad?

The `.all(…)` or `.any(…)` methods can be called directly in place of `.map(…)`.

### Example

```rust
let e1 = v.iter().map(|s| s.is_empty()).all(|a| a);
let e2 = v.iter().map(|s| s.is_empty()).any(std::convert::identity);
```

Use instead:

```rust
let e1 = v.iter().all(|s| s.is_empty());
let e2 = v.iter().any(|s| s.is_empty());
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2245

## map_flatten

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.31.0

### What it does

Checks for usage of `_.map(_).flatten(_)` on `Iterator`, `Option`, and `Result`.

### Why is this bad?

Readability. This can be written more concisely with `Iterator::flat_map`, `Option::and_then`, and
`Result::and_then`.

### Example

```rust
let vec = vec![vec![1]];
vec.iter().map(|x| x.iter()).flatten();

let opt = Some(5);
opt.map(|x| Some(x * 2)).flatten();

let res: Result<i32, String> = Ok(5);
res.map(|x| Ok(x * 2)).flatten();
```

Use instead:

```rust
let vec = vec![vec![1]];
vec.iter().flat_map(|x| x.iter());

let opt = Some(5);
opt.and_then(|x| Some(x * 2));

let res: Result<i32, String> = Ok(5);
res.and_then(|x| Ok(x * 2));
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2421

## map_identity

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.47.0

### What it does

Checks for instances of `map(f)` where `f` is the identity function.

### Why is this bad?

It can be written more concisely without the call to `map`.

### Example

```rust
let x = [1, 2, 3];
let y: Vec<_> = x.iter().map(|x| x).map(|x| 2*x).collect();
```

Use instead:

```rust
let x = [1, 2, 3];
let y: Vec<_> = x.iter().map(|x| 2*x).collect();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2458

## map_or_identity

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.97.0

### What it does

Checks the usage of `.map_or(...)` with an identity function for `Option` and `Result` types.

### Why is this bad?

This can be written more concisely by using `unwrap_or()`.

### Example

```rust
let opt = Some(1);
opt.map_or(42, |v| v);
```

Use instead:

```rust
let opt = Some(1);
opt.unwrap_or(42);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2481

## match_as_ref

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for match which is used to add a reference to an
`Option` value.

### Why is this bad?

Using `as_ref()` or `as_mut()` instead is shorter.

### Example

```rust
let x: Option<()> = None;

let r: Option<&()> = match x {
    None => None,
    Some(ref v) => Some(v),
};
```

Use instead:

```rust
let x: Option<()> = None;

let r: Option<&()> = x.as_ref();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L262

## match_single_binding

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.43.0

### What it does

Checks for useless match that binds to only one value.

### Why is this bad?

Readability and needless complexity.

### Known problems

Suggested replacements may be incorrect when `match`
is actually binding temporary value, bringing a ‘dropped while borrowed’ error.

### Example

```rust
match (a, b) {
    (c, d) => {
        // useless match
    }
}
```

Use instead:

```rust
let (c, d) = (a, b);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L465

## needless_arbitrary_self_type

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.47.0

### What it does

The lint checks for `self` in fn parameters that
specify the `Self`-type explicitly

### Why is this bad?

Increases the amount and decreases the readability of code

### Example

```rust
enum ValType {
    I32,
    I64,
    F32,
    F64,
}

impl ValType {
    pub fn bytes(self: Self) -> usize {
        match self {
            Self::I32 | Self::F32 => 4,
            Self::I64 | Self::F64 => 8,
        }
    }
}
```

Could be rewritten as

```rust
enum ValType {
    I32,
    I64,
    F32,
    F64,
}

impl ValType {
    pub fn bytes(self) -> usize {
        match self {
            Self::I32 | Self::F32 => 4,
            Self::I64 | Self::F64 => 8,
        }
    }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/needless_arbitrary_self_type.rs#L8

## needless_as_bytes

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.84.0

### What it does

It detects useless calls to `str::as_bytes()` before calling `len()` or `is_empty()`.

### Why is this bad?

The `len()` and `is_empty()` methods are also directly available on strings, and they
return identical results. In particular, `len()` on a string returns the number of
bytes.

### Example

```rust
let len = "some string".as_bytes().len();
let b = "some string".as_bytes().is_empty();
```

Use instead:

```rust
let len = "some string".len();
let b = "some string".is_empty();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2644

## needless_bool

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for expressions of the form `if c { true } else { false }` (or vice versa) and suggests using the condition directly.

This also covers the early-return guard form, where a condition returns a
tuple-like based on it.

### Why is this bad?

Redundant code.

### Known problems

Maybe false positives: Sometimes, the two branches are
painstakingly documented (which we, of course, do not detect), so they may
have some value. Even then, the documentation can be rewritten to match the
shorter code.

### Example

```rust
if x {
    false
} else {
    true
}
```

Use instead:

```rust
!x
```

Or, for the early-return guard form:

```rust
if c {
    return Ok(true);
}
Ok(false)
```

Use instead:

```rust
Ok(c)
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/needless_bool.rs#L16

## needless_bool_assign

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.71.0

### What it does

Checks for expressions of the form `if c { x = true } else { x = false }`
(or vice versa) and suggest assigning the variable directly from the
condition.

### Why is this bad?

Redundant code.

### Example

```rust
if must_keep(x, y) {
    skip = false;
} else {
    skip = true;
}
```

Use instead:

```rust
skip = !must_keep(x, y);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/needless_bool.rs#L73

## needless_borrowed_reference

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for bindings that needlessly destructure a reference and borrow the inner
value with `&ref`.

### Why is this bad?

This pattern has no effect in almost all cases.

### Example

```rust
let mut v = Vec::<String>::new();
v.iter_mut().filter(|&ref a| a.is_empty());

if let &[ref first, ref second] = v.as_slice() {}
```

Use instead:

```rust
let mut v = Vec::<String>::new();
v.iter_mut().filter(|a| a.is_empty());

if let [first, second] = v.as_slice() {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/needless_borrowed_ref.rs#L7

## needless_ifs

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.72.0

### What it does

Checks for empty `if` branches with no else branch.

### Why is this bad?

It can be entirely omitted, and often the condition too.

### Known issues

This will usually only suggest to remove the `if` statement, not the condition. Other lints
such as `no_effect` will take care of removing the condition if it’s unnecessary.

### Example

```rust
if really_expensive_condition(&i) {}
if really_expensive_condition_with_side_effects(&mut i) {}
```

Use instead:

```rust
// <omitted>
really_expensive_condition_with_side_effects(&mut i);
```

### Past names

- needless_if

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/needless_ifs.rs#L9

## needless_lifetimes

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for lifetime annotations which can be removed by
relying on lifetime elision.

### Why is this bad?

The additional lifetimes make the code look more
complicated, while there is nothing out of the ordinary going on. Removing
them leads to more readable code.

### Known problems

This lint ignores functions with `where` clauses that reference
lifetimes to prevent false positives.

### Example

```rust
// Unnecessary lifetime annotations
fn in_and_out<'a>(x: &'a u8, y: u8) -> &'a u8 {
    x
}
```

Use instead:

```rust
fn elided(x: &u8, y: u8) -> &u8 {
    x
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/lifetimes.rs#L92

## needless_match

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.61.0

### What it does

Checks for unnecessary `match` or match-like `if let` returns for `Option` and `Result`
when function signatures are the same.

### Why is this bad?

This `match` block does nothing and might not be what the coder intended.

### Example

```rust
fn foo() -> Result<(), i32> {
    match result {
        Ok(val) => Ok(val),
        Err(err) => Err(err),
    }
}

fn bar() -> Option<i32> {
    if let Some(val) = option {
        Some(val)
    } else {
        None
    }
}
```

Could be replaced as

```rust
fn foo() -> Result<(), i32> {
    result
}

fn bar() -> Option<i32> {
    option
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L591

## needless_nonzero_get

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.99.0

### What it does

Checks for `NonZero::get` calls that are immediately followed by a method or operator
which `NonZero` provides itself, with the same return type.

### Why is this bad?

The `get` call adds nothing but noise, as the method could be called on the
`NonZero` value directly.

### Example

```rust
let _ = nz.get().leading_zeros();
```

Use instead:

```rust
let _ = nz.leading_zeros();
```

The lint also handles division and remainder operators:

```rust
let _ = 4 / nz.get();
```

Use instead:

```rust
let _ = 4 / nz;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/needless_nonzero_get.rs#L13

## needless_option_as_deref

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.57.0

### What it does

Checks for no-op uses of `Option::{as_deref, as_deref_mut}`,
for example, `Option<&T>::as_deref()` returns the same type.

### Why is this bad?

Redundant code and improving readability.

### Example

```rust
let a = Some(&1);
let b = a.as_deref(); // goes from Option<&i32> to Option<&i32>
```

Use instead:

```rust
let a = Some(&1);
let b = a;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2715

## needless_option_take

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.62.0

### What it does

Checks for calling `take` function after `as_ref`.

### Why is this bad?

Redundant code. `take` writes `None` to its argument.
In this case the modification is useless as it’s a temporary that cannot be read from afterwards.

### Example

```rust
let x = Some(3);
x.as_ref().take();
```

Use instead:

```rust
let x = Some(3);
x.as_ref();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2740

## needless_question_mark

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.51.0

### What it does

Suggests replacing `Ok(x?)` or `Some(x?)` with `x` in return positions where the `?` operator
is not needed to convert the type of `x`.

### Why is this bad?

There’s no reason to use `?` to short-circuit when execution of the body will end there anyway.

### Example

```rust
fn f(s: &str) -> Option<usize> {
    Some(s.find('x')?)
}

fn g(s: &str) -> Result<usize, ParseIntError> {
    Ok(s.parse()?)
}
```

Use instead:

```rust
fn f(s: &str) -> Option<usize> {
    s.find('x')
}

fn g(s: &str) -> Result<usize, ParseIntError> {
    s.parse()
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/needless_question_mark.rs#L9

## needless_splitn

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.59.0

### What it does

Checks for usage of `str::splitn` (or `str::rsplitn`) where using `str::split` would be the same.

### Why is this bad?

The function `split` is simpler and there is no performance difference in these cases, considering
that both functions return a lazy iterator.

### Example

```rust
let str = "key=value=add";
let _ = str.splitn(3, '=').next().unwrap();
```

Use instead:

```rust
let str = "key=value=add";
let _ = str.split('=').next().unwrap();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2764

## needless_update

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for needlessly including a base struct on update
when all fields are changed anyway.

This lint is not applied to structs marked with
non_exhaustive.

### Why is this bad?

This will cost resources (because the base has to be
somewhere), and make the code less readable.

### Example

```rust
Point {
    x: 1,
    y: 1,
    z: 1,
    ..zero_point
};
```

Use instead:

```rust
Point {
    x: 1,
    y: 1,
    z: 1
};
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/needless_update.rs#L6

## neg_cmp_op_on_partial_ord

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for the usage of negated comparison operators on types which only implement
`PartialOrd` (e.g., `f64`).

### Why is this bad?

These operators make it easy to forget that the underlying types actually allow not only three
potential Orderings (Less, Equal, Greater) but also a fourth one (Uncomparable). This is
especially easy to miss if the operator based comparison result is negated.

### Example

```rust
let a = 1.0;
let b = f64::NAN;

let not_less_or_equal = !(a <= b);
```

Use instead:

```rust
use std::cmp::Ordering;

let _not_less_or_equal = match a.partial_cmp(&b) {
    None | Some(Ordering::Greater) => true,
    _ => false,
};
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/neg_cmp_op_on_partial_ord.rs#L7

## no_effect

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for statements which have no effect.

### Why is this bad?

Unlike dead code, these statements are actually
executed. However, as they have no effect, all they do is make the code less
readable.

### Example

```rust
0;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/no_effect.rs#L18

## nonnull_unchecked_on_box_ptr

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.99.0

### What it does

Checks for uses of `NonNull::new_unchecked(Box::into_raw(x))`.

### Why is this bad?

`NonNull::new_unchecked` is an unsafe function with a safe alternative when coming
from a `Box`.

### Example

```rust
use std::ptr::NonNull;
let one = Box::new(1);
let ptr = unsafe { NonNull::new_unchecked(Box::into_raw(one)) };
```

Use instead:

```rust
use std::ptr::NonNull;
let one = Box::new(1);
let ptr = Box::into_non_null(one);
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/nonnull_unchecked_on_box_ptr.rs#L13

## only_used_in_recursion

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.61.0

### What it does

Checks for arguments that are only used in recursion with no side-effects.

### Why is this bad?

It could contain a useless calculation and can make function simpler.

The arguments can be involved in calculations and assignments but as long as
the calculations have no side-effects (function calls or mutating dereference)
and the assigned variables are also only in recursion, it is useless.

### Example

```rust
fn f(a: usize, b: usize) -> usize {
    if a == 0 {
        1
    } else {
        f(a - 1, b + 1)
    }
}
```

Use instead:

```rust
fn f(a: usize) -> usize {
    if a == 0 {
        1
    } else {
        f(a - 1)
    }
}
```

### Known problems

Too many code paths in the linting code are currently untested and prone to produce false
positives or are prone to have performance implications.

In some cases, this would not catch all useless arguments.

```rust
fn foo(a: usize, b: usize) -> usize {
    let f = |x| x + 1;

    if a == 0 {
        1
    } else {
        foo(a - 1, f(b))
    }
}
```

For example, the argument `b` is only used in recursion, but the lint would not catch it.

List of some examples that can not be caught:

- binary operation of non-primitive types

- closure usage

- some `break` relative operations

- struct pattern binding

Also, when you recurse the function name with path segments, it is not possible to detect.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/only_used_in_recursion.rs#L18

## option_as_ref_deref

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.42.0

### What it does

Checks for usage of `_.as_ref().map(Deref::deref)` or its aliases (such as `String::as_str`).

### Why is this bad?

Readability, this can be written more concisely as
`_.as_deref()`.

### Example

```rust
opt.as_ref().map(String::as_str)
```

Can be written as

```rust
opt.as_deref()
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2970

## option_filter_map

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.53.0

### What it does

Checks for iterators of `Option`s using `.filter(Option::is_some).map(Option::unwrap)` that may
be replaced with a `.flatten()` call.

### Why is this bad?

`Option` is like a collection of 0-1 things, so `flatten`
automatically does this without suspicious-looking `unwrap` calls.

### Example

```rust
let _ = std::iter::empty::<Option<i32>>().filter(Option::is_some).map(Option::unwrap);
```

Use instead:

```rust
let _ = std::iter::empty::<Option<i32>>().flatten();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2996

## option_map_unit_fn

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `option.map(f)` where f is a function
or closure that returns the unit type `()`.

### Why is this bad?

Readability, this can be written more clearly with
an if let statement

### Example

```rust
let x: Option<String> = do_stuff();
x.map(log_err_msg);
x.map(|msg| log_err_msg(format_msg(msg)));
```

The correct use would be:

```rust
let x: Option<String> = do_stuff();
if let Some(msg) = x {
    log_err_msg(msg);
}

if let Some(msg) = x {
    log_err_msg(format_msg(msg));
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/map_unit_fn.rs#L11

## or_then_unwrap

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.61.0

### What it does

Checks for `.or(…).unwrap()` calls to Options and Results.

### Why is this bad?

You should use `.unwrap_or(…)` instead for clarity.

### Example

```rust
// Result
let value = result.or::<Error>(Ok(fallback)).unwrap();

// Option
let value = option.or(Some(fallback)).unwrap();
```

Use instead:

```rust
// Result
let value = result.unwrap_or(fallback);

// Option
let value = option.unwrap_or(fallback);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3104

## partialeq_ne_impl

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for manual re-implementations of `PartialEq::ne`.

### Why is this bad?

`PartialEq::ne` is required to always return the
negated result of `PartialEq::eq`, which is exactly what the default
implementation does. Therefore, there should never be any need to
re-implement it.

### Example

```rust
struct Foo;

impl PartialEq for Foo {
    fn eq(&self, other: &Foo) -> bool { true }
    fn ne(&self, other: &Foo) -> bool { !(self == other) }
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/partialeq_ne_impl.rs#L6

## precedence

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for operations where precedence may be unclear and suggests to add parentheses.
It catches a mixed usage of arithmetic and bit shifting/combining operators,
as well as method calls applied to closures.

### Why is this bad?

Not everyone knows the precedence of those operators by
heart, so expressions like these may trip others trying to reason about the
code.

### Example

`1 << 2 + 3` equals 32, while `(1 << 2) + 3` equals 7

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/precedence.rs#L9

## ptr_offset_with_cast

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.30.0

### What it does

Checks for usage of the `offset` pointer method with a `usize` cast to an
`isize`.

### Why is this bad?

If we’re always increasing the pointer address, we can avoid the numeric
cast by using the `add` method instead.

### Example

```rust
let vec = vec![b'a', b'b', b'c'];
let ptr = vec.as_ptr();
let offset = 1_usize;

unsafe {
    ptr.offset(offset as isize);
}
```

Could be written:

```rust
let vec = vec![b'a', b'b', b'c'];
let ptr = vec.as_ptr();
let offset = 1_usize;

unsafe {
    ptr.add(offset);
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3245

## range_zip_with_len

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for zipping a collection with the range of
`0.._.len()`.

### Why is this bad?

The code is better expressed with `.enumerate()`.

### Example

```rust
let _ = x.iter().zip(0..x.len());
```

Use instead:

```rust
let _ = x.iter().enumerate();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3282

## redundant_as_str

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.74.0

### What it does

Checks for usage of `as_str()` on a `String` chained with a method available on the `String` itself.

### Why is this bad?

The `as_str()` conversion is pointless and can be removed for simplicity and cleanliness.

### Example

```rust
let owned_string = "This is a string".to_owned();
owned_string.as_str().as_bytes()
```

Use instead:

```rust
let owned_string = "This is a string".to_owned();
owned_string.as_bytes()
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3369

## redundant_async_block

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.70.0

### What it does

Checks for `async` block that only returns `await` on a future.

### Why is this bad?

It is simpler and more efficient to use the future directly.

### Example

```rust
let f = async {
    1 + 2
};
let fut = async {
    f.await
};
```

Use instead:

```rust
let f = async {
    1 + 2
};
let fut = f;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/redundant_async_block.rs#L10

## redundant_at_rest_pattern

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.72.0

### What it does

Checks for `[all @ ..]` patterns.

### Why is this bad?

In all cases, `all` works fine and can often make code simpler, as you possibly won’t need
to convert from say a `Vec` to a slice by dereferencing.

### Example

```rust
if let [all @ ..] = &*v {
    // NOTE: Type is a slice here
    println!("all elements: {all:#?}");
}
```

Use instead:

```rust
if let all = v {
    // NOTE: Type is a `Vec` here
    println!("all elements: {all:#?}");
}
// or
println!("all elements: {v:#?}");
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/misc_early/mod.rs#L65

## redundant_closure_call

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Detects closures called in the same expression where they
are defined.

### Why is this bad?

It is unnecessarily adding to the expression’s
complexity.

### Example

```rust
let a = (|| 42)();
```

Use instead:

```rust
let a = 42;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/redundant_closure_call.rs#L17

## redundant_guards

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.73.0

### What it does

Checks for unnecessary guards in match expressions.

### Why is this bad?

It’s more complex and much less readable. Making it part of the pattern can improve
exhaustiveness checking as well.

### Example

```rust
match x {
    Some(x) if matches!(x, Some(1)) => ..,
    Some(x) if x == Some(2) => ..,
    _ => todo!(),
}
```

Use instead:

```rust
match x {
    Some(Some(1)) => ..,
    Some(Some(2)) => ..,
    _ => todo!(),
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L634

## redundant_slicing

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.51.0

### What it does

Checks for redundant slicing expressions which use the full range, and
do not change the type.

### Why is this bad?

It unnecessarily adds complexity to the expression.

### Known problems

If the type being sliced has an implementation of `Index<RangeFull>`
that actually changes anything then it can’t be removed. However, this would be surprising
to people reading the code and should have a note with it.

### Example

```rust
fn get_slice(x: &[u32]) -> &[u32] {
    &x[..]
}
```

Use instead:

```rust
fn get_slice(x: &[u32]) -> &[u32] {
    x
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/redundant_slicing.rs#L38

## repeat_once

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.47.0

### What it does

Checks for usage of `.repeat(1)` and suggest the following method for each types.

- `.to_string()` for `str`

- `.clone()` for `String`

- `.to_vec()` for `slice`

The lint will evaluate constant expressions and values as arguments of `.repeat(..)` and emit a message if
they are equivalent to `1`. (Related discussion in rust-clippy#7306)

### Why is this bad?

For example, `String.repeat(1)` is equivalent to `.clone()`. If cloning
the string is the intention behind this, `clone()` should be used.

### Example

```rust
let x = String::from("hello world").repeat(1);
```

Use instead:

```rust
let x = String::from("hello world").clone();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3420

## reserve_after_initialization

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.74.0

### What it does

Informs the user about a more concise way to create a vector with a known capacity.

### Why is this bad?

The `Vec::with_capacity` constructor is less complex.

### Example

```rust
let mut v: Vec<usize> = vec![];
v.reserve(10);
```

Use instead:

```rust
let mut v: Vec<usize> = Vec::with_capacity(10);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/reserve_after_initialization.rs#L12

## result_filter_map

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.77.0

### What it does

Checks for iterators of `Result`s using `.filter(Result::is_ok).map(Result::unwrap)` that may
be replaced with a `.flatten()` call.

### Why is this bad?

`Result` implements `IntoIterator<Item = T>`. This means that `Result` can be flattened
automatically without suspicious-looking `unwrap` calls.

### Example

```rust
let _ = std::iter::empty::<Result<i32, ()>>().filter(Result::is_ok).map(Result::unwrap);
```

Use instead:

```rust
let _ = std::iter::empty::<Result<i32, ()>>().flatten();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3448

## result_map_unit_fn

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `result.map(f)` where f is a function
or closure that returns the unit type `()`.

### Why is this bad?

Readability, this can be written more clearly with
an if let statement

### Example

```rust
let x: Result<String, String> = do_stuff();
x.map(log_err_msg);
x.map(|msg| log_err_msg(format_msg(msg)));
```

The correct use would be:

```rust
let x: Result<String, String> = do_stuff();
if let Ok(msg) = x {
    log_err_msg(msg);
};
if let Ok(msg) = x {
    log_err_msg(format_msg(msg));
};
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/map_unit_fn.rs#L53

## seek_from_current

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.67.0

### What it does

Checks if the `seek` method of the `Seek` trait is called with `SeekFrom::Current(0)`,
and if it is, suggests using `stream_position` instead.

### Why is this bad?

Readability. Use dedicated method.

### Example

```rust
use std::fs::File;
use std::io::{self, Write, Seek, SeekFrom};

fn main() -> io::Result<()> {
    let mut f = File::create("foo.txt")?;
    f.write_all(b"Hello")?;
    eprintln!("Written {} bytes", f.seek(SeekFrom::Current(0))?);

    Ok(())
}
```

Use instead:

```rust
use std::fs::File;
use std::io::{self, Write, Seek, SeekFrom};

fn main() -> io::Result<()> {
    let mut f = File::create("foo.txt")?;
    f.write_all(b"Hello")?;
    eprintln!("Written {} bytes", f.stream_position()?);

    Ok(())
}
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3566

## seek_to_start_instead_of_rewind

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.67.0

### What it does

Checks for jumps to the start of a stream that implements `Seek`
and uses the `seek` method providing `Start` as parameter.

### Why is this bad?

Readability. There is a specific method that was implemented for
this exact scenario.

### Example

```rust
fn foo<T: io::Seek>(t: &mut T) {
    t.seek(io::SeekFrom::Start(0));
}
```

Use instead:

```rust
fn foo<T: io::Seek>(t: &mut T) {
    t.rewind();
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3609

## short_circuit_statement

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for the use of short circuit boolean conditions as
a
statement.

### Why is this bad?

Using a short circuit boolean condition as a statement
may hide the fact that the second part is executed or not depending on the
outcome of the first part.

### Example

```rust
f() && g(); // We should write `if f() { g(); }`.
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/misc.rs#L12

## single_element_loop

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.49.0

### What it does

Checks whether a for loop has a single element.

### Why is this bad?

There is no reason to have a loop of a
single element.

### Example

```rust
let item1 = 2;
for item in &[item1] {
    println!("{}", item);
}
```

Use instead:

```rust
let item1 = 2;
let item = &item1;
println!("{}", item);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L642

## skip_while_next

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.42.0

### What it does

Checks for usage of `_.skip_while(condition).next()`.

### Why is this bad?

Readability, this can be written more concisely as
`_.find(!condition)`.

### Example

```rust
vec.iter().skip_while(|x| **x == 0).next();
```

Use instead:

```rust
vec.iter().find(|x| **x != 0);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3697

## some_filter

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.97.0

### What it does

Checks for usage of `Some(x).filter(|_| predicate)`.

### Why is this bad?

Readability, this can be written more concisely as `predicate.then_some(x)`.

### Example

```rust
let x = false;
Some(0).filter(|_| x);
```

Use instead:

```rust
let x = false;
x.then_some(0);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3750

## string_from_utf8_as_bytes

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.50.0

### What it does

Check if the string is transformed to byte array and casted back to string.

### Why is this bad?

It’s unnecessary, the string can be used directly.

### Example

```rust
std::str::from_utf8(&"Hello World!".as_bytes()[6..11]).unwrap();
```

Use instead:

```rust
&"Hello World!"[6..11];
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3870

## strlen_on_c_strings

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.55.0

### What it does

Checks for usage of `libc::strlen` on a `CString` or `CStr` value,
and suggest calling `count_bytes()` instead.

### Why is this bad?

`libc::strlen` is an unsafe function, which we don’t need to call
if all we want to know is the length of the c-string.

### Example

```rust
use std::ffi::CString;
let cstring = CString::new("foo").expect("CString::new failed");
let len = unsafe { libc::strlen(cstring.as_ptr()) };
```

Use instead:

```rust
use std::ffi::CString;
let cstring = CString::new("foo").expect("CString::new failed");
let len = cstring.count_bytes();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/strlen_on_c_strings.rs#L13

## swap_with_temporary

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.88.0

### What it does

Checks for usage of `std::mem::swap` with temporary values.

### Why is this bad?

Storing a new value in place of a temporary value which will
be dropped right after the `swap` is an inefficient way of performing
an assignment. The same result can be achieved by using a regular
assignment.

### Examples

```rust
fn replace_string(s: &mut String) {
    std::mem::swap(s, &mut String::from("replaced"));
}
```

Use instead:

```rust
fn replace_string(s: &mut String) {
    *s = String::from("replaced");
}
```

Also, swapping two temporary values has no effect, as they will
both be dropped right after swapping them. This is likely an indication
of a bug. For example, the following code swaps the references to
the last element of the vectors, instead of swapping the elements
themselves:

```rust
fn bug(v1: &mut [i32], v2: &mut [i32]) {
    // Incorrect: swapping temporary references (`&mut &mut` passed to swap)
    std::mem::swap(&mut v1.last_mut().unwrap(), &mut v2.last_mut().unwrap());
}
```

Use instead:

```rust
fn correct(v1: &mut [i32], v2: &mut [i32]) {
    std::mem::swap(v1.last_mut().unwrap(), v2.last_mut().unwrap());
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4082

## temporary_assignment

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for construction of a structure or tuple just to
assign a value in it.

### Why is this bad?

Readability. If the structure is only created to be
updated, why not write the structure you want in the first place?

### Example

```rust
(0, 0).0 = 1
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/temporary_assignment.rs#L6

## too_many_arguments

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for functions with too many parameters.

### Why is this bad?

Functions with lots of parameters are considered bad
style and reduce readability (“what does the 5th parameter mean?”). Consider
grouping some parameters into a new type.

### Example

```rust
fn foo(x: u32, y: u32, name: &str, c: Color, w: f32, h: f32, a: f32, b: f32) {
    // ..
}
```

### Configuration

- 

`too-many-arguments-threshold`:  The maximum number of argument a function or method can have

(default: `7`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/functions/mod.rs#L459

## transmute_bytes_to_str

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for transmutes from a `&[u8]` to a `&str`.

### Why is this bad?

Not every byte slice is a valid UTF-8 string.

### Known problems

- `from_utf8` which this lint suggests using is slower than `transmute`
as it needs to validate the input.
If you are certain that the input is always a valid UTF-8,
use `from_utf8_unchecked` which is as fast as `transmute`
but has a semantically meaningful name.

- You might want to handle errors returned from `from_utf8` instead of calling `unwrap`.

### Example

```rust
let b: &[u8] = &[1_u8, 2_u8];
unsafe {
    let _: &str = std::mem::transmute(b); // where b: &[u8]
}

// should be:
let _ = std::str::from_utf8(b).unwrap();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/transmute/mod.rs#L155

## transmute_int_to_bool

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for transmutes from an integer to a `bool`.

### Why is this bad?

This might result in an invalid in-memory representation of a `bool`.

### Example

```rust
let x = 1_u8;
unsafe {
    let _: bool = std::mem::transmute(x); // where x: u8
}

// should be:
let _: bool = x != 0;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/transmute/mod.rs#L189

## transmute_int_to_non_zero

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.69.0

### What it does

Checks for transmutes from `T` to `NonZero<T>`, and suggests the `new_unchecked`
method instead.

### Why is this bad?

Transmutes work on any types and thus might cause unsoundness when those types change
elsewhere. `new_unchecked` only works for the appropriate types instead.

### Example

```rust
let _: NonZero<u32> = unsafe { std::mem::transmute(123) };
```

Use instead:

```rust
let _: NonZero<u32> = unsafe { NonZero::new_unchecked(123) };
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/transmute/mod.rs#L212

## transmute_ptr_to_ref

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for transmutes from a pointer to a reference.

### Why is this bad?

This can always be rewritten with `&` and `*`.

### Known problems

- `mem::transmute` in statics and constants is stable from Rust 1.46.0,
while dereferencing raw pointer is not stable yet.
If you need to do this in those places,
you would have to use `transmute` instead.

### Example

```rust
unsafe {
    let _: &T = std::mem::transmute(p); // where p: *const T
}

// can be written:
let _: &T = &*p;
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/transmute/mod.rs#L293

## transmutes_expressible_as_ptr_casts

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.47.0

### What it does

Checks for transmutes that could be a pointer cast.

### Why is this bad?

Readability. The code tricks people into thinking that
something complex is going on.

### Example

```rust
unsafe { std::mem::transmute::<*const [i32], *const [u16]>(p) };
```

Use instead:

```rust
p as *const [u16];
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/transmute/mod.rs#L350

## type_complexity

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for types used in structs, parameters and `let`
declarations above a certain complexity threshold.

### Why is this bad?

Too complex types make the code less readable. Consider
using a `type` definition to simplify them.

### Example

```rust
struct PointMatrixContainer {
    matrix: Rc<Vec<Vec<Box<(u32, u32, u32, u32)>>>>,
}

fn main() {
    let point_matrix: Vec<Vec<Box<(u32, u32, u32, u32)>>> = vec![
        vec![
            Box::new((1, 2, 3, 4)),
            Box::new((5, 6, 7, 8)),
        ],
        vec![
            Box::new((9, 10, 11, 12)),
        ],
    ];

    let shared_point_matrix: Rc<Vec<Vec<Box<(u32, u32, u32, u32)>>>> = Rc::new(point_matrix);

    let container = PointMatrixContainer {
        matrix: shared_point_matrix,
    };

    // ...
}
```

Use instead:

### Example

```rust
type PointMatrix = Vec<Vec<Box<(u32, u32, u32, u32)>>>;
type SharedPointMatrix = Rc<PointMatrix>;

struct PointMatrixContainer {
    matrix: SharedPointMatrix,
}

fn main() {
    let point_matrix: PointMatrix = vec![
        vec![
            Box::new((1, 2, 3, 4)),
            Box::new((5, 6, 7, 8)),
        ],
        vec![
            Box::new((9, 10, 11, 12)),
        ],
    ];

    let shared_point_matrix: SharedPointMatrix = Rc::new(point_matrix);

    let container = PointMatrixContainer {
        matrix: shared_point_matrix,
    };

    // ...
}
```

### Configuration

- 

`type-complexity-threshold`:  The maximum complexity a type can have

(default: `250`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/types/mod.rs#L291

## unit_arg

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for passing a unit value as an argument to a function without using a
unit literal (`()`).

### Why is this bad?

This is likely the result of an accidental semicolon.

### Example

```rust
foo({
    let a = bar();
    baz(a);
})
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unit_types/mod.rs#L30

## unnecessary_as_slice

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.97.0

### What it does

Looks for unnecessary calls to `as_slice()` on `Vec`.

### Why is this bad?

Calling `as_slice()` on a `Vec` before calling a method on it may be unnecessary because `Vec`s auto-dereference as slices.

### Example

```rust
let v = vec![1, 2, 3];
let v_len = v.as_slice().len();
```

Use instead:

```rust
let v = vec![1, 2, 3];
let v_len = v.len();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4291

## unnecessary_cast

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for casts to the same type, casts of int literals to integer
types, casts of float literals to float types, and casts between raw
pointers that don’t change type or constness.

### Why is this bad?

It’s just unnecessary.

### Known problems

When the expression on the left is a function call, the lint considers
the return type to be a type alias if it’s aliased through a `use`
statement (like `use std::io::Result as IoResult`). It will not lint
such cases.

This check will only work on primitive types without any intermediate
references: raw pointers and trait objects may or may not work.

### Example

```rust
let _ = 2i32 as i32;
let _ = 0.5 as f32;
```

Better:

```rust
let _ = 2_i32;
let _ = 0.5_f32;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L789

## unnecessary_filter_map

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.31.0

### What it does

Checks for `filter_map` calls that could be replaced by `filter` or `map`.
More specifically it checks if the closure provided is only performing one of the
filter or map operations and suggests the appropriate option.

### Why is this bad?

Complexity. The intent is also clearer if only a single
operation is being performed.

### Example

```rust
let _ = (0..3).filter_map(|x| if x > 2 { Some(x) } else { None });

// As there is no transformation of the argument this could be written as:
let _ = (0..3).filter(|&x| x > 2);
```

```rust
let _ = (0..4).filter_map(|x| Some(x + 1));

// As there is no conditional check on the argument this could be written as:
let _ = (0..4).map(|x| x + 1);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4341

## unnecessary_find_map

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.61.0

### What it does

Checks for `find_map` calls that could be replaced by `find` or `map`. More
specifically it checks if the closure provided is only performing one of the
find or map operations and suggests the appropriate option.

### Why is this bad?

Complexity. The intent is also clearer if only a single
operation is being performed.

### Example

```rust
let _ = (0..3).find_map(|x| if x > 2 { Some(x) } else { None });

// As there is no transformation of the argument this could be written as:
let _ = (0..3).find(|&x| x > 2);
```

```rust
let _ = (0..4).find_map(|x| Some(x + 1));

// As there is no conditional check on the argument this could be written as:
let _ = (0..4).map(|x| x + 1).next();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4371

## unnecessary_first_then_check

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.83.0

### What it does

Checks the usage of `.first().is_some()` or `.first().is_none()` to check if a slice is
empty.

### Why is this bad?

Using `.is_empty()` is shorter and better communicates the intention.

### Example

```rust
let v = vec![1, 2, 3];
if v.first().is_none() {
    // The vector is empty...
}
```

Use instead:

```rust
let v = vec![1, 2, 3];
if v.is_empty() {
    // The vector is empty...
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4401

## unnecessary_get_then_check

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.78.0

### What it does

Checks the usage of `.get().is_some()` or `.get().is_none()` on std map types.

### Why is this bad?

It can be done in one call with `.contains()`/`.contains_key()`.

### Example

```rust
let s: HashSet<String> = HashSet::new();
if s.get("a").is_some() {
    // code
}
```

Use instead:

```rust
let s: HashSet<String> = HashSet::new();
if s.contains("a") {
    // code
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4458

## unnecessary_literal_unwrap

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.72.0

### What it does

Checks for `.unwrap()` related calls on `Result`s and `Option`s that are constructed.

### Why is this bad?

It is better to write the value directly without the indirection.

### Examples

```rust
let val1 = Some(1).unwrap();
let val2 = Ok::<_, ()>(1).unwrap();
let val3 = Err::<(), _>(1).unwrap_err();
```

Use instead:

```rust
let val1 = 1;
let val2 = 1;
let val3 = 1;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4559

## unnecessary_map_on_constructor

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.74.0

### What it does

Suggests removing the use of a `map()` (or `map_err()`) method when an `Option` or `Result`
is being constructed.

### Why is this bad?

It introduces unnecessary complexity. Instead, the function can be called before
constructing the `Option` or `Result` from its return value.

### Example

```rust
Some(4).map(i32::swap_bytes)
```

Use instead:

```rust
Some(i32::swap_bytes(4))
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unnecessary_map_on_constructor.rs#L9

## unnecessary_min_or_max

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.81.0

### What it does

Checks for unnecessary calls to `min()` or `max()` in the following cases

- Either both side is constant

- One side is clearly larger than the other, like `i32::MIN` and an `i32` variable

### Why is this bad?

In the aforementioned cases it is not necessary to call `min()` or `max()`
to compare values, it may even cause confusion.

### Example

```rust
let _ = 0.min(7_u32);
```

Use instead:

```rust
let _ = 0;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4624

## unnecessary_operation

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for expression statements that can be reduced to a
sub-expression.

### Why is this bad?

Expressions by themselves often have no side-effects.
Having such expressions reduces readability.

### Example

```rust
compute_array()[0];
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/no_effect.rs#L56

## unnecessary_sort_by

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.46.0

### What it does

Checks for usage of `Vec::sort_by` passing in a closure
which compares the two arguments, either directly or indirectly.

### Why is this bad?

It is more clear to use `Vec::sort_by_key` (or `Vec::sort` if
possible) than to use `Vec::sort_by` and a more complicated
closure.

### Known problems

If the suggested `Vec::sort_by_key` uses Reverse and it isn’t already
imported by a use statement, then it will need to be added manually.

### Example

```rust
vec.sort_by(|a, b| a.foo().cmp(&b.foo()));
```

Use instead:

```rust
vec.sort_by_key(|a| a.foo());
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4699

## unnecessary_unwrap

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for calls of `unwrap[_err]()` that cannot fail.

### Why is this bad?

Using `if let` or `match` is more idiomatic.

### Example

```rust
if option.is_some() {
    do_something_with(option.unwrap())
}
```

Could be written:

```rust
if let Some(value) = option {
    do_something_with(value)
}
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unwrap.rs#L51

## unnecessary_unwrap_unchecked

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.98.0

### What it does

Checks for calls to `unwrap_unchecked` when an `_unchecked` variant of the function exists.

### Why is this bad?

Calling the non-unchecked variant may result in checking that is then discarded
if `unwrap_unchecked` is called directly afterwards, whereas the unchecked
variant most likely avoids performing the check completely.

### Known problems

The unchecked variant is only suggested if it’s defined in the same `impl` block
as the non-unchecked one

### Example

```rust
let s = unsafe { std::str::from_utf8(&[]).unwrap_unchecked() };
```

Use instead:

```rust
let s = unsafe { std::str::from_utf8_unchecked(&[]) };
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4764

## unneeded_wildcard_pattern

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.40.0

### What it does

Checks for tuple and struct patterns with a wildcard
pattern (`_`) is next to a rest pattern (`..`).

NOTE: While `_, ..` means there is at least one element left, `..`
means there are 0 or more elements left. This can make a difference
when refactoring, but shouldn’t result in errors in the refactored code,
since the wildcard pattern isn’t used anyway.

### Why is this bad?

The wildcard pattern is unneeded as the rest pattern
can match that element as well.

### Example

```rust
match t {
    TupleStruct(0, .., _) => (),
    _ => (),
}
```

Use instead:

```rust
match t {
    TupleStruct(0, ..) => (),
    _ => (),
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/misc_early/mod.rs#L197

## unused_format_specs

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.66.0

### What it does

Detects formatting parameters that have no effect on the output of
`format!()`, `println!()` or similar macros.

This includes:

- Format specifiers on `format_args!()` (width, precision have no effect)

- Format width too small for the format trait (e.g. `{:#02x}` outputs “0x1”
so width 2 has no effect; minimum is 4 for alternate hex/octal/binary)

### Why is this bad?

Shorter format specifiers are easier to read, it may also indicate that
an expected formatting operation such as adding padding isn’t happening.

### Example

```rust
println!("{:.}", 1.0);

println!("not padded: {:5}", format_args!("..."));

// width 2 has no effect for alternate hex (outputs "0x1")
format!("{:#02x}", 1_u8);
```

Use instead:

```rust
println!("{}", 1.0);

println!("not padded: {}", format_args!("..."));
// OR
println!("padded: {:5}", format!("..."));

format!("{:#04x}", 1_u8);  // width 4 for two-digit zero-padded hex
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/format_args.rs#L236

## useless_asref

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for usage of `.as_ref()` or `.as_mut()` where the
types before and after the call are the same.

### Why is this bad?

The call is unnecessary.

### Example

```rust
let x: &[i32] = &[1, 2, 3, 4, 5];
do_stuff(x.as_ref());
```

The correct use would be:

```rust
let x: &[i32] = &[1, 2, 3, 4, 5];
do_stuff(x);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4880

## useless_concat

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.89.0

### What it does

Checks that the `concat!` macro has at least two arguments.

### Why is this bad?

If there are less than 2 arguments, then calling the macro is doing nothing.

### Example

```rust
let x = concat!("a");
```

Use instead:

```rust
let x = "a";
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/useless_concat.rs#L11

## useless_conversion

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.45.0

### What it does

Checks for `Into`, `TryInto`, `From`, `TryFrom`, or `IntoIterator` calls
which uselessly convert to the same type.

### Why is this bad?

Redundant code.

### Example

```rust
// format!() returns a `String`
let s: String = format!("hello").into();
```

Use instead:

```rust
let s: String = format!("hello");
```

### Past names

- identity_conversion

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/useless_conversion.rs#L20

## useless_format

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for the use of `format!("string literal with no argument")` and `format!("{}", foo)` where `foo` is a string.

### Why is this bad?

There is no point of doing that. `format!("foo")` can
be replaced by `"foo".to_owned()` if you really need a `String`. The even
worse `&format!("foo")` is often encountered in the wild. `format!("{}", foo)` can be replaced by `foo.clone()` if `foo: String` or `foo.to_owned()`
if `foo: &str`.

### Examples

```rust
let foo = "foo";
format!("{}", foo);
```

Use instead:

```rust
let foo = "foo";
foo.to_owned();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/format.rs#L13

## useless_nonzero_new_unchecked

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.86.0

### What it does

Checks for `NonZero*::new_unchecked()` being used in a `const` context.

### Why is this bad?

Using `NonZero*::new_unchecked()` is an `unsafe` function and requires an `unsafe` context. When used in a
context evaluated at compilation time, `NonZero*::new().unwrap()` will provide the same result with identical
runtime performances while not requiring `unsafe`.

### Example

```rust
use std::num::NonZeroUsize;
const PLAYERS: NonZeroUsize = unsafe { NonZeroUsize::new_unchecked(3) };
```

Use instead:

```rust
use std::num::NonZeroUsize;
const PLAYERS: NonZeroUsize = NonZeroUsize::new(3).unwrap();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4906

## useless_transmute

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for transmutes to the original type of the object
and transmutes that could be a cast.

### Why is this bad?

Readability. The code tricks people into thinking that
something complex is going on.

### Example

```rust
core::intrinsics::transmute(t); // where the result type is the same as `t`'s
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/transmute/mod.rs#L429

## vec_box

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.33.0

### What it does

Checks for usage of `Vec<Box<T>>` where T: Sized anywhere in the code.
Check the Box documentation for more information.

### Why is this bad?

`Vec` already keeps its contents in a separate area on
the heap. So if you `Box` its contents, you just add another level of indirection.

### Example

```rust
struct X {
    values: Vec<Box<i32>>,
}
```

Better:

```rust
struct X {
    values: Vec<i32>,
}
```

### Configuration

- 

`avoid-breaking-exported-api`:  Suppress lints whenever the suggested change would cause breakage for other crates.

(default: `true`)

- 

`vec-box-size-threshold`:  The size of the boxed type in bytes, where boxing in a `Vec` is allowed

(default: `4096`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/types/mod.rs#L364

## while_let_loop

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Detects `loop + match` combinations that are easier
written as a `while let` loop.

### Why is this bad?

The `while let` loop is usually shorter and more
readable.

### Example

```rust
let y = Some(1);
loop {
    let x = match y {
        Some(x) => x,
        None => break,
    };
    // ..
}
```

Use instead:

```rust
let y = Some(1);
while let Some(x) = y {
    // ..
};
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L757

## wildcard_in_or_patterns

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: 1.42.0

### What it does

Checks for wildcard pattern used with others patterns in same match arm.

### Why is this bad?

Wildcard pattern already covers any other pattern as it will match anyway.
It makes the code less readable, especially to spot wildcard pattern use in match arm.

### Example

```rust
match s {
    "a" => {},
    "bar" | _ => {},
}
```

Use instead:

```rust
match s {
    "a" => {},
    _ => {},
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L978

## zero_divided_by_zero

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Checks for `0.0 / 0.0`.

### Why is this bad?

It’s less readable than `f32::NAN` or `f64::NAN`.

### Example

```rust
let nan = 0.0f32 / 0.0;
```

Use instead:

```rust
let nan = f32::NAN;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/zero_div_zero.rs#L6

## zero_prefixed_literal

Grupo: `complexity` · Nível padrão: `warn` · Adicionado em: pre 1.29.0

### What it does

Warns if an integral constant literal starts with `0`.

### Why is this bad?

In some languages (including the infamous C language
and most of its
family), this marks an octal constant. In Rust however, this is a decimal
constant. This could
be confusing for both the writer and a reader of the constant.

### Example

In Rust:

```rust
let a = 0123;
println!("{}", a);
```

prints `123`, while in C:

```rust
int a = 0123;
printf("%d\n", a);
```

prints `83` (as `83 == 0o123` while `123 == 0o173`).

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/misc_early/mod.rs#L265
