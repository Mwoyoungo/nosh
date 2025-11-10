/**
 * CometChat UI Kit Configuration and Initialization
 */

import { CometChat } from '@cometchat/chat-sdk-javascript';
import { CometChatUIKit, UIKitSettingsBuilder } from '@cometchat/chat-uikit-react';

const APP_ID = import.meta.env.VITE_COMETCHAT_APP_ID;
const REGION = import.meta.env.VITE_COMETCHAT_REGION;
const AUTH_KEY = import.meta.env.VITE_COMETCHAT_AUTH_KEY;

let isInitialized = false;

/**
 * Initialize CometChat UI Kit
 */
export const initCometChat = async (): Promise<boolean> => {
  if (isInitialized) {
    console.log('✅ CometChat UI Kit already initialized');
    return true;
  }

  try {
    const UIKitSettings = new UIKitSettingsBuilder()
      .setAppId(APP_ID)
      .setRegion(REGION)
      .setAuthKey(AUTH_KEY)
      .subscribePresenceForAllUsers()
      .build();

    await CometChatUIKit.init(UIKitSettings);
    isInitialized = true;
    console.log('✅ CometChat UI Kit initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ CometChat UI Kit initialization failed:', error);
    return false;
  }
};

/**
 * Create or update CometChat user (matches Android logic)
 */
export const createOrUpdateCometChatUser = async (
  uid: string,
  name: string,
  avatarUrl: string
): Promise<CometChat.User | null> => {
  try {
    const newUser = new CometChat.User(uid);
    newUser.setName(name);
    if (avatarUrl) {
      newUser.setAvatar(avatarUrl);
    }

    // Try to create user
    try {
      const user = await CometChatUIKit.createUser(newUser);
      console.log('✅ CometChat user created:', user.getName());
      return user;
    } catch (createError: any) {
      // If user already exists, update instead
      if (createError.code === 'ERR_UID_ALREADY_EXISTS') {
        console.log('🔄 User exists, updating instead...');
        const updatedUser = await CometChatUIKit.updateUser(newUser);
        console.log('✅ CometChat user updated:', updatedUser.getName());
        return updatedUser;
      } else {
        throw createError;
      }
    }
  } catch (error) {
    console.error('❌ CometChat create/update user failed:', error);
    return null;
  }
};

/**
 * Login user to CometChat using UI Kit
 */
export const loginCometChatUser = async (uid: string, name: string, avatarUrl: string = ''): Promise<CometChat.User | null> => {
  try {
    // Check if already logged in
    const loggedInUser = await CometChatUIKit.getLoggedinUser();
    if (loggedInUser) {
      console.log('✅ CometChat user already logged in:', loggedInUser.getUid());
      return loggedInUser;
    }

    // Create or update user first (ensures user exists with latest data)
    await createOrUpdateCometChatUser(uid, name, avatarUrl);

    // Then login
    const user = await CometChatUIKit.login(uid);
    console.log('✅ CometChat login successful:', user.getName());
    return user;
  } catch (error) {
    console.error('❌ CometChat login failed:', error);
    return null;
  }
};

/**
 * Logout user from CometChat
 */
export const logoutCometChatUser = async (): Promise<boolean> => {
  try {
    await CometChat.logout();
    console.log('✅ CometChat logout successful');
    return true;
  } catch (error) {
    console.error('❌ CometChat logout failed:', error);
    return false;
  }
};

/**
 * Get current logged in CometChat user
 */
export const getCurrentCometChatUser = async (): Promise<CometChat.User | null> => {
  try {
    const user = await CometChatUIKit.getLoggedinUser();
    return user;
  } catch (error) {
    console.error('❌ Failed to get CometChat user:', error);
    return null;
  }
};

/**
 * Update CometChat user profile (call this when user updates profile in Firebase)
 */
export const updateCometChatUserProfile = async (
  uid: string,
  name: string,
  avatarUrl: string
): Promise<boolean> => {
  try {
    await createOrUpdateCometChatUser(uid, name, avatarUrl);
    return true;
  } catch (error) {
    console.error('❌ Failed to update CometChat user profile:', error);
    return false;
  }
};

export { CometChat, CometChatUIKit };
