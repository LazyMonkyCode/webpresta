import React, { useState } from 'react';

function Tabs({ tabs = [], defaultTab = '', className = '' }) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  if (!tabs || tabs.length === 0) return null;

  return (
    <div className={`tabs-wrapper ${className}`}>
      <div className="flex border-b border-gray-200 dark:border-gray-700 space-x-4 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-sm font-medium rounded-t ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 dark:text-blue-400'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}

export default Tabs;
