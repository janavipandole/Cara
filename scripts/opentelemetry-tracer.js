/**
 * Mock OpenTelemetry Distributed Tracing Setup
 * Simulates instrumenting backend services and extracting/injecting 
 * trace contexts (headers) to track a request's lifecycle.
 */

export class TracerSetup {
  constructor(serviceName = 'cara-api-service') {
    this.serviceName = serviceName;
    this.tracer = null;
    this.isInstrumented = false;
  }

  /**
   * Initializes the OpenTelemetry Node SDK (mocked).
   */
  init() {
    console.log(`[OpenTelemetry] Initializing tracer for service: ${this.serviceName}...`);
    // Simulating OTel SDK initialization (e.g. setting up exporters to Jaeger/Datadog)
    this.isInstrumented = true;
    
    // Mock tracer object
    this.tracer = {
      startSpan: (name, options = {}) => {
        const traceId = options.parentContext?.traceId || crypto.randomUUID();
        const spanId = crypto.randomUUID();
        console.log(`[OpenTelemetry] Span Started: [${name}] | TraceID: ${traceId} | SpanID: ${spanId}`);
        
        return {
          traceId,
          spanId,
          name,
          setAttribute: (key, value) => {
            console.log(`[OpenTelemetry] Set Attribute [${name}]: ${key} = ${value}`);
          },
          addEvent: (eventName) => {
            console.log(`[OpenTelemetry] Event Added [${name}]: ${eventName}`);
          },
          end: () => {
            console.log(`[OpenTelemetry] Span Ended: [${name}]`);
          }
        };
      }
    };
    
    console.log(`[OpenTelemetry] ${this.serviceName} is now instrumented.`);
    return this.tracer;
  }

  /**
   * Simulates extracting a trace context from incoming HTTP headers.
   */
  extractContextFromHeaders(headers) {
    if (headers && headers['traceparent']) {
      // traceparent format: 00-<traceId>-<spanId>-<traceFlags>
      const parts = headers['traceparent'].split('-');
      return {
        traceId: parts[1],
        parentSpanId: parts[2]
      };
    }
    return null;
  }

  /**
   * Simulates injecting a trace context into outgoing HTTP headers.
   */
  injectContextToHeaders(span) {
    return {
      'traceparent': `00-${span.traceId}-${span.spanId}-01`
    };
  }
}

// Usage Example for an Express API Middleware:
// const tracerSetup = new TracerSetup('cara-checkout-service');
// const tracer = tracerSetup.init();
//
// app.use((req, res, next) => {
//   const parentContext = tracerSetup.extractContextFromHeaders(req.headers);
//   const span = tracer.startSpan(`HTTP ${req.method} ${req.path}`, { parentContext });
//   
//   span.setAttribute('http.url', req.url);
//   span.setAttribute('user_agent', req.headers['user-agent']);
//
//   res.on('finish', () => {
//     span.setAttribute('http.status_code', res.statusCode);
//     span.end();
//   });
//
//   next();
// });
