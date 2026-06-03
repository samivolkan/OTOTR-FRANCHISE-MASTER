declare const require: <T = any>(name: string) => T;

const RNFormData = require('react-native/Libraries/Network/FormData').default;

if (!(globalThis as unknown as { FormData?: typeof RNFormData }).FormData) {
  (globalThis as unknown as { FormData: typeof RNFormData }).FormData = RNFormData;
}

const globalWithPerformance = globalThis as unknown as {
  performance?: { now?: () => number };
};

if (!globalWithPerformance.performance) {
  globalWithPerformance.performance = { now: () => Date.now() };
} else if (!globalWithPerformance.performance.now) {
  globalWithPerformance.performance.now = () => Date.now();
}

const { AppRegistry } = require<typeof import('react-native')>('react-native');
const App = require<typeof import('./App')>('./App').default;

AppRegistry.registerComponent('main', () => App);
