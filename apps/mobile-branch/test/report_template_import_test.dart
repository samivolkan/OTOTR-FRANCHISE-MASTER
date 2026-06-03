import 'package:flutter_test/flutter_test.dart';
import 'package:ototr_branch_app/data/models/report_template_model.dart';
import 'package:ototr_branch_app/data/services/report_template_asset_loader.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  test('JSON rapor sablonu asset uzerinden dinamik yuklenir', () async {
    const loader = ReportTemplateAssetLoader();

    final template = await loader.load();

    expect(template.sourceReportId, '2614045');
    expect(template.groups.length, 12);
    expect(template.totalItems, 265);
    expect(
      template.groups.any((group) => group.code == 'MOTOR_CHECKUP'),
      isTrue,
    );
  });

  test('Rapor maddeleri secenek ve input alanlarini tasir', () async {
    final template = await const ReportTemplateAssetLoader().load();
    final optionItem = template.allItems.firstWhere(
      (item) => item.options.isNotEmpty,
    );
    final inputItem = template.allItems.firstWhere(
      (item) => item.inputFields.isNotEmpty,
    );

    expect(optionItem.hasOptions, isTrue);
    expect(optionItem.options.first.scoreType, isA<ReportOptionScoreType>());
    expect(inputItem.hasInputs, isTrue);
    expect(inputItem.inputFields.first.id, isNotEmpty);
  });

  test('Rapor maddeleri zorunlu kanit sayisini tasir', () async {
    final template = await const ReportTemplateAssetLoader().load();
    final requiredMediaItem = template.allItems.firstWhere(
      (item) => item.requiredImageCount > 0,
    );

    expect(requiredMediaItem.hasImages, isTrue);
    expect(requiredMediaItem.requiredImageCount, greaterThan(0));
  });

  test('Kaporta katalog grubu panel ve mikron verisini tasir', () async {
    final template = await const ReportTemplateAssetLoader().load();
    final bodyPaintGroup = template.groups.firstWhere(
      (group) => group.code == 'BODY_PAINT_CHECKUP',
    );
    final micronItems = bodyPaintGroup.items.where(
      (item) => item.inputFields.any(
        (input) => input.label.toLowerCase().contains('mikron'),
      ),
    );

    expect(bodyPaintGroup.items, hasLength(59));
    expect(micronItems, isNotEmpty);
    expect(
      bodyPaintGroup.items.any(
        (item) => item.options.any((option) => option.label == 'Boyalı'),
      ),
      isTrue,
    );
  });

  test('Motor katalog grubu secenek ve olcum verisini tasir', () async {
    final template = await const ReportTemplateAssetLoader().load();
    final motorGroup = template.groups.firstWhere(
      (group) => group.code == 'MOTOR_CHECKUP',
    );
    final motorOptions = motorGroup.items.fold<int>(
      0,
      (sum, item) => sum + item.options.length,
    );
    final motorInputItems = motorGroup.items.where(
      (item) => item.inputFields.isNotEmpty,
    );

    expect(motorGroup.items, hasLength(37));
    expect(motorOptions, 138);
    expect(motorInputItems, hasLength(2));
    expect(
      motorGroup.items.any(
        (item) => item.options.any(
          (option) => option.scoreType == ReportOptionScoreType.negative,
        ),
      ),
      isTrue,
    );
  });

  test('Mekanik katalog grubu secenek ve fotograf slotlarini tasir', () async {
    final template = await const ReportTemplateAssetLoader().load();
    final mechanicalGroup = template.groups.firstWhere(
      (group) => group.code == 'MECHANICAL_CHECKUP',
    );
    final mechanicalOptions = mechanicalGroup.items.fold<int>(
      0,
      (sum, item) => sum + item.options.length,
    );

    expect(mechanicalGroup.items, hasLength(40));
    expect(mechanicalOptions, 179);
    expect(mechanicalGroup.items.every((item) => item.hasImages), isTrue);
    expect(
      mechanicalGroup.items.every((item) => item.requiredImageCount == 0),
      isTrue,
    );
    expect(
      mechanicalGroup.items.any(
        (item) => item.options.any(
          (option) => option.scoreType == ReportOptionScoreType.negative,
        ),
      ),
      isTrue,
    );
  });

  test('OBD ve Airbag katalog gruplari kritik kanit alanlarini tasir',
      () async {
    final template = await const ReportTemplateAssetLoader().load();
    final obdGroup = template.groups.firstWhere(
      (group) => group.code == 'OBD_ECU_TEST',
    );
    final airbagGroup = template.groups.firstWhere(
      (group) => group.code == 'AIRBAG_CHECK',
    );
    final obdOptions = obdGroup.items.fold<int>(
      0,
      (sum, item) => sum + item.options.length,
    );
    final airbagOptions = airbagGroup.items.fold<int>(
      0,
      (sum, item) => sum + item.options.length,
    );

    expect(obdGroup.items, hasLength(10));
    expect(obdOptions, 26);
    expect(obdGroup.items.where((item) => item.requiredImageCount > 0),
        hasLength(1));
    expect(airbagGroup.items, hasLength(9));
    expect(airbagOptions, 33);
    expect(airbagGroup.items.where((item) => item.inputFields.isNotEmpty),
        hasLength(1));
  });

  test('Fren suspansiyon ve dyno yol testleri katalog verisini tasir',
      () async {
    final template = await const ReportTemplateAssetLoader().load();
    final brakeGroup = template.groups.firstWhere(
      (group) => group.code == 'BRAKE_SUSPENSION_TEST',
    );
    final dynoGroup = template.groups.firstWhere(
      (group) => group.code == 'DYNO_ROAD_TEST',
    );
    final brakeOptions = brakeGroup.items.fold<int>(
      0,
      (sum, item) => sum + item.options.length,
    );
    final dynoOptions = dynoGroup.items.fold<int>(
      0,
      (sum, item) => sum + item.options.length,
    );

    expect(brakeGroup.items, hasLength(9));
    expect(brakeOptions, 23);
    expect(brakeGroup.items.every((item) => item.hasImages), isTrue);
    expect(dynoGroup.items, hasLength(5));
    expect(dynoOptions, 12);
    expect(dynoGroup.items.where((item) => item.inputFields.isNotEmpty),
        hasLength(1));
    expect(dynoGroup.items.where((item) => item.requiredImageCount > 0),
        hasLength(1));
  });
}
