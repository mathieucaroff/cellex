# Design

This file documents how certain features were designed before being implemented.

## Differential Visualisation Mode

This feature enables the user to click and highlight of one cell. In turn the cells that would be affected by a that color change become highlighted. This allows to visualise the "effect" of a cell.

This feature is mostly implemented in the engine component. It requires creating a sub-engine, feeding it the modified state line and running in parallel with the parent engine to determine which cells differ.

This feature also requires to be able to tell which cell the mouse cursor is hovering. This computation is delegated to the display. Another piece of the problem is that, as things are, the engine is not aware of state changes. Therefore, detecting changes in the state will be done in the main() file.
