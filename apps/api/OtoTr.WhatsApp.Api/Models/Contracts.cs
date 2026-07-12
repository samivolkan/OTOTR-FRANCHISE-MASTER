namespace OtoTr.WhatsApp.Api.Models;

public sealed record ParsedInboundMessage(
    string WaId,
    string? DisplayName,
    string MetaMessageId,
    string MessageType,
    string? Text,
    string? SelectionId,
    string? SelectionTitle,
    decimal? Latitude,
    decimal? Longitude,
    string RawJson);

public sealed record SendTextRequest(string RecipientWaId, string Text, bool PreviewUrl = false);

public sealed record SendTemplateRequest(
    string RecipientWaId,
    string TemplateName,
    string LanguageCode,
    IReadOnlyList<string>? BodyParameters = null);

public sealed record AgentMessageRequest(string Text);

public sealed record AssignConversationRequest(string AgentUserId);

public sealed record BotStatusRequest(bool Enabled);

public sealed record ConversationListItem(
    Guid Id,
    string WaId,
    string PhoneNumber,
    string? DisplayName,
    string Status,
    string State,
    string? Intent,
    bool BotEnabled,
    string? AssignedAgentUserId,
    Guid? BranchId,
    DateTime UpdatedAtUtc,
    int UnreadCount);

public sealed record ConversationMessageItem(
    Guid Id,
    string Direction,
    string MessageType,
    string Status,
    string? TextBody,
    DateTime CreatedAtUtc);

public sealed record ConversationDetail(
    ConversationListItem Conversation,
    IReadOnlyList<ConversationMessageItem> Messages);

public sealed record ErpBranch(
    Guid Id,
    string Name,
    string City,
    string District,
    string? Address,
    decimal? Latitude,
    decimal? Longitude,
    bool IsActive);

public sealed record ErpPackage(
    Guid Id,
    string Name,
    decimal Price,
    string Currency,
    string? ShortDescription,
    bool IsActive);

public sealed record ErpAppointmentSlot(string Value, string DisplayText, bool IsAvailable);

public sealed record CreateAppointmentCommand(
    string CustomerPhone,
    string? CustomerName,
    Guid BranchId,
    Guid PackageId,
    DateOnly AppointmentDate,
    TimeOnly AppointmentTime,
    string Plate,
    string Source,
    string? Notes);

public sealed record AppointmentCreatedResult(
    Guid AppointmentId,
    string AppointmentNumber,
    string BranchName,
    string PackageName,
    DateTime AppointmentDateTime,
    string Status);

public sealed record CreateSupportTicketCommand(
    string CustomerPhone,
    string? CustomerName,
    string Category,
    string Description,
    Guid? BranchId,
    string Source,
    Guid ConversationId);

public sealed record SupportTicketCreatedResult(Guid TicketId, string TicketNumber, string Status);

public sealed record CreateFranchiseLeadCommand(
    string Phone,
    string? Name,
    string City,
    string? InvestmentRange,
    string Source,
    Guid ConversationId);

public sealed record FranchiseLeadCreatedResult(Guid LeadId, string LeadNumber, string Status);

public sealed record ReportLookupResult(
    bool Found,
    string? ReportNumber,
    string? Plate,
    string? Vehicle,
    DateTime? ReportDate,
    string? Status,
    string? PublicReportUrl);

public sealed record GuaranteeLookupResult(
    bool Found,
    bool Eligible,
    string? Plate,
    string? PackageName,
    DateTime? CoverageEndDate,
    int? RemainingKilometers,
    string? Explanation);
