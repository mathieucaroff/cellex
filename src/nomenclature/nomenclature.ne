@{%
let first = ([value]) => value
let second = ([_, value]) => value
let third = ([_a, _b, value]) => value

let compose =
  (...fArgs) =>
  (arg) => {
    let res = fArgs.reduce((acc, fun) => fun(acc), arg)
    return res
  }

let readRule = compose(third, (x) => x.join('').replace('_', ''))
%}


main -> _ (a | b) _ {% ([_, [x]]) => x%}
a -> [0-9]:+ {% ([x]) => +x.join('') %}
b -> _ (dimension:? neighborhood_size:? colors:? rule) _ {%
  ([_, [dimension, neighborhoodSize, colors, rule]]) => ({
	  dimension: dimension,
	  neighborhoodSize: neighborhoodSize,
	  colors: colors,
	  transitionRule: rule,
  })
%}

_ -> " ":*

dimension -> [0-9]:+ _ ("d" | "dimension") _ "," _ {% first %}
neighborhood_size -> ("ns" | ("neighborhood" _ "size")) _ [0-9]:+ _ "," _ {% third %}
colors -> [0-9]:+ _ ("c" | "colors") _ "," _ {% first %}

rule -> generic_rule | elementary_rule
generic_rule -> ("r" | "rule") _ [0-9_]:+ _ {% readRule %}
elementary_rule -> ("e" | "elementary") _ [0-9]:+ {% readRule %}
