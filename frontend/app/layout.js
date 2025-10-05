import './globals.css'; // Global styles
import Header from '../components/common/Header'; // 👈 Import the new Header component
import { Toaster } from 'react-hot-toast';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* The Header component is now included here */}
        <Header /> 
        
        <main style={{ padding: '20px' }}>
          {children}
                  <Toaster position="top-right" />

        </main>
      </body>
    </html>
  );
}