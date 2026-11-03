# Catálogo de lints do Clippy — grupo `deprecated`

## assign_ops

Grupo: `deprecated` · Nível padrão: `none` · Adicionado em: 1.30.0

### What it does

Nothing. This lint has been deprecated

### Deprecation reason

Compound operators are harmless and linting on them is not in scope for clippy.

## extend_from_slice

Grupo: `deprecated` · Nível padrão: `none` · Adicionado em: pre 1.29.0

### What it does

Nothing. This lint has been deprecated

### Deprecation reason

`Vec::extend_from_slice` is no longer faster than `Vec::extend` due to specialization.

## from_iter_instead_of_collect

Grupo: `deprecated` · Nível padrão: `none` · Adicionado em: 1.98.0

### What it does

Nothing. This lint has been deprecated

### Deprecation reason

Lint has proved problematic.

## match_on_vec_items

Grupo: `deprecated` · Nível padrão: `none` · Adicionado em: 1.88.0

### What it does

Nothing. This lint has been deprecated

### Deprecation reason

`clippy::indexing_slicing` covers indexing and slicing on `Vec<_>`.

## misaligned_transmute

Grupo: `deprecated` · Nível padrão: `none` · Adicionado em: pre 1.29.0

### What it does

Nothing. This lint has been deprecated

### Deprecation reason

Split into `clippy::cast_ptr_alignment` and `clippy::transmute_ptr_to_ptr`.

## option_map_or_err_ok

Grupo: `deprecated` · Nível padrão: `none` · Adicionado em: 1.87.0

### What it does

Nothing. This lint has been deprecated

### Deprecation reason

`clippy::manual_ok_or` covers this case.

## pub_enum_variant_names

Grupo: `deprecated` · Nível padrão: `none` · Adicionado em: 1.54.0

### What it does

Nothing. This lint has been deprecated

### Deprecation reason

`clippy::enum_variant_names` now covers this case via the `avoid-breaking-exported-api` config.

## range_step_by_zero

Grupo: `deprecated` · Nível padrão: `none` · Adicionado em: pre 1.29.0

### What it does

Nothing. This lint has been deprecated

### Deprecation reason

`Iterator::step_by(0)` now panics and is no longer an infinite iterator.

## regex_macro

Grupo: `deprecated` · Nível padrão: `none` · Adicionado em: 1.47.0

### What it does

Nothing. This lint has been deprecated

### Deprecation reason

The `regex!` macro was removed from the regex crate in 2018.

## replace_consts

Grupo: `deprecated` · Nível padrão: `none` · Adicionado em: 1.44.0

### What it does

Nothing. This lint has been deprecated

### Deprecation reason

`min_value` and `max_value` are now deprecated.

## should_assert_eq

Grupo: `deprecated` · Nível padrão: `none` · Adicionado em: pre 1.29.0

### What it does

Nothing. This lint has been deprecated

### Deprecation reason

`assert!(a == b)` can now print the values the same way `assert_eq!(a, b) can.

## string_to_string

Grupo: `deprecated` · Nível padrão: `none` · Adicionado em: 1.91.0

### What it does

Nothing. This lint has been deprecated

### Deprecation reason

`clippy::implicit_clone` covers those cases.

## unsafe_vector_initialization

Grupo: `deprecated` · Nível padrão: `none` · Adicionado em: pre 1.29.0

### What it does

Nothing. This lint has been deprecated

### Deprecation reason

The suggested alternative could be substantially slower.

## unstable_as_mut_slice

Grupo: `deprecated` · Nível padrão: `none` · Adicionado em: pre 1.29.0

### What it does

Nothing. This lint has been deprecated

### Deprecation reason

`Vec::as_mut_slice` is now stable.

## unstable_as_slice

Grupo: `deprecated` · Nível padrão: `none` · Adicionado em: pre 1.29.0

### What it does

Nothing. This lint has been deprecated

### Deprecation reason

`Vec::as_slice` is now stable.

## unused_collect

Grupo: `deprecated` · Nível padrão: `none` · Adicionado em: 1.39.0

### What it does

Nothing. This lint has been deprecated

### Deprecation reason

`Iterator::collect` is now marked as `#[must_use]`.

## wrong_pub_self_convention

Grupo: `deprecated` · Nível padrão: `none` · Adicionado em: 1.54.0

### What it does

Nothing. This lint has been deprecated

### Deprecation reason

`clippy::wrong_self_convention` now covers this case via the `avoid-breaking-exported-api` config.
