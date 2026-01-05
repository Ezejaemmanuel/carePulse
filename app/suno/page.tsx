"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Music, Send, CheckCircle, Clock, XCircle, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface SunoTrack {
  id: string;
  audioUrl: string;
  sourceAudioUrl: string;
  streamAudioUrl: string;
  sourceStreamAudioUrl: string;
  imageUrl: string;
  sourceImageUrl: string;
  prompt: string;
  modelName: string;
  title: string;
  tags: string;
  createTime: number;
  duration: number;
}

interface SunoApiResponse {
  taskId: string;
  sunoData?: SunoTrack[];
  data?: SunoTrack[];
}

interface SunoResponse {
  success?: boolean;
  taskId?: string;
  status?: string;
  response?: SunoApiResponse;
  error?: string;
  message?: string;
}

const MODEL_OPTIONS = [
  { value: 'V4', label: 'V4 - High Quality (up to 4 min)' },
  { value: 'V4_5', label: 'V4_5 - Advanced (up to 8 min)' },
  { value: 'V4_5PLUS', label: 'V4_5PLUS - Richer Sound (up to 8 min)' },
  { value: 'V4_5ALL', label: 'V4_5ALL - Better Structure (up to 8 min)' },
  { value: 'V5', label: 'V5 - Faster Generation (up to 8 min)' },
];

