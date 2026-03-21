# tree-sitter-dafny

A [tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for [Dafny](https://dafny.org/), the verification-aware programming language.

## Coverage

Tested against **1,400+ real-world Dafny files** across multiple repositories:

| Test Suite | Files | Pass Rate |
|---|---|---|
| Dafny integration tests (valid subset) | 1165 | 98.5% |
| Dafny standard library | 125 | 100% |
| Advent of Code 2024 (Dafny) | 34 | 100% |
| Advent of Code 2025 (Dafny) | 35 | 100% |

## Features

- Full support for all Dafny declarations: modules, classes, traits, datatypes, newtypes, methods, functions, lemmas, iterators
- Complete expression precedence chain following the Dafny EBNF specification
- Generics disambiguation via GLR parsing with an external scanner
- Cardinality expressions (`|s|`) with scanner-based state machine implementing Dafny's `allowBitwiseOps` logic
- Syntax highlighting queries for editor integration

## Installation

### Neovim (nvim-treesitter)

Add to your nvim-treesitter configuration:

```lua
local parser_config = require("nvim-treesitter.parsers").get_parser_configs()
parser_config.dafny = {
  install_info = {
    url = "https://github.com/hath995/tree-sitter-dafny",
    files = {"src/parser.c", "src/scanner.c"},
    branch = "main",
  },
  filetype = "dafny",
}
```

Then run `:TSInstall dafny`.

### Helix

1. Add to `~/.config/helix/languages.toml` (Linux/macOS) or `%AppData%\helix\languages.toml` (Windows):

```toml
[[language]]
name = "dafny"
scope = "source.dafny"
file-types = ["dfy"]
comment-token = "//"
indent = { tab-width = 2, unit = "  " }

[language.auto-pairs]
'(' = ')'
'{' = '}'
'[' = ']'
'"' = '"'

[[grammar]]
name = "dafny"
source = { git = "https://github.com/hath995/tree-sitter-dafny", rev = "main" }
```

For local development, use `source = { path = "/path/to/tree-sitter-dafny" }` instead.

2. Fetch and build the grammar:

```bash
hx --grammar fetch
hx --grammar build
```

3. Install the query files into Helix's runtime directory:

```bash
# Linux/macOS
mkdir -p ~/.config/helix/runtime/queries/dafny
for f in highlights locals tags; do
  curl -o ~/.config/helix/runtime/queries/dafny/$f.scm \
    https://raw.githubusercontent.com/hath995/tree-sitter-dafny/main/queries/$f.scm
done

# Windows (PowerShell)
mkdir -Force "$env:APPDATA\helix\runtime\queries\dafny"
foreach ($f in "highlights","locals","tags") {
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/hath995/tree-sitter-dafny/main/queries/$f.scm" `
    -OutFile "$env:APPDATA\helix\runtime\queries\dafny\$f.scm"
}
```

4. Restart Helix. Opening a `.dfy` file should show syntax highlighting and "dafny" in the status bar.

### Emacs (treesit)

Emacs 29+ has built-in tree-sitter support via `treesit`. Add to your init file:

```elisp
(require 'treesit)

;; Register the grammar source
(add-to-list 'treesit-language-source-alist
             '(dafny "https://github.com/hath995/tree-sitter-dafny"))

;; Install the grammar (run once):
;;   M-x treesit-install-language-grammar RET dafny RET

;; Associate .dfy files
(add-to-list 'auto-mode-alist '("\\.dfy\\'" . dafny-ts-mode))

(define-derived-mode dafny-ts-mode prog-mode "Dafny"
  "Major mode for Dafny files using tree-sitter."
  (when (treesit-ready-p 'dafny)
    (treesit-parser-create 'dafny)
    (setq-local comment-start "// ")
    (setq-local treesit-font-lock-feature-list
                '((comment keyword string type number operator)))
    (setq-local treesit-font-lock-settings
                (treesit-font-lock-rules
                 :language 'dafny :feature 'comment
                 '((line_comment) @font-lock-comment-face
                   (block_comment) @font-lock-comment-face)
                 :language 'dafny :feature 'keyword
                 '(["module" "import" "export" "class" "trait" "datatype" "codatatype"
                    "newtype" "type" "iterator" "method" "lemma" "constructor"
                    "function" "predicate" "ghost" "static" "opaque" "twostate"
                    "least" "greatest" "abstract" "extends" "refines" "provides"
                    "reveals" "opened" "const" "var"
                    "if" "then" "else" "while" "for" "match" "case"
                    "return" "yield" "break" "continue" "label"
                    "requires" "ensures" "modifies" "reads" "decreases"
                    "invariant" "witness" "by"
                    "assert" "assume" "expect" "reveal" "hide"
                    "forall" "exists" "calc"
                    "new" "as" "is" "in" "old" "fresh" "unchanged" "print"
                    "to" "downto"
                    ] @font-lock-keyword-face)
                 :language 'dafny :feature 'string
                 '((string_literal) @font-lock-string-face
                   (char_literal) @font-lock-string-face)
                 :language 'dafny :feature 'type
                 '([(int_type) (nat_type) (real_type) (bool_type) (char_type)
                    (string_type) (object_type) (bitvector_type) (float_type)
                    (ordinal_type)] @font-lock-type-face
                   ["set" "iset" "multiset" "seq" "map" "imap"] @font-lock-type-face
                   (array_type) @font-lock-type-face
                   (named_type (qualified_name (identifier) @font-lock-type-face))
                   (class_decl name: (identifier) @font-lock-type-face)
                   (trait_decl name: (identifier) @font-lock-type-face)
                   (datatype_decl name: (identifier) @font-lock-type-face)
                   (newtype_decl name: (identifier) @font-lock-type-face)
                   (method_decl name: (identifier) @font-lock-function-name-face)
                   (function_decl name: (identifier) @font-lock-function-name-face))
                 :language 'dafny :feature 'number
                 '((integer_literal) @font-lock-number-face
                   (real_literal) @font-lock-number-face
                   (boolean_literal) @font-lock-constant-face
                   (null_literal) @font-lock-constant-face)
                 :language 'dafny :feature 'operator
                 '((rel_op) @font-lock-operator-face
                   [":=" ":|" ":-" "+" "-" "*" "/" "%" "!" "~"
                    "==" "!=" "!!" "!in" ".." "::" "=>"
                    "->" "~>" "-->" "returns" "yields"
                    ] @font-lock-operator-face)))))
