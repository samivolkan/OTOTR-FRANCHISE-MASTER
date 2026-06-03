import 'package:flutter_test/flutter_test.dart';
import 'package:ototr_branch_app/data/models/user_profile_model.dart';
import 'package:ototr_branch_app/data/repositories/report_template_repository.dart';
import 'package:ototr_branch_app/data/repositories/work_order_report_repository.dart';
import 'package:ototr_branch_app/data/services/work_order_report_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    LocalWorkOrderReportRepository.instance.reset();
  });

  test('Kaporta hizli durum secimi mikronlu paneli taslak kaydeder', () async {
    final templateRepository = AssetReportTemplateRepository();
    final reportRepository = LocalWorkOrderReportRepository.instance;
    final service = WorkOrderReportService(
      templateRepository: templateRepository,
      reportRepository: reportRepository,
    );
    final template = await templateRepository.getActiveTemplate();
    final group = template.groups.firstWhere(isBodyPaintReportGroup);
    final item = group.items.firstWhere(
      (item) => item.inputFields.any(reportInputIsMicron),
    );
    final option =
        item.options.firstWhere((option) => option.label == 'Boyalı');

    await service.saveItemAnswer(
      workOrderId: 'wo-2026-0001',
      template: template,
      group: group,
      item: item,
      user: _user,
      selectedOptionIds: [option.id],
      inputValues: const {},
      description: '',
      imageUrls: const [],
      complete: false,
    );

    final answer = await reportRepository.getItemAnswer(
      'wo-2026-0001',
      item.id,
    );
    expect(answer, isNotNull);
    expect(answer!.selectedOptionLabels, contains('Boyalı'));
    expect(answer.isCompleted, isFalse);
  });

  test('Kaporta hizli durum secimi kanit zorunlu paneli taslak kaydeder',
      () async {
    final templateRepository = AssetReportTemplateRepository();
    final reportRepository = LocalWorkOrderReportRepository.instance;
    final service = WorkOrderReportService(
      templateRepository: templateRepository,
      reportRepository: reportRepository,
    );
    final template = await templateRepository.getActiveTemplate();
    final group = template.groups.firstWhere(isBodyPaintReportGroup);
    final item = group.items.firstWhere(
      (item) => item.requiredImageCount > 0 && item.options.isNotEmpty,
    );
    final option = item.options.first;

    await service.saveItemAnswer(
      workOrderId: 'wo-2026-0001',
      template: template,
      group: group,
      item: item,
      user: _user,
      selectedOptionIds: [option.id],
      inputValues: const {},
      description: '',
      imageUrls: const [],
      complete: false,
    );

    final answer = await reportRepository.getItemAnswer(
      'wo-2026-0001',
      item.id,
    );
    expect(answer, isNotNull);
    expect(answer!.selectedOptionIds, contains(option.id));
    expect(answer.isCompleted, isFalse);
  });
}

const _user = UserProfile(
  id: 'tech-ahmet',
  fullName: 'Ahmet Usta',
  email: 'ahmet.usta@ototr.test',
  phone: '0555 000 16 16',
  role: UserRole.inspectionTechnician,
  branchId: 'bursa-nilufer',
  isActive: true,
);
