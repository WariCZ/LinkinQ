module.exports = {
  // Include parentheses around a sole arrow function parameter.
  arrowParens: "always",

  // Puts the `>` of a multi-line HTML (HTML, JSX, Vue, Angular) element at the end of the last line instead of being alone on the next line (does not apply to self closing elements).
  bracketSameLine: false,

  // Controls the printing of spaces inside object literals.
  bracketSpacing: true,

  // Control whether Prettier formats quoted code embedded in the file.
  embeddedLanguageFormatting: "auto",

  // Specify the end of line used by
  endOfLine: "lf",

  // Try prettier's [new ternary formatting](https://github.com/prettier/prettier/pull/13183) before it becomes the default behavior.
  experimentalTernaries: false,

  // Specify the global [whitespace sensitivity](https://io/blog/2018/11/07/1.15.0.html#whitespace-sensitive-formatting) for HTML files.
  // Valid options:
  // - `css` - Respect the default value of CSS `display` property.
  // - `strict` - Whitespaces are considered sensitive.
  // - `ignore` - Whitespaces are considered insensitive.
  htmlWhitespaceSensitivity: "css",

  // Prettier can insert a special `@format` marker at the top of files specifying that the file has been formatted with  This works well when used in tandem with the `--require-pragma` option. If there is already a docblock at the top of the file then this option will add a newline to it with the `@format` marker.
  insertPragma: false,

  // Use single quotes instead of double quotes in JSX.
  jsxSingleQuote: false,

  // Fit code within this line limit.
  printWidth: 80,

  // (Markdown) wrap prose over multiple lines.
  proseWrap: "preserve",

  // Change when properties in objects are quoted.
  // Valid options:
  // - `"as-needed"` - Only add quotes around object properties where required.
  // - `"consistent"` - If at least one property in an object requires quotes, quote all properties.
  // - `"preserve"` - Respect the input use of quotes in object properties.
  quoteProps: "as-needed",

  // Prettier can restrict itself to only format files that contain a special comment, called a pragma, at the top of the file. This is very useful when gradually transitioning large, unformatted codebases to
  requirePragma: false,

  // Whether to add a semicolon at the end of every line.
  semi: true,

  // Enforces single attribute per line in HTML, JSX, Vue and Angular.
  singleAttributePerLine: false,

  // Use single instead of double quotes.
  singleQuote: false,

  // Number of spaces it should use per tab.
  tabWidth: 2,

  // Controls the printing of trailing commas wherever possible.
  // Valid options:
  // - `none` - No trailing commas
  // - `es5` - Trailing commas where valid in ES5 (objects, arrays, etc)
  // - `all` - Trailing commas wherever possible (function arguments)
  trailingComma: "es5",

  // Indent lines with tabs.
  useTabs: false,

  // Whether or not to indent the code inside `<script>` and `<style>` tags in Vue SFC files.
  vueIndentScriptAndStyle: false,
};
