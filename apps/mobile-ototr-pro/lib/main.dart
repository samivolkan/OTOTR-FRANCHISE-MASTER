import 'package:flutter/material.dart';

void main() {
  runApp(const OtotrMobileProApp());
}

class OtotrMobileProApp extends StatelessWidget {
  const OtotrMobileProApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'OTOTR Pro',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: OtotrColors.surface,
        colorScheme: ColorScheme.fromSeed(
          seedColor: OtotrColors.primary,
          primary: OtotrColors.primary,
          secondary: OtotrColors.warning,
          surface: OtotrColors.surface,
        ),
        fontFamily: 'Roboto',
        appBarTheme: const AppBarTheme(
          backgroundColor: OtotrColors.navy,
          foregroundColor: Colors.white,
          elevation: 0,
          centerTitle: false,
        ),
      ),
      home: const LoginScreen(),
    );
  }
}

class OtotrColors {
  static const navy = Color(0xFF071B3D);
  static const primary = Color(0xFF0057FF);
  static const danger = Color(0xFFE51E2A);
  static const success = Color(0xFF0F9D58);
  static const warning = Color(0xFFF97316);
  static const text = Color(0xFF101828);
  static const muted = Color(0xFF667085);
  static const surface = Color(0xFFF5F7FB);
  static const line = Color(0xFFE4E7EC);
}

enum WorkOrderStatus { active, issue, appointment, completed }

enum InspectionStatus { unchecked, good, painted, changed, issue }

class WorkOrder {
  WorkOrder({
    required this.id,
    required this.plate,
    required this.vehicle,
    required this.year,
    required this.km,
    required this.packageName,
    required this.fuel,
    required this.gear,
    required this.vin,
    required this.status,
    required this.progress,
    required this.modules,
  });

  final String id;
  final String plate;
  final String vehicle;
  final int year;
  final String km;
  final String packageName;
  final String fuel;
  final String gear;
  final String vin;
  final WorkOrderStatus status;
  double progress;
  final List<InspectionModule> modules;

  int get issueCount => modules.fold(0, (sum, item) => sum + item.issueCount);
  int get evidenceMissing =>
      modules.fold(0, (sum, item) => sum + item.evidenceMissing);
}

class InspectionModule {
  InspectionModule({
    required this.name,
    required this.owner,
    required this.icon,
    required this.items,
    required this.evidence,
  });

  final String name;
  final String owner;
  final IconData icon;
  final List<InspectionItem> items;
  final List<EvidenceItem> evidence;

  int get completed => items.where((item) => item.status != InspectionStatus.unchecked).length;
  int get total => items.length;
  int get issueCount => items
      .where((item) => item.status == InspectionStatus.changed || item.status == InspectionStatus.issue)
      .length;
  int get evidenceMissing => evidence.where((item) => !item.captured).length;
}

class InspectionItem {
  InspectionItem({
    required this.name,
    required this.location,
    this.status = InspectionStatus.unchecked,
    this.micron,
    this.note = '',
  });

  final String name;
  final String location;
  InspectionStatus status;
  int? micron;
  String note;
}

class EvidenceItem {
  EvidenceItem({
    required this.name,
    required this.required,
    required this.pose,
    this.captured = false,
  });

  final String name;
  final bool required;
  final String pose;
  bool captured;
}

