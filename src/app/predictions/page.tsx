import type { Metadata } from "next";
import PredictionsClient from "./PredictionsClient";

export const metadata: Metadata = {
  title: "Predictions | WC26 The Boys Trip",
  description: "Make your WC26 predictions — who wins the cup, golden boot, golden ball, and more. One pick per person.",
};

export default function PredictionsPage() {
  return <PredictionsClient />;
}
