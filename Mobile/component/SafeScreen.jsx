import { View, StyleSheet } from 'react-native'
import React from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import COLORS from '../Constant/colors'

export default function SafeScreen({children}) {

    const insets = useSafeAreaInsets();
  return (
    <View style={[style.container, {paddingTop: insets.top}]}>
       {children}
    </View>
  )
}

const style = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor: COLORS.background
    }
})