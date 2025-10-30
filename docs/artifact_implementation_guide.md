# Implementing Artifact Feature with React Runner
## A Comprehensive Guide Based on Claude Artifacts & ChatGPT Canvas

> **Last Updated**: October 2025  
> **Tech Stack**: Next.js, React Runner, PostgreSQL, TypeScript

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites & Dependencies](#prerequisites--dependencies)
3. [Database Schema Design](#database-schema-design)
4. [Separate Domain Setup](#separate-domain-setup)
5. [React Runner Implementation](#react-runner-implementation)
6. [Security Implementation](#security-implementation)
7. [Cross-Window Communication](#cross-window-communication)
8. [Frontend Components](#frontend-components)
9. [Backend API Routes](#backend-api-routes)
10. [AI Integration & Triggering Logic](#ai-integration--triggering-logic)
11. [Best Practices & Optimization](#best-practices--optimization)
12. [Testing & Debugging](#testing--debugging)

---

## Architecture Overview

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Main Application                         │
│                  (yourplatform.com)                         │
│                                                             │
│  ┌──────────────┐           ┌──────────────┐              │
│  │   Lesson     │◄─────────►│  PostgreSQL  │              │
│  │   Content    │           │   Database   │              │
│  └──────────────┘           └──────────────┘              │
│         │                                                   │
│         │ postMessage()                                    │
│         ▼                                                   │
│  ┌──────────────────────────────────────┐                 │
│  │     Sandboxed Iframe                 │                 │
│  │  (demos.yourplatform.com)            │                 │
│  │                                       │                 │
│  │  ┌────────────────────────────────┐ │                 │
│  │  │     React Runner              │ │                 │
│  │  │  - Transpiles TSX/JSX         │ │                 │
│  │  │  - Executes Component         │ │                 │
│  │  │  - Scoped Environment         │ │                 │
│  │  └────────────────────────────────┘ │                 │
│  └──────────────────────────────────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Decisions (Based on Claude & ChatGPT)

**1. Separate Domain Isolation** (Claude's Approach)
- Main app: `yourplatform.com`
- Artifacts: `demos.yourplatform.com` or `artifacts.yourplatform.com`
- Prevents cross-site attacks and cookie/localStorage access
- CSP headers restrict communication to parent domain only

**2. React Runner for Transpilation** (Claude's Choice)
- Faster than Babel Standalone (uses Sucrase)
- Smaller bundle size (~50KB vs 500KB for Babel)
- Supports modern JSX/TSX syntax
- Built-in scope control for security

**3. PostMessage Communication**
- Secure parent-iframe messaging
- Origin validation on both sides
- Event-driven architecture for flexibility
- Supports bidirectional data flow

**4. PostgreSQL for Storage**
- TEXT columns for component code
- JSONB for metadata and configuration
- Fast retrieval and querying
- ACID compliance for data integrity

---

## Prerequisites & Dependencies

### Main Application (`yourplatform.com`)

```bash
# Core dependencies
npm install pg
npm install @types/pg --save-dev

# For sanitization
npm install isomorphic-dompurify
npm install @types/dompurify --save-dev

# For rate limiting (optional)
npm install @upstash/ratelimit @upstash/redis
```

### Artifact Renderer (`demos.yourplatform.com`)

```bash
# React Runner
npm install react-runner

# Alternative: React Live Runner (drop-in replacement for react-live)
npm install react-live-runner

# Code editor (optional, for inline editing)
npm install @monaco-editor/react
```

---

## Database Schema Design

### PostgreSQL Tables

```sql
-- Main artifacts table
CREATE TABLE interactive_artifacts (
    id BIGSERIAL PRIMARY KEY,
    lesson_id BIGINT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,

    -- Artifact identification
    identifier VARCHAR(255) UNIQUE NOT NULL,  -- e.g., 'stock-calculator-1'
    title VARCHAR(255) NOT NULL,
    description TEXT,

    -- Component code
    component_code TEXT NOT NULL,  -- TSX/JSX code
    artifact_type VARCHAR(50) NOT NULL,  -- 'react', 'html', 'svg', 'mermaid'

    -- Metadata
    allowed_libraries JSONB DEFAULT '[]'::jsonb,  -- ['recharts', 'lucide-react']
    scope_config JSONB DEFAULT '{}'::jsonb,  -- Additional scope variables

    -- Version control
    version INTEGER DEFAULT 1,
    parent_artifact_id BIGINT REFERENCES interactive_artifacts(id),  -- For iterations

    -- Usage tracking
    render_count INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    avg_render_time_ms DECIMAL(10,2),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP  -- Soft delete
);

-- Indexes for performance
CREATE INDEX idx_artifacts_lesson_id ON interactive_artifacts(lesson_id) 
    WHERE deleted_at IS NULL;
CREATE INDEX idx_artifacts_identifier ON interactive_artifacts(identifier) 
    WHERE deleted_at IS NULL;
CREATE INDEX idx_artifacts_type ON interactive_artifacts(artifact_type);
CREATE INDEX idx_artifacts_created ON interactive_artifacts(created_at DESC);

-- Artifact interaction events (for analytics)
CREATE TABLE artifact_interactions (
    id BIGSERIAL PRIMARY KEY,
    artifact_id BIGINT NOT NULL REFERENCES interactive_artifacts(id),
    user_id BIGINT REFERENCES users(id),

    -- Event details
    event_type VARCHAR(50) NOT NULL,  -- 'render', 'interaction', 'error', 'quiz_complete'
    event_data JSONB,  -- Flexible event payload

    -- Performance metrics
    render_time_ms INTEGER,
    error_message TEXT,

    -- Context
    user_agent TEXT,
    ip_address INET,

    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_interactions_artifact ON artifact_interactions(artifact_id, created_at DESC);
CREATE INDEX idx_interactions_user ON artifact_interactions(user_id, created_at DESC);
CREATE INDEX idx_interactions_type ON artifact_interactions(event_type);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_artifacts_updated_at 
    BEFORE UPDATE ON interactive_artifacts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- View for artifact analytics
CREATE VIEW artifact_analytics AS
SELECT 
    a.id,
    a.identifier,
    a.title,
    a.artifact_type,
    a.render_count,
    a.error_count,
    a.avg_render_time_ms,
    COUNT(DISTINCT i.user_id) as unique_users,
    COUNT(i.id) FILTER (WHERE i.event_type = 'interaction') as interaction_count,
    COUNT(i.id) FILTER (WHERE i.event_type = 'error') as error_events,
    MAX(i.created_at) as last_interaction_at
FROM interactive_artifacts a
LEFT JOIN artifact_interactions i ON a.id = i.artifact_id
WHERE a.deleted_at IS NULL
GROUP BY a.id, a.identifier, a.title, a.artifact_type, a.render_count, 
         a.error_count, a.avg_render_time_ms;
```

### Example Data

```sql
-- Insert example artifact
INSERT INTO interactive_artifacts (
    lesson_id,
    identifier,
    title,
    description,
    component_code,
    artifact_type,
    allowed_libraries
) VALUES (
    1,
    'stock-calculator-intro',
    'Stock Investment Calculator',
    'Interactive calculator to learn compound returns',
    '() => {
  const [principal, setPrincipal] = React.useState(10000);
  const [rate, setRate] = React.useState(12);
  const [years, setYears] = React.useState(5);

  const futureValue = principal * Math.pow(1 + rate / 100, years);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h3>Stock Investment Calculator</h3>
      <div>
        <label>Principal Amount (₹): </label>
        <input 
          type="number" 
          value={principal} 
          onChange={(e) => setPrincipal(Number(e.target.value))}
          style={{ margin: "10px 0" }}
        />
      </div>
      <div>
        <label>Annual Return (%): </label>
        <input 
          type="number" 
          value={rate} 
          onChange={(e) => setRate(Number(e.target.value))}
        />
      </div>
      <div>
        <label>Years: </label>
        <input 
          type="number" 
          value={years} 
          onChange={(e) => setYears(Number(e.target.value))}
        />
      </div>
      <div style={{ marginTop: "20px", padding: "10px", background: "#f0f0f0" }}>
        <strong>Future Value: ₹{futureValue.toFixed(2)}</strong>
      </div>
    </div>
  );
}',
    'react',
    '["react"]'::jsonb
);
```

---

## Separate Domain Setup

### DNS Configuration

```
# Add CNAME record for artifact subdomain
demos.yourplatform.com  →  CNAME  →  yourplatform.com

# Or A record pointing to same server
demos.yourplatform.com  →  A  →  YOUR_SERVER_IP
```

### Next.js Multi-Domain Setup

**Option 1: Separate Next.js Apps** (Recommended)

```
your-project/
├── apps/
│   ├── main-app/              # yourplatform.com
│   │   ├── package.json
│   │   ├── next.config.js
│   │   └── app/
│   └── artifact-renderer/     # demos.yourplatform.com
│       ├── package.json
│       ├── next.config.js
│       └── app/
└── packages/
    └── shared/                # Shared utilities
        └── types.ts
```

**Option 2: Single App with Domain-Based Routing**

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:path*',
          has: [
            {
              type: 'host',
              value: 'demos.yourplatform.com',
            },
          ],
          destination: '/artifact-renderer/:path*',
        },
      ],
    };
  },
};
```

### Vercel/Deployment Configuration

```json
// vercel.json (for Vercel deployment)
{
  "builds": [
    {
      "src": "apps/main-app/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "apps/artifact-renderer/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "headers": {
        "host": "demos.yourplatform.com"
      },
      "dest": "apps/artifact-renderer"
    },
    {
      "src": "/(.*)",
      "dest": "apps/main-app"
    }
  ]
}
```

---

## React Runner Implementation

### Artifact Renderer App (demos.yourplatform.com)

```typescript
// apps/artifact-renderer/app/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRunner } from 'react-runner';
import * as React from 'react';

// Import libraries you want to make available to artifacts
// These must be explicitly included
import * as LucideReact from 'lucide-react';

interface MessageData {
  type: string;
  code?: string;
  identifier?: string;
  scope?: Record<string, any>;
}

export default function ArtifactRenderer() {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState<string>('');

  // Build scope with available libraries
  const scope = {
    React,
    useState: React.useState,
    useEffect: React.useEffect,
    useCallback: React.useCallback,
    useMemo: React.useMemo,
    useRef: React.useRef,
    // Add pre-approved libraries
    LucideReact,
  };

  // Use React Runner hook
  const { element, error: runnerError } = useRunner({
    code,
    scope,
  });

  // Handle messages from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent<MessageData>) => {
      // CRITICAL: Validate origin
      if (event.origin !== 'https://yourplatform.com' && 
          event.origin !== 'http://localhost:3000') {
        console.warn('Message from unauthorized origin:', event.origin);
        return;
      }

      const { type, code: newCode, identifier: newId, scope: additionalScope } = event.data;

      switch (type) {
        case 'RENDER_COMPONENT':
          if (newCode) {
            setCode(newCode);
            setIdentifier(newId || '');
            setError(null);

            // Notify parent of successful receipt
            window.parent.postMessage(
              {
                type: 'COMPONENT_RECEIVED',
                identifier: newId,
              },
              event.origin
            );
          }
          break;

        case 'UPDATE_SCOPE':
          // Handle dynamic scope updates if needed
          break;

        case 'CLEAR_ARTIFACT':
          setCode('');
          setIdentifier('');
          setError(null);
          break;

        default:
          console.warn('Unknown message type:', type);
      }
    };

    window.addEventListener('message', handleMessage);

    // Notify parent that renderer is ready
    if (window.parent !== window) {
      window.parent.postMessage(
        { type: 'RENDERER_READY' },
        '*' // Will be validated by parent
      );
    }

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Send errors back to parent
  useEffect(() => {
    if (runnerError) {
      setError(runnerError);

      window.parent.postMessage(
        {
          type: 'ARTIFACT_ERROR',
          identifier,
          error: runnerError,
        },
        'https://yourplatform.com'
      );
    }
  }, [runnerError, identifier]);

  // Send render success notification
  useEffect(() => {
    if (element && !runnerError) {
      window.parent.postMessage(
        {
          type: 'ARTIFACT_RENDERED',
          identifier,
        },
        'https://yourplatform.com'
      );
    }
  }, [element, runnerError, identifier]);

  // Helper function for artifacts to send events
  useEffect(() => {
    // Make sendToParent available globally in iframe
    (window as any).sendToParent = (eventType: string, data: any) => {
      window.parent.postMessage(
        {
          type: 'ARTIFACT_EVENT',
          eventType,
          identifier,
          data,
        },
        'https://yourplatform.com'
      );
    };
  }, [identifier]);

  return (
    <div className="artifact-container">
      {!code && (
        <div className="waiting-state">
          <p>Waiting for artifact code...</p>
        </div>
      )}

      {error && (
        <div className="error-state" style={{ 
          padding: '20px', 
          color: 'red', 
          background: '#ffe6e6',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <h3>Error rendering artifact</h3>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}

      {element && !error && (
        <div className="artifact-content">
          {element}
        </div>
      )}
    </div>
  );
}
```

### Global Styles for Artifact Renderer

```css
/* apps/artifact-renderer/app/globals.css */

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
}

.artifact-container {
  width: 100%;
  height: 100vh;
  overflow: auto;
  background: white;
}

.artifact-content {
  padding: 20px;
}

.waiting-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  color: #666;
  font-size: 18px;
}

/* Allow artifacts to use Tailwind-like utilities */
.text-center { text-align: center; }
.font-bold { font-weight: bold; }
.text-xl { font-size: 1.25rem; }
.text-2xl { font-size: 1.5rem; }
.mt-4 { margin-top: 1rem; }
.mb-4 { margin-bottom: 1rem; }
.p-4 { padding: 1rem; }
.rounded { border-radius: 0.375rem; }
.shadow { box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
```

### Next.js Config for Artifact Renderer

```javascript
// apps/artifact-renderer/next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdnjs.cloudflare.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https:",
              "font-src 'self' data:",
              "connect-src 'self'",
              "frame-ancestors https://yourplatform.com http://localhost:3000",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
          {
            key: 'X-Frame-Options',
            value: 'ALLOW-FROM https://yourplatform.com',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## Security Implementation

### 1. Code Sanitization

```typescript
// apps/main-app/lib/security/sanitizeCode.ts
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitizes component code before storing in database
 * Blocks dangerous patterns that could compromise security
 */
export function sanitizeComponentCode(code: string): {
  sanitized: string;
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Dangerous patterns to detect
  const dangerousPatterns = [
    {
      pattern: /document\.cookie/gi,
      message: 'Access to document.cookie is not allowed',
    },
    {
      pattern: /localStorage/gi,
      message: 'Access to localStorage is not allowed',
    },
    {
      pattern: /sessionStorage/gi,
      message: 'Access to sessionStorage is not allowed',
    },
    {
      pattern: /fetch\s*\(/gi,
      message: 'Direct fetch calls are not allowed',
    },
    {
      pattern: /XMLHttpRequest/gi,
      message: 'XMLHttpRequest is not allowed',
    },
    {
      pattern: /eval\s*\(/gi,
      message: 'eval() is not allowed',
    },
    {
      pattern: /Function\s*\(/gi,
      message: 'Function constructor is not allowed',
    },
    {
      pattern: /__proto__/gi,
      message: 'Prototype manipulation is not allowed',
    },
    {
      pattern: /constructor\[/gi,
      message: 'Constructor access is not allowed',
    },
    {
      pattern: /import\s+.*\s+from\s+['"][^'"]*(?<!\.\/|\.\.\/)['"]/gi,
      message: 'External imports are not allowed. Use provided libraries in scope.',
    },
  ];

  // Check for dangerous patterns
  dangerousPatterns.forEach(({ pattern, message }) => {
    if (pattern.test(code)) {
      errors.push(message);
    }
  });

  // Additional validation: Check for excessive code length
  if (code.length > 50000) {
    errors.push('Code exceeds maximum length of 50,000 characters');
  }

  // Check for balanced braces (basic syntax validation)
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push('Unbalanced braces detected');
  }

  return {
    sanitized: code,
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates artifact type
 */
export function validateArtifactType(type: string): boolean {
  const allowedTypes = ['react', 'html', 'svg', 'mermaid'];
  return allowedTypes.includes(type);
}

/**
 * Validates allowed libraries list
 */
export function validateAllowedLibraries(libraries: string[]): {
  valid: string[];
  invalid: string[];
} {
  const allowedLibraries = [
    'react',
    'lucide-react',
    'recharts',
    // Add more as needed
  ];

  const valid: string[] = [];
  const invalid: string[] = [];

  libraries.forEach((lib) => {
    if (allowedLibraries.includes(lib)) {
      valid.push(lib);
    } else {
      invalid.push(lib);
    }
  });

  return { valid, invalid };
}
```

### 2. Rate Limiting

```typescript
// apps/main-app/lib/security/rateLimit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Create rate limiter instance
const redis = Redis.fromEnv();

export const artifactRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 renders per minute
  analytics: true,
  prefix: 'artifact_render',
});

export const createArtifactRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 new artifacts per hour
  analytics: true,
  prefix: 'artifact_create',
});

/**
 * Check rate limit for artifact rendering
 */
export async function checkRenderRateLimit(
  userId: string | null,
  ip: string
): Promise<{ success: boolean; remaining: number }> {
  const identifier = userId || ip;
  const { success, remaining } = await artifactRateLimit.limit(identifier);

  return { success, remaining };
}

/**
 * Check rate limit for artifact creation
 */
export async function checkCreateRateLimit(
  userId: string
): Promise<{ success: boolean; remaining: number }> {
  const { success, remaining } = await createArtifactRateLimit.limit(userId);

  return { success, remaining };
}
```

### 3. Content Security Policy Middleware

```typescript
// apps/main-app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Set security headers
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Required for Next.js
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://demos.yourplatform.com",
      "frame-src https://demos.yourplatform.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ')
  );

  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

## Cross-Window Communication

### Main App: Artifact Manager Component

```typescript
// apps/main-app/components/ArtifactManager.tsx
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface ArtifactManagerProps {
  artifactId: number;
  code: string;
  identifier: string;
  onRenderSuccess?: (identifier: string) => void;
  onRenderError?: (identifier: string, error: string) => void;
  onArtifactEvent?: (eventType: string, data: any) => void;
}

export default function ArtifactManager({
  artifactId,
  code,
  identifier,
  onRenderSuccess,
  onRenderError,
  onArtifactEvent,
}: ArtifactManagerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle messages from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate origin
      if (
        event.origin !== 'https://demos.yourplatform.com' &&
        event.origin !== 'http://localhost:3001'
      ) {
        console.warn('Message from unauthorized origin:', event.origin);
        return;
      }

      const { type, identifier: msgId, error: errorMsg, eventType, data } = event.data;

      switch (type) {
        case 'RENDERER_READY':
          setIsReady(true);
          setIsLoading(false);
          break;

        case 'COMPONENT_RECEIVED':
          console.log('Component received:', msgId);
          break;

        case 'ARTIFACT_RENDERED':
          setError(null);
          onRenderSuccess?.(msgId);

          // Track successful render
          fetch('/api/artifacts/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              artifactId,
              eventType: 'render',
              success: true,
            }),
          });
          break;

        case 'ARTIFACT_ERROR':
          setError(errorMsg);
          onRenderError?.(msgId, errorMsg);

          // Track error
          fetch('/api/artifacts/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              artifactId,
              eventType: 'error',
              success: false,
              errorMessage: errorMsg,
            }),
          });
          break;

        case 'ARTIFACT_EVENT':
          // Handle custom events from artifact (quiz completion, interactions, etc.)
          onArtifactEvent?.(eventType, data);

          // Track interaction
          fetch('/api/artifacts/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              artifactId,
              eventType,
              eventData: data,
            }),
          });
          break;

        default:
          console.warn('Unknown message type:', type);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [artifactId, onRenderSuccess, onRenderError, onArtifactEvent]);

  // Send code to iframe when ready
  useEffect(() => {
    if (isReady && code && iframeRef.current?.contentWindow) {
      const targetOrigin = process.env.NODE_ENV === 'production' 
        ? 'https://demos.yourplatform.com'
        : 'http://localhost:3001';

      iframeRef.current.contentWindow.postMessage(
        {
          type: 'RENDER_COMPONENT',
          code,
          identifier,
        },
        targetOrigin
      );
    }
  }, [isReady, code, identifier]);

  // Refresh artifact
  const handleRefresh = useCallback(() => {
    if (iframeRef.current?.contentWindow && isReady) {
      const targetOrigin = process.env.NODE_ENV === 'production' 
        ? 'https://demos.yourplatform.com'
        : 'http://localhost:3001';

      iframeRef.current.contentWindow.postMessage(
        {
          type: 'RENDER_COMPONENT',
          code,
          identifier,
        },
        targetOrigin
      );
    }
  }, [code, identifier, isReady]);

  return (
    <div className="artifact-manager">
      <div className="artifact-header">
        <h3 className="artifact-title">{identifier}</h3>
        <button 
          onClick={handleRefresh}
          disabled={isLoading}
          className="refresh-button"
        >
          Refresh
        </button>
      </div>

      {isLoading && (
        <div className="artifact-loading">
          Loading artifact renderer...
        </div>
      )}

      {error && (
        <div className="artifact-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={
          process.env.NODE_ENV === 'production'
            ? 'https://demos.yourplatform.com'
            : 'http://localhost:3001'
        }
        sandbox="allow-scripts allow-forms allow-same-origin"
        title={`Artifact: ${identifier}`}
        className="artifact-iframe"
        style={{
          width: '100%',
          height: '600px',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          display: isLoading ? 'none' : 'block',
        }}
      />
    </div>
  );
}
```

### Styles for Artifact Manager

```css
/* apps/main-app/components/ArtifactManager.module.css */

.artifact-manager {
  width: 100%;
  margin: 20px 0;
}

.artifact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f5f5f5;
  border-radius: 8px 8px 0 0;
  border: 1px solid #e0e0e0;
  border-bottom: none;
}

.artifact-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.refresh-button {
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.refresh-button:hover:not(:disabled) {
  background: #0056b3;
}

.refresh-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.artifact-loading {
  padding: 40px;
  text-align: center;
  color: #666;
  background: #fafafa;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 8px 8px;
}

.artifact-error {
  padding: 16px;
  background: #ffe6e6;
  border: 1px solid #ffcccc;
  border-radius: 4px;
  margin-bottom: 12px;
  color: #cc0000;
}

.artifact-iframe {
  display: block;
  width: 100%;
  min-height: 400px;
  border: 1px solid #e0e0e0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  background: white;
}
```

---

## Frontend Components

### Lesson Page with Artifacts

```typescript
// apps/main-app/app/lessons/[id]/page.tsx
import { Pool } from 'pg';
import ArtifactManager from '@/components/ArtifactManager';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface Artifact {
  id: number;
  identifier: string;
  title: string;
  component_code: string;
  artifact_type: string;
}

export default async function LessonPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Fetch lesson and artifacts
  const lessonResult = await pool.query(
    'SELECT * FROM lessons WHERE id = $1',
    [params.id]
  );

  const artifactsResult = await pool.query(
    `SELECT id, identifier, title, component_code, artifact_type
     FROM interactive_artifacts
     WHERE lesson_id = $1 AND deleted_at IS NULL
     ORDER BY created_at ASC`,
    [params.id]
  );

  const lesson = lessonResult.rows[0];
  const artifacts: Artifact[] = artifactsResult.rows;

  if (!lesson) {
    return <div>Lesson not found</div>;
  }

  return (
    <div className="lesson-container">
      <h1>{lesson.title}</h1>

      <div className="lesson-content">
        {/* Lesson text content */}
        <div dangerouslySetInnerHTML={{ __html: lesson.content }} />

        {/* Render artifacts inline */}
        {artifacts.map((artifact) => (
          <div key={artifact.id} className="artifact-section">
            <ArtifactManager
              artifactId={artifact.id}
              code={artifact.component_code}
              identifier={artifact.identifier}
              onRenderSuccess={(id) => {
                console.log('Artifact rendered:', id);
              }}
              onRenderError={(id, error) => {
                console.error('Artifact error:', id, error);
              }}
              onArtifactEvent={(eventType, data) => {
                console.log('Artifact event:', eventType, data);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## Backend API Routes

### Create Artifact API

```typescript
// apps/main-app/app/api/artifacts/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { 
  sanitizeComponentCode, 
  validateArtifactType,
  validateAllowedLibraries 
} from '@/lib/security/sanitizeCode';
import { checkCreateRateLimit } from '@/lib/security/rateLimit';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    // Get user ID (from your auth system)
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check rate limit
    const { success: rateLimitOk } = await checkCreateRateLimit(userId);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      lessonId,
      identifier,
      title,
      description,
      componentCode,
      artifactType,
      allowedLibraries = [],
    } = body;

    // Validate required fields
    if (!lessonId || !identifier || !title || !componentCode || !artifactType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate artifact type
    if (!validateArtifactType(artifactType)) {
      return NextResponse.json(
        { error: 'Invalid artifact type' },
        { status: 400 }
      );
    }

    // Sanitize component code
    const { sanitized, isValid, errors } = sanitizeComponentCode(componentCode);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Code validation failed', details: errors },
        { status: 400 }
      );
    }

    // Validate libraries
    const { valid: validLibs, invalid: invalidLibs } = 
      validateAllowedLibraries(allowedLibraries);

    if (invalidLibs.length > 0) {
      return NextResponse.json(
        { 
          error: 'Invalid libraries specified', 
          invalidLibraries: invalidLibs 
        },
        { status: 400 }
      );
    }

    // Insert into database
    const result = await pool.query(
      `INSERT INTO interactive_artifacts (
        lesson_id, identifier, title, description,
        component_code, artifact_type, allowed_libraries
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, identifier, created_at`,
      [
        lessonId,
        identifier,
        title,
        description,
        sanitized,
        artifactType,
        JSON.stringify(validLibs),
      ]
    );

    const artifact = result.rows[0];

    return NextResponse.json({
      success: true,
      artifact: {
        id: artifact.id,
        identifier: artifact.identifier,
        createdAt: artifact.created_at,
      },
    });

  } catch (error: any) {
    console.error('Error creating artifact:', error);

    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Artifact with this identifier already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create artifact' },
      { status: 500 }
    );
  }
}
```

### Get Artifact API

```typescript
// apps/main-app/app/api/artifacts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const result = await pool.query(
      `SELECT 
        id, lesson_id, identifier, title, description,
        component_code, artifact_type, allowed_libraries,
        version, created_at, updated_at
       FROM interactive_artifacts
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Artifact not found' },
        { status: 404 }
      );
    }

    const artifact = result.rows[0];

    // Increment render count
    await pool.query(
      `UPDATE interactive_artifacts 
       SET render_count = render_count + 1
       WHERE id = $1`,
      [id]
    );

    return NextResponse.json({ artifact });

  } catch (error) {
    console.error('Error fetching artifact:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artifact' },
      { status: 500 }
    );
  }
}
```

### Track Interactions API

```typescript
// apps/main-app/app/api/artifacts/track/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      artifactId,
      eventType,
      eventData,
      success,
      errorMessage,
      renderTimeMs,
    } = body;

    // Get user info
    const userId = request.headers.get('x-user-id');
    const userAgent = request.headers.get('user-agent');
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Insert interaction event
    await pool.query(
      `INSERT INTO artifact_interactions (
        artifact_id, user_id, event_type, event_data,
        render_time_ms, error_message, user_agent, ip_address
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        artifactId,
        userId || null,
        eventType,
        eventData ? JSON.stringify(eventData) : null,
        renderTimeMs || null,
        errorMessage || null,
        userAgent,
        ip,
      ]
    );

    // Update artifact statistics if it's an error
    if (!success && errorMessage) {
      await pool.query(
        `UPDATE interactive_artifacts 
         SET error_count = error_count + 1
         WHERE id = $1`,
        [artifactId]
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error tracking interaction:', error);
    return NextResponse.json(
      { error: 'Failed to track interaction' },
      { status: 500 }
    );
  }
}
```

---

## AI Integration & Triggering Logic

### System Prompt for AI (Based on Claude's Approach)

```typescript
// apps/main-app/lib/ai/artifactPrompt.ts

export const ARTIFACT_SYSTEM_PROMPT = `
You are an AI assistant for a financial education platform. When generating content,
you can create interactive React components (artifacts) to help users learn concepts.

## When to Create Artifacts

Create artifacts when:
1. The content is substantial (>15 lines of code)
2. The content is self-contained and can stand alone
3. Users might want to modify, iterate on, or reference the content
4. The content includes interactive demonstrations, calculators, or visualizations
5. The content would benefit from live execution

DO NOT create artifacts for:
1. Simple code snippets or brief examples
2. Conversational or explanatory content
3. Content that depends heavily on chat context
4. One-time explanations that don't need interaction

## Artifact Types

- **react**: Interactive React components (calculators, simulators, quizzes)
- **html**: Static HTML pages with CSS/JS
- **svg**: Vector graphics and diagrams
- **mermaid**: Flowcharts and diagrams

## Available Libraries in React Artifacts

You have access to:
- React hooks: useState, useEffect, useCallback, useMemo, useRef
- LucideReact icons (use as: <LucideReact.Heart />)
- Basic utility CSS classes (text-center, font-bold, p-4, etc.)

DO NOT use:
- fetch() or API calls
- localStorage or cookies
- Direct DOM manipulation
- External imports (except provided libraries)

## Output Format

When creating an artifact, output it like this:

<artifact
  identifier="unique-id-here"
  type="react"
  title="Descriptive Title"
>
() => {
  const [state, setState] = React.useState(0);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Your Component</h2>
      {/* Component content */}
    </div>
  );
}
</artifact>

## Examples

### Good - Creates Artifact
User: "Show me how compound interest works"
Response: Creates an interactive calculator artifact

### Bad - Does Not Create Artifact
User: "What is compound interest?"
Response: Provides a text explanation without artifact

### Good - Creates Artifact
User: "I want to practice calculating SIP returns"
Response: Creates an interactive SIP calculator artifact

### Bad - Does Not Create Artifact  
User: "How do I calculate SIP returns?"
Response: Shows the formula in text without artifact
`;
```

### Parse AI Response for Artifacts

```typescript
// apps/main-app/lib/ai/parseArtifacts.ts

interface ParsedArtifact {
  identifier: string;
  type: string;
  title: string;
  code: string;
}

/**
 * Parses AI response to extract artifact tags
 */
export function parseArtifactsFromResponse(
  response: string
): {
  text: string;
  artifacts: ParsedArtifact[];
} {
  const artifactRegex = /<artifact\s+identifier="([^"]+)"\s+type="([^"]+)"\s+title="([^"]+)"\s*>([\s\S]*?)<\/artifact>/g;

  const artifacts: ParsedArtifact[] = [];
  let match;

  while ((match = artifactRegex.exec(response)) !== null) {
    artifacts.push({
      identifier: match[1],
      type: match[2],
      title: match[3],
      code: match[4].trim(),
    });
  }

  // Remove artifact tags from text
  const text = response.replace(artifactRegex, (_, identifier, type, title) => {
    return `[Interactive: ${title}]`;
  });

  return { text, artifacts };
}

/**
 * Save artifacts to database
 */
export async function saveArtifactsToDatabase(
  lessonId: number,
  artifacts: ParsedArtifact[]
): Promise<number[]> {
  const { Pool } = await import('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const artifactIds: number[] = [];

  for (const artifact of artifacts) {
    const result = await pool.query(
      `INSERT INTO interactive_artifacts (
        lesson_id, identifier, title, component_code, artifact_type
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [
        lessonId,
        artifact.identifier,
        artifact.title,
        artifact.code,
        artifact.type,
      ]
    );

    artifactIds.push(result.rows[0].id);
  }

  return artifactIds;
}
```

### AI Chat API with Artifact Support

```typescript
// apps/main-app/app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { parseArtifactsFromResponse, saveArtifactsToDatabase } from '@/lib/ai/parseArtifacts';
import { ARTIFACT_SYSTEM_PROMPT } from '@/lib/ai/artifactPrompt';

export async function POST(request: NextRequest) {
  try {
    const { message, lessonId } = await request.json();

    // Call your AI service (OpenAI, Anthropic, etc.)
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: ARTIFACT_SYSTEM_PROMPT },
          { role: 'user', content: message },
        ],
      }),
    });

    const aiData = await aiResponse.json();
    const rawResponse = aiData.choices[0].message.content;

    // Parse artifacts from response
    const { text, artifacts } = parseArtifactsFromResponse(rawResponse);

    // Save artifacts to database
    let artifactIds: number[] = [];
    if (artifacts.length > 0 && lessonId) {
      artifactIds = await saveArtifactsToDatabase(lessonId, artifacts);
    }

    return NextResponse.json({
      response: text,
      artifacts: artifacts.map((artifact, index) => ({
        ...artifact,
        id: artifactIds[index],
      })),
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
```

---

## Best Practices & Optimization

### 1. Performance Optimization

```typescript
// Lazy load artifacts that are not immediately visible
import dynamic from 'next/dynamic';

const ArtifactManager = dynamic(() => import('@/components/ArtifactManager'), {
  loading: () => <div>Loading artifact...</div>,
  ssr: false,
});

// Use Intersection Observer for lazy rendering
import { useInView } from 'react-intersection-observer';

function LazyArtifact({ artifactId, code, identifier }: Props) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <div ref={ref}>
      {inView ? (
        <ArtifactManager 
          artifactId={artifactId} 
          code={code} 
          identifier={identifier} 
        />
      ) : (
        <div className="artifact-placeholder">
          Artifact will load when visible...
        </div>
      )}
    </div>
  );
}
```

### 2. Error Handling & Fallbacks

```typescript
// apps/main-app/components/ArtifactErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ArtifactErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Artifact error:', error, errorInfo);

    // Log to error tracking service
    fetch('/api/artifacts/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      }),
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="artifact-error-boundary">
          <h3>Failed to load artifact</h3>
          <p>Please try refreshing the page.</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ArtifactErrorBoundary;
```

### 3. Caching Strategy

```typescript
// Cache artifact code in memory
const artifactCache = new Map<string, string>();

export async function getArtifactCode(artifactId: number): Promise<string> {
  const cacheKey = `artifact_${artifactId}`;

  // Check memory cache
  if (artifactCache.has(cacheKey)) {
    return artifactCache.get(cacheKey)!;
  }

  // Fetch from database
  const result = await pool.query(
    'SELECT component_code FROM interactive_artifacts WHERE id = $1',
    [artifactId]
  );

  const code = result.rows[0]?.component_code;

  if (code) {
    artifactCache.set(cacheKey, code);

    // Clear cache after 5 minutes
    setTimeout(() => artifactCache.delete(cacheKey), 5 * 60 * 1000);
  }

  return code;
}
```

### 4. Version Control for Artifacts

```typescript
// Create new version of artifact
export async function createArtifactVersion(
  parentArtifactId: number,
  newCode: string,
  userId: string
): Promise<number> {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Get parent artifact
    const parentResult = await client.query(
      'SELECT * FROM interactive_artifacts WHERE id = $1',
      [parentArtifactId]
    );
    const parent = parentResult.rows[0];

    // Create new version
    const newVersion = parent.version + 1;
    const result = await client.query(
      `INSERT INTO interactive_artifacts (
        lesson_id, identifier, title, description,
        component_code, artifact_type, allowed_libraries,
        version, parent_artifact_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id`,
      [
        parent.lesson_id,
        `${parent.identifier}-v${newVersion}`,
        parent.title,
        parent.description,
        newCode,
        parent.artifact_type,
        parent.allowed_libraries,
        newVersion,
        parentArtifactId,
      ]
    );

    await client.query('COMMIT');
    return result.rows[0].id;

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

### 5. Analytics Dashboard Query

```sql
-- Get artifact performance metrics
SELECT 
    a.id,
    a.identifier,
    a.title,
    a.artifact_type,
    a.render_count,
    a.error_count,
    ROUND((a.error_count::float / NULLIF(a.render_count, 0) * 100), 2) as error_rate_percent,
    COUNT(DISTINCT i.user_id) as unique_users,
    COUNT(i.id) FILTER (WHERE i.event_type = 'interaction') as total_interactions,
    AVG(i.render_time_ms) as avg_render_time,
    MAX(i.created_at) as last_used_at
FROM interactive_artifacts a
LEFT JOIN artifact_interactions i ON a.id = i.artifact_id
WHERE a.deleted_at IS NULL
GROUP BY a.id
ORDER BY a.render_count DESC
LIMIT 20;
```

---

## Testing & Debugging

### 1. Unit Tests for Sanitization

```typescript
// __tests__/sanitizeCode.test.ts
import { sanitizeComponentCode } from '@/lib/security/sanitizeCode';

describe('sanitizeComponentCode', () => {
  it('should detect localStorage usage', () => {
    const code = 'localStorage.setItem("key", "value")';
    const result = sanitizeComponentCode(code);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Access to localStorage is not allowed');
  });

  it('should detect eval usage', () => {
    const code = 'eval("malicious code")';
    const result = sanitizeComponentCode(code);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('eval() is not allowed');
  });

  it('should allow valid React component', () => {
    const code = `
      () => {
        const [count, setCount] = React.useState(0);
        return <button onClick={() => setCount(count + 1)}>{count}</button>;
      }
    `;
    const result = sanitizeComponentCode(code);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
```

### 2. Integration Tests

```typescript
// __tests__/artifacts.integration.test.ts
import { createArtifact, getArtifact } from '@/lib/artifacts';

describe('Artifact Integration', () => {
  it('should create and retrieve artifact', async () => {
    const artifact = await createArtifact({
      lessonId: 1,
      identifier: 'test-artifact',
      title: 'Test',
      code: '() => <div>Test</div>',
      type: 'react',
    });

    expect(artifact.id).toBeDefined();

    const retrieved = await getArtifact(artifact.id);
    expect(retrieved.identifier).toBe('test-artifact');
  });
});
```

### 3. Debugging Tools

```typescript
// Add debug mode for artifact renderer
const DEBUG_MODE = process.env.NODE_ENV === 'development';

function DebugPanel({ code, errors }: { code: string; errors: string[] }) {
  if (!DEBUG_MODE) return null;

  return (
    <div className="debug-panel">
      <h4>Debug Info</h4>
      <details>
        <summary>Code ({code.length} chars)</summary>
        <pre>{code}</pre>
      </details>
      {errors.length > 0 && (
        <div className="debug-errors">
          <strong>Errors:</strong>
          <ul>
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

---

## Deployment Checklist

### Environment Variables

```bash
# Main App (.env)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
OPENAI_API_KEY=your_openai_api_key
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
ARTIFACT_RENDERER_URL=https://demos.yourplatform.com
NODE_ENV=production

# Artifact Renderer (.env)
ALLOWED_PARENT_ORIGIN=https://yourplatform.com
NODE_ENV=production
```

### Pre-Deployment Steps

1. ✅ Set up separate subdomain (demos.yourplatform.com)
2. ✅ Configure DNS records
3. ✅ Test CSP headers in staging
4. ✅ Run security audit on code sanitization
5. ✅ Set up rate limiting with Redis
6. ✅ Configure error tracking (Sentry, LogRocket)
7. ✅ Test cross-origin messaging
8. ✅ Load test artifact rendering
9. ✅ Set up monitoring and alerts
10. ✅ Document artifact creation guidelines for content team

### Monitoring

```typescript
// Set up performance monitoring
export function trackArtifactMetrics(
  artifactId: number,
  renderTime: number,
  success: boolean
) {
  // Send to analytics service
  analytics.track('artifact_render', {
    artifactId,
    renderTime,
    success,
    timestamp: new Date().toISOString(),
  });
}
```

---

## Additional Resources

### Libraries Used
- **React Runner**: https://github.com/nihgwu/react-runner
- **PostgreSQL**: https://www.postgresql.org/
- **Next.js**: https://nextjs.org/
- **TypeScript**: https://www.typescriptlang.org/

### Security References
- OWASP XSS Prevention: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
- Content Security Policy: https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
- postMessage Security: https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage#security_concerns

### Inspiration
- Claude Artifacts: https://www.anthropic.com/news/claude-artifacts
- ChatGPT Canvas: https://openai.com/blog/chatgpt-canvas
- Reverse Engineering Claude: https://reidbarber.com/blog/reverse-engineering-claude-artifacts

---

## Conclusion

This implementation provides a robust, secure, and scalable artifact system for your financial education platform. Key benefits:

✅ **Security**: Isolated execution, code sanitization, rate limiting  
✅ **Performance**: React Runner for fast transpilation, lazy loading, caching  
✅ **Scalability**: PostgreSQL for storage, separate domain architecture  
✅ **Maintainability**: Clear separation of concerns, comprehensive error handling  
✅ **User Experience**: Seamless interaction, version control, analytics

Follow the best practices from Claude and ChatGPT while adapting to your specific needs. Start with simple React artifacts and gradually expand to more complex use cases as your platform grows.
