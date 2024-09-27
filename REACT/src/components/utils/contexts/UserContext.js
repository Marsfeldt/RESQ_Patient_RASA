import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userUUID, setUserUUID] = useState(null);

  useEffect(() => {
    console.log('UserContext initialized or updated:', { userUUID });
  }, [userUUID]);

  return (
    <UserContext.Provider value={{ userUUID, setUserUUID }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);