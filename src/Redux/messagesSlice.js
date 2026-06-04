import { createSlice } from "@reduxjs/toolkit";

export const messagesSlice = createSlice({
  name: "message",
  initialState: {
    messages: null,
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
   },
});
export const { setMessages } = messagesSlice.actions;
export default messagesSlice.reducer;