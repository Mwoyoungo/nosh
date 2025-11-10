/**
 * CometChat Messaging Service
 */

import { CometChat } from './config';

/**
 * Fetch conversations list
 */
export const getConversations = async (limit: number = 30): Promise<CometChat.Conversation[]> => {
  try {
    const conversationsRequest = new CometChat.ConversationsRequestBuilder()
      .setLimit(limit)
      .build();

    const conversations = await conversationsRequest.fetchNext();
    return conversations;
  } catch (error) {
    console.error('❌ Failed to fetch conversations:', error);
    return [];
  }
};

/**
 * Fetch messages for a conversation
 */
export const getMessages = async (
  uid: string,
  limit: number = 30
): Promise<CometChat.BaseMessage[]> => {
  try {
    const messagesRequest = new CometChat.MessagesRequestBuilder()
      .setUID(uid)
      .setLimit(limit)
      .build();

    const messages = await messagesRequest.fetchPrevious();
    return messages;
  } catch (error) {
    console.error('❌ Failed to fetch messages:', error);
    return [];
  }
};

/**
 * Send text message
 */
export const sendTextMessage = async (
  receiverUID: string,
  messageText: string
): Promise<CometChat.TextMessage | null> => {
  try {
    const textMessage = new CometChat.TextMessage(
      receiverUID,
      messageText,
      CometChat.RECEIVER_TYPE.USER
    );

    const message = await CometChat.sendMessage(textMessage);
    return message as CometChat.TextMessage;
  } catch (error) {
    console.error('❌ Failed to send message:', error);
    return null;
  }
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (
  messageId: number,
  receiverUID: string
): Promise<boolean> => {
  try {
    await CometChat.markAsRead(messageId, receiverUID, CometChat.RECEIVER_TYPE.USER);
    return true;
  } catch (error) {
    console.error('❌ Failed to mark messages as read:', error);
    return false;
  }
};

/**
 * Add message listener
 */
export const addMessageListener = (
  listenerId: string,
  onTextMessageReceived: (message: CometChat.TextMessage) => void,
  onMessageRead?: (receipt: CometChat.MessageReceipt) => void
) => {
  CometChat.addMessageListener(
    listenerId,
    new CometChat.MessageListener({
      onTextMessageReceived: (message: CometChat.TextMessage) => {
        console.log('📩 New message received:', message.getText());
        onTextMessageReceived(message);
      },
      onMessageRead: (receipt: CometChat.MessageReceipt) => {
        console.log('✅ Message read receipt:', receipt.getMessageId());
        if (onMessageRead) {
          onMessageRead(receipt);
        }
      },
    })
  );
};

/**
 * Remove message listener
 */
export const removeMessageListener = (listenerId: string) => {
  CometChat.removeMessageListener(listenerId);
};

/**
 * Get unread message count
 */
export const getUnreadMessageCount = async (): Promise<number> => {
  try {
    const unreadCount = await CometChat.getUnreadMessageCountForAllUsers();
    return Object.values(unreadCount).reduce((sum: number, count) => sum + (count as number), 0);
  } catch (error) {
    console.error('❌ Failed to get unread count:', error);
    return 0;
  }
};

/**
 * Get user details from CometChat
 */
export const getCometChatUser = async (uid: string): Promise<CometChat.User | null> => {
  try {
    const user = await CometChat.getUser(uid);
    return user;
  } catch (error) {
    console.error('❌ Failed to get user:', error);
    return null;
  }
};
