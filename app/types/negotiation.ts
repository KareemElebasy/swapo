import type { Money } from "./money";

export type NegotiationStatus = "pending" | "active" | "agreed" | "ended";
export type NegotiationUserRole = "buyer" | "seller";

export interface Offer {
  id: string;
  amount: Money;
  createdBy: NegotiationUserRole;
  createdAt: string;
}

export interface Negotiation {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  status: NegotiationStatus;
  offers: Offer[];
}
