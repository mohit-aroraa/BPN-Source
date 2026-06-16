# Guide to Fix Nested BEM Selectors

This guide will help you convert nested BEM selectors to the required flat structure.

## Common Patterns to Fix

### Pattern 1: Basic Nesting with `&__element`

**❌ Nested (Incorrect):**
```scss
.block {
  &__element {
    // styles
  }
}
```

**✅ Flat (Correct):**
```scss
.block {
  // styles for block
}

.block__element {
  // styles for element
}
```

### Pattern 2: Nesting with Modifiers

**❌ Nested (Incorrect):**
```scss
.block {
  &--modifier {
    // styles
  }
  
  &__element {
    &--modifier {
      // styles
    }
  }
}
```

**✅ Flat (Correct):**
```scss
.block {
  // styles for block
}

.block--modifier {
  // styles for block modifier
}

.block__element {
  // styles for element
}

.block__element--modifier {
  // styles for element modifier
}
```

### Pattern 3: Pseudo-classes and States

**❌ Nested (Incorrect):**
```scss
.block {
  &:hover {
    // styles
  }
  
  &__element {
    &:hover {
      // styles
    }
  }
}
```

**✅ Flat (Correct):**
```scss
.block {
  // styles for block
}

.block:hover {
  // styles for block hover
}

.block__element {
  // styles for element
}

.block__element:hover {
  // styles for element hover
}
```

## Step-by-Step Process

1. **Identify Nested Selectors**: Look for patterns with `&__` or `&--` in your SCSS files.

2. **Extract Each Selector**: For each nested selector, create a new top-level selector.

3. **Maintain Styles**: Copy the styles from the nested selector to the new flat selector.

4. **Remove Nesting**: Remove the original nested selector after creating the flat version.

5. **Test**: Verify that the styles still work as expected after the conversion.

## Example Conversion

**Before:**
```scss
.button {
  padding: 10px 15px;
  border-radius: 4px;
  
  &__icon {
    margin-right: 5px;
    display: inline-block;
  }
  
  &--primary {
    background-color: blue;
    color: white;
    
    &:hover {
      background-color: darkblue;
    }
  }
}
```

**After:**
```scss
.button {
  padding: 10px 15px;
  border-radius: 4px;
}

.button__icon {
  margin-right: 5px;
  display: inline-block;
}

.button--primary {
  background-color: blue;
  color: white;
}

.button--primary:hover {
  background-color: darkblue;
}
```

## Files Needing Fixes

The following files have nested BEM selectors that need to be fixed:

1. `src/styles/new/components/_button.scss`
2. `src/styles/new/components/_product-card.scss`

Use the patterns above to convert these files to the flat BEM structure. 