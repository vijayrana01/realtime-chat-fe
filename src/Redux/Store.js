import {configureStore} from "@reduxjs/toolkit"
import useSlice from "./userSlice.js"
import messageSlice from "./messagesSlice.js"

export const store=configureStore({
    reducer:{
        user:useSlice,
        message:messageSlice,
    }
})