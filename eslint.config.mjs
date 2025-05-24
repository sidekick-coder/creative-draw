import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginVue from "eslint-plugin-vue";
import { defineConfig } from "eslint/config";
import prettier from "eslint-plugin-prettier/recommended";

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,vue}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  pluginVue.configs["flat/essential"],
  { files: ["**/*.vue"], languageOptions: { parserOptions: { parser: tseslint.parser } } },
    prettier,
    {
        rules: {
             'no-undef': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-function-type': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    'vue/multi-word-component-names': 'off',
    'vue/no-setup-props-destructure': 'off',
    'vue/one-component-per-file': 'off',
    'vue/no-v-html': 'off',
    'vue/no-v-text-v-html-on-component': 'off',
    'vue/require-toggle-inside-transition': 'off',
    'vue/require-explicit-emits': 'off',
    'vue/html-indent': 'off',
    'vue/max-attributes-per-line': 'off',
    'vue/html-self-closing': 'off',
    'tailwindcss/no-custom-classname': 'off',
    'vue/singleline-html-element-content-newline': 'off',
    'linebreak-style': 'off',
    'prettier/prettier': [
        'error',
        {
            endOfLine: 'auto',
            trailingComma: 'es5',
            semi: false,
            singleQuote: true,
            useTabs: false,
            quoteProps: 'consistent',
            tabWidth: 4,
            bracketSpacing: true,
            arrowParens: 'always',
            printWidth: 100,
        },
    ],
        }
    }
]);
