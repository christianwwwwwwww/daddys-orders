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
      const { Record, ViewKey, Group } = await import("@provablehq/sdk/mainnet.js");

      // TODO remove harcoded values
      const recordCiphertext = "record1qyqsqvfrvs7zjnrdfrrfqaerea2qns5q7rpxema6p7ftwd9ajm9cd6gxqvzx6ctfdc3sqqspqrd0vkvu4e0lujx2yvtsk4xysmsus0f72sm9lcmlgm6yr66dt3dsyprnd9jx2gcqqgqsp59mv5qfv6l5h32xfgut0kmgvkqtsjrmdk8xxfmmcja44mtjygcwq4j8y6twdv3sqqspqqmqut2phmzkkcytl30qlr768fz24u9723ydx9adk7geg4q73mwqmw7pa22tuehd07qy6vxdrt364cakp7xnhqnlspgc87xnr37nlzq3fddcq7";
      const tpk = "5782834354161158878558847504544241862734057589606740307562865459981079972150group";

      const record = Record.fromString(recordCiphertext);
      const decrypted = record.decrypt(
        ViewKey.from_string(VIEW_KEY),
        Group.fromString(tpk)
      );

      // Send the decrypted record as JSON string back to main
      postMessage({ success: true, action, result: JSON.stringify(decrypted.toJSON()) });
    }

  } catch (err) {
    postMessage({ success: false, action: error?.action || "unknown", error: err.message });
  }
};
