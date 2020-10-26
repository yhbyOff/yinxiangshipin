import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import __ from 'lodash';

interface Props extends TouchableOpacityProps {
    delay?: number;
}

export function DebouncedPressable({ delay = 100, onPress, children, ...otherTouchableProps }: Props) {
    const debouncedPress = useCallback(__.debounce(onPress, delay), [onPress, delay]);

    return (
        <TouchableOpacity onPress={debouncedPress} activeOpacity={0.7} {...otherTouchableProps}>
            {children}
        </TouchableOpacity>
    );
}