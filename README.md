# KoinX Tax Loss Harvesting Tool

A tax optimization interface for visualizing potential tax savings by harvesting capital losses.

## Screenshot

![Tax Loss Harvesting Interface](./assets/screenshot.png)

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Gautam-Bharadwaj/KoinX.git
   cd tax-loss-harvesting
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

## Project Assumptions

- **Logic**: Net Capital Gains are calculated as `Profits - Losses`.
- **Realised Capital Gains**: Calculated as the sum of `Net Short-Term Gains + Net Long-Term Gains`.
- **Tax Harvesting**: Asset selection updates the "After Harvesting" view. Positive gains are added to profits, and negative gains are added to losses.
- **Savings Insight**: The savings lightbulb message appears only if the post-harvesting realised gains are lower than pre-harvesting gains.

## Author
**Gautam Bharadwaj**
