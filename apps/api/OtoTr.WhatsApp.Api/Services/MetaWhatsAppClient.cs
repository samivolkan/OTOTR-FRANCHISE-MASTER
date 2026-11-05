using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Options;
using OtoTr.WhatsApp.Api.Configuration;

namespace OtoTr.WhatsApp.Api.Services;

public interface IMetaWhatsAppClient
{
    Task<MetaSendResult> SendTextAsync(string recipientWaId, string text, bool previewUrl, CancellationToken cancellationToken);
    Task<MetaSendResult> SendReplyButtonsAsync(string recipientWaId, string body, IReadOnlyList<ReplyButtonOption> buttons, CancellationToken cancellationToken);
    Task<MetaSendResult> SendListAsync(string recipientWaId, string body, string actionText, IReadOnlyList<ListSectionOption> sections, CancellationToken cancellationToken);
    Task<MetaSendResult> SendTemplateAsync(string recipientWaId, string templateName, string languageCode, IReadOnlyList<string>? bodyParameters, CancellationToken cancellationToken);
}

public sealed record ReplyButtonOption(string Id, string Title);
public sealed record ListRowOption(string Id, string Title, string? Description = null);
public sealed record ListSectionOption(string Title, IReadOnlyList<ListRowOption> Rows);
public sealed record MetaSendResult(string MessageId, string RawResponse);

public sealed class MetaWhatsAppClient : IMetaWhatsAppClient
{
    private readonly HttpClient _httpClient;
    private readonly WhatsAppOptions _options;
    private readonly ILogger<MetaWhatsAppClient> _logger;

    public MetaWhatsAppClient(
        HttpClient httpClient,
        IOptions<WhatsAppOptions> options,
        ILogger<MetaWhatsAppClient> logger)
    {
        _httpClient = httpClient;
        _options = options.Value;
        _logger = logger;

        _httpClient.BaseAddress = new Uri("https://graph.facebook.com/");
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _options.AccessToken);
    }

    public Task<MetaSendResult> SendTextAsync(
        string recipientWaId,
        string text,
        bool previewUrl,
        CancellationToken cancellationToken)
    {
        var payload = new
        {
            messaging_product = "whatsapp",
            recipient_type = "individual",
            to = recipientWaId,
            type = "text",
            text = new
            {
                preview_url = previewUrl,
                body = text
            }
        };

        return SendAsync(payload, cancellationToken);
    }

    public Task<MetaSendResult> SendReplyButtonsAsync(
        string recipientWaId,
        string body,
        IReadOnlyList<ReplyButtonOption> buttons,
        CancellationToken cancellationToken)
    {
        if (buttons.Count is < 1 or > 3)
        {
            throw new ArgumentOutOfRangeException(nameof(buttons), "WhatsApp reply-button messages require 1 to 3 buttons.");
        }

        var payload = new
        {
            messaging_product = "whatsapp",
            recipient_type = "individual",
            to = recipientWaId,
            type = "interactive",
            interactive = new
            {
                type = "button",
                body = new { text = body },
                action = new
                {
                    buttons = buttons.Select(button => new
                    {
                        type = "reply",
                        reply = new
                        {
                            id = button.Id,
                            title = button.Title
                        }
                    })
                }
            }
        };

        return SendAsync(payload, cancellationToken);
    }

    public Task<MetaSendResult> SendListAsync(
        string recipientWaId,
        string body,
        string actionText,
        IReadOnlyList<ListSectionOption> sections,
        CancellationToken cancellationToken)
    {
        var totalRows = sections.Sum(section => section.Rows.Count);
        if (totalRows is < 1 or > 10)
        {
            throw new ArgumentOutOfRangeException(nameof(sections), "WhatsApp list messages require 1 to 10 rows in total.");
        }

        var payload = new
        {
            messaging_product = "whatsapp",
            recipient_type = "individual",
            to = recipientWaId,
            type = "interactive",
            interactive = new
            {
                type = "list",
                body = new { text = body },
                action = new
                {
                    button = actionText,
                    sections = sections.Select(section => new
                    {
                        title = section.Title,
                        rows = section.Rows.Select(row => new
                        {
                            id = row.Id,
                            title = row.Title,
                            description = row.Description
                        })
                    })
                }
            }
        };

        return SendAsync(payload, cancellationToken);
    }

    public Task<MetaSendResult> SendTemplateAsync(
        string recipientWaId,
        string templateName,
        string languageCode,
        IReadOnlyList<string>? bodyParameters,
        CancellationToken cancellationToken)
    {
        object[]? components = null;
        if (bodyParameters is { Count: > 0 })
        {
            components =
            [
                new
                {
                    type = "body",
                    parameters = bodyParameters.Select(value => new
                    {
                        type = "text",
                        text = value
                    })
                }
            ];
        }

        var payload = new
        {
            messaging_product = "whatsapp",
            to = recipientWaId,
            type = "template",
            template = new
            {
                name = templateName,
                language = new { code = languageCode },
                components
            }
        };

        return SendAsync(payload, cancellationToken);
    }

    private async Task<MetaSendResult> SendAsync(object payload, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_options.GraphApiVersion) ||
            string.IsNullOrWhiteSpace(_options.PhoneNumberId) ||
            string.IsNullOrWhiteSpace(_options.AccessToken))
        {
            throw new InvalidOperationException("WhatsApp Cloud API configuration is incomplete.");
        }

        var endpoint = $"{_options.GraphApiVersion.Trim('/')}/{_options.PhoneNumberId}/messages";
        using var response = await _httpClient.PostAsJsonAsync(endpoint, payload, cancellationToken);
        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            _logger.LogError(
                "Meta WhatsApp send failed with status {StatusCode}. Response: {Response}",
                (int)response.StatusCode,
                responseBody);
            throw new HttpRequestException($"Meta WhatsApp send failed with status {(int)response.StatusCode}.");
        }

        using var document = JsonDocument.Parse(responseBody);
        var messageId = document.RootElement
            .GetProperty("messages")[0]
            .GetProperty("id")
            .GetString();

        if (string.IsNullOrWhiteSpace(messageId))
        {
            throw new InvalidOperationException("Meta WhatsApp response did not contain a message id.");
        }

        return new MetaSendResult(messageId, responseBody);
    }
}
