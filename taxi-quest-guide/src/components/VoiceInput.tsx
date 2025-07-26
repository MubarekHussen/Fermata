import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder: string;
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
}

export default function VoiceInput({
  onTranscript,
  placeholder,
  isListening,
  onStartListening,
  onStopListening,
}: VoiceInputProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSupported(!!SpeechRecognition);
  }, []);

  const startListening = () => {
    if (!isSupported) {
      setError("Voice recognition is not supported in this browser");
      return;
    }

    setError("");
    setTranscript("");

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      onStartListening();
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");

      setTranscript(transcript);
      onTranscript(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setError(`Voice recognition error: ${event.error}`);
      onStopListening();
    };

    recognition.onend = () => {
      onStopListening();
    };

    try {
      recognition.start();
    } catch (err) {
      setError("Failed to start voice recognition");
      console.error("Speech recognition start error:", err);
    }
  };

  const stopListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      // Stop any ongoing recognition
      onStopListening();
    }
  };

  if (!isSupported) {
    return (
      <div className="text-center p-4">
        <p className="text-sm text-muted-foreground">
          Voice input is not supported in this browser. Please use text input.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Voice Button */}
      <div className="flex items-center justify-center">
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="lg"
          onClick={isListening ? stopListening : startListening}
          className={`w-16 h-16 rounded-full transition-all duration-300 ${
            isListening
              ? "bg-red-500 hover:bg-red-600 animate-pulse"
              : "bg-primary hover:bg-primary/90"
          }`}
        >
          {isListening ? (
            <MicOff className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </Button>
      </div>

      {/* Status and Transcript */}
      <div className="text-center space-y-2">
        {isListening && (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-red-600">
              Listening...
            </span>
          </div>
        )}

        {transcript && (
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Volume2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                You said:
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{transcript}</p>
          </div>
        )}

        {error && (
          <Badge variant="destructive" className="text-xs">
            {error}
          </Badge>
        )}

        {!isListening && !transcript && (
          <p className="text-xs text-muted-foreground">
            Tap the microphone to speak your {placeholder.toLowerCase()}
          </p>
        )}
      </div>
    </div>
  );
}

// Add TypeScript declarations for speech recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
