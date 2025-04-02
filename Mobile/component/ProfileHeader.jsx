import { View, Text } from 'react-native'
import React from 'react'
import { useSelector } from 'react-redux'
import styles from '../assets/Styles/profile.style'
import { Image } from 'expo-image'
import { formatMemberSince } from '../lib/utils'

export default function ProfileHeader() {
    const {user}  = useSelector((state)=>state.auth)

    if(!user) return null;
  return (
    <View style={styles.profileHeader}>
      <Image source={{uri: user.profileImage}} style={styles.profileImage}/>
      <View style={styles.profileInfo}>
         <Text style={styles.username}>{user.username}</Text>
         <Text style={styles.email}>{user.email}</Text>
         <Text style={styles.memberSince}>Joined {formatMemberSince(user.createdAt)}</Text>
      </View>
    </View>
  )
}