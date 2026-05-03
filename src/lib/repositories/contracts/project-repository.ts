export type ProjectCategoryValue =
  | "RESIDENTIAL"
  | "COMMERCIAL"
  | "INTERIOR"
  | "ENGINEERING"
  | "MEP"
  | "RENOVATION";

export type PublishStatusValue = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type ProjectRecord = {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  location: string;
  city: string;
  category: ProjectCategoryValue;
  status: PublishStatusValue;
  featured: boolean;
  sortOrder: number;
  ownerId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProjectInput = {
  slug: string;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  location: string;
  city: string;
  category: ProjectCategoryValue;
  status?: PublishStatusValue;
  featured?: boolean;
  sortOrder?: number;
  ownerId?: string;
};

export interface IProjectRepository {
  findById(id: string): Promise<ProjectRecord | null>;
  findBySlug(slug: string): Promise<ProjectRecord | null>;
  listPublished(category?: ProjectCategoryValue): Promise<ProjectRecord[]>;
  create(input: CreateProjectInput): Promise<ProjectRecord>;
}

export type ProjectRepository = IProjectRepository;
