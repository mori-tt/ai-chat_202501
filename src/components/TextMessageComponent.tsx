import React from "react";
import MessageDisplay from "./MessageDisplay";

const TextMessageComponent = ({ content }: { content: string }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow break-all whitespace-pre-wrap">
      <MessageDisplay content={content} />
    </div>
  );
};

export default TextMessageComponent;
