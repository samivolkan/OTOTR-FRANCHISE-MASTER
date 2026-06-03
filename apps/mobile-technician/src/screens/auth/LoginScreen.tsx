import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActionButton } from '../../components/ActionButton';
import { colors } from '../../theme/colors';
import { shadows } from '../../theme/shadows';

type Props = {
  navigation: { replace: (screen: string) => void };
};

export function LoginScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.curveOne} />
      <View style={styles.curveTwo} />
      <View style={styles.hero}>
        <Text style={styles.logo}>OTOTR</Text>
        <Text style={styles.tagline}>Tarafsız Araç Ekspertizi</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.lock}>
          <Ionicons name="lock-closed" size={26} color={colors.blue} />
        </View>
        <Text style={styles.title}>Giriş Yap</Text>
        <Text style={styles.subtitle}>Hesabınıza giriş yaparak devam edin.</Text>
        <View style={styles.input}>
          <Ionicons name="mail-outline" size={19} color={colors.textMuted} />
          <TextInput placeholder="Telefon / E-posta" placeholderTextColor={colors.textMuted} style={styles.inputText} />
        </View>
        <View style={styles.input}>
          <Ionicons name="key-outline" size={19} color={colors.textMuted} />
          <TextInput placeholder="Şifre" placeholderTextColor={colors.textMuted} secureTextEntry style={styles.inputText} />
          <Ionicons name="eye-outline" size={20} color={colors.textMuted} />
        </View>
        <View style={styles.optionRow}>
          <View style={styles.remember}>
            <View style={styles.checkbox}>
              <Ionicons name="checkmark" size={14} color="#fff" />
            </View>
            <Text style={styles.optionText}>Beni hatırla</Text>
          </View>
          <Text style={styles.link}>Şifremi unuttum</Text>
        </View>
        <ActionButton title="Giriş Yap" icon="arrow-forward" onPress={() => navigation.replace('Main')} />
        <ActionButton title="Teknik Destek" variant="outline" icon="headset-outline" />
        <TouchableOpacity activeOpacity={0.8} style={styles.branch}>
          <Ionicons name="business-outline" size={19} color={colors.blue} />
          <Text style={styles.branchText}>Şube: Bursa Küçük Sanayi</Text>
          <Ionicons name="chevron-forward" size={19} color={colors.textMuted} />
        </TouchableOpacity>
        <View style={styles.note}>
          <Ionicons name="shield-checkmark" size={18} color={colors.green} />
          <Text style={styles.noteText}>Güvenli giriş için tüm verileriniz şifrelenmektedir.</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.navy,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  curveOne: {
    position: 'absolute',
    width: 260,
    height: 190,
    borderRadius: 140,
    right: -70,
    top: 20,
    backgroundColor: 'rgba(20,99,255,0.18)',
  },
  curveTwo: {
    position: 'absolute',
    width: 260,
    height: 180,
    borderRadius: 140,
    left: -90,
    bottom: 170,
    backgroundColor: 'rgba(6,174,212,0.12)',
  },
  hero: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: 0,
  },
  tagline: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 20,
    gap: 13,
    ...shadows.card,
  },
  lock: {
    width: 58,
    height: 58,
    borderRadius: 20,
    backgroundColor: colors.blueSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: -8,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.muted,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  inputText: {
    flex: 1,
    color: colors.text,
    fontSize: 15,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  remember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  link: {
    color: colors.blue,
    fontSize: 13,
    fontWeight: '800',
  },
  branch: {
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: colors.muted,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  branchText: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  note: {
    borderRadius: 16,
    backgroundColor: colors.greenSoft,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
  },
  noteText: {
    flex: 1,
    color: colors.green,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
  },
});
