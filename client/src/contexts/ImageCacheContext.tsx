// client/src/contexts/ImageCacheContext.tsx
import React, { createContext, useState, ReactNode } from 'react';

interface ImageCacheContextProps {
  trainingImages: { [label: string]: string[] };
  verifyImages: { [label: string]: string[] };
  setTrainingImages: React.Dispatch<React.SetStateAction<{ [label: string]: string[] }>>;
  setVerifyImages: React.Dispatch<React.SetStateAction<{ [label: string]: string[] }>>;
}

export const ImageCacheContext = createContext<ImageCacheContextProps | undefined>(undefined);

export const ImageCacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [trainingImages, setTrainingImages] = useState<{ [label: string]: string[] }>({});
  const [verifyImages, setVerifyImages] = useState<{ [label: string]: string[] }>({});

  return (
    <ImageCacheContext.Provider value={{ trainingImages, verifyImages, setTrainingImages, setVerifyImages }}>
      {children}
    </ImageCacheContext.Provider>
  );
};