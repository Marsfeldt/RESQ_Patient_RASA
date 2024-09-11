import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userUUID, setUserUUID] = useState(null);

  return (
    <UserContext.Provider value={{ userUUID, setUserUUID }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);

export default UserContext;
