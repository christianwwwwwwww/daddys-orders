# Daddy's Orders 🍟🌯🥤

**Have you ever faced decision anxiety about what to eat? Don't you wish you could relinquish power, and submit to the loving will of a more powerful entity?**

_Obey Daddy Leo._ He knows what's best for you.

This is a totally private web application deployed on the **Aleo blockchain**, where Leo assigns you a randomized Taco Bell order — including a **main**, a **side**, and a **drink** — using zero-knowledge proofs.  
You must follow the order exactly. No substitutions. No negotiation.

## How it works

1. Click **Get Order**. A transaction is sent to the Aleo network to generate your randomized combo using private inputs. A private record is generated. Nobody needs to know about Daddy's orders except for *you* thanks to Aleo's zero-knowledge architecture.
2. The program fetches the record from the API and decrypts it using the powerful Provable SDK. The decrypted order is then displayed.
3. Go to Taco Bell and **order exactly what Daddy told you**.
4. Upload your receipt to prove you obeyed.
5. The app extracts the items using OCR and checks if there's a **100% match** with your assigned order.

> ✅ Obey = rewards (coming soon)  😛
> ❌ Disobey = no obedience tokens for you!! 😡

## Privacy + Verification

- Your assigned order is encrypted and stored as a **private Aleo record**.
- Only you (via your view key) can decrypt and view your order.
- Receipt verification is done off-chain with OCR via Google Cloud Vision, but all assigned order logic and proof of obedience are handled on-chain via Aleo.

## Built With

- 🧠 Leo
- 🌐 Provable's Aleo SDK using the create-leo-app Vanilla JavaScript template. Check it out: https://www.npmjs.com/package/create-leo-app
- 📸 Google Cloud Vision API
- 🧾 UberEats receipt parser
- 🪶 Vanilla JS frontend + Flask backend

## About the Project

This project was created by **Christian**, **Brent**, and **Mia** as part of the **Provable Q2 Offsite Hackathon in Toronto**.  
Our goal was to build something fun, irreverent, and actually private — using Aleo’s unique strengths in zero-knowledge computation.

The Leo program is **fully deployed on Aleo Mainnet**.


| Category                     | Description                                                                                  
|-----------------------------|----------------------------------------------------------------------------------------------
| **Idea & Problem Motivation** | Uses Aleo for something absurd but universal: order anxiety. Private, on-chain Taco Bell RNG.
| **Implementation & Functionality** | Fully working app with on-chain order assignment and receipt OCR verification logic.
| **Cryptography & Privacy Techniques** | Private record encryption, view key decryption, Aleo’s zk model used as intended.
| **Originality & Potential Impact** | No other zk app makes you prove to a blockchain that you ordered Nachos Supreme.

---

## Roadmap

- [ ] Implement Obedience Tokens (ZK-based loyalty rewards)
- [ ] Add support for other fast food chains
- [ ] Open up public submissions of receipt data
- [ ] Ship it to weird little corners of the internet

---

🛑 No substitutions.  
🧾 No receipts, no rewards.  
🦀 Obedience can be fun.

