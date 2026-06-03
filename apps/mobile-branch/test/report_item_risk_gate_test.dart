import 'package:flutter_test/flutter_test.dart';
import 'package:ototr_branch_app/data/models/report_template_model.dart';
import 'package:ototr_branch_app/data/models/user_profile_model.dart';
import 'package:ototr_branch_app/data/repositories/report_template_repository.dart';
import 'package:ototr_branch_app/data/repositories/work_order_report_repository.dart';
import 'package:ototr_branch_app/data/services/work_order_report_service.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() {
    LocalWorkOrderReportRepository.instance.reset();
  });

  test('Riskli kaporta secimi not ve fotograf olmadan tamamlanamaz', () async {
    final templateRepository = AssetReportTemplateRepository();
    final service = WorkOrderReportService(
      templateRepository: templateRepository,
      reportRepository: LocalWorkOrderReportRepository.instance,
    );
    final template = await templateRepository.getActiveTemplate();
    final group = template.groups.firstWhere(isBodyPaintReportGroup);
    final item = group.items.firstWhere(
      (item) =>
          item.inputFields.isEmpty &&
          item.options.any(
            (option) => option.scoreType == ReportOptionScoreType.negative,
          ),
    );
    final option = item.options.firstWhere(
      (option) => option.scoreType == ReportOptionScoreType.negative,
    );

    await expectLater(
      service.saveItemAnswer(
        workOrderId: 'wo-2026-0001',
        template: template,
        group: group,
        item: item,
        user: _user,
        selectedOptionIds: [option.id],
        inputValues: const {},
        description: '',
        imageUrls: const [],
        complete: true,
      ),
      throwsA(isA<StateError>()),
    );

    await expectLater(
      service.saveItemAnswer(
        workOrderId: 'wo-2026-0001',
        template: template,
        group: group,
        item: item,
        user: _user,
        selectedOptionIds: [option.id],
        inputValues: const {},
        description: 'Sol kisimda riskli boya tespit edildi.',
        imageUrls: const [],
        complete: true,
      ),
      throwsA(isA<StateError>()),
    );

    final answer = await service.saveItemAnswer(
      workOrderId: 'wo-2026-0001',
      template: template,
      group: group,
      item: item,
      user: _user,
      selectedOptionIds: [option.id],
      inputValues: const {},
      description: 'Sol kisimda riskli boya tespit edildi.',
      imageUrls: const ['work-orders/wo-2026-0001/body-paint/photo-1.jpg'],
      complete: true,
    );

    expect(answer.isCompleted, isTrue);
  });

  test('Riskli motor secimi not olmadan sadece taslak kalir', () async {
    final templateRepository = AssetReportTemplateRepository();
    final reportRepository = LocalWorkOrderReportRepository.instance;
    final service = WorkOrderReportService(
      templateRepository: templateRepository,
      reportRepository: reportRepository,
    );
    final template = await templateRepository.getActiveTemplate();
    final group = template.groups.firstWhere(isMotorReportGroup);
    final item = group.items.firstWhere(
      (item) =>
          item.inputFields.isEmpty &&
          item.options.any(
            (option) => option.scoreType == ReportOptionScoreType.negative,
          ),
    );
    final option = item.options.firstWhere(
      (option) => option.scoreType == ReportOptionScoreType.negative,
    );

    await expectLater(
      service.saveItemAnswer(
        workOrderId: 'wo-2026-0001',
        template: template,
        group: group,
        item: item,
        user: _user,
        selectedOptionIds: [option.id],
        inputValues: const {},
        description: '',
        imageUrls: const [],
        complete: true,
      ),
      throwsA(isA<StateError>()),
    );

    final draft = await service.saveItemAnswer(
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

    expect(draft.isCompleted, isFalse);
    expect(draft.selectedOptionIds, contains(option.id));
  });

  test('Riskli mekanik secimi not ve fotograf olmadan tamamlanamaz', () async {
    final templateRepository = AssetReportTemplateRepository();
    final service = WorkOrderReportService(
      templateRepository: templateRepository,
      reportRepository: LocalWorkOrderReportRepository.instance,
    );
    final template = await templateRepository.getActiveTemplate();
    final group = template.groups.firstWhere(isMechanicalReportGroup);
    final item = group.items.firstWhere(
      (item) =>
          item.options.any(
            (option) => option.scoreType == ReportOptionScoreType.negative,
          ) &&
          item.hasImages,
    );
    final option = item.options.firstWhere(
      (option) => option.scoreType == ReportOptionScoreType.negative,
    );

    await expectLater(
      service.saveItemAnswer(
        workOrderId: 'wo-2026-0001',
        template: template,
        group: group,
        item: item,
        user: _user,
        selectedOptionIds: [option.id],
        inputValues: const {},
        description: '',
        imageUrls: const [],
        complete: true,
      ),
      throwsA(isA<StateError>()),
    );

    final answer = await service.saveItemAnswer(
      workOrderId: 'wo-2026-0001',
      template: template,
      group: group,
      item: item,
      user: _user,
      selectedOptionIds: [option.id],
      inputValues: const {},
      description: 'Alt takimda riskli mekanik bulgu mevcut.',
      imageUrls: const ['work-orders/wo-2026-0001/mechanical/photo-1.jpg'],
      complete: true,
    );

    expect(answer.isCompleted, isTrue);
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
