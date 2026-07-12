using System.Net.Http.Json;
using Microsoft.Extensions.Options;
using OtoTr.WhatsApp.Api.Configuration;
using OtoTr.WhatsApp.Api.Models;

namespace OtoTr.WhatsApp.Api.Services;

public interface IErpGateway
{
    Task<IReadOnlyList<ErpBranch>> GetBranchesAsync(string? city, CancellationToken cancellationToken);
    Task<IReadOnlyList<ErpPackage>> GetPackagesAsync(Guid branchId, CancellationToken cancellationToken);
    Task<IReadOnlyList<ErpAppointmentSlot>> GetAppointmentSlotsAsync(Guid branchId, Guid packageId, DateOnly date, CancellationToken cancellationToken);
    Task<AppointmentCreatedResult> CreateAppointmentAsync(CreateAppointmentCommand command, CancellationToken cancellationToken);
    Task<SupportTicketCreatedResult> CreateSupportTicketAsync(CreateSupportTicketCommand command, CancellationToken cancellationToken);
    Task<FranchiseLeadCreatedResult> CreateFranchiseLeadAsync(CreateFranchiseLeadCommand command, CancellationToken cancellationToken);
    Task<ReportLookupResult> LookupReportAsync(string phone, string lookupValue, CancellationToken cancellationToken);
    Task<GuaranteeLookupResult> LookupGuaranteeAsync(string phone, string lookupValue, CancellationToken cancellationToken);
}

public sealed class ErpGateway : IErpGateway
{
    private readonly HttpClient _httpClient;
    private readonly ErpOptions _options;

    public ErpGateway(HttpClient httpClient, IOptions<ErpOptions> options)
    {
        _httpClient = httpClient;
        _options = options.Value;

        if (!string.IsNullOrWhiteSpace(_options.BaseUrl))
        {
            _httpClient.BaseAddress = new Uri(_options.BaseUrl.TrimEnd('/') + "/");
        }

        _httpClient.Timeout = TimeSpan.FromSeconds(Math.Clamp(_options.TimeoutSeconds, 5, 120));
        if (!string.IsNullOrWhiteSpace(_options.ServiceApiKey))
        {
            _httpClient.DefaultRequestHeaders.TryAddWithoutValidation("X-OTOTR-SERVICE-KEY", _options.ServiceApiKey);
        }
    }

    public async Task<IReadOnlyList<ErpBranch>> GetBranchesAsync(string? city, CancellationToken cancellationToken)
    {
        var endpoint = "internal/whatsapp/branches";
        if (!string.IsNullOrWhiteSpace(city))
        {
            endpoint += $"?city={Uri.EscapeDataString(city.Trim())}";
        }

        return await GetAsync<List<ErpBranch>>(endpoint, cancellationToken) ?? [];
    }

    public async Task<IReadOnlyList<ErpPackage>> GetPackagesAsync(Guid branchId, CancellationToken cancellationToken) =>
        await GetAsync<List<ErpPackage>>(
            $"internal/whatsapp/branches/{branchId}/packages",
            cancellationToken) ?? [];

    public async Task<IReadOnlyList<ErpAppointmentSlot>> GetAppointmentSlotsAsync(
        Guid branchId,
        Guid packageId,
        DateOnly date,
        CancellationToken cancellationToken) =>
        await GetAsync<List<ErpAppointmentSlot>>(
            $"internal/whatsapp/appointment-slots?branchId={branchId}&packageId={packageId}&date={date:yyyy-MM-dd}",
            cancellationToken) ?? [];

    public Task<AppointmentCreatedResult> CreateAppointmentAsync(
        CreateAppointmentCommand command,
        CancellationToken cancellationToken) =>
        PostAsync<CreateAppointmentCommand, AppointmentCreatedResult>(
            "internal/whatsapp/appointments",
            command,
            cancellationToken);

    public Task<SupportTicketCreatedResult> CreateSupportTicketAsync(
        CreateSupportTicketCommand command,
        CancellationToken cancellationToken) =>
        PostAsync<CreateSupportTicketCommand, SupportTicketCreatedResult>(
            "internal/whatsapp/support-tickets",
            command,
            cancellationToken);

    public Task<FranchiseLeadCreatedResult> CreateFranchiseLeadAsync(
        CreateFranchiseLeadCommand command,
        CancellationToken cancellationToken) =>
        PostAsync<CreateFranchiseLeadCommand, FranchiseLeadCreatedResult>(
            "internal/whatsapp/franchise-leads",
            command,
            cancellationToken);

    public Task<ReportLookupResult> LookupReportAsync(
        string phone,
        string lookupValue,
        CancellationToken cancellationToken) =>
        GetRequiredAsync<ReportLookupResult>(
            $"internal/whatsapp/reports/lookup?phone={Uri.EscapeDataString(phone)}&value={Uri.EscapeDataString(lookupValue)}",
            cancellationToken);

    public Task<GuaranteeLookupResult> LookupGuaranteeAsync(
        string phone,
        string lookupValue,
        CancellationToken cancellationToken) =>
        GetRequiredAsync<GuaranteeLookupResult>(
            $"internal/whatsapp/guarantees/lookup?phone={Uri.EscapeDataString(phone)}&value={Uri.EscapeDataString(lookupValue)}",
            cancellationToken);

    private async Task<T?> GetAsync<T>(string endpoint, CancellationToken cancellationToken)
    {
        EnsureConfigured();
        using var response = await _httpClient.GetAsync(endpoint, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
        return await response.Content.ReadFromJsonAsync<T>(cancellationToken: cancellationToken);
    }

    private async Task<T> GetRequiredAsync<T>(string endpoint, CancellationToken cancellationToken)
    {
        var result = await GetAsync<T>(endpoint, cancellationToken);
        return result ?? throw new InvalidOperationException($"ERP returned an empty response for {typeof(T).Name}.");
    }

    private async Task<TResponse> PostAsync<TRequest, TResponse>(
        string endpoint,
        TRequest request,
        CancellationToken cancellationToken)
    {
        EnsureConfigured();
        using var response = await _httpClient.PostAsJsonAsync(endpoint, request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
        return await response.Content.ReadFromJsonAsync<TResponse>(cancellationToken: cancellationToken)
            ?? throw new InvalidOperationException($"ERP returned an empty response for {typeof(TResponse).Name}.");
    }

    private void EnsureConfigured()
    {
        if (_httpClient.BaseAddress is null)
        {
            throw new InvalidOperationException("ERP base URL is not configured.");
        }
    }

    private static async Task EnsureSuccessAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        throw new HttpRequestException(
            $"ERP request failed with status {(int)response.StatusCode}: {body}",
            null,
            response.StatusCode);
    }
}
