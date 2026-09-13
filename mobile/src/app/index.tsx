import { Redirect } from 'expo-router';

export default function Index() {
  // _layout.tsx will handle the actual auth redirect
  // This just exists so Expo Router has a valid '/' route
  return <Redirect href="/(app)" />;
}
