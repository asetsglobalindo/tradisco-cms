import React from "react";

const ToastBody: React.FC<{title: string; description: string}> = ({title, description}) => {
  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
    </div>
  );
};

export default ToastBody;
