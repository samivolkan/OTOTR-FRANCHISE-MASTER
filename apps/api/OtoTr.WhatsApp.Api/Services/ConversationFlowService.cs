using System.Globalization;
using System.Text.Json;
using Microsoft.Extensions.Options;
using OtoTr.WhatsApp.Api.Configuration;
using OtoTr.WhatsApp.Api.Data;
using OtoTr.WhatsApp.Api.Models;

namespace OtoTr.WhatsApp.Api.Services;

public interface IConversationFlowService
{
    Task ProcessInboundAsync(ParsedInboundMessage inbound, CancellationToken cancellationToken);
}

public sealed class ConversationFlowService(
    IConversationRepository repository,
    IMetaWhatsAppClient metaClient,
    IErpGateway erpGateway,
    IOptions<WhatsAppOptions> options,
    ILogger<ConversationFlowService> logger) : IConversationFlowService
{
    private static readonly CultureInfo TurkishCulture = CultureInfo.GetCultureInfo("tr-TR");
    private readonly WhatsAppOptions _options = options.Value;

    public async Task ProcessInboundAsync(ParsedInboundMessage inbound, CancellationToken cancellationToken)
    {
        if (await repository.InboundMessageExistsAsync(inbound.MetaMessageId, cancellationToken))
        {
            return;
        }

        var conversation = await repository.GetOrCreateActiveAsync(inbound, cancellationToken);
        await repository.AddInboundMessageAsync(conversation, inbound, cancellationToken);

        if (!conversation.BotEnabled || conversation.Status is "waiting_agent" or "agent_active")
        {
            return;
        }

        var input = Normalize(inbound.SelectionId ?? inbound.Text ?? inbound.SelectionTitle);
        try
        {
            if (IsMainMenuCommand(input))
            {
                await ShowWelcomeAsync(conversation, cancellationToken);
                return;
            }

            if (IsAgentCommand(input))
            {
                await HandoverAsync(conversation, "customer_request", cancellationToken);
                return;
            }

            if (IsEndCommand(input))
            {
                await CloseAsync(conversation, cancellationToken);
                return;
            }

            switch (conversation.State)
            {
                case "welcome":
                case "role_selection":
                    await HandleRoleSelectionAsync(conversation, input, cancellationToken);
                    break;
                case "customer_menu":
                    await HandleCustomerMenuAsync(conversation, input, cancellationToken);
                    break;
                case "dealer_menu":
                    await HandleDealerMenuAsync(conversation, input, cancellationToken);
                    break;
                case "franchise_menu":
                    await HandleFranchiseMenuAsync(conversation, input, cancellationToken);
                    break;
                case "appointment_city":
                    await HandleCitySelectionAsync(conversation, inbound, "appointment", cancellationToken);
                    break;
                case "appointment_branch":
                    await HandleAppointmentBranchAsync(conversation, input, cancellationToken);
                    break;
                case "appointment_package":
                    await HandleAppointmentPackageAsync(conversation, input, cancellationToken);
                    break;
                case "appointment_date":
                    await HandleAppointmentDateAsync(conversation, input, cancellationToken);
                    break;
                case "appointment_time":
                    await HandleAppointmentTimeAsync(conversation, input, cancellationToken);
                    break;
                case "appointment_plate":
                    await HandleAppointmentPlateAsync(conversation, inbound.Text, cancellationToken);
                    break;
                case "appointment_confirm":
                    await HandleAppointmentConfirmationAsync(conversation, input, cancellationToken);
                    break;
                case "packages_city":
                    await HandleCitySelectionAsync(conversation, inbound, "packages", cancellationToken);
                    break;
                case "packages_branch":
                    await HandlePackagesBranchAsync(conversation, input, cancellationToken);
                    break;
                case "report_lookup":
                    await HandleReportLookupAsync(conversation, inbound.Text, cancellationToken);
                    break;
                case "guarantee_lookup":
                    await HandleGuaranteeLookupAsync(conversation, inbound.Text, cancellationToken);
                    break;
                case "nearest_branch":
                    await HandleNearestBranchAsync(conversation, inbound, cancellationToken);
                    break;
                case "complaint_category":
                    await HandleComplaintCategoryAsync(conversation, input, cancellationToken);
                    break;
                case "complaint_description":
                    await HandleComplaintDescriptionAsync(conversation, inbound.Text, cancellationToken);
                    break;
                case "dealer_support_description":
                    await HandleDealerSupportDescriptionAsync(conversation, inbound.Text, cancellationToken);
                    break;
                case "franchise_name":
                    await HandleFranchiseNameAsync(conversation, inbound.Text, cancellationToken);
                    break;
                case "franchise_city":
                    await HandleFranchiseCityAsync(conversation, inbound.Text, cancellationToken);
                    break;
                case "franchise_investment":
                    await HandleFranchiseInvestmentAsync(conversation, input, cancellationToken);
                    break;
                default:
                    await ShowWelcomeAsync(conversation, cancellationToken);
                    break;
            }
        }
        catch (Exception exception)
        {
            logger.LogError(exception, "WhatsApp flow failed for conversation {ConversationId}", conversation.Id);
            conversation.Status = "waiting_agent";
            conversation.BotEnabled = false;
            conversation.SupportQueue = _options.SupportQueueName;
            await repository.SaveConversationAsync(conversation, cancellationToken);
            await repository.AddEventAsync(
                conversation.Id,
                "flow_failed",
                "system",
                null,
                JsonSerializer.Serialize(new { exception = exception.GetType().Name }),
                cancellationToken);

            try
            {
                await SendTextAsync(
                    conversation,
                    "İşleminizi otomatik olarak tamamlayamadım. Görüşmenizi müşteri temsilcimize aktardım. En kısa sürede size cevap vereceğiz.",
                    false,
                    cancellationToken);
            }
            catch (Exception sendException)
            {
                logger.LogError(sendException, "WhatsApp fallback message could not be sent.");
            }
        }
    }

    private async Task ShowWelcomeAsync(WhatsAppConversation conversation, CancellationToken cancellationToken)
    {
        conversation.State = "role_selection";
        conversation.Intent = null;
        conversation.ContextJson = "{}";
        conversation.Status = "bot_active";
        conversation.BotEnabled = true;
        await repository.SaveConversationAsync(conversation, cancellationToken);

        var privacyLine = string.IsNullOrWhiteSpace(_options.PrivacyNoticeUrl)
            ? string.Empty
            : $"\n\nKişisel verilerin işlenmesine ilişkin aydınlatma metni: {_options.PrivacyNoticeUrl}";

        await SendButtonsAsync(
            conversation,
            $"Merhaba 👋 OtoTR WhatsApp Asistanına hoş geldiniz. Size doğru hizmeti sunabilmemiz için aşağıdaki seçeneklerden birini seçin.{privacyLine}",
            [
                new ReplyButtonOption("role_customer", "Müşteriyim"),
                new ReplyButtonOption("role_dealer", "Bayi / Servis"),
                new ReplyButtonOption("role_franchise", "Bayilik Başvurusu")
            ],
            cancellationToken);
    }

    private async Task HandleRoleSelectionAsync(WhatsAppConversation conversation, string input, CancellationToken cancellationToken)
    {
        switch (input)
        {
            case "role_customer":
            case "müşteriyim":
            case "musteriyim":
                conversation.State = "customer_menu";
                conversation.Intent = "customer";
                await repository.SaveConversationAsync(conversation, cancellationToken);
                await ShowCustomerMenuAsync(conversation, cancellationToken);
                break;
            case "role_dealer":
            case "bayi / servis":
            case "bayi":
            case "servis":
                conversation.State = "dealer_menu";
                conversation.Intent = "dealer";
                await repository.SaveConversationAsync(conversation, cancellationToken);
                await ShowDealerMenuAsync(conversation, cancellationToken);
                break;
            case "role_franchise":
            case "bayilik başvurusu":
            case "bayilik basvurusu":
                conversation.State = "franchise_menu";
                conversation.Intent = "franchise";
                await repository.SaveConversationAsync(conversation, cancellationToken);
                await ShowFranchiseMenuAsync(conversation, cancellationToken);
                break;
            default:
                await ShowWelcomeAsync(conversation, cancellationToken);
                break;
        }
    }

    private Task ShowCustomerMenuAsync(WhatsAppConversation conversation, CancellationToken cancellationToken) =>
        SendListAsync(
            conversation,
            "Size bugün nasıl yardımcı olabiliriz?",
            "İşlem Seç",
            [
                new ListSectionOption("Müşteri İşlemleri",
                [
                    new ListRowOption("customer_appointment", "Randevu Al", "Şube, paket, tarih ve saat seçin"),
                    new ListRowOption("customer_packages", "Paket ve Fiyatlar", "Aktif ekspertiz paketlerini inceleyin"),
                    new ListRowOption("customer_appointment_lookup", "Randevu Sorgula", "Mevcut randevunuz için destek alın"),
                    new ListRowOption("customer_report", "Raporumu Sorgula", "Plaka veya rapor numarasıyla sorgulayın"),
                    new ListRowOption("customer_nearest_branch", "En Yakın Şube", "Konum veya şehir bilgisiyle şube bulun"),
                    new ListRowOption("customer_guarantee", "Garanti İşlemleri", "Garanti kapsamınızı kontrol edin"),
                    new ListRowOption("customer_complaint", "Şikâyet ve Destek", "Kayıt oluşturun ve takip numarası alın"),
                    new ListRowOption("customer_agent", "Canlı Temsilci", "Müşteri temsilcisine bağlanın"),
                    new ListRowOption("main_menu", "Ana Menü", "Müşteri, bayi veya bayilik seçimine dönün"),
                    new ListRowOption("end_chat", "Sohbeti Bitir", "Görüşmeyi sonlandırın")
                ])
            ],
            cancellationToken);

    private async Task HandleCustomerMenuAsync(WhatsAppConversation conversation, string input, CancellationToken cancellationToken)
    {
        switch (input)
        {
            case "customer_appointment":
                conversation.State = "appointment_city";
                conversation.Intent = "appointment";
                conversation.ContextJson = "{}";
                await repository.SaveConversationAsync(conversation, cancellationToken);
                await SendTextAsync(conversation, "Randevu almak istediğiniz şehri yazın. Örnek: İstanbul", false, cancellationToken);
                break;
            case "customer_packages":
                conversation.State = "packages_city";
                conversation.Intent = "packages";
                conversation.ContextJson = "{}";
                await repository.SaveConversationAsync(conversation, cancellationToken);
                await SendTextAsync(conversation, "Paketleri görmek istediğiniz şehri yazın.", false, cancellationToken);
                break;
            case "customer_appointment_lookup":
                conversation.State = "complaint_description";
                conversation.Intent = "appointment_lookup";
                SetContext(conversation, "supportCategory", "Randevu Sorgulama");
                await repository.SaveConversationAsync(conversation, cancellationToken);
                await SendTextAsync(conversation, "Randevu numaranızı veya araç plakanızı yazın. Ekibimiz kaydınızı kontrol edecektir.", false, cancellationToken);
                break;
            case "customer_report":
                conversation.State = "report_lookup";
                conversation.Intent = "report_lookup";
                await repository.SaveConversationAsync(conversation, cancellationToken);
                await SendTextAsync(conversation, "Ekspertiz rapor numaranızı veya araç plakanızı yazın.", false, cancellationToken);
                break;
            case "customer_nearest_branch":
                conversation.State = "nearest_branch";
                conversation.Intent = "nearest_branch";
                await repository.SaveConversationAsync(conversation, cancellationToken);
                await SendTextAsync(conversation, "WhatsApp konumunuzu paylaşın veya bulunduğunuz şehri yazın.", false, cancellationToken);
                break;
            case "customer_guarantee":
                conversation.State = "guarantee_lookup";
                conversation.Intent = "guarantee_lookup";
                await repository.SaveConversationAsync(conversation, cancellationToken);
                await SendTextAsync(conversation, "Garanti sorgusu için araç plakanızı veya rapor numaranızı yazın.", false, cancellationToken);
                break;
            case "customer_complaint":
                conversation.State = "complaint_category";
                conversation.Intent = "complaint";
                conversation.ContextJson = "{}";
                await repository.SaveConversationAsync(conversation, cancellationToken);
                await SendListAsync(
                    conversation,
                    "Destek talebinizin konusunu seçin.",
                    "Konu Seç",
                    [
                        new ListSectionOption("Destek Konuları",
                        [
                            new ListRowOption("complaint_report", "Rapor İtirazı"),
                            new ListRowOption("complaint_service", "Hizmet Şikâyeti"),
                            new ListRowOption("complaint_payment", "Ödeme / İade"),
                            new ListRowOption("complaint_guarantee", "Garanti Talebi"),
                            new ListRowOption("complaint_other", "Diğer")
                        ])
                    ],
                    cancellationToken);
                break;
            case "customer_agent":
                await HandoverAsync(conversation, "customer_agent", cancellationToken);
                break;
            default:
                await ShowCustomerMenuAsync(conversation, cancellationToken);
                break;
        }
    }

    private Task ShowDealerMenuAsync(WhatsAppConversation conversation, CancellationToken cancellationToken) =>
        SendListAsync(
            conversation,
            "OtoTR bayi ve servis destek alanına hoş geldiniz.",
            "İşlem Seç",
            [
                new ListSectionOption("Bayi / Servis",
                [
                    new ListRowOption("dealer_technical", "Teknik Destek", "ERP, mobil uygulama veya cihaz desteği"),
                    new ListRowOption("dealer_operations", "Operasyon Desteği", "İş emri, randevu ve rapor süreçleri"),
                    new ListRowOption("dealer_finance", "Finans ve Mutabakat", "Ödeme, royalty ve mutabakat işlemleri"),
                    new ListRowOption("dealer_training", "Akademi / Eğitim", "Eğitim ve sertifika işlemleri"),
                    new ListRowOption("dealer_agent", "Canlı Temsilci"),
                    new ListRowOption("main_menu", "Ana Menü"),
                    new ListRowOption("end_chat", "Sohbeti Bitir")
                ])
            ],
            cancellationToken);

    private async Task HandleDealerMenuAsync(WhatsAppConversation conversation, string input, CancellationToken cancellationToken)
    {
        if (input == "dealer_agent")
        {
            await HandoverAsync(conversation, "dealer_agent", cancellationToken);
            return;
        }

        var category = input switch
        {
            "dealer_technical" => "Bayi Teknik Destek",
            "dealer_operations" => "Bayi Operasyon Desteği",
            "dealer_finance" => "Bayi Finans ve Mutabakat",
            "dealer_training" => "Bayi Akademi ve Eğitim",
            _ => null
        };

        if (category is null)
        {
            await ShowDealerMenuAsync(conversation, cancellationToken);
            return;
        }

        conversation.State = "dealer_support_description";
        conversation.Intent = input;
        conversation.ContextJson = "{}";
        SetContext(conversation, "supportCategory", category);
        await repository.SaveConversationAsync(conversation, cancellationToken);
        await SendTextAsync(conversation, "Talebinizi ayrıntılı şekilde yazın. Varsa şube adı, plaka, iş emri veya hata bilgisini ekleyin.", false, cancellationToken);
    }

    private Task ShowFranchiseMenuAsync(WhatsAppConversation conversation, CancellationToken cancellationToken) =>
        SendListAsync(
            conversation,
            "OtoTR bayilik süreçleriyle ilgili yapmak istediğiniz işlemi seçin.",
            "İşlem Seç",
            [
                new ListSectionOption("Bayilik",
                [
                    new ListRowOption("franchise_info", "Bayilik Bilgisi", "Süreç ve genel model hakkında bilgi alın"),
                    new ListRowOption("franchise_apply", "Başvuru Oluştur", "Ön başvuru bilgilerinizi bırakın"),
                    new ListRowOption("franchise_agent", "Yetkiliyle Görüş", "Franchise ekibine bağlanın"),
                    new ListRowOption("main_menu", "Ana Menü"),
                    new ListRowOption("end_chat", "Sohbeti Bitir")
                ])
            ],
            cancellationToken);

    private async Task HandleFranchiseMenuAsync(WhatsAppConversation conversation, string input, CancellationToken cancellationToken)
    {
        switch (input)
        {
            case "franchise_info":
                await SendTextAsync(
                    conversation,
                    "OtoTR bayilik modeli; kurumsal ekspertiz süreçleri, merkezi ERP/CRM altyapısı, eğitim, kalite denetimi, marka ve operasyon desteğini kapsar. Başvuru için ‘Başvuru Oluştur’ seçeneğini kullanabilirsiniz.",
                    false,
                    cancellationToken);
                await ShowFranchiseMenuAsync(conversation, cancellationToken);
                break;
            case "franchise_apply":
                conversation.State = "franchise_name";
                conversation.Intent = "franchise_application";
                conversation.ContextJson = "{}";
                await repository.SaveConversationAsync(conversation, cancellationToken);
                await SendTextAsync(conversation, "Adınızı ve soyadınızı yazın.", false, cancellationToken);
                break;
            case "franchise_agent":
                await HandoverAsync(conversation, "franchise_agent", cancellationToken);
                break;
            default:
                await ShowFranchiseMenuAsync(conversation, cancellationToken);
                break;
        }
    }

    private async Task HandleCitySelectionAsync(
        WhatsAppConversation conversation,
        ParsedInboundMessage inbound,
        string purpose,
        CancellationToken cancellationToken)
    {
        var city = inbound.Text?.Trim();
        if (string.IsNullOrWhiteSpace(city) || city.Length < 2)
        {
            await SendTextAsync(conversation, "Lütfen geçerli bir şehir adı yazın.", false, cancellationToken);
            return;
        }

        var branches = (await erpGateway.GetBranchesAsync(city, cancellationToken))
            .Where(x => x.IsActive)
            .Take(10)
            .ToList();
        if (branches.Count == 0)
        {
            await SendButtonsAsync(
                conversation,
                $"{city} için aktif şube bulunamadı. Farklı bir şehir yazabilir veya temsilciye bağlanabilirsiniz.",
                [
                    new ReplyButtonOption("retry_city", "Şehir Değiştir"),
                    new ReplyButtonOption("customer_agent", "Canlı Temsilci"),
                    new ReplyButtonOption("main_menu", "Ana Menü")
                ],
                cancellationToken);
            return;
        }

        SetContext(conversation, "city", city);
        conversation.State = purpose == "appointment" ? "appointment_branch" : "packages_branch";
        await repository.SaveConversationAsync(conversation, cancellationToken);

        await SendListAsync(
            conversation,
            "İşlem yapmak istediğiniz OtoTR şubesini seçin.",
            "Şube Seç",
            [
                new ListSectionOption(
                    TrimText(city, 24),
                    branches.Select(branch => new ListRowOption(
                        $"branch_{branch.Id:N}",
                        TrimText(branch.Name, 24),
                        TrimText($"{branch.District} • {branch.Address}", 72))).ToList())
            ],
            cancellationToken);
    }

    private async Task HandleAppointmentBranchAsync(WhatsAppConversation conversation, string input, CancellationToken cancellationToken)
    {
        if (!TryReadGuidSelection(input, "branch_", out var branchId))
        {
            await SendTextAsync(conversation, "Lütfen listeden bir şube seçin.", false, cancellationToken);
            return;
        }

        var branches = await erpGateway.GetBranchesAsync(GetContext(conversation, "city"), cancellationToken);
        var branch = branches.FirstOrDefault(x => x.Id == branchId);
        var packages = (await erpGateway.GetPackagesAsync(branchId, cancellationToken))
            .Where(x => x.IsActive)
            .Take(10)
            .ToList();

        if (packages.Count == 0)
        {
            await HandoverAsync(conversation, "no_active_package", cancellationToken);
            return;
        }

        SetContext(conversation, "branchId", branchId.ToString("D"));
        SetContext(conversation, "branchName", branch?.Name ?? "OtoTR Şubesi");
        conversation.BranchId = branchId;
        conversation.State = "appointment_package";
        await repository.SaveConversationAsync(conversation, cancellationToken);

        await SendListAsync(
            conversation,
            "Ekspertiz paketini seçin.",
            "Paket Seç",
            [
                new ListSectionOption(
                    "Aktif Paketler",
                    packages.Select(package => new ListRowOption(
                        $"package_{package.Id:N}",
                        TrimText(package.Name, 24),
                        TrimText($"{package.Price.ToString("N0", TurkishCulture)} {package.Currency} • {package.ShortDescription}", 72))).ToList())
            ],
            cancellationToken);
    }

    private async Task HandleAppointmentPackageAsync(WhatsAppConversation conversation, string input, CancellationToken cancellationToken)
    {
        if (!TryReadGuidSelection(input, "package_", out var packageId) ||
            !Guid.TryParse(GetContext(conversation, "branchId"), out var branchId))
        {
            await SendTextAsync(conversation, "Lütfen listeden bir paket seçin.", false, cancellationToken);
            return;
        }

        var packages = await erpGateway.GetPackagesAsync(branchId, cancellationToken);
        var package = packages.FirstOrDefault(x => x.Id == packageId);
        SetContext(conversation, "packageId", packageId.ToString("D"));
        SetContext(conversation, "packageName", package?.Name ?? "Ekspertiz Paketi");
        conversation.State = "appointment_date";
        await repository.SaveConversationAsync(conversation, cancellationToken);

        var today = DateOnly.FromDateTime(DateTime.UtcNow.AddHours(3));
        var rows = Enumerable.Range(0, 7)
            .Select(offset => today.AddDays(offset))
            .Select(date => new ListRowOption(
                $"date_{date:yyyyMMdd}",
                date.ToString("dd MMMM dddd", TurkishCulture),
                offsetDescription(date, today)))
            .ToList();

        await SendListAsync(
            conversation,
            "Randevu tarihini seçin.",
            "Tarih Seç",
            [new ListSectionOption("Uygun Günler", rows)],
            cancellationToken);
    }

    private async Task HandleAppointmentDateAsync(WhatsAppConversation conversation, string input, CancellationToken cancellationToken)
    {
        if (!input.StartsWith("date_", StringComparison.Ordinal) ||
            !DateOnly.TryParseExact(input[5..], "yyyyMMdd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var date) ||
            !Guid.TryParse(GetContext(conversation, "branchId"), out var branchId) ||
            !Guid.TryParse(GetContext(conversation, "packageId"), out var packageId))
        {
            await SendTextAsync(conversation, "Lütfen listeden geçerli bir tarih seçin.", false, cancellationToken);
            return;
        }

        var slots = (await erpGateway.GetAppointmentSlotsAsync(branchId, packageId, date, cancellationToken))
            .Where(x => x.IsAvailable)
            .Take(10)
            .ToList();
        if (slots.Count == 0)
        {
            await SendButtonsAsync(
                conversation,
                "Seçtiğiniz tarihte boş saat bulunamadı.",
                [
                    new ReplyButtonOption("customer_appointment", "Yeni Tarih"),
                    new ReplyButtonOption("customer_agent", "Canlı Temsilci"),
                    new ReplyButtonOption("main_menu", "Ana Menü")
                ],
                cancellationToken);
            return;
        }

        SetContext(conversation, "appointmentDate", date.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture));
        conversation.State = "appointment_time";
        await repository.SaveConversationAsync(conversation, cancellationToken);

        await SendListAsync(
            conversation,
            "Randevu saatini seçin.",
            "Saat Seç",
            [
                new ListSectionOption(
                    date.ToString("dd MMMM", TurkishCulture),
                    slots.Select(slot => new ListRowOption(
                        $"time_{slot.Value.Replace(":", string.Empty)}",
                        slot.DisplayText)).ToList())
            ],
            cancellationToken);
    }

    private async Task HandleAppointmentTimeAsync(WhatsAppConversation conversation, string input, CancellationToken cancellationToken)
    {
        if (!input.StartsWith("time_", StringComparison.Ordinal) || input.Length < 9)
        {
            await SendTextAsync(conversation, "Lütfen listeden bir saat seçin.", false, cancellationToken);
            return;
        }

        var value = input[5..];
        if (value.Length == 4)
        {
            value = value.Insert(2, ":");
        }

        if (!TimeOnly.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out var time))
        {
            await SendTextAsync(conversation, "Seçilen saat doğrulanamadı. Lütfen tekrar seçin.", false, cancellationToken);
            return;
        }

        SetContext(conversation, "appointmentTime", time.ToString("HH:mm", CultureInfo.InvariantCulture));
        conversation.State = "appointment_plate";
        await repository.SaveConversationAsync(conversation, cancellationToken);
        await SendTextAsync(conversation, "Ekspertiz yapılacak aracın plakasını yazın. Örnek: 34 ABC 123", false, cancellationToken);
    }

    private async Task HandleAppointmentPlateAsync(WhatsAppConversation conversation, string? plateInput, CancellationToken cancellationToken)
    {
        var plate = NormalizePlate(plateInput);
        if (plate.Length is < 5 or > 12)
        {
            await SendTextAsync(conversation, "Plaka bilgisi doğrulanamadı. Lütfen araç plakasını yeniden yazın.", false, cancellationToken);
            return;
        }

        SetContext(conversation, "plate", plate);
        conversation.State = "appointment_confirm";
        await repository.SaveConversationAsync(conversation, cancellationToken);

        var summary = $"Randevu bilgilerinizi kontrol edin:\n\n" +
                      $"Şube: {GetContext(conversation, "branchName")}\n" +
                      $"Paket: {GetContext(conversation, "packageName")}\n" +
                      $"Tarih: {GetContext(conversation, "appointmentDate")}\n" +
                      $"Saat: {GetContext(conversation, "appointmentTime")}\n" +
                      $"Plaka: {plate}";

        await SendButtonsAsync(
            conversation,
            summary,
            [
                new ReplyButtonOption("appointment_confirm_yes", "Onayla"),
                new ReplyButtonOption("customer_appointment", "Baştan Başla"),
                new ReplyButtonOption("main_menu", "Ana Menü")
            ],
            cancellationToken);
    }

    private async Task HandleAppointmentConfirmationAsync(WhatsAppConversation conversation, string input, CancellationToken cancellationToken)
    {
        if (input != "appointment_confirm_yes")
        {
            await ShowCustomerMenuAsync(conversation, cancellationToken);
            return;
        }

        if (!Guid.TryParse(GetContext(conversation, "branchId"), out var branchId) ||
            !Guid.TryParse(GetContext(conversation, "packageId"), out var packageId) ||
            !DateOnly.TryParse(GetContext(conversation, "appointmentDate"), out var date) ||
            !TimeOnly.TryParse(GetContext(conversation, "appointmentTime"), out var time))
        {
            await HandoverAsync(conversation, "invalid_appointment_context", cancellationToken);
            return;
        }

        var result = await erpGateway.CreateAppointmentAsync(
            new CreateAppointmentCommand(
                conversation.Contact.PhoneNumber,
                conversation.Contact.DisplayName,
                branchId,
                packageId,
                date,
                time,
                GetContext(conversation, "plate") ?? string.Empty,
                "whatsapp",
                null),
            cancellationToken);

        await repository.AddEventAsync(
            conversation.Id,
            "appointment_created",
            "bot",
            null,
            JsonSerializer.Serialize(result),
            cancellationToken);

        conversation.State = "customer_menu";
        conversation.Intent = "customer";
        conversation.ContextJson = "{}";
        await repository.SaveConversationAsync(conversation, cancellationToken);

        await SendTextAsync(
            conversation,
            $"Randevunuz oluşturuldu ✅\n\nRandevu No: {result.AppointmentNumber}\nŞube: {result.BranchName}\nPaket: {result.PackageName}\nTarih: {result.AppointmentDateTime:dd.MM.yyyy HH:mm}\nDurum: {result.Status}",
            false,
            cancellationToken);
        await ShowCustomerMenuAsync(conversation, cancellationToken);
    }

    private async Task HandlePackagesBranchAsync(WhatsAppConversation conversation, string input, CancellationToken cancellationToken)
    {
        if (!TryReadGuidSelection(input, "branch_", out var branchId))
        {
            await SendTextAsync(conversation, "Lütfen listeden bir şube seçin.", false, cancellationToken);
            return;
        }

        var packages = (await erpGateway.GetPackagesAsync(branchId, cancellationToken))
            .Where(x => x.IsActive)
            .Take(10)
            .ToList();
        if (packages.Count == 0)
        {
            await SendTextAsync(conversation, "Bu şube için aktif paket bulunamadı.", false, cancellationToken);
        }
        else
        {
            var lines = packages.Select(package =>
                $"• {package.Name}: {package.Price.ToString("N0", TurkishCulture)} {package.Currency}" +
                (string.IsNullOrWhiteSpace(package.ShortDescription) ? string.Empty : $"\n  {package.ShortDescription}"));
            await SendTextAsync(conversation, "Aktif ekspertiz paketleri:\n\n" + string.Join("\n\n", lines), false, cancellationToken);
        }

        conversation.State = "customer_menu";
        conversation.Intent = "customer";
        conversation.ContextJson = "{}";
        await repository.SaveConversationAsync(conversation, cancellationToken);
        await ShowCustomerMenuAsync(conversation, cancellationToken);
    }

    private async Task HandleReportLookupAsync(WhatsAppConversation conversation, string? value, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            await SendTextAsync(conversation, "Lütfen plaka veya rapor numarası yazın.", false, cancellationToken);
            return;
        }

        var result = await erpGateway.LookupReportAsync(conversation.Contact.PhoneNumber, value.Trim(), cancellationToken);
        if (!result.Found)
        {
            await SendButtonsAsync(
                conversation,
                "Bu bilgilerle eşleşen bir rapor bulunamadı.",
                [
                    new ReplyButtonOption("customer_report", "Tekrar Dene"),
                    new ReplyButtonOption("customer_agent", "Canlı Temsilci"),
                    new ReplyButtonOption("main_menu", "Ana Menü")
                ],
                cancellationToken);
            return;
        }

        var urlLine = string.IsNullOrWhiteSpace(result.PublicReportUrl) ? string.Empty : $"\nRapor: {result.PublicReportUrl}";
        await SendTextAsync(
            conversation,
            $"Rapor bulundu ✅\n\nRapor No: {result.ReportNumber}\nPlaka: {result.Plate}\nAraç: {result.Vehicle}\nTarih: {result.ReportDate:dd.MM.yyyy}\nDurum: {result.Status}{urlLine}",
            true,
            cancellationToken);
        conversation.State = "customer_menu";
        await repository.SaveConversationAsync(conversation, cancellationToken);
        await ShowCustomerMenuAsync(conversation, cancellationToken);
    }

    private async Task HandleGuaranteeLookupAsync(WhatsAppConversation conversation, string? value, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            await SendTextAsync(conversation, "Lütfen plaka veya rapor numarası yazın.", false, cancellationToken);
            return;
        }

        var result = await erpGateway.LookupGuaranteeAsync(conversation.Contact.PhoneNumber, value.Trim(), cancellationToken);
        if (!result.Found)
        {
            await SendButtonsAsync(
                conversation,
                "Bu bilgilerle eşleşen garanti kaydı bulunamadı.",
                [
                    new ReplyButtonOption("customer_guarantee", "Tekrar Dene"),
                    new ReplyButtonOption("customer_agent", "Canlı Temsilci"),
                    new ReplyButtonOption("main_menu", "Ana Menü")
                ],
                cancellationToken);
            return;
        }

        await SendTextAsync(
            conversation,
            $"Garanti durumu: {(result.Eligible ? "Kapsamda ✅" : "Kapsam dışı")}\nPlaka: {result.Plate}\nPaket: {result.PackageName}\nBitiş: {result.CoverageEndDate:dd.MM.yyyy}\nKalan km: {result.RemainingKilometers}\nAçıklama: {result.Explanation}",
            false,
            cancellationToken);
        conversation.State = "customer_menu";
        await repository.SaveConversationAsync(conversation, cancellationToken);
        await ShowCustomerMenuAsync(conversation, cancellationToken);
    }

    private async Task HandleNearestBranchAsync(WhatsAppConversation conversation, ParsedInboundMessage inbound, CancellationToken cancellationToken)
    {
        var branches = (await erpGateway.GetBranchesAsync(inbound.Text?.Trim(), cancellationToken))
            .Where(x => x.IsActive)
            .ToList();

        if (inbound.Latitude.HasValue && inbound.Longitude.HasValue)
        {
            branches = branches
                .Where(x => x.Latitude.HasValue && x.Longitude.HasValue)
                .OrderBy(x => DistanceKm(
                    inbound.Latitude.Value,
                    inbound.Longitude.Value,
                    x.Latitude!.Value,
                    x.Longitude!.Value))
                .Take(3)
                .ToList();
        }
        else
        {
            branches = branches.Take(3).ToList();
        }

        if (branches.Count == 0)
        {
            await HandoverAsync(conversation, "branch_not_found", cancellationToken);
            return;
        }

        var lines = branches.Select((branch, index) =>
            $"{index + 1}. {branch.Name}\n{branch.City} / {branch.District}\n{branch.Address}");
        await SendTextAsync(conversation, "Size uygun OtoTR şubeleri:\n\n" + string.Join("\n\n", lines), false, cancellationToken);
        conversation.State = "customer_menu";
        await repository.SaveConversationAsync(conversation, cancellationToken);
        await ShowCustomerMenuAsync(conversation, cancellationToken);
    }

    private async Task HandleComplaintCategoryAsync(WhatsAppConversation conversation, string input, CancellationToken cancellationToken)
    {
        var category = input switch
        {
            "complaint_report" => "Rapor İtirazı",
            "complaint_service" => "Hizmet Şikâyeti",
            "complaint_payment" => "Ödeme / İade",
            "complaint_guarantee" => "Garanti Talebi",
            "complaint_other" => "Diğer",
            _ => null
        };

        if (category is null)
        {
            await SendTextAsync(conversation, "Lütfen listeden bir destek konusu seçin.", false, cancellationToken);
            return;
        }

        SetContext(conversation, "supportCategory", category);
        conversation.State = "complaint_description";
        await repository.SaveConversationAsync(conversation, cancellationToken);
        await SendTextAsync(conversation, "Talebinizi ayrıntılı şekilde yazın. Varsa plaka, rapor numarası, şube ve tarih bilgisini ekleyin.", false, cancellationToken);
    }

    private async Task HandleComplaintDescriptionAsync(WhatsAppConversation conversation, string? description, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(description) || description.Trim().Length < 5)
        {
            await SendTextAsync(conversation, "Talebinizi en az birkaç kelimeyle açıklayın.", false, cancellationToken);
            return;
        }

        var category = GetContext(conversation, "supportCategory") ?? "Müşteri Destek Talebi";
        var result = await erpGateway.CreateSupportTicketAsync(
            new CreateSupportTicketCommand(
                conversation.Contact.PhoneNumber,
                conversation.Contact.DisplayName,
                category,
                description.Trim(),
                conversation.BranchId,
                "whatsapp",
                conversation.Id),
            cancellationToken);

        await SendTextAsync(
            conversation,
            $"Destek kaydınız oluşturuldu ✅\nKayıt No: {result.TicketNumber}\nDurum: {result.Status}\nGörüşmeniz müşteri temsilcisine aktarılıyor.",
            false,
            cancellationToken);
        await HandoverAsync(conversation, "support_ticket_created", cancellationToken, false);
    }

    private async Task HandleDealerSupportDescriptionAsync(WhatsAppConversation conversation, string? description, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(description) || description.Trim().Length < 5)
        {
            await SendTextAsync(conversation, "Talebinizi biraz daha ayrıntılı yazın.", false, cancellationToken);
            return;
        }

        var category = GetContext(conversation, "supportCategory") ?? "Bayi Destek";
        var result = await erpGateway.CreateSupportTicketAsync(
            new CreateSupportTicketCommand(
                conversation.Contact.PhoneNumber,
                conversation.Contact.DisplayName,
                category,
                description.Trim(),
                conversation.BranchId,
                "whatsapp_dealer",
                conversation.Id),
            cancellationToken);

        await SendTextAsync(
            conversation,
            $"Bayi destek kaydınız oluşturuldu. Kayıt No: {result.TicketNumber}. İlgili ekip görüşmeye katılacaktır.",
            false,
            cancellationToken);
        await HandoverAsync(conversation, "dealer_ticket_created", cancellationToken, false);
    }

    private async Task HandleFranchiseNameAsync(WhatsAppConversation conversation, string? name, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(name) || name.Trim().Length < 3)
        {
            await SendTextAsync(conversation, "Lütfen adınızı ve soyadınızı yazın.", false, cancellationToken);
            return;
        }

        SetContext(conversation, "franchiseName", name.Trim());
        conversation.State = "franchise_city";
        await repository.SaveConversationAsync(conversation, cancellationToken);
        await SendTextAsync(conversation, "Bayilik düşündüğünüz şehir veya bölgeyi yazın.", false, cancellationToken);
    }

    private async Task HandleFranchiseCityAsync(WhatsAppConversation conversation, string? city, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(city) || city.Trim().Length < 2)
        {
            await SendTextAsync(conversation, "Lütfen geçerli bir şehir veya bölge yazın.", false, cancellationToken);
            return;
        }

        SetContext(conversation, "franchiseCity", city.Trim());
        conversation.State = "franchise_investment";
        await repository.SaveConversationAsync(conversation, cancellationToken);
        await SendButtonsAsync(
            conversation,
            "Planladığınız yatırım aralığını seçin.",
            [
                new ReplyButtonOption("investment_1", "1–3 Milyon TL"),
                new ReplyButtonOption("investment_2", "3–6 Milyon TL"),
                new ReplyButtonOption("investment_3", "6 Milyon TL +")
            ],
            cancellationToken);
    }

    private async Task HandleFranchiseInvestmentAsync(WhatsAppConversation conversation, string input, CancellationToken cancellationToken)
    {
        var investment = input switch
        {
            "investment_1" => "1–3 Milyon TL",
            "investment_2" => "3–6 Milyon TL",
            "investment_3" => "6 Milyon TL ve üzeri",
            _ => null
        };

        if (investment is null)
        {
            await SendTextAsync(conversation, "Lütfen yatırım aralığını düğmelerden seçin.", false, cancellationToken);
            return;
        }

        var result = await erpGateway.CreateFranchiseLeadAsync(
            new CreateFranchiseLeadCommand(
                conversation.Contact.PhoneNumber,
                GetContext(conversation, "franchiseName") ?? conversation.Contact.DisplayName,
                GetContext(conversation, "franchiseCity") ?? string.Empty,
                investment,
                "whatsapp",
                conversation.Id),
            cancellationToken);

        await SendTextAsync(
            conversation,
            $"Bayilik ön başvurunuz alındı ✅\nBaşvuru No: {result.LeadNumber}\nDurum: {result.Status}\nFranchise ekibimiz sizinle iletişime geçecektir.",
            false,
            cancellationToken);
        await HandoverAsync(conversation, "franchise_lead_created", cancellationToken, false);
    }

    private async Task HandoverAsync(
        WhatsAppConversation conversation,
        string reason,
        CancellationToken cancellationToken,
        bool sendMessage = true)
    {
        conversation.Status = "waiting_agent";
        conversation.BotEnabled = false;
        conversation.SupportQueue = _options.SupportQueueName;
        await repository.SaveConversationAsync(conversation, cancellationToken);
        await repository.AddEventAsync(
            conversation.Id,
            "handover_requested",
            "bot",
            null,
            JsonSerializer.Serialize(new { reason, queue = _options.SupportQueueName }),
            cancellationToken);

        if (sendMessage)
        {
            await SendTextAsync(
                conversation,
                "Görüşmenizi canlı müşteri temsilcisine aktardım. Mesajlarınızı bu sohbetten göndermeye devam edebilirsiniz.",
                false,
                cancellationToken);
        }
    }

    private async Task CloseAsync(WhatsAppConversation conversation, CancellationToken cancellationToken)
    {
        await SendTextAsync(
            conversation,
            "Görüşmeniz sonlandırıldı. Yeniden destek almak için dilediğiniz zaman ‘Merhaba’ veya ‘Menü’ yazabilirsiniz. OtoTR’yi tercih ettiğiniz için teşekkür ederiz.",
            false,
            cancellationToken);
        conversation.Status = "closed";
        conversation.BotEnabled = false;
        conversation.ClosedAtUtc = DateTime.UtcNow;
        await repository.SaveConversationAsync(conversation, cancellationToken);
        await repository.AddEventAsync(conversation.Id, "conversation_closed", "bot", null, "{}", cancellationToken);
    }

    private async Task SendTextAsync(
        WhatsAppConversation conversation,
        string text,
        bool previewUrl,
        CancellationToken cancellationToken)
    {
        var result = await metaClient.SendTextAsync(conversation.Contact.WaId, text, previewUrl, cancellationToken);
        await repository.AddOutboundMessageAsync(
            conversation,
            result.MessageId,
            "text",
            text,
            result.RawResponse,
            cancellationToken);
    }

    private async Task SendButtonsAsync(
        WhatsAppConversation conversation,
        string body,
        IReadOnlyList<ReplyButtonOption> buttons,
        CancellationToken cancellationToken)
    {
        var result = await metaClient.SendReplyButtonsAsync(conversation.Contact.WaId, body, buttons, cancellationToken);
        await repository.AddOutboundMessageAsync(
            conversation,
            result.MessageId,
            "interactive_button",
            body,
            JsonSerializer.Serialize(new { body, buttons, response = result.RawResponse }),
            cancellationToken);
    }

    private async Task SendListAsync(
        WhatsAppConversation conversation,
        string body,
        string actionText,
        IReadOnlyList<ListSectionOption> sections,
        CancellationToken cancellationToken)
    {
        var result = await metaClient.SendListAsync(conversation.Contact.WaId, body, actionText, sections, cancellationToken);
        await repository.AddOutboundMessageAsync(
            conversation,
            result.MessageId,
            "interactive_list",
            body,
            JsonSerializer.Serialize(new { body, actionText, sections, response = result.RawResponse }),
            cancellationToken);
    }

    private static string Normalize(string? value) =>
        string.IsNullOrWhiteSpace(value)
            ? string.Empty
            : value.Trim().ToLower(TurkishCulture);

    private static bool IsMainMenuCommand(string value) =>
        value is "menu" or "menü" or "ana menü" or "ana menu" or "main_menu" or "merhaba" or "selam" or "başla" or "basla";

    private static bool IsAgentCommand(string value) =>
        value is "temsilci" or "müşteri temsilcisi" or "musteri temsilcisi" or "canlı destek" or "canli destek" or "customer_agent";

    private static bool IsEndCommand(string value) =>
        value is "bitir" or "sohbeti bitir" or "end_chat" or "kapat";

    private static string NormalizePlate(string? value) =>
        new string((value ?? string.Empty)
            .ToUpper(TurkishCulture)
            .Where(character => char.IsLetterOrDigit(character))
            .ToArray());

    private static bool TryReadGuidSelection(string value, string prefix, out Guid id)
    {
        id = Guid.Empty;
        if (!value.StartsWith(prefix, StringComparison.Ordinal))
        {
            return false;
        }

        return Guid.TryParseExact(value[prefix.Length..], "N", out id) ||
               Guid.TryParse(value[prefix.Length..], out id);
    }

    private static Dictionary<string, string> ReadContext(WhatsAppConversation conversation)
    {
        try
        {
            return JsonSerializer.Deserialize<Dictionary<string, string>>(conversation.ContextJson) ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }

    private static string? GetContext(WhatsAppConversation conversation, string key)
    {
        var context = ReadContext(conversation);
        return context.TryGetValue(key, out var value) ? value : null;
    }

    private static void SetContext(WhatsAppConversation conversation, string key, string value)
    {
        var context = ReadContext(conversation);
        context[key] = value;
        conversation.ContextJson = JsonSerializer.Serialize(context);
    }

    private static string TrimText(string? value, int maximumLength)
    {
        var normalized = string.IsNullOrWhiteSpace(value) ? "-" : value.Trim();
        return normalized.Length <= maximumLength
            ? normalized
            : normalized[..Math.Max(1, maximumLength - 1)] + "…";
    }

    private static string offsetDescription(DateOnly date, DateOnly today)
    {
        if (date == today)
        {
            return "Bugün";
        }

        if (date == today.AddDays(1))
        {
            return "Yarın";
        }

        return date.ToString("dd.MM.yyyy", CultureInfo.InvariantCulture);
    }

    private static double DistanceKm(decimal latitude1, decimal longitude1, decimal latitude2, decimal longitude2)
    {
        const double radius = 6371d;
        var lat1 = DegreesToRadians((double)latitude1);
        var lat2 = DegreesToRadians((double)latitude2);
        var deltaLat = DegreesToRadians((double)(latitude2 - latitude1));
        var deltaLon = DegreesToRadians((double)(longitude2 - longitude1));
        var a = Math.Sin(deltaLat / 2) * Math.Sin(deltaLat / 2) +
                Math.Cos(lat1) * Math.Cos(lat2) *
                Math.Sin(deltaLon / 2) * Math.Sin(deltaLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return radius * c;
    }

    private static double DegreesToRadians(double degrees) => degrees * Math.PI / 180d;
}
