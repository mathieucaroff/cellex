@include "./border.ne"

main ->
    left_central_right {% first %}
  | single_cycle {% first %}

left_central_right -> "(" group ")" group:? "(" group ")" {%
   ([_a, cycleLeft, _b, center, _c, cycleRight, _d]) => ({
      center: either(center, emptyGroup),
      cycleLeft,
      cycleRight,
   })
%}

single_cycle -> "(" group ")" {% ([_, cycle]) => ({
  center: emptyGroup,
  cycleLeft: cycle,
  cycleRight: cycle,
}) %}