final List<WorkOrder> demoOrders = [
  WorkOrder(
    id: 'WO-2605-041',
    plate: '34 OTR 026',
    vehicle: 'BMW 320i M Sport',
    year: 2021,
    km: '48.200',
    packageName: 'Premium Ekspertiz',
    fuel: 'Benzin',
    gear: 'Otomatik',
    vin: 'DEMO-VIN-2026-041',
    status: WorkOrderStatus.active,
    progress: .42,
    modules: [
      InspectionModule(
        name: 'Kaporta - Boya',
        owner: 'Ahmet Usta',
        icon: Icons.format_paint,
        items: [
          InspectionItem(name: 'Sol on camurluk', location: 'Dis govde', micron: 112),
          InspectionItem(name: 'Sag on kapi', location: 'Dis govde'),
          InspectionItem(name: 'Tavan', location: 'Ust govde'),
          InspectionItem(name: 'Bagaj kapagi', location: 'Arka govde'),
        ],
        evidence: [
          EvidenceItem(name: 'Genel arac fotografi', required: true, pose: 'On capraz'),
          EvidenceItem(name: 'Sol yan detay', required: true, pose: 'Panel hizasi'),
          EvidenceItem(name: 'Mikron panel kaniti', required: false, pose: 'Olcum cihazi'),
        ],
      ),
      InspectionModule(
        name: 'Motor',
        owner: 'Mehmet Usta',
        icon: Icons.settings,
        items: [
          InspectionItem(name: 'Yag kacak kontrolu', location: 'Motor ustu'),
          InspectionItem(name: 'Sogutma sistemi', location: 'Motor bolmesi'),
          InspectionItem(name: 'Kayis ve rulman sesi', location: 'Calisma testi'),
        ],
        evidence: [
          EvidenceItem(name: 'Motor bolmesi', required: true, pose: 'Kaput acik'),
          EvidenceItem(name: 'Yag seviye cubugu', required: false, pose: 'Yakin plan'),
        ],
      ),
      InspectionModule(
        name: 'OBD / Beyin',
        owner: 'Selin Usta',
        icon: Icons.memory,
        items: [
          InspectionItem(name: 'Ariza kod taramasi', location: 'OBD'),
          InspectionItem(name: 'Kilometre tutarliligi', location: 'ECU'),
          InspectionItem(name: 'Airbag beyin kontrolu', location: 'ECU'),
        ],
        evidence: [
          EvidenceItem(name: 'OBD ekran sonucu', required: true, pose: 'Cihaz ekrani'),
        ],
      ),
    ],
  ),
  WorkOrder(
    id: 'WO-2605-052',
    plate: '06 OTR 155',
    vehicle: 'Toyota Corolla Hybrid',
    year: 2022,
    km: '31.800',
    packageName: 'Full Paket',
    fuel: 'Hibrit',
    gear: 'Otomatik',
    vin: 'DEMO-VIN-2026-052',
    status: WorkOrderStatus.issue,
    progress: .68,
    modules: [
      InspectionModule(
        name: 'Alt / On / Mekanik',
        owner: 'Burak Usta',
        icon: Icons.car_repair,
        items: [
          InspectionItem(name: 'On takim bosluk', location: 'Lift kontrol'),
          InspectionItem(name: 'Fren diskleri', location: 'Teker bolgesi'),
          InspectionItem(name: 'Amortisor kacak', location: 'Alt takim'),
        ],
        evidence: [
          EvidenceItem(name: 'Lift alti genel', required: true, pose: 'Genis aci'),
          EvidenceItem(name: 'Fren disk detayi', required: true, pose: 'Yakin plan'),
        ],
      ),
    ],
  ),
  WorkOrder(
    id: 'WO-2605-063',
    plate: '35 OTR 884',
    vehicle: 'Volkswagen Passat',
    year: 2020,
    km: '72.450',
    packageName: 'Standart Ekspertiz',
    fuel: 'Dizel',
    gear: 'DSG',
    vin: 'DEMO-VIN-2026-063',
    status: WorkOrderStatus.appointment,
    progress: .08,
    modules: [
      InspectionModule(
        name: 'Ic Ekspertiz',
        owner: 'Atanmadi',
        icon: Icons.event_seat,
        items: [
          InspectionItem(name: 'Koltuk ve doseme', location: 'Ic mekan'),
          InspectionItem(name: 'Klima kontrolu', location: 'Konsol'),
          InspectionItem(name: 'Multimedya', location: 'Konsol'),
        ],
        evidence: [
          EvidenceItem(name: 'Ic mekan genel', required: true, pose: 'Arka koltuktan'),
        ],
      ),
    ],
  ),
];

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController(text: 'ahmet.usta@ototr.test');
  final _password = TextEditingController(text: 'demo-sifre');
  String _branch = 'Istanbul Maslak';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: OtotrColors.navy,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 520),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'OTOTR Pro',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 36,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Plaka merkezli ekspertiz operasyonu',
                    style: TextStyle(color: Color(0xFFB9C7E6), fontSize: 16),
                  ),
                  const SizedBox(height: 32),
                  Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: const [
                        BoxShadow(
                          color: Color(0x33000000),
                          blurRadius: 24,
                          offset: Offset(0, 16),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text(
                          'Usta girisi',
                          style: TextStyle(
                            color: OtotrColors.text,
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 16),
                        TextField(
                          key: const Key('login-email'),
                          controller: _email,
                          decoration: const InputDecoration(
                            labelText: 'Telefon veya e-posta',
                            prefixIcon: Icon(Icons.person_outline),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 12),
                        TextField(
                          key: const Key('login-password'),
                          controller: _password,
                          obscureText: true,
                          decoration: const InputDecoration(
                            labelText: 'Sifre',
                            prefixIcon: Icon(Icons.lock_outline),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 12),
                        DropdownButtonFormField<String>(
                          key: const Key('branch-select'),
                          value: _branch,
                          items: const [
                            DropdownMenuItem(
                              value: 'Istanbul Maslak',
                              child: Text('Istanbul Maslak'),
                            ),
                            DropdownMenuItem(
                              value: 'Ankara Cukurambar',
                              child: Text('Ankara Cukurambar'),
                            ),
                            DropdownMenuItem(
                              value: 'Izmir Bornova',
                              child: Text('Izmir Bornova'),
                            ),
                          ],
                          onChanged: (value) => setState(() => _branch = value ?? _branch),
                          decoration: const InputDecoration(
                            labelText: 'Sube',
                            prefixIcon: Icon(Icons.storefront),
                            border: OutlineInputBorder(),
                          ),
                        ),
                        const SizedBox(height: 18),
                        FilledButton.icon(
                          key: const Key('login-submit'),
                          onPressed: () => Navigator.of(context).pushReplacement(
                            MaterialPageRoute(builder: (_) => const HomeShell()),
                          ),
                          icon: const Icon(Icons.login),
                          label: const Text('Giris yap'),
                          style: FilledButton.styleFrom(
                            backgroundColor: OtotrColors.primary,
                            padding: const EdgeInsets.symmetric(vertical: 16),
                            textStyle: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                        const SizedBox(height: 8),
                        TextButton.icon(
                          onPressed: () {},
                          icon: const Icon(Icons.support_agent),
                          label: const Text('Teknik destek'),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class HomeShell extends StatefulWidget {
  const HomeShell({super.key});

  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final screens = [
      DashboardScreen(onOpenOrders: () => setState(() => _index = 1)),
      const WorkOrdersScreen(),
      const IssuesScreen(),
      const ProfileScreen(),
    ];
    return Scaffold(
      body: screens[_index],
      bottomNavigationBar: NavigationBar(
        key: const Key('bottom-nav'),
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(icon: Icon(Icons.dashboard_outlined), label: 'Ozet'),
          NavigationDestination(icon: Icon(Icons.assignment_outlined), label: 'Isler'),
          NavigationDestination(icon: Icon(Icons.warning_amber), label: 'Eksikler'),
          NavigationDestination(icon: Icon(Icons.person_outline), label: 'Profil'),
        ],
      ),
    );
  }
}

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key, required this.onOpenOrders});

  final VoidCallback onOpenOrders;

  @override
  Widget build(BuildContext context) {
    final order = demoOrders.first;
    return AppScaffold(
      title: 'Gunluk ozet',
      subtitle: 'Ahmet Usta - Istanbul Maslak',
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Wrap(
            spacing: 10,
            runSpacing: 10,
            children: [
              MetricCard(label: 'Aktif is', value: '3', icon: Icons.directions_car),
              MetricCard(label: 'Tamamlanan', value: '7', icon: Icons.check_circle),
              MetricCard(label: 'Eksik / uyari', value: '4', icon: Icons.warning_amber),
              MetricCard(label: 'Onayda', value: '2', icon: Icons.verified),
            ],
          ),
          const SizedBox(height: 18),
          const SectionHeader(title: 'One cikan is emri'),
          WorkOrderCard(
            order: order,
            primaryLabel: 'Devam et',
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => WorkOrderDetailScreen(order: order)),
            ),
          ),
          const SizedBox(height: 18),
          const SectionHeader(title: 'Hizli islemler'),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 1.7,
            children: [
              QuickAction(label: 'Islerim', icon: Icons.assignment, onTap: onOpenOrders),
              QuickAction(label: 'Kanitlar', icon: Icons.photo_camera, onTap: () {}),
              QuickAction(label: 'Raporlar', icon: Icons.description, onTap: () {}),
              QuickAction(label: 'Eksikler', icon: Icons.report_problem, onTap: () {}),
            ],
          ),
        ],
      ),
    );
  }
}