export default function SunoPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [customMode, setCustomMode] = useState(false);
  const [instrumental, setInstrumental] = useState(false);
  const [model, setModel] = useState("V4_5ALL");
  const [callBackUrl, setCallBackUrl] = useState("");
  const [style, setStyle] = useState("");
  const [title, setTitle] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<SunoResponse | null>(null);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  const checkStatus = useCallback(async (taskId: string) => {
    if (isCheckingStatus) return;

    setIsCheckingStatus(true);
    try {
      const res = await fetch(`/api/suno?taskId=${taskId}`);
      const data = await res.json();

      if (res.ok) {
        setResponse(data);

        if (data.status === 'TEXT_SUCCESS') {
          toast.success("Music generation completed!");
          // Redirect to results page with taskId
          router.push(`/suno/result?taskid=${taskId}`);
        } else if (data.status === 'FAILED') {
          toast.error("Music generation failed");
        }
        // Continue polling for PENDING and GENERATING
      } else {
        toast.error(data.error || "Failed to check status");
      }
    } catch (error) {
      console.error("Error checking status:", error);
      toast.error("Failed to check status");
    } finally {
      setIsCheckingStatus(false);
    }
  }, [isCheckingStatus, router]);

  // Auto-check status when we have a taskId and it's not completed
  useEffect(() => {
    if (currentTaskId && (response?.status === 'GENERATING' || response?.status === 'PENDING')) {
      const interval = setInterval(() => {
        checkStatus(currentTaskId);
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [currentTaskId, response?.status, checkStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (customMode && (!style.trim() || !title.trim())) {
      toast.error("Style and title are required in custom mode");
      return;
    }

    setIsLoading(true);
    setResponse(null);
    setCurrentTaskId(null);

    try {
      const requestData: any = {
        prompt: prompt.trim(),
        customMode,
        instrumental,
        model,
      };

      if (callBackUrl.trim()) {
        requestData.callBackUrl = callBackUrl.trim();
      }

      if (customMode) {
        requestData.style = style.trim();
        requestData.title = title.trim();
      }

      const res = await fetch("/api/suno", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await res.json();

      if (res.ok) {
        setResponse(data);
        setCurrentTaskId(data.taskId);
        toast.success("Music generation started!");
      } else {
        setResponse(data);
        toast.error(data.error || "Failed to generate music");
      }
    } catch (error) {
      console.error("Error:", error);
      setResponse({ error: "Failed to connect to the API" });
      toast.error("Failed to connect to the API");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'TEXT_SUCCESS':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'GENERATING':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'PENDING':
        return <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'TEXT_SUCCESS':
        return 'border-green-500/20 bg-green-50/50 dark:bg-green-950/20';
      case 'GENERATING':
        return 'border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/20';
      case 'PENDING':
        return 'border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-950/20';
      case 'FAILED':
        return 'border-red-500/20 bg-red-50/50 dark:bg-red-950/20';
      default:
        return 'border-primary/20 shadow-lg';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Music className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Suno AI Music Generator
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Generate high-quality AI music with advanced customization options
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Generate Music
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Options */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="prompt" className="text-sm font-medium">
                    Music Prompt *
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder="Describe the music you want to generate... e.g., 'An upbeat pop song about summer adventures'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[120px] resize-none"
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model" className="text-sm font-medium">
                      Model *
                    </Label>
                    <Select value={model} onValueChange={setModel} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {MODEL_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="callback" className="text-sm font-medium">
                      Callback URL (Optional)
                    </Label>
                    <Input
                      id="callback"
                      type="url"
                      placeholder="https://your-server.com/callback"
                      value={callBackUrl}
                      onChange={(e) => setCallBackUrl(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="instrumental"
                      checked={instrumental}
                      onCheckedChange={(checked) => setInstrumental(checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="instrumental" className="text-sm font-medium">
                      Instrumental Only
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="customMode"
                      checked={customMode}
                      onCheckedChange={(checked) => setCustomMode(checked as boolean)}
                      disabled={isLoading}
                    />
                    <Label htmlFor="customMode" className="text-sm font-medium">
                      Custom Mode
                    </Label>
                  </div>
                </div>
              </div>

              {/* Custom Mode Options */}
              {customMode && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border">
                  <h3 className="text-sm font-medium text-muted-foreground">Custom Mode Settings</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="style" className="text-sm font-medium">
                        Style *
                      </Label>
                      <Input
                        id="style"
                        placeholder="e.g., Jazz, Rock, Classical, Electronic"
                        value={style}
                        onChange={(e) => setStyle(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-sm font-medium">
                        Title *
                      </Label>
                      <Input
                        id="title"
                        placeholder="Song title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !prompt.trim() || (customMode && (!style.trim() || !title.trim()))}
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Music...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Generate Music
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Response Card */}
        {response && (
          <Card className={`border ${getStatusColor(response.status)} shadow-lg`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${response.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                {getStatusIcon(response.status)}
                {response.status === 'TEXT_SUCCESS' ? 'Generation Completed!' :
                 response.status === 'GENERATING' ? 'Generating Music...' :
                 response.status === 'PENDING' ? 'Waiting in Queue...' :
                 response.status === 'FAILED' ? 'Generation Failed' :
                 response.success ? 'Generation Started' : 'Error'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {response.taskId && (
                  <div>
                    <p className="font-medium">Task ID:</p>
                    <p className="text-muted-foreground font-mono text-sm">{response.taskId}</p>
                  </div>
                )}

                {response.status && (
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Status:</p>
                    <p className="text-muted-foreground">{response.status}</p>
                    {response.status === 'GENERATING' && (
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                    )}
                  </div>
                )}

                {response.message && (
                  <div>
                    <p className="font-medium">Message:</p>
                    <p className="text-muted-foreground">{response.message}</p>
                  </div>
                )}

                {/* Music Results */}
                {response.status === 'SUCCESS' && response.response?.data && (
                  <div className="space-y-4">
                    <p className="font-medium">Generated Music:</p>
                    <div className="space-y-3">
                      {response.response.data.map((track: any, index: number) => (
                        <div key={track.id || index} className="p-4 bg-muted/50 rounded-lg border">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <h4 className="font-medium">{track.title || `Track ${index + 1}`}</h4>
                              {track.tags && (
                                <p className="text-sm text-muted-foreground">Tags: {track.tags}</p>
                              )}
                              {track.duration && (
                                <p className="text-sm text-muted-foreground">
                                  Duration: {Math.round(track.duration)} seconds
                                </p>
                              )}
                            </div>
                            {track.audio_url && (
                              <div className="flex flex-col gap-2">
                                <Button
                                  asChild
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <a
                                    href={track.audio_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <Music className="h-4 w-4 mr-2" />
                                    Listen
                                  </a>
                                </Button>
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                >
                                  <a
                                    href={track.audio_url}
                                    download={`${track.title || 'suno-track'}.mp3`}
                                  >
                                    Download
                                  </a>
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Manual Status Check Button */}
                {response.taskId && (response.status === 'GENERATING' || response.status === 'PENDING') && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => checkStatus(response.taskId!)}
                      disabled={isCheckingStatus}
                      variant="outline"
                      size="sm"
                    >
                      {isCheckingStatus ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Check Status
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {response.error && (
                  <div>
                    <p className="font-medium text-red-600 dark:text-red-400">Error:</p>
                    <p className="text-red-600 dark:text-red-400">{response.error}</p>
                  </div>
                )}

                {/* Raw Response (for debugging) */}
                <details className="mt-4">
                  <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                    Raw API Response
                  </summary>
                  <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto mt-2">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </details>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}