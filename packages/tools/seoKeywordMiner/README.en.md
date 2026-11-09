# SEO Keyword Miner

Professional SEO keyword mining tool powered by the 5118 API, helping discover vast long-tail keywords and rich search metrics.

## Features

- 🔍 **Massive Keyword Mining**: Powered by 5118's billion-scale keyword database
- 📊 **Detailed Search Metrics**: Provides search volumes, competitive difficulty, CPC, and trend indicators
- 🎯 **Long-tail Discovery**: Recommends highly relevant long-tail search terms
- 📈 **SEO Strategy Optimization**: Data-driven keyword insights for marketing and organic ranking

## Inputs

- **keyword**: Seed keyword to expand
- **page_index**: Current page number (default: 1)
- **page_size**: Results per page (up to 100, default: 100)
- **sort**: Sort metric field selection (e.g. traffic index, mobile volume, competitive index)
- **sort_type**: Sort order (`asc` or `desc`, default: `desc`)
- **quick_filter**: Predefined filtering preset (e.g. all traffic keywords, mobile-focused)
- **filter_date**: Optional date filter (`yyyy-MM-dd`)
- **apikey**: 5118 platform API key

## Outputs

- **keywords**: Array of extracted keyword entries with metrics in JSON format
- **total**: Total count of matching keywords found
- **page_count**: Total number of pages
- **page_index**: Current page returned
- **page_size**: Number of keywords returned on the page
- **success**: Operation success status
