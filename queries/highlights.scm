; Dafny syntax highlighting queries for tree-sitter

; ── Comments ──────────────────────────────────────────────────

(line_comment) @comment
(block_comment) @comment

; ── Literals ──────────────────────────────────────────────────

(integer_literal) @number
(real_literal) @number.float
(boolean_literal) @boolean
(null_literal) @constant.builtin
(char_literal) @character
(string_literal) @string

; ── Keywords ──────────────────────────────────────────────────

[
  "module" "import" "export" "class" "trait" "datatype" "codatatype"
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
] @keyword

; ── Types ─────────────────────────────────────────────────────

[
  (int_type) (nat_type) (real_type) (bool_type) (char_type)
  (string_type) (object_type) (bitvector_type) (float_type)
  (ordinal_type)
] @type.builtin

["set" "iset" "multiset" "seq" "map" "imap"] @type.builtin

(array_type) @type.builtin

; ── Declaration names ─────────────────────────────────────────

(method_decl name: (identifier) @function)
(function_decl name: (identifier) @function)
(constructor_decl name: (identifier) @function)
(iterator_decl name: (identifier) @function)

(class_decl name: (identifier) @type)
(trait_decl name: (identifier) @type)
(datatype_decl name: (identifier) @type)
(newtype_decl name: (identifier) @type)
(synonym_type_decl name: (identifier) @type)

(datatype_ctor name: (identifier) @constructor)

; ── Variables ─────────────────────────────────────────────────

(formal name: (identifier) @variable.parameter)
(local_var_decl name: (identifier) @variable)
(field_decl name: (identifier) @variable.member)
(constant_field_decl name: (identifier) @variable.member)
(quantifier_var (identifier) @variable.parameter)
(this_expression) @variable.builtin

; ── Operators ─────────────────────────────────────────────────

(rel_op) @operator

; ── Punctuation ───────────────────────────────────────────────

["(" ")" "[" "]" "{" "}"] @punctuation.bracket
["," ";" ":" "."] @punctuation.delimiter

; ── Attributes ────────────────────────────────────────────────

(attribute) @attribute
