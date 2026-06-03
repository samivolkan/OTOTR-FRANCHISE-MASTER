import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AppHeader } from '../../components/AppHeader';
import { ActionButton } from '../../components/ActionButton';
import { BottomSpacer } from '../../components/BottomSpacer';
import { Screen } from '../../components/Screen';
import { SectionHeader } from '../../components/SectionHeader';
import { StatusBadge } from '../../components/StatusBadge';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';

type Props = {
  navigation: { navigate: (screen: string) => void; goBack: () => void };
};

export function EvidenceScreen({ navigation }: Props) {
  const evidences = ['Araç Ön Görünüm', 'Araç Arka Görünüm', 'Şasi Etiketi', 'Boya Ölçüm Ekranı', 'Hasarlı Bölge Fotoğrafı'];
  return (
    <Screen>
      <AppHeader showBack title="Fotoğraf & Kanıt" subtitle="Kaporta Kontrolü • 16C010935" onBack={navigation.goBack} />
      <View style={styles.content}>
        <View style={styles.stepper}>
          {['Araç Bilgileri', 'Kontroller', 'Fotoğraf & Kanıt', 'Değerlendirme'].map((step, index) => (
            <View style={styles.step} key={step}>
              <View style={[styles.stepCircle, index < 2 && styles.done, index === 2 && styles.active]}>
                <Ionicons name={index < 2 ? 'checkmark' : 'ellipse'} size={13} color={index <= 2 ? '#fff' : colors.textMuted} />
              </View>
              <Text style={[styles.stepText, index === 2 && styles.stepTextActive]}>{step}</Text>
            </View>
          ))}
        </View>
        <View style={styles.sectionRow}>
          <SectionHeader title="Zorunlu Kanıtlar" />
          <StatusBadge label="5 / 5 Tamamlandı" variant="green" icon="check" />
        </View>
        <View style={styles.grid}>
          {evidences.map((label) => (
            <View style={styles.evidence} key={label}>
              <View style={styles.thumb}>
                <Ionicons name="image" size={28} color="#fff" />
              </View>
              <Text style={styles.evidenceTitle}>{label}</Text>
              <View style={styles.uploaded}>
                <Ionicons name="checkmark-circle" size={15} color={colors.green} />
                <Text style={styles.uploadedText}>Yüklendi</Text>
              </View>
            </View>
          ))}
        </View>
        <SectionHeader title="Ek Kanıtlar" />
        <View style={styles.addRow}>
          {[
            ['Fotoğraf Ekle', 'camera-outline'],
            ['Video Ekle', 'videocam-outline'],
            ['Dosya Ekle', 'document-attach-outline'],
          ].map(([label, icon]) => (
            <TouchableOpacity style={styles.addButton} key={label} activeOpacity={0.84}>
              <Ionicons name={icon as keyof typeof Ionicons.glyphMap} size={21} color={colors.blue} />
              <Text style={styles.addText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.notes}>
          <TextInput
            placeholder="Notlarınızı buraya yazın..."
            placeholderTextColor={colors.textMuted}
            multiline
            style={styles.textArea}
          />
          <Text style={styles.counter}>0 / 500</Text>
        </View>
      </View>
      <View style={styles.sticky}>
        <ActionButton title="Geri" variant="outline" onPress={navigation.goBack} style={styles.stickyButton} />
        <ActionButton title="Tamamla" icon="checkmark" onPress={() => navigation.navigate('FinalReview')} style={styles.stickyButton} />
      </View>
      <BottomSpacer />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 18,
    gap: 14,
  },
  stepper: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 12,
    ...shadows.soft,
  },
  step: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  stepCircle: {
    width: 27,
    height: 27,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.muted,
  },
  done: {
    backgroundColor: colors.green,
  },
  active: {
    backgroundColor: colors.blue,
  },
  stepText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
  },
  stepTextActive: {
    color: colors.blue,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  evidence: {
    flexGrow: 1,
    minWidth: 146,
    flexBasis: '45%',
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 12,
    gap: 9,
    ...shadows.soft,
  },
  thumb: {
    height: 96,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.navy2,
  },
  evidenceTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  uploaded: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  uploadedText: {
    color: colors.green,
    fontSize: 12,
    fontWeight: '800',
  },
  addRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  addButton: {
    flexGrow: 1,
    minWidth: 112,
    minHeight: 50,
    borderRadius: 16,
    backgroundColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  addText: {
    color: colors.blue,
    fontSize: 13,
    fontWeight: '900',
  },
  notes: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 13,
    ...shadows.soft,
  },
  textArea: {
    minHeight: 104,
    color: colors.text,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  counter: {
    alignSelf: 'flex-end',
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  sticky: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 94,
    flexDirection: 'row',
    gap: 10,
  },
  stickyButton: {
    flex: 1,
  },
});
