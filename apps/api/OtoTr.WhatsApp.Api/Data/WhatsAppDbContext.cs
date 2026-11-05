using Microsoft.EntityFrameworkCore;

namespace OtoTr.WhatsApp.Api.Data;

public sealed class WhatsAppDbContext(DbContextOptions<WhatsAppDbContext> options) : DbContext(options)
{
    public DbSet<WhatsAppContact> Contacts => Set<WhatsAppContact>();
    public DbSet<WhatsAppConversation> Conversations => Set<WhatsAppConversation>();
    public DbSet<WhatsAppMessage> Messages => Set<WhatsAppMessage>();
    public DbSet<WhatsAppConversationEvent> ConversationEvents => Set<WhatsAppConversationEvent>();
    public DbSet<WhatsAppConsentRecord> ConsentRecords => Set<WhatsAppConsentRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("crm");

        modelBuilder.Entity<WhatsAppContact>(entity =>
        {
            entity.ToTable("whatsapp_contacts");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.WaId).HasMaxLength(32).IsRequired();
            entity.Property(x => x.PhoneNumber).HasMaxLength(32).IsRequired();
            entity.Property(x => x.DisplayName).HasMaxLength(160);
            entity.Property(x => x.Locale).HasMaxLength(12).HasDefaultValue("tr-TR");
            entity.HasIndex(x => x.WaId).IsUnique();
            entity.HasIndex(x => x.PhoneNumber);
        });

        modelBuilder.Entity<WhatsAppConversation>(entity =>
        {
            entity.ToTable("whatsapp_conversations");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.State).HasMaxLength(80).IsRequired();
            entity.Property(x => x.Intent).HasMaxLength(80);
            entity.Property(x => x.Status).HasMaxLength(40).IsRequired();
            entity.Property(x => x.ContextJson).HasColumnType("nvarchar(max)");
            entity.Property(x => x.AssignedAgentUserId).HasMaxLength(120);
            entity.Property(x => x.SupportQueue).HasMaxLength(120);
            entity.Property(x => x.RowVersion).IsRowVersion();
            entity.HasIndex(x => new { x.Status, x.UpdatedAtUtc });
            entity.HasIndex(x => x.BranchId);
            entity.HasOne(x => x.Contact)
                .WithMany(x => x.Conversations)
                .HasForeignKey(x => x.ContactId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<WhatsAppMessage>(entity =>
        {
            entity.ToTable("whatsapp_messages");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.MetaMessageId).HasMaxLength(180);
            entity.Property(x => x.Direction).HasMaxLength(16).IsRequired();
            entity.Property(x => x.MessageType).HasMaxLength(32).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(32).IsRequired();
            entity.Property(x => x.TextBody).HasColumnType("nvarchar(max)");
            entity.Property(x => x.PayloadJson).HasColumnType("nvarchar(max)");
            entity.HasIndex(x => x.MetaMessageId).IsUnique().HasFilter("[MetaMessageId] IS NOT NULL");
            entity.HasIndex(x => new { x.ConversationId, x.CreatedAtUtc });
            entity.HasOne(x => x.Conversation)
                .WithMany(x => x.Messages)
                .HasForeignKey(x => x.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WhatsAppConversationEvent>(entity =>
        {
            entity.ToTable("whatsapp_conversation_events");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.EventType).HasMaxLength(80).IsRequired();
            entity.Property(x => x.ActorType).HasMaxLength(40).IsRequired();
            entity.Property(x => x.ActorId).HasMaxLength(120);
            entity.Property(x => x.DetailsJson).HasColumnType("nvarchar(max)");
            entity.HasIndex(x => new { x.ConversationId, x.CreatedAtUtc });
        });

        modelBuilder.Entity<WhatsAppConsentRecord>(entity =>
        {
            entity.ToTable("whatsapp_consent_records");
            entity.HasKey(x => x.Id);
            entity.Property(x => x.ConsentType).HasMaxLength(80).IsRequired();
            entity.Property(x => x.Status).HasMaxLength(32).IsRequired();
            entity.Property(x => x.Source).HasMaxLength(80).IsRequired();
            entity.Property(x => x.EvidenceJson).HasColumnType("nvarchar(max)");
            entity.HasIndex(x => new { x.ContactId, x.ConsentType, x.CreatedAtUtc });
        });
    }
}

public sealed class WhatsAppContact
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string WaId { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string Locale { get; set; } = "tr-TR";
    public Guid? CustomerId { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    public ICollection<WhatsAppConversation> Conversations { get; set; } = new List<WhatsAppConversation>();
}

public sealed class WhatsAppConversation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ContactId { get; set; }
    public WhatsAppContact Contact { get; set; } = null!;
    public string State { get; set; } = "welcome";
    public string? Intent { get; set; }
    public string Status { get; set; } = "bot_active";
    public bool BotEnabled { get; set; } = true;
    public string ContextJson { get; set; } = "{}";
    public Guid? BranchId { get; set; }
    public string? AssignedAgentUserId { get; set; }
    public string? SupportQueue { get; set; }
    public DateTime? LastInboundAtUtc { get; set; }
    public DateTime? LastOutboundAtUtc { get; set; }
    public DateTime? CustomerServiceWindowUntilUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ClosedAtUtc { get; set; }
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();
    public ICollection<WhatsAppMessage> Messages { get; set; } = new List<WhatsAppMessage>();
}

public sealed class WhatsAppMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ConversationId { get; set; }
    public WhatsAppConversation Conversation { get; set; } = null!;
    public string? MetaMessageId { get; set; }
    public string Direction { get; set; } = "inbound";
    public string MessageType { get; set; } = "text";
    public string Status { get; set; } = "received";
    public string? TextBody { get; set; }
    public string PayloadJson { get; set; } = "{}";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? SentAtUtc { get; set; }
    public DateTime? DeliveredAtUtc { get; set; }
    public DateTime? ReadAtUtc { get; set; }
    public DateTime? FailedAtUtc { get; set; }
}

public sealed class WhatsAppConversationEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ConversationId { get; set; }
    public string EventType { get; set; } = string.Empty;
    public string ActorType { get; set; } = "system";
    public string? ActorId { get; set; }
    public string DetailsJson { get; set; } = "{}";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}

public sealed class WhatsAppConsentRecord
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ContactId { get; set; }
    public string ConsentType { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Source { get; set; } = "whatsapp";
    public string EvidenceJson { get; set; } = "{}";
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
