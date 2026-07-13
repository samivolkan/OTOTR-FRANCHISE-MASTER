SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF SCHEMA_ID(N'crm') IS NULL
BEGIN
    EXEC(N'CREATE SCHEMA crm AUTHORIZATION dbo;');
END;

IF OBJECT_ID(N'crm.whatsapp_contacts', N'U') IS NULL
BEGIN
    CREATE TABLE crm.whatsapp_contacts
    (
        Id uniqueidentifier NOT NULL CONSTRAINT PK_whatsapp_contacts PRIMARY KEY,
        WaId nvarchar(32) NOT NULL,
        PhoneNumber nvarchar(32) NOT NULL,
        DisplayName nvarchar(160) NULL,
        Locale nvarchar(12) NOT NULL CONSTRAINT DF_whatsapp_contacts_Locale DEFAULT N'tr-TR',
        CustomerId uniqueidentifier NULL,
        CreatedAtUtc datetime2 NOT NULL,
        UpdatedAtUtc datetime2 NOT NULL
    );

    CREATE UNIQUE INDEX UX_whatsapp_contacts_WaId
        ON crm.whatsapp_contacts(WaId);
    CREATE INDEX IX_whatsapp_contacts_PhoneNumber
        ON crm.whatsapp_contacts(PhoneNumber);
END;

IF OBJECT_ID(N'crm.whatsapp_conversations', N'U') IS NULL
BEGIN
    CREATE TABLE crm.whatsapp_conversations
    (
        Id uniqueidentifier NOT NULL CONSTRAINT PK_whatsapp_conversations PRIMARY KEY,
        ContactId uniqueidentifier NOT NULL,
        State nvarchar(80) NOT NULL,
        Intent nvarchar(80) NULL,
        Status nvarchar(40) NOT NULL,
        BotEnabled bit NOT NULL,
        ContextJson nvarchar(max) NOT NULL CONSTRAINT DF_whatsapp_conversations_ContextJson DEFAULT N'{}',
        BranchId uniqueidentifier NULL,
        AssignedAgentUserId nvarchar(120) NULL,
        SupportQueue nvarchar(120) NULL,
        LastInboundAtUtc datetime2 NULL,
        LastOutboundAtUtc datetime2 NULL,
        CustomerServiceWindowUntilUtc datetime2 NULL,
        CreatedAtUtc datetime2 NOT NULL,
        UpdatedAtUtc datetime2 NOT NULL,
        ClosedAtUtc datetime2 NULL,
        RowVersion rowversion NOT NULL,
        CONSTRAINT FK_whatsapp_conversations_contacts
            FOREIGN KEY (ContactId) REFERENCES crm.whatsapp_contacts(Id)
    );

    CREATE INDEX IX_whatsapp_conversations_Status_UpdatedAtUtc
        ON crm.whatsapp_conversations(Status, UpdatedAtUtc DESC);
    CREATE INDEX IX_whatsapp_conversations_BranchId
        ON crm.whatsapp_conversations(BranchId);
    CREATE INDEX IX_whatsapp_conversations_ContactId
        ON crm.whatsapp_conversations(ContactId);
END;

IF OBJECT_ID(N'crm.whatsapp_messages', N'U') IS NULL
BEGIN
    CREATE TABLE crm.whatsapp_messages
    (
        Id uniqueidentifier NOT NULL CONSTRAINT PK_whatsapp_messages PRIMARY KEY,
        ConversationId uniqueidentifier NOT NULL,
        MetaMessageId nvarchar(180) NULL,
        Direction nvarchar(16) NOT NULL,
        MessageType nvarchar(32) NOT NULL,
        Status nvarchar(32) NOT NULL,
        TextBody nvarchar(max) NULL,
        PayloadJson nvarchar(max) NOT NULL CONSTRAINT DF_whatsapp_messages_PayloadJson DEFAULT N'{}',
        CreatedAtUtc datetime2 NOT NULL,
        SentAtUtc datetime2 NULL,
        DeliveredAtUtc datetime2 NULL,
        ReadAtUtc datetime2 NULL,
        FailedAtUtc datetime2 NULL,
        CONSTRAINT FK_whatsapp_messages_conversations
            FOREIGN KEY (ConversationId) REFERENCES crm.whatsapp_conversations(Id) ON DELETE CASCADE
    );

    CREATE UNIQUE INDEX UX_whatsapp_messages_MetaMessageId
        ON crm.whatsapp_messages(MetaMessageId)
        WHERE MetaMessageId IS NOT NULL;
    CREATE INDEX IX_whatsapp_messages_ConversationId_CreatedAtUtc
        ON crm.whatsapp_messages(ConversationId, CreatedAtUtc);
END;

IF OBJECT_ID(N'crm.whatsapp_conversation_events', N'U') IS NULL
BEGIN
    CREATE TABLE crm.whatsapp_conversation_events
    (
        Id uniqueidentifier NOT NULL CONSTRAINT PK_whatsapp_conversation_events PRIMARY KEY,
        ConversationId uniqueidentifier NOT NULL,
        EventType nvarchar(80) NOT NULL,
        ActorType nvarchar(40) NOT NULL,
        ActorId nvarchar(120) NULL,
        DetailsJson nvarchar(max) NOT NULL CONSTRAINT DF_whatsapp_conversation_events_DetailsJson DEFAULT N'{}',
        CreatedAtUtc datetime2 NOT NULL,
        CONSTRAINT FK_whatsapp_conversation_events_conversations
            FOREIGN KEY (ConversationId) REFERENCES crm.whatsapp_conversations(Id) ON DELETE CASCADE
    );

    CREATE INDEX IX_whatsapp_conversation_events_ConversationId_CreatedAtUtc
        ON crm.whatsapp_conversation_events(ConversationId, CreatedAtUtc);
END;

IF OBJECT_ID(N'crm.whatsapp_consent_records', N'U') IS NULL
BEGIN
    CREATE TABLE crm.whatsapp_consent_records
    (
        Id uniqueidentifier NOT NULL CONSTRAINT PK_whatsapp_consent_records PRIMARY KEY,
        ContactId uniqueidentifier NOT NULL,
        ConsentType nvarchar(80) NOT NULL,
        Status nvarchar(32) NOT NULL,
        Source nvarchar(80) NOT NULL,
        EvidenceJson nvarchar(max) NOT NULL CONSTRAINT DF_whatsapp_consent_records_EvidenceJson DEFAULT N'{}',
        CreatedAtUtc datetime2 NOT NULL,
        CONSTRAINT FK_whatsapp_consent_records_contacts
            FOREIGN KEY (ContactId) REFERENCES crm.whatsapp_contacts(Id)
    );

    CREATE INDEX IX_whatsapp_consent_records_ContactId_Type_CreatedAtUtc
        ON crm.whatsapp_consent_records(ContactId, ConsentType, CreatedAtUtc DESC);
END;

COMMIT TRANSACTION;