```

### Zed

Zed requires a language extension. Create an extension directory with this structure:

```
dafny/
  extension.toml
  languages/dafny/
    config.toml
    highlights.scm
```

`extension.toml`:
```toml
[extension]
id = "dafny"
name = "Dafny"
version = "0.1.0"

[grammars.dafny]
repository = "https://github.com/hath995/tree-sitter-dafny"
commit = "main"
```

`languages/dafny/config.toml`:
```toml
name = "Dafny"
grammar = "dafny"
path_suffixes = ["dfy"]
line_comments = ["// "]
block_comment = ["/* ", " */"]
brackets = [
  { start = "{", end = "}", close = true, newline = true },
  { start = "(", end = ")", close = true, newline = false },
  { start = "[", end = "]", close = true, newline = false },
]
```

Copy `queries/highlights.scm` from this repository into `languages/dafny/highlights.scm`, then install the extension as a [Zed dev extension](https://zed.dev/docs/extensions/developing-extensions).

### From source

```bash
npm install
npx tree-sitter generate
npx tree-sitter parse example.dfy
```

## Architecture

### Grammar (`grammar.js`)

The grammar follows Dafny's [EBNF specification](https://dafny.org/dafny/DafnyRef/DafnyRef#sec-grammar) with adaptations for tree-sitter's GLR parser:

- **Expression chain**: `equiv > implies/explies > logical > relational > shift > term > factor > bitvector > as/is > unary > primary`
- **Left-recursive binary operators**: Chain levels use `prec.left()` to avoid GLR branch explosion on deeply chained expressions like `a && b && c && d && e`
- **Statement-in-expression**: Dafny allows `assert`, `assume`, `expect`, `calc`, `reveal` as expression prefixes. These use `prec.right(PREC.SEMI_EXPR)` to bind past the semicolon separator

### External Scanner (`src/scanner.c`)

The external scanner handles tokens that require context-sensitive disambiguation:

**`<` family** (`<`, `<=`, `<==`, `<==>`, `<<`, `<-`):
All tokens starting with `<` are handled by the scanner to avoid the "advance then return false" problem where an external scanner that advances past `<` and returns false corrupts the lexer state. The scanner implements `IsGenericInstantiation()` lookahead — scanning ahead for a type list followed by `>` — to distinguish generic instantiation (`List<int>`) from relational comparison (`x < y`).

**`|` family** (`|`, `||`):
The pipe character has four meanings in Dafny: cardinality delimiters (`|s|`), bitwise OR (`a | b`), comprehension guards (`set x | x > 0`), and datatype/match patterns. The scanner implements a state machine with a depth stack tracking:
- **State 1** (inside cardinality): `|` closes the cardinality expression. Bitwise `|` and `||` are disabled (matching Dafny's `allowBitwiseOps=false` logic from the ATG)
- **State 2** (after comprehension keyword): The next `|` is a guard separator, then transitions to State 1 for the closing `|`
- **Depth 0** (outside cardinality): The scanner peeks ahead for comprehension keywords (`set`, `iset`, `forall`, `exists`) to determine if `|` opens a cardinality-of-comprehension expression

**`>`, `&`, `^`**: Also handled by the scanner for consistent token control. `>` supports the split-close pattern for nested generics (`Map<K, List<V>>`).

### GLR Conflicts

Tree-sitter's GLR mode is used extensively:

- **Generics vs relational**: `f<T>` vs `f < T` — both paths fork at `<` with equal static precedence, and `prec.dynamic(10)` on the generic path wins when the content resolves as types
- **var_decl_statement vs let_expression**: Both start with `var` — `prec.dynamic(25)` on `var_decl_statement` ensures it wins at statement level
- **Expression chain self-conflicts**: Each binary operator level has a self-conflict entry to allow GLR to handle the iterative-to-left-recursive conversion

## Difficulties in Parsing Dafny

Dafny presents several unusual challenges for LR-family parsers:

### 1. Generics vs Comparison (`<` ambiguity)

`f<T>(x)` (generic call) vs `f < T` (comparison) are syntactically ambiguous until multiple tokens ahead. Dafny's own parser (Coco/R, which is LL(1)) uses a semantic predicate `IsGenericInstantiation()` with unbounded lookahead. Tree-sitter has no semantic predicates, so we combine GLR forking with an external scanner that implements the same lookahead.

### 2. The Pipe Character (`|` overloading)

`|` serves four distinct syntactic roles in Dafny, and the correct interpretation depends on expression context:
- `|s|` — cardinality (set/multiset/sequence size)
- `a | b` — bitwise OR
- `set x | x > 0 :: x * 2` — comprehension guard
- `case A | B =>` — datatype pattern alternatives

Dafny's ATG handles this by threading an `allowBitwiseOps` boolean through the parser. Inside cardinality expressions, `allowBitwiseOps` is set to false, so `|` can only be the closing delimiter or a comprehension guard — never bitwise OR. We replicate this with a depth-tracking state machine in the external scanner.

### 3. Statement-in-Expression (`var`, `assert`, `assume` in expressions)

Dafny allows `var x := e; body`, `assert P; body`, etc. as expressions. This creates a shift/reduce conflict between `var_decl_statement` (ends at `;`) and `let_expression` (continues past `;` into the body expression). Without careful precedence, the parser greedily consumes subsequent statements as the "body" of a let-expression.

### 4. Left-Recursive Chain Explosion

Tree-sitter's GLR mode can cause exponential branching when iterative `repeat(seq(op, child))` patterns encounter long chains (5+ operators). Converting to explicit left-recursive `prec.left(seq(self, op, child))` patterns eliminates this by giving the parser a single reduction path.

### 5. Nested Generics (`>>` splitting)

`Map<K, List<V>>` requires the parser to split `>>` into two closing `>` tokens. The external scanner handles this by emitting single `>` tokens for `_generic_close`.

## Remaining Known Issues

The following Dafny constructs are not yet supported (17 files, ~1.5% of the test suite):

| Issue | Description | Files |
|---|---|---|
| `/** **/` block comments | Double-star comment delimiters (non-standard) | 2 |
| Float literals `.5` / `42.` | Leading/trailing dot float notation (`fp32`/`fp64`) | 2 |
| Empty match expressions | `match x` with no cases (e.g., `var y := match x;`) | 2 |
| Digit-leading member names | Member names starting with digits (e.g., `const 90 := ...`) | 2 |
| Intentional parse-error tests | Test files containing deliberately invalid Dafny syntax | 2 |
| Stmt-in-expr edge cases | `hide *;`, `assume false;` used as expressions in specifications | 2 |
| Bitvector `--` | Double unary negation on bitvector types (`--x`) | 1 |
| Backtick frame expressions | Heap dereference syntax (`` a`[i] `` in `reads`/`modifies`) | 1 |
| `{:assumption}` mid-list | Attributes between variables in multi-var declarations | 1 |
| Binding guard in if-expression | `:| ` guard syntax inside `if-then-else` expressions | 1 |
| Assert-by with destructuring | `assert ... by { var D(x) := ... }` in `ensures` clauses | 1 |

## Development

```bash
# Generate the parser
npm run generate

# Parse a single file
npx tree-sitter parse path/to/file.dfy

# Run the integration test suite
npm run test:all        # All 1165 valid Dafny integration tests
npm run test:stdlib     # Dafny standard library (125 files)

# Quick smoke test
npm run test:100        # First 100 files
```

## References

- [Dafny Reference Manual](https://dafny.org/dafny/DafnyRef/DafnyRef)
- [Dafny EBNF Grammar](https://dafny.org/dafny/DafnyRef/DafnyRef#sec-grammar)
- [Dafny ATG (Coco/R grammar)](https://github.com/dafny-lang/dafny/blob/master/Source/DafnyCore/Dafny.atg)
- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/)

## License

MIT
