import mongoose, { Schema, Document, Model } from "mongoose";

// Определение интерфейса для объекта MassIncidient
interface MassIncidient extends Document {
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

// Создание схемы для объекта MassIncidient
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

// Создание модели MassIncidient
const MassIncidient: Model<MassIncidient> = mongoose.model<MassIncidient>(
  "MassIncidient",
  massIncidientSchema
);

export default MassIncidient;
