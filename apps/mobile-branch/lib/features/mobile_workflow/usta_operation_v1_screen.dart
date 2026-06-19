import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

enum _FlowStep {
  jobs,
  detail,
  modules,
  testEntry,
  evidence,
  finalCheck,
}

class UstaOperationV1Screen extends StatefulWidget {
  const UstaOperationV1Screen({super.key});

  @override
  State<UstaOperationV1Screen> createState() => _UstaOperationV1ScreenState();
}

class _UstaOperationV1ScreenState extends State<UstaOperationV1Screen> {
  _FlowStep _step = _FlowStep.jobs;
  String _activeModule = 'Kaporta - Boya Ekspertiz ve Check-Up';
  bool _generalPhotosDone = false;
  bool _moduleStarted = false;
  bool _allGoodApplied = false;
  bool _frontPhotoDone = false;
  bool _rearPhotoDone = false;
  bool _vinPhotoDone = false;
  bool _damagePhotoDone = false;
  bool _finalSent = false;
  String _selectedStatus = 'Orijinal';
  String _gearType = 'Otomatik';

  final _kmController = TextEditingController(text: '45210');
  final _vinController = TextEditingController(text: 'WVWZZZ3CZEP005235');
  final _micronController = TextEditingController(text: '118');
  final _noteController = TextEditingController();

  @override
  void dispose() {
    _kmController.dispose();
    _vinController.dispose();
    _micronController.dispose();
    _noteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF0F2F5),
      body: SafeArea(
        child: Column(
          children: [
            _TopBar(
              canGoBack: _step != _FlowStep.jobs,
              onBack: _goBack,
              title: _title,
            ),
            Expanded(child: _body),
          ],
        ),
      ),
      bottomNavigationBar: _BottomNav(activeIndex: _bottomIndex),
    );
  }

  int get _bottomIndex {
    return switch (_step) {
      _FlowStep.jobs => 0,
      _FlowStep.detail || _FlowStep.modules || _FlowStep.testEntry => 1,
      _FlowStep.evidence || _FlowStep.finalCheck => 2,
    };
  }

  String get _title {
    return switch (_step) {
      _FlowStep.jobs => 'Bekleyen Araçlar',
      _FlowStep.detail => 'İş Emri Detayı',
      _FlowStep.modules => 'Ekspertiz Modülleri',
      _FlowStep.testEntry => 'Test Girişi',
      _FlowStep.evidence => 'Fotoğraf & Kanıt',
      _FlowStep.finalCheck => 'Final Kontrol',
    };
  }

  Widget get _body {
    return switch (_step) {
      _FlowStep.jobs => _JobsView(
          generalPhotosDone: _generalPhotosDone,
          onOpenJob: () => setState(() => _step = _FlowStep.detail),
          onCaptureGeneralPhotos: () => setState(() {
            _generalPhotosDone = true;
            _frontPhotoDone = true;
            _rearPhotoDone = true;
          }),
        ),
      _FlowStep.detail => _DetailView(
          generalPhotosDone: _generalPhotosDone,
          onOpenModules: () => setState(() => _step = _FlowStep.modules),
          onOpenEvidence: () => setState(() => _step = _FlowStep.evidence),
        ),
      _FlowStep.modules => _ModulesView(
          moduleStarted: _moduleStarted,
          onStartModule: (module) => setState(() {
            _activeModule = module;
            _moduleStarted = true;
            _step = _FlowStep.testEntry;
          }),
          onFinal: () => setState(() => _step = _FlowStep.finalCheck),
        ),
      _FlowStep.testEntry => _TestEntryView(
          moduleTitle: _activeModule,
          kmController: _kmController,
          vinController: _vinController,
          micronController: _micronController,
          noteController: _noteController,
          selectedStatus: _selectedStatus,
          gearType: _gearType,
          allGoodApplied: _allGoodApplied,
          onStatusChanged: (value) => setState(() => _selectedStatus = value),
          onGearChanged: (value) => setState(() => _gearType = value),
          onAllGood: () => setState(() {
            _allGoodApplied = true;
            _selectedStatus = 'İyi';
          }),
          onContinue: () => setState(() => _step = _FlowStep.evidence),
        ),
      _FlowStep.evidence => _EvidenceView(
          frontPhotoDone: _frontPhotoDone,
          rearPhotoDone: _rearPhotoDone,
          vinPhotoDone: _vinPhotoDone,
          damagePhotoDone: _damagePhotoDone,
          onToggleFront: () => setState(() => _frontPhotoDone = true),
          onToggleRear: () => setState(() => _rearPhotoDone = true),
          onToggleVin: () => setState(() => _vinPhotoDone = true),
          onToggleDamage: () => setState(() => _damagePhotoDone = true),
          onContinue: () => setState(() => _step = _FlowStep.finalCheck),
        ),
      _FlowStep.finalCheck => _FinalView(
          ready: _frontPhotoDone &&
              _rearPhotoDone &&
              _vinPhotoDone &&
              _damagePhotoDone &&
              _kmController.text.trim().isNotEmpty &&
              _vinController.text.trim().isNotEmpty,
          sent: _finalSent,
          onSend: () => setState(() => _finalSent = true),
          onBackToJobs: () => setState(() => _step = _FlowStep.jobs),
        ),
    };
  }

  void _goBack() {
    setState(() {
      _step = switch (_step) {
        _FlowStep.detail => _FlowStep.jobs,
        _FlowStep.modules => _FlowStep.detail,
        _FlowStep.testEntry => _FlowStep.modules,
        _FlowStep.evidence => _FlowStep.testEntry,
        _FlowStep.finalCheck => _FlowStep.evidence,
        _FlowStep.jobs => _FlowStep.jobs,
      };
    });
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({
    required this.canGoBack,
    required this.onBack,
    required this.title,
  });

  final bool canGoBack;
  final VoidCallback onBack;
  final String title;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFFB4B4B4),
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
      child: Row(
        children: [
          _CircleIconButton(
            icon: canGoBack ? Icons.arrow_back : Icons.menu,
            label: canGoBack ? 'Geri' : 'Menü',
            onTap: canGoBack ? onBack : () {},
          ),
          Expanded(
            child: Column(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    border: Border.all(color: AppColors.red, width: 3),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  alignment: Alignment.center,
                  child: const Text(
                    'O',
                    style: TextStyle(
                      color: AppColors.red,
                      fontWeight: FontWeight.w900,
                      fontSize: 22,
                    ),
                  ),
                ),
                const SizedBox(height: 4),
                const Text(
                  'OTOTR',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w900,
                    fontSize: 22,
                  ),
                ),
                Text(
                  title,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          _CircleIconButton(
            icon: Icons.notifications_none,
            label: 'Bildirim',
            onTap: () {},
            badge: '3',
          ),
        ],
      ),
    );
  }
}

