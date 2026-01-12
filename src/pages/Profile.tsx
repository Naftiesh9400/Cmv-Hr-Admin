import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function Profile() {
  const { user } = useAuth();
  const displayName = user?.displayName || user?.email?.split('@')[0] || "User";
  const initials = displayName.substring(0, 2).toUpperCase();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
            My Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and account settings
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your photo and personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
                  <AvatarImage src={user?.photoURL || ""} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">Change Avatar</Button>
                  <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>
              
              <Separator />

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue={displayName} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" defaultValue={user?.email || ""} disabled className="bg-muted" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="+1 (555) 000-0000" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="designation">Designation</Label>
                    <Input id="designation" defaultValue="Software Engineer" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional settings or info can go here in the second column */}
        </div>
      </div>
    </DashboardLayout>
  );
}