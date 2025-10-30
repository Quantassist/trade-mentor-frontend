For your PostgreSQL-based financial education platform, **using sandboxed iframes remains the best approach** for rendering interactive HTML demos, with PostgreSQL offering efficient storage options for the HTML content.[1][2][3]

## Storage Strategy in PostgreSQL

**Store HTML content directly in PostgreSQL using the TEXT data type** for demos typically under 1MB. 

**Use S3 only for larger assets** (images, videos, large datasets) referenced within your HTML demos, not for the HTML itself. PostgreSQL TEXT columns can efficiently handle HTML content up to several hundred KB with excellent query performance.[7][8][1]


### Storage Optimization

PostgreSQL uses TOAST (The Oversized-Attribute Storage Technique) to automatically handle large TEXT values. For HTML content that's already minified or doesn't compress well, you can optimize storage:[2]

```sql
-- For pre-compressed or minified HTML, disable compression
ALTER TABLE section 
    ALTER COLUMN htmlContent SET STORAGE EXTERNAL;
```

This prevents PostgreSQL from wasting CPU cycles trying to compress already-optimized HTML and allows faster substring operations.[2]

## Rendering with Sandboxed Iframes

The implementation approach remains the same as before, using sandboxed iframes for security:[3][9]

```typescript
// components/InteractiveDemo.tsx
'use client';

import { useEffect, useRef, useState } from 'react';

interface InteractiveDemoProps {
  htmlContent: string;
  demoId: number;
  lessonId: number;
}

export default function InteractiveDemo({ 
  htmlContent, 
  demoId, 
  lessonId 
}: InteractiveDemoProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (iframeRef.current && htmlContent) {
        const iframe = iframeRef.current;
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (doc) {
          doc.open();
          doc.write(htmlContent);
          doc.close();
        }
      }
    } catch (err) {
      setError('Failed to load interactive demo');
      console.error('Demo loading error:', err);
    }
  }, [htmlContent]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="interactive-demo-container">
      <iframe
        ref={iframeRef}
        sandbox="allow-scripts allow-forms"
        title={`Interactive Demo ${demoId}`}
        className="demo-iframe"
        onLoad={() => setIsLoaded(true)}
        loading="lazy"
      />
      {!isLoaded && <div className="loading-spinner">Loading demo...</div>}
    </div>
  );
}
```

## Backend API (Next.js API Route)

```typescript
// app/api/lessons/[lessonId]/demos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const result = await pool.query(
      `SELECT id, title, html_content, interaction_type, 
              estimated_time_seconds, difficulty
       FROM interactive_demos 
       WHERE lesson_id = $1 
       ORDER BY created_at ASC`,
      [params.lessonId]
    );

    return NextResponse.json({
      demos: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demos' },
      { status: 500 }
    );
  }
}
```

## Security Implementation

### HTML Sanitization Before Storage

Use DOMPurify server-side before inserting HTML into PostgreSQL:[10]

```typescript
// lib/sanitizeHtml.ts
import { JSDOM } from 'jsdom';
import createDOMPurify from 'dompurify';

export function sanitizeInteractiveHTML(htmlContent: string): string {
  const window = new JSDOM('').window;
  const DOMPurify = createDOMPurify(window as any);
  
  return DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: [
      'div', 'span', 'button', 'input', 'label', 'canvas', 
      'svg', 'path', 'circle', 'rect', 'script', 'style',
      'p', 'h1', 'h2', 'h3', 'select', 'option', 'form'
    ],
    ALLOWED_ATTR: [
      'class', 'id', 'style', 'type', 'value', 'placeholder',
      'data-*', 'onclick', 'onchange', 'viewBox', 'd', 'fill',
      'stroke', 'width', 'height'
    ],
    KEEP_CONTENT: true,
    ALLOW_DATA_ATTR: true,
  });
}

// Usage in API route
import { sanitizeInteractiveHTML } from '@/lib/sanitizeHtml';

export async function POST(request: NextRequest) {
  const { lessonId, title, htmlContent } = await request.json();
  
  // Sanitize before storing
  const sanitizedHtml = sanitizeInteractiveHTML(htmlContent);
  
  await pool.query(
    `INSERT INTO interactive_demos (lesson_id, title, html_content)
     VALUES ($1, $2, $3)`,
    [lessonId, title, sanitizedHtml]
  );
}
```

### Content Security Policy

Configure CSP in `next.config.js`:[11][12]

```javascript
// next.config.js
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  connect-src 'self';
  frame-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`;

module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\s{2,}/g, ' ').trim(),
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
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
```


### Lazy Loading Implementation

```typescript
import { useInView } from 'react-intersection-observer';

export default function LazyInteractiveDemo({ demoId, lessonId }: Props) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  useEffect(() => {
    if (inView && !htmlContent) {
      fetch(`/api/lessons/${lessonId}/demos/${demoId}`)
        .then(res => res.json())
        .then(data => setHtmlContent(data.html_content));
    }
  }, [inView, demoId, lessonId]);

  return (
    <div ref={ref} className="demo-wrapper">
      {htmlContent ? (
        <InteractiveDemo htmlContent={htmlContent} demoId={demoId} lessonId={lessonId} />
      ) : (
        <div className="demo-placeholder">Loading interactive demo...</div>
      )}
    </div>
  );
}
```

## Cross-Window Communication

For tracking user interactions (quiz completions, engagement metrics), implement postMessage:[9][15]

```typescript
// In parent component
useEffect(() => {
  const handleMessage = (event: MessageEvent) => {
    // Security: validate origin
    if (event.origin !== window.location.origin) return;
    
    const { type, payload } = event.data;
    
    switch (type) {
      case 'QUIZ_COMPLETED':
        trackQuizCompletion(payload.demoId, payload.score);
        break;
      case 'INTERACTION_EVENT':
        trackInteraction(payload.demoId, payload.eventType);
        break;
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);

// Inside AI-generated HTML (in iframe)
// <script>
//   function sendToParent(type, payload) {
//     window.parent.postMessage({ type, payload }, window.location.origin);
//   }
//   
//   // Track quiz completion
//   sendToParent('QUIZ_COMPLETED', {
//     demoId: 123,
//     score: 85,
//     timeSpent: 120
//   });
// </script>
```
