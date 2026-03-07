

## Plan: Bump version to 1.0.8

The codebase already has all the `customComponents` changes implemented. The only change needed is bumping the version in `package.json` from `"1.0.7"` to `"1.0.8"`.

### Change

**`package.json`** line 4: change `"version": "1.0.7"` to `"version": "1.0.8"`

### After the bump (outside Lovable)

1. Pull the updated code
2. Run `npm run build:lib`
3. Verify `dist/index.d.ts` exports `CustomComponentMap`, `NodeComponentProps`, `NodeComponent`
4. Run `npm publish --access public`
5. In the template: `npm install @mandolop97/constructor-nexora@1.0.8`

