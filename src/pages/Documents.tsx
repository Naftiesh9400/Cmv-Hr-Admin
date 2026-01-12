import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Upload, FileCheck, Shield } from "lucide-react";

const documents = [
  { id: 1, name: "Employment Contract", type: "PDF", size: "2.4 MB", date: "Jan 10, 2023", icon: FileCheck },
  { id: 2, name: "NDA Agreement", type: "PDF", size: "1.1 MB", date: "Jan 10, 2023", icon: Shield },
  { id: 3, name: "Offer Letter", type: "PDF", size: "1.8 MB", date: "Dec 15, 2022", icon: FileText },
  { id: 4, name: "Tax Declaration 2023", type: "PDF", size: "0.8 MB", date: "Apr 01, 2023", icon: FileText },
  { id: 5, name: "Employee Handbook", type: "PDF", size: "5.2 MB", date: "Jan 01, 2023", icon: FileText },
];

export default function Documents() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Documents
            </h1>
            <p className="text-muted-foreground mt-1">
              Access your personal files, contracts, and company policies
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Upload Document
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-lg">
                    <doc.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base font-semibold leading-none">
                      {doc.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {doc.type} • {doc.size}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <span>Uploaded on</span>
                  <span>{doc.date}</span>
                </div>
                <Button variant="secondary" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}