namespace OtoTr.WhatsApp.Api.Configuration;

public sealed class WhatsAppOptions
{
    public const string SectionName = "WhatsApp";

    public string GraphApiVersion { get; init; } = string.Empty;
    public string PhoneNumberId { get; init; } = string.Empty;
    public string WhatsAppBusinessAccountId { get; init; } = string.Empty;
    public string AccessToken { get; init; } = string.Empty;
    public string AppSecret { get; init; } = string.Empty;
    public string WebhookVerifyToken { get; init; } = string.Empty;
    public string PrivacyNoticeUrl { get; init; } = string.Empty;
    public string DefaultLanguageCode { get; init; } = "tr";
    public string SupportQueueName { get; init; } = "OtoTR Müşteri Hizmetleri";
    public bool ValidateWebhookSignature { get; init; } = true;
}

public sealed class ErpOptions
{
    public const string SectionName = "Erp";

    public string BaseUrl { get; init; } = string.Empty;
    public string ServiceApiKey { get; init; } = string.Empty;
    public int TimeoutSeconds { get; init; } = 20;
}

public sealed class AuthOptions
{
    public const string SectionName = "Auth";

    public string Authority { get; init; } = string.Empty;
    public string Audience { get; init; } = string.Empty;
    public bool RequireHttpsMetadata { get; init; } = true;
}
