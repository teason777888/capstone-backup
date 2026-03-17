import { createContext, useContext, useMemo, useState } from 'react';

const GroupContext = createContext(null);

export function GroupProvider({ children }) {
  const [group, setGroup] = useState({
    name: 'Riverside Recovery Committee',
    inviteCode: 'X7A9BQ',
    location: 'Northern Rivers, NSW',
    disasterType: 'Flood',
    members: 18,
    responses: 12,
  });

  const updateGroup = (nextGroup) => {
    setGroup((prev) => ({ ...prev, ...nextGroup }));
  };

  const value = useMemo(() => ({ group, updateGroup }), [group]);
  return <GroupContext.Provider value={value}>{children}</GroupContext.Provider>;
}

export function useGroup() {
  const context = useContext(GroupContext);
  if (!context) throw new Error('useGroup must be used within GroupProvider');
  return context;
}
