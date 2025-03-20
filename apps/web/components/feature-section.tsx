"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Brush, Clock, Code, Cpu, Layers, Sparkles, Users, Wand2 } from "lucide-react"

export function FeatureSection() {
  const features = [
    {
      icon: <Brush className="h-6 w-6" />,
      title: "Real-Time Editing",
      description: "Edit any element on your website directly in the browser with instant visual feedback.",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Save Time",
      description: "No more switching between design tools, code editors, and browsers to make simple changes.",
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Version Control",
      description: "Save snapshots of your changes and roll back if needed, with full history tracking.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Collaborative",
      description: "Work together in real-time with your team, leaving comments and suggestions on specific elements.",
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI Suggestions",
      description: "Get intelligent design recommendations to improve accessibility, consistency, and visual appeal.",
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: "Export Code",
      description: "Generate clean, production-ready code for your changes that developers can easily implement.",
    },
    {
      icon: <Wand2 className="h-6 w-6" />,
      title: "Design System Integration",
      description: "Maintain consistency with your existing design system and component library.",
    },
    {
      icon: <Cpu className="h-6 w-6" />,
      title: "Browser Extension",
      description: "Install our lightweight extension to edit any website, even those behind login screens.",
    },
  ]

  return (
    <section className="py-20 bg-gradient-to-b from-background to-background/80">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Eliminate Design Friction</h2>
          <p className="text-xl text-muted-foreground">
            Papercut streamlines your design workflow with powerful features that make iterative changes effortless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-none bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all">
              <CardHeader>
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                </CardContent>
              </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

