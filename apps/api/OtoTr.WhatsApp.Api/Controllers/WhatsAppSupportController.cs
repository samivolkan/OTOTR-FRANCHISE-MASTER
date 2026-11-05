using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using OtoTr.WhatsApp.Api.Models;
using OtoTr.WhatsApp.Api.Services;

namespace OtoTr.WhatsApp.Api.Controllers;

[ApiController]
[Route("api/whatsapp")]
[Authorize(Policy = "WhatsAppSupport")]
public sealed class WhatsAppSupportController(
    IConversationRepository repository,
    IMetaWhatsAppClient metaClient) : ControllerBase
{
    [HttpGet("conversations")]
    public async Task<ActionResult<IReadOnlyList<ConversationListItem>>> List(
        [FromQuery] string? status,
        [FromQuery] int take = 100,
        CancellationToken cancellationToken = default) =>
        Ok(await repository.ListAsync(status, take, cancellationToken));

    [HttpGet("conversations/{conversationId:guid}")]
    public async Task<ActionResult<ConversationDetail>> GetDetail(
        Guid conversationId,
        CancellationToken cancellationToken)
    {
        var detail = await repository.GetDetailAsync(conversationId, cancellationToken);
        if (detail is null)
        {
            return NotFound();
        }

        await repository.MarkInboundReadAsync(conversationId, cancellationToken);
        return Ok(detail);
    }

    [HttpPost("conversations/{conversationId:guid}/messages")]
    public async Task<IActionResult> SendAgentMessage(
        Guid conversationId,
        [FromBody] AgentMessageRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Text))
        {
            return ValidationProblem("Mesaj içeriği boş olamaz.");
        }

        var conversation = await repository.GetTrackedAsync(conversationId, cancellationToken);
        if (conversation is null)
        {
            return NotFound();
        }

        if (conversation.CustomerServiceWindowUntilUtc is null ||
            conversation.CustomerServiceWindowUntilUtc <= DateTime.UtcNow)
        {
            return Conflict(new
            {
                code = "template_required",
                message = "24 saatlik müşteri hizmetleri penceresi kapalı. Onaylı bir mesaj şablonu kullanın."
            });
        }

        var result = await metaClient.SendTextAsync(
            conversation.Contact.WaId,
            request.Text.Trim(),
            false,
            cancellationToken);

        await repository.AddOutboundMessageAsync(
            conversation,
            result.MessageId,
            "agent_text",
            request.Text.Trim(),
            result.RawResponse,
            cancellationToken);

        conversation.BotEnabled = false;
        conversation.Status = "agent_active";
        conversation.AssignedAgentUserId ??= CurrentUserId();
        await repository.SaveConversationAsync(conversation, cancellationToken);
        await repository.AddEventAsync(
            conversation.Id,
            "agent_message_sent",
            "agent",
            CurrentUserId(),
            "{}",
            cancellationToken);

        return Accepted(new { result.MessageId });
    }

    [HttpPost("conversations/{conversationId:guid}/templates")]
    public async Task<IActionResult> SendTemplate(
        Guid conversationId,
        [FromBody] SendTemplateRequest request,
        CancellationToken cancellationToken)
    {
        var conversation = await repository.GetTrackedAsync(conversationId, cancellationToken);
        if (conversation is null)
        {
            return NotFound();
        }

        var result = await metaClient.SendTemplateAsync(
            conversation.Contact.WaId,
            request.TemplateName,
            request.LanguageCode,
            request.BodyParameters,
            cancellationToken);

        await repository.AddOutboundMessageAsync(
            conversation,
            result.MessageId,
            "template",
            request.TemplateName,
            JsonSerializer.Serialize(new
            {
                request.TemplateName,
                request.LanguageCode,
                request.BodyParameters,
                response = result.RawResponse
            }),
            cancellationToken);

        conversation.BotEnabled = false;
        conversation.Status = "agent_active";
        conversation.AssignedAgentUserId ??= CurrentUserId();
        await repository.SaveConversationAsync(conversation, cancellationToken);
        return Accepted(new { result.MessageId });
    }

    [HttpPost("conversations/{conversationId:guid}/assign")]
    public async Task<IActionResult> Assign(
        Guid conversationId,
        [FromBody] AssignConversationRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.AgentUserId))
        {
            return ValidationProblem("Atanacak kullanıcı bilgisi gereklidir.");
        }

        var conversation = await repository.GetTrackedAsync(conversationId, cancellationToken);
        if (conversation is null)
        {
            return NotFound();
        }

        conversation.AssignedAgentUserId = request.AgentUserId.Trim();
        conversation.Status = "agent_active";
        conversation.BotEnabled = false;
        await repository.SaveConversationAsync(conversation, cancellationToken);
        await repository.AddEventAsync(
            conversation.Id,
            "agent_assigned",
            "agent",
            CurrentUserId(),
            JsonSerializer.Serialize(new { assignedAgentUserId = request.AgentUserId.Trim() }),
            cancellationToken);
        return NoContent();
    }

    [HttpPost("conversations/{conversationId:guid}/bot")]
    public async Task<IActionResult> SetBotStatus(
        Guid conversationId,
        [FromBody] BotStatusRequest request,
        CancellationToken cancellationToken)
    {
        var conversation = await repository.GetTrackedAsync(conversationId, cancellationToken);
        if (conversation is null)
        {
            return NotFound();
        }

        conversation.BotEnabled = request.Enabled;
        conversation.Status = request.Enabled ? "bot_active" : "waiting_agent";
        if (request.Enabled)
        {
            conversation.AssignedAgentUserId = null;
            conversation.State = "welcome";
            conversation.Intent = null;
            conversation.ContextJson = "{}";
        }

        await repository.SaveConversationAsync(conversation, cancellationToken);
        await repository.AddEventAsync(
            conversation.Id,
            request.Enabled ? "bot_resumed" : "bot_paused",
            "agent",
            CurrentUserId(),
            "{}",
            cancellationToken);
        return NoContent();
    }

    [HttpPost("conversations/{conversationId:guid}/close")]
    public async Task<IActionResult> Close(Guid conversationId, CancellationToken cancellationToken)
    {
        var conversation = await repository.GetTrackedAsync(conversationId, cancellationToken);
        if (conversation is null)
        {
            return NotFound();
        }

        conversation.Status = "closed";
        conversation.BotEnabled = false;
        conversation.ClosedAtUtc = DateTime.UtcNow;
        await repository.SaveConversationAsync(conversation, cancellationToken);
        await repository.AddEventAsync(
            conversation.Id,
            "conversation_closed",
            "agent",
            CurrentUserId(),
            "{}",
            cancellationToken);
        return NoContent();
    }

    private string CurrentUserId() =>
        User.FindFirstValue(ClaimTypes.NameIdentifier) ??
        User.FindFirstValue("sub") ??
        User.Identity?.Name ??
        "unknown";
}
