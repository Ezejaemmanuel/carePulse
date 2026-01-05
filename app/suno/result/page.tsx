"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Music,
  Download,
  Play,
  Pause,
  Volume2,
  Image as ImageIcon,
  ArrowLeft,
  Share2,
  Copy,
  ExternalLink
} from "lucide-react";
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
  taskId?: string;
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

export default function SunoResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const taskId = searchParams.get('taskid');

  const [data, setData] = useState<SunoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  const fetchResult = useCallback(async () => {
    if (!taskId) {
      setError("No task ID provided");
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Fetching results for taskId:', taskId);
      const res = await fetch(`/api/suno?taskId=${taskId}`);
      const result = await res.json();

      console.log('🔍 API Response:', res.status, result);

      // Check if we have successful response with tracks
      if (res.ok) {
        // Check for TEXT_SUCCESS, SUCCESS, or if we have sunoData directly
        if (result.status === 'TEXT_SUCCESS' || result.status === 'SUCCESS' ||
            (result.response && (result.response.sunoData || result.response.data))) {
          setData(result);
          console.log('✅ Results loaded successfully');
        } else {
          console.log('❌ No track data found in response');
          setError(`No track data available. Status: ${result.status}`);
        }
      } else {
        console.log('❌ API request failed:', result);
        setError(result.error || "Failed to load results");
      }
    } catch (err) {
      console.error("Error fetching results:", err);
      setError("Failed to fetch results");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  const playTrack = (trackId: string, audioUrl: string) => {
    if (playingTrack === trackId) {
      // Stop playing
      if (audioElement) {
        audioElement.pause();
        audioElement.currentTime = 0;
      }
      setPlayingTrack(null);
      setAudioElement(null);
    } else {
      // Stop current track if playing
      if (audioElement) {
        audioElement.pause();
      }

      // Start new track
      const audio = new Audio(audioUrl);
      audio.addEventListener('ended', () => {
        setPlayingTrack(null);
        setAudioElement(null);
      });

      audio.play().catch(err => {
        console.error('Error playing audio:', err);
        toast.error("Failed to play audio");
      });

      setPlayingTrack(trackId);
      setAudioElement(audio);
    }
  };

  const downloadTrack = (audioUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const shareTrack = (track: SunoTrack) => {
    if (navigator.share) {
      navigator.share({
        title: track.title,
        text: `Check out this AI-generated music: ${track.title}`,
        url: track.audioUrl,
      });
    } else {
      copyToClipboard(track.audioUrl);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your music...</p>
        </div>
      </div>
    );
  }

  if (error || (!data?.response?.sunoData && !data?.response?.data)) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Oops!</h1>
            <p className="text-muted-foreground text-lg">
              {error || "No music data found"}
            </p>
          </div>
          <Button onClick={() => router.push('/suno')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Generator
          </Button>
        </div>
      </div>
    );
  }

  const tracks = data.response.sunoData || data.response.data || [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              Your AI Music is Ready! 🎵
            </h1>
            <p className="text-muted-foreground text-lg">
              Generated {tracks.length} track{tracks.length > 1 ? 's' : ''} using Suno AI
            </p>
          </div>
          <Button onClick={() => router.push('/suno')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Generate More
          </Button>
        </div>

        {/* Task Info */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 text-sm">
              <div>
                <span className="font-medium">Task ID:</span>
                <code className="ml-2 bg-muted px-2 py-1 rounded text-xs">
                  {data.taskId}
                </code>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div>
                <span className="font-medium">Status:</span>
                <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                  {data.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Music Tracks */}
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
          {tracks.map((track, index) => (
            <Card key={track.id} className="overflow-hidden border-primary/10 hover:border-primary/30 transition-colors">
              <div className="aspect-video relative overflow-hidden bg-muted">
                {track.imageUrl ? (
                  <Image
                    src={track.imageUrl}
                    alt={track.title}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center bg-muted ${track.imageUrl ? 'hidden' : ''}`}>
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    size="lg"
                    onClick={() => playTrack(track.id, track.audioUrl)}
                    className="rounded-full w-16 h-16"
                  >
                    {playingTrack === track.id ? (
                      <Pause className="h-6 w-6" />
                    ) : (
                      <Play className="h-6 w-6 ml-1" />
                    )}
                  </Button>
                </div>
              </div>

              <CardHeader>
                <div className="space-y-2">
                  <CardTitle className="flex items-center gap-2">
                    <Music className="h-5 w-5 text-primary" />
                    {track.title}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">Track {index + 1}</Badge>
                    <Badge variant="outline">{track.modelName}</Badge>
                    <Badge variant="outline">
                      {Math.round(track.duration)}s
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Tags */}
                {track.tags && (
                  <div>
                    <p className="text-sm font-medium mb-2">Tags:</p>
                    <p className="text-sm text-muted-foreground">{track.tags}</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => playTrack(track.id, track.audioUrl)}
                    variant={playingTrack === track.id ? "secondary" : "default"}
                    size="sm"
                    className="flex-1"
                  >
                    {playingTrack === track.id ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Play
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={() => downloadTrack(track.audioUrl, track.title)}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>

                  <Button
                    onClick={() => shareTrack(track)}
                    variant="outline"
                    size="sm"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Audio URL */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Audio URL:</p>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-muted p-2 rounded text-xs overflow-hidden">
                      {track.audioUrl}
                    </code>
                    <Button
                      onClick={() => copyToClipboard(track.audioUrl)}
                      variant="outline"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                    >
                      <a href={track.audioUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Lyrics/Prompt */}
                {track.prompt && (
                  <details className="group">
                    <summary className="text-sm font-medium cursor-pointer hover:text-primary flex items-center gap-2">
                      <Volume2 className="h-4 w-4" />
                      Lyrics & Prompt
                    </summary>
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                      <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
                        {track.prompt}
                      </pre>
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="text-center space-y-4 pt-8 border-t">
          <p className="text-muted-foreground">
            Love your music? Generate more with different prompts!
          </p>
          <Button onClick={() => router.push('/suno')} size="lg">
            <Music className="h-5 w-5 mr-2" />
            Create New Music
          </Button>
        </div>
      </div>
    </div>
  );
}