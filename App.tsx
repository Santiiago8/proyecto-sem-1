import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { StyleSheet, Text, View, Button, Pressable } from 'react-native';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av'
import { writeAudioToFile } from './utils/writeAudioToFile';
import { playFromPath } from './utils/playFromPath';

Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: false,
  playsInSilentModeIOS: true,
  shouldDuckAndroid:true,
  playThroughEarpieceAndroid: false,
})

export default function App() {

  const [ borderColor, setBorderColor] = useState<"lightgray" | "lightgreen">("lightgray");
  const {state, startRecognizing, stopRecognizing, destroyRecognizer} = useVoiceRecognition();
  const [urlPath, setUrlPath] = useState("");

  const listFiles = async () => {
    try {
      const result = await FileSystem.readAsStringAsync(FileSystem.documentDirectory!);
      if(result.length > 0) {
        const filename = result[0];
        const path = FileSystem.documentDirectory + filename;
        setUrlPath(path);
      }
    } catch (e) {
      console.log(e);
      
    }
  }
  const handleSubmit = async () => {
    if(!state.results[0]) return;

    try {
      //fetch the audio blobs from the server
      const audioBlob = await fetchAudio(state.results[0]);
      const reader = new FileReader()
      reader.onload = async (e) => {
        if (e.target && typeof e.target.result === "string") {
          const audioData = e.target.result.split(",")[1];
          //save data
          const path = await writeAudioToFile(audioData);

          //play audio
          setUrlPath(path);
          await playFromPath(path);
          destroyRecognizer();
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (e) {
      console.log(e);
      
    }
  }

  return (
    <View style={styles.container}>
      <Text style={{fontSize: 32, fontWeight: 'bold'}}>InfoPedia App</Text>
      <Text 
        style={{
          textAlign: 'center',
          color: '#333333',
          marginBottom: 5,
          fontSize: 16,
        }}
      >
        Manten presionado para hablar, suelta para enviar la grabacion y obtendras una respuesta
      </Text>
      <Text
      style={{
        marginVertical: 10,
        fontSize: 17
      }}
      >
      Tu mensaje</Text>
      <Text
      style={{
        marginVertical: 10,
        fontSize: 17
      }}
      >
      {JSON.stringify(state, null, 2)}
      </Text>

      <Pressable
        style={{
          width: '60%',
          marginBottom: 15,
          padding: 30,
          gap: 10,
          borderWidth: 3,
          alignItems: 'center',
          borderRadius: 10,
          borderColor: borderColor,
        }}

        onPressIn={() => {
          setBorderColor("lightgreen");
          startRecognizing();
        }}
        onPressOut={() => {
          setBorderColor("lightgray");
          stopRecognizing();
          handleSubmit();
        }}
      >
        <Text>
          Manten para hablar
        </Text>
      </Pressable>

      <Button 
        title='Repite el ultimo mensaje'
        onPress={ async () => {
          await playFromPath(urlPath);
        }}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding: 20,
  },
});
