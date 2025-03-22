import React from 'react';
import { WebView } from 'react-native-webview';
import { StyleSheet, View } from 'react-native';

export default function FaceRecognition() {
  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: 'https://memory-haven-v1-git-main-suhaanis-projects.vercel.app/activities' }} // Your deployed link
        style={styles.webview}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
});