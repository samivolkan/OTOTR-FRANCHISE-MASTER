using Microsoft.EntityFrameworkCore;
using OtoTr.WhatsApp.Api.Data;
using OtoTr.WhatsApp.Api.Models;

namespace OtoTr.WhatsApp.Api.Services;

public interface IConversationRepository
{
    Task<WhatsAppConversation> GetOrCreateActiveAsync(ParsedInboundMessage inbound, CancellationToken cancellationToken);
    Task<bool> InboundMessageExistsAsync(string metaMessageId, CancellationToken cancellationToken);
    Task AddInboundMessageAsync(WhatsAppConversation conversation, ParsedInboundMessage inbound, CancellationToken cancellationToken);
    Task AddOutboundMessageAsync(WhatsAppConversation conversation, string metaMessageId, string type, string? text, string payloadJson, CancellationToken cancellationToken);
    Task AddEventAsync(Guid conversationId, string eventType, string actorType, string? actorId, string detailsJson, CancellationToken cancellationToken);
    Task SaveConversationAsync(WhatsAppConversation conversation, CancellationToken cancellationToken);
    Task UpdateOutboundStatusAsync(string metaMessageId, string status, DateTime statusAtUtc, CancellationToken cancellationToken);
    Task<IReadOnlyList<ConversationListItem>> ListAsync(string? status, int take, CancellationToken cancellationToken);
    Task<ConversationDetail?> GetDetailAsync(Guid conversationId, CancellationToken cancellationToken);
    Task<WhatsAppConversation?> GetTrackedAsync(Guid conversationId, CancellationToken cancellationToken);
    Task MarkInboundReadAsync(Guid conversationId, CancellationToken cancellationToken);
}

public sealed class SqlConversationRepository(WhatsAppDbContext dbContext) : IConversationRepository
{
    public async Task<WhatsAppConversation> GetOrCreateActiveAsync(
        ParsedInboundMessage inbound,
        CancellationToken cancellationToken)
    {
        var contact = await dbContext.Contacts
            .SingleOrDefaultAsync(x => x.WaId == inbound.WaId, cancellationToken);

        if (contact is null)
        {
            contact = new WhatsAppContact
            {
                WaId = inbound.WaId,
                PhoneNumber = inbound.WaId,
                DisplayName = inbound.DisplayName,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };
            dbContext.Contacts.Add(contact);
        }
        else
        {
            contact.DisplayName = string.IsNullOrWhiteSpace(inbound.DisplayName)
                ? contact.DisplayName
                : inbound.DisplayName;
            contact.UpdatedAtUtc = DateTime.UtcNow;
        }

        var conversation = await dbContext.Conversations
            .Include(x => x.Contact)
            .Where(x => x.ContactId == contact.Id && x.Status != "closed")
            .OrderByDescending(x => x.UpdatedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);

        if (conversation is null)
        {
            conversation = new WhatsAppConversation
            {
                Contact = contact,
                ContactId = contact.Id,
                State = "welcome",
                Status = "bot_active",
                BotEnabled = true,
                CreatedAtUtc = DateTime.UtcNow,
                UpdatedAtUtc = DateTime.UtcNow
            };
            dbContext.Conversations.Add(conversation);
        }

        conversation.LastInboundAtUtc = DateTime.UtcNow;
        conversation.CustomerServiceWindowUntilUtc = DateTime.UtcNow.AddHours(24);
        conversation.UpdatedAtUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
        return conversation;
    }

    public Task<bool> InboundMessageExistsAsync(string metaMessageId, CancellationToken cancellationToken) =>
        dbContext.Messages.AnyAsync(
            x => x.MetaMessageId == metaMessageId && x.Direction == "inbound",
            cancellationToken);

