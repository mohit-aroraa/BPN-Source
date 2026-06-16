# BPN Design Token System

This directory contains the design tokens for the BarePerformanceNutrition (BPN) design system. Design tokens are the visual design atoms of the design system — specifically, they are named entities that store visual design attributes.
## Color Tokens

The color tokens define the brand colors and their variations. All new tokens use the `bpn-` prefix to avoid conflicts with the legacy system.

### Usage

To use a color token in your SCSS:

```scss
.my-element {
  color: color("bpn-black");
  background-color: color("bpn-white");
  border: 1px solid color("bpn-grey-20");
}
```

### Available Color Tokens

#### Core Brand Colors

| Token | Hex Value | Description |
|-------|-----------|-------------|
| `bpn-black` | #333333 | Primary black color |
| `bpn-grey` | #575757 | Primary grey color |
| `bpn-red` | #EB1000 | Primary red color |
| `bpn-volt` | #DCFF00 | Accent volt color |
| `bpn-white` | #FFFFFF | White color |

#### Black Shades

| Token | Hex Value | Description |
|-------|-----------|-------------|
| `bpn-black-80` | rgba(51, 51, 51, 0.8) | 80% black |
| `bpn-black-60` | rgba(51, 51, 51, 0.6) | 60% black |
| `bpn-black-40` | #1F1F1F | 40% black |
| `bpn-black-20` | #CCCCCC | 20% black |
| `bpn-black-10` | #E5E5E5 | 10% black |

#### Grey Shades

| Token | Hex Value | Description |
|-------|-----------|-------------|
| `bpn-grey-80` | #575757 | 80% grey |
| `bpn-grey-60` | #767676 | 60% grey |
| `bpn-grey-40` | #9A9A9A | 40% grey |
| `bpn-grey-20` | #CCCCCC | 20% grey |
| `bpn-grey-10` | #EEEEEE | 10% grey |

#### Red Shades

| Token | Hex Value | Description |
|-------|-----------|-------------|
| `bpn-red-80` | #EF4033 | 80% red |
| `bpn-red-60` | #F37066 | 60% red |
| `bpn-red-40` | #F79F99 | 40% red |
| `bpn-red-20` | #FBCFCC | 20% red |
| `bpn-red-10` | #FDE7E5 | 10% red |

#### Tailwind Black Scale

| Token | Hex Value |
|-------|-----------|
| `bpn-black-50` | #B8B8B8 |
| `bpn-black-100` | #ADADAD |
| `bpn-black-200` | #999999 |
| `bpn-black-300` | #858585 |
| `bpn-black-400` | #707070 |
| `bpn-black-500` | #5C5C5C |
| `bpn-black-600` | #474747 |
| `bpn-black-700` | #333333 |
| `bpn-black-800` | #1F1F1F |
| `bpn-black-900` | #0A0A0A |
| `bpn-black-950` | #000000 |

#### Navy Blue

| Token | Hex Value |
|-------|-----------|
| `bpn-navy-950` | #000000 |

## Typography Tokens

The typography tokens define text styles for headings, body text, titles, and callouts. All new tokens use the `bpn-` prefix to avoid conflicts with the legacy system.

### Usage

To use a typography token in your SCSS:

```scss
.my-heading {
  @include use-text-style("bpn-h1");
}

.my-paragraph {
  @include use-text-style("bpn-body-base");
}
```

### Available Typography Tokens

#### Headings

| Token | Font Size | Line Height | Font Weight | Letter Spacing |
|-------|-----------|-------------|-------------|----------------|
| `bpn-h1` | 144px | 112px | 900 | -0.5px |
| `bpn-h1-small` | 128px | 104px | 900 | -0.5px |
| `bpn-h2` | 96px | 80px | 900 | -0.25px |
| `bpn-h2-small` | 80px | 64px | 900 | -0.25px |
| `bpn-h3` | 48px | 40px | 900 | -0.25px |
| `bpn-h4` | 40px | 40px | 900 | -0.25px |
| `bpn-h5` | 32px | 32px | 900 | -0.25px |
| `bpn-h6` | 24px | 20px | 900 | 0px |

#### Body Text

| Token | Font Size | Line Height | Font Weight | Letter Spacing |
|-------|-----------|-------------|-------------|----------------|
| `bpn-body-xlarge` | 20px | 26px | 400 | 0px |
| `bpn-body-large` | 18px | 22px | 400 | 0px |
| `bpn-body-base` | 16px | 20px | 400 | 0px |
| `bpn-body-sm` | 14px | 18px | 400 | 0px |
| `bpn-body-xs` | 12px | 14px | 400 | 0px |
| `bpn-body-xxs` | 10px | 12px | 400 | 0px |

#### Titles

| Token | Font Size | Line Height | Font Weight | Letter Spacing |
|-------|-----------|-------------|-------------|----------------|
| `bpn-title-1-large` | 16px | 20px | 700 | 0px |
| `bpn-title-1-small` | 12px | 14px | 700 | 0px |
| `bpn-title-2` | 12px | 14px | 700 | 0px |

#### Callouts

| Token | Font Size | Line Height | Font Weight | Letter Spacing | Text Transform |
|-------|-----------|-------------|-------------|----------------|---------------|
| `bpn-callout-base` | 18px | 18px | 700 | 0.5px | uppercase |
| `bpn-callout-small` | 16px | 16px | 700 | 0.5px | uppercase |
| `bpn-callout-xs` | 12px | 12px | 700 | 0.5px | uppercase |


## Helper Mixins

The typography system includes two helper mixins:

#### `use-text-style`

Applies all typography properties of a token:

```scss
@include use-text-style("bpn-h1");
```

This will apply font-size, line-height, font-weight, letter-spacing, and any other properties defined for the token.

#### `update-text-style`

Updates only the font-size, line-height, and letter-spacing:

```scss
@include update-text-style("bpn-body-large");
```

## CSS Variables

When `$canUseCssVariables` is set to `true`, the system will generate CSS variables for typography tokens. These can be used in your CSS:

```css
/* Typography Variables */
.my-element {
  font-size: var(--bpn-body-base-size);
  line-height: var(--bpn-body-base-line-height);
}
```

## Migration from Legacy System

The BPN design token system is designed to gradually replace the older token system. Both systems currently coexist during the transition period.

### Legacy to BPN Token Mapping

#### Typography

| Legacy Token | BPN Token |
|--------------|-----------|
| `heading-1` | `bpn-h1` |
| `heading-2` | `bpn-h3` |
| `heading-3` | `bpn-h4` |
| `heading-4` | `bpn-h5` |
| `heading-5` | `bpn-h6` |
| `body` | `bpn-body-base` |
| `paragraph-body-1` | `bpn-body-large` |
| `paragraph-body-2` | `bpn-body-base` |
| `paragraph-body-3` | `bpn-body-sm` |
| `paragraph-body-4` | `bpn-body-xs` |

## Best Practices

1. Always use tokens instead of hard-coded values
2. Use the appropriate token for the intended purpose (e.g., use heading tokens for headings)
3. For new components, use the BPN tokens with the `bpn-` prefix
4. When updating existing components, migrate from legacy tokens to BPN tokens
