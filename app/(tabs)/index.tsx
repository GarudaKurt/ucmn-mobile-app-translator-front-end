import {
  AudioModule,
  RecordingPresets,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import * as Speech from "expo-speech";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const BARS = 28;

function WaveformVisualizer({ isRecording }: { isRecording: boolean }) {
  const anims = useRef(
    Array.from({ length: BARS }, () => new Animated.Value(0.2)),
  ).current;

  return (
    <View style={styles.waveformContainer}>
      {anims.map((anim, i) => {
        const isCenter = Math.abs(i - BARS / 2) < BARS * 0.15;
        return (
          <Animated.View
            key={i}
            style={[
              styles.waveBar,
              {
                height: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [6, 64],
                }),
                backgroundColor: isRecording
                  ? isCenter
                    ? "#6C63FF"
                    : "#9B95FF"
                  : "#2A2F4A",
                opacity: isRecording ? 1 : 0.5,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export default function HomeScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const API_URL = "http://192.168.1.3:5000/api/transcript";

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const recorderState = useAudioRecorderState(recorder);
  useEffect(() => {
    setDuration(Math.floor(recorderState.durationMillis / 1000));
  }, [recorderState.durationMillis]);
  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();

      if (!status.granted) {
        alert("Microphone permission is required.");
      }
    })();
  }, []);

  const startRecording = async () => {
    try {
      await recorder.prepareToRecordAsync();

      recorder.record();

      setIsRecording(true);

      console.log("🎤 Recording started");
    } catch (error) {
      console.error("Start recording error:", error);
    }
  };
  const uploadRecording = async (audioUri: string) => {
    try {
      const formData = new FormData();

      formData.append("audio", {
        uri: audioUri,
        name: "recording.m4a",
        type: "audio/m4a",
      } as any);

      const response = await fetch("http://192.168.1.3:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();

        console.log("SERVER ERROR:");
        console.log(errorText);

        return;
      }

      const result = await response.json();

      if (result.success) {
        setTranscript(result.transcript);

        Speech.speak(result.transcript, {
          language: "fil-PH",
          pitch: 1.0,
          rate: 0.9,
        });
      }

      console.log(result);
    } catch (error) {
      console.error(error);
    }
  };
  const stopRecording = async () => {
    try {
      await recorder.stop();

      const audioUri = recorder.uri;

      setIsRecording(false);

      if (audioUri) {
        await uploadRecording(audioUri);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const speakTranscript = () => {
    if (!transcript.trim()) return;

    Speech.speak(transcript, {
      language: "en-US",
      pitch: 1.0,
      rate: 0.9,
    });
  };

  useEffect(() => {
    if (!transcript.trim()) return;

    Speech.stop();

    Speech.speak(transcript, {
      language: "fil-PH",
      pitch: 1.0,
      rate: 0.9,
    });
  }, [transcript]);

  const stopSpeaking = () => {
    Speech.stop();
  };
  const fetchTranscript = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      if (data.success) {
        setTranscript(data.transcript);
      }
    } catch (error) {
      console.error("Failed to fetch transcript:", error);
    }
  };

  useEffect(() => {
    fetchTranscript();

    const interval = setInterval(() => {
      fetchTranscript();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const clearTranscript = async () => {
    try {
      await fetch(API_URL, {
        method: "DELETE",
      });

      setTranscript("");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.stopAnimation();

      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isRecording]);

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleMicPress = async () => {
    if (!isRecording) {
      await clearTranscript();

      setDuration(0);
      setTranscript("");

      await startRecording();
    } else {
      await stopRecording();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E1A" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Transcribe</Text>
        </View>
        <View
          style={[styles.statusBadge, isRecording && styles.statusBadgeLive]}
        >
          <View
            style={[styles.statusDot, isRecording && styles.statusDotLive]}
          />
          <Text
            style={[styles.statusText, isRecording && styles.statusTextLive]}
          >
            {isRecording ? "LIVE" : "READY"}
          </Text>
        </View>
      </View>

      {/* Waveform card */}
      <View style={styles.waveCard}>
        <WaveformVisualizer isRecording={isRecording} />
        <Text style={styles.timer}>{formatDuration(duration)}</Text>
      </View>

      {/* Mic button */}
      <View style={styles.micRow}>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            onPress={handleMicPress}
            activeOpacity={0.85}
            style={[styles.micButton, isRecording && styles.micButtonActive]}
          >
            <View
              style={[styles.micInner, isRecording && styles.micInnerActive]}
            >
              <Text style={styles.micIcon}>{isRecording ? "⏹" : "🎙"}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
        <Text style={styles.micHint}>
          {isRecording ? "Tap to stop recording" : "Tap to start recording"}
        </Text>
      </View>

      {/* Transcript */}
      <View style={styles.transcriptCard}>
        <View style={styles.transcriptHeader}>
          <Text style={styles.transcriptLabel}>TRANSCRIPT</Text>
          {transcript.length > 0 && (
            <TouchableOpacity onPress={clearTranscript}>
              <Text style={styles.clearBtn}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          style={styles.transcriptScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {transcript.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyText}>
                {isRecording
                  ? "Listening..."
                  : "Your transcription will appear here"}
              </Text>
            </View>
          ) : (
            <Text style={styles.transcriptText}>{transcript}</Text>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 16 : 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginTop: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1A1F35",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#2A2F4A",
  },
  statusBadgeLive: {
    borderColor: "#FF4757",
    backgroundColor: "#1F1020",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#4A5068",
  },
  statusDotLive: {
    backgroundColor: "#FF4757",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#4A5068",
    letterSpacing: 1.5,
  },
  statusTextLive: {
    color: "#FF4757",
  },

  // Waveform
  waveCard: {
    marginHorizontal: 20,
    backgroundColor: "#111628",
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E2440",
    marginBottom: 12,
  },
  waveformContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    height: 72,
    marginBottom: 12,
  },
  waveBar: {
    width: Math.floor((width - 40 - 32 - (BARS - 1) * 3) / BARS),
    borderRadius: 4,
    minHeight: 6,
  },
  timer: {
    fontSize: 20,
    fontWeight: "700",
    color: "#C4BFFF",
    fontVariant: ["tabular-nums"],
    letterSpacing: 2,
  },

  // Mic
  micRow: {
    alignItems: "center",
    marginVertical: 8,
    gap: 10,
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1A1F35",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#6C63FF",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  micButtonActive: {
    borderColor: "#FF4757",
    shadowColor: "#FF4757",
    backgroundColor: "#1F1020",
  },
  micInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6C63FF",
    justifyContent: "center",
    alignItems: "center",
  },
  micInnerActive: {
    backgroundColor: "#FF4757",
  },
  micIcon: {
    fontSize: 26,
  },
  micHint: {
    fontSize: 12,
    color: "#4A5068",
    letterSpacing: 0.5,
  },

  // Transcript
  transcriptCard: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 8,
    backgroundColor: "#111628",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1E2440",
    overflow: "hidden",
  },
  transcriptHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1E2440",
  },
  transcriptLabel: {
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: "700",
    color: "#4A5068",
  },
  clearBtn: {
    fontSize: 12,
    color: "#6C63FF",
    fontWeight: "600",
  },
  transcriptScroll: {
    flex: 1,
    padding: 18,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyText: {
    fontSize: 14,
    color: "#3A3F58",
    textAlign: "center",
    lineHeight: 20,
  },
  transcriptText: {
    fontSize: 16,
    color: "#E0DDFF",
    lineHeight: 26,
    letterSpacing: 0.2,
  },
});
