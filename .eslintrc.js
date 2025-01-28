module.exports = {
  env: {
    commonjs: true,
    es6: true,
    node: true,
  },
  globals: { fetch: false }, // temp, fetch is present in node 18
  parserOptions: { ecmaVersion: 2020 },
  plugins: ['import'],
  rules: {
    'semi': [2, 'never'],
    'quotes': [2, 'single'],
    'quote-props': [2, 'consistent-as-needed'],
    'comma-dangle': [2, 'always-multiline'],

    'curly': 2,
    'brace-style': [2, 'stroustrup'],
    'arrow-parens': [2, 'as-needed'],

    'key-spacing': 2,
    'comma-spacing': 2,
    'arrow-spacing': 2,
    'spaced-comment': 2,
    'keyword-spacing': 2,
    'space-before-blocks': 2,
    'space-in-parens': [2, 'never'],
    'space-before-function-paren': [2, { anonymous: 'always', named: 'never', asyncArrow: 'always' }],
    'space-infix-ops': 2,
    'no-trailing-spaces': 2,
    'eol-last': [2, 'always'],
    'no-multiple-empty-lines': [2, { max: 1, maxEOF: 0 }],
    'array-element-newline': [2, 'consistent'],
    'array-bracket-newline': [2, { multiline: true }],
    'array-bracket-spacing': [2, 'never'],
    'object-curly-spacing': [2, 'always'],
    'object-curly-newline': [2, { multiline: true }],
    'multiline-ternary': [2, 'always-multiline'],
    'indent': [2, 2, { SwitchCase: 1, flatTernaryExpressions: true }],

    'no-console': 2,

    'no-var': 2,
    'prefer-const': 2,

    'no-param-reassign': [2, { props: false }],

    'no-undef': 2,
    'no-unused-vars': 2,
    'no-unused-expressions': 2,
    'no-dupe-keys': 2,

    'import/exports-last': 2,
    'import/group-exports': 2,
    'import/newline-after-import': 2,
    'import/no-named-default': 2,
    'import/no-unassigned-import': 2,
    'import/order': [2, { alphabetize: { order: 'asc' } }],
    'import/prefer-default-export': 2,
  },
}
