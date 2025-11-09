import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for individual practitioners exploring AI diagnostics",
      features: [
        "Up to 10 diagnostics per month",
        "Basic ML predictions",
        "Email support",
        "Community access",
        "Standard API access",
      ],
      cta: "Get Started",
      href: "/sign-up",
      popular: false,
      gradient: "from-gray-500 to-gray-600",
    },
    {
      name: "Clinic",
      price: "$299",
      period: "per month",
      description: "For small to medium clinics with regular patient volume",
      features: [
        "Unlimited diagnostics",
        "Advanced ML predictions",
        "Priority email & chat support",
        "FHIR export integration",
        "Custom branding",
        "Team collaboration (up to 10 users)",
        "Analytics dashboard",
        "API rate limit: 10,000/day",
      ],
      cta: "Start Free Trial",
      href: "/sign-up",
      popular: true,
      gradient: "from-brand-500 to-cyan-500",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large healthcare organizations with complex needs",
      features: [
        "Everything in Clinic, plus:",
        "Unlimited diagnostics & users",
        "Dedicated account manager",
        "24/7 phone & priority support",
        "Custom ML model training",
        "On-premise deployment option",
        "SLA guarantees (99.9% uptime)",
        "Advanced security & compliance",
        "Unlimited API access",
      ],
      cta: "Contact Sales",
      href: "/contact",
      popular: false,
      gradient: "from-purple-500 to-pink-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-brand-50/30 to-white">
      {/* Header */}
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-gradient mb-6">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Choose the plan that fits your practice. Scale as you grow.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="container mx-auto px-4 pb-24">
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative p-8 flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 ${
                plan.popular
                  ? "ring-2 ring-brand-500 shadow-xl scale-105"
                  : "shadow-soft"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-500 to-cyan-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-5xl font-bold text-gradient bg-gradient-to-r ${plan.gradient}">
                    {plan.price}
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">/{plan.period}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {plan.description}
                </p>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link href={plan.href} className="w-full">
                <Button
                  className={`w-full ${
                    plan.popular
                      ? `bg-gradient-to-r ${plan.gradient} hover:opacity-90 text-white shadow-lg`
                      : "variant-outline"
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="container mx-auto px-4 pb-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="glass p-6 rounded-lg bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">
                Can I switch plans later?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we&apos;ll prorate any charges.
              </p>
            </div>
            <div className="glass p-6 rounded-lg bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">
                What payment methods do you accept?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                We accept all major credit cards (Visa, Mastercard, Amex) and ACH transfers for Enterprise customers.
              </p>
            </div>
            <div className="glass p-6 rounded-lg bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">
                Is there a free trial?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Yes! Clinic plan comes with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            <div className="glass p-6 rounded-lg bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold mb-2 text-slate-900 dark:text-white">
                What happens if I exceed my limits?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                For the Free plan, you&apos;ll be prompted to upgrade. Clinic and Enterprise plans have soft limits with overage charges that are clearly communicated.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 pb-24">
        <div className="max-w-4xl mx-auto glass p-12 rounded-2xl text-center bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">
            Ready to transform your practice?
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Join hundreds of healthcare providers using FluxCare to deliver faster, more accurate diagnostics.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white shadow-lg"
              >
                Start Free Trial
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Contact Sales
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
