import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  value: string;
  small?: boolean;
};

export function Plate({ value, small }: Props) {
  return (
    <View style={[styles.plate, small && styles.smallPlate]}>
      <View style={styles.strip}>
        <Text style={styles.stripText}>TR</Text>
      </View>
      <Text style={[styles.text, small && styles.smallText]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  plate: {
    height: 38,
    minWidth: 126,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.text,
    backgroundColor: '#fff',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  smallPlate: {
    height: 32,
    minWidth: 106,
  },
  strip: {
    width: 26,
    backgroundColor: colors.blueDark,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 5,
  },
  stripText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
  text: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
    textAlign: 'center',
    alignSelf: 'center',
    paddingHorizontal: 8,
  },
  smallText: {
    fontSize: 14,
  },
});
