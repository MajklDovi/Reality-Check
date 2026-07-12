import type { SubscriptionPlan } from "@/generated/prisma/enums";

export interface PlanLimits {
  /** How many search profiles may be active at the same time. */
  maxActiveSearchProfiles: number;
  /** How many search profiles may exist in total (active + inactive). */
  maxSearchProfiles: number;
}

/**
 * Configurable plan limits — enforced in server actions, never hardcoded in UI.
 * Adjust here when pricing changes.
 */
export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  FREE: {
    maxActiveSearchProfiles: 1,
    maxSearchProfiles: 5,
  },
  BASIC: {
    maxActiveSearchProfiles: 3,
    maxSearchProfiles: 10,
  },
  PREMIUM: {
    maxActiveSearchProfiles: 10,
    maxSearchProfiles: 50,
  },
};

export const DEFAULT_PLAN: SubscriptionPlan = "FREE";
