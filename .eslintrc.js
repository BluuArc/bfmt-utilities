module.exports = {
    'root': true,
    'env': {
        'browser': true,
        'es6': true,
        'node': true,
        jasmine: true,
    },
    plugins: ['jasmine'],
    'extends': 'eslint:recommended',
    'globals': {
        'Atomics': 'readonly',
        'SharedArrayBuffer': 'readonly'
    },
    'parserOptions': {
        'ecmaVersion': 2018,
        'sourceType': 'module'
    },
    'rules': {
        'indent': [
            'error',
            2
        ],
        'linebreak-style': [
            'error',
            'unix'
        ],
        'quotes': [
            'error',
            'single'
        ],
        'semi': [
            'error',
            'always'
        ],
        "comma-dangle": [
            "error",
            "always-multiline"
        ],
    },
    'overrides': [
        {
            files: ['gulpfile.esm.js/**/*.js'],
            rules: {
                'no-console': 'off',
            }
        },
    ]
};
