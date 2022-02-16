@include "./border.ne"

main -> group:? "(" group ")" {% ([init, _, cycle]) => ({
   init: either(init, emptyGroup),
   cycle,
}) %}
