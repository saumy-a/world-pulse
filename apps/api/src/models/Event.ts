import { Schema, model } from "mongoose";

const eventSchema = new Schema(
    {
        // Unique ID from the collector (exposed to the API as "id")
        eventId: { type: String, required: true, unique: true },

        source: { type: String, required: true, index: true },
        sourceEventId: { type: String },

        type: { type: String, required: true },
        category: { type: String, required: true, index: true },

        title: { type: String, required: true },
        description: { type: String },
        url: { type: String },
        tags: { type: [String], default: [] },

        country: { type: String, index: true },
        region: { type: String },

        // When the event happened
        timestamp: { type: Date, required: true, index: true },

        // Importance score from 0 to 10
        importance: { type: Number, required: true, min: 0, max: 10, index: true },

        location: {
            latitude: { type: Number },
            longitude: { type: Number },
        },

        // Extra details that differ per source
        metadata: { type: Schema.Types.Mixed, default: {} },
    },
    { timestamps: true } // adds createdAt and updatedAt automatically
);

export const EventModel = model("Event", eventSchema);