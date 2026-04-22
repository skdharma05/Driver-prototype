import { View, ActivityIndicator } from 'react-native';
import { theme } from '../src/styles/theme';

export default function Index() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}
