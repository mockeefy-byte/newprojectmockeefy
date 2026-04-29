# Pricing rule: category-based only

Session and expert prices are **category-based only**. Skills do not affect the amount.

## Formula

**Price = one rule from the PricingRule table:**

- **Category** (e.g. IT, HR, Web Development) – from the expert’s profile  
- **Level** (e.g. Beginner, Intermediate, Advanced) – from the expert’s profile  
- **Duration** (30 or 60 minutes)

There is **no skill** in this formula. The same category + level + duration always gives the same price, regardless of the skill/topic (e.g. React, Java).

## Where it’s used

1. **Booking flow** – Configure Session total and session creation use category + level + duration.
2. **Expert listing / cards** – Session fee shown is from the expert’s category + level (30 min default).
3. **Admin → Pending experts** – Amount shown is from the same rule.
4. **Session create API** – Price is computed from category + level + duration only.

## How to set prices (Admin)

1. Go to **Admin → Pricing** (`/admin/pricing`).
2. Select a **Category**.
3. Set **price per Level and Duration** (e.g. Beginner 30 min = ₹2, Intermediate 30 min = ₹500).
4. Save.

Only **category base** rules are used (no skill overrides). Whatever you set there is what users and experts see for that category + level + duration.

## Why you might have seen ₹500 or “2rs” not showing

- **₹500** – Either a PricingRule for that category + level + duration is set to 500, or the backend returns 0 and the frontend/list fallback shows 499/500.
- **Test amount (e.g. 2 or 3)** – Ensure a **PricingRule** exists for that expert’s **category** and **level** and duration (e.g. IT, Beginner, 30 min = 2). If the expert’s category or level doesn’t match the rule (e.g. category “IT” vs “IT & Software”, or level Intermediate vs Beginner), the rule won’t apply and another rule or fallback will be used.

Use **Admin → Pricing** to set the exact category + level + duration you want (e.g. 2 for testing), and ensure the expert’s profile has that same category and level.
