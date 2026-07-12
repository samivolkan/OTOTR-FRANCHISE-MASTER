using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Options;
using OtoTr.WhatsApp.Api.Configuration;
using OtoTr.WhatsApp.Api.Models;

namespace OtoTr.WhatsApp.Api.Services;

public interface IWebhookSignatureValidator
{
    bool IsValid(string rawBody, string? signatureHeader);
}

public sealed class WebhookSignatureValidator(IOptions<WhatsAppOptions> options) : IWebhookSignatureValidator
{
    private readonly WhatsAppOptions _options = options.Value;

    public bool IsValid(string rawBody, string? signatureHeader)
    {
        if (!_options.ValidateWebhookSignature)
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(_options.AppSecret) ||
            string.IsNullOrWhiteSpace(signatureHeader) ||
            !signatureHeader.StartsWith("sha256=", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var suppliedHex = signatureHeader[7..];
        byte[] supplied;
        try
        {
            supplied = Convert.FromHexString(suppliedHex);
        }
        catch (FormatException)
        {
            return false;
        }

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(_options.AppSecret));
        var calculated = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawBody));
        return supplied.Length == calculated.Length && CryptographicOperations.FixedTimeEquals(supplied, calculated);
    }
}

public sealed record WebhookStatusUpdate(string MetaMessageId, string Status, DateTime StatusAtUtc);

public interface IWhatsAppWebhookParser
{
    IReadOnlyList<ParsedInboundMessage> ParseInboundMessages(string rawJson);
    IReadOnlyList<WebhookStatusUpdate> ParseStatusUpdates(string rawJson);
}

public sealed class WhatsAppWebhookParser : IWhatsAppWebhookParser
{
    public IReadOnlyList<ParsedInboundMessage> ParseInboundMessages(string rawJson)
    {
        using var document = JsonDocument.Parse(rawJson);
        var output = new List<ParsedInboundMessage>();

        foreach (var value in EnumerateValues(document.RootElement))
        {
            var displayNames = ReadContactNames(value);
            if (!value.TryGetProperty("messages", out var messages) || messages.ValueKind != JsonValueKind.Array)
            {
                continue;
            }

            foreach (var message in messages.EnumerateArray())
            {
                var waId = ReadString(message, "from");
                var messageId = ReadString(message, "id");
                var type = ReadString(message, "type") ?? "unknown";
                if (string.IsNullOrWhiteSpace(waId) || string.IsNullOrWhiteSpace(messageId))
                {
                    continue;
                }

                string? text = null;
                string? selectionId = null;
                string? selectionTitle = null;
                decimal? latitude = null;
                decimal? longitude = null;

                switch (type)
                {
                    case "text":
                        if (message.TryGetProperty("text", out var textNode))
                        {
                            text = ReadString(textNode, "body");
                        }
                        break;
                    case "interactive":
                        if (message.TryGetProperty("interactive", out var interactive))
                        {
                            var interactiveType = ReadString(interactive, "type");
                            var replyNodeName = interactiveType == "list_reply" ? "list_reply" : "button_reply";
                            if (interactive.TryGetProperty(replyNodeName, out var replyNode))
                            {
                                selectionId = ReadString(replyNode, "id");
                                selectionTitle = ReadString(replyNode, "title");
                            }
                        }
                        break;
                    case "button":
                        if (message.TryGetProperty("button", out var button))
                        {
                            selectionId = ReadString(button, "payload");
                            selectionTitle = ReadString(button, "text");
                        }
                        break;
                    case "location":
                        if (message.TryGetProperty("location", out var location))
                        {
                            latitude = ReadDecimal(location, "latitude");
                            longitude = ReadDecimal(location, "longitude");
                            text = ReadString(location, "name") ?? ReadString(location, "address");
                        }
                        break;
                }

                displayNames.TryGetValue(waId, out var displayName);
                output.Add(new ParsedInboundMessage(
                    waId,
                    displayName,
                    messageId,
                    type,
                    text,
                    selectionId,
                    selectionTitle,
                    latitude,
                    longitude,
                    message.GetRawText()));
            }
        }

        return output;
    }

    public IReadOnlyList<WebhookStatusUpdate> ParseStatusUpdates(string rawJson)
    {
        using var document = JsonDocument.Parse(rawJson);
        var output = new List<WebhookStatusUpdate>();

        foreach (var value in EnumerateValues(document.RootElement))
        {
            if (!value.TryGetProperty("statuses", out var statuses) || statuses.ValueKind != JsonValueKind.Array)
            {
                continue;
            }

            foreach (var statusNode in statuses.EnumerateArray())
            {
                var messageId = ReadString(statusNode, "id");
                var status = ReadString(statusNode, "status");
                if (string.IsNullOrWhiteSpace(messageId) || string.IsNullOrWhiteSpace(status))
                {
                    continue;
                }

                var timestampText = ReadString(statusNode, "timestamp");
                var timestamp = long.TryParse(timestampText, out var unixSeconds)
                    ? DateTimeOffset.FromUnixTimeSeconds(unixSeconds).UtcDateTime
                    : DateTime.UtcNow;
                output.Add(new WebhookStatusUpdate(messageId, status, timestamp));
            }
        }

        return output;
    }

    private static IEnumerable<JsonElement> EnumerateValues(JsonElement root)
    {
        if (!root.TryGetProperty("entry", out var entries) || entries.ValueKind != JsonValueKind.Array)
        {
            yield break;
        }

        foreach (var entry in entries.EnumerateArray())
        {
            if (!entry.TryGetProperty("changes", out var changes) || changes.ValueKind != JsonValueKind.Array)
            {
                continue;
            }

            foreach (var change in changes.EnumerateArray())
            {
                if (change.TryGetProperty("value", out var value))
                {
                    yield return value;
                }
            }
        }
    }

    private static Dictionary<string, string?> ReadContactNames(JsonElement value)
    {
        var output = new Dictionary<string, string?>(StringComparer.Ordinal);
        if (!value.TryGetProperty("contacts", out var contacts) || contacts.ValueKind != JsonValueKind.Array)
        {
            return output;
        }

        foreach (var contact in contacts.EnumerateArray())
        {
            var waId = ReadString(contact, "wa_id");
            if (string.IsNullOrWhiteSpace(waId))
            {
                continue;
            }

            string? name = null;
            if (contact.TryGetProperty("profile", out var profile))
            {
                name = ReadString(profile, "name");
            }
            output[waId] = name;
        }

        return output;
    }

    private static string? ReadString(JsonElement element, string propertyName) =>
        element.TryGetProperty(propertyName, out var property) && property.ValueKind == JsonValueKind.String
            ? property.GetString()
            : null;

    private static decimal? ReadDecimal(JsonElement element, string propertyName)
    {
        if (!element.TryGetProperty(propertyName, out var property))
        {
            return null;
        }

        return property.ValueKind switch
        {
            JsonValueKind.Number when property.TryGetDecimal(out var number) => number,
            JsonValueKind.String when decimal.TryParse(property.GetString(), out var number) => number,
            _ => null
        };
    }
}
