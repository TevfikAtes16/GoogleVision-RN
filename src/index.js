import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";

const DetectObject = () => {
  const [imageUri, setImageUri] = useState(null);
  const [labels, setLabels] = useState([]);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
      console.log(result);
    } catch (error) {
      console.error("Error picking an image", error);
    }
  };

  const analyzeImage = async () => {
    try {
      if (!imageUri) {
        alert("Lütfen önce bir resim seçin");
        return;
      }
      //replace your google cloud vision api key with your actual API key
      const apiKey = "Your API Key";
      const apiUrl = `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`;

      const base64ImageData = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const requestData = {
        requests: [
          {
            image: {
              content: base64ImageData,
            },
            features: [
              {
                type: "LABEL_DETECTION",
                maxResults: 5,
              },
            ],
          },
        ],
      };
      const apiResponse = await axios.post(apiUrl, requestData);
      setLabels(apiResponse.data.responses[0].labelAnnotations);
    } catch (error) {
      console.error("Error analyzing the image", error);
      alert("Error analyzing the image. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Google Cloud Vision API</Text>
      {imageUri && (
        <Image source={{ uri: imageUri }} style={{ width: 300, height: 300 }} />
      )}
      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Text style={styles.text}>Resim Seç</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={analyzeImage} style={styles.button}>
        <Text style={styles.text}>Resmi Analizle</Text>
      </TouchableOpacity>
      {labels.length > 0 && (
        <View>
          <Text style={styles.label}>Etiketler:</Text>
          {labels.map((label) => (
            <Text key={label.mid} style={styles.outputText}>
              {label.description} - %{(label.score * 100).toFixed(2)}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

export default DetectObject;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 50,
    marginBottom: 100,
  },
  button: {
    backgroundColor: "#DDDDDD",
    padding: 10,
    marginBottom: 10,
    marginTop: 20,
    width: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "bold",
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },
  outputText: {
    fontSize: 18,
    marginBottom: 10,
  },
});