/**
 * # Plugin Initialization
 *
 * Plugin'leri initialize eder ve field'larını fieldRegistry'ye kaydeder.
 * App başlatılmadan önce çağrılmalıdır.
 *
 * ## Kullanım
 * ```typescript
 * import { initializePlugins } from '@/plugins/initialize';
 *
 * // App render'dan önce
 * await initializePlugins();
 * ```
 */

import { pluginRegistry } from './PluginRegistry';
import { fieldRegistry } from '@/components/forms/FieldRegistry';

/**
 * Plugin'leri initialize et ve field'larını kaydet
 *
 * @returns Promise<void>
 * @throws Error - Plugin initialization başarısız olursa
 */
export async function initializePlugins(): Promise<void> {
  console.log('[Plugin System] Initializing plugins...');

  try {
    // 1. Initialize all plugins (call init() hooks)
    await pluginRegistry.initialize();

    // 2. Get all plugin fields
    const pluginFields = pluginRegistry.getFields();

    // 3. Register plugin fields to fieldRegistry
    let registeredCount = 0;
    let skippedCount = 0;

    for (const [type, component] of pluginFields.entries()) {
      // Check for conflicts with core fields
      if (fieldRegistry.has(type)) {
        console.warn(
          `[Plugin System] Field type '${type}' conflicts with core field. Skipping.`
        );
        skippedCount++;
        continue;
      }

      // Register plugin field
      fieldRegistry.register(type, component);
      registeredCount++;
    }

    console.log(
      `[Plugin System] Registered ${registeredCount} plugin fields, skipped ${skippedCount} conflicts.`
    );
  } catch (error) {
    console.error('[Plugin System] Failed to initialize plugins:', error);
    throw error;
  }
}
