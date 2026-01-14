import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CompanyPolicy() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Company Policy</h1>
          <p className="text-muted-foreground">
            General company policies and guidelines.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Work from Home Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              All employees are eligible for work-from-home on a case-by-case basis, subject to manager approval.
            </p>
            <p>
              Requests must be submitted at least 24 hours in advance.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}