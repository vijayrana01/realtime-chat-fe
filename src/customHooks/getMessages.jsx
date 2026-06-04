import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setMessages } from "../Redux/messagesSlice";

const API_URL = import.meta.env.VITE_API_URL;

const GetMessages = () => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (!selectedUser?._id) return; // ✅ guard — stops firing when no user selected

    const fetchMessages = async () => {
      try {
        const result = await axios.get(
          `${API_URL}/api/message/get/${selectedUser._id}`, // ✅ _id is guaranteed here
          { withCredentials: true },
        );
        dispatch(setMessages(result.data.messages));
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedUser?._id]); // ✅ only re-fetch when selected user ID actually changes
  //    was: [userData, selectedUser] — userData change is irrelevant

  return null;
};

export default GetMessages;
