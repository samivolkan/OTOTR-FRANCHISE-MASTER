import baseSchema from "../data/expertise/ototr_expertise_schema_otorapor_2614045.json" with { type: "json" };
import extensionSchema from "../data/expertise/ototr_schema_extension_v1.json" with { type: "json" };
import optionLabelMap from "../data/expertise/ototr_option_label_map_starter.json" with { type: "json" };
import plusProSchema from "../data/expertise/ototr_expertise_schema_otorapor_2614045_PLUS_PRO.json" with { type: "json" };

export const UNRESOLVED_OPTION_LABEL = "Seçenek etiketi doğrulanacak";

export function resolveOptionLabel(option, optionMap = optionLabelMap) {
  if (option?.label) return option.label;
  if (option?.optionType === "checkbox" && option?.value != null) {
    const mapped = optionMap?.unknownNumericOptionLabels?.[String(option.value)];
    if (mapped?.label) return mapped.label;
    return UNRESOLVED_OPTION_LABEL;
  }
  return "Seçenek";
}

export function getOptionLabelMap() {
  return optionLabelMap;
}

export function getProfessionalReferenceSchema() {
  return plusProSchema;
}

export function getRuntimeExpertiseSchema() {
  const collections = extensionSchema.newTopLevelCollections ?? {};

  return {
    reportMeta: collections.reportMeta ?? {},
    customerSellerIdentity: collections.customerSellerIdentity ?? {},
    vehicleIdentity: collections.vehicleIdentity ?? {},
    vehicleTechnicalProfile: collections.vehicleTechnicalProfile ?? {},
    inspectionGroups: baseSchema.groups ?? [],
    measurementRawData: collections.measurementRawData ?? {},
    obdDetailedScan: collections.obdDetailedScan ?? {},
    registryQueries: collections.registryQueries ?? {},
    evidenceGallery: collections.evidenceGallery ?? {},
    consentAndLegal: collections.consentAndLegal ?? {},
    summaryAndRisk: collections.summaryAndRisk ?? {},
    priceValueAndGuarantee: collections.priceValueAndGuarantee ?? {},
    stats: {
      ...(baseSchema.stats ?? {}),
      baseGroupCount: (baseSchema.groups ?? []).length,
      baseItemCount: (baseSchema.groups ?? []).flatMap((group) => group.items ?? []).length,
      unknownLabelSummary: optionLabelMap.summary ?? {},
      plusProReferenceAvailable: Boolean(plusProSchema?.professionalExtension)
    },
    validation: {
      base: baseSchema.validation ?? {},
      extensionAcceptanceCriteria: extensionSchema.acceptanceCriteria ?? [],
      integrationRules: extensionSchema.integrationRules ?? {},
      optionLabelRules: optionLabelMap.renderFallbackRules ?? {},
      optionReviewQueue: optionLabelMap.unknownItemsReviewList ?? []
    }
  };
}
