/**
 * Configuration management for Firebase Functions
 * Reads from Firebase Functions Config (functions.config())
 */

import * as functions from 'firebase-functions';

interface RazorpayConfig {
  key_id: string;
  key_secret: string;
  webhook_secret: string;
}

interface EmailConfig {
  sendgrid_key?: string;
}

interface TypesenseConfig {
  api_key?: string;
  host?: string;
  port?: string;
  protocol?: string;
}

function getConfig(): {
  razorpay: RazorpayConfig;
  email: EmailConfig;
  typesense: TypesenseConfig;
} {
  const config = functions.config();
  
  const razorpay: RazorpayConfig = {
    key_id: config.razorpay?.key_id || '',
    key_secret: config.razorpay?.key_secret || '',
    webhook_secret: config.razorpay?.webhook_secret || '',
  };
  
  const email: EmailConfig = {
    sendgrid_key: config.email?.sendgrid_key,
  };
  
  const typesense: TypesenseConfig = {
    api_key: config.typesense?.api_key,
    host: config.typesense?.host,
    port: config.typesense?.port || '8108',
    protocol: config.typesense?.protocol || 'http',
  };
  
  // Validate required config
  const missing: string[] = [];
  if (!razorpay.key_id) missing.push('razorpay.key_id');
  if (!razorpay.key_secret) missing.push('razorpay.key_secret');
  // webhook_secret is optional (not needed for test mode)
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required Firebase Functions config: ${missing.join(', ')}\n` +
      `Set them with: firebase functions:config:set ${missing.map(k => `${k.replace('.', ':')}="VALUE"`).join(' ')}`
    );
  }
  
  return { razorpay, email, typesense };
}

// Lazy-load config to avoid errors during module initialization
let _config: ReturnType<typeof getConfig> | null = null;

export function getCONFIG() {
  if (!_config) {
    try {
      _config = getConfig();
    } catch (error) {
      console.warn('Config not fully initialized:', error);
      // Return partial config for development
      const functions = require('firebase-functions');
      const config = functions.config();
      _config = {
        razorpay: {
          key_id: config.razorpay?.key_id || '',
          key_secret: config.razorpay?.key_secret || '',
          webhook_secret: config.razorpay?.webhook_secret || '',
        },
        email: {
          sendgrid_key: config.email?.sendgrid_key,
        },
        typesense: {
          api_key: config.typesense?.api_key,
          host: config.typesense?.host,
          port: config.typesense?.port || '8108',
          protocol: config.typesense?.protocol || 'http',
        },
      };
    }
  }
  return _config;
}

export const CONFIG = new Proxy({} as ReturnType<typeof getConfig>, {
  get(_target, prop) {
    return getCONFIG()[prop as keyof ReturnType<typeof getConfig>];
  },
});

// Helper to check if optional services are configured
export function isEmailConfigured(): boolean {
  return !!getCONFIG().email.sendgrid_key;
}

export function isTypesenseConfigured(): boolean {
  const ts = getCONFIG().typesense;
  return !!(
    ts.api_key &&
    ts.host &&
    ts.port &&
    ts.protocol
  );
}

