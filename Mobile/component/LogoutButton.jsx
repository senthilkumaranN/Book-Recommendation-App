import { View, Text, TouchableOpacity, Alert } from 'react-native'
import React from 'react'
import { useDispatch } from 'react-redux'
import styles from '../assets/Styles/profile.style'
import { Ionicons } from '@expo/vector-icons'
import COLORS from '../Constant/colors'
import { logoutUser} from "../Slice/AuthSlice"

export default function LogoutButton() {
    const dispatch = useDispatch()
    const confirmLogout = ()=>{
        Alert.alert("Logout", "Are you sure you want to logout?", [
            {text: "cancel", style: "cancel"},
            {text: "Logout", onPress: () =>dispatch(logoutUser()), style: "destructive"}
        ])
    }
  return (
    <TouchableOpacity style={styles.logoutButton} onPress={confirmLogout}>
         <Ionicons name='log-out-outline' size={20} color={COLORS.white}/>
         <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  )
}