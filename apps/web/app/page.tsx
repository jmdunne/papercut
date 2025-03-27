import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroSection } from "@/components/hero-section";
import { FeatureSection } from "@/components/feature-section";
import { PricingSection } from "@/components/pricing-section";
import { FooterSection } from "@/components/footer-section";
import { TransitionAnimation } from "@/components/design-mode/components/transition-animation";

export default function Home() {
  return (
    <TransitionAnimation>
      <main className="min-h-screen bg-gradient-to-b from-background/80 to-background">
        <HeroSection />
        <FeatureSection />

        <section className="container py-12 md:py-24">
          <div className="mx-auto max-w-md space-y-6">
            <Card className="border-none bg-white/10 backdrop-blur-lg shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold text-center">
                  Get Early Access
                </CardTitle>
                <CardDescription className="text-center">
                  Join our waitlist to be the first to try Papercut
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="your@email.com"
                      type="email"
                      className="bg-white/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Your Role</Label>
                    <Tabs defaultValue="designer" className="w-full">
                      <TabsList className="grid grid-cols-3 w-full bg-white/20">
                        <TabsTrigger value="designer">Designer</TabsTrigger>
                        <TabsTrigger value="developer">Developer</TabsTrigger>
                        <TabsTrigger value="pm">Product</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Join Waitlist</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <PricingSection />
        <FooterSection />
      </main>
    </TransitionAnimation>
  );
}
