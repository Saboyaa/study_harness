# Catálogo de lints do Clippy — grupo `correctness`

## absurd_extreme_comparisons

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for comparisons where one side of the relation is
either the minimum or maximum value for its type and warns if it involves a
case that is always true or always false. Only integer and boolean types are
checked.

### Why is this bad?

An expression like `min <= x` may misleadingly imply
that it is possible for `x` to be less than the minimum. Expressions like
`max < x` are probably mistakes.

### Known problems

For `usize` the size of the current compile target will
be assumed (e.g., 64 bits on 64 bit systems). This means code that uses such
a comparison to detect target pointer width will trigger this lint. One can
use `mem::sizeof` and compare its value or conditional compilation
attributes
like `#[cfg(target_pointer_width = "64")] ..` instead.

### Example

```rust
let vec: Vec<isize> = Vec::new();
if vec.len() <= 0 {}
if 100 > i32::MAX {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L38

## almost_swapped

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for `foo = bar; bar = foo` sequences.

### Why is this bad?

This looks like a failed attempt to swap.

### Example

```rust
a = b;
b = a;
```

If swapping is intended, use `swap()` instead:

```rust
std::mem::swap(&mut a, &mut b);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/swap.rs#L21

## approx_constant

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for floating point literals that approximate
constants which are defined in
`std::f32::consts`
or
`std::f64::consts`,
respectively, suggesting to use the predefined constant.

### Why is this bad?

Usually, the definition in the standard library is more
precise than what people come up with. If you find that your definition is
actually more precise, please file a Rust
issue.

### Example

```rust
let x = 3.14;
let y = 1_f64 / x;
```

Use instead:

```rust
let x = std::f32::consts::PI;
let y = std::f64::consts::FRAC_1_PI;
```

### Configuration

- 

`msrv`:  The minimum rust version that the project supports. Defaults to the `rust-version` field in `Cargo.toml`

