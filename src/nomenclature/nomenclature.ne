@{%
let first = ([value]) => value
let second = ([_, value]) => value
let third = ([_a, _b, value]) => value

let ruleNumber = (v) => v.join('').replace(/_/g, '')

let debug = (name) => (...args) => {
  return `${name}: ${args.map(JSON.stringify).join('; ')}`
}
%}


main -> _ (numeric_three_cell_neighborhood | elementary_rule | any_automaton) _ {% ([_, [x]]) => x %}

# The numeric automaton production allows to specify an automaton just by giving
# its rule number, without specifying the number of states. The neighborhood
# will be assumed to be of size 3, and the number of states will be guessed from
# the size of the number. This means that autoata whose rule number is low
# compare to their number of states, cannot be described by this production.
# For this, this production is not relied on by the rule normalization scheme.
numeric_three_cell_neighborhood -> [0-9_]:+ {% ([x]) => ["numeric", ruleNumber(x)] %}

# Elementary automata. They use the prefix letter `e`
elementary_rule -> ("e" | "elementary") _ [0-9]:+ _ {% ([_a, _b, x]) => ["elementary", ruleNumber(x)] %}

# Any automaton. Only the rule number is mandatory. The dimension will be
# assumed to be 1, the neighborhoodSize 3 and the colors 2.
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
