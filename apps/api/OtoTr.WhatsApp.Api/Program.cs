using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OtoTr.WhatsApp.Api.Configuration;
using OtoTr.WhatsApp.Api.Data;
using OtoTr.WhatsApp.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddOptions<WhatsAppOptions>()
    .Bind(builder.Configuration.GetSection(WhatsAppOptions.SectionName))
    .Validate(options => !string.IsNullOrWhiteSpace(options.GraphApiVersion), "WhatsApp GraphApiVersion is required.")
    .Validate(options => !string.IsNullOrWhiteSpace(options.PhoneNumberId), "WhatsApp PhoneNumberId is required.")
    .Validate(options => !string.IsNullOrWhiteSpace(options.AccessToken), "WhatsApp AccessToken is required.")
    .Validate(options => !string.IsNullOrWhiteSpace(options.AppSecret), "WhatsApp AppSecret is required.")
    .Validate(options => !string.IsNullOrWhiteSpace(options.WebhookVerifyToken), "WhatsApp WebhookVerifyToken is required.")
    .ValidateOnStart();

builder.Services
    .AddOptions<ErpOptions>()
    .Bind(builder.Configuration.GetSection(ErpOptions.SectionName))
    .Validate(options => Uri.TryCreate(options.BaseUrl, UriKind.Absolute, out _), "ERP BaseUrl must be an absolute URL.")
    .ValidateOnStart();

builder.Services
    .AddOptions<AuthOptions>()
    .Bind(builder.Configuration.GetSection(AuthOptions.SectionName))
    .Validate(options => Uri.TryCreate(options.Authority, UriKind.Absolute, out _), "Auth Authority must be an absolute URL.")
    .Validate(options => !string.IsNullOrWhiteSpace(options.Audience), "Auth Audience is required.")
    .ValidateOnStart();

var connectionString = builder.Configuration.GetConnectionString("OtoTrSqlServer")
    ?? throw new InvalidOperationException("ConnectionStrings:OtoTrSqlServer is required.");

builder.Services.AddDbContext<WhatsAppDbContext>(options =>
    options.UseSqlServer(connectionString, sql =>
    {
        sql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null);
        sql.CommandTimeout(30);
    }));

var authConfiguration = builder.Configuration.GetSection(AuthOptions.SectionName).Get<AuthOptions>()
    ?? new AuthOptions();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = authConfiguration.Authority;
        options.Audience = authConfiguration.Audience;
        options.RequireHttpsMetadata = authConfiguration.RequireHttpsMetadata;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            NameClaimType = "name",
            RoleClaimType = "role",
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("WhatsAppSupport", policy =>
        policy.RequireAuthenticatedUser()
            .RequireRole(
                "CEO",
                "HQ",
                "GenelMerkez",
                "Admin",
                "Support",
                "MusteriHizmetleri",
                "BranchManager"));
});

builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddHttpClient<IMetaWhatsAppClient, MetaWhatsAppClient>();
builder.Services.AddHttpClient<IErpGateway, ErpGateway>();
builder.Services.AddScoped<IConversationRepository, SqlConversationRepository>();
builder.Services.AddScoped<IConversationFlowService, ConversationFlowService>();
builder.Services.AddSingleton<IWebhookSignatureValidator, WebhookSignatureValidator>();
builder.Services.AddSingleton<IWhatsAppWebhookParser, WhatsAppWebhookParser>();

var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(options =>
{
    options.AddPolicy("ErpPortal", policy =>
    {
        if (allowedOrigins.Length == 0)
        {
            policy.SetIsOriginAllowed(_ => false);
            return;
        }

        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});
app.UseExceptionHandler();
app.UseHsts();
app.UseHttpsRedirection();
app.UseCors("ErpPortal");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/health/live", () => Results.Ok(new
{
    status = "ok",
    service = "ototr-whatsapp-api",
    utc = DateTime.UtcNow
})).AllowAnonymous();

app.MapGet("/health/ready", async (WhatsAppDbContext dbContext, CancellationToken cancellationToken) =>
{
    var canConnect = await dbContext.Database.CanConnectAsync(cancellationToken);
    return canConnect
        ? Results.Ok(new { status = "ready" })
        : Results.Problem("SQL Server connection is not ready.", statusCode: StatusCodes.Status503ServiceUnavailable);
}).AllowAnonymous();

app.Run();

public partial class Program
{
}
