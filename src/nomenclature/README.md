# Nomenclature

_Automaton naming_

## Examples

The following entries all describe rule 110:

- `1d, ns3, 2c, r110`
- `1d,ns3,2c,r110`
- `r110`
- `e110`

They are the compact version of the following automata:

- `1 dimension, neighborhood size 3, 2 colors, rule 110`
- `rule 110`
- `elementary 110`

Cellex handles only monodimensional automata, so the descriptions beginning by `2d` or `3d` will be rejected.

By default, Cellex assumes the following:

- The dimension is one
- The neighborhood size is three
- The number of colors is two
- The rule number has no default value and must always be specified

Therefore, the following entries are all recognised and all refer to rule 110:

- `1d,ns3,r110`
- `1d,2c,r110`
- `ns3,2c,r110`
- `1d,r110`
- `ns3,r110`
- `2c,r110`
- `r110`

Note that the order of the fields (dimension, neighborhood size, color count, rule number) must be preserved, though they may all be omitted individually, except for the last part: the "rule" or "code".

Upon pressing enter, the rule text input will normalize the entry and compact it, removing unecessary parameters and setting all letters to lowercase.

In case there are no letters in the input, the parser will proceed as follow:

- If the number is between 0 included and 256 excluded, it will be read as an elementary rule.
- If the number is greater or equal to 256, it will first try to parse it with a neighborhood size of three and with three colors, then with four colors, then with five colors and then with six colors.

The automaton description format supports the case of totalistic codes. The totalistic codes are rules whose result value depends only on the sum of the values associated to the color of each cell inside their neighborhood.
