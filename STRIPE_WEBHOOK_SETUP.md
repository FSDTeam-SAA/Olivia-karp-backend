# Stripe Webhook Configuration Guide

This guide explains how to configure Stripe Webhooks in your Stripe Dashboard for **Act on Climate**, including user subscriptions, course enrollments, partner membership payments, and **Stripe Connect** partner payouts.

---

## 1. Webhook Endpoint URL

Your backend listens for Stripe events with raw body parsing at:

```text
https://<YOUR_API_DOMAIN>/api/v1/main
```

> **Note:** If you are testing locally, use the Stripe CLI:
> ```bash
> stripe listen --forward-to localhost:5000/api/v1/main
> ```

---

## 2. Events to Enable in Stripe Dashboard

In the [Stripe Dashboard Webhooks section](https://dashboard.stripe.com/webhooks):

1. Click **+ Add destination** or **+ Add an endpoint**.
2. Set the **Endpoint URL** to:
   ```text
   https://<YOUR_API_DOMAIN>/api/v1/main
   ```
3. Under **Events to listen to**, select:

### A. Checkout & Payment Events
* `checkout.session.completed`
  * **Purpose:** 
    * Fulfills user course enrollments (`EnrollCourse`).
    * Activates general course purchases (`PurchaseRecord`).
    * Activates monthly/annual user platform subscriptions (`PurchaseSubscription`).
    * Activates Education Partner $50/year memberships (`PartnerProfile.membershipStatus = 'active'`).
    * Handles 100% partner payouts for partner-submitted courses via Stripe Connect destination charges.

### B. Stripe Connect Account Events (Important!)
* `account.updated`
  * **Purpose:**
    * Automatically updates the Education Partner's status in MongoDB (`PartnerProfile`) when they complete their Stripe Express onboarding.
    * Updates `chargesEnabled`, `payoutsEnabled`, and `detailsSubmitted` in real-time without requiring manual API calls.

---

## 3. Stripe Connect "Listen to Connected Accounts" Setting

When configuring the webhook in the Stripe Dashboard, Stripe will ask which accounts this webhook should listen to:

* **Select:** **"Listen to events on Connected accounts"** (or enable Connect events on this endpoint)
* This ensures that the `account.updated` events from your onboarded Education Partners are forwarded to your backend.

---

## 4. Environment Variables Setup

After creating the webhook in Stripe Dashboard:

1. Reveal your **Signing secret** (it starts with `whsec_...`).
2. Add or update the following in your `.env` file:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)

# Webhook Signing Secret from Dashboard
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend Redirection URLs
FRONT_END_URL=https://your-frontend-domain.com
```

3. Restart your backend server so the new signing secret is loaded.

---

## 5. Testing with the Stripe CLI (Local Development)

To test both regular checkout events and connected account updates locally:

```bash
# 1. Login to Stripe CLI
stripe login

# 2. Forward events including connect accounts
stripe listen --forward-to localhost:5000/api/v1/main --forward-connect-to localhost:5000/api/v1/main

# 3. Copy the webhook secret printed in the terminal (whsec_...) into your .env as STRIPE_WEBHOOK_SECRET
```

---

## 6. Verification Checklist

| Step | Item | Status |
| :--- | :--- | :---: |
| 1 | Endpoint URL set to `https://<domain>/api/v1/main` | [ ] |
| 2 | Added event: `checkout.session.completed` | [ ] |
| 3 | Added event: `account.updated` | [ ] |
| 4 | Enabled events on **Connected accounts** | [ ] |
| 5 | Copied `whsec_...` to `STRIPE_WEBHOOK_SECRET` in `.env` | [ ] |
| 6 | Verified `STRIPE_SECRET_KEY` in `.env` | [ ] |
