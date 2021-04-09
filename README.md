# [WIP] coc-jsdoc

[lehre](https://www.npmjs.com/package/lehre) (jsdoc/esdoc/tsdoc document block generator) extension for [coc.nvim](https://github.com/neoclide/coc.nvim)

<img width="780" alt="coc-jsdoc-demo" src="https://user-images.githubusercontent.com/188642/113977955-4cfecb80-987e-11eb-98e7-73e0fce9a452.gif">

## [WIP]TODO

- For "line" and "range" of "Code Actions", automatically detect and process the range of the corresponding symbol block

## Install

**CocInstall**:

> TODO

**vim-plug**:

```vim
Plug 'yaegassy/coc-jsdoc', {'do': 'yarn install --frozen-lockfile'}
```

## Note

Quickly generate document block for typescript/javascript.

## Configuration options

- `jsdoc.enable`: Enable coc-jsdoc extension, default: `true`
- `jsdoc.lehrePath`: (OPTIONAL) The path to the lehre tool (Absolute path), default: `""`
- `jsdoc.formatter`: Document block formatter (--formatter), valid options `["jsdoc", "esdoc", "tsdoc"]`, default: `"jsdoc"`
- `jsdoc.enableFileAction`: Enable file-level code action, default: `false`

## Code Actions

- `Add document block for "Line" by jsdoc`
- `Add document block for "Range" by jsdoc`
- `Add document block for "File" by jsdoc`
  - File-level code actions are disabled (false) by default.

## Commands

- `jsdoc.run`: Run lehre for file

## Similar plugins

- [heavenshell/vim-jsdoc](https://github.com/heavenshell/vim-jsdoc)
  - This is a vim plugin by the author of lehre.

## Thanks

- [heavenshell/ts-lehre](https://github.com/heavenshell/ts-lehre) | [lehre](https://www.npmjs.com/package/lehre)

## License

MIT

---

> This extension is built with [create-coc-extension](https://github.com/fannheyward/create-coc-extension)
