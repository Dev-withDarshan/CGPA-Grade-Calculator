import React, { createContext, useContext, useState } from 'react';

const DashboardTabContext = createContext();

export function DashboardTabProvider({ children }) {
  const [activeTab, setActiveTab] = useState('semester');
  const [onSave, setOnSave] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');

  return (
    <DashboardTabContext.Provider value={{ activeTab, setActiveTab, onSave, setOnSave, saveStatus, setSaveStatus }}>
      {children}
    </DashboardTabContext.Provider>
  );
}

export function useDashboardTab() {
  return useContext(DashboardTabContext);
}
