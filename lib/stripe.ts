import Stripe from 'stripe'

// Factory — never instantiated at module load time (would fail during build)
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY env var is not set')
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY)
}
