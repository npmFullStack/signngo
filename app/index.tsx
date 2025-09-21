import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import NavigationBar from '../components/NavigationBar';

export default function HomeScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      {/* Top Wave SVG */}
      <View className="absolute top-0 left-0 right-0">
        <Svg width="100%" height="120" viewBox="0 0 1440 320" className="w-full">
          <Path
            fill="#0099ff"
            fillOpacity="1"
            d="M0,288L0,32L37.9,32L37.9,192L75.8,192L75.8,32L113.7,32L113.7,256L151.6,256L151.6,192L189.5,192L189.5,32L227.4,32L227.4,32L265.3,32L265.3,160L303.2,160L303.2,64L341.1,64L341.1,96L378.9,96L378.9,64L416.8,64L416.8,32L454.7,32L454.7,256L492.6,256L492.6,96L530.5,96L530.5,192L568.4,192L568.4,256L606.3,256L606.3,224L644.2,224L644.2,128L682.1,128L682.1,224L720,224L720,128L757.9,128L757.9,96L795.8,96L795.8,32L833.7,32L833.7,256L871.6,256L871.6,96L909.5,96L909.5,256L947.4,256L947.4,256L985.3,256L985.3,224L1023.2,224L1023.2,192L1061.1,192L1061.1,192L1098.9,192L1098.9,192L1136.8,192L1136.8,160L1174.7,160L1174.7,192L1212.6,192L1212.6,320L1250.5,320L1250.5,256L1288.4,256L1288.4,96L1326.3,96L1326.3,256L1364.2,256L1364.2,96L1402.1,96L1402.1,192L1440,192L1440,0L1402.1,0L1402.1,0L1364.2,0L1364.2,0L1326.3,0L1326.3,0L1288.4,0L1288.4,0L1250.5,0L1250.5,0L1212.6,0L1212.6,0L1174.7,0L1174.7,0L1136.8,0L1136.8,0L1098.9,0L1098.9,0L1061.1,0L1061.1,0L1023.2,0L1023.2,0L985.3,0L985.3,0L947.4,0L947.4,0L909.5,0L909.5,0L871.6,0L871.6,0L833.7,0L833.7,0L795.8,0L795.8,0L757.9,0L757.9,0L720,0L720,0L682.1,0L682.1,0L644.2,0L644.2,0L606.3,0L606.3,0L568.4,0L568.4,0L530.5,0L530.5,0L492.6,0L492.6,0L454.7,0L454.7,0L416.8,0L416.8,0L378.9,0L378.9,0L341.1,0L341.1,0L303.2,0L303.2,0L265.3,0L265.3,0L227.4,0L227.4,0L189.5,0L189.5,0L151.6,0L151.6,0L113.7,0L113.7,0L75.8,0L75.8,0L37.9,0L37.9,0L0,0L0,0Z"
          />
        </Svg>
      </View>

      {/* Main Content */}
      <View className="flex-1 justify-center items-center p-6 pt-32">
        <Text className="text-3xl font-poppins-bold text-blue-600 mb-2">SignNGo</Text>
        <Text className="text-lg font-poppins text-gray-600 mb-10 text-center">
          Capture and save your signatures easily
        </Text>

        <View className="w-full max-w-xs">
          <Link href="/signature" asChild>
            <TouchableOpacity className="bg-blue-500 py-4 rounded-lg mb-4">
              <Text className="text-white text-center font-poppins-bold text-lg">
                Create New Signature
              </Text>
            </TouchableOpacity>
          </Link>
          
          <TouchableOpacity
            className="bg-green-500 py-4 rounded-lg"
            onPress={() => alert('Gallery feature would go here')}
          >
            <Text className="text-white text-center font-poppins-bold text-lg">
              View Saved Signatures
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-16">
          <Text className="text-gray-500 text-center font-poppins">
            Draw, save, and export your signatures with ease
          </Text>
        </View>
      </View>

      {/* Navigation Bar */}
      <NavigationBar activeTab="home" />
    </SafeAreaView>
  );
}