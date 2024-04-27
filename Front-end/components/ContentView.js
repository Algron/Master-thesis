import React from 'react';
import './ContentView.css';

// Component to render HTML content safely using dangerouslySetInnerHTML
const ContentView = ({ content }) => {
  return (
    <div className="content-view" dangerouslySetInnerHTML={{ __html: content }}>
      {/* This div will display HTML content passed as a prop using React's dangerouslySetInnerHTML to insert raw HTML */}
    </div>
  );
};

export default ContentView;
