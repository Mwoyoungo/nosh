/**
 * Messages/Chats Page with CometChat UI Kit
 * Uses CometChatConversations for conversation list
 */

import { useState, CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { CometChatConversations } from '@cometchat/chat-uikit-react';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import BottomNav from '@/components/navigation/BottomNav';

const MessagesPage = () => {
  const navigate = useNavigate();

  // Handle conversation item click
  const handleConversationClick = (conversation: CometChat.Conversation) => {
    const conversationWith = conversation.getConversationWith();

    if (conversationWith instanceof CometChat.User) {
      // Navigate to chat with this user
      navigate(`/chat/${conversationWith.getUid()}`);
    } else if (conversationWith instanceof CometChat.Group) {
      // Navigate to group chat (if you want to support groups)
      navigate(`/chat/group/${conversationWith.getGuid()}`);
    }
  };

  // Styles
  const containerStyle: CSSProperties = {
    height: 'calc(100vh - 50px)', // Subtract smaller bottom nav height
    backgroundColor: 'var(--dark-bg)',
    overflow: 'hidden',
  };

  return (
    <>
      <div style={containerStyle}>
        <CometChatConversations
          onItemClick={handleConversationClick}
        />
      </div>
      <BottomNav />
    </>
  );
};

export default MessagesPage;
