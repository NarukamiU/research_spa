// client/src/components/SocketHandler.tsx

import React from 'react';
import useSocket from '../../hooks/useSocket.ts';

const SocketHandler: React.FC = () => {
  useSocket();
  return null;
};

export default SocketHandler;