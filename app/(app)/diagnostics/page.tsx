import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import PageContainer from "@/components/app/PageContainer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { Plus, FileText, ArrowRight } from "lucide-react";

interface Diagnostic {
  id: string;
  user_id: string;
  symptom: string;
  ai_summary: string;
  hospital: string;
  scheduled_date: string;
  status: string;
  created_at: string;
  updated_at: string;
}

async function getDiagnostics(userId: string): Promise<Diagnostic[]> {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("diagnostics")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching diagnostics:", error);
    return [];
  }

  return data || [];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getStatusBadge(status: string) {
  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
    completed: "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800",
    in_progress: "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    cancelled: "bg-gray-100 dark:bg-gray-950 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-800",
  };

  const colorClass = statusColors[status] || statusColors.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClass}`}
    >
      {status.replace("_", " ").charAt(0).toUpperCase() + status.replace("_", " ").slice(1)}
    </span>
  );
}

export default async function DiagnosticsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const diagnostics = await getDiagnostics(userId);

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
              Diagnostics
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              View and manage your diagnostic assessments
            </p>
          </div>
          <Button asChild className="bg-brand-600 hover:bg-brand-700 text-white">
            <Link href="/diagnostics/new">
              <Plus className="h-4 w-4 mr-2" />
              New Diagnostic
            </Link>
          </Button>
        </div>

        {/* Content */}
        {diagnostics.length === 0 ? (
          // Empty State
          <Card className="p-12 text-center bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-950 mb-4">
              <FileText className="h-8 w-8 text-brand-600 dark:text-brand-400" />
            </div>
            <h2 className="text-2xl font-display font-semibold mb-2 text-slate-900 dark:text-white">
              No Diagnostics Yet
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Start by creating your first diagnostic assessment. Record patient symptoms and
              run ML-powered risk assessments.
            </p>
            <Button asChild className="bg-gradient-to-r from-brand-500 to-cyan-500 hover:from-brand-600 hover:to-cyan-600 text-white shadow-lg">
              <Link href="/diagnostics/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Diagnostic
              </Link>
            </Button>
          </Card>
        ) : (
          // Diagnostics Table
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800">
                  <TableHead className="text-slate-900 dark:text-white font-semibold">
                    Title
                  </TableHead>
                  <TableHead className="text-slate-900 dark:text-white font-semibold">
                    Created
                  </TableHead>
                  <TableHead className="text-slate-900 dark:text-white font-semibold">
                    Status
                  </TableHead>
                  <TableHead className="text-slate-900 dark:text-white font-semibold text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diagnostics.map((diagnostic) => (
                  <TableRow
                    key={diagnostic.id}
                    className="border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <TableCell>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">
                          {diagnostic.symptom || "Untitled Diagnostic"}
                        </div>
                        {diagnostic.ai_summary && (
                          <div className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1 mt-1">
                            {diagnostic.ai_summary}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-700 dark:text-slate-300">
                      {formatDate(diagnostic.created_at)}
                    </TableCell>
                    <TableCell>{getStatusBadge(diagnostic.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="text-brand-600 hover:text-brand-700 hover:bg-brand-50 dark:hover:bg-brand-950"
                      >
                        <Link href={`/diagnostics/${diagnostic.id}`}>
                          View
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
