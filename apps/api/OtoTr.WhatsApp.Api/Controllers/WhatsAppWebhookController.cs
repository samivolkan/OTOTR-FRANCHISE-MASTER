using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using OtoTr.WhatsApp.Api.Configuration;
using OtoTr.WhatsApp.Api.Services;

namespace OtoTr.WhatsApp.Api.Controllers;

[ApiController]
[Route("api/integrations/whatsapp/webhook")]
[AllowAnonymous]
public sealed class WhatsAppWebhookController(
    IOptions<WhatsAppOptions> options,
    IWebhookSignatureValidator signatureValidator,
    IWhatsAppWebhookParser parser,
    IConversationFlowService flowService,
    IConversationRepository repository,
    ILogger<WhatsAppWebhookController> logger) : ControllerBase
{
    private readonly WhatsAppOptions _options = options.Value;

    [HttpGet]
    public IActionResult Verify(
        [FromQuery(Name = "hub.mode")] string? mode,
        [FromQuery(Name = "hub.verify_token")] string? verifyToken,
        [FromQuery(Name = "hub.challenge")] string? challenge)
    {
        if (mode == "subscribe" &&
            !string.IsNullOrWhiteSpace(verifyToken) &&
            !string.IsNullOrWhiteSpace(_options.WebhookVerifyToken) &&
            string.Equals(verifyToken, _options.WebhookVerifyToken, StringComparison.Ordinal))
        {
            return Content(challenge ?? string.Empty, "text/plain");
        }

        return Forbid();
    }

    [HttpPost]
    [RequestSizeLimit(1_048_576)]
    public async Task<IActionResult> Receive(CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(Request.Body);
        var rawBody = await reader.ReadToEndAsync(cancellationToken);
        var signature = Request.Headers["X-Hub-Signature-256"].FirstOrDefault();

        if (!signatureValidator.IsValid(rawBody, signature))
        {
            logger.LogWarning("Rejected WhatsApp webhook with invalid signature.");
            return Unauthorized();
        }

        try
        {
            foreach (var status in parser.ParseStatusUpdates(rawBody))
            {
                await repository.UpdateOutboundStatusAsync(
                    status.MetaMessageId,
                    status.Status,
                    status.StatusAtUtc,
                    cancellationToken);
            }

            foreach (var inbound in parser.ParseInboundMessages(rawBody))
            {
                await flowService.ProcessInboundAsync(inbound, cancellationToken);
            }

            return Ok();
        }
        catch (JsonException exception)
        {
            logger.LogWarning(exception, "WhatsApp webhook payload was not valid JSON.");
            return BadRequest();
        }
    }
}
