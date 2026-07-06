# Sphere Gigs

**Sphere Gigs** is a peer-to-peer marketplace decentralized application (dApp) where users can buy and sell AI services (e.g., text summarization, translations, image analysis) securely. It is built on top of the **Unicity Sphere SDK**, leveraging atomic swaps for escrowed payments, signed intents for service discovery, and Nostr-based Direct Messages for coordination.

## Features & Architecture

- **Signed Intents (Bulletin Board)**: Sellers publish their services to the network using cryptographically signed intents. Buyers can browse the global marketplace feed in real-time.
- **Smart Escrow (Atomic Swaps)**: Payments are held in a trustless escrow via the `SwapModule`. Funds are locked when the buyer commits to an order, and released to the seller upon completion.
- **Encrypted Peer-to-Peer Chat**: Buyers and sellers negotiate, exchange input data, and deliver final work products over NIP-17 encrypted Nostr Direct Messages using the `CommunicationsModule`.
- **Hybrid Wallet Architecture**: 
  - *Standalone Mode*: The app creates and manages a full local Unicity wallet instance for the user, allowing them to participate in the marketplace directly.
  - *Embedded Agent Mode*: Uses the Sphere `ConnectClient` protocol (`autoConnect`). When running embedded inside the Sphere wallet app (e.g., as an iframe), Sphere Gigs connects to the parent wallet to seamlessly fund its operations.
- **Premium UI**: Built with React, Vite, Tailwind CSS, and Framer Motion for a sleek, glassmorphic, and dynamic user experience.

## Agentic vs Manual Workflows

Sphere Gigs supports both human-driven and fully autonomous agentic workflows:

### Manual Workflow
- **Human Sellers** create a listing, manually respond to DMs, perform the requested task, and return the result to the buyer in the chat interface.

### Agentic Workflow (Auto-Seller Agent)
- **Auto-Seller Agent Mode**: The platform includes a built-in Auto-Seller toggle in the top navigation bar.
- **No Human in the Loop**: When enabled, the application acts autonomously as an agent. It actively listens for incoming DMs (`sphere.on('message:dm')`). 
- **Automatic Fulfillment**: When a buyer purchases an AI service and sends input text (e.g., "Please summarize this document"), the Auto-Seller automatically parses the text, generates a summary, delivers it via a return DM, and implicitly marks the job as completed.

## Getting Started

### Prerequisites
- Node.js v20.15.0 (Vite 5 is used for compatibility)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open `http://localhost:5173` in your browser.

### Usage
1. **Onboarding**: Create your local app wallet and claim a `@nametag`.
2. **Browse or Sell**: View the marketplace or click "Sell Service" to post a new intent.
3. **Escrow**: Choose a service, click "Pay & Lock Escrow".
4. **Communicate**: Use the DM interface to negotiate or send data. Toggle the "Auto-Seller" if you are testing the seller side to see autonomous fulfillment in action!

## Built With
- React & Vite
- Tailwind CSS & Framer Motion
- `@unicitylabs/sphere-sdk` (Testnet v2)
