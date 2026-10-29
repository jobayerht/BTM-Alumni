/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DataProvider } from './context/DataContext';
import { RouterProvider, useRouter } from './utils/router';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { OverviewPage } from './pages/OverviewPage';
import { BatchesPage } from './pages/BatchesPage';
import { BatchDirectoryPage } from './pages/BatchDirectoryPage';
import { AlumniProfilePage } from './pages/AlumniProfilePage';
import { InsightsPage } from './pages/InsightsPage';
import { MapPage } from './pages/MapPage';
import { AboutPage } from './pages/AboutPage';

const AppRoutes: React.FC = () => {
  const { path, navigate } = useRouter();

  // Strip query parameters when matching pathname
  const cleanPath = path.split('?')[0].replace(/\/+$/, '') || '/';

  let pageContent: React.ReactNode;

  if (cleanPath === '/') {
    pageContent = <HomePage />;
  } else if (cleanPath === '/overview') {
    pageContent = <OverviewPage />;
  } else if (cleanPath === '/batches') {
    pageContent = <BatchesPage />;
  } else if (cleanPath.startsWith('/batch/')) {
    const code = cleanPath.replace('/batch/', '').trim();
    pageContent = <BatchDirectoryPage key={`batch-${code}`} batchCode={code} />;
  } else if (cleanPath === '/alumni') {
    pageContent = <BatchDirectoryPage key={`global-alumni-${path}`} />;
  } else if (cleanPath.startsWith('/alumni/')) {
    const studentId = decodeURIComponent(cleanPath.replace('/alumni/', '').trim());
    pageContent = <AlumniProfilePage key={`alum-${studentId}`} studentId={studentId} />;
  } else if (cleanPath === '/insights') {
    pageContent = <InsightsPage />;
  } else if (cleanPath === '/map') {
    pageContent = <MapPage />;
  } else if (cleanPath === '/about') {
    pageContent = <AboutPage />;
  } else {
    // Invalid route fallback
    pageContent = (
      <div className="max-w-[1280px] mx-auto px-6 py-24 text-center space-y-5">
        <div className="text-xs font-mono uppercase tracking-wider text-[#663078] dark:text-[#B69AD8]">
          404 · Route Not Found
        </div>
        <h1 className="font-serif text-4xl font-semibold text-[#32143F] dark:text-[#F7F3F9]">
          Page Not Found in BTM Alumni Directory
        </h1>
        <p className="text-sm sm:text-base text-[#716A79] dark:text-[#B69AD8]/85 max-w-md mx-auto">
          The address <code className="font-mono">{cleanPath}</code> does not correspond to a valid batch
          directory or alumni page.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] bg-[#663078] hover:bg-[#32143F] rounded-lg transition-colors cursor-pointer"
          >
            Return to Homepage
          </button>
          <button
            type="button"
            onClick={() => navigate('/batch/17')}
            className="px-5 py-2.5 text-xs font-semibold text-[#32143F] dark:text-[#F7F3F9] border border-[#E8DFED] dark:border-[#352044] rounded-lg cursor-pointer"
          >
            Open BTM 17 Directory
          </button>
        </div>
      </div>
    );
  }

  return (
    <div key={cleanPath} className="animate-page-transition">
      {pageContent}
    </div>
  );
};

export default function App() {
  return (
    <DataProvider>
      <RouterProvider>
        <Layout>
          <AppRoutes />
        </Layout>
      </RouterProvider>
    </DataProvider>
  );
}
