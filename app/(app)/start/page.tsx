import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import PageContainer from "@/components/app/PageContainer";
import ChatStartForDiagnostic from "@/components/diagnostics/ChatStartForDiagnostic";
import { createDiagnosticFromChat } from "../diagnostics/new/actions";
import { Card } from "@/components/ui/card";

export default async function StartPage() {
  const { userId } = await auth();

  // Redirect to sign-in if not authenticated
  if (!userId) {
    redirect("/sign-in?redirect_url=/start");
  }

  return (
    <PageContainer>
      <div className="max-w-4xl mx-auto space-y-6 py-8 px-4">
        {/* Header Section */}
        <div className="space-y-3">
          <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
            <span className="text-gradient">Tell us what&apos;s going on</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Describe your symptoms. We&apos;ll suggest tests or next steps.
          </p>
        </div>

        {/* Glass Card Container */}
        <Card className="backdrop-blur-xl bg-white/50 dark:bg-slate-900/50 border-border/50 shadow-xl">
          <div className="p-6">
            <ChatStartForDiagnostic onCreateDiagnostic={createDiagnosticFromChat} />
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
