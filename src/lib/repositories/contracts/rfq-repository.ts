export type RFQStoredFile = {
  fileId?: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  type: "pdf" | "image" | "dwg";
};

export type CreateRFQSubmissionInput = {
  referenceNumber: string;
  projectType: string;
  location: string;
  city: string;
  budgetRange: string;
  timeline: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactCompany?: string;
  files: RFQStoredFile[];
  ipAddress: string;
};

export type RFQSubmissionRecord = {
  id: string;
  referenceNumber: string;
  submittedAt: Date;
};

export interface IRFQRepository {
  countByYear(year: number): Promise<number>;
  create(input: CreateRFQSubmissionInput): Promise<RFQSubmissionRecord>;
}

export type RFQRepository = IRFQRepository;
