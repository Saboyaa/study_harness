# Catálogo de lints do Clippy — grupo `cargo`

## cargo_common_metadata

Grupo: `cargo` · Nível padrão: `allow` · Adicionado em: 1.32.0

### What it does

Checks to see if common metadata is defined in
`Cargo.toml`. See: https://rust-lang.github.io/api-guidelines/documentation.html#cargotoml-includes-all-common-metadata-c-metadata

### Why is this bad?

It will be more difficult for users to discover the
purpose of the crate, and key information related to it.

### Example

```rust
[package]
name = "clippy"
version = "0.0.212"
repository = "https://github.com/rust-lang/rust-clippy"
license = "MIT OR Apache-2.0"
keywords = ["clippy", "lint", "plugin"]
categories = ["development-tools", "development-tools::cargo-plugins"]
```

Should include a description field like:

```rust
[package]
name = "clippy"
version = "0.0.212"
description = "A bunch of helpful lints to avoid common pitfalls in Rust"
repository = "https://github.com/rust-lang/rust-clippy"
license = "MIT OR Apache-2.0"
keywords = ["clippy", "lint", "plugin"]
categories = ["development-tools", "development-tools::cargo-plugins"]
```

### Configuration

- 

`cargo-ignore-publish`:  For internal testing only, ignores the current `publish` settings in the Cargo manifest.

(default: `false`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/cargo/mod.rs#L16

## multiple_crate_versions

Grupo: `cargo` · Nível padrão: `allow` · Adicionado em: pre 1.29.0

### What it does

Checks to see if multiple versions of a crate are being
used.

### Why is this bad?

This bloats the size of targets, and can lead to
confusing error messages when structs or traits are used interchangeably
between different versions of a crate.

### Known problems

Because this can be caused purely by the dependencies
themselves, it’s not always possible to fix this issue.
In those cases, you can allow that specific crate using
the `allowed-duplicate-crates` configuration option.

### Example

```rust
[dependencies]
ctrlc = "=3.1.0"
ansi_term = "=0.11.0"
```

### Configuration

- 

`allowed-duplicate-crates`:  A list of crate names to allow duplicates of

(default: `[]`)

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/cargo/mod.rs#L93

## negative_feature_names

Grupo: `cargo` · Nível padrão: `allow` · Adicionado em: 1.57.0

### What it does

Checks for negative feature names with prefix `no-` or `not-`

### Why is this bad?

Features are supposed to be additive, and negatively-named features violate it.

### Example

```rust
[features]
default = []
no-abc = []
not-def = []

```

Use instead:

```rust
[features]
default = ["abc", "def"]
abc = []
def = []

```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/cargo/mod.rs#L122

## redundant_feature_names

Grupo: `cargo` · Nível padrão: `allow` · Adicionado em: 1.57.0

### What it does

Checks for feature names with prefix `use-`, `with-` or suffix `-support`

### Why is this bad?

These prefixes and suffixes have no significant meaning.

### Example

```rust
[features]
default = ["use-abc", "with-def", "ghi-support"]
use-abc = []  // redundant
with-def = []   // redundant
ghi-support = []   // redundant
```

Use instead:

```rust
[features]
default = ["abc", "def", "ghi"]
abc = []
def = []
ghi = []
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/cargo/mod.rs#L152

## wildcard_dependencies

Grupo: `cargo` · Nível padrão: `allow` · Adicionado em: 1.32.0

### What it does

Checks for wildcard dependencies in the `Cargo.toml`.

### Why is this bad?

As the edition guide says,
it is highly unlikely that you work with any possible version of your dependency,
and wildcard dependencies would cause unnecessary breakage in the ecosystem.

### Example

```rust
[dependencies]
regex = "*"
```

Use instead:

```rust
[dependencies]
some_crate_1 = "~1.2.3"

some_crate_2 = "=1.2.3"
```

Código-fonte: https://github.com/rust-lang/rust-clippy/blob/HEAD/clippy_lints/src/cargo/mod.rs#L184
