

## Plan: Make Nexora a True React Component Builder (v1.0.8)

The current architecture has a gap: `customComponents` only overrides **rendering** of existing node types. A host can't register **new** block types that appear in the palette, and `NodeType` is a fixed union string. This means a host with custom React components (e.g. `PricingTable`, `TeamGrid`, `FAQ`) can't add them to the builder.

### What changes

**1. Make `NodeType` extensible** (`src/types/schema.ts`)
- Change `NodeType` from a closed union to `BuiltInNodeType | (string & {})` so hosts can use any string as a node type without TypeScript errors.

**2. Add `registerBlock()` API** (`src/lib/block-registry.ts`)
- New exported function: `registerBlock(def: BlockDefinition)` that adds a block to the registry at runtime.
- New exported function: `registerBlocks(defs: BlockDefinition[])` for batch registration.
- This makes custom blocks appear in the **Blocks palette** with icon, label, category, and drag-and-drop support — exactly like built-in blocks.

**3. Accept `extraBlocks` prop on `NexoraBuilderApp`** (`src/NexoraBuilderApp.tsx`)
- New optional prop `extraBlocks?: BlockDefinition[]` that auto-registers blocks on mount.
- This pairs with `customComponents` — `extraBlocks` defines metadata (palette entry, default props), `customComponents` defines the React renderer.

**4. Bump version to 1.0.8** (`package.json`)
- The version is still `1.0.7`. Bump to `1.0.8` so all changes ship together.

**5. Export new APIs** (`src/index.ts`)
- Export `registerBlock`, `registerBlocks` from block-registry.

### Host usage after v1.0.8

```tsx
import {
  NexoraBuilderApp,
  type CustomComponentMap,
  type BlockDefinition,
} from '@mandolop97/constructor-nexora';
import { Box } from 'lucide-react';

// 1. Define block metadata (appears in palette)
const extraBlocks: BlockDefinition[] = [
  {
    type: 'PricingTable' as any,
    label: 'Pricing Table',
    category: 'Custom',
    icon: Box,
    canHaveChildren: false,
    defaultProps: { text: 'Plans', items: [...] },
    defaultStyle: { padding: '2rem' },
  },
];

// 2. Define React renderers
const customComponents: CustomComponentMap = {
  PricingTable: ({ node, mode }) => <MyPricingTable {...node.props} />,
};

// 3. Use in builder
<NexoraBuilderApp
  extraBlocks={extraBlocks}
  customComponents={customComponents}
  onSave={handleSave}
/>
```

### Files to modify

| File | Change |
|---|---|
| `src/types/schema.ts` | Make `NodeType` extensible with `string &{}` |
| `src/lib/block-registry.ts` | Add `registerBlock()` and `registerBlocks()` |
| `src/NexoraBuilderApp.tsx` | Add `extraBlocks` prop, register on mount |
| `src/index.ts` | Export `registerBlock`, `registerBlocks` |
| `package.json` | Bump to `1.0.8` |