class WorkOrdersScreen extends StatefulWidget {
  const WorkOrdersScreen({super.key});

  @override
  State<WorkOrdersScreen> createState() => _WorkOrdersScreenState();
}

class _WorkOrdersScreenState extends State<WorkOrdersScreen> {
  int _filter = 0;

  @override
  Widget build(BuildContext context) {
    final filters = ['Tum', 'Devam', 'Randevu', 'Eksik', 'Tamam'];
    return AppScaffold(
      title: 'Is emirleri',
      subtitle: '${demoOrders.length} bekleyen arac',
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          TextField(
            key: const Key('workorder-search'),
            decoration: InputDecoration(
              hintText: 'Plaka, is emri veya model ara',
              prefixIcon: const Icon(Icons.search),
              filled: true,
              fillColor: Colors.white,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
            ),
          ),
          const SizedBox(height: 12),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: List.generate(filters.length, (index) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    key: Key('filter-$index'),
                    selected: _filter == index,
                    label: Text(filters[index]),
                    onSelected: (_) => setState(() => _filter = index),
                  ),
                );
              }),
            ),
          ),
          const SizedBox(height: 14),
          ...demoOrders.map(
            (order) => Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: WorkOrderCard(
                order: order,
                primaryLabel: 'Ac',
                onTap: () => Navigator.of(context).push(
                  MaterialPageRoute(builder: (_) => WorkOrderDetailScreen(order: order)),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class WorkOrderDetailScreen extends StatelessWidget {
  const WorkOrderDetailScreen({super.key, required this.order});

  final WorkOrder order;

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Is emri detayi',
      subtitle: order.id,
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          PlateHeader(order: order),
          const SizedBox(height: 12),
          InfoGrid(order: order),
          const SizedBox(height: 16),
          ProgressPanel(order: order),
          const SizedBox(height: 16),
          const SectionHeader(title: 'Gorev modulleri'),
          ...order.modules.map(
            (module) => ModuleCard(
              module: module,
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => ModuleScreen(order: order, module: module),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          FilledButton.icon(
            key: const Key('detail-continue'),
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(
                builder: (_) => ModuleScreen(order: order, module: order.modules.first),
              ),
            ),
            icon: const Icon(Icons.play_arrow),
            label: const Text('Devam et'),
            style: FilledButton.styleFrom(
              backgroundColor: OtotrColors.primary,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),
        ],
      ),
    );
  }
}

class ModuleScreen extends StatefulWidget {
  const ModuleScreen({super.key, required this.order, required this.module});

  final WorkOrder order;
  final InspectionModule module;

  @override
  State<ModuleScreen> createState() => _ModuleScreenState();
}

class _ModuleScreenState extends State<ModuleScreen> {
  Future<void> _markAllGood() async {
    final confirmed = await showModalBottomSheet<bool>(
      context: context,
      builder: (context) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Bos maddeler iyi isaretlensin mi?',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            const Text('Daha once sorunlu isaretlenen maddeler degistirilmeyecek.'),
            const SizedBox(height: 16),
            FilledButton(
              key: const Key('confirm-all-good'),
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Onayla'),
            ),
          ],
        ),
      ),
    );
    if (confirmed == true) {
      setState(() {
        for (final item in widget.module.items) {
          if (item.status == InspectionStatus.unchecked) {
            item.status = InspectionStatus.good;
            item.note = 'Toplu iyi durum kontrolu';
          }
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: widget.module.name,
      subtitle: widget.order.plate,
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          PlateHeader(order: widget.order, compact: true),
          const SizedBox(height: 12),
          StepperPanel(completed: widget.module.completed, total: widget.module.total),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: FilledButton.icon(
                  key: const Key('all-good'),
                  onPressed: _markAllGood,
                  icon: const Icon(Icons.done_all),
                  label: const Text('Tum noktalar iyi'),
                ),
              ),
              const SizedBox(width: 8),
              IconButton.filledTonal(
                key: const Key('module-evidence'),
                onPressed: () => Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => EvidenceScreen(order: widget.order, module: widget.module),
                  ),
                ),
                icon: const Icon(Icons.photo_camera),
                tooltip: 'Kanitlar',
              ),
            ],
          ),
          const SizedBox(height: 14),
          ...widget.module.items.map(
            (item) => InspectionRow(
              item: item,
              onTap: () async {
                await Navigator.of(context).push(
                  MaterialPageRoute(
                    builder: (_) => ItemDetailScreen(item: item, module: widget.module),
                  ),
                );
                setState(() {});
              },
            ),
          ),
          const SizedBox(height: 16),
          FilledButton.icon(
            key: const Key('module-final'),
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute(builder: (_) => FinalControlScreen(order: widget.order)),
            ),
            icon: const Icon(Icons.fact_check),
            label: const Text('Final kontrole git'),
            style: FilledButton.styleFrom(backgroundColor: OtotrColors.navy),
          ),
        ],
      ),
    );
  }
}

