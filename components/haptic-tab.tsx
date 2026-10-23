import React from 'react';
import { Platform, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { ComponentProps } from 'react';

type HapticTabProps = ComponentProps<typeof Pressable>;

export function HapticTab(props: HapticTabProps) {
  return (
    <Pressable
      {...props}
      onPressIn={(event) => {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(
            Haptics.ImpactFeedbackStyle.Light
          );
        }

        props.onPressIn?.(event);
      }}
    />
  );
}