(default: `current version`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/approx_const.rs#L11

## async_yields_async

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.48.0

### What it does

Checks for async blocks that yield values of types
that can themselves be awaited.

### Why is this bad?

An await is likely missing.

### Example

```rust
async fn foo() {}

fn bar() {
  let x = async {
    foo()
  };
}
```

Use instead:

```rust
async fn foo() {}

fn bar() {
  let x = async {
    foo().await
  };
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/async_yields_async.rs#L12

## bad_bit_mask

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for incompatible bit masks in comparisons.

The formula for detecting if an expression of the type `_ <bit_op> m <cmp_op> c` (where `<bit_op>` is one of {`&`, `|`} and `<cmp_op>` is one of
{`!=`, `>=`, `>`, `!=`, `>=`, `>`}) can be determined from the following
table:
ComparisonBit OpExampleis alwaysFormula
`==` or `!=``&``x & 2 == 3``false``c & m != c`
`<`  or `>=``&``x & 2 < 3``true``m < c`
`>`  or `<=``&``x & 1 > 1``false``m <= c`
`==` or `!=``|``x | 1 == 0``false``c | m != c`
`<`  or `>=``|``x | 1 < 1``false``m >= c`
`<=` or `>``|``x | 1 > 0``true``m > c`

### Why is this bad?

If the bits that the comparison cares about are always
set to zero or one by the bit mask, the comparison is constant `true` or
`false` (depending on mask, compared value, and operators).

So the code is actively misleading, and the only reason someone would write
this intentionally is to win an underhanded Rust contest or create a
test-case for this lint.

### Example

```rust
if (x & 1 == 2) { }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L142

## cast_slice_different_sizes

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.61.0

### What it does

Checks for `as` casts between raw pointers to slices with differently sized elements.

### Why is this bad?

The produced raw pointer to a slice does not update its length metadata. The produced
pointer will point to a different number of bytes than the original pointer because the
length metadata of a raw slice pointer is in elements rather than bytes.
Producing a slice reference from the raw pointer will either create a slice with
less data (which can be surprising) or create a slice with more data and cause Undefined Behavior.

### Example

// Missing data

```rust
let a = [1_i32, 2, 3, 4];
let p = &a as *const [i32] as *const [u8];
unsafe {
    println!("{:?}", &*p);
}
```

// Undefined Behavior (note: also potential alignment issues)

```rust
let a = [1_u8, 2, 3, 4];
let p = &a as *const [u8] as *const [u32];
unsafe {
    println!("{:?}", &*p);
}
```

Instead use `ptr::slice_from_raw_parts` to construct a slice from a data pointer and the correct length

```rust
let a = [1_i32, 2, 3, 4];
let old_ptr = &a as *const [i32];
// The data pointer is cast to a pointer to the target `u8` not `[u8]`
// The length comes from the known length of 4 i32s times the 4 bytes per i32
let new_ptr = core::ptr::slice_from_raw_parts(old_ptr as *const u8, 16);
unsafe {
    println!("{:?}", &*new_ptr);
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/casts/mod.rs#L416

## char_indices_as_byte_indices

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.88.0

### What it does

Checks for usage of a character position yielded by `.chars().enumerate()` in a context where a byte index is expected,
such as an argument to a specific `str` method or indexing into a `str` or `String`.

### Why is this bad?

A character (more specifically, a Unicode scalar value) that is yielded by `str::chars` can take up multiple bytes,
so a character position does not necessarily have the same byte index at which the character is stored.
Thus, using the character position where a byte index is expected can unexpectedly return wrong values
or panic when the string consists of multibyte characters.

For example, the character `a` in `äa` is stored at byte index 2 but has the character position 1.
Using the character position 1 to index into the string will lead to a panic as it is in the middle of the first character.

Instead of `.chars().enumerate()`, the correct iterator to use is `.char_indices()`, which yields byte indices.

This pattern is technically fine if the strings are known to only use the ASCII subset,
though in those cases it would be better to use `bytes()` directly to make the intent clearer,
but there is also no downside to just using `.char_indices()` directly and supporting non-ASCII strings.

You may also want to read the chapter on strings in the Rust Book
which goes into this in more detail.

### Example

```rust
for (idx, c) in s.chars().enumerate() {
    let _ = s[idx..]; // ⚠️ Panics for strings consisting of multibyte characters
}
```

Use instead:

```rust
for (idx, c) in s.char_indices() {
    let _ = s[idx..];
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L38

## deprecated_semver

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for `#[deprecated]` annotations with a `since`
field that is not a valid semantic version. Also allows “TBD” to signal
future deprecation.

### Why is this bad?

For checking the version of the deprecation, it must be
a valid semver. Failing that, the contained information is useless.

### Example

```rust
#[deprecated(since = "forever")]
fn something_else() { /* ... */ }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/attrs/mod.rs#L240

## derive_ord_xor_partial_ord

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.47.0

### What it does

Lints against manual `PartialOrd` and `Ord` implementations for types with a derived `Ord`
or `PartialOrd` implementation.

### Why is this bad?

The implementation of these traits must agree (for
example for use with `sort`) so it’s probably a bad idea to use a
default-generated `Ord` implementation with an explicitly defined
`PartialOrd`. In particular, the following must hold for any type
implementing `Ord`:

```rust
k1.cmp(&k2) == k1.partial_cmp(&k2).unwrap()
```

### Example

```rust
#[derive(Ord, PartialEq, Eq)]
struct Foo;

impl PartialOrd for Foo {
    ...
}
```

Use instead:

```rust
#[derive(PartialEq, Eq)]
struct Foo;

impl PartialOrd for Foo {
    fn partial_cmp(&self, other: &Foo) -> Option<Ordering> {
       Some(self.cmp(other))
    }
}

impl Ord for Foo {
    ...
}
```

or, if you don’t need a custom ordering:

```rust
#[derive(Ord, PartialOrd, PartialEq, Eq)]
struct Foo;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/derive/mod.rs#L12

## derived_hash_with_manual_eq

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Lints against manual `PartialEq` implementations for types with a derived `Hash`
implementation.

### Why is this bad?

The implementation of these traits must agree (for
example for use with `HashMap`) so it’s probably a bad idea to use a
default-generated `Hash` implementation with an explicitly defined
`PartialEq`. In particular, the following must hold for any type:

```rust
k1 == k2 ⇒ hash(k1) == hash(k2)
```

### Example

```rust
#[derive(Hash)]
struct Foo;

impl PartialEq for Foo {
    ...
}
```

### Past names

- derive_hash_xor_eq

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/derive/mod.rs#L95

## eager_transmute

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.77.0

### What it does

Checks for integer validity checks, followed by a transmute that is (incorrectly) evaluated
eagerly (e.g. using `bool::then_some`).

### Why is this bad?

Eager evaluation means that the `transmute` call is executed regardless of whether the condition is true or false.
This can introduce unsoundness and other subtle bugs.

### Example

Consider the following function which is meant to convert an unsigned integer to its enum equivalent via transmute.

```rust
#[repr(u8)]
enum Opcode {
    Add = 0,
    Sub = 1,
    Mul = 2,
    Div = 3
}

fn int_to_opcode(op: u8) -> Option<Opcode> {
    (op < 4).then_some(unsafe { std::mem::transmute(op) })
}
```

This may appear fine at first given that it checks that the `u8` is within the validity range of the enum,
however the transmute is evaluated eagerly, meaning that it executes even if `op >= 4`!

This makes the function unsound, because it is possible for the caller to cause undefined behavior
(creating an enum with an invalid bitpattern) entirely in safe code only by passing an incorrect value,
which is normally only a bug that is possible in unsafe code.

One possible way in which this can go wrong practically is that the compiler sees it as:

```rust
let temp: Foo = unsafe { std::mem::transmute(op) };
(0 < 4).then_some(temp)
```

and optimizes away the `(0 < 4)` check based on the assumption that since a `Foo` was created from `op` with the validity range `0..3`,
it is impossible for this condition to be false.

In short, it is possible for this function to be optimized in a way that makes it never return `None`,
even if passed the value `4`.

This can be avoided by instead using lazy evaluation. For the example above, this should be written:

```rust
fn int_to_opcode(op: u8) -> Option<Opcode> {
    (op < 4).then(|| unsafe { std::mem::transmute(op) })
             ^^^^ ^^ `bool::then` only executes the closure if the condition is true!
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/transmute/mod.rs#L47

## enum_clike_unportable_variant

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for C-like enumerations that are
`repr(isize/usize)` and have values that don’t fit into an `i32`.

### Why is this bad?

This will truncate the variant value on 32 bit
architectures, but works fine on 64 bit.

### Example

```rust
#[repr(usize)]
enum NonPortable {
    X = 0x1_0000_0000,
    Y = 0,
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/enum_clike.rs#L8

## eq_op

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for equal operands to comparison, logical and
bitwise, difference and division binary operators (`==`, `>`, etc., `&&`,
`||`, `&`, `|`, `^`, `-` and `/`).

### Why is this bad?

This is usually just a typo or a copy and paste error.

### Known problems

False negatives: We had some false positives regarding
calls (notably racer had one instance
of `x.pop() && x.pop()`), so we removed matching any function or method
calls. We may introduce a list of known pure functions in the future.

### Example

```rust
if x + 1 == x + 1 {}

// or

assert_eq!(a, a);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L289

## erasing_op

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for erasing operations, e.g., `x * 0`.

### Why is this bad?

The whole expression can be replaced by zero.
This is most likely not the intended outcome and should probably be
corrected

### Example

```rust
let x = 1;
0 / x;
0 * x;
x & 0;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L321

## if_let_mutex

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.45.0

### What it does

Checks for `Mutex::lock` calls in `if let` expression
with lock calls in any of the else blocks.

### Disabled starting in Edition 2024

This lint is effectively disabled starting in
Edition 2024 as `if let ... else` scoping was reworked
such that this is no longer an issue. See
Proposal: stabilize if_let_rescope for Edition 2024

### Why is this bad?

The Mutex lock remains held for the whole
`if let ... else` block and deadlocks.

### Example

```rust
if let Ok(thing) = mutex.lock() {
    do_thing();
} else {
    mutex.lock();
}
```

Should be written

```rust
let locked = mutex.lock();
if let Ok(thing) = locked {
    do_thing(thing);
} else {
    use_locked(locked);
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/if_let_mutex.rs#L12

## ifs_same_cond

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for consecutive `if`s with the same condition.

### Why is this bad?

This is probably a copy & paste error.

### Example

```rust
if a == b {
    …
} else if a == b {
    …
}
```

Note that this lint ignores all conditions with a function call as it could
have side effects:

```rust
if foo() {
    …
} else if foo() { // not linted
    …
}
```

### Configuration

- 

`ignore-interior-mutability`:  A list of paths to types that should be treated as if they do not contain interior mutability

(default: `["bytes::Bytes"]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/ifs/mod.rs#L87

## impl_hash_borrow_with_str_and_bytes

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.76.0

### What it does

This lint is concerned with the semantics of `Borrow` and `Hash` for a
type that implements all three of `Hash`, `Borrow<str>` and `Borrow<[u8]>`
as it is impossible to satisfy the semantics of Borrow and `Hash` for
both `Borrow<str>` and `Borrow<[u8]>`.

### Why is this bad?

When providing implementations for `Borrow<T>`, one should consider whether the different
implementations should act as facets or representations of the underlying type. Generic code
typically uses `Borrow<T>` when it relies on the identical behavior of these additional trait
implementations. These traits will likely appear as additional trait bounds.

In particular `Eq`, `Ord` and `Hash` must be equivalent for borrowed and owned values:
`x.borrow() == y.borrow()` should give the same result as `x == y`.
It follows then that the following equivalence must hold:
`hash(x) == hash((x as Borrow<[u8]>).borrow()) == hash((x as Borrow<str>).borrow())`

Unfortunately it doesn’t hold as `hash("abc") != hash("abc".as_bytes())`.
This happens because the `Hash` impl for str passes an additional `0xFF` byte to
the hasher to avoid collisions. For example, given the tuples `("a", "bc")`, and `("ab", "c")`,
the two tuples would have the same hash value if the `0xFF` byte was not added.

### Example

```rust
use std::borrow::Borrow;
use std::hash::{Hash, Hasher};

struct ExampleType {
    data: String
}

impl Hash for ExampleType {
    fn hash<H: Hasher>(&self, state: &mut H) {
        self.data.hash(state);
    }
}

impl Borrow<str> for ExampleType {
    fn borrow(&self) -> &str {
        &self.data
    }
}

impl Borrow<[u8]> for ExampleType {
    fn borrow(&self) -> &[u8] {
        self.data.as_bytes()
    }
}
```

As a consequence, hashing a `&ExampleType` and hashing the result of the two
borrows will result in different values.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/impl_hash_with_borrow_str_and_bytes.rs#L9

## impossible_comparisons

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.73.0

### What it does

Checks for double comparisons that can never succeed

### Why is this bad?

The whole expression can be replaced by `false`,
which is probably not the programmer’s intention

### Example

```rust
if status_code <= 400 && status_code > 500 {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L540

## ineffective_bit_mask

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for bit masks in comparisons which can be removed
without changing the outcome. The basic structure can be seen in the
following table:
ComparisonBit OpExampleequals
`>` / `<=``|` / `^``x | 2 > 3``x > 3`
`<` / `>=``|` / `^``x ^ 1 < 4``x < 4`

### Why is this bad?

Not equally evil as `bad_bit_mask`,
but still a bit misleading, because the bit mask is ineffective.

### Known problems

False negatives: This lint will only match instances
where we have figured out the math (which is for a power-of-two compared
value). This means things like `x | 1 >= 7` (which would be better written
as `x >= 6`) will not be reported (but bit masks like this are fairly
uncommon).

### Example

```rust
if (x | 1 > 3) {  }
```

Use instead:

```rust
if (x >= 2) {  }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L559

## infinite_iter

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for iteration that is guaranteed to be infinite.

### Why is this bad?

While there may be places where this is acceptable
(e.g., in event streams), in most cases this is simply an error.

### Example

```rust
use std::iter;

iter::repeat(1_u8).collect::<Vec<_>>();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/infinite_iter.rs#L9

## inherent_to_string_shadow_display

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.38.0

### What it does

Checks for the definition of inherent methods with a signature of `to_string(&self) -> String` and if the type implementing this method also implements the `Display` trait.

### Why is this bad?

This method is also implicitly defined if a type implements the `Display` trait. The less versatile inherent method will then shadow the implementation introduced by `Display`.

### Example

```rust
use std::fmt;

pub struct A;

impl A {
    pub fn to_string(&self) -> String {
        "I am A".to_string()
    }
}

impl fmt::Display for A {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "I am A, too")
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

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/inherent_to_string.rs#L47

## inline_fn_without_body

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for `#[inline]` on trait methods without bodies

### Why is this bad?

Only implementations of trait methods may be inlined.
The inline attribute is ignored for trait methods without bodies.

### Example

```rust
trait Animal {
    #[inline]
    fn name(&self) -> &'static str;
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/inline_fn_without_body.rs#L8

## invalid_regex

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks regex creation
(with `Regex::new`, `RegexBuilder::new`, or `RegexSet::new`) for correct
regex syntax.

### Why is this bad?

This will lead to a runtime panic.

### Example

```rust
Regex::new("(")
```

Use instead:

```rust
Regex::new(r"\(")
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/regex.rs#L16

## inverted_saturating_sub

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.83.0

### What it does

Checks for comparisons between integers, followed by subtracting the greater value from the
lower one.

### Why is this bad?

This could result in an underflow and is most likely not what the user wants. If this was
intended to be a saturated subtraction, consider using the `saturating_sub` method directly.

### Example

```rust
let a = 12u32;
let b = 13u32;

let result = if a > b { b - a } else { 0 };
```

Use instead:

```rust
let a = 12u32;
let b = 13u32;

let result = a.saturating_sub(b);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/implicit_saturating_sub.rs#L51

## invisible_characters

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.49.0

### What it does

Checks for invisible Unicode characters in the code.

### Why is this bad?

Having an invisible character in the code makes for all
sorts of April fools, but otherwise is very much frowned upon.

### Example

You don’t see it, but there may be a zero-width space or soft hyphen
some­where in this text.

### Past names

- zero_width_space

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unicode.rs#L12

## iter_next_loop

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for loops on `x.next()`.

### Why is this bad?

`next()` returns either `Some(value)` if there was a
value, or `None` otherwise. The insidious thing is that `Option<_>`
implements `IntoIterator`, so that possibly one value will be iterated,
leading to some hard to find bugs. No one will want to write such code
except to win an Underhanded Rust
Contest.

### Example

```rust
for x in y.next() {
    ..
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L310

## iter_skip_zero

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.73.0

### What it does

Checks for usage of `.skip(0)` on iterators.

### Why is this bad?

This was likely intended to be `.skip(1)` to skip the first element, as `.skip(0)` does
nothing. If not, the call should be removed.

### Example

```rust
let v = vec![1, 2, 3];
let x = v.iter().skip(0).collect::<Vec<_>>();
let y = v.iter().collect::<Vec<_>>();
assert_eq!(x, y);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1673

## iterator_step_by_zero

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for calling `.step_by(0)` on iterators which panics.

### Why is this bad?

This very much looks like an oversight. Use `panic!()` instead if you
actually intend to panic.

### Example

```rust
for x in (0..100).step_by(0) {
    //..
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L1719

## let_underscore_lock

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.43.0

### What it does

Checks for `let _ = sync_lock`. This supports `mutex` and `rwlock` in
`parking_lot`. For `std` locks see the `rustc` lint
`let_underscore_lock`

### Why is this bad?

This statement immediately drops the lock instead of
extending its lifetime to the end of the scope, which is often not intended.
To extend lock lifetime to the end of the scope, use an underscore-prefixed
name instead (i.e. _lock). If you want to explicitly drop the lock,
`std::mem::drop` conveys your intention better and is less error-prone.

### Example

```rust
let _ = mutex.lock();
```

Use instead:

```rust
let _lock = mutex.lock();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/let_underscore.rs#L40

## lint_groups_priority

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.78.0

### What it does

Checks for lint groups with the same priority as lints in the `Cargo.toml`
`[lints]` table.

This lint will be removed once cargo#12918
is resolved.

### Why is this bad?

The order of lints in the `[lints]` is ignored, to have a lint override a group the
`priority` field needs to be used, otherwise the sort order is undefined.

### Known problems

Does not check lints inherited using `lints.workspace = true`

### Example

```rust
[lints.clippy]
pedantic = "warn"
similar_names = "allow"
```

Use instead:

```rust
[lints.clippy]
pedantic = { level = "warn", priority = -1 }
similar_names = "allow"
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/cargo/mod.rs#L56

## match_str_case_mismatch

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.58.0

### What it does

Checks for `match` expressions modifying the case of a string with non-compliant arms

### Why is this bad?

The arm is unreachable, which is likely a mistake

### Example

```rust
match &*text.to_ascii_lowercase() {
    "foo" => {},
    "Bar" => {},
    _ => {},
}
```

Use instead:

```rust
match &*text.to_ascii_lowercase() {
    "foo" => {},
    "bar" => {},
    _ => {},
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/matches/mod.rs#L499

## mem_replace_with_uninit

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.39.0

### What it does

Checks for `mem::replace(&mut _, mem::uninitialized())`
and `mem::replace(&mut _, mem::zeroed())`.

### Why is this bad?

This will lead to undefined behavior even if the
value is overwritten later, because the uninitialized value may be
observed in the case of a panic.

### Example

```rust
use std::mem;

#[allow(deprecated, invalid_value)]
fn myfunc (v: &mut Vec<i32>) {
    let taken_v = unsafe { mem::replace(v, mem::uninitialized()) };
    let new_v = may_panic(taken_v); // undefined behavior on panic
    mem::forget(mem::replace(v, new_v));
}
```

The take_mut crate offers a sound solution,
at the cost of either lazily creating a replacement value or aborting
on panic, to ensure that the uninitialized value cannot be observed.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/mem_replace.rs#L94

## min_max

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for expressions where `std::cmp::min` and `max` are
used to clamp values, but switched so that the result is constant.

### Why is this bad?

This is in all probability not the intended outcome. At
the least it hurts readability of the code.

### Example

```rust
min(0, max(100, x))

// or

x.max(100).min(0)
```

It will always be equal to `0`. Probably the author meant to clamp the value
between 0 and 100, but has erroneously swapped `min` and `max`.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/minmax.rs#L10

## mistyped_literal_suffixes

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.30.0

### What it does

Warns for mistyped suffix in literals

### Why is this bad?

This is most probably a typo

### Known problems

- Does not match on integers too large to fit in the corresponding unsigned type

- Does not match on `_127` since that is a valid grouping for decimal and octal numbers

### Example

```rust
`2_32` => `2_i32`
`250_8 => `250_u8`
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/literal_representation.rs#L79

## modulo_one

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for getting the remainder of integer division by one or minus
one.

### Why is this bad?

The result for a divisor of one can only ever be zero; for
minus one it can cause panic/overflow (if the left operand is the minimal value of
the respective integer type) or results in zero. No one will write such code
deliberately, unless trying to win an Underhanded Rust Contest. Even for that
contest, it’s probably a bad idea. Use something more underhanded.

### Example

```rust
let a = x % 1;
let a = x % -1;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L832

## mut_from_ref

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

This lint checks for functions that take immutable references and return
mutable ones. This will not trigger if no unsafe code exists as there
are multiple safe functions which will do this transformation

To be on the conservative side, if there’s at least one mutable
reference with the output lifetime, this lint will not trigger.

### Why is this bad?

Creating a mutable reference which can be repeatably derived from an
immutable reference is unsound as it allows creating multiple live
mutable references to the same object.

This error actually
lead to an interim Rust release 1.15.1.

### Known problems

This pattern is used by memory allocators to allow allocating multiple
objects while returning mutable references to each one. So long as
different mutable references are returned each time such a function may
be safe.

### Example

```rust
fn foo(&Foo) -> &mut Bar { .. }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/ptr/mod.rs#L39

## never_loop

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for loops that will always `break`, `return` or
`continue` an outer loop.

### Why is this bad?

This loop never loops, all it does is obfuscating the
code.

### Example

```rust
loop {
    ..;
    break;
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L584

## non_octal_unix_permissions

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.53.0

### What it does

Checks for non-octal values used to set Unix file permissions.

### Why is this bad?

They will be converted into octal, creating potentially
unintended file permissions.

### Example

```rust
use std::fs::OpenOptions;
use std::os::unix::fs::OpenOptionsExt;

let mut options = OpenOptions::new();
options.mode(644);
```

Use instead:

```rust
use std::fs::OpenOptions;
use std::os::unix::fs::OpenOptionsExt;

let mut options = OpenOptions::new();
options.mode(0o644);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/non_octal_unix_permissions.rs#L8

## nonsensical_open_options

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for duplicate open options as well as combinations
that make no sense.

### Why is this bad?

In the best case, the code will be harder to read than
necessary. I don’t know the worst case.

### Example

```rust
use std::fs::OpenOptions;

OpenOptions::new().read(true).truncate(true);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L2867

## not_unsafe_ptr_arg_deref

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for public functions that dereference raw pointer
arguments but are not marked `unsafe`.

### Why is this bad?

The function should almost definitely be marked `unsafe`, since for an
arbitrary raw pointer, there is no way of telling for sure if it is valid.

In general, this lint should never be disabled unless it is definitely a
false positive (please submit an issue if so) since it breaks Rust’s
soundness guarantees, directly exposing API users to potentially dangerous
program behavior. This is also true for internal APIs, as it is easy to leak
unsoundness.

### Context

In Rust, an `unsafe {...}` block is used to indicate that the code in that
section has been verified in some way that the compiler can not. For a
function that accepts a raw pointer then accesses the pointer’s data, this is
generally impossible as the incoming pointer could point anywhere, valid or
not. So, the signature should be marked `unsafe fn`: this indicates that the
function’s caller must provide some verification that the arguments it sends
are valid (and then call the function within an `unsafe` block).

### Known problems

- It does not check functions recursively so if the pointer is passed to a
private non-`unsafe` function which does the dereferencing, the lint won’t
trigger (false negative).

- It only checks for arguments whose type are raw pointers, not raw pointers
got from an argument in some other way (`fn foo(bar: &[*const u8])` or
`some_argument.get_raw_ptr()`) (false negative).

### Example

```rust
pub fn foo(x: *const u8) {
    println!("{}", unsafe { *x });
}

// this call "looks" safe but will segfault or worse!
// foo(invalid_ptr);
```

Use instead:

```rust
pub unsafe fn foo(x: *const u8) {
    println!("{}", unsafe { *x });
}

// this would cause a compiler error for calling without `unsafe`
// foo(invalid_ptr);

// sound call if the caller knows the pointer is valid
unsafe { foo(valid_ptr); }
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/functions/mod.rs#L220

## option_env_unwrap

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.43.0

### What it does

Checks for usage of `option_env!(...).unwrap()` and
suggests usage of the `env!` macro.

### Why is this bad?

Unwrapping the result of `option_env!` will panic
at run-time if the environment variable doesn’t exist, whereas `env!`
catches it at compile-time.

### Example

```rust
let _ = option_env!("HOME").unwrap();
```

Is better expressed as:

```rust
let _ = env!("HOME");
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/option_env_unwrap.rs#L7

## out_of_bounds_indexing

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for out of bounds array indexing with a constant
index.

### Why is this bad?

This will always panic at runtime.

### Example

```rust
let x = [1, 2, 3, 4];

x[9];
&x[2..9];
```

Use instead:

```rust
// Index within bounds

x[0];
x[3];
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/indexing_slicing.rs#L64

## panicking_overflow_checks

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Detects C-style underflow/overflow checks.

### Why is this bad?

These checks will, by default, panic in debug builds rather than check
whether the operation caused an overflow.

### Example

```rust
if a + b < a {
    // handle overflow
}
```

Use instead:

```rust
if a.checked_add(b).is_none() {
    // handle overflow
}
```

Or:

```rust
if a.overflowing_add(b).1 {
    // handle overflow
}
```

### Past names

- overflow_check_conditional

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/panicking_overflow_checks.rs#L7

## panicking_unwrap

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for calls of `unwrap[_err]()` that will always fail.

### Why is this bad?

If panicking is desired, an explicit `panic!()` should be used.

### Known problems

This lint only checks `if` conditions not assignments.
So something like `let x: Option<()> = None; x.unwrap();` will not be recognized.

### Example

```rust
if option.is_none() {
    do_something_with(option.unwrap())
}
```

This code will always panic. The if condition should probably be inverted.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unwrap.rs#L24

## possible_missing_comma

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for possible missing comma in an array. It lints if
an array element is a binary operator expression and it lies on two lines.

### Why is this bad?

This could lead to unexpected results.

### Example

```rust
let a = &[
    -1, -2, -3 // <= no comma here
    -4, -5, -6
];
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/formatting.rs#L8

## read_line_without_trim

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.73.0

### What it does

Looks for calls to [`Stdin::read_line`] to read a line from the standard input
into a string, then later attempting to use that string for an operation that will never
work for strings with a trailing newline character in it (e.g. parsing into a `i32`).

### Why is this bad?

The operation will always fail at runtime no matter what the user enters, thus
making it a useless operation.

### Example

```rust
let mut input = String::new();
std::io::stdin().read_line(&mut input).expect("Failed to read a line");
let num: i32 = input.parse().expect("Not a number!");
assert_eq!(num, 42); // we never even get here!
```

Use instead:

```rust
let mut input = String::new();
std::io::stdin().read_line(&mut input).expect("Failed to read a line");
let num: i32 = input.trim_end().parse().expect("Not a number!");
//                  ^^^^^^^^^^^ remove the trailing newline
assert_eq!(num, 42);
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L3307

## recursive_format_impl

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.48.0

### What it does

Checks for format trait implementations (e.g. `Display`) with a recursive call to itself
which uses `self` as a parameter.
This is typically done indirectly with the `write!` macro or with `to_string()`.

### Why is this bad?

This will lead to infinite recursion and a stack overflow.

### Example

```rust
use std::fmt;

struct Structure(i32);
impl fmt::Display for Structure {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.to_string())
    }
}

```

Use instead:

```rust
use std::fmt;

struct Structure(i32);
impl fmt::Display for Structure {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}", self.0)
    }
}
```

### Past names

- to_string_in_display

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/format_impl.rs#L53

## redundant_comparisons

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.73.0

### What it does

Checks for ineffective double comparisons against constants.

### Why is this bad?

Only one of the comparisons has any effect on the result, the programmer
probably intended to flip one of the comparison operators, or compare a
different value entirely.

### Example

```rust
if status_code <= 400 && status_code < 500 {}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L941

## reversed_empty_ranges

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.45.0

### What it does

Checks for range expressions `x..y` where both `x` and `y`
are constant and `x` is greater to `y`. Also triggers if `x` is equal to `y` when they are conditions to a `for` loop.

### Why is this bad?

Empty ranges yield no values so iterating them is a no-op.
Moreover, trying to use a reversed range to index a slice will panic at run-time.

### Example

```rust
(10..=0).for_each(|x| println!("{}", x));

let arr = [1, 2, 3, 4, 5];
let sub = &arr[3..1];
```

Use instead:

```rust
(0..=10).rev().for_each(|x| println!("{}", x));

let arr = [1, 2, 3, 4, 5];
let sub = &arr[1..3];
```

### Past names

- reverse_range_loop

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/ranges.rs#L141

## self_assignment

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.48.0

### What it does

Checks for explicit self-assignments.

### Why is this bad?

Self-assignments are redundant and unlikely to be
intentional.

### Known problems

If expression contains any deref coercions or
indexing operations they are assumed not to have any side effects.

### Example

```rust
struct Event {
    x: i32,
}

fn copy_position(a: &mut Event, b: &Event) {
    a.x = a.x;
}
```

Should be:

```rust
struct Event {
    x: i32,
}

fn copy_position(a: &mut Event, b: &Event) {
    a.x = b.x;
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/operators/mod.rs#L961

## serde_api_misuse

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for misuses of the serde API.

### Why is this bad?

Serde is very finicky about how its API should be
used, but the type system can’t be used to enforce it (yet?).

### Example

Implementing `Visitor::visit_string` but not
`Visitor::visit_str`.

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/serde_api.rs#L6

## size_of_in_element_count

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.50.0

### What it does

Detects expressions where
`size_of::<T>` or `size_of_val::<T>` is used as a
count of elements of type `T`

### Why is this bad?

These functions expect a count
of `T` and not a number of bytes

### Example

```rust
const SIZE: usize = 128;
let x = [2u8; SIZE];
let mut y = [2u8; SIZE];
unsafe { copy_nonoverlapping(x.as_ptr(), y.as_mut_ptr(), size_of::<u8>() * SIZE) };
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/size_of_in_element_count.rs#L8

## suspicious_splitn

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.54.0

### What it does

Checks for calls to `splitn`
and related functions with either zero or one splits.

### Why is this bad?

These calls don’t actually split the value and are
likely to be intended as a different number.

### Example

```rust
for x in s.splitn(1, ":") {
    // ..
}
```

Use instead:

```rust
for x in s.splitn(2, ":") {
    // ..
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4004

## transmute_null_to_fn

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.68.0

### What it does

Checks for null function pointer creation through transmute.

### Why is this bad?

Creating a null function pointer is undefined behavior.

More info: https://doc.rust-lang.org/nomicon/ffi.html#the-nullable-pointer-optimization

### Known problems

Not all cases can be detected at the moment of this writing.
For example, variables which hold a null pointer and are then fed to a `transmute`
call, aren’t detectable yet.

### Example

```rust
let null_fn: fn() = unsafe { std::mem::transmute( std::ptr::null::<()>() ) };
```

Use instead:

```rust
let null_fn: Option<fn()> = None;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/transmute/mod.rs#L237

## transmuting_null

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.35.0

### What it does

Checks for transmute calls which would receive a null pointer.

### Why is this bad?

Transmuting a null pointer is undefined behavior.

### Known problems

Not all cases can be detected at the moment of this writing.
For example, variables which hold a null pointer and are then fed to a `transmute`
call, aren’t detectable yet.

### Example

```rust
let null_ref: &u64 = unsafe { std::mem::transmute(0 as *const u64) };
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/transmute/mod.rs#L375

## uninit_assumed_init

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.39.0

### What it does

Checks for `MaybeUninit::uninit().assume_init()`.

### Why is this bad?

For most types, this is undefined behavior.

### Known problems

For now, we accept empty tuples and tuples / arrays
of `MaybeUninit`. There may be other types that allow uninitialized
data, but those are not yet rigorously defined.

### Example

```rust
// Beware the UB
use std::mem::MaybeUninit;

let _: usize = unsafe { MaybeUninit::uninit().assume_init() };
```

Note that the following is OK:

```rust
use std::mem::MaybeUninit;

let _: [MaybeUninit<bool>; 5] = unsafe {
    MaybeUninit::uninit().assume_init()
};
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4217

## uninit_vec

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.58.0

### What it does

Checks for `set_len()` call that creates `Vec` with uninitialized elements.
This is commonly caused by calling `set_len()` right after allocating or
reserving a buffer with `new()`, `default()`, `with_capacity()`, or `reserve()`.

### Why is this bad?

It creates a `Vec` with uninitialized data, which leads to
undefined behavior with most safe operations. Notably, uninitialized
`Vec<u8>` must not be used with generic `Read`.

Moreover, calling `set_len()` on a `Vec` created with `new()` or `default()`
creates out-of-bound values that lead to heap memory corruption when used.

### Known Problems

This lint only checks directly adjacent statements.

### Example

```rust
let mut vec: Vec<u8> = Vec::with_capacity(1000);
unsafe { vec.set_len(1000); }
reader.read(&mut vec); // undefined behavior!
```

### How to fix?

- Use an initialized buffer:

```rust
let mut vec: Vec<u8> = vec![0; 1000];
reader.read(&mut vec);
```

- Wrap the content in `MaybeUninit`:

```rust
let mut vec: Vec<MaybeUninit<T>> = Vec::with_capacity(1000);
vec.set_len(1000);  // `MaybeUninit` can be uninitialized
```

- If you are on 1.60.0 or later, `Vec::spare_capacity_mut()` is available:

```rust
let mut vec: Vec<u8> = Vec::with_capacity(1000);
let remaining = vec.spare_capacity_mut();  // `&mut [MaybeUninit<u8>]`
// perform initialization with `remaining`
vec.set_len(...);  // Safe to call `set_len()` on initialized part
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/uninit_vec.rs#L12

## unit_cmp

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for comparisons to unit. This includes all binary
comparisons (like `==` and `<`) and asserts.

### Why is this bad?

Unit is always equal to itself, and thus is just a
clumsily written constant. Mostly this happens when someone accidentally
adds semicolons at the end of the operands.

### Example

```rust
if {
    foo();
} == {
    bar();
} {
    baz();
}
```

is equal to

```rust
{
    foo();
    bar();
    baz();
}
```

For asserts:

```rust
assert_eq!({ foo(); }, { bar(); });
```

will always succeed

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unit_types/mod.rs#L51

## unit_hash

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.58.0

### What it does

Detects `().hash(_)`.

### Why is this bad?

Hashing a unit value doesn’t do anything as the implementation of `Hash` for `()` is a no-op.

### Example

```rust
match my_enum {
	Empty => ().hash(&mut state),
	WithValue(x) => x.hash(&mut state),
}
```

Use instead:

```rust
match my_enum {
	Empty => 0_u8.hash(&mut state),
	WithValue(x) => x.hash(&mut state),
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4252

## unit_return_expecting_ord

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.47.0

### What it does

Checks for functions that expect closures of type
`Fn(...) -> Ord` where the implemented closure returns the unit type.
The lint also suggests to remove the semi-colon at the end of the statement if present.

### Why is this bad?

Likely, returning the unit type is unintentional, and
could simply be caused by an extra semi-colon. Since `()` implements `Ord`
it doesn’t cause a compilation error.
This is the same reasoning behind the `unit_cmp` lint.

### Known problems

If returning unit is intentional, then there is no
way of specifying this without triggering `needless_return` lint

### Example

```rust
let mut twins = vec![(1, 1), (2, 2)];
twins.sort_by_key(|x| { x.1; });
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unit_return_expecting_ord.rs#L9

## unsound_collection_transmute

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.40.0

### What it does

Checks for transmutes between collections whose
types have different ABI, size or alignment.

### Why is this bad?

This is undefined behavior.

### Known problems

Currently, we cannot know whether a type is a
collection, so we just lint the ones that come with `std`.

### Example

```rust
// different size, therefore likely out-of-bounds memory access
// You absolutely do not want this in your code!
unsafe {
    std::mem::transmute::<_, Vec<u32>>(vec![2_u16])
};
```

You must always iterate, map and collect the values:

```rust
vec![2_u16].into_iter().map(u32::from).collect::<Vec<_>>();
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/transmute/mod.rs#L397

## unused_io_amount

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for unused written/read amount.

### Why is this bad?

`io::Write::write(_vectored)` and
`io::Read::read(_vectored)` are not guaranteed to
process the entire buffer. They return how many bytes were processed, which
might be smaller
than a given buffer’s length. If you don’t need to deal with
partial-write/read, use
`write_all`/`read_exact` instead.

When working with asynchronous code (either with the `futures`
crate or with `tokio`), a similar issue exists for
`AsyncWriteExt::write()` and `AsyncReadExt::read()` : these
functions are also not guaranteed to process the entire
buffer.  Your code should either handle partial-writes/reads, or
call the `write_all`/`read_exact` methods on those traits instead.

### Known problems

Detects only common patterns.

### Examples

```rust
use std::io;
fn foo<W: io::Write>(w: &mut W) -> io::Result<()> {
    w.write(b"foo")?;
    Ok(())
}
```

Use instead:

```rust
use std::io;
fn foo<W: io::Write>(w: &mut W) -> io::Result<()> {
    w.write_all(b"foo")?;
    Ok(())
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/unused_io_amount.rs#L11

## useless_attribute

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for `extern crate` and `use` items annotated with
lint attributes.

This lint permits lint attributes for lints emitted on the items themself.
For `use` items these lints are:

- `ambiguous_glob_reexports`

- `dead_code`

- `deprecated`

- `hidden_glob_reexports`

- `unreachable_pub`

- `unused`

- `unused_braces`

- `unused_import_braces`

- `clippy::disallowed_types`

- `clippy::enum_glob_use`

- `clippy::macro_use_imports`

- `clippy::module_name_repetitions`

- `clippy::redundant_pub_crate`

- `clippy::single_component_path_imports`

- `clippy::unsafe_removed_from_name`

- `clippy::wildcard_imports`

For `extern crate` items these lints are:

- `unused_imports` on items with `#[macro_use]`

### Why is this bad?

Lint attributes have no effect on crate imports. Most
likely a `!` was forgotten.

### Example

```rust
#[deny(dead_code)]
extern crate foo;
#[forbid(dead_code)]
use foo::bar;
```

Use instead:

```rust
#[allow(unused_imports)]
use foo::baz;
#[allow(unused_imports)]
#[macro_use]
extern crate baz;
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/attrs/mod.rs#L504

## vec_resize_to_zero

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.46.0

### What it does

Finds occurrences of `Vec::resize(0, an_int)`

### Why is this bad?

This is probably an argument inversion mistake.

### Example

```rust
vec![1, 2, 3, 4, 5].resize(0, 5)
```

Use instead:

```rust
vec![1, 2, 3, 4, 5].clear()
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L4933

## while_immutable_condition

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks whether variables used within while loop condition
can be (and are) mutated in the body.

### Why is this bad?

If the condition is unchanged, entering the body of the loop
will lead to an infinite loop.

### Known problems

If the `while`-loop is in a closure, the check for mutation of the
condition variables in the body can cause false negatives. For example when only `Upvar` `a` is
in the condition and only `Upvar` `b` gets mutated in the body, the lint will not trigger.

### Example

```rust
let i = 0;
while i > 10 {
    println!("let me loop forever!");
}
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/loops/mod.rs#L730

## wrong_transmute

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: pre 1.29.0

### What it does

Checks for transmutes that can’t ever be correct on any
architecture.

### Why is this bad?

It’s basically guaranteed to be undefined behavior.

### Known problems

When accessing C, users might want to store pointer
sized objects in `extradata` arguments to save an allocation.

### Example

```rust
let ptr: *const T = core::intrinsics::transmute('x')
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/transmute/mod.rs#L448

## zst_offset

Grupo: `correctness` · Nível padrão: `deny` · Adicionado em: 1.41.0

### What it does

Checks for `offset(_)`, `wrapping_`{`add`, `sub`}, etc. on raw pointers to
zero-sized types

### Why is this bad?

This is a no-op, and likely unintended

### Example

```rust
unsafe { (&() as *const ()).offset(1) };
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/methods/mod.rs#L5064
