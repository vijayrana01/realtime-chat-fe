import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserData } from "../Redux/userSlice";

let API_URL = import.meta.env.VITE_API_URL;

const GetCurrentUser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const result = await axios.get(
          `${API_URL}/api/user/current`,
          {
            withCredentials: true,
          }
        );

        dispatch(setUserData(result.data.user));

      } catch (error) {
        console.error(
          "Error fetching current user:",
          error
        );
      }
    };

    fetchCurrentUser();
  }, []);

  return null;
};

export default GetCurrentUser;