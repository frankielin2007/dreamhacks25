import PageContainer from "@/components/app/PageContainer";
import { Card } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <PageContainer>
      <Card className="p-12 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-950 mb-4">
          <SettingsIcon className="h-8 w-8 text-brand-600 dark:text-brand-400" />
        </div>
        <h2 className="text-2xl font-display font-semibold mb-2">
          Settings Coming Soon
        </h2>
        <p className="text-muted-foreground">
          Manage your profile, notifications, and system preferences.
        </p>
      </Card>
    </PageContainer>
  );
}
