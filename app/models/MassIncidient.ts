import mongoose, { Schema, Document } from "mongoose";

// Define the MassIncidient schema
interface MassIncidient {
  mi_id: string;
  station: string;
  city: string;
  addr: string;
  commet: string;
  ts: string;
  te: string;
  from: string;
  phone: string;
  priority: string;
}

const massIncidientSchema = new Schema<MassIncidient>({
  mi_id: { type: String, required: true },
  station: { type: String, required: true },
  city: { type: String, required: true },
  addr: { type: String, required: true },
  commet: { type: String, required: true },
  ts: { type: String, required: true },
  te: { type: String, required: true },
  from: { type: String, required: true },
  phone: { type: String, required: true },
  priority: { type: String, required: true },
});

// Create the MassIncidient model
const MassIncidient = mongoose.model<MassIncidient & Document>(
  "MassIncidient",
  massIncidientSchema
);

export default MassIncidient;
