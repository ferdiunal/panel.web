/**
 * # Frontend Plugin Registry
 *
 * Frontend plugin'leri kaydetmek ve yönetmek için singleton registry.
 * Plugin'ler otomatik olarak kaydedilir ve field/widget/route registry'lerine eklenir.
 *
 * ## Kullanım Örneği
 * ```typescript
 * import { pluginRegistry } from '@/plugins/PluginRegistry';
 * import { MyPlugin } from './MyPlugin';
 *
 * // Plugin kaydı
 * pluginRegistry.register(MyPlugin);
 *
 * // Plugin listesi
 * const plugins = pluginRegistry.getAll();
 *
 * // Plugin arama
 * const plugin = pluginRegistry.get('my-plugin');
 * ```
 */

import type { Plugin, PluginMetadata } from './types';

/**
 * # PluginRegistry Class
 *
 * Thread-safe plugin registry. Tüm kayıtlı plugin'leri tutar.
 *
 * ## Özellikler
 * - Singleton pattern
 * - Auto-registration desteği
 * - Field/widget/route registry entegrasyonu
 */
class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private initialized = false;

  /**
   * Plugin kaydı
   *
   * @param plugin - Kaydedilecek plugin
   * @throws Error - Aynı isimde plugin zaten kayıtlıysa
   */
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin '${plugin.name}' is already registered. Skipping.`);
      return;
    }

    this.plugins.set(plugin.name, plugin);
    console.log(`Plugin '${plugin.name}' registered successfully.`);
  }

  /**
   * Plugin'i ismine göre al
   *
   * @param name - Plugin adı
   * @returns Plugin veya undefined
   */
  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Tüm plugin'leri al
   *
   * @returns Plugin array'i
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Plugin sayısı
   *
   * @returns Kayıtlı plugin sayısı
   */
  count(): number {
    return this.plugins.size;
  }

  /**
   * Plugin var mı kontrol et
   *
   * @param name - Plugin adı
   * @returns Plugin kayıtlıysa true
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Tüm plugin'leri temizle (test için)
   */
  clear(): void {
    this.plugins.clear();
    this.initialized = false;
  }

  /**
   * Plugin metadata listesi
   *
   * @returns Metadata array'i
   */
  getMetadata(): PluginMetadata[] {
    return this.getAll().map((plugin) => ({
      name: plugin.name,
      version: plugin.version,
      description: plugin.description,
      author: plugin.author,
    }));
  }

  /**
   * Tüm plugin'leri initialize et
   *
   * Plugin'lerin init() fonksiyonlarını çağırır.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.warn('Plugins already initialized. Skipping.');
      return;
    }

    console.log(`Initializing ${this.count()} plugins...`);

    for (const plugin of this.getAll()) {
      try {
        if (plugin.init) {
          await plugin.init();
          console.log(`Plugin '${plugin.name}' initialized.`);
        }
      } catch (error) {
        console.error(`Failed to initialize plugin '${plugin.name}':`, error);
      }
    }

    this.initialized = true;
    console.log('All plugins initialized.');
  }

  /**
   * Tüm plugin'leri cleanup et
   *
   * Plugin'lerin cleanup() fonksiyonlarını çağırır.
   */
  async cleanup(): Promise<void> {
    console.log(`Cleaning up ${this.count()} plugins...`);

    for (const plugin of this.getAll()) {
      try {
        if (plugin.cleanup) {
          await plugin.cleanup();
          console.log(`Plugin '${plugin.name}' cleaned up.`);
        }
      } catch (error) {
        console.error(`Failed to cleanup plugin '${plugin.name}':`, error);
      }
    }

    this.initialized = false;
    console.log('All plugins cleaned up.');
  }

  /**
   * Plugin'lerin field'larını al
   *
   * View-specific field support ve auto-generate form variant desteği ile.
   *
   * @returns Field map'i (type -> component)
   */
  getFields(): Map<string, React.ComponentType<any>> {
    const fields = new Map<string, React.ComponentType<any>>();

    for (const plugin of this.getAll()) {
      if (plugin.fields) {
        for (const field of plugin.fields) {
          // Check for conflicts
          if (fields.has(field.type)) {
            console.warn(
              `Field type '${field.type}' from plugin '${plugin.name}' is already registered. Skipping.`
            );
            continue;
          }

          // Register field
          fields.set(field.type, field.component);

          // Auto-generate form variant if not provided
          // Eğer field type'ı -form, -index, -detail ile bitmiyorsa, form variant'ı otomatik oluştur
          if (
            !field.type.endsWith('-form') &&
            !field.type.endsWith('-index') &&
            !field.type.endsWith('-detail')
          ) {
            const formType = `${field.type}-form`;
            if (!fields.has(formType)) {
              fields.set(formType, field.component);
            }
          }
        }
      }
    }

    return fields;
  }

  /**
   * Plugin'lerin widget'larını al
   *
   * @returns Widget map'i (type -> component)
   */
  getWidgets(): Map<string, React.ComponentType<any>> {
    const widgets = new Map<string, React.ComponentType<any>>();

    for (const plugin of this.getAll()) {
      if (plugin.widgets) {
        for (const widget of plugin.widgets) {
          if (widgets.has(widget.type)) {
            console.warn(
              `Widget type '${widget.type}' from plugin '${plugin.name}' is already registered. Skipping.`
            );
            continue;
          }
          widgets.set(widget.type, widget.component);
        }
      }
    }

    return widgets;
  }

  /**
   * Plugin'lerin route'larını al
   *
   * @returns Route array'i
   */
  getRoutes(): Array<{
    path: string;
    component: React.ComponentType<any>;
    exact?: boolean;
  }> {
    const routes: Array<{
      path: string;
      component: React.ComponentType<any>;
      exact?: boolean;
    }> = [];

    for (const plugin of this.getAll()) {
      if (plugin.routes) {
        routes.push(...plugin.routes);
      }
    }

    return routes;
  }

  /**
   * Plugin'lerin page'lerini al
   *
   * @returns Page array'i
   */
  getPages(): Array<{
    slug: string;
    component: React.ComponentType<any>;
    title: string;
    icon?: string;
    visible?: boolean;
    order?: number;
  }> {
    const pages: Array<{
      slug: string;
      component: React.ComponentType<any>;
      title: string;
      icon?: string;
      visible?: boolean;
      order?: number;
    }> = [];

    for (const plugin of this.getAll()) {
      if (plugin.pages) {
        pages.push(...plugin.pages);
      }
    }

    return pages;
  }
}

// Singleton instance
export const pluginRegistry = new PluginRegistry();

// Export for testing
export { PluginRegistry };
