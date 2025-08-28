import React from "react";

// Renders description text that may contain HTML tags
const Description = ({ description }) => {
  if (!description) {
    return <p className="text-muted mb-0">No description available.</p>;
  }

  return (
    <div
      className="text-muted mb-0 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: description }}
    />
  );
};

export default Description;
