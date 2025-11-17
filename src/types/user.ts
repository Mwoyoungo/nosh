/**
 * User Types
 */

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  avatarUrl: string;
  bio: string;
  userRole: 'NORMAL_USER' | 'VENDOR';
  isAdmin: boolean;
  createdAt: number;
}
