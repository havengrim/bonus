import mongoose, { Schema, Document } from "mongoose";

// Define the schema for IncentiveFormula
const incentiveFormulaSchema = new Schema(
  {
    minMonths: { type: Number, required: true },
    maxMonths: { type: Number, required: true },
    incentiveAmount: { type: Number, required: true },
  },
  {
    timestamps: true, // Optional, to track when the formula was created/updated
  }
);

// Create and export the model
const IncentiveFormula = mongoose.model<IIncentiveFormula>("IncentiveFormula", incentiveFormulaSchema);

export interface IIncentiveFormula extends Document {
  minMonths: number;
  maxMonths: number;
  incentiveAmount: number;
}

export default IncentiveFormula;
