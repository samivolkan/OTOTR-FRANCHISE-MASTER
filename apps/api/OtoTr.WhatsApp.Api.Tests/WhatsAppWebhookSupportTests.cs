using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using OtoTr.WhatsApp.Api.Configuration;
using OtoTr.WhatsApp.Api.Services;

namespace OtoTr.WhatsApp.Api.Tests;

public sealed class WhatsAppWebhookSupportTests
{
    [Fact]
    public void Parser_reads_text_and_interactive_messages()
    {
        const string payload = """
        {
          "entry": [{
            "changes": [{
              "value": {
                "contacts": [{"profile":{"name":"Volkan"},"wa_id":"905551112233"}],
                "messages": [
                  {"from":"905551112233","id":"wamid.text","type":"text","text":{"body":"Merhaba"}},
                  {"from":"905551112233","id":"wamid.button","type":"interactive","interactive":{"type":"button_reply","button_reply":{"id":"role_customer","title":"Müşteriyim"}}}
                ]
              }
            }]
          }]
        }
        """;

        var parser = new WhatsAppWebhookParser();
        var messages = parser.ParseInboundMessages(payload);

        Assert.Equal(2, messages.Count);
        Assert.Equal("Merhaba", messages[0].Text);
        Assert.Equal("Volkan", messages[0].DisplayName);
        Assert.Equal("role_customer", messages[1].SelectionId);
        Assert.Equal("Müşteriyim", messages[1].SelectionTitle);
    }

    [Fact]
    public void Parser_reads_delivery_status()
    {
        const string payload = """
        {
          "entry": [{
            "changes": [{
              "value": {
                "statuses": [{"id":"wamid.1","status":"delivered","timestamp":"1780000000"}]
              }
            }]
          }]
        }
        """;

        var parser = new WhatsAppWebhookParser();
        var statuses = parser.ParseStatusUpdates(payload);

        Assert.Single(statuses);
        Assert.Equal("wamid.1", statuses[0].MetaMessageId);
        Assert.Equal("delivered", statuses[0].Status);
    }

    [Fact]
    public void Signature_validator_accepts_matching_hmac_and_rejects_wrong_value()
    {
        const string body = "{\"object\":\"whatsapp_business_account\"}";
        const string secret = "test-app-secret";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var signature = "sha256=" + Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(body))).ToLowerInvariant();

        var validator = new WebhookSignatureValidator(Options.Create(new WhatsAppOptions
        {
            AppSecret = secret,
            ValidateWebhookSignature = true
        }));

        Assert.True(validator.IsValid(body, signature));
        Assert.False(validator.IsValid(body, "sha256=00"));
    }
}
