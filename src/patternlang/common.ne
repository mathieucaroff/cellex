@{%
let first = ([value]) => value
let second = ([_, value]) => value

let compose =
    (...fArgs) =>
    (arg) => {
        let res = fArgs.reduce((acc, fun) => fun(acc), arg)
        return res
    }

let log = (name) => (f) => (value) => {
    let res = f(value)
    console.log(name, value, res) // console.log allowed because it is inside the `log`` function
    return res
}

let either = (primary, alternative) => {
    if (primary !== null && primary !== undefined) {
        return primary
    } else {
        return alternative
    }
}

// If given a non-null quantity, adujst x's quantity and width accordingly
let maybeQuantified = ([[element], maybeQuantity]) => {
    let quantity = either(maybeQuantity, 1)
    element.quantity *= quantity
    if (element.width) {
        element.width *= quantity
    }
    return element
}
%}

# Macros

## Parenthesing

parenthesized[X] -> "(" $X ")" {% compose(second, first) %}
bracketed[X] -> "[" $X "]" {% compose(second, first) %}

## Quantification

quantified[element] -> $element quantity {% maybeQuantified %}
maybeQuantified[element] -> $element quantity:? {% maybeQuantified %}

quantity -> "{" integer "}" {% second %}

# Integer
integer -> [0-9]:+ {% ([digitList]) => +digitList.join('') %}
