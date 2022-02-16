@include "./common.ne"

@{%
const {
   zero,
   one,
   asNumber,
   asSimpleState,
   emptyGroup,
   stochasticState,
   totalWidth,
   withQuantity,
} = require('./borderPostprocessor')
%}


# Group implements quantified
group -> element:+ {% ([elementList]) => {
   return {
      type: 'group',
      content: elementList,
      quantity: 1,
      width: totalWidth(elementList),
   }
} %}

# Element implements quantified
element ->
  maybeQuantified[simpleState] {% first %}
| maybeQuantified[bracketed[stochasticState]] {% first %}
| quantified[parenthesized[group]] {% first %}

# State implements quantified
simpleState -> stateNumber {% asSimpleState %}
stochasticState -> maybeQuantified[qStateNumber]:+ {% stochasticState %}

# StateNumber
stateNumber -> [0-9] {% asNumber %}

# QStateNumber implements quantified
qStateNumber -> stateNumber {% withQuantity %}
