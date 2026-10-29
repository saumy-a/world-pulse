import { Schema, model } from 'mongoose';

const diagnosticLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'layer_enabled',
        'layer_disabled',
        'layer_activation_failed',
        'api_request_succeeded',
        'api_request_failed',
        'collector_succeeded',
        'collector_failed',
        'collector_publish_failed',
      ],
      index: true,
    },
    source: { type: String, required: true, maxlength: 80, index: true },
    sessionId: { type: String, maxlength: 64, index: true },
    durationMs: { type: Number, min: 0, max: 86_400_000 },
    resultCount: { type: Number, min: 0, max: 1_000_000 },
    statusCode: { type: Number, min: 100, max: 599 },
    errorCode: { type: String, maxlength: 48 },
    expiresAt: { type: Date, required: true },
  },
  { collection: 'api_logs', timestamps: true },
);

// MongoDB removes diagnostics after their retention window.
diagnosticLogSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const DiagnosticLogModel = model('DiagnosticLog', diagnosticLogSchema);