class ItemDetailScreen extends StatefulWidget {
  const ItemDetailScreen({super.key, required this.item, required this.module});

  final InspectionItem item;
  final InspectionModule module;

  @override
  State<ItemDetailScreen> createState() => _ItemDetailScreenState();
}

class _ItemDetailScreenState extends State<ItemDetailScreen> {
  late InspectionStatus _status = widget.item.status;
  late final TextEditingController _micron =
      TextEditingController(text: widget.item.micron?.toString() ?? '');
  late final TextEditingController _note = TextEditingController(text: widget.item.note);

  void _save({bool next = false}) {
    widget.item.status = _status;
    widget.item.micron = int.tryParse(_micron.text);
    widget.item.note = _note.text;
    if (next) {
      final current = widget.module.items.indexOf(widget.item);
      final nextItem = current + 1 < widget.module.items.length
          ? widget.module.items[current + 1]
          : null;
      if (nextItem != null) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => ItemDetailScreen(item: nextItem, module: widget.module)),
        );
        return;
      }
    }
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: widget.item.name,
      subtitle: widget.item.location,
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const SectionHeader(title: 'Durum secimi'),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: InspectionStatus.values.map((status) {
              return ChoiceChip(
                key: Key('status-${status.name}'),
                selected: _status == status,
                label: Text(statusLabel(status)),
                onSelected: (_) => setState(() => _status = status),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          TextField(
            key: const Key('micron-input'),
            controller: _micron,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Mikron degeri',
              suffixText: 'um',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            key: const Key('note-input'),
            controller: _note,
            maxLines: 4,
            decoration: const InputDecoration(
              labelText: 'Teknik not',
              border: OutlineInputBorder(),
            ),
          ),
          const SizedBox(height: 12),
          EvidencePlaceholder(onTap: () {}),
          const SizedBox(height: 16),
          FilledButton.icon(
            key: const Key('save-next'),
            onPressed: () => _save(next: true),
            icon: const Icon(Icons.arrow_forward),
            label: const Text('Kaydet ve sonraki'),
          ),
          TextButton(
            key: const Key('save-item'),
            onPressed: _save,
            child: const Text('Kaydet'),
          ),
        ],
      ),
    );
  }
}

