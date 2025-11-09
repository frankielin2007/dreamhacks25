import PageContainer from "@/components/app/PageContainer";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <PageContainer>
      <Card className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-950 mb-4">
          <BarChart3 className="h-8 w-8 text-brand-600 dark:text-brand-400" />
        </div>
        <h2 className="text-2xl font-display font-semibold mb-2">
          Analytics Coming Soon
        </h2>
        <p className="text-muted-foreground">
          Track key metrics and insights about patient care and outcomes.
        </p>
      </Card>
    </PageContainer>
  );
}
