// components/GridBackground.tsx
import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Defs, Pattern, Rect, LinearGradient, Stop, Mask, Ellipse } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function GridBackground() {
  return (
    <View className="absolute inset-0">
      <Svg width={screenWidth} height={screenHeight} className="absolute inset-0">
        <Defs>
          {/* Grid Pattern */}
          <Pattern id="grid" width="14" height="24" patternUnits="userSpaceOnUse">
            <Rect width="14" height="24" fill="white" />
            <Rect x="0" y="0" width="1" height="24" fill="#4f4f4f2e" />
            <Rect x="0" y="0" width="14" height="1" fill="#4f4f4f2e" />
          </Pattern>
          
          {/* Radial Gradient Mask */}
          <Mask id="fade">
            <Ellipse 
              cx={screenWidth / 2} 
              cy="0" 
              rx={screenWidth * 0.8} 
              ry={screenHeight * 0.5} 
              fill="white"
              fillOpacity="0.7"
            />
          </Mask>
        </Defs>
        
        {/* Apply the grid pattern with mask */}
        <Rect 
          width={screenWidth} 
          height={screenHeight} 
          fill="url(#grid)" 
          mask="url(#fade)"
        />
      </Svg>
    </View>
  );
}