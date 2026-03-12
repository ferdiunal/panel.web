/**
 * HTML Sanitization Utility
 *
 * DOMPurify kullanarak HTML içeriğini güvenli hale getirir.
 * XSS saldırılarını önlemek için kullanılır.
 */
import DOMPurify from 'dompurify';

/**
 * HTML içeriğini sanitize eder
 *
 * @param html - Sanitize edilecek HTML string
 * @returns Güvenli HTML string
 *
 * @example
 * ```typescript
 * const safeHtml = sanitizeHtml('<p>Hello <script>alert("xss")</script></p>');
 * // Sonuç: '<p>Hello </p>'
 * ```
 */
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre', 'span', 'div'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
};
