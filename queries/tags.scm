; Methods and functions

(method_decl
  name: (identifier) @name) @definition.method

(function_decl
  name: (identifier) @name) @definition.function

(constructor_decl
  name: (identifier) @name) @definition.method

(iterator_decl
  name: (identifier) @name) @definition.function

; Types

(class_decl
  name: (identifier) @name) @definition.class

(trait_decl
  name: (identifier) @name) @definition.interface

(datatype_decl
  name: (identifier) @name) @definition.class

(newtype_decl
  name: (identifier) @name) @definition.class

(synonym_type_decl
  name: (identifier) @name) @definition.class

; Modules

(module_definition
  name: (qualified_name) @name) @definition.module

; Fields

(field_decl
  name: (identifier) @name) @definition.field

(constant_field_decl
  name: (identifier) @name) @definition.field

; References

(named_type
  (qualified_name (identifier) @name)) @reference.type

; Note: call_expression references omitted due to tree-sitter query engine
; assertion failure with this grammar's GLR/external scanner structure
