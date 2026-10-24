"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();

  const injectedConnector = connectors.find(
    (connector) => connector.id === "injected",
  );

  if (isConnected && address) {
    return (
      <div>
        <span>
          Terhubung: {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <button type="button" onClick={() => disconnect()}>
          Putuskan wallet
        </button>
      </div>
    );
  }

  if (!injectedConnector) {
    return <p>Wallet browser seperti MetaMask tidak ditemukan.</p>;
  }

  return (
    <div>
      <button
        type="button"
        disabled={isPending}
        onClick={() => connect({ connector: injectedConnector })}
      >
        {isPending ? "Menghubungkan..." : "Hubungkan wallet"}
      </button>
      {error && <p role="alert">{error.message}</p>}
    </div>
  );
}