class EvidenceScreen extends StatefulWidget {
  const EvidenceScreen({super.key, required this.order, required this.module});

  final WorkOrder order;
  final InspectionModule module;

  @override
  State<EvidenceScreen> createState() => _EvidenceScreenState();
}

class _EvidenceScreenState extends State<EvidenceScreen> {
  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Fotograf ve kanit',
      subtitle: widget.module.name,
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          PlateHeader(order: widget.order, compact: true),
          const SizedBox(height: 14),
          ...widget.module.evidence.map(
            (evidence) => EvidenceCard(
              evidence: evidence,
              onTap: () => setState(() => evidence.captured = true),
            ),
          ),
          const SizedBox(height: 12),
          FilledButton.icon(
            key: const Key('save-evidence'),
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.cloud_done),
            label: const Text('Kanitlari kaydet'),
          ),
        ],
      ),
    );
  }
}

class IssuesScreen extends StatelessWidget {
  const IssuesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final issues = [
      'Sag on kapi fotografi eksik',
      'OBD ekran sonucu bekliyor',
      'Fren disk detayi zorunlu kanit',
    ];
    return AppScaffold(
      title: 'Eksik ve uyari',
      subtitle: 'Teknik onay oncesi kontrol',
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const SegmentedButton<int>(
            segments: [
              ButtonSegment(value: 0, label: Text('Eksikler')),
              ButtonSegment(value: 1, label: Text('Uyarilar')),
              ButtonSegment(value: 2, label: Text('Kritik')),
            ],
            selected: {0},
          ),
          const SizedBox(height: 14),
          ...issues.map(
            (issue) => Card(
              child: ListTile(
                leading: const Icon(Icons.report_problem, color: OtotrColors.warning),
                title: Text(issue),
                subtitle: const Text('WO-2605-041 - Kaporta / Kanit'),
                trailing: const Icon(Icons.chevron_right),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class FinalControlScreen extends StatelessWidget {
  const FinalControlScreen({super.key, required this.order});

  final WorkOrder order;

  @override
  Widget build(BuildContext context) {
    final totalItems = order.modules.fold<int>(0, (sum, module) => sum + module.total);
    final completed = order.modules.fold<int>(0, (sum, module) => sum + module.completed);
    final missingEvidence = order.evidenceMissing;
    final ready = completed == totalItems && missingEvidence == 0;

    return AppScaffold(
      title: 'Final kontrol',
      subtitle: order.plate,
      showBack: true,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: panelDecoration(),
            child: Column(
              children: [
                Text(
                  '${((completed / totalItems) * 100).round()}%',
                  style: const TextStyle(
                    fontSize: 48,
                    fontWeight: FontWeight.w900,
                    color: OtotrColors.navy,
                  ),
                ),
                const Text('Modul tamamlama'),
                const SizedBox(height: 14),
                LinearProgressIndicator(value: completed / totalItems),
              ],
            ),
          ),
          const SizedBox(height: 14),
          ChecklistTile(
            label: 'Tum kontrol maddeleri dolduruldu',
            done: completed == totalItems,
          ),
          ChecklistTile(label: 'Zorunlu kanitlar tamamlandi', done: missingEvidence == 0),
          ChecklistTile(label: 'Teknik not eklendi', done: true),
          ChecklistTile(label: 'Musteri ozeti hazir', done: ready),
          const SizedBox(height: 14),
          FilledButton.icon(
            key: const Key('send-approval'),
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    ready
                        ? 'Rapor teknik onaya gonderildi'
                        : 'Eksikler listelendi, onay once tamamlanmali',
                  ),
                ),
              );
            },
            icon: Icon(ready ? Icons.verified : Icons.warning_amber),
            label: Text(ready ? 'Raporu teknik onaya gonder' : 'Eksikleri tamamla'),
            style: FilledButton.styleFrom(
              backgroundColor: ready ? OtotrColors.success : OtotrColors.danger,
              padding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),
        ],
      ),
    );
  }
}

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const AppScaffold(
      title: 'Profil',
      subtitle: 'Ahmet Usta',
      child: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ProfileCard(),
            SizedBox(height: 12),
            Card(
              child: ListTile(
                leading: Icon(Icons.notifications_outlined),
                title: Text('Bildirimler'),
                subtitle: Text('Teknik onay ve eksik hatirlaticilari'),
              ),
            ),
            Card(
              child: ListTile(
                leading: Icon(Icons.security),
                title: Text('Guvenli demo mod'),
                subtitle: Text('Canli servis veya gizli anahtar kullanilmiyor'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class AppScaffold extends StatelessWidget {
  const AppScaffold({
    super.key,
    required this.title,
    required this.subtitle,
    required this.child,
    this.showBack = false,
  });

  final String title;
  final String subtitle;
  final Widget child;
  final bool showBack;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: showBack ? const BackButton() : null,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w800)),
            Text(subtitle, style: const TextStyle(fontSize: 12, color: Color(0xFFB9C7E6))),
          ],
        ),
      ),
      body: child,
    );
  }
}

