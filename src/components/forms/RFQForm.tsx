"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

import {
  createRfqUploadSignatureAction,
  submitRfqAction,
  type CreateRfqUploadSignatureActionResult,
} from "@/app/actions/submit-rfq";
import { useLocale } from "@/lib/hooks/use-locale";
import {
  createRfqSchema,
  inferFileType,
  mapPortfolioCategoryToProjectType,
  RFQ_BUDGET_RANGES,
  RFQ_CITIES,
  RFQ_MAX_FILES,
  RFQ_MAX_FILE_SIZE_BYTES,
  RFQ_PROJECT_TYPES,
  RFQ_TIMELINES,
  type RfqFileType,
  type RfqPayload,
} from "@/validations/rfq";

type RFQFormProps = {
  initialCategory: string;
};

type UploadStatus = "uploading" | "uploaded" | "error";

type UploadItem = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  type: RfqFileType;
  status: UploadStatus;
  progress: number;
  url?: string;
  fileId?: string;
  previewUrl?: string;
  error?: string;
  sourceFile?: File;
};

type ImageKitUploadResult = {
  url: string;
  fileId: string;
};

type UploadSignatureData = Extract<
  CreateRfqUploadSignatureActionResult,
  { success: true }
>["data"];

type ImageKitSignatureData = Extract<UploadSignatureData, { mode: "imagekit" }>;
type MockSignatureData = Extract<UploadSignatureData, { mode: "mock" }>;

const STEP_FIELD_NAMES: string[][] = [
  ["projectType", "location", "city", "budgetRange", "timeline", "description"],
  ["contact.name", "contact.email", "contact.phone", "contact.company"],
  ["files"],
];

const BUDGET_KEY_BY_VALUE: Record<RfqPayload["budgetRange"], string> = {
  "<500k SAR": "lt500k",
  "500k-2M SAR": "from500kTo2m",
  "2M-5M SAR": "from2mTo5m",
  "5M+ SAR": "above5m",
};

const TIMELINE_KEY_BY_VALUE: Record<RfqPayload["timeline"], string> = {
  "Urgent <1mo": "urgent",
  "1-3mo": "oneToThree",
  "3-6mo": "threeToSix",
  "6mo+": "sixPlus",
};

