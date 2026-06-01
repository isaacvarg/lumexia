import { PRINT_DIRECTION, DEFAULT_QUANTITY } from "./niimbotConfig";

// niimbluelib is dynamically imported so SSR never touches navigator.bluetooth.
// client is kept as a module singleton so repeated prints reuse the connection.
type NiimbotClient = {
  connect: () => Promise<unknown>;
  disconnect: () => Promise<void>;
  isConnected: () => boolean;
  getPrintTaskType: () => string | undefined;
  abstraction: {
    newPrintTask: (
      name: string,
      opts: {
        totalPages: number;
        statusPollIntervalMs: number;
        statusTimeoutMs: number;
      },
    ) => {
      printInit: () => Promise<void>;
      printPage: (image: unknown, quantity?: number) => Promise<void>;
      waitForPageFinished: () => Promise<void>;
      waitForFinished: () => Promise<void>;
      printEnd: () => Promise<boolean>;
    };
  };
};

let client: NiimbotClient | null = null;

export const isWebBluetoothAvailable = (): boolean =>
  typeof navigator !== "undefined" && !!(navigator as Navigator).bluetooth;

const ensureConnected = async (): Promise<NiimbotClient> => {
  const { NiimbotBluetoothClient } = await import("@mmote/niimbluelib");
  if (!client) {
    client = new NiimbotBluetoothClient() as unknown as NiimbotClient;
  }
  if (!client.isConnected()) {
    // First call shows the browser's Bluetooth device chooser.
    await client.connect();
  }
  return client;
};

export const printCanvas = async (
  canvas: HTMLCanvasElement,
  quantity: number = DEFAULT_QUANTITY,
): Promise<void> => {
  if (!isWebBluetoothAvailable()) {
    throw new Error(
      "Web Bluetooth is unavailable. Open this page on the printer's computer in Chrome/Edge and enable the insecure-origin flag for this site.",
    );
  }

  const { ImageEncoder } = await import("@mmote/niimbluelib");

  let active: NiimbotClient;
  try {
    active = await ensureConnected();
  } catch (err) {
    // A stale/half-open connection can wedge the singleton — reset and surface.
    client = null;
    throw err;
  }

  const encoded = ImageEncoder.encodeCanvas(canvas, PRINT_DIRECTION);
  const taskName = active.getPrintTaskType() ?? "B1";
  const task = active.abstraction.newPrintTask(taskName, {
    totalPages: quantity,
    statusPollIntervalMs: 100,
    statusTimeoutMs: 8000,
  });

  try {
    await task.printInit();
    await task.printPage(encoded, quantity);
    await task.waitForPageFinished();
    await task.waitForFinished();
    await task.printEnd();
  } catch (err) {
    // Drop the client so the next attempt re-establishes a clean connection.
    try {
      await active.disconnect();
    } catch {
      /* ignore */
    }
    client = null;
    throw err;
  }
};
