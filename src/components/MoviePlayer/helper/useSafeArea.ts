import React, { useState, useEffect } from 'react';
import { StatusBar, Platform, NativeModules } from 'react-native';
const { StatusBarManager } = NativeModules;

export default function useSafeArea({ fullscreen }) {
    const [statusBarHeight, setStatusBarHeight] = useState(0);
    useEffect(() => {
        if (Platform.OS == 'android') {
            setStatusBarHeight(StatusBar.currentHeight || 0);
        } else {
            StatusBarManager.getHeight(({ height }) => {
                setStatusBarHeight(height);
            });
        }
    }, []);
    return fullscreen ? statusBarHeight : 0;
}
