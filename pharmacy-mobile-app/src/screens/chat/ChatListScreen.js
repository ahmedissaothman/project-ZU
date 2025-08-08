// Conversation list 
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { globalStyles } from '../../styles/globalStyles';
import { COLORS } from '../../utils/constants';
import api from '../../config/api';

const ChatListScreen = ({ navigation }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/chat/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const ConversationCard = ({ conversation }) => (
    <TouchableOpacity
      style={globalStyles.card}
      onPress={() => navigation.navigate('Chat', { 
        userId: conversation.user_id,
        userName: conversation.full_name 
      })}
    >
      <View style={[globalStyles.row, globalStyles.spaceBetween]}>
        <Text style={globalStyles.textPrimary}>{conversation.full_name}</Text>
        <Text style={globalStyles.textSmall}>
          {formatTime(conversation.last_message_time)}
        </Text>
      </View>
      <Text style={globalStyles.textSecondary} numberOfLines={1}>
        Tap to start conversation
      </Text>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={globalStyles.header}>Messages</Text>
      <Text style={globalStyles.textSecondary}>
        Connect with customers and colleagues
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={globalStyles.textSecondary}>No conversations yet</Text>
      <Text style={globalStyles.textSmall}>
        Start a new conversation by visiting customer details
      </Text>
    </View>
  );

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.user_id.toString()}
        renderItem={({ item }) => <ConversationCard conversation={item} />}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchConversations} />
        }
        contentContainerStyle={styles.container}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
});

export default ChatListScreen;