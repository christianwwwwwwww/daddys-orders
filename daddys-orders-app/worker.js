import {
  Account,
  ProgramManager,
  initThreadPool,
  AleoKeyProvider,
  AleoNetworkClient,
  NetworkRecordProvider,
} from "@provablehq/sdk";

await initThreadPool();

const PROGRAM_ID = "daddys_orders.aleo";
const PRIVATE_KEY = import.meta.env.VITE_PRIVATE_KEY;
const NETWORK_URL = "https://api.explorer.provable.com/v1";

// Executes a transition on-chain
async function executeOnChain(programName, functionName, inputs, fee = 1.0) {
  const keyProvider = new AleoKeyProvider();
  keyProvider.useCache(true);

  const networkClient = new AleoNetworkClient("https://api.explorer.provable.com/v1", "testnet");
  const account       = new Account({ privateKey: import.meta.env.VITE_PRIVATE_KEY });
  const recordProvider = new NetworkRecordProvider(account, networkClient);

  const programManager = new ProgramManager(
    "https://api.explorer.provable.com/v1",
    keyProvider,
    recordProvider
  );
  programManager.setAccount(account);

  console.log("📦 Executing:");
  console.log("   programName:", programName);
  console.log("   functionName:", functionName);
  console.log("   inputs:", inputs);

  try {
    const response = await programManager.execute({
      programName,      // string
      functionName,     // string
      inputs,           // string[]
      fee,              // number
      // feeRecord?       // optional string
      // keySearchParams? // optional object
      // additionalOptions? // optional object
    });
    return response;
  } catch (err) {
    console.error("❌ Execution failed:", err);
    throw new Error(`Execution failed: ${err.message}`);
  }
}



onmessage = async function (e) {
  const { action, payload } = e.data;

  try {
    if (action === "get_order") {
      const { address, salt } = payload;
      const result = await executeOnChain(
        PROGRAM_ID,
        "get_order",
        [
          address,
          `${salt}u64`,
        ]
      );
      postMessage({ success: true, action, result });
    
    } else if (action === "obey_order") {
      const { address, salt, main, side, drink } = payload;
      const result = await executeOnChain(
        PROGRAM_ID,
        "obey_order",
        [
          address,
          `${salt}u64`,
          `${main}u8`,
          `${side}u8`,
          `${drink}u8`,
        ]
      );
      postMessage({ success: true, action, result });
    }    

  } catch (err) {
    postMessage({ success: false, action, error: err.message });
  }
};
