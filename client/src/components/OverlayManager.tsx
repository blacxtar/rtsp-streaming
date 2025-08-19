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
  Users,
  MapPin,
  Hand,
  PersonStanding,
  Baby,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { DialogDescription } from "@radix-ui/react-dialog";

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
      text: "Missing Helmet",
    },
    {
      id: "safety-zone",
      name: "Safety Zone Monitor",
      description: "Restricted area violation",
      icon: Shield,
      style: "warning",
      text: "Safety Zone",
    },
    {
      id: "worker-count",
      name: "Worker Counter",
      description: "Track number of workers",
      icon: Users,
      style: "safe",
      text: "Workers: 3",
    },
    {
      id: "camera-status",
      name: "Camera Status",
      description: "Live camera indicator",
      icon: Eye,
      style: "live",
      text: "LIVE",
    },
  ];

  // --- NEW: Alert Card Presets ---
  const alertCardPresets = [
    {
      id: "ppe-card",
      name: "PPE Monitoring Card",
      description: "Monitor personal protective equipment.",
      data: {
        title: "Site ppe 1",
        stats: [
          { label: "Workers", value: "2", icon: PersonStanding },
          { label: "Gloves", value: "0/2", icon: Hand, alert: true },
        ],
        activeAlert: "Missing Gloves",
        time: "05:25 pm",
      },
    },
    {
      id: "classroom-card",
      name: "Classroom Monitoring Card",
      description: "Track classroom occupancy and alerts.",
      data: {
        title: "Classroom C8",
        stats: [
          {
            label: "Teachers",
            value: "0/2",
            icon: PersonStanding,
            alert: true,
          },
          { label: "Children", value: "24/24", icon: Baby },
        ],
        activeAlert: "Suspicious Behavior",
        time: "01:25 am",
      },
    },
  ];

  const overlayCategories = [
    {
      id: "text",
      name: "Text Overlay",
      description: "Add custom text labels",
      icon: Type,
    },
    {
      id: "alert",
      name: "Alert Cards",
      description: "Pre-designed alert templates",
      icon: AlertTriangle,
    },
    {
      id: "image",
      name: "Image Overlay",
      description: "Custom images and logos",
      icon: Image,
    },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setOverlayImage(url);
    }
  };

  const handleAddOverlay = () => {
    if (!selectedType || !streamId) return;
    const uniqueId = uuidv4();

    const baseOverlay = {
      id: uniqueId,
      streamId,
      x: 20,
      y: 20,
      zIndex: 1000,
    };

    if (selectedType === "text") {
      onAddOverlay({
        ...baseOverlay,
        type: "text",
        text: overlayText || "Sample Text",
        style: overlayStyle,
        width: 120,
        height: 40,
      });
    } else if (selectedType === "image" && overlayImage) {
      onAddOverlay({
        ...baseOverlay,
        type: "image",
        imageUrl: overlayImage,
        width: 80,
        height: 80,
      });
    }
    // --- NEW: Handle Alert Card Selection ---
    else if (selectedType.startsWith("alert-card-")) {
      const preset = alertCardPresets.find(
        (o) => o.id === selectedType.replace("alert-card-", "")
      );
      if (preset) {
        onAddOverlay({
          ...baseOverlay,
          type: "alert-card",
          data: preset.data,
          width: 280, // A default width for the card
          height: 160, // A default height for the card
        });
      }
    } else if (selectedType.startsWith("builtin-")) {
      const preset = builtInOverlays.find(
        (o) => o.id === selectedType.replace("builtin-", "")
      );
      if (preset) {
        onAddOverlay({
          ...baseOverlay,
          type: "text",
          text: preset.text,
          style: preset.style,
          width: 120,
          height: 40,
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
            <DialogHeader className="bg-muted/50 -mx-6 -mt-6 px-6 py-4 mb-4 rounded-t-lg border-b">
              <DialogTitle className="text-xl">
                Create a New Overlay
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Select a type to begin customizing or choose a pre-built
                template.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Category Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Choose Overlay Type
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {overlayCategories.map((category) => (
                    <Card
                      key={category.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedType === category.id
                          ? "ring-2 ring-primary bg-accent"
                          : ""
                      }`}
                      onClick={() => setSelectedType(category.id)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center space-x-2">
                          <category.icon className="w-5 h-5" />
                          <CardTitle className="text-sm">
                            {category.name}
                          </CardTitle>
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
                <Label className="text-base font-medium mb-3 block">
                  Or Choose Quick Add Overlays
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {builtInOverlays.map((overlay) => (
                    <Card
                      key={overlay.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedType === `builtin-${overlay.id}`
                          ? "ring-2 ring-primary bg-accent"
                          : ""
                      }`}
                      onClick={() => setSelectedType(`builtin-${overlay.id}`)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded ${
                              overlay.style === "alert"
                                ? "bg-red-100 text-red-600"
                                : overlay.style === "warning"
                                ? "bg-yellow-100 text-yellow-600"
                                : overlay.style === "safe"
                                ? "bg-green-100 text-green-600"
                                : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            <overlay.icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {overlay.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {overlay.description}
                            </div>
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
                    <Select
                      value={overlayStyle}
                      onValueChange={setOverlayStyle}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alert">Alert (Red)</SelectItem>
                        <SelectItem value="warning">
                          Warning (Yellow)
                        </SelectItem>
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
              {/* --- NEW: Alert Card Configuration --- */}
              {selectedType === "alert" && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <Label className="text-base font-medium mb-3 block">
                    Choose an Alert Card Template
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {alertCardPresets.map((preset) => (
                      <div
                        key={preset.id}
                        className={`cursor-pointer rounded-lg p-4 border transition-all ${
                          selectedType === `alert-card-${preset.id}`
                            ? "ring-2 ring-primary"
                            : "border-border"
                        }`}
                        onClick={() =>
                          setSelectedType(`alert-card-${preset.id}`)
                        }
                      >
                        {/* This is a mini-preview of the card */}
                        <div className="bg-white/80 backdrop-blur-sm p-3 rounded-md text-gray-800 shadow-sm text-sm">
                          <div className="flex items-center space-x-2 mb-2">
                            <MapPin className="w-4 h-4 text-gray-600" />
                            <h4 className="font-bold">{preset.data.title}</h4>
                          </div>
                          <div className="flex justify-between border-y border-gray-200 py-1">
                            {preset.data.stats.map((stat) => (
                              <div key={stat.label}>
                                <div className="text-xs text-gray-500">
                                  {stat.label}
                                </div>
                                <div
                                  className={`flex items-center font-semibold ${
                                    stat.alert ? "text-red-500" : ""
                                  }`}
                                >
                                  <stat.icon className="w-4 h-4 mr-1" />
                                  {stat.value}
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <div className="text-xs font-bold text-yellow-900 bg-yellow-400 px-2 py-0.5 rounded">
                              {preset.data.activeAlert}
                            </div>
                            <div className="text-xs font-semibold text-red-500">
                              {preset.data.time}
                            </div>
                          </div>
                        </div>
                        <div className="text-center mt-2 text-xs text-muted-foreground">
                          {preset.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddOverlay}
                  disabled={
                    !selectedType ||
                    (selectedType === "image" && !overlayImage) ||
                    (selectedType === "alert" &&
                      !selectedType.startsWith("alert-card-"))
                  }
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
