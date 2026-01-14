import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { auth, googleProvider } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/Logo";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Clock,
  Users,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const db = getFirestore();

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent. Check your inbox.");
    } catch (error: any) {
      console.error("Password reset error:", error);
      let errorMessage = "Failed to send password reset email.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const allowedDomains = ["elevatemyskill.com", "cmv-global.com"];
    const domain = email.split("@")[1];

    if (!domain || !allowedDomains.includes(domain)) {
      toast.error("Access restricted. Only elevatemyskill.com and cmv-global.com domains are allowed.");
      setIsLoading(false);
      return;
    }

    // Maintenance Mode Check
    const adminEmails = ["help@cmv-global.com", "design@cmv-global.com", "design@elevatemyskill.com"];
    if (!adminEmails.includes(email)) {
      const settingsSnap = await getDoc(doc(db, "settings", "general"));
      if (settingsSnap.exists()) {
        const settings = settingsSnap.data();
        if (settings.maintenanceMode) {
          toast.error("The system is currently under maintenance. Please try again later.");
          setIsLoading(false);
          return;
        }
        const today = new Date().getDay();
        if ((today === 0 || today === 6) && !settings.allowWeekendAccess) {
          toast.error("Weekend access is currently disabled.");
          setIsLoading(false);
          return;
        }
      }
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      let role = "employee";

      if (userDocSnap.exists()) {
        role = userDocSnap.data().role || "employee";
        await setDoc(userDocRef, {
          lastLogin: serverTimestamp(),
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0],
          photoURL: user.photoURL,
        }, { merge: true });
      } else {
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0],
          photoURL: user.photoURL,
          lastLogin: serverTimestamp(),
          role: "employee"
        });
      }

      toast.success(`Welcome back, ${user.displayName || user.email}!`);
      
      if ((user.email && adminEmails.includes(user.email)) || role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Failed to sign in. Please check your credentials.";
      
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email.";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const allowedDomains = ["elevatemyskill.com", "cmv-global.com"];
      const domain = user.email?.split("@")[1];

      if (!domain || !allowedDomains.includes(domain)) {
        await signOut(auth);
        toast.error("Access restricted. Only elevatemyskill.com and cmv-global.com domains are allowed.");
        setIsLoading(false);
        return;
      }

      // Maintenance Mode Check
      const adminEmails = ["help@cmv-global.com", "design@cmv-global.com", "design@elevatemyskill.com"];
      if (user.email && !adminEmails.includes(user.email)) {
        const settingsSnap = await getDoc(doc(db, "settings", "general"));
        if (settingsSnap.exists()) {
          const settings = settingsSnap.data();
          if (settings.maintenanceMode) {
            await signOut(auth);
            toast.error("The system is currently under maintenance. Please try again later.");
            setIsLoading(false);
            return;
          }
          const today = new Date().getDay();
          if ((today === 0 || today === 6) && !settings.allowWeekendAccess) {
            await signOut(auth);
            toast.error("Weekend access is currently disabled.");
            setIsLoading(false);
            return;
          }
        }
      }

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);
      let role = "employee";

      if (userDocSnap.exists()) {
        role = userDocSnap.data().role || "employee";
        await setDoc(userDocRef, {
          lastLogin: serverTimestamp(),
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0],
          photoURL: user.photoURL,
        }, { merge: true });
      } else {
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0],
          photoURL: user.photoURL,
          lastLogin: serverTimestamp(),
          role: "employee"
        });
      }

      toast.success(`Welcome, ${user.displayName}!`);
      
      if ((user.email && adminEmails.includes(user.email)) || role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Google login error:", error);
      
      if (error.code === "auth/popup-closed-by-user") {
        toast.error("Sign-in was cancelled.");
      } else if (error.code === "auth/popup-blocked") {
        toast.error("Pop-up was blocked. Please allow pop-ups for this site.");
      } else {
        toast.error("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Clock,
      title: "Smart Attendance",
      desc: "Login-based tracking, no biometrics needed",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      desc: "Enterprise-grade security for your data",
    },
    {
      icon: Users,
      title: "Team Management",
      desc: "Complete HR tools in one place",
    },
    {
      icon: BarChart3,
      title: "Insights & Reports",
      desc: "Real-time analytics and reporting",
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Hero Section */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 gradient-hero relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cloudhr-blue/10 rounded-full blur-3xl" />
        </div>

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          <Logo variant="light" size="lg" />

          <div className="space-y-8 max-w-xl">
            <div className="space-y-4">
              <h1 className="font-display text-4xl xl:text-5xl font-bold leading-tight">
                CMV Cloud HR
              </h1>
              <p className="text-lg text-primary-foreground/80">
                A secure, cloud-based platform designed to manage attendance,
                salary, leave, performance and employee records — all from one
                single login.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 group"
                >
                  <feature.icon className="w-8 h-8 mb-3 text-accent group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-primary-foreground/70">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-primary-foreground/60">
            Trusted by 500+ companies worldwide
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in-up">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center">
            <Logo size="lg" />
          </div>

          <div className="text-center space-y-2">
            <h2 className="font-display text-3xl font-bold text-foreground">
              Welcome back
            </h2>
            <p className="text-muted-foreground">
              Sign in to access your HR portal
            </p>
          </div>

          {/* Google Sign In */}
          <Button
            variant="outline"
            size="xl"
            className="w-full gap-3"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-4 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Work Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button 
                  type="button"
                  variant="link" 
                  className="px-0 h-auto text-sm"
                  onClick={handleForgotPassword}
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="xl"
              className="w-full gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button variant="link" className="px-0 h-auto">
              Contact your HR admin
            </Button>
          </p>

          <div className="pt-6 border-t text-center">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our Terms of Service and Privacy
              Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