    public async Task AddInboundMessageAsync(
        WhatsAppConversation conversation,
        ParsedInboundMessage inbound,
        CancellationToken cancellationToken)
    {
        dbContext.Messages.Add(new WhatsAppMessage
        {
            ConversationId = conversation.Id,
            MetaMessageId = inbound.MetaMessageId,
            Direction = "inbound",
            MessageType = inbound.MessageType,
            Status = "received",
            TextBody = inbound.Text ?? inbound.SelectionTitle,
            PayloadJson = inbound.RawJson,
            CreatedAtUtc = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AddOutboundMessageAsync(
        WhatsAppConversation conversation,
        string metaMessageId,
        string type,
        string? text,
        string payloadJson,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        dbContext.Messages.Add(new WhatsAppMessage
        {
            ConversationId = conversation.Id,
            MetaMessageId = metaMessageId,
            Direction = "outbound",
            MessageType = type,
            Status = "sent",
            TextBody = text,
            PayloadJson = payloadJson,
            CreatedAtUtc = now,
            SentAtUtc = now
        });
        conversation.LastOutboundAtUtc = now;
        conversation.UpdatedAtUtc = now;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AddEventAsync(
        Guid conversationId,
        string eventType,
        string actorType,
        string? actorId,
        string detailsJson,
        CancellationToken cancellationToken)
    {
        dbContext.ConversationEvents.Add(new WhatsAppConversationEvent
        {
            ConversationId = conversationId,
            EventType = eventType,
            ActorType = actorType,
            ActorId = actorId,
            DetailsJson = detailsJson,
            CreatedAtUtc = DateTime.UtcNow
        });
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task SaveConversationAsync(WhatsAppConversation conversation, CancellationToken cancellationToken)
    {
        conversation.UpdatedAtUtc = DateTime.UtcNow;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateOutboundStatusAsync(
        string metaMessageId,
        string status,
        DateTime statusAtUtc,
        CancellationToken cancellationToken)
    {
        var message = await dbContext.Messages
            .SingleOrDefaultAsync(x => x.MetaMessageId == metaMessageId, cancellationToken);
        if (message is null)
        {
            return;
        }

        message.Status = status;
        switch (status)
        {
            case "sent":
                message.SentAtUtc = statusAtUtc;
                break;
            case "delivered":
                message.DeliveredAtUtc = statusAtUtc;
                break;
            case "read":
                message.ReadAtUtc = statusAtUtc;
                break;
            case "failed":
                message.FailedAtUtc = statusAtUtc;
                break;
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ConversationListItem>> ListAsync(
        string? status,
        int take,
        CancellationToken cancellationToken)
    {
        var query = dbContext.Conversations
            .AsNoTracking()
            .Include(x => x.Contact)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(x => x.Status == status);
        }

        return await query
            .OrderByDescending(x => x.UpdatedAtUtc)
            .Take(Math.Clamp(take, 1, 200))
            .Select(x => new ConversationListItem(
                x.Id,
                x.Contact.WaId,
                x.Contact.PhoneNumber,
                x.Contact.DisplayName,
                x.Status,
                x.State,
                x.Intent,
                x.BotEnabled,
                x.AssignedAgentUserId,
                x.BranchId,
                x.UpdatedAtUtc,
                x.Messages.Count(message => message.Direction == "inbound" && message.Status == "received")))
            .ToListAsync(cancellationToken);
    }

    public async Task<ConversationDetail?> GetDetailAsync(Guid conversationId, CancellationToken cancellationToken)
    {
        var conversation = await dbContext.Conversations
            .AsNoTracking()
            .Include(x => x.Contact)
            .SingleOrDefaultAsync(x => x.Id == conversationId, cancellationToken);

        if (conversation is null)
        {
            return null;
        }

        var unreadCount = await dbContext.Messages.CountAsync(
            x => x.ConversationId == conversationId && x.Direction == "inbound" && x.Status == "received",
            cancellationToken);

        var messages = await dbContext.Messages
            .AsNoTracking()
            .Where(x => x.ConversationId == conversationId)
            .OrderBy(x => x.CreatedAtUtc)
            .Take(500)
            .Select(x => new ConversationMessageItem(
                x.Id,
                x.Direction,
                x.MessageType,
                x.Status,
                x.TextBody,
                x.CreatedAtUtc))
            .ToListAsync(cancellationToken);

        var summary = new ConversationListItem(
            conversation.Id,
            conversation.Contact.WaId,
            conversation.Contact.PhoneNumber,
            conversation.Contact.DisplayName,
            conversation.Status,
            conversation.State,
            conversation.Intent,
            conversation.BotEnabled,
            conversation.AssignedAgentUserId,
            conversation.BranchId,
            conversation.UpdatedAtUtc,
            unreadCount);

        return new ConversationDetail(summary, messages);
    }

    public Task<WhatsAppConversation?> GetTrackedAsync(Guid conversationId, CancellationToken cancellationToken) =>
        dbContext.Conversations
            .Include(x => x.Contact)
            .SingleOrDefaultAsync(x => x.Id == conversationId, cancellationToken);

    public async Task MarkInboundReadAsync(Guid conversationId, CancellationToken cancellationToken)
    {
        var unreadMessages = await dbContext.Messages
            .Where(x => x.ConversationId == conversationId && x.Direction == "inbound" && x.Status == "received")
            .ToListAsync(cancellationToken);

        foreach (var message in unreadMessages)
        {
            message.Status = "read_by_agent";
            message.ReadAtUtc = DateTime.UtcNow;
        }

        if (unreadMessages.Count > 0)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }
}
