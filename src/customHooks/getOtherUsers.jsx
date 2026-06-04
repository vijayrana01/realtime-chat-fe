import axios from "axios";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setOtherUsers } from "../Redux/userSlice";

const API_URL = import.meta.env.VITE_API_URL;

const GetOtherUsers = () => {
  const dispatch = useDispatch();
  const { userData, friendsVersion } = useSelector((state) => state.user); // ✅

  useEffect(() => {
    if (!userData) return; // don't fetch if not logged in

    const fetchFriends = async () => {
      try {
        const result = await axios.get(`${API_URL}/api/friends/friend`, {
          withCredentials: true,
        });
        dispatch(setOtherUsers(result.data.users));
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, [userData, friendsVersion]); // ✅ refetch on either change

  return null;
};

export default GetOtherUsers;