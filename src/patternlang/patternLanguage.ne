@include "./common.ne"

@{%
const {
    zero,
    one,
    pattern,
    flag,
    group,
    patternSet,
} = require('./patternPostprocessor')
%}


main -> pattern {% first %}

pattern -> flag group {% pattern %}

flag -> [!^=#] {% flag %}

group -> none element:+ {% group('visible') %}
hiddenGroup -> ":?" element:+ {% group('hidden') %}

none -> null
# `none` will produce one empty array when used
# while `null` is purely omitted from the output

element ->
  maybeQuantified[stateSingle] {% first %}
| maybeQuantified[bracketed[stateSet]] {% first %}
| quantified[parenthesized[group]] {% first %}
| maybeQuantified[parenthesized[hiddenGroup]] {% first %}

stateSingle -> (state) {% patternSet %}

stateSet -> state:+ {% patternSet %}

state -> "0" {% zero %} | "1" {% one %}
