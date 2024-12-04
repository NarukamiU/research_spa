// client/src/App.tsx
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage/HomePage.tsx';
import LoginPage from './pages/LoginPage/LoginPage.tsx';
import ProjectPage from './pages/ProjectPage/ProjectPage.tsx';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary.tsx';
import RequireAuth from './components/common/RequireAuth.tsx';
import SocketHandler from './components/common/SocketHandler.tsx';
import { ImageCacheProvider } from './contexts/ImageCacheContext.tsx';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <SocketHandler />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <HomePage />
            </RequireAuth>
          }
        />
        <Route
          path="/project/:projectId"
          element={
            <RequireAuth>
              <ImageCacheProvider>
              <ProjectPage />
              </ImageCacheProvider>
            </RequireAuth>
          }
        />
        <Route path="*" element={<p>ページが見つかりません。</p>} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;