function createUploadId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `upload-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function uploadToImageKit(
  file: File,
  uploadData: ImageKitSignatureData,
  onProgress: (progress: number) => void,
): Promise<ImageKitUploadResult> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    const formData = new FormData();

    request.open("POST", uploadData.uploadUrl);

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      const progress = Math.round((event.loaded / event.total) * 100);
      onProgress(progress);
    };

    request.onerror = () => reject(new Error("Upload request failed."));

    request.onload = () => {
      if (request.status < 200 || request.status >= 300) {
        reject(new Error("Upload request was rejected by ImageKit."));
        return;
      }

      try {
        const response = JSON.parse(request.responseText) as {
          url?: string;
          fileId?: string;
        };

        if (!response.url || !response.fileId) {
          reject(new Error("ImageKit did not return file information."));
          return;
        }

        resolve({
          url: response.url,
          fileId: response.fileId,
        });
      } catch {
        reject(new Error("Unable to parse ImageKit response."));
      }
    };

    formData.append("file", file);
    formData.append("fileName", uploadData.fileName);
    formData.append("publicKey", uploadData.publicKey);
    formData.append("signature", uploadData.signature);
    formData.append("expire", String(uploadData.expire));
    formData.append("token", uploadData.token);
    formData.append("folder", uploadData.folder);
    formData.append("useUniqueFileName", "true");

    request.send(formData);
  });
}

async function uploadInMockMode(
  uploadData: MockSignatureData,
  onProgress: (progress: number) => void,
): Promise<ImageKitUploadResult> {
  onProgress(35);
  await Promise.resolve();
  onProgress(80);
  await Promise.resolve();
  onProgress(100);

  const fileId = `mock-${createUploadId()}`;

  return {
    url: `${uploadData.mockPublicUrlBase}/${uploadData.fileName}`,
    fileId,
  };
}

function mapUploadItemsToPayload(items: UploadItem[]): RfqPayload["files"] {
  return items
    .filter((item) => item.status === "uploaded" && item.url && item.fileId)
    .map((item) => ({
      url: item.url as string,
      type: item.type,
      name: item.name,
      mimeType: item.mimeType,
      size: item.size,
      fileId: item.fileId,
    }));
}

export function RFQForm({ initialCategory }: RFQFormProps) {
  const { locale, t } = useLocale();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [submissionError, setSubmissionError] = useState<string>("");

  const draftKey = `rfq-form-draft-${locale}`;
  const draftRecovered = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(window.localStorage.getItem(draftKey));
  }, [draftKey]);

  const schema = useMemo(() => createRfqSchema((key) => t(key)), [t]);
  const defaultProjectType = mapPortfolioCategoryToProjectType(initialCategory);

  const form = useForm<RfqPayload>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    defaultValues: {
      projectType: defaultProjectType,
      location: "",
      city: "Riyadh",
      budgetRange: "500k-2M SAR",
      timeline: "1-3mo",
      description: "",
      contact: {
        name: "",
        email: "",
        phone: "",
        company: "",
      },
      files: [],
    },
  });

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    setValue,
    setError,
    clearErrors,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const watchedValues = useWatch({ control });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const draftRaw = window.localStorage.getItem(draftKey);

    if (!draftRaw) {
      return;
    }

    try {
      const draft = JSON.parse(draftRaw) as Partial<RfqPayload>;
      const mergedDraft: RfqPayload = {
        projectType: draft.projectType ?? defaultProjectType,
        location: draft.location ?? "",
        city: draft.city ?? "Riyadh",
        budgetRange: draft.budgetRange ?? "500k-2M SAR",
        timeline: draft.timeline ?? "1-3mo",
        description: draft.description ?? "",
        contact: {
          name: draft.contact?.name ?? "",
          email: draft.contact?.email ?? "",
          phone: draft.contact?.phone ?? "",
          company: draft.contact?.company ?? "",
        },
        files: draft.files ?? [],
      };

      reset(mergedDraft);

      if ((draft.files ?? []).length > 0) {
        const restoredUploads = (draft.files ?? []).map((file) => ({
          id: createUploadId(),
          name: file.name,
          mimeType: file.mimeType,
          size: file.size,
          type: file.type,
          status: "uploaded" as const,
          progress: 100,
          url: file.url,
          fileId: file.fileId,
        }));

        window.requestAnimationFrame(() => {
          setUploadItems(restoredUploads);
        });
      }
    } catch {
      window.localStorage.removeItem(draftKey);
    }
  }, [defaultProjectType, draftKey, reset]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const draft: Partial<RfqPayload> = {
      projectType: watchedValues.projectType,
      location: watchedValues.location,
      city: watchedValues.city,
      budgetRange: watchedValues.budgetRange,
      timeline: watchedValues.timeline,
      description: watchedValues.description,
      contact: {
        name: watchedValues.contact?.name ?? "",
        email: watchedValues.contact?.email ?? "",
        phone: watchedValues.contact?.phone ?? "",
        company: watchedValues.contact?.company ?? "",
      },
      files: mapUploadItemsToPayload(uploadItems),
    };

    window.localStorage.setItem(draftKey, JSON.stringify(draft));
  }, [draftKey, uploadItems, watchedValues]);

  useEffect(() => {
    const formFiles = mapUploadItemsToPayload(uploadItems);

    setValue("files", formFiles, { shouldValidate: true });
  }, [setValue, uploadItems]);

  useEffect(() => {
    return () => {
      uploadItems.forEach((item) => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
    };
  }, [uploadItems]);

  const uploadFile = async (itemId: string, file: File) => {
    const itemType = inferFileType(file.name, file.type);

    if (!itemType) {
      setUploadItems((current) =>
        current.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: "error",
                error: t("forms.rfq.files.error"),
                progress: 0,
              }
            : item,
        ),
      );
      return;
    }

    const signatureResponse = await createRfqUploadSignatureAction({
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      projectType: watchedValues.projectType ?? defaultProjectType,
    });

    if (!signatureResponse.success) {
      setUploadItems((current) =>
        current.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: "error",
                error: signatureResponse.message,
              }
            : item,
        ),
      );

      return;
    }

    try {
      const uploadResult =
        signatureResponse.data.mode === "imagekit"
          ? await uploadToImageKit(file, signatureResponse.data, (progress) => {
              setUploadItems((current) =>
                current.map((item) =>
                  item.id === itemId
                    ? {
                        ...item,
                        progress,
                      }
                    : item,
                ),
              );
            })
          : await uploadInMockMode(signatureResponse.data, (progress) => {
              setUploadItems((current) =>
                current.map((item) =>
                  item.id === itemId
                    ? {
                        ...item,
                        progress,
                      }
                    : item,
                ),
              );
            });

      setUploadItems((current) =>
        current.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: "uploaded",
                progress: 100,
                url: uploadResult.url,
                fileId: uploadResult.fileId,
                error: undefined,
              }
            : item,
        ),
      );

      clearErrors("files");
    } catch {
      setUploadItems((current) =>
        current.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status: "error",
                error: t("forms.rfq.files.uploadError"),
                progress: 0,
              }
            : item,
        ),
      );
    }
  };

  const onDrop = async (acceptedFiles: File[]) => {
    setSubmissionError("");

    const existingCount = uploadItems.length;

    if (existingCount + acceptedFiles.length > RFQ_MAX_FILES) {
      setError("files", {
        message: t("forms.rfq.files.error"),
      });

      return;
    }

    for (const file of acceptedFiles) {
      const type = inferFileType(file.name, file.type);

      if (!type || file.size > RFQ_MAX_FILE_SIZE_BYTES) {
        setError("files", {
          message: t("forms.rfq.files.error"),
        });
        continue;
      }

      const itemId = createUploadId();
      const previewUrl = type === "image" ? URL.createObjectURL(file) : undefined;

      setUploadItems((current) => [
        ...current,
        {
          id: itemId,
          name: file.name,
          mimeType: file.type,
          size: file.size,
          type,
          status: "uploading",
          progress: 0,
          sourceFile: file,
          previewUrl,
        },
      ]);

      await uploadFile(itemId, file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    maxFiles: RFQ_MAX_FILES,
    accept: {
      "application/pdf": [".pdf"],
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/vnd.dwg": [".dwg"],
      "application/acad": [".dwg"],
      "application/x-acad": [".dwg"],
      "application/dwg": [".dwg"],
    },
  });

  const onNextStep = async () => {
    const fieldNames = STEP_FIELD_NAMES[currentStep] ?? [];
    const isValid = await trigger(fieldNames as never, { shouldFocus: true });

    if (!isValid) {
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, 2));
  };

  const onPreviousStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const removeFile = (itemId: string) => {
    setUploadItems((current) => {
      const target = current.find((item) => item.id === itemId);

      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return current.filter((item) => item.id !== itemId);
    });
  };

  const retryUpload = async (itemId: string) => {
    const target = uploadItems.find((item) => item.id === itemId);

    if (!target?.sourceFile) {
      return;
    }

    setUploadItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: "uploading",
              error: undefined,
              progress: 0,
            }
          : item,
      ),
    );

    await uploadFile(itemId, target.sourceFile);
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmissionError("");

    const response = await submitRfqAction(values);

    if (!response.success) {
      if (response.fieldErrors) {
        for (const [fieldName, messages] of Object.entries(response.fieldErrors)) {
          const firstError = messages[0];

          if (!firstError) {
            continue;
          }

          setError(fieldName as never, {
            type: "server",
            message: firstError,
          });
        }
      }

      setSubmissionError(response.message);
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.removeItem(draftKey);
    }

    const category = encodeURIComponent(values.projectType);
    const reference = encodeURIComponent(response.submissionId);

    router.push(
      `/${locale}/rfq/success?reference=${reference}&category=${category}` as never,
    );
  });

  const dropzoneInputProps = getInputProps();

  const isUploading = uploadItems.some((item) => item.status === "uploading");
  const isArabic = locale === "ar";

  return (
    <form
      onSubmit={onSubmit}
      className="surface-card grid gap-6 px-5 py-6"
      aria-label="rfq-form"
    >
      <div className="grid gap-3" data-testid="rfq-step-indicator">
        <div className="flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
          <span>{t("forms.rfq.progressLabel")}</span>
          <span>{`${currentStep + 1}/3`}</span>
        </div>
        <progress
          value={currentStep + 1}
          max={3}
          className="h-2 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-slate-200 [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary"
        />
        <ol
          className={`grid gap-2 text-sm font-semibold ${isArabic ? "text-right" : "text-left"}`}
        >
          <li className={currentStep >= 0 ? "text-primary" : "text-slate-500"}>
            {t("forms.rfq.steps.project")}
          </li>
          <li className={currentStep >= 1 ? "text-primary" : "text-slate-500"}>
            {t("forms.rfq.steps.contact")}
          </li>
          <li className={currentStep >= 2 ? "text-primary" : "text-slate-500"}>
            {t("forms.rfq.steps.files")}
          </li>
        </ol>
      </div>

      {draftRecovered ? (
        <p className="rounded-xl border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-primary">
          {t("forms.rfq.draft.restored")}
        </p>
      ) : null}

      {currentStep === 0 ? (
        <section className="grid gap-4">
          <h2 className="text-start text-xl font-bold text-primary">
            {t("forms.rfq.steps.project")}
          </h2>

          <label
            className={`grid gap-1 text-sm font-semibold text-primary ${isArabic ? "text-right" : "text-left"}`}
          >
            {t("forms.rfq.projectType.label")}
            <select
              {...register("projectType")}
              className="rounded-xl border border-primary/20 bg-white px-3 py-2 text-slate-700"
            >
              {RFQ_PROJECT_TYPES.map((projectType) => (
                <option key={projectType} value={projectType}>
                  {t(`forms.rfq.projectType.options.${projectType}`)}
                </option>
              ))}
            </select>
            {errors.projectType ? (
              <span className="text-xs text-red-700">{errors.projectType.message}</span>
            ) : null}
          </label>

          <label
            className={`grid gap-1 text-sm font-semibold text-primary ${isArabic ? "text-right" : "text-left"}`}
          >
            {t("forms.rfq.location.label")}
            <input
              type="text"
              {...register("location")}
              className="rounded-xl border border-primary/20 bg-white px-3 py-2 text-slate-700"
            />
            {errors.location ? (
              <span className="text-xs text-red-700">{errors.location.message}</span>
            ) : null}
          </label>

          <label
            className={`grid gap-1 text-sm font-semibold text-primary ${isArabic ? "text-right" : "text-left"}`}
          >
            {t("forms.rfq.city.label")}
            <select
              {...register("city")}
              className="rounded-xl border border-primary/20 bg-white px-3 py-2 text-slate-700"
            >
              {RFQ_CITIES.map((city) => (
                <option key={city} value={city}>
                  {t(`forms.rfq.city.options.${city}`)}
                </option>
              ))}
            </select>
            {errors.city ? (
              <span className="text-xs text-red-700">{errors.city.message}</span>
            ) : null}
          </label>

          <label
            className={`grid gap-1 text-sm font-semibold text-primary ${isArabic ? "text-right" : "text-left"}`}
          >
            {t("forms.rfq.budgetRange.label")}
            <select
              {...register("budgetRange")}
              className="rounded-xl border border-primary/20 bg-white px-3 py-2 text-slate-700"
            >
              {RFQ_BUDGET_RANGES.map((budget) => (
                <option key={budget} value={budget}>
                  {t(`forms.rfq.budgetRange.options.${BUDGET_KEY_BY_VALUE[budget]}`)}
                </option>
              ))}
            </select>
            {errors.budgetRange ? (
              <span className="text-xs text-red-700">{errors.budgetRange.message}</span>
            ) : null}
          </label>

          <label
            className={`grid gap-1 text-sm font-semibold text-primary ${isArabic ? "text-right" : "text-left"}`}
          >
            {t("forms.rfq.timeline.label")}
            <select
              {...register("timeline")}
              className="rounded-xl border border-primary/20 bg-white px-3 py-2 text-slate-700"
            >
              {RFQ_TIMELINES.map((timeline) => (
                <option key={timeline} value={timeline}>
                  {t(`forms.rfq.timeline.options.${TIMELINE_KEY_BY_VALUE[timeline]}`)}
                </option>
              ))}
            </select>
            {errors.timeline ? (
              <span className="text-xs text-red-700">{errors.timeline.message}</span>
            ) : null}
          </label>

          <label
            className={`grid gap-1 text-sm font-semibold text-primary ${isArabic ? "text-right" : "text-left"}`}
          >
            {t("forms.rfq.description.label")}
            <textarea
              rows={6}
              {...register("description")}
              placeholder={
                isArabic
                  ? t("forms.rfq.description.placeholderAr")
                  : t("forms.rfq.description.placeholderEn")
              }
              className="rounded-xl border border-primary/20 bg-white px-3 py-2 text-slate-700"
            />
            <span className="text-xs font-normal text-slate-500">
              {watchedValues.description?.length ?? 0}/2000
            </span>
            {errors.description ? (
              <span className="text-xs text-red-700">{errors.description.message}</span>
            ) : null}
          </label>
        </section>
      ) : null}

      {currentStep === 1 ? (
        <section className="grid gap-4">
          <h2 className="text-start text-xl font-bold text-primary">
            {t("forms.rfq.steps.contact")}
          </h2>

          <label
            className={`grid gap-1 text-sm font-semibold text-primary ${isArabic ? "text-right" : "text-left"}`}
          >
            {t("forms.rfq.contact.name.label")}
            <input
              type="text"
              {...register("contact.name")}
              className="rounded-xl border border-primary/20 bg-white px-3 py-2 text-slate-700"
            />
            {errors.contact?.name ? (
              <span className="text-xs text-red-700">{errors.contact.name.message}</span>
            ) : null}
          </label>

          <label
            className={`grid gap-1 text-sm font-semibold text-primary ${isArabic ? "text-right" : "text-left"}`}
          >
            {t("forms.rfq.contact.email.label")}
            <input
              type="email"
              {...register("contact.email")}
              className="rounded-xl border border-primary/20 bg-white px-3 py-2 text-slate-700"
            />
            {errors.contact?.email ? (
              <span className="text-xs text-red-700">{errors.contact.email.message}</span>
            ) : null}
          </label>

          <label
            className={`grid gap-1 text-sm font-semibold text-primary ${isArabic ? "text-right" : "text-left"}`}
          >
            {t("forms.rfq.contact.phone.label")}
            <input
              type="tel"
              placeholder="+9665XXXXXXXX"
              {...register("contact.phone")}
              className="rounded-xl border border-primary/20 bg-white px-3 py-2 text-slate-700"
            />
            {errors.contact?.phone ? (
              <span className="text-xs text-red-700">{errors.contact.phone.message}</span>
            ) : null}
          </label>

          <label
            className={`grid gap-1 text-sm font-semibold text-primary ${isArabic ? "text-right" : "text-left"}`}
          >
            {t("forms.rfq.contact.company.label")}
            <input
              type="text"
              {...register("contact.company")}
              className="rounded-xl border border-primary/20 bg-white px-3 py-2 text-slate-700"
            />
          </label>
        </section>
      ) : null}

      {currentStep === 2 ? (
        <section className="grid gap-5">
          <h2 className="text-start text-xl font-bold text-primary">
            {t("forms.rfq.steps.files")}
          </h2>

          <div
            {...getRootProps()}
            className={`rounded-2xl border-2 border-dashed px-4 py-8 text-center transition ${
              isDragActive ? "border-primary bg-primary/5" : "border-primary/30 bg-white"
            }`}
          >
            <input {...dropzoneInputProps} data-testid="rfq-file-input" />
            <p className="text-base font-semibold text-primary">
              {t("forms.rfq.files.label")}
            </p>
            <p className="mt-1 text-sm text-slate-600">{t("forms.rfq.files.helper")}</p>
          </div>

          {errors.files ? (
            <p className="text-xs text-red-700">{errors.files.message as string}</p>
          ) : null}

          <ul className="grid gap-3" data-testid="rfq-upload-list">
            {uploadItems.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-primary/15 bg-white px-3 py-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {item.previewUrl ? (
                      <Image
                        src={item.previewUrl}
                        alt={item.name}
                        width={56}
                        height={56}
                        unoptimized
                        className="h-14 w-14 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold uppercase text-slate-600">
                        {item.type}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-primary">{item.name}</p>
                      <p className="text-xs text-slate-600">
                        {(item.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status === "error" ? (
                      <button
                        type="button"
                        onClick={() => retryUpload(item.id)}
                        className="rounded-lg border border-primary/30 px-2 py-1 text-xs font-semibold text-primary"
                      >
                        {t("forms.rfq.files.retry")}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => removeFile(item.id)}
                      className="rounded-lg border border-red-300 px-2 py-1 text-xs font-semibold text-red-700"
                    >
                      {t("forms.rfq.files.remove")}
                    </button>
                  </div>
                </div>

                <progress
                  value={item.progress}
                  max={100}
                  className={`mt-3 h-1.5 w-full overflow-hidden rounded-full [&::-webkit-progress-bar]:bg-slate-200 ${
                    item.status === "error"
                      ? "[&::-webkit-progress-value]:bg-red-500 [&::-moz-progress-bar]:bg-red-500"
                      : "[&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary"
                  }`}
                />

                {item.error ? (
                  <p className="mt-2 text-xs text-red-700">{item.error}</p>
                ) : null}
              </li>
            ))}
          </ul>

          <section className="rounded-xl border border-primary/15 bg-slate-50 px-4 py-4">
            <h3 className="text-sm font-bold text-primary">
              {t("forms.rfq.review.title")}
            </h3>
            <dl className="mt-3 grid gap-2 text-sm text-slate-700">
              <div className="grid gap-1">
                <dt className="font-semibold">{t("forms.rfq.projectType.label")}</dt>
                <dd>{watchedValues.projectType}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-semibold">{t("forms.rfq.city.label")}</dt>
                <dd>{watchedValues.city}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-semibold">{t("forms.rfq.contact.name.label")}</dt>
                <dd>{watchedValues.contact?.name}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-semibold">{t("forms.rfq.contact.phone.label")}</dt>
                <dd>{watchedValues.contact?.phone}</dd>
              </div>
              <div className="grid gap-1">
                <dt className="font-semibold">{t("forms.rfq.files.summaryLabel")}</dt>
                <dd>{mapUploadItemsToPayload(uploadItems).length}</dd>
              </div>
            </dl>
          </section>
        </section>
      ) : null}

      {submissionError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {submissionError}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPreviousStep}
          className="rounded-xl border border-primary/25 px-4 py-2 text-sm font-semibold text-primary disabled:opacity-40"
          disabled={currentStep === 0}
        >
          {t("forms.rfq.navigation.back")}
        </button>

        {currentStep < 2 ? (
          <button
            type="button"
            onClick={onNextStep}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            {t("forms.rfq.navigation.next")}
          </button>
        ) : (
          <button
            type="submit"
            className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting
              ? t("forms.rfq.navigation.submitting")
              : t("forms.rfq.navigation.submit")}
          </button>
        )}
      </div>
    </form>
  );
}