class MetricCard extends StatelessWidget {
  const MetricCard({super.key, required this.label, required this.value, required this.icon});

  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: (MediaQuery.of(context).size.width - 42) / 2,
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: panelDecoration(),
        child: Row(
          children: [
            Icon(icon, color: OtotrColors.primary),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900)),
                Text(label, style: const TextStyle(color: OtotrColors.muted)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class WorkOrderCard extends StatelessWidget {
  const WorkOrderCard({
    super.key,
    required this.order,
    required this.onTap,
    required this.primaryLabel,
  });

  final WorkOrder order;
  final VoidCallback onTap;
  final String primaryLabel;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      key: Key('workorder-${order.id}'),
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: panelDecoration(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    order.plate,
                    style: const TextStyle(fontSize: 25, fontWeight: FontWeight.w900),
                  ),
                ),
                StatusBadge(status: order.status),
              ],
            ),
            const SizedBox(height: 4),
            Text('${order.vehicle} - ${order.year}', style: const TextStyle(color: OtotrColors.muted)),
            const SizedBox(height: 12),
            LinearProgressIndicator(value: order.progress, minHeight: 8),
            const SizedBox(height: 10),
            Row(
              children: [
                BadgeText(icon: Icons.speed, text: '${(order.progress * 100).round()}%'),
                BadgeText(icon: Icons.warning_amber, text: '${order.issueCount} uyari'),
                BadgeText(icon: Icons.photo_camera, text: '${order.evidenceMissing} kanit'),
                const Spacer(),
                Text(primaryLabel, style: const TextStyle(color: OtotrColors.primary, fontWeight: FontWeight.w800)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class StatusBadge extends StatelessWidget {
  const StatusBadge({super.key, required this.status});

  final WorkOrderStatus status;

  @override
  Widget build(BuildContext context) {
    final label = switch (status) {
      WorkOrderStatus.active => 'Devam',
      WorkOrderStatus.issue => 'Eksik',
      WorkOrderStatus.appointment => 'Randevu',
      WorkOrderStatus.completed => 'Tamam',
    };
    final color = switch (status) {
      WorkOrderStatus.active => OtotrColors.primary,
      WorkOrderStatus.issue => OtotrColors.warning,
      WorkOrderStatus.appointment => OtotrColors.navy,
      WorkOrderStatus.completed => OtotrColors.success,
    };
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: .12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(label, style: TextStyle(color: color, fontWeight: FontWeight.w800)),
    );
  }
}

class PlateHeader extends StatelessWidget {
  const PlateHeader({super.key, required this.order, this.compact = false});

  final WorkOrder order;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(compact ? 14 : 18),
      decoration: BoxDecoration(
        color: OtotrColors.navy,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            width: compact ? 52 : 72,
            height: compact ? 52 : 72,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: .12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(Icons.directions_car, color: Colors.white, size: 34),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  order.plate,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: compact ? 22 : 30,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                Text(order.vehicle, style: const TextStyle(color: Color(0xFFB9C7E6))),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class InfoGrid extends StatelessWidget {
  const InfoGrid({super.key, required this.order});

  final WorkOrder order;

  @override
  Widget build(BuildContext context) {
    final cells = [
      ('Paket', order.packageName),
      ('Km', order.km),
      ('Yakit', order.fuel),
      ('Vites', order.gear),
      ('Sasi', order.vin),
      ('Is emri', order.id),
    ];
    return Wrap(
      spacing: 10,
      runSpacing: 10,
      children: cells
          .map(
            (cell) => SizedBox(
              width: (MediaQuery.of(context).size.width - 42) / 2,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: panelDecoration(),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(cell.$1, style: const TextStyle(color: OtotrColors.muted, fontSize: 12)),
                    const SizedBox(height: 4),
                    Text(cell.$2, style: const TextStyle(fontWeight: FontWeight.w800)),
                  ],
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class ProgressPanel extends StatelessWidget {
  const ProgressPanel({super.key, required this.order});

  final WorkOrder order;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: panelDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Operasyon ilerleme', style: TextStyle(fontWeight: FontWeight.w800)),
          const SizedBox(height: 12),
          LinearProgressIndicator(value: order.progress, minHeight: 10),
          const SizedBox(height: 8),
          Text('${order.modules.length} modul - ${order.evidenceMissing} kanit bekliyor'),
        ],
      ),
    );
  }
}

class ModuleCard extends StatelessWidget {
  const ModuleCard({super.key, required this.module, required this.onTap});

  final InspectionModule module;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        key: Key('module-${module.name}'),
        onTap: onTap,
        leading: CircleAvatar(
          backgroundColor: OtotrColors.primary.withValues(alpha: .12),
          child: Icon(module.icon, color: OtotrColors.primary),
        ),
        title: Text(module.name, style: const TextStyle(fontWeight: FontWeight.w800)),
        subtitle: Text('${module.completed}/${module.total} madde - ${module.owner}'),
        trailing: const Icon(Icons.chevron_right),
      ),
    );
  }
}

class InspectionRow extends StatelessWidget {
  const InspectionRow({super.key, required this.item, required this.onTap});

  final InspectionItem item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final color = statusColor(item.status);
    return Card(
      child: ListTile(
        key: Key('item-${item.name}'),
        onTap: onTap,
        leading: CircleAvatar(
          backgroundColor: color.withValues(alpha: .12),
          child: Icon(statusIcon(item.status), color: color),
        ),
        title: Text(item.name, style: const TextStyle(fontWeight: FontWeight.w700)),
        subtitle: Text('${item.location} - ${statusLabel(item.status)}'),
        trailing: const Icon(Icons.chevron_right),
      ),
    );
  }
}

