import React from "react";
import Sidebar from "../component/Sidebar";
import MessageArea from "../component/MessageArea";
import { useSelector } from "react-redux";
import GetMessages from "../customHooks/getMessages";

const Home = () => {
  const { selectedUser } = useSelector((state) => state.user);
  GetMessages();
  return (
    <div className="flex w-full h-screen overflow-hidden">
      <Sidebar />
      <MessageArea />
    </div>
  );
};

export default Home;
