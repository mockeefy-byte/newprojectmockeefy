# Dynamic Pricing System

## Formula

```
finalPrice = basePrice30 × levelMultiplier × durationMultiplier
```

- **basePrice30**: Base price for a 30-minute session for the selected **skill** (stored on `Skill.basePrice30`).
- **levelMultiplier**: Expert level → `junior` 1, `mid` 1.5, `senior` 2.
- **durationMultiplier**: 30 min → 1, 60 min → 1.8.

## MongoDB

### Skill (existing schema + new field)

- `skillName` → use existing `name`
- `basePrice30` (Number, optional): base price for 30 min. Admin can update.

### Expert (existing)

- `adminMappings.level`: "Junior" | "Mid" | "Senior"
- `professionalDetails.level`: "Beginner" | "Intermediate" | "Advanced"  
  Both map to junior / mid / senior for the multiplier.

## APIs

### GET /api/pricing/calculate-price

Query params: `skill`, `expertId`, `duration` (30 or 60).

**Example:** `GET /api/pricing/calculate-price?skill=React&expertId=507f1f77bcf86cd799439011&duration=60`

**Response:**

```json
{
  "success": true,
  "basePrice": 300,
  "expertLevel": "mid",
  "duration": 60,
  "finalPrice": 810,
  "skillName": "React JS",
  "levelMultiplier": 1.5,
  "durationMultiplier": 1.8
}
```

### Admin: GET /api/pricing/skills

List all skills with `basePrice30` (and category).

### Admin: PUT /api/pricing/skills/:skillId

Body: `{ "basePrice30": 350 }`.  
Example: change React base price from 300 to 350.

## Booking flow

1. User selects **skill**, **expert**, **duration** (30 or 60).
2. Frontend calls `GET /api/pricing/calculate-price?skill=...&expertId=...&duration=...` and shows `finalPrice`.
3. On create booking, send `skill` in the session request body; backend uses the same formula and sets `price` on the session. If `skill` is omitted, legacy PricingRule (category + level + duration) is used.

## Seed default skill prices

From `server` directory:

```bash
node scripts/seedSkillPricing.js
```

This sets `basePrice30` for skills like React, Node, Java, Python, System Design, etc., as in the example (React 300, Node 300, Java 350, Python 350, System Design 500).
