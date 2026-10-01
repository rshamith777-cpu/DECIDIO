# 🚀 DECIDIO — Your Life. Simulated Before You Decide.

> **Submitted to RevenueCat Shipathon 2026**  
> *Category Focus: Mobile Experience, Next Gen Award, Design & Retention*

---

## 🔮 The Core Concept

Instead of asking:
> **"What should I do?"**

Decidio asks:
> **"What happens if I do this?"**

Decidio is an AI-powered personal decision simulator that lets users see the consequences of high-stakes life, career, education, and financial choices across multiple probability-weighted futures before they commit.

---

## ⚡ The MVP+ Feature Suite Built Tonight

1. **🧠 AI Natural Language Decision Parser**
   - Natural language input with automatic extraction of:
     - Decision Title
     - Category (Education, Career, Purchases, Relocation, Finance, Fitness)
     - Capital Required (₹ / $ extraction with intelligent defaults)
     - Time Commitment (hours/week)
     - Horizon (30, 90, 365 days)
   - **Adaptive Questioning**: Automatically formulates 2–3 hyper-relevant multiple choice questions (experience level, primary goal, weekly calendar flexibility).

2. **🔮 3-Future Simulator (The Magic Screen)**
   - **Option A (Commit / Buy)**: High-growth upside, capital drain, schedule squeeze, milestones at Day 7, 30, and 90.
   - **Option B (Wait & Audit)**: Safe holding pattern, ₹0 spent, testing discipline with free resources before committing.
   - **Option C (Skip & Pivot)**: Alternative execution, redirecting energy to an open-source or DIY build.
   - Probability-weighted scenario summaries, impact meters (Skill Gain, Portfolio Leverage, Capital Preservation, Peace of Mind), and strategic pros/cons.

3. **⚖️ Trade-off & Hidden Cost Engine**
   - Uncovers the true hidden costs:
     `Price + (Weekly Hours × Total Weeks) + Opportunity Cost of Alternative Projects`
   - Explicit opportunity cost synthesis and AI strategic verdict.

4. **🧬 Decision DNA Scorecard**
   - Multi-dimensional profiling across:
     - **Risk Exposure** (0–100%)
     - **Capital Commitment** (0–100%)
     - **Time Intensity** (0–100%)
     - **Career & Skill Upside** (0–100%)
     - **Reversibility** (0–100%)
     - **Confidence Score** (%)
   - Strategic Archetype classification: *Strategic Investment*, *High-Risk Pivot*, *No-Brainer Upside*, *Low-Stakes Trial*, or *Capital Preserver*.

5. **🔄 Interactive What-If Mode (Live Recalculation Engine)**
   - Live stepper/slider controls for:
     - Capital Required (±₹500, ±₹1,000)
     - Weekly Time Available (±2h, ±4h)
     - Evaluation Horizon (30d, 60d, 90d, 180d, 365d)
   - **Instant Dynamic Recalculation**: Adjusting any parameter updates the probability metrics, skill growth, financial impact, and Decision DNA scores live in real-time.

6. **💰 RevenueCat Monetization Suite**
   - Native `react-native-purchases` SDK integration with seamless sandbox fallback for web and test devices.
   - **Offerings & Packages**:
     - `Decidio Pro Monthly`: ₹199 / month
     - `Decidio Pro Annual`: ₹1,499 / year (*Save 37% + 3-Day Free Trial*)
   - In-app Paywall Modal with feature highlights, restore purchases, legal disclaimers, and 1-tap Judge Demo Pro toggle in Settings.

7. **🔁 Retention & Decision Timeline**
   - Day 0 (Decision Point) → Day 7 (Week 1 Friction Check) → Day 30 (Month 1 Check) → Day 90 (Outcome & Retrospective).
   - Interactive milestone check-ins to train personal decision memory.

8. **🧠 Personal Decision Memory (Insights Screen)**
   - Tracks behavioral blind spots: *"Underestimated time cost in 6 of your last 10 simulated paths"*, *"Primary Bias: Strategic Career Maximizer"*.

9. **📱 Viral Shareable Decision Cards**
   - 1-tap export of anonymized decision cards formatted for WhatsApp, X (Twitter), LinkedIn, and Instagram stories.

---

## 🛠 Tech Stack

- **Framework**: React Native + Expo (SDK 57, React 19)
- **Navigation & Views**: Mobile-first dark futuristic theme with custom glassmorphism and neon accents
- **Monetization**: RevenueCat (`react-native-purchases`)
- **AI Engine**: Dual-mode:
  - Built-in intelligent heuristic engine (Zero latency, 100% resilient offline)
  - Live Gemini API integration (configurable in Profile with custom API key)
- **Local Persistence**: `@react-native-async-storage/async-storage`

---

## 🎬 Suggested 2-Minute Demo Video Script

| Timestamp | Screen | Action & Voiceover |
|---|---|---|
| **0:00 - 0:15** | Black Screen / Splash | *"Every life decision creates a future you can't see. What if you could simulate it before you commit? Meet DECIDIO."* |
| **0:15 - 0:35** | Home Screen | Open Decidio. Tap *"What are you deciding today?"* Type: *"Should I spend ₹4,999 on this machine learning course?"* |
| **0:35 - 0:55** | Create Wizard | Show AI parser extracting category (Education), cost (₹4,999), 8h/wk. Answer the 2 adaptive questions. Watch the animated simulation scanner. |
| **0:55 - 1:20** | Future Simulator | 3 Futures materialize: **Option A (Buy)**, **Option B (Wait 30 Days)**, **Option C (Skip & Build DIY)**. Swipe between them to show 30-day and 90-day checkpoints. |
| **1:20 - 1:40** | What-If & DNA | Tap **What-If Mode**: Change cost from ₹4,999 to ₹2,499 and time from 8h to 4h. The entire future recalculates instantly. Show Decision DNA 🧬 scorecard and Trade-off formula. |
| **1:40 - 2:00** | Paywall & Insights | Show the RevenueCat Pro Paywall modal (₹199/mo, ₹1,499/yr) and Insights memory screen (*"You tend to underestimate time cost"*). End with: *"DECIDIO: Don't guess your future. Explore it."* |
