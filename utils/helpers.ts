// utils/helpers.ts
import { Alert } from 'react-native';

export const showErrorAlert = (title: string, message: string) => {
  Alert.alert(title, message, [{ text: 'OK' }]);
};