class _CircleIconButton extends StatelessWidget {
  const _CircleIconButton({
    required this.icon,
    required this.label,
    required this.onTap,
    this.badge,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final String? badge;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: label,
      button: true,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(999),
        child: Stack(
          clipBehavior: Clip.none,
          children: [
            Container(
              width: 52,
              height: 52,
              decoration: const BoxDecoration(
                color: Color(0xFF5F5F5F),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: Colors.white, size: 29),
            ),
            if (badge != null)
              Positioned(
                right: -2,
                top: -3,
                child: Container(
                  width: 20,
                  height: 20,
                  decoration: const BoxDecoration(
                    color: AppColors.red,
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    badge!,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _JobsView extends StatelessWidget {
  const _JobsView({
    required this.generalPhotosDone,
    required this.onOpenJob,
    required this.onCaptureGeneralPhotos,
  });

  final bool generalPhotosDone;
  final VoidCallback onOpenJob;
  final VoidCallback onCaptureGeneralPhotos;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(12, 0, 12, 18),
      children: [
        Container(
          margin: const EdgeInsets.only(top: 0, bottom: 12),
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
          decoration: BoxDecoration(
            color: AppColors.red,
            borderRadius: BorderRadius.circular(6),
          ),
          child: const Text(
            '1 araç otoraporlanmayı bekliyor',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
        _VehicleCard(
          generalPhotosDone: generalPhotosDone,
          onOpenJob: onOpenJob,
          onCaptureGeneralPhotos: onCaptureGeneralPhotos,
        ),
        const SizedBox(height: 14),
        _ModuleSummaryCard(
          title: 'KAPORTA - BOYA EKSPERTİZ VE CHECK-UP',
          sent: '0/59',
          time: '0 dk. /15dk.',
          onTap: onOpenJob,
        ),
        _ModuleSummaryCard(
          title: 'İÇ EKSPERTİZ VE CHECK-UP',
          sent: '0/46',
          time: '0 dk. /8dk.',
          onTap: onOpenJob,
        ),
        _ModuleSummaryCard(
          title: 'ALT / ÖN / MEKANİK EKSPERTİZ ve CHECK-UP',
          sent: '0/40',
          time: '0 dk. /6dk.',
          onTap: onOpenJob,
        ),
        _ModuleSummaryCard(
          title: 'MOTOR EKSPERTİZ VE CHECK-UP',
          sent: '0/37',
          time: '0 dk. /4dk.',
          onTap: onOpenJob,
        ),
        _PrimaryActionButton(
          label: 'Genel Resim Çek',
          icon: Icons.camera_alt_outlined,
          onPressed: onCaptureGeneralPhotos,
          color: AppColors.success,
        ),
      ],
    );
  }
}

class _VehicleCard extends StatelessWidget {
  const _VehicleCard({
    required this.generalPhotosDone,
    required this.onOpenJob,
    required this.onCaptureGeneralPhotos,
  });

  final bool generalPhotosDone;
  final VoidCallback onOpenJob;
  final VoidCallback onCaptureGeneralPhotos;

  @override
  Widget build(BuildContext context) {
    return _Card(
      onTap: onOpenJob,
      child: Column(
        children: [
          const Row(
            children: [
              Icon(Icons.directions_car_outlined, size: 48),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  '16SVK16',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppColors.red,
                    fontSize: 38,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const _InfoRow(label: 'Şase No', value: 'WVWZZZ3CZEP005235'),
          const _InfoRow(label: 'İş Emri No', value: 'NLF20274218'),
          const _InfoRow(label: 'Motor No', value: 'CAYV83719 / Dizel / 75kw'),
          const Divider(height: 24, thickness: 1.4),
          const Text('250 D', style: TextStyle(fontSize: 24)),
          const Text(
            'Mercedes-Benz',
            style: TextStyle(fontSize: 32, fontWeight: FontWeight.w900),
          ),
          const Text('2013', style: TextStyle(fontSize: 25)),
          const SizedBox(height: 14),
          _PrimaryActionButton(
            label: generalPhotosDone
                ? 'Araç resimleri çekildi'
                : 'Araç resimleri çekilmedi',
            icon: Icons.camera_alt,
            onPressed: onCaptureGeneralPhotos,
            color: generalPhotosDone ? AppColors.success : AppColors.red,
          ),
        ],
      ),
    );
  }
}

class _DetailView extends StatelessWidget {
  const _DetailView({
    required this.generalPhotosDone,
    required this.onOpenModules,
    required this.onOpenEvidence,
  });

  final bool generalPhotosDone;
  final VoidCallback onOpenModules;
  final VoidCallback onOpenEvidence;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        _PlateHeader(status: generalPhotosDone ? 'Fotoğraflar hazır' : 'Fotoğraf eksik'),
        const SizedBox(height: 12),
        const _Card(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '16SVK16',
                style: TextStyle(
                  color: AppColors.red,
                  fontSize: 34,
                  fontWeight: FontWeight.w900,
                ),
              ),
              SizedBox(height: 4),
              Text(
                '250 D Mercedes-Benz - 2013 - Dizel',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
              ),
              SizedBox(height: 12),
              _InfoRow(label: 'Paket', value: 'Premium Ekspertiz'),
              _InfoRow(label: 'Randevu', value: '17 Mayıs 2026 14:30'),
              _InfoRow(label: 'Müşteri', value: 'Demo Müşteri'),
              _InfoRow(label: 'Atölye', value: 'Bursa Küçük Sanayi'),
            ],
          ),
        ),
        const SizedBox(height: 12),
        const Row(
          children: [
            Expanded(child: _MetricBox(label: 'Modül', value: '9')),
            SizedBox(width: 8),
            Expanded(child: _MetricBox(label: 'Eksik', value: '4')),
            SizedBox(width: 8),
            Expanded(child: _MetricBox(label: 'Kayıt', value: '0')),
          ],
        ),
        const SizedBox(height: 12),
        _PrimaryActionButton(
          label: 'Göreve Başla',
          icon: Icons.play_arrow,
          onPressed: onOpenModules,
          color: AppColors.info,
        ),
        const SizedBox(height: 10),
        _SecondaryActionButton(
          label: 'Fotoğraf & Kanıtları Aç',
          icon: Icons.photo_library_outlined,
          onPressed: onOpenEvidence,
        ),
      ],
    );
  }
}

class _ModulesView extends StatelessWidget {
  const _ModulesView({
    required this.moduleStarted,
    required this.onStartModule,
    required this.onFinal,
  });

  final bool moduleStarted;
  final void Function(String module) onStartModule;
  final VoidCallback onFinal;

  @override
  Widget build(BuildContext context) {
    final modules = [
      ('Kaporta - Boya Ekspertiz ve Check-Up', '0/59', '15 dk', Icons.car_repair),
      ('İç Ekspertiz ve Check-Up', '0/46', '8 dk', Icons.event_seat),
      ('Alt / Ön / Mekanik Ekspertiz', '0/40', '6 dk', Icons.build),
      ('Motor Ekspertiz ve Check-Up', '0/37', '4 dk', Icons.settings_input_component),
      ('OBD / Beyin Test', '0/9', '8 dk', Icons.memory),
      ('Airbag Kontrol Testi', '0/9', '0 dk', Icons.airline_seat_recline_normal),
      ('Dyno / Yol Testi', '0/5', '5 dk', Icons.speed),
      ('Conta Kaçak Testi', '0/1', '0 dk', Icons.opacity),
    ];
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        const _PlateHeader(status: 'Teknik giriş açık'),
        const SizedBox(height: 12),
        for (final module in modules)
          _ModuleActionCard(
            title: module.$1,
            sent: module.$2,
            time: module.$3,
            icon: module.$4,
            active: moduleStarted && module.$1.startsWith('Kaporta'),
            onStart: () => onStartModule(module.$1),
          ),
        _PrimaryActionButton(
          label: 'Final Kontrole Git',
          icon: Icons.verified_outlined,
          onPressed: onFinal,
          color: AppColors.success,
        ),
      ],
    );
  }
}

class _TestEntryView extends StatelessWidget {
  const _TestEntryView({
    required this.moduleTitle,
    required this.kmController,
    required this.vinController,
    required this.micronController,
    required this.noteController,
    required this.selectedStatus,
    required this.gearType,
    required this.allGoodApplied,
    required this.onStatusChanged,
    required this.onGearChanged,
    required this.onAllGood,
    required this.onContinue,
  });

  final String moduleTitle;
  final TextEditingController kmController;
  final TextEditingController vinController;
  final TextEditingController micronController;
  final TextEditingController noteController;
  final String selectedStatus;
  final String gearType;
  final bool allGoodApplied;
  final ValueChanged<String> onStatusChanged;
  final ValueChanged<String> onGearChanged;
  final VoidCallback onAllGood;
  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    final checks = [
      'Tavan Tipi',
      'Ön Kaput',
      'Sol Ön - Şasi',
      'Sağ Ön - Şasi',
      'Ön Panjur',
      'Tavanda Göçük Mevcut mu?',
      'Araçta Noktasal Ezik-Çizik Mevcut mu?',
      'Ön Tampon',
      'Arka Tampon',
      'Tavan',
    ];
    return ListView(
      padding: EdgeInsets.zero,
      children: [
        _PlateHeader(status: moduleTitle),
        Container(
          padding: const EdgeInsets.fromLTRB(16, 22, 16, 24),
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF920000), Color(0xFFE50000)],
            ),
          ),
          child: Column(
            children: [
              Text(
                moduleTitle.toUpperCase(),
                textAlign: TextAlign.center,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 21,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 10),
              const Text(
                'Test noktalarını doldurmaya başlayabilirsiniz.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white, fontSize: 18),
              ),
              const SizedBox(height: 18),
              _SecondaryActionButton(
                label: 'Testi Bırak',
                icon: Icons.pause_circle_outline,
                onPressed: () {},
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            children: [
              _Card(
                child: Column(
                  children: [
                    _LabeledField(
                      label: 'Km değerini girin',
                      controller: kmController,
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 10),
                    _LabeledField(
                      label: 'Şase numarasını girin',
                      controller: vinController,
                    ),
                    const SizedBox(height: 10),
                    _SegmentedChoice(
                      label: 'Vites Tipi Seçin',
                      value: gearType,
                      values: const ['Otomatik', 'Manuel'],
                      onChanged: onGearChanged,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              for (final check in checks)
                _CheckRow(
                  title: check,
                  status: allGoodApplied ? 'İyi' : selectedStatus,
                  onTap: () {},
                ),
              const SizedBox(height: 12),
              _Card(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _SegmentedChoice(
                      label: 'Test Sonucu',
                      value: selectedStatus,
                      values: const ['Orijinal', 'Boyalı', 'Değişen', 'İyi'],
                      onChanged: onStatusChanged,
                    ),
                    const SizedBox(height: 12),
                    _LabeledField(
                      label: 'Mikron değeri',
                      controller: micronController,
                      keyboardType: TextInputType.number,
                    ),
                    const SizedBox(height: 12),
                    _LabeledField(
                      label: 'Not',
                      controller: noteController,
                      minLines: 3,
                      maxLines: 4,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              _SecondaryActionButton(
                label: 'Mikron Seçin',
                icon: Icons.speed_outlined,
                onPressed: () {},
              ),
              const SizedBox(height: 10),
              _PrimaryActionButton(
                label: allGoodApplied
                    ? 'Tüm Noktalar İyi Durumda İşaretlendi'
                    : 'Tüm Noktalar İyi Durumda',
                icon: Icons.touch_app,
                onPressed: onAllGood,
                color: AppColors.success,
              ),
              const SizedBox(height: 10),
              _PrimaryActionButton(
                label: 'Kaydet ve Kanıtlara Geç',
                icon: Icons.arrow_forward,
                onPressed: onContinue,
                color: AppColors.info,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _EvidenceView extends StatelessWidget {
  const _EvidenceView({
    required this.frontPhotoDone,
    required this.rearPhotoDone,
    required this.vinPhotoDone,
    required this.damagePhotoDone,
    required this.onToggleFront,
    required this.onToggleRear,
    required this.onToggleVin,
    required this.onToggleDamage,
    required this.onContinue,
  });

  final bool frontPhotoDone;
  final bool rearPhotoDone;
  final bool vinPhotoDone;
  final bool damagePhotoDone;
  final VoidCallback onToggleFront;
  final VoidCallback onToggleRear;
  final VoidCallback onToggleVin;
  final VoidCallback onToggleDamage;
  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        const _PlateHeader(status: 'Zorunlu kanıtlar'),
        const SizedBox(height: 12),
        _EvidenceCard(
          title: 'Ön Panel',
          done: frontPhotoDone,
          onCapture: onToggleFront,
        ),
        _EvidenceCard(
          title: 'Arka Panel',
          done: rearPhotoDone,
          onCapture: onToggleRear,
        ),
        _EvidenceCard(
          title: 'Şase Etiketi',
          done: vinPhotoDone,
          onCapture: onToggleVin,
        ),
        _EvidenceCard(
          title: 'Hasarlı Bölge Fotoğrafı',
          done: damagePhotoDone,
          onCapture: onToggleDamage,
        ),
        const SizedBox(height: 8),
        _PrimaryActionButton(
          label: 'Çekilenleri Gönder',
          icon: Icons.cloud_upload_outlined,
          onPressed: onContinue,
          color: AppColors.success,
        ),
      ],
    );
  }
}

class _FinalView extends StatelessWidget {
  const _FinalView({
    required this.ready,
    required this.sent,
    required this.onSend,
    required this.onBackToJobs,
  });

  final bool ready;
  final bool sent;
  final VoidCallback onSend;
  final VoidCallback onBackToJobs;

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(14),
      children: [
        const _PlateHeader(status: 'Teknik onay hazırlığı'),
        const SizedBox(height: 12),
        _Card(
          child: Column(
            children: [
              Icon(
                sent ? Icons.verified : Icons.check_circle_outline,
                size: 92,
                color: ready ? AppColors.success : AppColors.warning,
              ),
              const SizedBox(height: 8),
              Text(
                sent
                    ? 'Rapor teknik onaya gönderildi'
                    : ready
                        ? 'Tüm zorunlu alanlar tamamlandı'
                        : 'Eksik alanlar var',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 23,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 16),
              const _InfoRow(label: 'Tamamlanan Modül', value: '9 / 9'),
              const _InfoRow(label: 'Eksik / Uyarı', value: '0 / 0'),
              const _InfoRow(label: 'Kanıt Fotoğrafı', value: '42'),
              const _InfoRow(label: 'Toplam Süre', value: '02:18'),
            ],
          ),
        ),
        const SizedBox(height: 12),
        const _Card(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Teknik Not',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900),
              ),
              SizedBox(height: 8),
              Text(
                'Sol ön çamurluk ve sağ arka kapıda lokal boya ölçüm farkı gözlendi. Kritik sorun tespit edilmedi.',
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        _PrimaryActionButton(
          label: 'Raporu Teknik Onaya Gönder',
          icon: Icons.send_outlined,
          onPressed: ready ? onSend : () {},
          color: ready ? AppColors.info : AppColors.grayText,
        ),
        const SizedBox(height: 10),
        _SecondaryActionButton(
          label: 'İş Emirlerine Dön',
          icon: Icons.assignment_return_outlined,
          onPressed: onBackToJobs,
        ),
      ],
    );
  }
}

class _PlateHeader extends StatelessWidget {
  const _PlateHeader({required this.status});

  final String status;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      color: const Color(0xFFF7F8FA),
      child: Row(
        children: [
          const Expanded(child: _Plate(plate: '16SVK16')),
          const SizedBox(width: 8),
          Flexible(
            child: Text(
              status,
              textAlign: TextAlign.right,
              style: const TextStyle(
                color: AppColors.darkText,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Plate extends StatelessWidget {
  const _Plate({required this.plate});

  final String plate;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 42,
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: AppColors.darkText, width: 1.4),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 36,
            height: double.infinity,
            color: const Color(0xFF11619A),
            alignment: Alignment.center,
            child: const Text(
              'TR',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          Expanded(
            child: Text(
              plate,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ModuleSummaryCard extends StatelessWidget {
  const _ModuleSummaryCard({
    required this.title,
    required this.sent,
    required this.time,
    required this.onTap,
  });

  final String title;
  final String sent;
  final String time;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return _Card(
      onTap: onTap,
      child: Column(
        children: [
          Text(
            title,
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 22),
          const Text('Teste henüz başlanmadı', style: TextStyle(fontSize: 20)),
          const Divider(height: 26, thickness: 1.2, color: Colors.black),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _StatusPill(label: '$sent Gönderildi', color: Colors.grey),
              _StatusPill(label: '$time geçti', color: AppColors.success),
            ],
          ),
        ],
      ),
    );
  }
}

class _ModuleActionCard extends StatelessWidget {
  const _ModuleActionCard({
    required this.title,
    required this.sent,
    required this.time,
    required this.icon,
    required this.active,
    required this.onStart,
  });

  final String title;
  final String sent;
  final String time;
  final IconData icon;
  final bool active;
  final VoidCallback onStart;

  @override
  Widget build(BuildContext context) {
    return _Card(
      dark: true,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: AppColors.info, size: 30),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              _StatusPill(
                label: active ? 'Devam ediyor' : 'Başlamadı',
                color: active ? AppColors.info : Colors.grey,
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              _StatusPill(label: '$sent Gönderildi', color: Colors.grey),
              const SizedBox(width: 8),
              _StatusPill(label: '$time geçti', color: AppColors.success),
            ],
          ),
          const SizedBox(height: 12),
          _PrimaryActionButton(
            label: active ? 'Devam Et' : 'Testi Başlat',
            icon: Icons.play_arrow,
            onPressed: onStart,
            color: AppColors.info,
          ),
        ],
      ),
    );
  }
}

class _CheckRow extends StatelessWidget {
  const _CheckRow({
    required this.title,
    required this.status,
    required this.onTap,
  });

  final String title;
  final String status;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        constraints: const BoxConstraints(minHeight: 76),
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: const BoxDecoration(
          color: Colors.white,
          border: Border(bottom: BorderSide(color: Colors.black, width: 1.2)),
        ),
        child: Row(
          children: [
            const Icon(Icons.search, size: 32, color: Colors.black),
            const SizedBox(width: 20),
            Expanded(
              child: Text(
                title,
                style: const TextStyle(fontSize: 21),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              status,
              style: TextStyle(
                color: status == 'Değişen'
                    ? AppColors.red
                    : status == 'Boyalı'
                        ? AppColors.warning
                        : AppColors.success,
                fontWeight: FontWeight.w900,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EvidenceCard extends StatelessWidget {
  const _EvidenceCard({
    required this.title,
    required this.done,
    required this.onCapture,
  });

  final String title;
  final bool done;
  final VoidCallback onCapture;

  @override
  Widget build(BuildContext context) {
    return _Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 26,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: Container(
                  height: 130,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  alignment: Alignment.center,
                  child: Icon(
                    done ? Icons.image : Icons.directions_car,
                    size: 72,
                    color: done ? AppColors.success : Colors.grey,
                  ),
                ),
              ),
              const SizedBox(width: 16),
              SizedBox(
                width: 112,
                child: _PrimaryActionButton(
                  key: ValueKey('evidence-capture-$title'),
                  label: done ? 'Çekildi' : 'Fotoğraf Çek',
                  icon: Icons.camera_alt,
                  onPressed: onCapture,
                  color: done ? AppColors.success : AppColors.info,
                  compact: true,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _Card extends StatelessWidget {
  const _Card({
    required this.child,
    this.onTap,
    this.dark = false,
  });

  final Widget child;
  final VoidCallback? onTap;
  final bool dark;

  @override
  Widget build(BuildContext context) {
    final card = Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: dark ? const Color(0xFF3A3A3A) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.10),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: child,
    );
    if (onTap == null) {
      return card;
    }
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: card,
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 112,
            child: Text(label, style: const TextStyle(fontSize: 16)),
          ),
          const Text(': ', style: TextStyle(fontSize: 16)),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w800),
            ),
          ),
        ],
      ),
    );
  }
}

class _MetricBox extends StatelessWidget {
  const _MetricBox({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.grayBorder),
      ),
      child: Column(
        children: [
          Text(label, style: const TextStyle(color: AppColors.grayText)),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
          ),
        ],
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  const _StatusPill({
    required this.label,
    required this.color,
  });

  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }
}

class _LabeledField extends StatelessWidget {
  const _LabeledField({
    required this.label,
    required this.controller,
    this.keyboardType,
    this.minLines,
    this.maxLines = 1,
  });

  final String label;
  final TextEditingController controller;
  final TextInputType? keyboardType;
  final int? minLines;
  final int maxLines;

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      minLines: minLines,
      maxLines: maxLines,
      decoration: InputDecoration(
        labelText: label,
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}

class _SegmentedChoice extends StatelessWidget {
  const _SegmentedChoice({
    required this.label,
    required this.value,
    required this.values,
    required this.onChanged,
  });

  final String label;
  final String value;
  final List<String> values;
  final ValueChanged<String> onChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w900)),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final item in values)
              ChoiceChip(
                label: Text(item),
                selected: value == item,
                onSelected: (_) => onChanged(item),
              ),
          ],
        ),
      ],
    );
  }
}

class _PrimaryActionButton extends StatelessWidget {
  const _PrimaryActionButton({
    super.key,
    required this.label,
    required this.icon,
    required this.onPressed,
    required this.color,
    this.compact = false,
  });

  final String label;
  final IconData icon;
  final VoidCallback onPressed;
  final Color color;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: compact ? 52 : 56,
      child: ElevatedButton.icon(
        onPressed: onPressed,
        icon: Icon(icon),
        label: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: compact ? 13 : 17,
            fontWeight: FontWeight.w900,
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(11),
          ),
        ),
      ),
    );
  }
}

