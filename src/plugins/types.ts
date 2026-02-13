/**
 * # Frontend Plugin System Types
 *
 * Panel.go için frontend plugin sistemi tip tanımları.
 * Plugin'ler custom field'lar, widget'lar, route'lar ve page'ler ekleyebilir.
 *
 * ## Kullanım Örneği
 * ```typescript
 * import { Plugin } from '@/plugins/types';
 *
 * export const MyPlugin: Plugin = {
 *   name: 'my-plugin',
 *   version: '1.0.0',
 *   fields: [
 *     {
 *       type: 'my-custom-field',
 *       component: MyCustomField,
 *     },
 *   ],
 * };
 * ```
 */

import type { ComponentType } from 'react';

/**
 * # Plugin Interface
 *
 * Frontend plugin'lerin implement etmesi gereken interface.
 *
 * ## Özellikler
 * - name: Plugin adı (benzersiz olmalı)
 * - version: Semantic versioning (örn: "1.0.0")
 * - fields: Custom field component'leri
 * - routes: Custom route'lar
 * - widgets: Custom widget'lar
 * - pages: Custom page'ler
 *
 * ## Kullanım Örneği
 * ```typescript
 * export const AnalyticsPlugin: Plugin = {
 *   name: 'analytics-plugin',
 *   version: '1.0.0',
 *   fields: [
 *     {
 *       type: 'chart-field',
 *       component: ChartField,
 *     },
 *   ],
 *   widgets: [
 *     {
 *       type: 'analytics-widget',
 *       component: AnalyticsWidget,
 *     },
 *   ],
 * };
 * ```
 */
export interface Plugin {
  /** Plugin adı (benzersiz olmalı) */
  name: string;

  /** Semantic versioning (örn: "1.0.0") */
  version: string;

  /** Plugin açıklaması (opsiyonel) */
  description?: string;

  /** Plugin yazarı (opsiyonel) */
  author?: string;

  /** Custom field component'leri (opsiyonel) */
  fields?: PluginField[];

  /** Custom route'lar (opsiyonel) */
  routes?: PluginRoute[];

  /** Custom widget'lar (opsiyonel) */
  widgets?: PluginWidget[];

  /** Custom page'ler (opsiyonel) */
  pages?: PluginPage[];

  /** Plugin initialization fonksiyonu (opsiyonel) */
  init?: () => void | Promise<void>;

  /** Plugin cleanup fonksiyonu (opsiyonel) */
  cleanup?: () => void | Promise<void>;
}

/**
 * # PluginField Interface
 *
 * Custom field component tanımı.
 *
 * ## Kullanım Örneği
 * ```typescript
 * const chartField: PluginField = {
 *   type: 'chart-field',
 *   component: ChartField,
 * };
 * ```
 */
export interface PluginField {
  /** Field tipi (benzersiz olmalı) */
  type: string;

  /** React component */
  component: ComponentType<any>;
}

/**
 * # PluginRoute Interface
 *
 * Custom route tanımı.
 *
 * ## Kullanım Örneği
 * ```typescript
 * const analyticsRoute: PluginRoute = {
 *   path: '/analytics',
 *   component: AnalyticsPage,
 * };
 * ```
 */
export interface PluginRoute {
  /** Route path (örn: "/analytics") */
  path: string;

  /** React component */
  component: ComponentType<any>;

  /** Route exact match (opsiyonel) */
  exact?: boolean;
}

/**
 * # PluginWidget Interface
 *
 * Custom widget tanımı.
 *
 * ## Kullanım Örneği
 * ```typescript
 * const statsWidget: PluginWidget = {
 *   type: 'stats-widget',
 *   component: StatsWidget,
 * };
 * ```
 */
export interface PluginWidget {
  /** Widget tipi (benzersiz olmalı) */
  type: string;

  /** React component */
  component: ComponentType<any>;
}

/**
 * # PluginPage Interface
 *
 * Custom page tanımı.
 *
 * ## Kullanım Örneği
 * ```typescript
 * const reportsPage: PluginPage = {
 *   slug: 'reports',
 *   component: ReportsPage,
 *   title: 'Reports',
 *   icon: 'chart-bar',
 * };
 * ```
 */
export interface PluginPage {
  /** Page slug (benzersiz olmalı) */
  slug: string;

  /** React component */
  component: ComponentType<any>;

  /** Page başlığı */
  title: string;

  /** Page ikonu (opsiyonel) */
  icon?: string;

  /** Navigation'da görünür mü? (opsiyonel) */
  visible?: boolean;

  /** Navigation sırası (opsiyonel) */
  order?: number;
}

/**
 * # PluginMetadata Interface
 *
 * Plugin metadata bilgileri.
 */
export interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
}