class EvidenceCard extends StatelessWidget {
  const EvidenceCard({super.key, required this.evidence, required this.onTap});

  final EvidenceItem evidence;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        key: Key('evidence-${evidence.name}'),
        onTap: onTap,
        leading: CircleAvatar(
          backgroundColor: evidence.captured
              ? OtotrColors.success.withValues(alpha: .12)
              : OtotrColors.danger.withValues(alpha: .12),
          child: Icon(
            evidence.captured ? Icons.check : Icons.photo_camera,
            color: evidence.captured ? OtotrColors.success : OtotrColors.danger,
          ),
        ),
        title: Text(evidence.name, style: const TextStyle(fontWeight: FontWeight.w800)),
        subtitle: Text('${evidence.required ? "Zorunlu" : "Opsiyonel"} - ${evidence.pose}'),
        trailing: Text(
          evidence.captured ? 'Yuklendi' : 'Cek',
          style: TextStyle(
            color: evidence.captured ? OtotrColors.success : OtotrColors.primary,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    );
  }
}

class StepperPanel extends StatelessWidget {
  const StepperPanel({super.key, required this.completed, required this.total});

  final int completed;
  final int total;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: panelDecoration(),
      child: Row(
        children: [
          const Icon(Icons.route, color: OtotrColors.primary),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Giris > Kontrol > Kanit > Sonuc',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w800),
            ),
          ),
          Text('$completed/$total'),
        ],
      ),
    );
  }
}

