import {
  Account,
  ProgramManager,
  initThreadPool,
  AleoKeyProvider,
  AleoNetworkClient,
  NetworkRecordProvider,
} from "@provablehq/sdk/mainnet.js";

await initThreadPool();

const PROGRAM_ID = "daddys_orders_v1.aleo";
const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY;
const VIEW_KEY = import.meta.env.VITE_VIEW_KEY;
const NETWORK_URL = "https://api.explorer.provable.com/v1";

// Executes a transition on-chain
async function executeOnChain(programName, functionName, inputs, fee = 1.0) {
  const keyProvider = new AleoKeyProvider();
  keyProvider.useCache(true);

  const networkClient = new AleoNetworkClient(NETWORK_URL, "mainnet");
  const account = new Account({ privateKey: PRIVATE_KEY });
  const recordProvider = new NetworkRecordProvider(account, networkClient);

  const programManager = new ProgramManager(NETWORK_URL, keyProvider, recordProvider);
  programManager.setAccount(account);
    console.log("📦 Executing:");
  console.log("   programName:", programName);
  console.log("   functionName:", functionName);
  console.log("   inputs:", inputs);

  try {
    const response = await programManager.execute({
      programName,
      functionName,
      inputs,
      fee,
    });
    return response;
  } catch (err) {
    console.error("❌ Execution failed:", err);
    throw new Error(`Execution failed: ${err.message}`);
  }
}

async function decryptRecord(record) {
  const keyProvider = new AleoKeyProvider();
  keyProvider.useCache(true);

  const account = new Account({ privateKey: PRIVATE_KEY });

  const recordCiphertext = RecordCiphertext.fromString(recordValue);
  const recordPlaintext = recordCiphertext.decrypt(account.viewKey());

  return recordPlaintext;
}

onmessage = async function (e) {
  const { action, payload } = e.data;

  try {
    if (action === "get_order") {
      const { address, salt } = payload;
      const result = await executeOnChain(PROGRAM_ID, "get_order", [
        address,
        `${salt}u64`,
      ]);
      postMessage({ success: true, action, result });

    } else if (action === "obey_order") {
      const { address, salt, main, side, drink } = payload;
      const result = await executeOnChain(PROGRAM_ID, "obey_order", [
        address,
        `${salt}u64`,
        `${main}u8`,
        `${side}u8`,
        `${drink}u8`,
      ]);
      postMessage({ success: true, action, result });

    } else if (action === "decrypt_order_record") {
      const { Record } = payload;

      const recordValue = payload.record;
      console.log("Decrypting record:", recordValue);

      const record = Record.fromString(recordValue);
      const recordPlaintext = record.decrypt(account.viewKey());

      // Send the decrypted record as JSON string back to main
      postMessage({ success: true, action, result: JSON.stringify(recordPlaintext.toJSON()) });
    }

  } catch (err) {
postMessage({ success: false, action, error: err.message });
  }
};
