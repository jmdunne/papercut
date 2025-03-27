"use client";

import React, { useEffect } from "react";
import { useDesignMode } from "@/components/design-mode/contexts/design-mode-context";
import { ElementPathBreadcrumb } from "./element-path-breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Box,
  ChevronDown,
  Italic,
  Palette,
  PanelLeft,
  Type,
  Underline,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Z_INDEX } from "@/lib/constants";

/**
 * InspectorPanel displays the properties of the selected element and
 * allows editing them in real-time.
 */
export function InspectorPanel() {
  const {
    isDesignMode,
    selectedElement,
    elementProperties,
    setSelectedElement,
    updateElementProperty,
  } = useDesignMode();

  useEffect(() => {
    if (selectedElement && elementProperties) {
      console.log("Inspector loaded for element:", selectedElement);
      console.log("Element properties:", elementProperties);
    }
  }, [selectedElement, elementProperties]);

  // Handle property changes
  const handlePropertyChange = (
    category: string,
    property: string,
    value: string
  ) => {
    updateElementProperty(category, property, value);
  };

  // Don't render if we're not in design mode or there's no selected element
  if (!isDesignMode || !selectedElement || !elementProperties) {
    return null;
  }

  return (
    <div
      data-testid="inspector-panel"
      className="fixed top-20 right-6 w-80 bg-background/95 backdrop-blur-lg border border-border rounded-lg shadow-xl max-h-[calc(100vh-160px)] flex flex-col overflow-hidden z-[9999] design-mode-ui"
      style={{ zIndex: Z_INDEX.INSPECTOR_PANEL }}
    >
      {/* Header with element path */}
      <div className="p-3 border-b border-border flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Inspector</span>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs py-0">
              {elementProperties.metadata.tagName}
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setSelectedElement(null)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        <ElementPathBreadcrumb />
      </div>

      {/* Properties tabs */}
      <Tabs defaultValue="style" className="flex-1 overflow-hidden">
        <TabsList className="w-full bg-transparent justify-start px-3 pt-2 pb-0 border-b border-border">
          <TabsTrigger value="style" className="flex items-center gap-1">
            <Palette className="h-3.5 w-3.5" />
            <span>Style</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-1">
            <Box className="h-3.5 w-3.5" />
            <span>Layout</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-1">
            <Type className="h-3.5 w-3.5" />
            <span>Content</span>
          </TabsTrigger>
        </TabsList>

        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 280px)" }}
        >
          {/* Style Tab */}
          <TabsContent
            value="style"
            className="px-4 py-3 space-y-5 focus-visible:outline-none"
          >
            {/* Typography Properties */}
            <div data-testid="style-properties">
              <div className="mb-4">
                <h3 className="text-xs uppercase text-muted-foreground font-medium mb-2 flex items-center">
                  <Type className="h-3.5 w-3.5 mr-1" />
                  Typography
                </h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="fontSize">Font Size</Label>
                      <Input
                        id="fontSize"
                        value={elementProperties.style.typography.fontSize}
                        className="h-8"
                        onChange={(e) =>
                          handlePropertyChange(
                            "style",
                            "typography.fontSize",
                            e.target.value
                          )
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="fontWeight">Font Weight</Label>
                      <Input
                        id="fontWeight"
                        value={elementProperties.style.typography.fontWeight}
                        className="h-8"
                        onChange={(e) =>
                          handlePropertyChange(
                            "style",
                            "typography.fontWeight",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="border rounded p-1 hover:bg-muted">
                      <Bold className="h-4 w-4" />
                    </button>
                    <button className="border rounded p-1 hover:bg-muted">
                      <Italic className="h-4 w-4" />
                    </button>
                    <button className="border rounded p-1 hover:bg-muted">
                      <Underline className="h-4 w-4" />
                    </button>
                    <div className="flex-1" />
                    <button className="border rounded p-1 hover:bg-muted">
                      <AlignLeft className="h-4 w-4" />
                    </button>
                    <button className="border rounded p-1 hover:bg-muted">
                      <AlignCenter className="h-4 w-4" />
                    </button>
                    <button className="border rounded p-1 hover:bg-muted">
                      <AlignRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Color Properties */}
              <div className="mb-4">
                <h3 className="text-xs uppercase text-muted-foreground font-medium mb-2 flex items-center">
                  <Palette className="h-3.5 w-3.5 mr-1" />
                  Colors
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="color">Text Color</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-8 h-8 rounded border"
                        style={{
                          backgroundColor: elementProperties.style.colors.color,
                        }}
                      />
                      <Input
                        id="color"
                        value={elementProperties.style.colors.color}
                        className="h-8 flex-1"
                        onChange={(e) =>
                          handlePropertyChange(
                            "style",
                            "colors.color",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-8 h-8 rounded border"
                        style={{
                          backgroundColor:
                            elementProperties.style.colors.backgroundColor,
                        }}
                      />
                      <Input
                        id="backgroundColor"
                        value={elementProperties.style.colors.backgroundColor}
                        className="h-8 flex-1"
                        onChange={(e) =>
                          handlePropertyChange(
                            "style",
                            "colors.backgroundColor",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Spacing Properties */}
              <div>
                <h3 className="text-xs uppercase text-muted-foreground font-medium mb-2 flex items-center">
                  <PanelLeft className="h-3.5 w-3.5 mr-1" />
                  Spacing
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="margin">Margin</Label>
                    <Input
                      id="margin"
                      value={elementProperties.style.spacing.margin}
                      className="h-8"
                      onChange={(e) =>
                        handlePropertyChange(
                          "style",
                          "spacing.margin",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="padding">Padding</Label>
                    <Input
                      id="padding"
                      value={elementProperties.style.spacing.padding}
                      className="h-8"
                      onChange={(e) =>
                        handlePropertyChange(
                          "style",
                          "spacing.padding",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent
            value="layout"
            className="px-4 py-3 space-y-5 focus-visible:outline-none"
          >
            <div data-testid="dimension-properties">
              {/* Dimensions */}
              <div className="mb-4">
                <h3 className="text-xs uppercase text-muted-foreground font-medium mb-2 flex items-center">
                  <Box className="h-3.5 w-3.5 mr-1" />
                  Dimensions
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      value={Math.round(elementProperties.dimensions.width)}
                      className="h-8"
                      onChange={(e) =>
                        handlePropertyChange(
                          "dimensions",
                          "width",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      value={Math.round(elementProperties.dimensions.height)}
                      className="h-8"
                      onChange={(e) =>
                        handlePropertyChange(
                          "dimensions",
                          "height",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Position */}
              <div>
                <h3 className="text-xs uppercase text-muted-foreground font-medium mb-2">
                  Position
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="x">X Position</Label>
                    <Input
                      id="x"
                      value={Math.round(elementProperties.dimensions.x)}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="y">Y Position</Label>
                    <Input
                      id="y"
                      value={Math.round(elementProperties.dimensions.y)}
                      className="h-8"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent
            value="content"
            className="px-4 py-3 space-y-5 focus-visible:outline-none"
          >
            <div data-testid="content-properties">
              {/* Element Content */}
              <div className="mb-4">
                <h3 className="text-xs uppercase text-muted-foreground font-medium mb-2">
                  Content
                </h3>
                <div className="space-y-3">
                  {elementProperties.content.text !== undefined && (
                    <div className="space-y-1.5">
                      <Label htmlFor="textContent">Text Content</Label>
                      <Input
                        id="textContent"
                        value={elementProperties.content.text || ""}
                        className="h-8"
                        onChange={(e) =>
                          handlePropertyChange(
                            "content",
                            "text",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  )}
                  {elementProperties.content.src && (
                    <div className="space-y-1.5">
                      <Label htmlFor="imageSrc">Image Source</Label>
                      <Input
                        id="imageSrc"
                        value={elementProperties.content.src}
                        className="h-8"
                        onChange={(e) =>
                          handlePropertyChange("content", "src", e.target.value)
                        }
                      />
                    </div>
                  )}
                  {elementProperties.content.href && (
                    <div className="space-y-1.5">
                      <Label htmlFor="href">Link URL</Label>
                      <Input
                        id="href"
                        value={elementProperties.content.href}
                        className="h-8"
                        onChange={(e) =>
                          handlePropertyChange(
                            "content",
                            "href",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div data-testid="metadata-properties">
                <h3 className="text-xs uppercase text-muted-foreground font-medium mb-2">
                  Metadata
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="tagName">Tag</Label>
                    <div
                      id="tagName"
                      className="bg-muted h-8 px-3 flex items-center rounded-md"
                    >
                      {elementProperties.metadata.tagName}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="className">Class</Label>
                    <Input
                      id="className"
                      value={elementProperties.metadata.className}
                      className="h-8"
                      onChange={(e) =>
                        handlePropertyChange(
                          "metadata",
                          "className",
                          e.target.value
                        )
                      }
                    />
                  </div>
                  {elementProperties.metadata.id && (
                    <div className="space-y-1.5">
                      <Label htmlFor="id">ID</Label>
                      <Input
                        id="id"
                        value={elementProperties.metadata.id}
                        className="h-8"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
