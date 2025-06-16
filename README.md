# Daddy's Orders 🌯🦁🥤

PROVABLE 2K25 HACKATHON "BEST OVERALL" WINNER 🥇

**Have you ever faced decision anxiety about what to eat? Don't you wish you could relinquish power and submit to the loving will of a more powerful entity?**

_Obey Daddy Leo._ He knows what's best for you.

This is a totally private web application deployed on the **Aleo blockchain**, where Leo assigns you a randomized Taco Bell order — including a **main**, a **side**, and a **drink** — using zero-knowledge proofs.  
You must follow the order exactly. No substitutions. No negotiation.

Check out the program on Aleo Mainnet with Provable's Explorer:  
👉 [daddys_orders_v1.aleo](https://beta.explorer.provable.com/program/daddys_orders_v1.aleo)

---

## How it works

1. Click **Get Order**. A transaction is sent to the Aleo network to generate your randomized combo using private inputs. The randomness is generated on-chain using your private salt input and the hash.bhp256 function, producing verifiable randomness. A private record is generated. Nobody needs to know about Daddy's orders except *you*, thanks to Aleo's zero-knowledge architecture.
2. The program receives a transaction ID and uses it to fetch the record ciphertext from the API, which is then decrypted using the Provable SDK's record decryption method. The decrypted order is then displayed.
3. Go to Taco Bell and **order exactly what Daddy told you**.
4. Upload your receipt to prove you obeyed.
5. The app extracts the items using OCR and checks for a **100% match** with your assigned order.

> ✅ Obey = rewards (coming soon) 😛  
> ❌ Disobey = no obedience tokens for you!! 😡

---

## Privacy + Verification

- Your assigned order is encrypted and stored as a **private Aleo record**.
- Only you (via your view key) can decrypt and view your order.
- Receipt verification is done off-chain via OCR using Google Cloud Vision, but all order logic and proof of obedience are handled on-chain via Aleo.

---

## Built With

- 🧠 Leo programming language  
- 🌐 Provable's Aleo SDK, using the create-leo-app Vanilla JavaScript template — [create-leo-app on npm](https://www.npmjs.com/package/create-leo-app)  
- 📸 Google Cloud Vision API  
- 🧾 UberEats receipt parser  
- 🪶 Vanilla JS frontend + Flask backend

---

## About the Project

This project was created by **Christian**, **Brent**, and **Mia** as part of the **Provable Q2 Offsite Hackathon in Toronto**.  
Our goal was to build something fun, irreverent, and actually private to demonstrate Aleo’s unique strengths in zero-knowledge computation.

The Leo program is **fully deployed on Aleo Mainnet**.

---

| Category                        | Description                                                                                       |
|--------------------------------|---------------------------------------------------------------------------------------------------|
| **Idea & Problem Motivation**   | Uses Aleo for something absurd but universal: order anxiety. Private, on-chain Taco Bell RNG.     |
| **Implementation & Functionality** | Fully working app with on-chain order assignment and receipt OCR verification logic.              |
| **Cryptography & Privacy Techniques** | Private record encryption, view key decryption, Aleo’s zk model used as intended.             |
| **Originality & Potential Impact** | No other zk app makes you prove to a blockchain that you ordered Nachos Supreme.                |

---

🛑 No substitutions.  
🧾 No receipts, no rewards.  
🦀 Obedience can be fun.


## Run Locally

### 1. Start the Flask Backend

```bash
cd flask-server
pip3 install -r requirements.txt
gcloud auth application-default login
python3 main.py
```

Make sure you're authenticated with Google Cloud to use the Vision API.  
If you don’t have the Google CLI installed, follow instructions [here](https://cloud.google.com/sdk/docs/install).

---

### 2. Start the Frontend

In a new terminal window:

```bash
cd daddys-orders-app
npm install
npm run build
npm run dev
```

By default, the frontend runs at [http://localhost:5173](http://localhost:5173)  
and expects the backend at [http://localhost:5000](http://localhost:5000).
