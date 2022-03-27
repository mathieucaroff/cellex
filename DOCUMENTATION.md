# Cellex Documentation

Cellex is a cellular automaton exploration tool. It works with monodimensional automaton only and allows automaton using up to six states, each represented by a color, with a neigboorhood size of three (left cell, self, right cell), though the engine can work with up to eleven states.

# Content

- [Cellex Documentation](#cellex-documentation)
- [Content](#content)
- [Base interface](#base-interface)
  - [View](#view)
  - [View header](#view-header)
    - [Rule Input](#rule-input)
    - [Genesis](#genesis)
  - [View footer](#view-footer)
  - [Rule Editor](#rule-editor)
    - [Simulation topology selector](#simulation-topology-selector)
    - [Simulation border fields](#simulation-border-fields)
  - [Display Controller](#display-controller)
    - [Zoom](#zoom)
    - [Width and Height](#width-and-height)
    - [Generation and spatial position](#generation-and-spatial-position)

# Base interface

The application includes the following parts:

- The **view**, or display -- this is where the cellular automaton is displayed.
- The **view header** and the **view footer** provide some controls for the view.

Please note the theme of the application as well as that of the view can be changed via a dropdown selector at the bottom of the `Controls` section, in the `Theme` subsection. This feature [is documented in this page](#theme-selector).

## View

The view displays the current cellular automaton.

The view supports click and drag, allowing panning using the mouse. Note that when the cellular automaton is being played, the vertical component of the mouse panning is disabled, i.e. only the vertical component is considered.

The view, when selected, also supports the following keyboard actions:

- Space does play/pause
- Enter does a single step
- `-` and `+` do zoom decrease and increase (`_` and `=` work too)
- `[` and `]` do halving and doubling the speed
- `{`, `|` and `}` do go to the left end, the right end or the center
- The directional arrows move the camera in the given direction by a twelfth
  of the width or the height of the view
- The Home / End / PageUp / PageDown keys move the camera by the full width or height of the view

## View header

The view header has three parts:

- the **rule** input
- the genesis selector
- the autosizing buttons

### Rule Input

The rule input allows to choose an elementary rule between 0 and 255, to be displayed.

### Genesis

The genesis selector allows to choose what the how the starting state of the automaton should be generated. The genesis selector offers a preset of options:

- Impulse 1, Impulse 3 and Impulse 5 are deterministic. They all correspond to a starting position where all but one or two cells are dead. Their names are chosen because of the binary notation of each number: 3 is written `0b11` and 5 is written `0b101`.

- Random 10%, Random 50% and Random 90% are genesis states randomly generated states. The percentage is the likelihood to be alive, for each cell.

  Please note that the random used in the simulator is generated with a seed. This allows the application's random to be deterministic. It makes the initial state of the application reproducible, given the seed. The seed parameter can be found in the Engine menu.

Next to the genesis selector is a dice button. This dice allows to randomly
generate a new seed, to obtain a new initial state.

## View footer

The view footer has two parts:

- the navigation block
- the play block

The navigation block allows zooming in and out, and panning using arrows.

The play block allows starting and pausing the vertical autoscroll of the automaton, changing the play speed, and showing a single new generation.

## Rule Editor

The rule editor shows the resulting cell of for each of all the possible combinations of states.

### Simulation topology selector

This selector has two possible values: "loop" and "border". It controls the behavior of the border of the simulation.

In the setting "loop" the borders behave as if the cell just out of the simulation, was the value of the other border, effectively making the space of the simulation a closed ribbon. In this setting, the "Border Left" and "Border Right" fields are disabled.

In the setting "border" the borders ignore the values present at the other border of the simulation. Instead, their values are dictated by the "Border Left" and "Border Right" fields.

The border fields are documented below.

The width sets the length of the ribbon i.e. the size of the space the in which the simulation runs.

The seed is the value used to generate any random value if the generation of top border and side borders. The seed can be retrieved and set from the seed field.

Pressing the "Random seed" button will generate a random seed from a non-deterministic source of random (the browser's `Math.random` function). To be specific, the random seed button uses the following:

```cs
Math.random().toString(36).slice(2).toUpperCase()
```

Constraints: None. The seed can be any string, though the seed text field always
replaces the empty seed by `_`.

### Simulation border fields

**The border fields are multiline, and thus require pressing Shift+Enter to be validated**. Pressing enter adds a new line.

The border top, border left and border right fields have a simple syntax inspired from regexes [(a programming text parsing tool)](https://en.wikipedia.org/wiki/Regular_expression). This syntax uses the following grouping ideas:

- `()` parenthesis denote repetition of the pattern inside (and it's called a cycle)
- `[]` square brackets denote randomness, though they can be deterministic if used with a single value

Note that currently, the syntax does not support nesting groups of any kind. Top border should contain one or two groups. The side borders (left and right) should contain exactly one group.

Here are commented examples of valid top borders:

- `(0)` This represents a deterministic initialization to a dead state, this is usually an uninteresting genesis.
- `(1)` This represents a deterministic initialization to a live state, this is usually an uninteresting genesis.
- `(0)1(0)` This represents the genesis of `Impulse 1`: A single one, and infinite zeros one each side
- `(0)11(0)` This represents the genesis of `Impulse 3`.
- `(0)101(0)` This represents the genesis of `Impulse 5`.
- `([01])` This represents the genesis of `Random 50%`.
- `([00000000001])` This represents the genesis of `Random 10%`.
- `([01111111111])` This represents the genesis of `Random 90%`.

Here are commented examples of valid side borders:

- `(0)` This is the always-dead border.
- `(1)` This is the always-living border.
- `([01])` This is the border whose liveliness is random, with a probability of 50% for each cell. Note that the random values depend on the random seed, just like for the top border.
- `111(0)` This is the border that is alive for the first three generations, then dead forever.
- `(01)` This is the border that alternates between death and live at each generation.
- `(0001)` This is the border that is alive only every four generations
- `(000[01])` This is the border that has a 50% chance of being alive every 4 generations.

## Display Controller

All the controls in this pane influence the values used for displaying the computation, but none influence the way it is computed.

The display controller has 7 number inputs and a few more buttons. These are:

- Zoom
- Width, Height
- Generation, Spatial Position
- Speed
- Precise generation value
- "Show all panning buttons" checkbox

### Zoom

The zoom field controls how big cells are. The size of a single square cell will be `S x S` where S is a sixth of the zoom value. Please note that the zoom value displayed in the view footer is `S`, it is the value of zoom divided by 6.

This field is redundant with the zoom controls at of the display footer, but it
provides a much finer control. In most web browsers, the zoom field allows scrolling on it to change the value.

Constraints:

Zoom must be a value between 0 excluded and 64 included.

### Width and Height

The width and the height field allow reading and setting the size of the canvas, in pixel. Note that width and height can also be automatically adjusted
to the window using the autoresize "Fit view to window" button of the header of
the view.

Constraints: These numbers must be positive.

### Generation and spatial position

In the context of 1d cellular automaton, the generation is the equivalent to the
temporal position.

The temporal position corresponds to the Y axis, the vertical axis.

The spatial position corresponds to the X axis, the horizontal axis.

The generation field shows what the exact value of the current generation at the top of the view is. The spatial position allows to show and set the position of the leftmost visible cell on the automaton's ribbon. Note that the origin of the spatial axis is the center of the automaton, so this coordinate is negative most of the time.

This fields are redundant with the panning feature of the view, but it allows
precise reading and setting of the spatial position and the generation.

Constraints:

- The generation must be a positive number
- The position must belong to a range that is dynamically computed, depending on
  the simulation width and the canvas width.
