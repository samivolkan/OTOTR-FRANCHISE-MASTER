import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:ototr_branch_app/core/navigation/app_routes.dart';
import 'package:ototr_branch_app/data/repositories/app_repositories.dart';
import 'package:ototr_branch_app/data/repositories/dummy_work_order_repository.dart';
import 'package:ototr_branch_app/data/repositories/final_report_repository.dart';
import 'package:ototr_branch_app/data/repositories/report_template_repository.dart';
import 'package:ototr_branch_app/data/repositories/work_order_report_repository.dart';
import 'package:ototr_branch_app/features/reports/final_report_preview_screen.dart';
import 'package:ototr_branch_app/features/technician/report_entry/report_entry_screen.dart';

void main() {
  setUp(() {
    AppRepositories.instance.remoteWorkOrders = null;
    AppRepositories.instance.localWorkOrders =
        DummyWorkOrderRepository.instance;
    AppRepositories.instance.reportTemplates = AssetReportTemplateRepository();
    AppRepositories.instance.workOrderReports =
        LocalWorkOrderReportRepository.instance;
    AppRepositories.instance.finalReports = LocalFinalReportRepository.instance;
    DummyWorkOrderRepository.instance.reset();
    LocalWorkOrderReportRepository.instance.reset();
  });

  testWidgets('Rapor girisi gruplari ve toplam yuzdeyi gosterir',
      (tester) async {
    tester.view.physicalSize = const Size(1080, 2400);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(_app());
    await _waitForAsyncWork(tester);
    await _pumpUntil(tester, find.textContaining('Toplam'));

    expect(find.text('Rapor Girişi'), findsOneWidget);
    expect(find.textContaining('Toplam'), findsWidgets);
    expect(find.textContaining('Sekreterya'), findsNothing);
    expect(find.textContaining('İş Emri / Araç Kabul'), findsNothing);
    expect(find.textContaining('Araç Dosya Ekspertizi'), findsNothing);
    expect(find.textContaining('Motor Ekspertiz'), findsOneWidget);
    expect(find.textContaining('0/37 tamamlandı'), findsOneWidget);

    await tester.tap(find.textContaining('Motor Ekspertiz').first);
    await tester.pumpAndSettle();
    await _pumpUntil(tester, find.text('Motor Hizli Olcum Girisi'));

    final quickFields = find.byType(TextField);
    await tester.enterText(quickFields.at(0), '-30');
    await tester.enterText(quickFields.at(1), '82');

    final allGoodButton = find.widgetWithText(
      FilledButton,
      'Tüm Noktalar İyi Durumda',
    );
    await tester.scrollUntilVisible(
      allGoodButton,
      600,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.drag(find.byType(Scrollable).first, const Offset(0, -160));
    await tester.pumpAndSettle();
    await tester.tap(allGoodButton);
    await tester.pumpAndSettle();

    final answers = await LocalWorkOrderReportRepository.instance.getAnswers(
      'wo-2026-0001',
    );
    expect(answers.where((answer) => answer.isCompleted), hasLength(37));
    expect(find.text('Ölçüm Değerleri Gerekli'), findsNothing);

    await tester.scrollUntilVisible(
      find.text('Başlığı Gönder'),
      600,
      scrollable: find.byType(Scrollable).first,
    );
    expect(find.text('Bu başlık tamamlandı'), findsOneWidget);
    await tester.tap(find.text('Başlığı Gönder'));
    await tester.pumpAndSettle();

    expect(find.text('Bekleyen Görevler'), findsOneWidget);
  });
}

Future<void> _pumpUntil(
  WidgetTester tester,
  Finder finder, {
  int maxPumps = 60,
}) async {
  for (var index = 0; index < maxPumps; index += 1) {
    await tester.pump(const Duration(milliseconds: 100));
    if (finder.evaluate().isNotEmpty) {
      return;
    }
  }
  final visibleTexts = tester
      .widgetList<Text>(find.byType(Text))
      .map((widget) => widget.data ?? widget.textSpan?.toPlainText() ?? '')
      .where((text) => text.isNotEmpty)
      .join(' | ');
  fail('Beklenen widget bulunamadi: $finder. Gorunen metinler: $visibleTexts');
}

Future<void> _waitForAsyncWork(WidgetTester tester) async {
  await tester.runAsync(
    () => Future<void>.delayed(const Duration(milliseconds: 500)),
  );
  await tester.pump();
}

Widget _app() {
  return MaterialApp(
    home: ReportEntryScreen(
      key: UniqueKey(),
      workOrderId: 'wo-2026-0001',
    ),
    onGenerateRoute: (settings) {
      if (settings.name == AppRoutes.finalReportPreview) {
        return MaterialPageRoute<void>(
          builder: (_) => FinalReportPreviewScreen(
            workOrderId: settings.arguments as String,
          ),
        );
      }
      if (settings.name == AppRoutes.technicianTasks) {
        return MaterialPageRoute<void>(
          builder: (_) => const Scaffold(body: Text('Bekleyen Görevler')),
        );
      }
      return null;
    },
  );
}
