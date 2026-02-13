/**
 * # Plugin Registry Index
 *
 * Tüm plugin'leri import edip register eder.
 * Yeni plugin eklemek için buraya import ve register çağrısı ekleyin.
 *
 * ## Kullanım
 * ```typescript
 * // Yeni plugin eklemek için:
 * import { MyPlugin } from '../plugins/my-plugin/frontend';
 * pluginRegistry.register(MyPlugin);
 * ```
 */

import { pluginRegistry } from './PluginRegistry';

// Import all plugins
import { ExamplePlugin } from './example-plugin/frontend';

// Register all plugins
pluginRegistry.register(ExamplePlugin);

// Export for use in other files
export { pluginRegistry };
