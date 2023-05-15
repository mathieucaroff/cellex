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

let readRule = compose(third, (x) => x.join('').replace(/_/g, ''))
%}


main -> _ (auto_purely_numeric | digits_and_letters) _ {% ([_, [x]]) => x %}
auto_purely_numeric -> [0-9]:+ {% ([x]) => +x.join('') %}
digits_and_letters -> _ (dimension:? neighborhood_size:? colors:? rule) _ {%
  ([_, [dimension, neighborhoodSize, colors, rule]]) => ({
	  dimension,
	  neighborhoodSize,
	  colors,
	  transitionString: rule,
  })
%}

_ -> " ":*

dimension -> [0-9]:+ _ ("d" | "dimension") _ "," _ {% first %}
neighborhood_size -> ("ns" | ("neighborhood" _ "size")) _ [0-9]:+ _ "," _ {% third %}
colors -> [0-9]:+ _ ("c" | "colors") _ "," _ {% first %}

rule -> generic_rule | elementary_rule | totalistic_code
generic_rule -> ("r" | "rule") _ [0-9_]:+ _ {% readRule %}
elementary_rule -> ("e" | "elementary") _ [0-9]:+ {% readRule %}
totalistic_code -> ("c" | "code") _ [0-9]:+ {% readRule %}
