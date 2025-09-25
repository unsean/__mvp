import React from 'react';
import { View } from 'react-native';
import ProfileCard from '../molecules/ProfileCard';
import FriendsActivity from '../molecules/FriendsActivity';
import FriendList from '../organisms/FriendList';
import ChatList from '../organisms/ChatList';
import BadgeScroller from '../molecules/BadgeScroller';
import StatChart from '../molecules/StatChart';
import ActivityTimeline from '../organisms/ActivityTimeline';
import SettingsSection from '../organisms/SettingsSection';

export default function ProfileContent({
  user,
  stats,
  badges,
  activities,
  chats = [],
  settings,
  onEditProfile,
  onToggleSetting,
  onLogout,
  setEditModal,
  handleEditSave,
  editModal,
  onOpenChat
}) {
  return (
    <View>
      <ProfileCard user={user} onEdit={onEditProfile} />
      <View style={{ height: 16 }} />
      <FriendsActivity />
      <View style={{ height: 8 }} />
      {/* Friends list (real data can be fetched and passed here) */}
      <FriendList onChat={friend => { /* TODO: open chat modal */ }} />
      <View style={{ height: 8 }} />
      {/* ChatList now receives real chats and onOpenChat handler */}
      <ChatList data={chats} onOpenChat={onOpenChat} />
      <View style={{ height: 16 }} />
      <BadgeScroller badges={badges} />
      <View style={{ height: 8 }} />
      {stats && <StatChart stats={stats} />}
      <View style={{ height: 8 }} />
      <ActivityTimeline activities={activities} />
      <View style={{ height: 16 }} />
      <SettingsSection settings={settings} onToggle={onToggleSetting} onLogout={onLogout} />
    </View>
  );
}
