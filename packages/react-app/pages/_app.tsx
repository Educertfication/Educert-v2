import type { AppProps } from 'next/app';
import { useStore } from '../store/store';
import Header from '../components/Header';
import NotificationToast from '../components/NotificationToast';
import '../styles/globals.css';
import { PrivyProvider } from "@privy-io/react-auth";
import {base, polygon, arbitrum, mantle, celoAlfajores, celo} from 'viem/chains';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
        config={{
          defaultChain: celoAlfajores,
          embeddedWallets: {
            ethereum: {
              createOnLogin: 'users-without-wallets',
            }
          }
        }}
      >
      <Header />
      <main>
        <Component {...pageProps} />
      </main>
      <NotificationToast />
    </PrivyProvider>
    </div>
  );
} 