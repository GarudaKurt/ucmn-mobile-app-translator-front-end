import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from "react-native";

const phrases = [
  "Mabuti",
  "Ayos lang",
  "Oo",
  "Ang pangalan ko ay si",
  "San ka nakatira?",
  "Kamusta ka?",
  "Salamat",
  "Siya ay si",
  "Kamusta ka",
];

function PhraseCard({ text, index }: { text: string; index: number }) {
  return (
    <View style={styles.phraseCard}>
      <View style={styles.phraseIndexBadge}>
        <Text style={styles.phraseIndexText}>{index + 1}</Text>
      </View>
      <Text style={styles.phraseText}>{text}</Text>
      <View style={styles.trainedDot} />
    </View>
  );
}

const PhrasesList = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E1A" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Phrases</Text>
        <Text style={styles.headerSubtitle}>
          {phrases.length} trained phrases
        </Text>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {phrases.map((text, index) => (
          <PhraseCard key={`${text}-${index}`} text={text} index={index} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default PhrasesList;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#4A5068",
    fontWeight: "600",
  },

  // Phrase list
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  phraseCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111628",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1E2440",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 12,
  },
  phraseIndexBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#1A1F35",
    alignItems: "center",
    justifyContent: "center",
  },
  phraseIndexText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6C63FF",
  },
  phraseText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#E0DDFF",
  },
  trainedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#2ECC71",
  },
});
