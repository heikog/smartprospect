export type CampaignStatus =
  | "draft"
  | "generating"
  | "review"
  | "approved"
  | "sent";

export type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  createdAt: string;
  prospectCount: number;
  progress?: number;
};
