/**
 * Web Bluetooth API Integration for Wearable Heart Rate Monitors
 * Uses standard Bluetooth GATT Heart Rate Service (0x180D) and Heart Rate Measurement (0x2A37)
 */

export interface BluetoothHeartRateListener {
  (bpm: number): void;
}

export class BluetoothHeartRateManager {
  private device: any = null;
  private characteristic: any = null;
  private listeners: BluetoothHeartRateListener[] = [];
  private simulationInterval: any = null;
  private isSimulating: boolean = false;

  public isBluetoothAvailable(): boolean {
    return typeof navigator !== 'undefined' && 'bluetooth' in navigator;
  }

  public subscribe(listener: BluetoothHeartRateListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(bpm: number) {
    this.listeners.forEach((fn) => fn(bpm));
  }

  public async connectRealDevice(): Promise<{ success: boolean; deviceName?: string; error?: string }> {
    if (!this.isBluetoothAvailable()) {
      return {
        success: false,
        error: 'Pelayar ini tidak menyokong Web Bluetooth API. Anda boleh menggunakan mod simulasi peranti pintar.',
      };
    }

    try {
      // @ts-ignore
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service'],
      });

      const server = await this.device.gatt.connect();
      const service = await server.getPrimaryService('heart_rate');
      this.characteristic = await service.getCharacteristic('heart_rate_measurement');

      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', (event: any) => {
        const value = event.target.value;
        const flags = value.getUint8(0);
        let bpm = 0;
        if ((flags & 0x01) === 0) {
          // 8-bit BPM
          bpm = value.getUint8(1);
        } else {
          // 16-bit BPM
          bpm = value.getUint16(1, true);
        }
        if (bpm > 0) {
          this.notify(bpm);
        }
      });

      return { success: true, deviceName: this.device.name || 'Peranti Nadi Bluetooth' };
    } catch (err: any) {
      console.warn('Bluetooth connection error or cancelled:', err);
      return { success: false, error: err.message || 'Sambungan Bluetooth dibatalkan.' };
    }
  }

  public disconnect() {
    if (this.device && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.device = null;
    this.characteristic = null;
    this.stopSimulation();
  }

  // Simulation mode for testing wearable pulse stream
  public startSimulation(baseRate: number = 72, anomalyChance: boolean = false) {
    this.stopSimulation();
    this.isSimulating = true;

    let currentRate = baseRate;
    this.simulationInterval = setInterval(() => {
      // Small random natural fluctuation (-2 to +2 bpm)
      const change = Math.floor(Math.random() * 5) - 2;
      currentRate = Math.max(50, Math.min(130, currentRate + change));

      // If anomalyChance requested, occasionally spike or dip for testing emergency warning
      if (anomalyChance && Math.random() < 0.15) {
        currentRate = Math.random() > 0.5 ? 108 : 48;
      }

      this.notify(currentRate);
    }, 1500);
  }

  public stopSimulation() {
    if (this.simulationInterval) {
      clearInterval(this.simulationInterval);
      this.simulationInterval = null;
    }
    this.isSimulating = false;
  }

  public getIsSimulating(): boolean {
    return this.isSimulating;
  }
}

export const bluetoothHRManager = new BluetoothHeartRateManager();
