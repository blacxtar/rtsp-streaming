import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  AlertTriangle, 
  Shield, 
  Image, 
  Type,
  HardHat,
  Eye,
  Users
} from "lucide-react";

interface OverlayManagerProps {
  streamId: string | null;
  onAddOverlay: (overlay) => void;
}

const OverlayManager = ({ streamId, onAddOverlay }: OverlayManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");
  const [overlayText, setOverlayText] = useState("");
  const [overlayStyle, setOverlayStyle] = useState("alert");
  const [overlayImage, setOverlayImage] = useState<string>("");

  // Built-in overlay presets based on safety monitoring
  const builtInOverlays = [
    {
      id: "ppe-detector",
      name: "PPE Detection Alert",
      description: "Missing safety equipment warning",
      icon: HardHat,
      style: "alert",
      text: "Missing Helmet"
    },
    {
      id: "safety-zone",
      name: "Safety Zone Monitor",
      description: "Restricted area violation",
      icon: Shield,
      style: "warning", 
      text: "Safety Zone"
    },
    {
      id: "worker-count",
      name: "Worker Counter",
      description: "Track number of workers",
      icon: Users,
      style: "safe",
      text: "Workers: 3"
    },
    {
      id: "camera-status",
      name: "Camera Status",
      description: "Live camera indicator",
      icon: Eye,
      style: "live",
      text: "LIVE"
    }
  ];

  const overlayCategories = [
    {
      id: "text",
      name: "Text Overlay",
      description: "Add custom text labels",
      icon: Type
    },
    {
      id: "alert",
      name: "Alert Cards",
      description: "Safety alerts and warnings",
      icon: AlertTriangle
    },
    {
      id: "image",
      name: "Image Overlay",
      description: "Custom images and logos",
      icon: Image
    }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setOverlayImage(url);
    }
  };

  const handleAddOverlay = () => {
    if (!selectedType || !streamId) return;

    const baseOverlay = {
      id: `overlay-${Date.now()}`,
      streamId,
      x: 50,
      y: 50,
      width: 120,
      height: 40,
      zIndex: 1000,
    };

    if (selectedType === "text") {
      onAddOverlay({
        ...baseOverlay,
        type: "text",
        text: overlayText || "Sample Text",
        style: overlayStyle
      });
    } 
    else if (selectedType === "image" && overlayImage) {
      onAddOverlay({
        ...baseOverlay,
        type: "image",
        imageUrl: overlayImage,
        width: 80,
        height: 80,
      });
    }
    else if (selectedType.startsWith("builtin-")) {
      const preset = builtInOverlays.find(o => o.id === selectedType.replace("builtin-", ""));
      if (preset) {
        onAddOverlay({
          ...baseOverlay,
          type: "text",
          text: preset.text,
          style: preset.style
        });
      }
    }

    // reset
    setIsOpen(false);
    setSelectedType("");
    setOverlayText("");
    setOverlayStyle("alert");
    setOverlayImage("");
  };

  if (!streamId) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-6 p-4 bg-muted/30 rounded-lg border border-dashed border-border">
        <p className="text-center text-muted-foreground">
          Start a stream to manage overlays
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Overlay Manager</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-button">
              <Plus className="w-4 h-4 mr-2" />
              Add Overlay
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Overlay</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Category Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block">Choose Overlay Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {overlayCategories.map((category) => (
                    <Card 
                      key={category.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedType === category.id ? 'ring-2 ring-primary bg-accent' : ''
                      }`}
                      onClick={() => {
                        setSelectedType(category.id)
                    }}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-2">
                          <category.icon className="w-5 h-5" />
                          <CardTitle className="text-sm">{category.name}</CardTitle>
                        </div>
                        <CardDescription className="text-xs">
                          {category.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Built-in Overlays */}
              <div>
                <Label className="text-base font-medium mb-3 block">Or Choose Built-in Safety Overlays</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {builtInOverlays.map((overlay) => (
                    <Card 
                      key={overlay.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedType === `builtin-${overlay.id}` ? 'ring-2 ring-primary bg-accent' : ''
                      }`}
                      onClick={() => setSelectedType(`builtin-${overlay.id}`)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded ${
                            overlay.style === 'alert' ? 'bg-red-100 text-red-600' :
                            overlay.style === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                            overlay.style === 'safe' ? 'bg-green-100 text-green-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <overlay.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">{overlay.name}</div>
                            <div className="text-xs text-muted-foreground">{overlay.description}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Text Overlay Configuration */}
              {selectedType === "text" && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <div>
                    <Label htmlFor="overlay-text">Overlay Text</Label>
                    <Input
                      id="overlay-text"
                      value={overlayText}
                      onChange={(e) => setOverlayText(e.target.value)}
                      placeholder="Enter your text..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="overlay-style">Style</Label>
                    <Select value={overlayStyle} onValueChange={setOverlayStyle}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alert">Alert (Red)</SelectItem>
                        <SelectItem value="warning">Warning (Yellow)</SelectItem>
                        <SelectItem value="safe">Safe (Green)</SelectItem>
                        <SelectItem value="live">Live (Blue)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Image Overlay Configuration */}
              {selectedType === "image" && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <Label htmlFor="overlay-image">Upload Image</Label>
                  <Input
                    id="overlay-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {overlayImage && (
                    <div className="mt-3">
                      <img
                        src={overlayImage}
                        alt="Preview"
                        className="w-20 h-20 object-contain border rounded"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddOverlay}
                  disabled={!selectedType || (selectedType === "image" && !overlayImage)}
                  className="gradient-button"
                >
                  Add Overlay
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OverlayManager;
