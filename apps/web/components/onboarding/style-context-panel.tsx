"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, ArrowLeft, ChevronRight, Wand2 } from "lucide-react";
import { useDesignMode } from "@/contexts/design-mode-context";
import { cn } from "@/lib/utils";

type StyleContextPanelProps = {
  show: boolean;
  onClose: () => void;
  elementType?: "heading" | "text" | "button" | "image" | "container";
};

export function StyleContextPanel({
  show,
  onClose,
  elementType = "heading",
}: StyleContextPanelProps) {
  const { activeTool } = useDesignMode();
  const [currentTab, setCurrentTab] = useState("style");
  const [fontSize, setFontSize] = useState(24);
  const [fontWeight, setFontWeight] = useState(600);
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [backgroundColor, setBackgroundColor] = useState("");
  const [textAlign, setTextAlign] = useState("left");
  const [padding, setPadding] = useState(16);
  const [isResponsive, setIsResponsive] = useState(true);

  // For AI tab
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "Make this text more engaging",
    "Add a gradient background",
    "Improve the contrast",
    "Make it look modern",
  ]);

  // When the style tool is active, show the style tab
  useEffect(() => {
    if (activeTool === "style") {
      setCurrentTab("style");
    } else if (activeTool === "ai") {
      setCurrentTab("ai");
    }
  }, [activeTool]);

  if (!show) {
    return null;
  }

  // Labels for different element types
  const elementLabels = {
    heading: "Heading",
    text: "Text Block",
    button: "Button",
    image: "Image",
    container: "Container",
  };

  // Simulate AI generation
  const handleGenerateAI = () => {
    setIsGenerating(true);
    // Simulate API call delay
    setTimeout(() => {
      setIsGenerating(false);
      // Show success message or apply changes
    }, 1500);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 300, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed right-0 top-0 bottom-0 w-80 bg-background border-l border-border shadow-lg z-30 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Button>
            <h3 className="font-medium">Edit {elementLabels[elementType]}</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="w-full">
              <TabsTrigger value="style" className="flex-1">
                Style
              </TabsTrigger>
              <TabsTrigger value="layout" className="flex-1">
                Layout
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex-1">
                AI
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {currentTab === "style" && (
            <div className="space-y-6">
              {/* Text Properties (for text elements) */}
              {(elementType === "heading" ||
                elementType === "text" ||
                elementType === "button") && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Text</h4>

                  <div className="space-y-2">
                    <Label htmlFor="font-size" className="text-xs">
                      Font Size
                    </Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        id="font-size"
                        min={8}
                        max={72}
                        step={1}
                        value={[fontSize]}
                        onValueChange={(val) => setFontSize(val[0])}
                        className="flex-1"
                      />
                      <div className="w-12 text-center text-sm">
                        {fontSize}px
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="font-weight" className="text-xs">
                      Font Weight
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {[400, 500, 600, 700].map((weight) => (
                        <Button
                          key={weight}
                          type="button"
                          variant={
                            fontWeight === weight ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setFontWeight(weight)}
                          className="text-xs"
                        >
                          {weight === 400
                            ? "Regular"
                            : weight === 500
                              ? "Medium"
                              : weight === 600
                                ? "SemiBold"
                                : "Bold"}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text-align" className="text-xs">
                      Text Align
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                      {["left", "center", "right", "justify"].map((align) => (
                        <Button
                          key={align}
                          type="button"
                          variant={textAlign === align ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTextAlign(align)}
                          className="text-xs capitalize"
                        >
                          {align}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="text-color" className="text-xs">
                      Text Color
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        {["#FFFFFF", "#94A3B8", "#3B82F6", "#10B981"].map(
                          (color) => (
                            <Button
                              key={color}
                              type="button"
                              onClick={() => setTextColor(color)}
                              className="h-6 w-full rounded-md p-0 overflow-hidden"
                            >
                              <div
                                className={cn(
                                  "h-full w-full",
                                  textColor === color &&
                                    "ring-2 ring-primary ring-offset-1"
                                )}
                                style={{ backgroundColor: color }}
                              />
                            </Button>
                          )
                        )}
                      </div>
                      <Input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-10 h-6 p-0 border"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Background Properties (for all elements except text) */}
              {elementType !== "text" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Background</h4>

                  <div className="space-y-2">
                    <Label htmlFor="bg-color" className="text-xs">
                      Background Color
                    </Label>
                    <div className="flex gap-2">
                      <div className="flex-1 grid grid-cols-4 gap-2">
                        {["", "#1E293B", "#3B82F6", "#10B981"].map((color) => (
                          <Button
                            key={color}
                            type="button"
                            onClick={() => setBackgroundColor(color)}
                            className="h-6 w-full rounded-md p-0 overflow-hidden"
                          >
                            <div
                              className={cn(
                                "h-full w-full border border-border",
                                color === "" && "bg-transparent",
                                backgroundColor === color &&
                                  "ring-2 ring-primary ring-offset-1"
                              )}
                              style={{ backgroundColor: color }}
                            />
                            {color === "" && (
                              <span className="absolute inset-0 flex items-center justify-center text-xs">
                                None
                              </span>
                            )}
                          </Button>
                        ))}
                      </div>
                      <Input
                        type="color"
                        value={backgroundColor || "#ffffff"}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-10 h-6 p-0 border"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Spacing Properties (for all elements) */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Spacing</h4>

                <div className="space-y-2">
                  <Label htmlFor="padding" className="text-xs">
                    Padding
                  </Label>
                  <div className="flex items-center gap-2">
                    <Slider
                      id="padding"
                      min={0}
                      max={64}
                      step={4}
                      value={[padding]}
                      onValueChange={(val) => setPadding(val[0])}
                      className="flex-1"
                    />
                    <div className="w-12 text-center text-sm">{padding}px</div>
                  </div>
                </div>
              </div>

              {/* Responsive Settings */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Responsive</h4>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="responsive"
                      checked={isResponsive}
                      onCheckedChange={setIsResponsive}
                    />
                    <Label htmlFor="responsive" className="text-xs">
                      Enable
                    </Label>
                  </div>
                </div>
                {isResponsive && (
                  <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
                    This element will adapt to different screen sizes
                  </Badge>
                )}
              </div>
            </div>
          )}

          {currentTab === "layout" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Position</h4>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    Align Left
                  </Button>
                  <Button variant="outline" size="sm">
                    Align Right
                  </Button>
                  <Button variant="outline" size="sm">
                    Align Top
                  </Button>
                  <Button variant="outline" size="sm">
                    Align Bottom
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Size</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width" className="text-xs">
                      Width
                    </Label>
                    <Input id="width" placeholder="Auto" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-xs">
                      Height
                    </Label>
                    <Input id="height" placeholder="Auto" className="mt-1" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Margins</h4>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <Label htmlFor="margin-top" className="text-xs">
                      Top
                    </Label>
                    <Input id="margin-top" placeholder="0" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="margin-right" className="text-xs">
                      Right
                    </Label>
                    <Input id="margin-right" placeholder="0" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="margin-bottom" className="text-xs">
                      Bottom
                    </Label>
                    <Input
                      id="margin-bottom"
                      placeholder="0"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="margin-left" className="text-xs">
                      Left
                    </Label>
                    <Input id="margin-left" placeholder="0" className="mt-1" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentTab === "ai" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">AI Assistant</h4>
                <p className="text-xs text-muted-foreground">
                  Describe what you want to change and our AI will help you
                  implement it.
                </p>

                <div className="relative">
                  <Input
                    placeholder="E.g., Make this heading more attention-grabbing"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-0 top-0 h-full aspect-square"
                    onClick={handleGenerateAI}
                    disabled={isGenerating || !aiPrompt}
                  >
                    <Wand2
                      className={cn(
                        "h-4 w-4 transition-colors",
                        isGenerating && "text-primary animate-pulse"
                      )}
                    />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium">Suggestions</h4>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => setAiPrompt(suggestion)}
                    >
                      <span className="truncate">{suggestion}</span>
                      <ChevronRight className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer with actions */}
        <div className="border-t p-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button>Apply Changes</Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
