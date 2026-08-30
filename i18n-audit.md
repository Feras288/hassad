# English UI audit

- The `?lang=en` route correctly updates the document title to English and applies LTR to the public homepage.
- Navigation, hero actions, categories, marketplace labels, footer links, and most public copy render in English after the expanded JSX extraction.
- Remaining mixed strings are primarily JSX fragments split by icons/variables and data-derived profile, numeric, and authored content. They require localized component data or explicit keys rather than whole-text replacement.
- The visible LTR layout keeps the logo, search, actions, category strip, hero, and cards readable in the expected left-to-right order.
- A follow-up English homepage check confirmed that the expanded JSX extraction translated the main calls to action, category labels, upload controls, and footer copy. Dynamic template captures were then localized recursively for item labels such as sample-image names.
- The unauthenticated administration route does not render dashboard data in the preview because it correctly reports a missing session; the admin shell was updated to derive its direction and sidebar placement from the language context.
- The English marketplace route renders with an LTR header, filter rail, sort controls, product cards, product names, categories, pricing labels, and checkout drawer copy in English. A small set of Arabic-Indic numerals remains where source values use Arabic number glyphs; this does not affect the English labels or LTR layout.
