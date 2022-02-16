@include "./border.ne"

main -> "(" group ")" group:? "(" group ")" {%
   ([_a, cycleLeft, _b, center, _c, cycleRight, _d]) => ({
      center: either(center, emptyGroup),
      cycleLeft,
      cycleRight,
   })
%}
