import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, StatusBar, Linking, TouchableOpacity } from 'react-native';

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#070b12" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Car Audio Tuning Masterclass 📚</Text>
          <Text style={styles.subtitle}>
            Acoustic science, DSP calibration fundamentals, and in-cabin troubleshooting.
          </Text>
        </View>

        {/* Section 1: DSP Fundamentals */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>🎛️ DSP & Acoustic Fundamentals</Text>

          <View style={styles.topicCard}>
            <Text style={styles.topicTitle}>⏱️ Time Alignment (दूरी और देरी)</Text>
            <Text style={styles.topicText}>
              In a car, the driver sits closer to the right speaker (~95cm) than the left speaker (~138cm). Because sound travels at 34.3 cm/ms, sound from the right speaker arrives ~1.25 ms earlier, collapsing the soundstage into the right door.
            </Text>
            <Text style={styles.topicFormula}>
              Formula: Delay (ms) = (Distance to Furthest Speaker - Distance to Current Speaker) / 34.3
            </Text>
            <Text style={styles.topicTip}>
              ✨ Result: Sound appears to emanate directly from the center of your windshield, as if sitting in the sweet spot of a home theatre.
            </Text>
          </View>

          <View style={styles.topicCard}>
            <Text style={styles.topicTitle}>🎚️ Crossovers: HPF vs LPF vs Subsonic</Text>
            <Text style={styles.topicText}>
              • <Text style={styles.boldText}>HPF (High Pass Filter)</Text>: Lets high frequencies pass; blocks low bass. Set at ~80Hz for 6.5" door speakers so they don't distort on heavy bass hits.
            </Text>
            <Text style={styles.topicText}>
              • <Text style={styles.boldText}>LPF (Low Pass Filter)</Text>: Lets low bass pass; blocks vocals from playing through the subwoofer. Set at ~80Hz to seamlessly blend with your front speakers.
            </Text>
            <Text style={styles.topicText}>
              • <Text style={styles.boldText}>Subsonic Filter</Text>: Critical for ported enclosures. Blocks frequencies below the box tuning (~28Hz) to keep the woofer cone from unloading and burning out.
            </Text>
          </View>

          <View style={styles.topicCard}>
            <Text style={styles.topicTitle}>⚡ Gain Staging: Gain is NOT a Volume Knob</Text>
            <Text style={styles.topicText}>
              An amplifier gain knob matches the input sensitivity of the amplifier to the output voltage of the head unit (e.g. 2.0V pre-out on Nakamichi).
            </Text>
            <Text style={styles.topicWarning}>
              ⚠️ Cranking the gain knob to "get louder" forces the amplifier into square-wave clipping, which overheats voice coils and blows tweeters.
            </Text>
          </View>
        </View>

        {/* Section 2: In-Cabin Troubleshooting */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>🛠️ In-Cabin Acoustic Problem Solver</Text>

          <View style={styles.problemCard}>
            <Text style={styles.problemTitle}>❓ Problem: Bass sounds boomy or disconnected from the front stage</Text>
            <Text style={styles.solutionText}>
              <Text style={styles.boldGreen}>Fix 1:</Text> Flip the subwoofer amplifier phase switch (0° ↔ 180°). If the sub is 180° out of phase with front door woofers, they cancel each other out.
            </Text>
            <Text style={styles.solutionText}>
              <Text style={styles.boldGreen}>Fix 2:</Text> Cut -1.5 dB to -2.0 dB at 200 Hz on your Graphic EQ to remove cabin standing wave boom.
            </Text>
          </View>

          <View style={styles.problemCard}>
            <Text style={styles.problemTitle}>❓ Problem: Vocals sound harsh and cause ear fatigue after 15 minutes</Text>
            <Text style={styles.solutionText}>
              <Text style={styles.boldGreen}>Fix:</Text> Windshields and side glass cause acoustic reflection spikes at 3.5 kHz – 4 kHz. Apply a -1.0 dB cut at 4,000 Hz on your EQ to smooth out vocal sibilance.
            </Text>
          </View>

          <View style={styles.problemCard}>
            <Text style={styles.problemTitle}>❓ Problem: Front door panels rattle on Punjabi / Hip-Hop kick drums</Text>
            <Text style={styles.solutionText}>
              <Text style={styles.boldGreen}>Fix:</Text> Increase the HPF crossover dial on the MOCO AF-04 from 60Hz to 80Hz–90Hz. Let the Pioneer 12" subwoofer handle everything below 80Hz.
            </Text>
          </View>
        </View>

        {/* Section 3: Indian Vehicle Acoustic Characteristics */}
        <View style={styles.card}>
          <Text style={styles.sectionHeader}>🚗 Vehicle Cabin Profiles (India)</Text>

          <View style={styles.carProfile}>
            <Text style={styles.carName}>Skoda Kylaq / Kushaq & VW Taigun (MQB-A0-IN)</Text>
            <Text style={styles.carDetail}>
              • Cabin Volume: ~3.2 m³ • Speaker Size: 6.5" Front/Rear • Tweeter: A-pillar / Sail Panel
            </Text>
            <Text style={styles.carDetail}>
              • Acoustic Trait: Rigid European door sheet metal with moderate 200Hz cabin resonance. Excellent front stage imaging when tweeters are aimed on-axis.
            </Text>
          </View>

          <View style={styles.carProfile}>
            <Text style={styles.carName}>Maruti Suzuki Swift / Baleno / Brezza</Text>
            <Text style={styles.carDetail}>
              • Cabin Volume: ~2.8 – 3.1 m³ • Speaker Size: 6.5" Front/Rear
            </Text>
            <Text style={styles.carDetail}>
              • Acoustic Trait: Lighter door cards benefit heavily from damping sheets and HPF @ 85Hz to prevent plastic vibration.
            </Text>
          </View>

          <View style={styles.carProfile}>
            <Text style={styles.carName}>Mahindra Thar & Scorpio-N</Text>
            <Text style={styles.carDetail}>
              • Acoustic Trait: High roofline and vertical windshield create early reflections; requires slight high-frequency treble attenuation above 10kHz.
            </Text>
          </View>
        </View>

        {/* Footer Link */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.githubBtn}
            onPress={() => Linking.openURL('https://github.com/adityashm/CarAudioAI')}
          >
            <Text style={styles.githubBtnText}>⭐ View CarAudioAI on GitHub</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070b12'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40
  },
  header: {
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  subtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    lineHeight: 18
  },
  card: {
    backgroundColor: '#0f1724',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12
  },
  topicCard: {
    backgroundColor: '#131d2e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  topicTitle: {
    color: '#60a5fa',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4
  },
  topicText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 4
  },
  topicFormula: {
    color: '#38bdf8',
    fontSize: 11,
    fontFamily: 'monospace',
    backgroundColor: '#070b12',
    padding: 6,
    borderRadius: 4,
    marginVertical: 4
  },
  topicTip: {
    color: '#4ade80',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2
  },
  topicWarning: {
    color: '#f87171',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2
  },
  boldText: {
    fontWeight: 'bold',
    color: '#ffffff'
  },
  boldGreen: {
    fontWeight: 'bold',
    color: '#4ade80'
  },
  problemCard: {
    backgroundColor: '#131d2e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#38bdf8'
  },
  problemTitle: {
    color: '#f1f5f9',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4
  },
  solutionText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2
  },
  carProfile: {
    backgroundColor: '#131d2e',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10
  },
  carName: {
    color: '#38bdf8',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4
  },
  carDetail: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 17
  },
  footer: {
    marginTop: 10,
    alignItems: 'center'
  },
  githubBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8
  },
  githubBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13
  }
});
