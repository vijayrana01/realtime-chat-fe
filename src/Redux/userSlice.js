import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    otherUsers: null,
    selectedUser: null,
    socket: null,
    onlineUser: null,
    searchData: null,
    friendsVersion: 0, // ✅ increment this to trigger a refetch
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setOtherUsers: (state, action) => {
      state.otherUsers = action.payload;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    setOnlieUser: (state, action) => {
      state.onlineUser = action.payload;
    },
    setSearchData: (state, action) => {
      state.searchData = action.payload;
    },
    refreshFriends: (state) => {
      state.friendsVersion += 1;
    },
    // in reducers:
    updateLastMessage: (state, action) => {
      const { senderId, message } = action.payload;
      if (!state.otherUsers) return;
      state.otherUsers = state.otherUsers.map((user) =>
        user._id === senderId ? { ...user, lastMessage: message } : user,
      );
    },
    incrementUnread: (state, action) => {
      const { senderId } = action.payload;
      if (!state.otherUsers) return;
      state.otherUsers = state.otherUsers.map((user) =>
        user._id === senderId
          ? { ...user, unread: (user.unread ?? 0) + 1 }
          : user,
      );
    },

    resetUnread: (state, action) => {
      const { userId } = action.payload;
      if (!state.otherUsers) return;
      state.otherUsers = state.otherUsers.map((user) =>
        user._id === userId ? { ...user, unread: 0 } : user,
      );
    },
  },
});

export const {
  setUserData,
  setOtherUsers,
  setSelectedUser,
  setSocket,
  setOnlieUser,
  setSearchData,
  refreshFriends,
  updateLastMessage,
  incrementUnread,
  resetUnread,
} = userSlice.actions;

export default userSlice.reducer;
