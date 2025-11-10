/**
 * Chat Conversation Page with CometChat UI Kit
 * 1-on-1 messaging UI using CometChat UIKit components
 */

import { useState, useEffect, CSSProperties } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CometChatMessageList,
  CometChatMessageComposer,
  CometChatMessageHeader,
} from '@cometchat/chat-uikit-react';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { getCometChatUser } from '@/services/cometchat/messaging';
import './ChatPage.css';

const ChatPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [chatUser, setChatUser] = useState<CometChat.User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user to chat with
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;

      try {
        const user = await getCometChatUser(userId);
        setChatUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const containerStyle: CSSProperties = {
    height: '100vh',
    backgroundColor: 'var(--dark-bg)',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyle: CSSProperties = {
    flexShrink: 0,
  };

  const messageListStyle: CSSProperties = {
    flex: 1,
    overflow: 'auto',
    minHeight: 0,
  };

  const composerStyle: CSSProperties = {
    flexShrink: 0,
  };

  if (loading || !chatUser) {
    return (
      <div
        style={{
          ...containerStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: 'var(--text-secondary)' }}>
          {loading ? 'Loading chat...' : 'User not found'}
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Message Header */}
      <div style={headerStyle}>
        <CometChatMessageHeader
          user={chatUser}
          onBack={() => navigate(-1)}
        />
      </div>

      {/* Message List */}
      <div style={messageListStyle}>
        <CometChatMessageList user={chatUser} />
      </div>

      {/* Message Composer */}
      <div style={composerStyle}>
        <CometChatMessageComposer user={chatUser} />
      </div>
    </div>
  );
};

export default ChatPage;
