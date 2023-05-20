@{%
let first = ([value]) => value
let second = ([_, value]) => value
let third = ([_a, _b, value]) => value

let ruleNumber = (v) => v.join('').replace(/_/g, '')

let debug = (name) => (...args) => {
  return `${name}: ${args.map(JSON.stringify).join('; ')}`
}
%}


main -> _ (numeric_three_cell_neigborhood | elementary_rule | any_automaton) _ {% ([_, [x]]) => x %}

numeric_three_cell_neigborhood -> [0-9_]:+ {% ([x]) => ["numeric", ruleNumber(x)] %}

elementary_rule -> ("e" | "elementary") _ [0-9]:+ _ {% ([_a, _b, x]) => ["elementary", ruleNumber(x)] %}

any_automaton -> _ (dimension:? neighborhood_size:? colors:? rule) _ {%
  ([_, [dimension, neighborhoodSize, colors, rule]]) => ([
    "any",
    {
      dimension,
      neighborhoodSize,
      colors,
      transitionString: rule,
    }
  ])
%}

_ -> " ":*

dimension -> [0-9]:+ _ ("d" | "dimension") _ "," _ {% first %}
neighborhood_size -> ("ns" | ("neighborhood" _ "size")) _ [0-9]:+ _ "," _ {% ([_a, _b, x]) => x.join('') %}
colors -> [0-9]:+ _ ("c" | "colors") _ "," _ {% first %}

rule -> generic_rule  {% first %} | totalistic_code {% first %}
generic_rule -> ("r" | "rule") _ [0-9_]:+ _ {% ([_a, _b, x]) => ["rule", ruleNumber(x)] %}
totalistic_code -> ("c" | "code") _ [0-9_]:+ _ {% ([_a, _b, x]) => ["code", ruleNumber(x)] %}
