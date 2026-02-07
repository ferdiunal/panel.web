export default {
  plugins: {
    cssnano: {
      preset: [
        'default',
        {
          // Remove all comments
          discardComments: {
            removeAll: true,
          },
          // Minify CSS
          normalizeWhitespace: true,
          // Optimize calc() expressions
          calc: true,
          // Merge duplicate rules
          mergeLonghand: true,
          mergeRules: true,
          // Remove unused CSS
          discardUnused: true,
          // Optimize font weights
          minifyFontValues: true,
          // Optimize gradients
          minifyGradients: true,
          // Optimize selectors
          minifySelectors: true,
        },
      ],
    },
  },
}