class _SecondaryActionButton extends StatelessWidget {
  const _SecondaryActionButton({
    required this.label,
    required this.icon,
    required this.onPressed,
  });

  final String label;
  final IconData icon;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: OutlinedButton.icon(
        onPressed: onPressed,
        icon: Icon(icon),
        label: Text(
          label,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w900),
        ),
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.info,
          side: const BorderSide(color: AppColors.info),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(11),
          ),
        ),
      ),
    );
  }
}

class _BottomNav extends StatelessWidget {
  const _BottomNav({required this.activeIndex});

  final int activeIndex;

  @override
  Widget build(BuildContext context) {
    final items = [
      (Icons.download_for_offline_outlined, 'Raporlar'),
      (Icons.info_outline, 'Sekreter'),
      (Icons.play_circle_outline, 'Eğitim Videoları'),
    ];
    return SafeArea(
      top: false,
      child: Container(
        height: 84,
        color: Colors.white,
        child: Row(
          children: [
            for (var i = 0; i < items.length; i += 1)
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      items[i].$1,
                      color: i == activeIndex ? AppColors.red : Colors.black,
                      size: 22,
                    ),
                    const SizedBox(height: 2),
                    Text(
                      items[i].$2,
                      style: TextStyle(
                        color: i == activeIndex ? AppColors.red : Colors.grey,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
