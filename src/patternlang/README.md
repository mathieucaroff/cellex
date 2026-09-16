# Pattern Language AST

`PatternType.ts` defines the parsed representation produced by `patternLanguage.ne`.
The leading flag determines the pattern mode; the following group provides its content.

```mermaid
flowchart TD
  Source[Pattern source] --> Parser[patternLanguage.ne]
  Parser --> Flag{Leading flag}
  Flag -->|!| Exact[ExactPattern\nnone repetition\nnone persistence]
  Flag -->|^| Triangle[TrianglePattern\nnone repetition\npersistent]
  Flag -->|=| Cyclic[CyclicPattern\ncycle repetition\nnone persistence]
  Flag -->|#| Grid[GridPattern\ncycle repetition\npersistent]

  Exact --> Root[PatternRootGroup\nquantity: 1]
  Triangle --> Root
  Cyclic --> Root
  Grid --> Root
  Root --> Elements[PatternElement]
  Elements --> Group[PatternGroup\nnested sequence]
  Elements --> Set[PatternSet\nstate choices]
  Group --> Elements
  Root --> Flatten[flattenPattern]
  Flatten --> Flat[FlatPattern\nStateSet per position]
```

- `quantity` repeats a group or state set; `width` is its expanded horizontal size.
- `visibility` controls whether an element contributes to the flattened result.
- A `StateSet` is the allowed numeric states for one position; multiple values express a choice.
