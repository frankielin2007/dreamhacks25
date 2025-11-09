import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  BookOpen,
  Code,
  Zap,
  Shield,
  Database,
  Stethoscope,
  ArrowRight,
} from "lucide-react";

export default function DocsPage() {
  const sections = [
    {
      icon: Zap,
      title: "Quickstart",
      description: "Get up and running in under 5 minutes",
      href: "#quickstart",
      gradient: "from-brand-500 to-cyan-500",
    },
    {
      icon: Code,
      title: "API Reference",
      description: "Complete API documentation and SDKs",
      href: "#api",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Stethoscope,
      title: "Clinical Models",
      description: "Understanding our ML prediction models",
      href: "#models",
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "HIPAA, SOC 2, and data protection",
      href: "#security",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Database,
      title: "Data Integration",
      description: "FHIR, HL7, and EHR connections",
      href: "#integration",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: BookOpen,
      title: "Guides & Tutorials",
      description: "Step-by-step implementation guides",
      href: "#guides",
      gradient: "from-indigo-500 to-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-brand-50/30 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-5xl sm:text-6xl font-bold text-gradient mb-6">
            Documentation
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
            Everything you need to integrate FluxCare into your practice
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="#quickstart">
              <Button
                size="lg"
                className="bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white shadow-lg"
              >
                Get Started
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" variant="outline">
                Try the Platform
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-24">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.title} href={section.href}>
                <Card className="p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer glass bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${section.gradient} flex items-center justify-center mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                    {section.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {section.description}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Quickstart Section */}
      <div id="quickstart" className="container mx-auto px-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">Quickstart Guide</h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Get started with FluxCare in three simple steps
            </p>
          </div>

          <div className="space-y-8">
            {/* Step 1 */}
            <Card className="p-8 glass bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-brand-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3 text-slate-900 dark:text-white">
                    Sign Up & Get API Keys
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Create your account and obtain your API credentials from the dashboard.
                  </p>
                  <div className="bg-gray-900 dark:bg-slate-950 text-gray-100 dark:text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-slate-800">
                    <code>
                      {`# Install the FluxCare SDK
npm install @fluxcare/sdk

# Or with Python
pip install fluxcare`}
                    </code>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 2 */}
            <Card className="p-8 glass bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-brand-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3 text-slate-900 dark:text-white">
                    Initialize the Client
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Set up the SDK with your API key and start making requests.
                  </p>
                  <div className="bg-gray-900 dark:bg-slate-950 text-gray-100 dark:text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-slate-800">
                    <code>
                      {`import { FluxCare } from '@fluxcare/sdk';

const client = new FluxCare({
  apiKey: process.env.FLUXCARE_API_KEY,
});

// Ready to make predictions!`}
                    </code>
                  </div>
                </div>
              </div>
            </Card>

            {/* Step 3 */}
            <Card className="p-8 glass bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-brand-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold mb-3 text-slate-900 dark:text-white">
                    Make Your First Prediction
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Send patient data to get ML-powered risk assessments.
                  </p>
                  <div className="bg-gray-900 dark:bg-slate-950 text-gray-100 dark:text-slate-100 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-slate-800">
                    <code>
                      {`const result = await client.predict.diabetes({
  age: 45,
  sex: 'male',
  bmi: 28.5,
  sbp: 135,
  hdl: 45,
  tg: 180,
  fastingGlucose: 105,
  onBpTherapy: false,
  parentalHistory: true,
});

console.log(\`Risk: \${(result.probability * 100).toFixed(1)}%\`);
// Output: Risk: 23.4%`}
                    </code>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Next Steps */}
          <div className="mt-12 p-8 glass rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">Next Steps</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <Link href="#api" className="font-medium hover:text-brand-500 text-slate-900 dark:text-white">
                    Explore the full API reference
                  </Link>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Learn about all available endpoints and parameters
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <Link href="#models" className="font-medium hover:text-brand-500 text-slate-900 dark:text-white">
                    Understand the clinical models
                  </Link>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Deep dive into the Framingham and other ML models
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <ArrowRight className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <Link href="#integration" className="font-medium hover:text-brand-500 text-slate-900 dark:text-white">
                    Set up FHIR integration
                  </Link>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Connect FluxCare to your existing EHR system
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* API Reference Placeholder */}
      <div id="api" className="container mx-auto px-4 pb-24">
        <div className="max-w-4xl mx-auto glass p-12 rounded-2xl text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <Code className="w-16 h-16 mx-auto mb-6 text-brand-500" />
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">API Reference</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Complete API documentation with interactive examples coming soon. In the meantime, check out our SDK documentation.
          </p>
          <Link href="/sign-up">
            <Button
              size="lg"
              className="bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white"
            >
              Get API Access
            </Button>
          </Link>
        </div>
      </div>

      {/* Models Placeholder */}
      <div id="models" className="container mx-auto px-4 pb-24">
        <div className="max-w-4xl mx-auto glass p-12 rounded-2xl text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <Stethoscope className="w-16 h-16 mx-auto mb-6 text-cyan-500" />
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Clinical Models</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Learn about our validated clinical models including Framingham Diabetes Risk Score and Framingham CVD Risk Assessment.
          </p>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              View Model Documentation
            </Button>
          </Link>
        </div>
      </div>

      {/* Security Placeholder */}
      <div id="security" className="container mx-auto px-4 pb-24">
        <div className="max-w-4xl mx-auto glass p-12 rounded-2xl text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <Shield className="w-16 h-16 mx-auto mb-6 text-green-500" />
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Security & Compliance</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            FluxCare is HIPAA compliant and SOC 2 Type II certified. Learn more about our security practices and data protection measures.
          </p>
          <Link href="/security">
            <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              Security Documentation
            </Button>
          </Link>
        </div>
      </div>

      {/* Integration Placeholder */}
      <div id="integration" className="container mx-auto px-4 pb-24">
        <div className="max-w-4xl mx-auto glass p-12 rounded-2xl text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <Database className="w-16 h-16 mx-auto mb-6 text-orange-500" />
          <h2 className="text-3xl font-bold mb-4 text-slate-900 dark:text-white">Data Integration</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
            Connect FluxCare to your existing systems with FHIR, HL7, and direct EHR integrations.
          </p>
          <Link href="/integrations">
            <Button size="lg" variant="outline" className="border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
              Integration Guides
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
