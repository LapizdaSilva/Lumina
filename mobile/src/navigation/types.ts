export type RootStackParamList = {
  Home: undefined;
  Search: undefined;
  History: undefined;
  Queries: undefined;
  Profile: undefined;
  Login: undefined;
  Register: undefined;
  Patients: undefined;
  Conversation: {
    otherUserId: string;
    otherUserName: string;
    otherUserAvatar: string | null;
  };
};