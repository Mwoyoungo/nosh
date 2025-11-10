# Nosh Design System

## 🎨 Complete Setup Done!

### ✅ What's Ready:

1. **Tailwind CSS** - Configured with custom Nosh theme
2. **Hugeicons** - Icon library installed
3. **Color System** - Full coral + dark theme palette
4. **UI Components** - Button, Input, Avatar, Chip, Card
5. **Path Aliases** - Use `@/` for imports

---

## 🎯 How to Use

### Start Dev Server
```bash
cd C:/nosh/web-version/nosh
npm run dev
```

### Import Components
```tsx
import { Button, Input, Avatar, Chip, Card } from '@/components/ui';
import { Icons } from '@/theme';
```

---

## 📦 Components

### Button
```tsx
<Button variant="primary">Click Me</Button>
<Button variant="secondary" size="lg" leftIcon={<Icons.Add />}>Add</Button>
<Button loading>Loading...</Button>
```

**Variants:** `primary | secondary | outline | ghost | danger`
**Sizes:** `sm | md | lg`

### Input
```tsx
<Input
  label="Username"
  placeholder="Enter username"
  leftIcon={<Icons.Profile size={20} />}
/>
```

### Avatar
```tsx
<Avatar size="md" fallback="JD" />
<Avatar size="lg" src="https://..." />
```

**Sizes:** `xs | sm | md | lg | xl | 2xl`

### Chip
```tsx
<Chip label="Rent" variant="primary" />
<Chip label="Food" icon={<Icons.Restaurant />} selected />
```

### Card
```tsx
<Card padding="md">
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

---

## 🎨 Colors

### Brand Colors
- **Primary:** `bg-coral-400` (#EF5350)
- **Hover:** `bg-coral-500`
- **Dark:** `bg-coral-600`

### Dark Theme
- **Background:** `bg-dark-bg` (#000000)
- **Surface:** `bg-dark-surface` (#121212)
- **Card:** `bg-dark-card` (#1E1E1E)
- **Border:** `border-dark-border` (#2C2C2C)

### Text
- **Primary:** `text-text-primary` (#FFFFFF)
- **Secondary:** `text-text-secondary` (#B3B3B3)
- **Tertiary:** `text-text-tertiary` (#737373)

---

## 🔥 Icons (Hugeicons)

All icons available via `Icons` object:

```tsx
<Icons.Home size={24} />
<Icons.Messages size={20} />
<Icons.Heart size={24} className="text-coral-400" />
```

**Available Icons:**
- Navigation: Home, Messages, Profile, Add, Menu
- Actions: Search, Heart, Comment, Share, Edit, Delete
- Media: Camera, Image, Video, Play, Pause
- Location: Location, Map, Pin, Navigation
- UI: Check, Close, ChevronLeft, ChevronRight
- Categories: Restaurant, Service, Store, Hammer
- Property: Bed, Bathroom
- Money: Cash, Money, Wallet

---

## 🛠️ Utilities

### Gradients
```tsx
<div className="text-gradient-coral">Gradient Text</div>
<div className="glass-morphism">Glassmorphic background</div>
```

### Scrollbar
```tsx
<div className="hide-scrollbar">No scrollbar</div>
```

### Safe Area
```tsx
<div className="safe-top safe-bottom">Respects notch/home bar</div>
```

---

## 📁 File Structure

```
src/
├── components/
│   └── ui/
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Avatar.tsx
│       ├── Chip.tsx
│       ├── Card.tsx
│       └── index.ts
├── theme/
│   ├── colors.ts
│   ├── icons.tsx
│   └── index.ts
└── index.css (Tailwind + custom styles)
```

---

## 🚀 Next Steps

Everything is ready! Just run:

```bash
npm run dev
```

Then start building pages like:
- `/src/pages/FeedPage.tsx`
- `/src/pages/AuthPage.tsx`
- `/src/components/video/VideoPlayer.tsx`

All with consistent design! 🎉
