# Cellex Documentation

Cellex is a cellular automaton exploration tool. It works with monodimensional automaton only and allows automaton using up to six states, each represented by a color, with a neighborhood size of three (left cell, self, right cell), though the engine can work with up to sixteen states, or with a neighborhood of size 11.

# Content

- [Cellex Documentation](#cellex-documentation)
- [Content](#content)
- [Base interface](#base-interface)
  - [View](#view)
  - [Top Toolbar](#top-toolbar)
    - [Automaton Input Widget](#automaton-input-widget)
  - [Top Menu](#top-menu)
    - [Genesis](#genesis)
  - [Automaton Editor](#automaton-editor)
    - [Simulation topology selector](#simulation-topology-selector)
    - [Simulation border fields](#simulation-border-fields)
    - [Zoom](#zoom)
    - [Canvas width and height](#canvas-width-and-height)
    - [Generation and spatial position](#generation-and-spatial-position)

# Base interface

The application includes the following parts:

- The **view**, or display -- this is where the cellular automaton is displayed
- The **top toolbar**, followed by the **top menu**. They provide some controls for the view.
- The **automaton editor**

## View

The view canvas supports click and drag, allowing panning using the mouse. It also supports resizing by clicking and dragging the bottom right corner.

Please note that:

- when the zoomed simulation is of the same width or of smaller width than the canvas, the view of the simulation is locked in the center of the canvas and the horizontal canvas moves are not possible
- when the cellular automaton is being played, the vertical component of the mouse panning is disabled, i.e. only the horizontal component is considered. Also note that the heights of the two canvas are tied together.

The following shortcuts are available:

- Arrows to pan the camera by small steps
- Page up/down and home/end to pan the camera by large steps
- `-` and `+` to decrease and increase the zoom level (`_` and `=` work too)
- `[` and `]` to half and double the play speed
- `{`, `|` and `}` to move the camera to the left end, the center or the right end of the simulation
- `0` to reset the simulation to the beginning
- The directional arrows move the camera in the given direction by a twelfth
  of the width or of the height of the view
- The Home / End / PageUp / PageDown keys move the camera by the full width or height of the view

When the view is selected, it also supports the following keyboard actions:

- Space does play/pause
- Enter plays a single step of cellular automaton

## Top Toolbar

The top toolbar is composed of a **play/pause** button, a **automaton input widget** and a **genesis selector**.

## Automaton Input Widget

The automaton input widget allows to input an automaton descriptor. For automata with more than two colors, the number of colors must be specified in the descriptor, e.g. "3 colors". For automata whose neighborhood is larger than 3 cells, the neighborhood size must be specified, e.g. "neighborhood size 5". Finally, the rule number or code number of the automaton must always be specified, e.g. "rule 901" or "code 376".

## Top Menu

### Genesis

The genesis selector allows to choose what the how the starting state of the automaton should be generated. The genesis selector offers a preset of options:

- Impulse 1, Impulse 3 and Impulse 5 are deterministic. They all correspond to a starting position where all but one or two cells are dead. Their names are chosen because of the binary notation of each number: 3 is written `0b11` and 5 is written `0b101`.

- Random 10%, Random 50% and Random 90% are genesis states randomly generated states. The percentage is the likelihood to be alive, for each cell.

  Please note that the random used in the simulator is generated with a seed. This allows the random of the application to be deterministic. It makes the initial state of the application reproducible, given the seed. The seed parameter can be found in the Topology menu.

  Next to the seed selector is a dice button. This dice allows to randomly
  generate a new seed, to obtain a new initial state.

## Automaton Editor

The automaton editor shows the resulting cell of for each of all the possible combinations of states. Click on a result cell or scrolling while hovering allows to change the automaton.

### Simulation topology selector

This selector has two possible values: "loop" and "border". It controls the behavior of the border of the simulation.

In the setting "loop" the borders behave as if the cell just out of the simulation, was the value of the other border, effectively making the space of the simulation a closed ribbon. In this setting, the "Border Left" and "Border Right" fields are disabled.

In the setting "border" the borders ignore the values present at the other border of the simulation. Instead, their values are dictated by the "Border Left" and "Border Right" fields. These two fields are documented in their own section, below.

The width sets the length of the ribbon i.e. the size of the space the in which the simulation runs.

The seed is the value used to generate any random value if the generation of top border and side borders. The seed can be retrieved and set from the seed field.

Pressing the "Random seed" button will generate a random seed from a non-deterministic source of random (the browser's `Math.random` function). To be specific, the random seed button uses the following:

```js
Math.random().toString(36).slice(2).toUpperCase()
```

Constraints: None. The seed can be any string, though the seed text field always
replaces the empty seed by the single underscore (`_`).

### Simulation border fields

The border top, border left and border right fields have a simple syntax inspired from regexes [(a programming text parsing tool)](https://en.wikipedia.org/wiki/Regular_expression). This syntax uses the following grouping ideas:

- `()` the pair of outermost parenthesis denotes _cycling_ of the pattern inside it. The top border must contain exactly two of these outermost pairs. The side borders must contain exactly one.
- `()` with the exception of the outermost pair, parenthesis represent _grouping_. This allows to repeat a specific pattern a certain number of time. e.g. is a shortcut for the following pattern
- `[]` square brackets denote randomness, though they can be deterministic if used with a single value
- `{}` curly braces denote repetition

Example:

- `1((01){9}[01]{2})` is equivalent to `1(010101010101010101[01][01])`

Here are commented examples of valid top borders:

- `(0)` represents a deterministic initialization to a dead state, this is usually an uninteresting genesis.
- `(1)` represents a deterministic initialization to a live state, this is usually an uninteresting genesis.
- `(0)1(0)` represents the genesis of `Impulse 1`: A single one, and infinite zeros one each side
- `(0)11(0)` represents the genesis of `Impulse 3`.
- `(0)101(0)` represents the genesis of `Impulse 5`.
- `([01])` represents the genesis of `Random 50%`.
- `([00000000001])` represents the genesis of `Random 10%`.
- `([01111111111])` represents the genesis of `Random 90%`.

Here are commented examples of valid side borders:

- `(0)` is the always-dead border.
- `(1)` is the always-living border.
- `([01])` is the border whose liveliness is random, with a probability of 50% for each cell. Note that the random values depend on the random seed, just like for the top border.
- `111(0)` is the border that is alive for the first three generations, then dead forever.
- `(01)` is the border that alternates between death and live at each generation.
- `(0001)` is the border that is alive only every four generations
- `(000[01])` is the border that has a 50% chance of being alive every 4 generations.

### Zoom

The zoom field controls how big cells are in the zoomed up view. The size of a single square cell will be `S x S` S is the zoom value.

Note the `x2` and `/2` buttons will refuse to go past 0.25 or past 64.

### Canvas width and height

The width and the height field allow reading and setting the size the canvas, in pixel. There is a resize handle in the bottom right corner of the canvas.

### Generation and spatial position

In the context of 1d cellular automaton, the generation is the equivalent to the
temporal position.

The temporal axis corresponds to the Y axis, the vertical axis.

The spatial axis corresponds to the X axis, the horizontal axis.

The generation field shows what the exact value of the current generation at the top of the view is. The spatial position is the x coordinate of the cell at the center of the view. Note that the origin of the spatial axis is the center of the automaton, so this coordinate can be negative.

This fields are redundant with the panning feature of the view, but it allows
precise reading and setting of the spatial position and the generation.

Constraints:

- The generation must be a positive number
- The spatial position must belong to a range that is dynamically computed, depending on the simulation width and the canvas width. That range is centered on 0 and the size of the range is the difference between the simulation width and the canvas width, taking zoom into account. If that difference turns out to be negative, then the size of the range is 0.