class QuickAction extends StatelessWidget {
  const QuickAction({super.key, required this.label, required this.icon, required this.onTap});

  final String label;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: panelDecoration(),
        child: Row(
          children: [
            Icon(icon, color: OtotrColors.primary),
            const SizedBox(width: 10),
            Text(label, style: const TextStyle(fontWeight: FontWeight.w800)),
          ],
        ),
      ),
    );
  }
}

class ChecklistTile extends StatelessWidget {
  const ChecklistTile({super.key, required this.label, required this.done});

  final String label;
  final bool done;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(
          done ? Icons.check_circle : Icons.radio_button_unchecked,
          color: done ? OtotrColors.success : OtotrColors.warning,
        ),
        title: Text(label),
      ),
    );
  }
}

class EvidencePlaceholder extends StatelessWidget {
  const EvidencePlaceholder({super.key, required this.onTap});

  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        height: 130,
        decoration: BoxDecoration(
          color: OtotrColors.navy,
          borderRadius: BorderRadius.circular(14),
        ),
        child: const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.add_a_photo, color: Colors.white, size: 34),
              SizedBox(height: 8),
              Text('Fotograf kaniti ekle', style: TextStyle(color: Colors.white)),
            ],
          ),
        ),
      ),
    );
  }
}

class ProfileCard extends StatelessWidget {
  const ProfileCard({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: panelDecoration(),
      child: const Row(
        children: [
          CircleAvatar(
            radius: 28,
            backgroundColor: OtotrColors.navy,
            child: Icon(Icons.person, color: Colors.white),
          ),
          SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Ahmet Usta', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
                Text('Kaporta - Boya uzman teknisyen'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class SectionHeader extends StatelessWidget {
  const SectionHeader({super.key, required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Text(
        title,
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: OtotrColors.text),
      ),
    );
  }
}

class BadgeText extends StatelessWidget {
  const BadgeText({super.key, required this.icon, required this.text});

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 10),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: OtotrColors.muted),
          const SizedBox(width: 3),
          Text(text, style: const TextStyle(color: OtotrColors.muted, fontSize: 12)),
        ],
      ),
    );
  }
}

BoxDecoration panelDecoration() {
  return BoxDecoration(
    color: Colors.white,
    borderRadius: BorderRadius.circular(14),
    border: Border.all(color: OtotrColors.line),
    boxShadow: const [
      BoxShadow(color: Color(0x0F101828), blurRadius: 14, offset: Offset(0, 6)),
    ],
  );
}

String statusLabel(InspectionStatus status) {
  return switch (status) {
    InspectionStatus.unchecked => 'Kontrol edilmedi',
    InspectionStatus.good => 'Orijinal / iyi',
    InspectionStatus.painted => 'Boyali',
    InspectionStatus.changed => 'Degisen',
    InspectionStatus.issue => 'Hasarli',
  };
}

Color statusColor(InspectionStatus status) {
  return switch (status) {
    InspectionStatus.unchecked => OtotrColors.muted,
    InspectionStatus.good => OtotrColors.success,
    InspectionStatus.painted => OtotrColors.warning,
    InspectionStatus.changed => OtotrColors.danger,
    InspectionStatus.issue => OtotrColors.danger,
  };
}

IconData statusIcon(InspectionStatus status) {
  return switch (status) {
    InspectionStatus.unchecked => Icons.radio_button_unchecked,
    InspectionStatus.good => Icons.check_circle,
    InspectionStatus.painted => Icons.format_paint,
    InspectionStatus.changed => Icons.build_circle,
    InspectionStatus.issue => Icons.report_problem,
  };
}
